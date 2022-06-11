const Router = require("express");
const orderController = require("../controllers/orderController");
const router = new Router();

router.post("/", orderController.create);
router.get("/:id", orderController.getOne);
router.patch("/:id", orderController.update);

module.exports = router;
