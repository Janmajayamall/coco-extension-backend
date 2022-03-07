const mongoose = require("mongoose");
const Post = require("./post");
const UrlCache = require("./urlCache");

const connectDb = () => {
	let options = {};
	// if (process.env.NODE_ENV === "production") {
	// 	options = {
	// 		ssl: true,
	// 		sslValidate: true,
	// 		sslCA: `${__dirname}/rds-combined-ca-bundle.pem`,
	// 		replicaSet: "rs0",
	// 		readPreference: "secondaryPreferred",
	// 		retryWrites: false,
	// 	};
	// }
	return mongoose.connect(process.env.DB_URI, options);
};

const models = { Post, UrlCache };

module.exports = {
	connectDb,
	models,
};
