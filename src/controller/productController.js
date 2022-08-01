const productModel = require('../model/productModel');
// const  uploadFile = require("../aws/aws");
const  aws = require('../aws/aws.js');
const validator = require('validator')



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

let isValidObjectId = (/^[0-9a-fA-F]{24}$/);
let isValidPrice = (/^\d{0,8}(\.\d{1,4})?$/)

let isValidEnum = (enm) =>{
    var uniqueEnums = [...new Set(enm)];
    const enumList = ["S", "XS", "M", "X", "L", "XXL", "XL"];
    return enm.length === uniqueEnums.length && enm.every(e => enumList.includes(e));
}
// ////////////////////////////////////////////////////////////////

const createProducts = async (req, res) => {
    try {

        let data = req.body;

        if (!isValidRequestBody(data)) {
            return res.status(400).send({ status: false, message: "No data provided" });
        }

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

        
        // if (files && files.length > 0) {
        //     awsUrl = await aws.uploadFile(files[0]);
        //     data.productImage = awsUrl
        // }

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
            data.productImage = await aws.uploadFile(files[0]);
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
//     try {
//       let query = req.query;
  
//       if (query) {
//         let keys = Object.keys(query);
  
//         let validKeys = [
//           "priceGreaterThan",
//           "size",
//           "priceLessThan",
//           "priceSort",
//           "name"
//         ];
//         console.log(validKeys)
//         let check = true;
//         keys.map((e) => {
//           if (!validKeys.includes(e)) return (check = false);
//         });
  
//         if (!check)
//           return res.status(400).send({
//             status: false,
//             message: "Please enter valid query params",
//           });
//       }
  
//       if(query.name?.length==0)
//       return res.status(400).send({
//         status: false,
//         message: "Please enter a valid title name"
//       });
  
//       if(query.priceGreaterThan?.length==0)
//       return res.status(400).send({
//         status: false,
//         message: "Please enter priceGreaterThan value"
//       });
  
//       if(query.priceLessThan?.length==0)
//       return res.status(400).send({
//         status: false,
//         message: "Please enter priceLessThan value"
//       });
  
//       if(query.size?.length==0)
//       return res.status(400).send({
//         status: false,
//         message: "Please enter size value"
//       });
  
//       if(query.priceSort?.length==0)
//       return res.status(400).send({
//         status: false,
//         message: "Please enter priceSort value"
//       });
  
//       const product = { isDeleted: false };
  
//       if (query.size) {
//         let allowedSizes = ["S", "XS", "M", "X", "L", "XXL", "XL"];
  
//         if (!isValid(query.size))
//           return res
//             .status(400)
//             .send({ status: false, message: "Please enter a available size" });
  
//         query.size = query.size.toUpperCase();
  
//         let check = true;
//         let sizes = query.size
//           .trim()
//           .split(",")
//           .map((e) => e.trim());
  
//         sizes.map((e) => {
//           if (!allowedSizes.includes(e)) return (check = false);
//         });
//         if (!check)
//           return res.status(400).send({
//             status: false,
//             message: "Sizes can only be S, XS, M, X, L, XL, XXL",
//           });
  
//         product.availableSizes = { $in: sizes };
//       }
  
//       if (query.name) {
  
//         if(!isValid(query.name))
//         return res.status(400).send({
//           status: false,
//           message: "Please enter a valid title name",
//         });
  
//         if (!isValidTitle(query.name))
//           return res.status(400).send({
//             status: false,
//             message: "Please enter a valid title name",
//           });
//         product.title = query.name;
//       }
  
//       if (query.priceGreaterThan) {
//         if (!/^[0-9]+$/.test(query.priceGreaterThan))
//           return res.status(400).send({
//             status: false,
//             message: "Please enter a valid product price",
//           });
//         product.price = { $gt: query.priceGreaterThan };
//       }
//       if (query.priceLessThan) {
//         if (!/^[0-9]+$/.test(query.priceLessThan))
//           return res.status(400).send({
//             status: false,
//             message: "Please enter a valid product price",
//           });
//         product.price = { $lt: query.priceLessThan };
//       }
//       if (query.priceGreaterThan && query.priceLessThan)
//         product.price = { $lt: query.priceLessThan, $gt: query.priceGreaterThan };
  
//       if (query.priceSort) {
//         if (query.priceSort != "1" && query.priceSort != "-1")
//           return res.status(400).send({
//             status: false,
//             message: "Please enter priceSort value as 1 or -1",
//           });
//       }
  
//       const getProductDetails = await productModel
//         .find(product)
//         .sort({ price: query.priceSort });
  
//       if (getProductDetails.length == 0)
//         return res
//           .status(404)
//           .send({ status: false, message: "No products found" });
  
//       res.status(200).send({ status: true, message: getProductDetails });
//     } catch (err) {
//       return res.status(500).send({ status: false, message: err.message });
//     }
//   };




const getProducts = async function (req, res) {
    try {
        const inputs = req.query;

        let filterData = {}
        filterData.isDeleted = false


        if (!validator.validString(inputs.size)) {
            return res.status(400).send({ status: false, msg: "Please Provide a Valid Size!" })
        }
        if (inputs.size) {
            let sizes = inputs.size.split(",").map(x => x.trim())
            filterData['availableSizes'] = sizes
        }

        if (!validator.validString(inputs.name)) {
            return res.status(400).send({ status: false, msg: "Please Provide a Name Of the Product!" })
        }

        if (inputs.name) {
            filterData['title'] = {}
            filterData['title']['$regex'] = inputs.name //$regex to match the subString
            filterData['title']['$options'] = 'i'  //"i" for case insensitive.

        }

        if (!validator.validString(inputs.priceGreaterThan)) {
            return res.status(400).send({ status: false, msg: "Please Provide a Lowest Price Of the Product!" })
        }
        if (!validator.validString(inputs.priceLessThan)) {
            return res.status(400).send({ status: false, msg: "Please Provide a Highest Price Of the Product!" })
        }
        if (inputs.priceGreaterThan || inputs.priceLessThan) {

            filterData.price = {}

            if (inputs.priceGreaterThan) {

                if (isNaN(Number(inputs.priceGreaterThan))) {
                    return res.status(400).send({ status: false, message: `priceGreaterThan should be a valid number` })
                }
                if (inputs.priceGreaterThan <= 0) {
                    return res.status(400).send({ status: false, message: `priceGreaterThan shouldn't be 0 or-ve number` })
                }

                filterData['price']['$gte'] = Number(inputs.priceGreaterThan)

            }


            if (inputs.priceLessThan) {

                if (isNaN(Number(inputs.priceLessThan))) {
                    return res.status(400).send({ status: false, message: `priceLessThan should be a valid number` })
                }
                if (inputs.priceLessThan <= 0) {
                    return res.status(400).send({ status: false, message: `priceLessThan can't be 0 or -ve` })
                }

                filterData['price']['$lte'] = Number(inputs.priceLessThan)

            }
        }

        if (!validator.validString(inputs.priceSort)) {
            return res.status(400).send({ status: false, msg: "Please Sort 1 for Ascending -1 for Descending order!" })
        }

        if (inputs.priceSort) {

            if (!((inputs.priceSort == 1) || (inputs.priceSort == -1))) {
                return res.status(400).send({ status: false, message: `priceSort should be 1 or -1 ` })
            }

            const products = await productModel.find(filterData).sort({ price: inputs.priceSort })

            if (!products.length) {
                return res.status(404).send({ productStatus: false, message: 'No Product found' })
            }

            return res.status(200).send({ status: true, message: 'Product list', data2: products })
        }


        const products = await productModel.find(filterData)

        if (!products.length) {
            return res.status(404).send({ productStatus: false, message: 'No Product found' })
        }

        return res.status(200).send({ status: true, message: 'Product list', data: products })


    } catch (err) {
        return res.status(500).send({ status: false, error: err.message });
    }
}

  module.exports.getProducts=getProducts