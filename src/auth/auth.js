const mongoose = require('mongoose');
const jwt = require("jsonwebtoken");
const userModel = require('../model/userModel');

const objectIdValid = function (value) {
    return mongoose.Types.ObjectId.isValid(value)
  }
   

    const valid = function (value) {
      if (typeof (value) === 'undefined' || value === null) return false
      if (typeof (value) === "string" && value.trim().length == 0) return false
      return true
    }
    
    const authmid= (req, res, next) => {
      try{
          let token = req.headers.authorization
          if(!valid(token)) return res.status(401).send({ status: false, Message: " The token must be required in 'Bearer'" })
          // split and get the token only 
          token = token.split(' ')[1] // get the 1 index value
          jwt.verify(token,'Project5',function(err,decode){
              if(err){ 
                  return res.status(401).send({ status: false, Message: err.message })
              }else{
                  req.tokenData = decode;
                  next()
              }
          })
      }catch(err){
          res.status(500).send({ status: false, Message: err.message })
      }
  }
module.exports.authmid = authmid;
    


const Authorization = async function (req, res, next) {
  try {
    let token = req.headers.authorization
    if(!valid(token)) return res.status(401).send({ status: false, Message: " The token must be required in 'Bearer'" })
    // split and get the token only 
    token = token.split(' ')[1] // get the 1 index value
    jwt.verify(token,'Project5',async function(err,decode){
        if(err){ 
            return res.status(401).send({ status: false, Message: err.message })
        }else{
            req.tokenData = decode;
            // next()
            console.log(decode)
        }
        const userId = req.params.userId
        // check the user id present in body
        if(!valid(userId)) return res.status(400).send({status: false,message: "userId is Required"});
        
        if(!objectIdValid(userId))  return res.status(400).send({status: false,message: "userId is not valid"});
        //check the  user id are present in decoded token
        let User = await userModel.findById(userId)
        if (!User) return res.status(404).send({ status: false, msg: "User not exist" })

        if (userId != decode.userId) { return res.status(401).send({status:false,msg:"Not Authorised!!"})}
  
      next()
      })
        
    }
  catch (err) {
      return res.status(500).send({ status:false,msg: err.message });
  }
}
module.exports.Authorization = Authorization;
      
    