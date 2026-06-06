import mongoose from "mongoose";
const {Schema , model} = mongoose;

const Userschema  = new Schema({
    name : {
        type : String,
       
    },
    email : {
        type : String,
        required : true,
        unique : true   
    },
    username : {
        type : String ,
         required : true
    },
    profilePicture : {
        type : String
    },
    coverImage : {
        type : String
    },
    razorpayId : {
        type : String
    },
    razorpaySecret : {
        type : String
    }
})


export default  mongoose.models.User || model('User', Userschema)    