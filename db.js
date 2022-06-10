const { Sequelize } = require("sequelize");

const dialectOptions =
	process.env.MODE === "local"
		? {}
		: {
				ssl: {
					require: true,
					rejectUnauthorized: false,
				},
		  };

module.exports = new Sequelize(process.env.DB_DBATABASE, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
	host: process.env.DB_HOSTNAME,
	port: process.env.DB_PORT,
	dialect: "postgres",
	dialectOptions,
});
