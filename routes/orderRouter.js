const Router = require("express");
const orderController = require("../controllers/orderController");
const router = new Router();

router.post("/", orderController.create);
router.get("/:id", orderController.getOne);
router.post("/:id", orderController.complete);

module.exports = router;
