const productModel = require('../model/productModel');
const  uploadFile = require('../aws/aws.js');
const ObjectId = require('mongoose').Types.ObjectId;



// ///////////////////validations\\\\\\\\\\\\\\\\\\\\\
let isValidData = function (value) {
    if (typeof value === "undefined" || value === null) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    if (typeof value === "number" && value.toString().trim().length === 0) return false
    return true;
}

let isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0;
};

let regexProduct = (/^[0-9a-fA-F]{24}$/);
let isValidPrice = (/^\d{0,8}(\.\d{1,4})?$/)

let isValidEnum = (enm) =>{
    var uniqueEnums = [...new Set(enm)];
    const enumList = ["S", "XS", "M", "X", "L", "XXL", "XL"];
    return enm.length === uniqueEnums.length && enm.every(e => enumList.includes(e));
}


const isValidReqBody = function(value){
    if(Object.keys(value).length == 0) {return false}  
    else return true;
  }

  const isValidString = function(value){
      if(!/^[A-Za-z ]+$/.test(value)) {return false}
      else return true
  }
  
  function isValidObjectId(id){
       
      if(ObjectId.isValid(id)){
          if((String)(new ObjectId(id)) === id)
              return true;       
          return false;
      }
      return false;
  }




// ////////////////////////////////////////////////////////////////

