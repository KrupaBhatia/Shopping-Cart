const userModel = require('../model/userModel');
const bcrypt = require ('bcrypt');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const  aws = require('../aws/aws.js');

const alphaOnly = function (value) {
    let regexaAlpha =/^[A-z]*$|^[A-z]+\s[A-z]*$/
    return regexaAlpha.test(value)
}
const validEmail=function(value){
    let regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    return regexEmail.test(value)
}


  const valid = function (value) {
    if (typeof (value) === 'undefined' || value === null) return false
    if (typeof (value) === "string" && value.trim().length == 0) return false
    return true
  }


const createUser = async function (req, res) {
    try {
        const data = req.body
        const files = req.files
        if (Object.keys(data).length == 0)
        return res.status(400).send({ status: false, message: "please provide data" });

        let {  lname,fname, phone, email, password, address,profileImage } = data

       

        if (!valid(lname)) return res.status(400).send({ status: false, message: "Please give name" })
        if (!alphaOnly(lname)) return res.status(400).send({ status: false, message: "In lname use only alphabets.." })
        if (!valid(fname)) return res.status(400).send({ status: false, message: "Please give name" })
        if (!alphaOnly(fname)) return res.status(400).send({ status: false, message: "In fname use only alphabets.." })

        if (!valid(phone)) return res.status(400).send({ status: false, message: "Please give phone no." })
        let regexPhone = /^(?:(?:\+|0{0,2})91(\s*|[\-])?|[0]?)?([6789]\d{2}([ -]?)\d{3}([ -]?)\d{4})$/
        if (!regexPhone.test(phone)) return res.status(400).send({ status: false, message: "Please give phone no. in proper format" })
        let existPhone = await userModel.find({ phone: phone })
        if (existPhone.length != 0) return res.status(400).send({ status: false, message: `${phone} is already exist` })

        if (!valid(email)) return res.status(400).send({ status: false, message: "Please give email" })
        if (!validEmail(email)) return res.status(400).send({ status: false, message: "Please give email in proper format" })
        let existEmail = await userModel.find({ email: email })
        if (existEmail.length != 0) return res.status(200).send({ status: false, message: `${email} is already exist` })

        
        if (!valid(password)) return res.status(400).send({ status: false, message: "Please give password" })
        let regexPassword = /^.{8,15}$/
        if (!regexPassword.test(password)) return res.status(400).send({ status: false, message: "In password use minimum 8 and maximum 15 character" })
        
        
        if (Object.keys(data).includes(profileImage)) {
            return res
              .status(400)
              .send({ status: false, message: "ProfileImage is required" });
          }
        
        //----------[Address Validation]
        if(!address) return res.status(400).send({status: false, message : 'Please enter address'})
        let Fulladdress = JSON.parse(address)
        let{shipping, billing} = Fulladdress

        if(!shipping) return res.status(400).send({status : false, message : 'Please enter shipping address'})
        if (!Fulladdress.shipping.street) return res.status(400).send({ status: false, message: "Please enter shipping street" })

        if (!Fulladdress.shipping.city) return res.status(400).send({ status: false, message: "Please enter shipping city" })
        if (!alphaOnly(Fulladdress.shipping.city)) return res.status(400).send({ status: false, message: "Enter a valid city name in shipping" })

        if (!Fulladdress.shipping.pincode) return res.status(400).send({ status: false, message: "Please enter shipping pincode" })
        if (!(/^[1-9]{1}[0-9]{5}$/).test(Fulladdress.shipping.pincode)) return res.status(400).send({ status: false, message: "invalid Pincode in shipping" })

        if(!billing) return res.status(400).send({status : false, message : 'Please enter billing address'})
        if (!Fulladdress.billing.street) return res.status(400).send({ status: false, message: "Please enter billing street" })

        if (!Fulladdress.billing.city) return res.status(400).send({ status: false, message: "Please enter billing city" })
        if (!alphaOnly(Fulladdress.billing.city)) return res.status(400).send({ status: false, message: "Enter a valid city name in shipping" })
        
        if (!Fulladdress.billing.pincode) return res.status(400).send({ status: false, message: "Please enter billing pincode" })
        if (!(/^[1-9]{1}[0-9]{5}$/).test(Fulladdress.billing.pincode)) return res.status(400).send({ status: false, message: "invalid Pincode in billing" })

        data.address = Fulladdress
        const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(password, salt);
    req.body.password = hashedPass;
        

        if (files.length > 0) {
            data.profileImage = await aws.uploadFile(files[0]);
          } else {
            return res
              .status(400)
              .send({ status: false, message: "ProfileImage File is required" });
          }

        let userData = await userModel.create(data)
        return res.status(201).send({ status: true, message: 'Success', data: userData })

    } catch (err) { return res.status(500).send({ status: false, message: err.message }) }

}
module.exports.createUser = createUser




const login = async function (req, res) {
    try {

        if (Object.keys(req.body).length == 0)
        return res.status(400).send({ status: false, message: "please provide data" });

        let { email, password } = req.body;
        
      
        if(!valid(email))return  res.status(400).send({ status: false,message: "please enter email" })
        if(!validEmail(email))return  res.status(400).send({ status: false,message: "please enter email in proper format" })


        if (!valid(password)) {
            return res.status(400).send({ status: false, message: 'Password is required' })
        }

        const userData = await userModel.findOne({ email });
        console.log(userData,"148")
        if (!userData) {
            return res.status(401).send({ status: false, message: `Login failed!! Email-Id is incorrect!` });
        }
        hashed=userData.password
        console.log(password,hashed)
        let checkPassword = await bcrypt.compare(hashed,password)
          console.log(checkPassword,"154")

        if (!checkPassword) return res.status(401).send({ status: false, message: `Login failed!! password is incorrect.` });

        let userId=userData._id
        const token = jwt.sign({
            userId: userId,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60
        }, 'Project5')

        return res.status(200).send({ status: true, message: "LogIn Successful!!", data: {userId:userId,Token:token} });

    } catch (err) {

        return res.status(500).send({ status: false, error: err.message });

    }
}
// const loginUser = async function (req, res) {
//   try {
//     let { email, password } = req.body;

