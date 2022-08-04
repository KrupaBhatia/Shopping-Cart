const express = require('express');
const router = express.Router();
const userController = require('../controller/userController')
const productController = require('../controller/productController')
const cartController = require('../controller/cartController')
const orderController = require('../controller/orderController')
const mid = require('../auth/auth')


router.post('/register',userController.createUser)
router.post('/login',userController.login)
router.get('/user/:userId/profile',mid.authmid,userController.getUserByParam)
router.put('/user/:userId/profile',mid.authmid,mid.Authorization,userController.updateUser)



router.post("/products", productController.createProducts);
router.get('/products',productController.getProduct)
router.get('/products/:productId',productController.getProductbyId)
router.put('/products/:productId',productController.updateProduct)
router.delete('/products/:productId',mid.authmid,productController.deleteProductById)


router.post("/users/:userId/cart",mid.authmid,mid.Authorization,cartController.createCart);
router.get('/user/:userId/cart',mid.authmid,mid.Authorization,cartController.getCart)
router.delete('/users/:userId/cart',mid.authmid,mid.Authorization,cartController.deleteCart)


router.post("/users/:userId/orders",mid.authmid,mid.Authorization,orderController.createOrder);
router.put("/users/:userId/orders",mid.authmid,mid.Authorization,orderController.updateOrder);
module.exports = router;