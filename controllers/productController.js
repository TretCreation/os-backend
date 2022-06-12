const uuid = require("uuid");
const path = require("path");
const { sequelize, Op, Product, ProductInfo, Type, Brand } = require("../models/models");
const ApiError = require("../error/ApiError");
const AWS = require("aws-sdk");

const spacesEndpoint = new AWS.Endpoint(process.env.DO_SPACES_ENDPOINT);
const s3Client = new AWS.S3({
	endpoint: spacesEndpoint,
	region: "fra1",
	credentials: {
		accessKeyId: process.env.DO_SPACES_KEY,
		secretAccessKey: process.env.DO_SPACES_SECRET,
	},
});

class ProductController {
	async create(req, res, next) {
		try {
			let { name, price, brandId, typeId, info } = req.body;
			const { img } = req.files;
			let fileName = uuid.v4() + ".jpg";

			s3Client.putObject(
				{
					Bucket: process.env.DO_SPACES_NAME,
					Key: fileName,
					Body: img.data,
					ACL: "public-read",
				},
				(err, data) => {
					if (err) return console.error(err);
					console.log("Image uploaded", data);
				}
			);

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
			const { id } = req.params;
			let { name, price, brandId, typeId, info } = req.body;

			const img = req.files?.img;
			let fileName = "";
			if (img) {
				fileName = uuid.v4() + ".jpg";

				s3Client.putObject(
					{
						Bucket: process.env.DO_SPACES_NAME,
						Key: fileName,
						Body: img.data,
						ACL: "public-read",
					},
					(err, data) => {
						if (err) return console.error(err);
						console.log("Image uploaded", data);
					}
				);
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

	async getOne(req, res, next) {
		const { id } = req.params;
		try {
			const product = await Product.findOne({
				where: { id },
				include: [{ model: ProductInfo }, { model: Type }, { model: Brand }],
			});
			return res.json(product);
		} catch (error) {
			next(ApiError.internal(error.message));
		}
	}

	async remove(req, res, next) {
		const { id } = req.params;
		try {
			const result = await Product.destroy({ where: { id } });
			console.log(result);
			return res.json(result);
		} catch (error) {
			next(ApiError.internal(error.message));
		}
	}

	async deleteInfo(req, res, next) {
		const { id } = req.params;
		try {
			const result = await ProductInfo.destroy({ where: { id } });
			return res.json(result);
		} catch (error) {
			next(ApiError.internal(error.message));
		}
	}

	async getAll(req, res, next) {
		let { brandId, typeId, limit, page, filter = "" } = req.query;
		page = page || 1;
		limit = limit || 9;
		const offset = page * limit - limit;
		const name = { [Op.like]: `%${filter}%` };

		let products;
		try {
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
		} catch (error) {
			next(ApiError.internal(error.message));
		}
	}

	async getRecommended(req, res, next) {
		const { id } = req.params;

		try {
			const result = await sequelize.query(
				`
				SELECT COUNT(op.id), op."productId"
				FROM order_products op
				INNER JOIN orders o ON (o.id = op."orderId")
				WHERE op."orderId" IN (
					SELECT "orderId" FROM order_products
					WHERE order_products."productId" = $id
				)
					AND op."productId" != $id
					AND o."status" = 'completed'
				GROUP BY op."productId"
				ORDER BY COUNT(op.id) DESC
				LIMIT 3
			`,
				{
					bind: { id },
				}
			);
			const recommendedProductIds = result[0].map((item) => item.productId);
			const recommendedProducts = await Product.findAndCountAll({ where: { id: recommendedProductIds } });
			return res.json(recommendedProducts.rows);
		} catch (error) {
			next(ApiError.internal(error.message));
		}
	}
}

module.exports = new ProductController();
