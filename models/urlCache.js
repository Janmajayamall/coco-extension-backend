const mongoose = require("mongoose");

const UrlCacheSchema = new mongoose.Schema(
	{
		url: {
			type: String,
			required: true,
		},
		cache: {
			type: String,
			required: true,
		},
	},
	{
		timestamps: {},
	}
);

UrlCacheSchema.statics.findByFilter = function (filter) {
	console.log(filter, " filter received");
	return this.aggregate([
		{
			$match: filter,
		},
	]);
};

UrlCacheSchema.statics.findOneAndUpdate = function (url, cache) {
	return this.findOneAndUpdate(filter, updates, {
		new: true,
		upsert: true,
	});
};

const UrlCache = mongoose.model("UrlCache", UrlCacheSchema);

module.exports = UrlCache;
