const router = require("express").Router();
const { keccak256, getUrlsMetdata } = require("./../helpers");
const { models } = require("./../models/index");

router.post("/extractMetadata", async function (req, res, next) {
	let { urls } = req.body;

	const metadataArrObj = await getUrlsMetdata(urls);

	res.status(200).send({
		success: true,
		response: {
			metadataArr: Object.values(metadataArrObj),
		},
	});
});

module.exports = router;
