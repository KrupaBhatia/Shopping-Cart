const mongoose = require('mongoose');
const jwt = require("jsonwebtoken");
const userModel = require('../model/userModel');


// const authmid = async function (req, res, next) {
//     try {
//       // =======================authmid=====================
  
//       let token = req.headers["x-api-key"];
//       if (!token) {
//         return res.status(400) .send({status: false,  msg: " please provide the token" });
//       }
//       // console.log(token);
//       let decodedToken = jwt.verify(token, "Project5");
//       console.log(decodedToken)
//       if (!decodedToken) {
//         return res.status(400).send({ status: false, msg: "token is invalid" });
        
//       }
//       req.decodedToken=decodedToken
//       next();
//     } catch (err) {
//       return res.status(500).send({ status: false, msg: err.message });
//     }};

//     module.exports.authmid = authmid;


   

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
    

// const authorization = async function (req, res, next) {
//         try {
//           let token = req.headers["x-api-key"];
      
//           let decodedToken = jwt.verify(token, "Project5");
      
//           let userId = req.params.userId;
//           if (!objectIdValid(userId)) return res.status(400).send({ status: false, message: "userId is invalid" });
//           let avail = await userModel.findOne({ _id: userId})
//           if (!avail) return res.status(404).send({ status: false, message: "user not found of this Id" })
      
//           // if (avail.userId != decodedToken.userId)return res.status(403).send({ status: false, message: "user can't be manupilate someone else data!" });
      
//           next()
      
//         } catch (err) {
//           return res.status(500).send({ status: false, message: err.message });
//         }
//       };
      
//       module.exports.authorization = authorization;