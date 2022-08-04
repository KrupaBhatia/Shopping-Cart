const productModel = require('../model/productModel')
const userModel = require('../model/userModel')
const cartModel = require('../model/cartModel')
const orderModel = require('../model/orderModel')
const mongoose = require('mongoose');

const objectIdValid = function (value) {
    return mongoose.Types.ObjectId.isValid(value)
}




const createOrder = async function (req, res) {
    try{
        const userId = req.params.userId
        let data = req.body;
        let {cartId, cancellable, status} = data

        if (Object.keys(data).length == 0)
        return res.status(400).send({ status: false, message: "please provide data" });

        if(!objectIdValid(cartId)) return res.status(400).send({status: false, message: "Enter valid cart Object Id"})

        let findCart = await cartModel.findOne({_id: cartId,isDeleted:false});
        
        if(!findCart)
        return res.status(400).send({ status: false, message: "Your cart does not exist" })
        
        data["items"] = findCart.items;
        data["totalItems"] = findCart.totalItems;
        data["totalPrice"] = findCart.totalPrice;
        data["userId"] = findCart.userId;
        
        
        let totalQuantity = 0;
        for(let i=0;i<findCart.items.length;i++){
            totalQuantity += findCart.items[i].quantity
        }
        data["totalQuantity"] = totalQuantity;
        console.log(findCart)
        console.log(data.items)
        console.log(data.totalItems,"30")
        console.log(data.totalPrice,"41")
        console.log(totalQuantity,"42")

        // let findCartOfUser = await cartModel.findOne({userId : userId})

        const find=findCart.userId.toString();
        if (userId !== find)
        return res.status(404).send({ status: false, message: "cart's userId didn't match with userId", });
        
        if (status) {
            if (!["pending", "completed", "cancelled"].includes(status))
              return res.status(400).send({ status: false, message: `status includes only pending, completed, cancelled` });
          }

          let createdOrder = await orderModel.create(data)
          res.status(201).send({ satus: true, message: "Order created successfully", data: createdOrder})

    }
    catch(error){
        res.status(500).send({status: false, message: error.message})                          
    }  
}
    module.exports.createOrder = createOrder;


    const updateOrder = async function (req, res) {
        try {
            let userId = req.params.userId
            let data = req.body;
            if (!objectIdValid(userId)) {
                return res.status(400).send({ status: false, message: "Invalid userId" })}
                let alreadyDeleted = await orderModel.findOne({_id:orderId, isDeleted:false})
                if (!alreadyDeleted) return res.status(404).send({ status: false, msg: "Data not found or already deleted" })
            
                let {orderId}  = data;

            if (Object.keys(req.body).length == 0)
            return res.status(400).send({ status: false, message: "please provide data" });
               
           
            if(userId !== alreadyDeleted.userId.toString())
            return res.status(404).send({ status: false, error: "user Id does not match with orders user Id "});
            
            

    } catch (err) {
        return res.status(500).send({ status: false, error: err.message });
      }
    };
  
    module.exports.updateOrder=updateOrder