const express = require('express');
const router = express.Router();
const userController = require('../controller/userController')
const productController = require('../controller/productController')


router.post('/register',userController.createUser)
router.post('/login',userController.login)

router.post("/products", productController.createProducts);

module.exports = router;