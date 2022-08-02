const productModel = require('../model/productModel')
const userModel = require('../model/userModel')
const cartModel = require('../model/cartModel')
const mongoose = require('mongoose');


const objectIdValid = function (value) {
    return mongoose.Types.ObjectId.isValid(value)
  }


  let isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0;
};
const createCart = async function(req,res){
    try{
        let userId = req.params.userId;
        if (!objectIdValid(userId)) {
            return res.status(400).send({ status: false, message: "Invalid user id" });
        }

        let findUserId = await userModel.findById({ _id: userId });
        if (!findUserId) {
            return res.status(404).send({ status: false, message: "User doesn't exists" });
        }
        // // console.log(findUserId)
        
        // if (req.userId != userId) {
        //     return res.status(401).send({ status: false, message: "You're not Authorized" })
        // }

        let cartData = req.body;
        if (!isValidRequestBody(cartData)) {
            return res.status(400).send({ status: false, message: "No data provided" });
        }

        let findCartId = await cartModel.findOne({ userId: userId });

        let { items } = cartData;

        if (items.length > 1) return res.status(400).send({ status: false, message: "only allow one product at a time" });

        let findProduct = await productModel.findOne({ _id: items[0].productId, isDeleted: false })
        if (!findProduct) return res.status(400).send({ status: false, message: "product doest not exist, give another productId" });

        if (items.length !== 0) {
            let productId = items[0].productId;
            if (!objectIdValid(productId)) {
                return res.status(400).send({ status: false, message: "Invalid productid" });
            }
            let findProductId = await productModel.findById(productId);
            if (!findProductId) {
                return res.status(404).send({ status: false, message: "product doesn't exists" });
            }
        }
        if (!findCartId) {
            if ((!items[0].quantity) || items[0].quantity == 0) items[0].quantity = 1
            if (!items) {
                let newCart = {
                    items: [],
                    totalPrice: 0,
                    totalItems: 0,
                    userId: userId,
                };
                let createCart = await cartModel.create(newCart);
                res.status(201).send({
                    status: true, message: "Empty Cart Created", data: createCart,
                });
            }
            if (items) {
                let productId = items[0].productId;
                let findProduct = await productModel.findById(productId).select({ price: 1, _id: 0 });
                let newProduct = {
                    totalPrice: items[0].quantity * findProduct.price,
                    totalItems: items.length,
                    items: items,
                    userId: userId,
                };
                let createCart = await cartModel.create(newProduct);
                res.status(201).send({
                    status: true, message: "Cart Created successfully", data: createCart,
                });
            }
        }
        if (findCartId) {
            let cartId = findCartId._id.toString();
            let productId = items[0].productId;
            if ((!items[0].quantity) || items[0].quantity == 0) items[0].quantity = 1
            let findProduct = await productModel.findById(productId).select({ price: 1, _id: 0 });
            let updateCart = await cartModel.findOneAndUpdate(
                { _id: cartId, "items.productId": productId },
                {
                    $inc: {
                        "items.$.quantity": 1,
                        totalPrice: items[0].quantity * findProduct.price,
                    },
                },
                { new: true });
                if (!updateCart) updateCart = await cartModel.findByIdAndUpdate(
                    cartId,
                    {
                        $push: { items: items },
                        $inc: {
                            totalPrice: items[0].quantity * findProduct.price,
                            totalItems: 1,
                        },
                    },
                    { new: true }
                );
    
                if (updateCart) return res.status(200).send({
                    status: true, message: "add to cart successfull", data: updateCart,
                });
    
            }
    
        } catch (error) {
            res.status(500).send({ status: false, error: error.message });
        }
    }
  

module.exports.createCart=createCart 