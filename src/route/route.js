const express = require('express');
const router = express.Router();
const userController = require('../controller/userController')
const productController = require('../controller/productController')
const mid = require('../auth/auth')


router.post('/register',userController.createUser)
router.post('/login',userController.login)
router.get('/user/:userId/profile',mid.authmid,userController.getUserByParam)
router.put('/user/:userId/profile',mid.authmid,mid.authorization,userController.updateUser )
router.post("/products", productController.createProducts);

module.exports = router;