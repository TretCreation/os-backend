const uuid = require("uuid");
const path = require("path");
const { Op, Order, OrderProduct } = require("../models/models");
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
			const { id } = req.params;
			let { name, price, brandId, typeId, info } = req.body;

			const img = req.files?.img;
			let fileName = "";
			if (img) {
				fileName = uuid.v4() + ".jpg";
				img.mv(path.resolve(__dirname, "..", "static", fileName));
				// TODO: remove old images
			}

			const result = await Product.update(
				{ name, price, brandId, typeId, info, ...(img && { img: fileName }) },
				{
					where: { id },
				}
			);

			if (info) {
				info = JSON.parse(info);
				info.forEach((i) => {
					if (i.id.toString().slice(0, 3) === "id_") {
						return ProductInfo.create({
							title: i.title,
							description: i.description,
							productId: id,
						});
					}
					return ProductInfo.update(
						{
							title: i.title,
							description: i.description,
						},
						{
							where: { id: i.id },
						}
					);
				});
			}

			return res.json(result);
		} catch (error) {
			next(ApiError.internal(error.message));
		}
	}

	async getOne(req, res) {
		const { id } = req.params;
		const product = await Product.findOne({
			where: { id },
			include: [
				{ model: ProductInfo, as: "info" },
				{ model: Type, as: "type" },
				{ model: Brand, as: "brand" },
			],
		});
		return res.json(product);
	}

	async deleteOrderProduct(req, res) {
		const { id } = req.params;
		const result = await ProductInfo.destroy({ where: { id } });
		return res.json(result);
	}
}

module.exports = new OrderController();
