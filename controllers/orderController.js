const uuid = require("uuid");
const path = require("path");
const { Op, Order, OrderProduct, Product } = require("../models/models");
const ApiError = require("../error/ApiError");

class OrderController {
	async create(req, res, next) {
		try {
			let { userId, cartData } = req.body;
			console.log(userId, cartData);
			const order = await Order.create({ userId });

			if (cartData) {
				cartData = JSON.parse(cartData);
				cartData.forEach(({ productId, count }) =>
					OrderProduct.create({
						orderId: order.id,
						productId,
						count,
					})
				);
			}

			return res.json(order);
		} catch (error) {
			next(ApiError.internal(error.message));
		}
	}

	async update(req, res, next) {
		try {
		} catch (error) {
			next(ApiError.internal(error.message));
		}
	}

	async getOne(req, res, next) {
		try {
			const { id } = req.params;
			const order = await Order.findOne({
				where: { id },
				include: [{ model: OrderProduct, include: [Product] }],
			});
			return res.json(order);
		} catch (error) {
			next(ApiError.internal(error.message));
		}
	}
}

module.exports = new OrderController();
