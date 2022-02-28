const router = require("express").Router();
const { keccak256 } = require("./../helpers");
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

router.post("/findUrlsInfo", async function (req, res) {
	const { urls } = req.body;

	const posts = await models.Post.find({
		url: urls,
	});

	// response
	let finalRes = [];

	// mark urls not found with status not found
	urls.forEach((u) => {
		const post = posts.find((p) => p.url == u);

		if (post != undefined) {
			finalRes.push({
				...post._doc,
				qStatus: constants.QUERY_STATUS.FOUND,
			});
		} else {
			finalRes.push({
				url: u,
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
