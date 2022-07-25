const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema(
    {
    fname: {
        type:String, 
        required:true
    },
    lname: {
        type:String, 
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true
    },
    // profileImage: {
    //     type:String,
    //     required:true
    //    phone: {
    //         type:String,
    //         required:true,
    //         unique:true
    //     }, // },
    
    password:{
        type:String,
        required:true,
        trim:true
    },
    address: {
              shipping: {
                street: {type:String,required:true},
                city: {type:String,required:true},
                pincode: {type:Number, required:true}
              },
              billing: {
                street: {type:String,required:true},
                city: {type:String,required:true},
                pincode: {type:Number,required:true }
              }
            }

}, { timestamps: true });


userSchema.pre("create",async function(next){
    if(this.isModified("password")){
        console.log(`current pass is ${this.password}`)
        this.password = await bcrypt.hash(this.password,10);
        console.log(`current pass is ${this.password}`)
    }
    next();
}
)

module.exports = mongoose.model('users',userSchema)