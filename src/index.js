const express = require('express');
const bodyParser = require('body-parser');//to convert data in json format
const route = require('./route/route.js');
const mongoose  = require('mongoose');
const app = express();

app.use(bodyParser.json());
 

const multer = require("multer")

// const { AppConfig } = require("aws-sdk")

app.use(multer().any())

mongoose.connect("mongodb+srv://anujanantwad1:Anujanantwad1@cluster0.2hcdh.mongodb.net/group21Database?retryWrites=true&w=majority", {
    useNewUrlParser: true
})
.then( () => console.log("MongoDb is connected"))
.catch ( err => console.log(err) )

app.use('/', route); 

// app.use((req, res, next) => {
//     res.status(404).send({
//         status: 404,
//         error: `Not found ${req.url}`

//     })
//     next()
// }) 
app.listen(process.env.PORT || 3000, function () {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
});