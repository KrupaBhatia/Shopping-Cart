const userModel = require('../model/userModel');
const bcrypt = require ('bcryptjs');
const jwt = require('jsonwebtoken');
// const bodyParser = require('body-parser');
const validator = require('validator');
const  {AwsService} = require("../aws/aws");

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

const saltRounds = 10;
const createUser = async function (req, res) {
    try {
        
        const file = req.files
        console.log(req.body,"29")
        if (Object.keys(req.body).length == 0)
        return res.status(400).send({ status: false, message: "please provide data" });

        let {  lname,fname, phone, email, password, address,profileImage } = req.body

       

        if (!valid(lname)) return res.status(400).send({ status: false, message: "Please give name" })
        // if (!alphaOnly(lname)) return res.status(400).send({ status: false, message: "In lname use only alphabets.." })
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
        password = await bcrypt.hash(password, saltRounds);
        
        
        // if (address) {
        //     if (typeof (address) != "object") return res.status(400).send({ status: false, message: "address should be in object format" })
        //     if (address.shipping) {
        //         if (typeof (address.shipping) != "object") return res.status(400).send({ status: false, message: "shipping should be in object format" })
        //         if (!/^[a-zA-Z0-9\/\-\, ]*$/.test(address.shipping["street"])) return res.status(400).send({ status: false, message: "No speacial characters are required" })
        //         if (!alphaOnly(address.shipping["city"])) return res.status(400).send({ status: false, message: "In city use only alphabets.." })
        //         if (address.shipping["pincode"]) {
        //             let regexPin = /^[0-9]{6}$/
        //             if (!regexPin.test(address.shipping["pincode"])) return res.status(400).send({ status: false, message: "In pincode use only 6 digits.." })
        //         }
        //     }
        //     if (billing) {
        //         if (typeof (address.billing) != "object") return res.status(400).send({ status: false, message: "billing should be in object format" })
        //         if (!/^[a-zA-Z0-9\/\-\, ]*$/.test(address.billing["street"])) return res.status(400).send({ status: false, message: "No speacial characters are required" })
        //         if (!alphaOnly(address.billing["city"])) return res.status(400).send({ status: false, message: "In city use only alphabets.." })
        //         if (address.billing["pincode"]) {
        //             let regexPin = /^[0-9]{6}$/
        //             if (!regexPin.test(address.billing["pincode"])) return res.status(400).send({ status: false, message: "In pincode use only 6 digits.." })
        //         }
        //     }
        // }
        let hash = bcrypt.hashSync(password, saltRounds);

        if (file && file.length > 0) {
            if (file[0].mimetype.indexOf('image') == -1) {
                return res.status(400).send({ status: false, message: 'Only image files are allowed !' })
            }
            const profile_url = await AwsService.uploadFile(file[0]);
            profileImage = profile_url;
        }
        else {
            return res.status(400).send({ status: false, message: 'Profile Image is required !' })
        }

        let userData = await userModel.create(req.body)
        return res.status(201).send({ status: true, message: 'Success', data: userData })

    } catch (err) { return res.status(500).send({ status: false, message: err.message }) }

}
module.exports.createUser = createUser




const login = async function (req, res) {

    try {

        const loginDetails = req.body;

        const { email, password } = loginDetails;

        if (!validator.isValidRequestBody(loginDetails)) {
            return res.status(400).send({ status: false, message: 'Please provide login details' })
        }

        if (!validator.isValid(email)) {
            return res.status(400).send({ status: false, message: 'Email-Id is required' })
        }


        if (!validator.isValid(password)) {
            return res.status(400).send({ status: false, message: 'Password is required' })
        }

        const userData = await userModel.findOne({ email });

        if (!userData) {
            return res.status(401).send({ status: false, message: `Login failed!! Email-Id is incorrect!` });
        }

        const checkPassword = await bcrypt.compare(password, userData.password)

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

module.exports.login=login;

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
