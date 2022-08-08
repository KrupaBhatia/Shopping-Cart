const userModel = require('../model/userModel');
const bcrypt = require ('bcrypt');
const jwt = require('jsonwebtoken');
const uploadFile = require('../aws/aws')
const mongoose = require('mongoose');


// -------------------------validation-------------------------------------------


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
  
  const isValidString = function(value){
      if(!/^[A-Za-z ]+$/.test(value)) {return false}
      else return true
  }
  
  
  const isValidPhone = function(value){
      if( /^\d{10}$/.test(value)) {return true}
      else return false
  }
  
  
  const isValidPassword = function(value){
      if(/^.{8,15}$/.test(value)==true) {return true}
      else return false
  }

  const objectIdValid = function (value) {
    return mongoose.Types.ObjectId.isValid(value)
  }

  // ------------------------------create user------------------------------------------------


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
        
        if(!address) return res.status(400).send({status: false, message : 'Please enter address'})
        let Fulladdress = JSON.parse(address)  //converting jsdon string into JS object 
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
        const hashedPass = await bcrypt.hash(password, salt); //hashing the password by using salt 
        req.body.password = hashedPass; //setting hashed pass in data to send it in res
        

        if (files.length > 0) {
            data.profileImage = await uploadFile(files[0]); //uploading file to aws s3
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



// ----------------------------------login user-------------------------------------------- 


const login = async function (req, res) {
  try {
    let { email, password } = req.body;

    if (Object.keys(req.body).length == 0) {
      return res.status(400).send({ status: false, messege: "please enter data in request body" });
    }

    if (!email)
      return res.status(400).send({ status: false, messege: "please enter email" });


    if (!password)
      return res.status(400).send({ status: false, messege: "please enter password " });


    let userData = await userModel.findOne({ email: email });
    if (!userData) {
      return res.status(404).send({ status: false, messege: "no data found " });
    }
    console.log(password,userData.password,"194")

    let checkPassword = await bcrypt.compare(password, userData.password); //decrypting hashed pass to compare/verify with original one

    console.log(checkPassword,"196")
    if (!checkPassword)
      return res.status(400).send({ status: false, messege: "Login failed!! password is incorrect." });
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

    

module.exports.login=login;


// -----------------------------------------get user by userId----------------------------------------

const getUserByParam = async function (req, res) {
    try {
      let userId = req.params.userId;
      let validUserId = req.tokenData.userId
      if (!objectIdValid(userId)) return res.status(400).send({ status: false, message: "user is invalid" });
      if (userId != validUserId) return res.status(400).send({ status: false, message: "please enter existing user" })
      let user = await userModel.findById(userId)
      if (!user) return res.status(404).send({ status: false, msg: "user does not found!!!" })

      return res.status(200).send({status: true, message: "User record found",data: user});
      }
    catch (err) {
      return res.status(500).send({ status: false, message: err.message })
    }
  }

  module.exports.getUserByParam = getUserByParam

 
  // ------------------------------------update user------------------------------------------


  const updateUser = async function (req, res) {
    try {
        let user = req.params.userId
        let data = req.body
        let update= {}
  
        let { fname, lname, email, phone, password, address } = data
       
        let files = req.files 
        if (!(data && files))
        return res.status(400).send({ status: false, message: "Please provide user data for updation" })
       
        if (files && files.length > 0) {
            let uploadedFileURL = await uploadFile(files[0])
            update["profileImage"] = uploadedFileURL
        }
      
        // if (!isValidReqBody(data)) { return res.status(400).send({ status: false, msg: "Please provide user data for updation" }) }     
       
        if(fname)
        if (!isValidString(fname)) return res.status(400).send({ status: false, message: "First name  must be alphabetic characters" })
        update["fname"]= fname
        if(lname)
        if (!isValidString(lname)) return res.status(400).send({ status: false, message: "Invalid last name name : Should contain alphabetic characters only" });
         update["lname"]=lname
       if(email)
        if (!validEmail(email)) { return res.status(400).send({ status: false, message: "Invalid email address" }) };
         const isEmailUsed = await userModel.findOne({ email: email });
        if (isEmailUsed) return res.status(400).send({ status: false, message: "email is already used, try different one" });
        update["email"]=email
        if(phone)
        if (!isValidPhone(phone)) return res.status(400).send({ status: false, message: "Invalid phone number : must contain 10 digit and only number." });
        const isPhoneUsed = await userModel.findOne({ phone: phone });
        if (isPhoneUsed) return res.status(400).send({ status: false, message: "phone is already used, try different one" });
        update["phone"]=phone
        if(password){ //check the password are given or not
        if (!isValidPassword(password)) return res.status(400).send({ status: false, message: "Invalid password (length : 8-16) : Abcd@123456"});      
        let encryptedPassword = bcrypt //convert to the password in bc
        .hash(password, saltRounds)
        .then((hash) => {
          console.log(`Hash: ${hash}`);
          return hash;
        });
  
        update["password"]= await encryptedPassword;
        }
  
        if (address) {
            add = JSON.parse(address);
           
            const { shipping, billing } = add
            if(shipping){
                let {street,city,pincode} =shipping
            if(street){
                if(!isValidString(street))return res.status(400).send({ status: false, message: "Shipping street   must be alphabetic characters" })
            update["address.shipping.street"]=street}
            if(city){
                if(!isValidString(city))return res.status(400).send({ status: false, message: "Shipping city must be alphabetic characters" })  
                update["address.shipping.city"]=city
            }
            if(pincode){
                if(!/^[0-9]{6}$/.test(pincode)) return res.status(400).send({ status: false, message: "Shipping pincode must be number min length 6"})
                update["address.shipping.pincode"]=pincode
            }}
            if(billing){
                let {street,city,pincode} = billing
                if(street){
                    if(!isValidString(street))return res.status(400).send({ status: false, message: "Billing street   must be alphabetic characters" })
                update["address.billing.street"]=street
                }
                if(city){
                    if(!isValidString(city))return res.status(400).send({ status: false, message: "Billing city must be alphabetic characters" })  
                    update["address.billing.city"]=city
                }
                if(pincode){
                    if(!/^[0-9]{6}$/.test(pincode)) return res.status(400).send({ status: false, message: "Billing pincode must be number min length 6" })
                    update["address.billing.phone"]=pincode
                } 
            }
        }
        let updatedData = await userModel.findOneAndUpdate({ _id: user }, {$set:update}, { new: true })
        return res.status(200).send({ status: true, message: "User profile updated", data: updatedData })
  
    }
    catch (err) {
        res.status(500).send({ err: err.message })
    }
  }
  module.exports.updateUser = updateUser