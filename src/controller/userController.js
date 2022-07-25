const userModel = require('../model/userModel');
const bcrypt = require ('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator')


const alphaOnly = function (value) {
    let regexaAlpha =/^[A-z]*$|^[A-z]+\s[A-z]*$/
    return regexaAlpha.test(value)
}

const saltRounds = 10; 
const createUser= async function(req,res){
    try{
        const data =req.body
        if (Object.keys(data).length === 0) return res.status(400).send({ msg: "please provide sufficient data " })

        if(!data.fname ){
            return res.status(400).send({status:false,message:" first name is required"})
           }
       
           if(!/^[a-zA-Z]{2,}$/.test(data.fname)){
               return res.status(400).send({status:false,message:"first name is not in right format"})
           }
           if(!data.lname ){
             return res.status(400).send({status:false,message:"last name is required"})
           }
           if(!/^[a-zA-Z]{2,}$/.test(data.lname)){
              return res.status(400).send({status:false,message:" last name is not in right format "})
           }
           if(!data.email){
             return res.status(400).send({status:false,message:" email is required"})
           }
           if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(data.email)) {
             return res.status(400).send({status: false,message: "invalid emailId"});
           }

        if (!data.phone) return res.status(400).send({ status: false, message: "Please give phone no." })
        let regexPhone = /^(?:(?:\+|0{0,2})91(\s*|[\-])?|[0]?)?([6789]\d{2}([ -]?)\d{3}([ -]?)\d{4})$/
        if (!regexPhone.test(data.phone)) return res.status(400).send({ status: false, message: "Please give phone no. in proper format" })
        let existPhone = await userModel.find({ phone:data.phone })
        if (existPhone.length != 0) return res.status(400).send({ status: false, message: `${data.phone} is already exist` })
       
        if(!data.password)
            return res.status(400).send({ status: false, message: "Please give password" })
            let regexPassword = /^.{8,15}$/
            if (!regexPassword.test(data.password)) return res.status(400).send({ status: false, message: "In password use minimum 8 and maximum 15 character" })
            console.log(data.password,"46")
            // hashing password
            data.password = await bcrypt.hash(data.password, saltRounds);
            console.log(data.password,"49")



        if (data.address) {
        if(typeof(data.address)!="object")return res.status(400).send({ status: false, message: "address should be in object format" })
            if(data.address.shipping){ 
            if(typeof(data.address.shipping)!="object")return res.status(400).send({ status: false, message: "address should be in object format" })
            if (!alphaOnly(data.address.shipping["street"])) return res.status(400).send({ status: false, message: "In street use only alphabets.." })
            if (!alphaOnly(data.address.shipping["city"])) return res.status(400).send({ status: false, message: "In city use only alphabets.." })
            if (data.address.shipping["pincode"]){
            let regexPin = /^[0-9]{6}$/
            if (!regexPin.test(data.address.shipping["pincode"])) return res.status(400).send({ status: false, message: "In pincode use only 6 digits.." })}
        }
        if(data.billing){ 
        if(typeof(data.address.billing)!="object")return res.status(400).send({ status: false, message: "address should be in object format" })
        if (!alphaOnly(data.address.billing["street"])) return res.status(400).send({ status: false, message: "In street use only alphabets.." })
        if (!alphaOnly(data.address.billing["city"])) return res.status(400).send({ status: false, message: "In city use only alphabets.." })
        if (data.address.billing["pincode"]){
        let regexPin = /^[0-9]{6}$/
        if (!regexPin.test(data.address.billing["pincode"])) return res.status(400).send({ status: false, message: "In pincode use only 6 digits.." })}
    }
}

let hash = bcrypt.hashSync(data.password, saltRounds);

        let userData = await userModel.create(req.body)
        return res.status(201).send({ status: true, message: 'Success', data: userData})
    }
    catch(error){
        return res.status(500).send({status:false,message:error.message})
    }

}
module.exports.createUser=createUser;


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