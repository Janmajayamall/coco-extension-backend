const router = require("express").Router();
const { keccak256, getUrlsMetadata } = require("./../helpers");
const { queryMarketsByMarketIdentifiers } = require("./../graphql");
const { models } = require("./../models/index");
const constants = require("../utils/constants");

router.post("/new", async function (req, res, next) {
	let { creatorAddress, url, groupAddress, marketSignature, marketData } =
		req.body;
	groupAddress = groupAddress.toLowerCase();
	creatorAddress = creatorAddress.toLowerCase();

	// calculate & verify marketIdentifier
	const marketIdentifier = keccak256(url);
	if (marketIdentifier != JSON.parse(marketData).marketIdentifier) {
		next("MarketIdentifier should be keccack(url)");
		return;
	}

	const post = await models.Post.findPostAndUpdate(
		{
			url,
		},
		{
			creatorAddress,
			marketIdentifier,
			groupAddress,
			marketSignature,
			marketData,
		}
	);

	res.status(200).send({
		success: true,
		response: {
			post,
		},
	});
});

function originalUrl(metadata) {
	return metadata.ogUrl ? metadata.ogUrl : metadata.requestUrl;
}

router.post("/findUrlsInfo", async function (req, res) {
	const { urls } = req.body;

	// get urls metadata
	const urlsMetadata = await getUrlsMetadata(urls);

	// get urls from metadata
	// so that shortened or
	// redirected urls are mapped to
	// final ones.
	let fixedUrls = urlsMetadata.map((data) => originalUrl(data));

	// query posts from backend
	const posts = await models.Post.find({
		url: fixedUrls,
	});

	// query markets using marketIdentifiers
	const markets = await queryMarketsByMarketIdentifiers(
		fixedUrls.map((url) => keccak256(url))
	);

	// response
	let finalRes = urlsMetadata.map((data) => {
		let url = originalUrl(data);

		const post = posts.find((p) => p.url == url);

		if (post != undefined) {
			// find market of post if it exists on chain
			const market = markets.find(
				(m) => m.marketIdentifier == post.marketIdentifier
			);
			return {
				url: url,
				requestUrl: data.requestUrl,
				metadata: data,
				post: post._doc,
				onChainData: market
					? {
							...market,
							existsOnChain: true,
					  }
					: {
							existsOnChain: false,
							outcome: 1, // outcome == 1 because the link hasn't received any challenge
					  },
				qStatus: constants.QUERY_STATUS.FOUND,
			};
		} else {
			return {
				url: url,
				requestUrl: data.requestUrl,
				metadata: data,
				qStatus: constants.QUERY_STATUS.NOT_FOUND,
			};
		}
	});

	res.status(200).send({
		success: true,
		response: {
			urlsInfo: finalRes,
		},
	});
});

router.post("/find", async function (req, res) {
	const { filter, sort } = req.body;

	const posts = await models.Post.findPostsByFilter(filter, sort);

	// get post urls metadata
	const urlsMetadata = await getUrlsMetadata(posts.map((p) => p.url));

	// finalRes
	const finalRes = [];
	posts.forEach((post, index) => {
		finalRes.push({
			post: post,
			metadata: urlsMetadata[index],
		});
	});

	res.status(200).send({
		success: true,
		response: {
			posts: finalRes,
		},
	});
});

module.exports = router;
