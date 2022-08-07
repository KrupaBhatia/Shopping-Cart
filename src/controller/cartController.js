const productModel = require("../model/productModel");
const userModel = require("../model/userModel");
const cartModel = require("../model/cartModel");
const mongoose = require("mongoose");

const objectIdValid = function (value) {
  return mongoose.Types.ObjectId.isValid(value);
};

const createCart = async function (req, res) {
  try {
    const { quantity, productId } = req.body;
    const userId = req.params.userId;

    if (Object.keys(req.body).length == 0)
      return res
        .status(400)
        .send({ status: false, message: "please provide data" });

    if (!objectIdValid(productId))
      return res
        .status(400)
        .send({ status: false, message: "Enter valid Product Object Id" });

    if (quantity < 1) {
      return res
        .status(400)
        .send({
          status: false,
          message:
            "Please provide valid quantity & it must be greater than zero.",
        });
    }

    let findProduct = await productModel.findOne({
      _id: productId,
      isDeleted: false,
    });

    if (!findProduct)
      return res
        .status(404)
        .send({ status: false, message: "Product Id not found" });

    let findCartOfUser = await cartModel.findOne({ userId: userId });

    if (!findCartOfUser) {
      //destructuring for the response body.
      var cartData = {
        userId: userId,
        items: [
          {
            productId: productId,
            quantity: quantity,
          },
        ],
        totalPrice: findProduct.price * quantity,
        totalItems: 1,
      };

      const createCart = await cartModel.create(cartData);
      return res
        .status(201)
        .send({
          status: true,
          message: `Cart created successfully`,
          data: createCart,
        });
    }

    if (findCartOfUser) {
      //updating price when products get added or removed.
      let price = findCartOfUser.totalPrice + quantity * findProduct.price;
      let itemsArr = findCartOfUser.items;

      //updating quantity.
      for (i in itemsArr) {
        if (itemsArr[i].productId.toString() === productId) {
          itemsArr[i].quantity += Number(quantity);

          let updatedCart = {
            items: itemsArr,
            totalPrice: price,
            totalItems: itemsArr.length,
          };

          let responseData = await cartModel.findOneAndUpdate(
            { _id: findCartOfUser._id },
            updatedCart,
            { new: true }
          );

          return res
            .status(200)
            .send({
              status: true,
              message: `Product added successfully`,
              data: responseData,
            });
        }
      }
      itemsArr.push({ productId: productId, quantity: quantity }); //storing the updated prices and quantity to the newly created array.

      let updatedCart = {
        items: itemsArr,
        totalPrice: price,
        totalItems: itemsArr.length,
      };
      let responseData = await cartModel.findOneAndUpdate(
        { _id: findCartOfUser._id },
        updatedCart,
        { new: true }
      );

      return res
        .status(200)
        .send({
          status: true,
          message: `Product added successfully`,
          data: responseData,
        });
    }
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

module.exports.createCart = createCart;

const getCart = async function (req, res) {
  try {
    let userId = req.params.userId;

    let cartDetails = await cartModel
      .findOne({ userId: userId })
      .populate("items.productId");

    if (!cartDetails)
      return res.status(404).send({ status: false, message: "Cart not found" });

    return res
      .status(200)
      .send({
        status: true,
        message: "Cart details with Product details",
        data: cartDetails,
      });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

module.exports.getCart = getCart;

const deleteCart = async (req, res) => {
  try {
    let userId = req.params.userId;

    const cartDetails = await cartModel.findOne({ userId: userId });
    if (!cartDetails)
      return res
        .status(400)
        .send({ status: false, message: "Cart not found !" });

    await cartModel.findOneAndUpdate(
      { userId: userId },
      { totalItems: 0, totalPrice: 0, items: [] }
    );

    return res
      .status(204)
      .send({ status: true, message: "Delete cart success" });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

module.exports.deleteCart = deleteCart;

const updateCart = async (req, res) => {
  try {
    let paramsUserId = req.params.userId;
    const data = req.body;

    if (Object.keys(req.body).length == 0)
      return res
        .status(400)
        .send({ status: false, message: "please provide data" });

    let { productId, cartId, removeProduct } = data;

    if (!cartId) {
      return res
        .status(400)
        .send({ status: false, message: "cartId be must present..." });
    }
    if (!objectIdValid(cartId)) {
      return res
        .status(400)
        .send({ status: false, message: "Enter valid User CartId in params" });
    }

    if (!productId) {
      return res
        .status(400)
        .send({ status: false, message: "productId must be present..." });
    }
    if (!objectIdValid(productId)) {
      return res
        .status(400)
        .send({
          status: false,
          message: "Enter valid Product ObjectId in request body",
        });
    }
    if (!removeProduct && removeProduct != 0) {
      return res
        .status(400)
        .send({
          status: false,
          message: "removeProduct key must be present...",
        });
    }
    if (!(removeProduct == "1" || removeProduct == "0")) {
      return res
        .status(400)
        .send({
          status: false,
          message: "removeProduct must be either 0 or 1",
        });
    }

    const cartDetails = await cartModel.findById({ _id: cartId });

    if (!cartDetails) {
      return res
        .status(404)
        .send({ status: false, message: "cartId does'nt exist" });
    }

    const productDetails = await productModel.findOne({
      _id: productId,
      isDeleted: false,
    });

    if (!productDetails) {
      return res
        .status(404)
        .send({ status: false, message: "productId doesn't exist" });
    }

    const productIdInCart = await cartModel.findOne({
      userId: paramsUserId,
      "items.productId": productId,
    });
    console.log(paramsUserId);
    console.log("item");
    console.log(productIdInCart, "180");
    if (!productIdInCart) {
      return res
        .status(404)
        .send({
          status: false,
          message: "productId does'nt exist in this cart",
        });
    }

    let { items } = cartDetails;
    let getPrice = productDetails.price;

    for (let i = 0; i < items.length; i++) {
      if (items[i].productId == productId) {
        let totelProductprice = items[i].quantity * getPrice;

        if (
          removeProduct == 0 ||
          (items[i].quantity == 1 && removeProduct == 1)
        ) {
          const removeCart = await cartModel.findOneAndUpdate(
            { userId: paramsUserId },
            {
              $pull: { items: { productId: productId } },
              $inc: {
                totalPrice: -totelProductprice,
                totalItems: -1,
              },
            },
            { new: true }
          );

          return res
            .status(200)
            .send({
              status: true,
              message: "sucessfully removed product from cart",
              data: removeCart,
            });
        }

        const product = await cartModel.findOneAndUpdate(
          { "items.productId": productId, userId: paramsUserId },
          { $inc: { "items.$.quantity": -1, totalPrice: -getPrice } },
          { new: true }
        );
        return res
          .status(200)
          .send({
            status: true,
            message: "sucessfully decrease one quantity of product",
            data: product,
          });
      }
    }
  } catch (error) {
    return res.status(500).send({ status: false, error: error.message });
  }
};

module.exports.updateCart = updateCart;
