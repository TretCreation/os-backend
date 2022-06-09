const Router = require("express");
const orderController = require("../controllers/orderController");
const router = new Router();

router.post("/", orderController.create);
router.get("/:id", orderController.getOne);
router.patch("/:id", orderController.update);
router.delete("/orderProduct/:id", orderController.deleteOrderProduct);

module.exports = router;
