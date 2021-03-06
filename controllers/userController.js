const ApiError = require("../error/ApiError");
const bcrypt = require("bcrypt");
const { User } = require("../models/models");
const jwt = require("jsonwebtoken");
const generateJwt = (id, email, role) => {
	return jwt.sign({ id, email, role }, process.env.SECRET_KEY, { expiresIn: "24h" });
};
const admins = ["tret.main@gmail.com", "tret.creation@gmail.com", "tretvvmain@gmail.com"];

class UserController {
	async registration(req, res, next) {
		const { email, password } = req.body;
		if (!email || !password) {
			return next(ApiError.badRequest("Incorrect email or password"));
		}
		const candidate = await User.findOne({ where: { email } });
		if (candidate) {
			return next(ApiError.badRequest("User with this email already exists"));
		}
		const hashPassword = await bcrypt.hash(password, 5); //salt is 5
		const role = admins.findIndex((item) => item === email) === -1 ? "" : "ADMIN";
		try {
			const user = await User.create({ email, role, password: hashPassword });
			const token = generateJwt(user.id, user.email, user.role);
			return res.json({ token });
		} catch (error) {
			next(ApiError.internal(error.message));
		}
	}

	async login(req, res, next) {
		const { email, password } = req.body;
		const user = await User.findOne({ where: { email } });
		if (!user) {
			return next(ApiError.internal("User is not found"));
		}
		let comparePassword = bcrypt.compareSync(password, user.password);
		if (!comparePassword) {
			return next(ApiError.internal("Password is incorrect."));
		}
		const token = generateJwt(user.id, user.email, user.role);
		return res.json({ token });
	}

	async check(req, res) {
		const token = generateJwt(req.user.id, req.user.email, req.user.role);
		return res.json({ token });
	}
}

module.exports = new UserController();
