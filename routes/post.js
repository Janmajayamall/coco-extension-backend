const router = require("express").Router();
const { keccak256, getUrlsMetdataObj } = require("./../helpers");
const { queryMarketsByMarketIdentifiers } = require("./../graphql");
const { models } = require("./../models/index");
const constants = require("../utils/constants");

router.post("/new", async function (req, res, next) {
	let {
		creatorAddress,
		url,
		urlMetadata,
		groupAddress,
		marketSignature,
		marketData,
	} = req.body;
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
			urlMetadata,
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

router.post("/findUrlsInfoT", async function (req, res) {
	const { urlObjects } = req.body;

	console.log(urlObjects, " jkl");

	// get the urls
	const urls = urlObjects.map((obj) => obj.url);

	// query posts from backend
	const posts = await models.Post.find({
		url: urls,
	});

	// query markets using marketIdentifiers
	const markets = await queryMarketsByMarketIdentifiers(
		urls.map((url) => keccak256(url))
	);

	// response
	let finalRes = [];

	// prepare final res
	// 1. If url isn't found in posts then mark qStatus=NOT_FOUND, otherwise=FOUND
	// 2. Prepare onChainData for posts that have market onchain
	urlObjects.forEach((obj) => {
		const post = posts.find((p) => p.url == obj.url);

		if (post != undefined) {
			// find market of post if it exists on chain
			const market = markets.find(
				(m) => m.marketIdentifier == post.marketIdentifier
			);
			finalRes.push({
				...obj,
				...post._doc,
				qStatus: constants.QUERY_STATUS.FOUND,
				onChainData: market
					? {
							...market,
							existsOnChain: true,
					  }
					: {
							existsOnChain: false,
					  },
			});
		} else {
			finalRes.push({
				...obj,
				qStatus: constants.QUERY_STATUS.NOT_FOUND,
			});
		}
	});

	console.log(finalRes, " this is final res ");

	res.status(200).send({
		success: true,
		response: {
			posts: finalRes,
		},
	});
});

// remove this later
router.post("/findUrlsInfo", async function (req, res) {
	const { urls } = req.body;

	// query posts from backend
	const posts = await models.Post.find({
		url: urls,
	});

	// query markets using marketIdentifiers
	const markets = await queryMarketsByMarketIdentifiers(
		urls.map((url) => keccak256(url))
	);

	// get urls metadata
	const urlsMetadataObj = await getUrlsMetdataObj(urls);

	// response
	let finalRes = [];

	// prepare final res
	// 1. If url isn't found in posts then mark qStatus=NOT_FOUND, otherwise=FOUND
	// 2. Prepare onChainData for posts that have market onchain
	urls.forEach((u) => {
		const post = posts.find((p) => p.url == u);
		const metadata = urlsMetadataObj[u];

		if (post != undefined) {
			// find market of post if it exists on chain
			const market = markets.find(
				(m) => m.marketIdentifier == post.marketIdentifier
			);
			finalRes.push({
				url: u,
				metdata: metadata,
				post: post._doc,
				onChainData: market
					? {
							...market,
							existsOnChain: true,
					  }
					: {
							existsOnChain: false,
					  },
				qStatus: constants.QUERY_STATUS.FOUND,
			});
		} else {
			finalRes.push({
				url: u,
				metdata: metadata,
				qStatus: constants.QUERY_STATUS.NOT_FOUND,
			});
		}
	});

	res.status(200).send({
		success: true,
		response: {
			posts: finalRes,
		},
	});
});

router.post("/find", async function (req, res) {
	const { filter, sort } = req.body;

	const posts = await models.Post.findPostsByFilter(filter, sort);

	res.status(200).send({
		success: true,
		response: {
			posts: posts,
		},
	});
});

module.exports = router;
