const productModel = require('../model/productModel')
const userModel = require('../model/userModel')
const cartModel = require('../model/cartModel')
const mongoose = require('mongoose');


const objectIdValid = function (value) {
    return mongoose.Types.ObjectId.isValid(value)
}



const createCart = async function (req, res) {
    try{
        
        const { quantity, productId } = req.body;
        const userId = req.params.userId

        if (Object.keys(req.body).length == 0)
        return res.status(400).send({ status: false, message: "please provide data" });

        if(!objectIdValid(productId)) return res.status(400).send({status: false, message: "Enter valid Product Object Id"})
       
        if (quantity<1) {
          return res.status(400).send({ status: false, message: "Please provide valid quantity & it must be greater than zero." })
      }

        let findProduct = await productModel.findOne({_id: productId,isDeleted:false});

        if(!findProduct) return res.status(404).send({status: false, message: "Product Id not found"})

        let findCartOfUser = await cartModel.findOne({userId : userId})

        if (!findCartOfUser) {

          //destructuring for the response body.
          var cartData = {
              userId: userId,
              items: [{
                  productId: productId,
                  quantity: quantity,
              }],
              totalPrice: findProduct.price * quantity,
              totalItems: 1
          }

          const createCart = await cartModel.create(cartData)
          return res.status(201).send({ status: true, message: `Cart created successfully`, data: createCart })
        }


          if (findCartOfUser) {

            //updating price when products get added or removed.
            let price = findCartOfUser.totalPrice + (quantity * findProduct.price)
            let itemsArr = findCartOfUser.items

            //updating quantity.
            for (i in itemsArr) {
                if (itemsArr[i].productId.toString() === productId) {
                    itemsArr[i].quantity += Number(quantity)

                    let updatedCart = { items: itemsArr, totalPrice: price, totalItems: itemsArr.length }

                    let responseData = await cartModel.findOneAndUpdate({ _id: findCartOfUser._id }, updatedCart, { new: true })

                    return res.status(200).send({ status: true, message: `Product added successfully`, data: responseData })
                }
            }
            itemsArr.push({ productId: productId, quantity: quantity }) //storing the updated prices and quantity to the newly created array.

            let updatedCart = { items: itemsArr, totalPrice: price, totalItems: itemsArr.length }
            let responseData = await cartModel.findOneAndUpdate({ _id: findCartOfUser._id }, updatedCart, { new: true })

            return res.status(200).send({ status: true, message: `Product added successfully`, data: responseData })
        }

   }catch(error){
       res.status(500).send({status: false, message: error.message})                          
   }  
       
}

module.exports.createCart = createCart



 