//     if (Object.keys(req.body).length == 0) {
//       return res.status(400).send({ status: false, messege: "please enter data in request body" });
//     }

//     if (!email)
//       return res.status(400).send({ status: false, messege: "please enter email" });


//     if (!password)
//       return res.status(400).send({ status: false, messege: "please enter password " });


//     let userData = await userModel.findOne({ email: email });
//     if (!userData) {
//       return res.status(404).send({ status: false, messege: "no data found " });
//     }
//     console.log(password,userData.password,"194")

//     let checkPassword = await bcrypt.compare(password, userData.password);

//     console.log(checkPassword,"196")
//     if (!checkPassword)
//       return res.status(400).send({ status: false, messege: "Login failed!! password is incorrect." });
//       let userId=userData._id

//         const token = jwt.sign({
//             userId: userId,
//             iat: Math.floor(Date.now() / 1000),
//             exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60
//         }, 'Project5')

//         return res.status(200).send({ status: true, message: "LogIn Successful!!", data: {userId:userId,Token:token} });

//     } catch (err) {

//         return res.status(500).send({ status: false, error: err.message });

//     }
// }

    

module.exports.login=loginUser;



const objectIdValid = function (value) {
    return mongoose.Types.ObjectId.isValid(value)
  }
const getUserByParam = async function (req, res) {
    try {
      let userId = req.params.userId;
      if (!objectIdValid(userId)) return res.status(400).send({ status: false, message: "user is invalid" });
      let user = await userModel.findById(userId)
      if (!user) return res.status(404).send({ status: false, msg: "user does not found!!!" })
  
      
        
      return res.status(200).send({status: true, message: "User record found",data: user});
  

    }
    catch (err) {
      return res.status(500).send({ status: false, message: err.message })
    }
  }

  module.exports.getUserByParam = getUserByParam


const updateUser =  async function (req, res) {
    try {
  
      let userId = req.params.userId;
  
      let data = req.body
      if (!dataExist(data)) return res.status(400).send({ status: false, message: "please provide data that you want to be update.." })

      if (!valid(lname)) return res.status(400).send({ status: false, message: "Please give name" })
        if (!alphaOnly(lname)) return res.status(400).send({ status: false, message: "In lname use only alphabets.." })
        if (!valid(fname)) return res.status(400).send({ status: false, message: "Please give name" })
        if (!alphaOnly(fname)) return res.status(400).send({ status: false, message: "In fname use only alphabets.." })

        if (!valid(phone)) return res.status(400).send({ status: false, message: "Please give phone no." })
        let regexPhone = /^(?:(?:\+|0{0,2})91(\s*|[\-])?|[0]?)?([6789]\d{2}([ -]?)\d{3}([ -]?)\d{4})$/
        if (!regexPhone.test(phone)) return res.status(400).send({ status: false, message: "Please give phone no. in proper format" })
        let existPhone = await userModel.find({ phone: phone })
        if (existPhone.length != 0) return res.status(400).send({ status: false, message: `${phone} is already exist` })

        if (!valid(email)) return res.status(400).send({ status: false, message: "Please give email" })
        if (!validEmail(email)) return res.status(400).send({ status: false, message: "Please give email in proper format" })
        let existEmail = await userModel.find({ email: email })
        if (existEmail.length != 0) return res.status(200).send({ status: false, message: `${email} is already exist` })

        if (address) {
            if (typeof (address) != "object") return res.status(400).send({ status: false, message: "address should be in object format" })
            if (address.shipping) {
                if (typeof (address.shipping) != "object") return res.status(400).send({ status: false, message: "shipping should be in object format" })
                if (!/^[a-zA-Z0-9\/\-\, ]*$/.test(address.shipping["street"])) return res.status(400).send({ status: false, message: "No speacial characters are required" })
                if (!alphaOnly(address.shipping["city"])) return res.status(400).send({ status: false, message: "In city use only alphabets.." })
                if (address.shipping["pincode"]) {
                    let regexPin = /^[0-9]{6}$/
                    if (!regexPin.test(address.shipping["pincode"])) return res.status(400).send({ status: false, message: "In pincode use only 6 digits.." })
                }
            }
            if (billing) {
                if (typeof (address.billing) != "object") return res.status(400).send({ status: false, message: "billing should be in object format" })
                if (!/^[a-zA-Z0-9\/\-\, ]*$/.test(address.billing["street"])) return res.status(400).send({ status: false, message: "No speacial characters are required" })
                if (!alphaOnly(address.billing["city"])) return res.status(400).send({ status: false, message: "In city use only alphabets.." })
                if (address.billing["pincode"]) {
                    let regexPin = /^[0-9]{6}$/
                    if (!regexPin.test(address.billing["pincode"])) return res.status(400).send({ status: false, message: "In pincode use only 6 digits.." })
                }
            }
        }
        let result = await userModel.findOneAndUpdate({ _id: userId }, {
           fname:fname,
           lname:lname,
           email:email,
           phone:phone,
        //    address:{Shipping{street,city}}

          }, { new: true })
      
          return res.status(200).send({ status: true, message: "Success", data: result })
        }

    
    catch (err) {
      return res.status(500).send({ status: false, message: err.message });
    }
  
  }
  module.exports.updateUser = updateUser