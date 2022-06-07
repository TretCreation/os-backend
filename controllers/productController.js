const uuid = require("uuid");
const path = require("path");
const { Op, Product, ProductInfo, Type, Brand } = require("../models/models");
const ApiError = require("../error/ApiError");

class ProductController {
	async create(req, res, next) {
		try {
			let { name, price, brandId, typeId, info } = req.body;
			const { img } = req.files;
			let fileName = uuid.v4() + ".jpg";
			img.mv(path.resolve(__dirname, "..", "static", fileName));

			const product = await Product.create({ name, price, brandId, typeId, img: fileName });

			if (info) {
				info = JSON.parse(info);
				info.forEach((i) =>
					ProductInfo.create({
						title: i.title,
						description: i.description,
						productId: product.id,
					})
				);
			}

			return res.json(product);
		} catch (error) {
			next(ApiError.internal(error.message));
		}
	}

	async update(req, res, next) {
		try {
			let { id, name, price, brandId, typeId, info } = req.body;

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

	async getAll(req, res) {
		let { brandId, typeId, limit, page, filter = "" } = req.query;
		page = page || 1;
		limit = limit || 9;
		const offset = page * limit - limit;
		const name = { [Op.like]: `%${filter}%` };

		let products;
		if (!brandId && !typeId) {
			products = await Product.findAndCountAll({ where: { name }, limit, offset });
		}
		if (brandId && !typeId) {
			products = await Product.findAndCountAll({ where: { name, brandId }, limit, offset });
		}
		if (!brandId && typeId) {
			products = await Product.findAndCountAll({ where: { name, typeId } });
		}
		if (brandId && typeId) {
			products = await Product.findAndCountAll({ where: { name, brandId, typeId } });
		}
		return res.json(products);
	}
}

module.exports = new ProductController();
