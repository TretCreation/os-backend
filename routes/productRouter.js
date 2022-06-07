const Router = require("express");
const productController = require("../controllers/productController");
const router = new Router();

router.post("/", productController.create);
router.get("/", productController.getAll);
router.get("/:id", productController.getOne);
router.patch("/:id", productController.update);
router.delete("/:id", productController.delete);
router.delete("/productInfo/:id", productController.deleteInfo);

module.exports = router;