const createProducts = async (req, res) => {
    try {

        let data = req.body;

        // if (!isValidRequestBody(data)) {
        //     return res.status(400).send({ status: false, message: "No data provided" });
        // }

        let { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments } = data

        if (!isValidData(title))
            return res.status(400).send({ status: false, message: "title name is required." });

        let duplicateTitle = await productModel.findOne({ title });
        if (duplicateTitle) {
            return res.status(400).send({ status: false, msg: "title already exist" });
        }

        if (!isValidData(description))
            return res.status(400).send({ status: false, message: "description is required." });

        if (!isValidData(price))
            return res.status(400).send({ status: false, message: "price is required." });

        if (!isValidPrice.test(price))
            return res.status(400).send({ status: false, message: "not a valid number/decimal" });

        if (currencyId && currencyId !== "INR")
            return res.status(400).send({ status: false, message: "enter INR currency only" });

        if (currencyFormat && currencyFormat !== "₹")
            return res.status(400).send({ status: false, message: "enter indian currency format i.e '₹' " });

        if (!isValidData(availableSizes))
            return res.status(400).send({ status: false, message: "avilableSizes is required" })

        const availSizes = availableSizes.split(',').map(s => s.trim().toUpperCase())

        if (!isValidEnum(availSizes))
            return res.status(400).send({ status: false, message: `only allow S, XS, M, X, L, XXL, XL` })

        if (installments) {
            if (isNaN(installments)) return res.status(400).send({ status: false, message: "installments should be number only" })
        }
        // aws=========================
        let files = req.files;
        console.log(files.length,"82")
        console.log(req.body,"83")
        if (!isValidRequestBody(files)) {
            return res.status(400).send({ status: false, message: "Upload a image." });
        }
        if (files.length > 0) {
            data.productImage = await uploadFile(files[0]);
          } else {
            return res
              .status(400)
              .send({ status: false, message: "ProfileImage File is required" });
          }

        const newData = { ...data, availableSizes: availSizes };

        let createdproduct = await productModel.create(newData)
        res.status(201).send({ satus: true, message: "product create successfully", data: createdproduct })


    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
}
module.exports.createProducts=createProducts

// const getProducts = async (req, res) => {
//   try {
//     let query = req.query;

//     if (query) {
//       let keys = Object.keys(query);

//       let validKeys = [
//         "priceGreaterThan",
//         "size",
//         "priceLessThan",
//         "priceSort",
//         "name"
//       ];

//       let check = true;
//       keys.map((e) => {
//         if (!validKeys.includes(e)) return (check = false);
//       });

//       if (!check)
//         return res.status(400).send({
//           status: false,
//           message: "Please enter valid query params",
//         });
//     }

//     if(query.name?.length==0)
//     return res.status(400).send({
//       status: false,
//       message: "Please enter a valid title name"
//     });

//     if(query.priceGreaterThan?.length==0)
//     return res.status(400).send({
//       status: false,
//       message: "Please enter priceGreaterThan value"
//     });

//     if(query.priceLessThan?.length==0)
//     return res.status(400).send({
//       status: false,
//       message: "Please enter priceLessThan value"
//     });

//     if(query.size?.length==0)
//     return res.status(400).send({
//       status: false,
//       message: "Please enter size value"
//     });

//     if(query.priceSort?.length==0)
//     return res.status(400).send({
//       status: false,
//       message: "Please enter priceSort value"
//     });

//     const product = { isDeleted: false };

//     if (query.size) {
//       let allowedSizes = ["S", "XS", "M", "X", "L", "XXL", "XL"];

//       if (!isValid(query.size))
//         return res
//           .status(400)
//           .send({ status: false, message: "Please enter a available size" });

//       query.size = query.size.toUpperCase();

//       let check = true;
//       let sizes = query.size
//         .trim()
//         .split(",")
//         .map((e) => e.trim());

//       sizes.map((e) => {
//         if (!allowedSizes.includes(e)) return (check = false);
//       });
//       if (!check)
//         return res.status(400).send({
//           status: false,
//           message: "Sizes can only be S, XS, M, X, L, XL, XXL",
//         });

//       product.availableSizes = { $in: sizes };
//     }

//     if (query.name) {

//       if(!isValid(query.name))
//       return res.status(400).send({
//         status: false,
//         message: "Please enter a valid title name",
//       });

//       if (!isValidTitle(query.name))
//         return res.status(400).send({
//           status: false,
//           message: "Please enter a valid title name",
//         });
//       product.title = query.name;
//     }

//     if (query.priceGreaterThan) {
//       if (!/^[0-9]+$/.test(query.priceGreaterThan))
//         return res.status(400).send({
//           status: false,
//           message: "Please enter a valid product price",
//         });
//       product.price = { $gt: query.priceGreaterThan };
//     }
//     if (query.priceLessThan) {
//       if (!/^[0-9]+$/.test(query.priceLessThan))
//         return res.status(400).send({
//           status: false,
//           message: "Please enter a valid product price",
//         });
//       product.price = { $lt: query.priceLessThan };
//     }
//     if (query.priceGreaterThan && query.priceLessThan)
//       product.price = { $lt: query.priceLessThan, $gt: query.priceGreaterThan };

//     if (query.priceSort) {
//       if (query.priceSort != "1" && query.priceSort != "-1")
//         return res.status(400).send({
//           status: false,
//           message: "Please enter priceSort value as 1 or -1",
//         });
//     }

//     const getProductDetails = await productModel
//       .find(product)
//       .sort({ price: query.priceSort });

//     if (getProductDetails.length == 0)
//       return res
//         .status(404)
//         .send({ status: false, message: "No products found" });

//     res.status(200).send({ status: true, message: getProductDetails });
//   } catch (err) {
//     return res.status(500).send({ status: false, message: err.message });
//   }
// };
//   module.exports.getProducts=getProducts


  const getProductbyId = async function (req, res) {
    try {
        let productId = req.params.productId;
        if (!isValidObjectId(productId)) return res.status(400).send({ status: false, message: "productId is invalid" });
        let product = await productModel.findById(productId)
        if (!product) return res.status(404).send({ status: false, msg: "product does not found!!!" })

        if (product.isDeleted == true)
        return res.status(400).send({ status: false, msg: "product is already deleted" })
    
        return res.status(200).send({ status: true, msg: "Product List", data: product })
    
    } catch (err) {
        return res.status(500).send({ status: false, error: err.message });
      }
    };
 
    module.exports.getProductbyId=getProductbyId
  
  
  
  const updateProduct = async function (req, res) {
    try {
      let productId = req.params.productId;
      let data = req.body;
  
      if (!isValidObjectId(productId)) {
      return res.status(400).send({ status: false, message: "Invalid productId" })}
  
  
      let alreadyDeleted = await productModel.findOne({_id:productId, isDeleted:false})
    if (!alreadyDeleted) return res.status(404).send({ status: false, msg: "Data not found" })
  
      let { title, description, price, currencyId, currencyFormat, style, installments,isFreeShipping } = data
  
      if (!isValidReqBody(data)) { return res.status(400).send({ status: false, msg: "Please enter data for update" }) }
      if (title)
        if (!isValidString(title)) return res.status(400).send({ status: false, message: "title  must be alphabetic characters" })
      let isTitlePresent = await productModel.findOne({ title })
      if (isTitlePresent) return res.status(400).send({ status: false, message: "title is already present" })
  
      if (description)
  
        if (!isValidString(description)) return res.status(400).send({ status: false, message: "description  must be alphabetic characters" })
  
      if (price)
        if (!/^[0-9 .]+$/.test(price)) return res.status(400).send({ status: false, message: "price must be in numeric" })
  
      if (currencyId)
        if ((["INR"].indexOf(currencyId) == -1)) return res.status(400).send({ status: false, message: "currency Id must be INR" })
  
      if (currencyFormat)
        if ((["₹"].indexOf(currencyFormat) == -1)) return res.status(400).send({ status: false, message: "currency formet must be ₹ " })
  
      if (style)
        if (!isValidString(style)) return res.status(400).send({ status: false, message: "style must be alphabetic characters" })

        if(isFreeShipping){
            if(!typeof(isFreeShipping)== Boolean){
                return res.status(400).send({ status: false, message: "isFreeShipping must be  Boolean" })
            }
        }

      
      
       if (data.availableSizes){
      
        let sizes = data.availableSizes.split(/[\s,]+/)
          let arr = ["S", "XS", "M", "X", "L", "XXL", "XL"]
          console.log(sizes)
          for (let i = 0; i < sizes.length; i++) {
              if (arr.indexOf(sizes[i]) == -1)
                  return res.status(400).send({ status: false, message: "availabe sizes must be (S, XS,M,X, L,XXL, XL)" })
          }
         data["availableSizes"]= sizes
        }
  
      if (installments)
        if (!/^[0-9 ]+$/.test(installments)) return res.status(400).send({ status: false, message: "installments must be in numeric" })
  
      let files = req.files;
      if (files && files.length > 0) {
        let fileUrl = await uploadFile(files[0]);
        data.productImage = fileUrl;
      }
  
      let updatedData = await productModel.findOneAndUpdate({ _id: productId },data,{new: true});
      return res.status(200).send({status: true,message: "product details updated", data: updatedData,});
    } catch (err) {
      return res.status(500).send({ status: false, error: err.message });
    }
  };

  module.exports.updateProduct=updateProduct

  

  const deleteProductById = async (req, res) => {
    try {

        let productId = req.params.productId;

        if (!regexProduct.test(productId)) {
            return res.status(400).send({ status: false, message: "Invalid product id" })
        }

        let existProductId = await productModel.findById({ _id: productId })
        if (!existProductId) {
            return res.status(404).send({ status: false, message: "Product Id dosen't exists." });
        }

        if (existProductId.isDeleted === true) {
            return res.status(400).send({ status: false, message: "Product already deleted." });
        }

        let deleteProduct = await productModel.findByIdAndUpdate(productId, { $set: { isDeleted: true, deletedAt: Date.now() } }, { new: true });

        res.status(200).send({ status: true, message: "Product Successfully Deleted.", data: deleteProduct })


    } catch (error) {
        res.status(500).send({ status: false, error: error.message });
    }
}
module.exports.deleteProductById=deleteProductById