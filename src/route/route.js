const express = require('express');
const router = express.Router();
const userController = require('../controller/userController')
const productController = require('../controller/productController')
const mid = require('../auth/auth')


router.post('/register',userController.createUser)
router.post('/login',userController.login)
router.get('/user/:userId/profile',mid.authmid,userController.getUserByParam)
router.put('/user/:userId/profile',mid.authmid,userController.updateUser)



router.post("/products", productController.createProducts);
// router.get('/products',productController.getProducts)
router.get('/products/:productId',productController.getProductbyId)
router.put('/products/:productId',productController.updateProduct)
router.delete('/products/:productId',productController.deleteProductById)

module.exports = router;