const sequelize = require("../db");
const { Op, DataTypes } = require("sequelize");

const Brand = sequelize.define("brand", {
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true,
		allowNull: false,
	},
	name: {
		type: DataTypes.STRING(255),
		unique: true,
		allowNull: false,
	},
});

const OrderProduct = sequelize.define("order_product", {
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true,
		allowNull: false,
	},
	orderId: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	productId: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	count: {
		type: DataTypes.INTEGER,
		defaultValue: 1,
		allowNull: false,
	},
});

const Order = sequelize.define("order", {
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true,
		allowNull: false,
	},
	userId: {
		type: DataTypes.INTEGER,
	},
	status: {
		type: DataTypes.ENUM("pending", "completed", "canceled"),
		defaultValue: "pending",
		allowNull: false,
	},
	transactionId: {
		type: DataTypes.STRING(50),
	},
	paymentAmount: {
		type: DataTypes.DECIMAL(),
	},
	paidAt: {
		type: DataTypes.DATE,
	},
});

const ProductInfo = sequelize.define("product_info", {
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true,
		allowNull: false,
	},
	title: {
		type: DataTypes.STRING(255),
		allowNull: false,
	},
	description: {
		type: DataTypes.STRING(255),
		allowNull: false,
	},
	productId: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
});

const Product = sequelize.define("product", {
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true,
		allowNull: false,
	},
	name: {
		type: DataTypes.STRING(255),
		unique: true,
		allowNull: false,
	},
	price: {
		type: DataTypes.DECIMAL(),
		allowNull: false,
	},
	img: {
		type: DataTypes.STRING(255),
		allowNull: false,
	},
	typeId: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	brandId: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
});

const Type = sequelize.define("type", {
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true,
		allowNull: false,
	},
	name: {
		type: DataTypes.STRING(255),
		unique: true,
		allowNull: false,
	},
});

const User = sequelize.define("user", {
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true,
		allowNull: false,
	},
	email: {
		type: DataTypes.STRING(255),
		unique: true,
		allowNull: false,
	},
	password: {
		type: DataTypes.STRING(255),
		allowNull: false,
	},
	role: {
		type: DataTypes.STRING(20),
		defaultValue: "",
		allowNull: false,
	},
});
User.hasMany(Order);

Product.belongsTo(Type);
Product.belongsTo(Brand);
Product.hasMany(ProductInfo, { onDelete: "cascade" });
ProductInfo.belongsTo(Product);
Brand.hasMany(Product);
Type.hasMany(Product);
User.hasMany(Order, { onDelete: "restrict" });
Order.belongsTo(User);
Order.hasMany(OrderProduct, { onDelete: "restrict" });
OrderProduct.belongsTo(Order);
OrderProduct.belongsTo(Product);

module.exports = {
	sequelize,
	Op,
	User,
	Order,
	OrderProduct,
	Product,
	Type,
	Brand,
	ProductInfo,
};
