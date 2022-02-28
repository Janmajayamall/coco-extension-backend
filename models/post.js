const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
	{
		creatorAddress: {
			type: String,
			required: true,
		},
		url: {
			type: String,
			required: true,
		},
		urlMetadata: {
			type: String,
			required: true,
		},
		// marketIdentifier = keccak256(url)
		marketIdentifier: {
			type: String,
			required: true,
		},
		groupAddress: {
			type: String,
			required: true,
		},
		marketSignature: {
			type: String,
			required: true,
		},
		marketData: {
			type: String,
			required: true,
		},
	},
	{
		timestamps: {},
	}
);

PostSchema.statics.findPostsByFilter = function (filter, sort) {
	return this.aggregate([
		{
			$match: filter,
		},
		{
			$sort: sort,
		},
		{
			$lookup: {
				from: "groups",
				localField: "groupAddress",
				foreignField: "groupAddress",
				as: "group",
			},
		},
	]);
};

PostSchema.statics.findPostAndUpdate = function (filter, updates) {
	return this.findOneAndUpdate(filter, updates, {
		new: true,
		upsert: true,
	});
};

const Post = mongoose.model("Post", PostSchema);

module.exports = Post;
