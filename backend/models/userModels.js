const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const userSchema = new mongoose.Schema({   
    name: {
        type: String,
        required: [true,"Please tell us your name"],
        maxLength: [30,"Name is too long"],
        minLength: [4,"Name is too short"]
    },
    email: {
        type: String,
        required: [true,"Please provide your email"],
        validate: [validator.isEmail,"Please provide a valid email"],
        unique: true
    },
    password: {
        type: String,
        required: [true,"Please provide a password"],
        minLength: [8,"Password is too short"],
        select: false
    },
    avatar: {
        public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
    role:{
        type: String,
        default: "user"
    },
     createdAt: {
    type: Date,
    default: Date.now,
  },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
 });

 userSchema.pre("save",async function(next){
    if(!this.isModified("password")){
        next();
    }
    this.password = await bcrypt.hash(this.password,10);
 })

 //JWT Token

    userSchema.methods.getJwtToken = function(){
        return jwt.sign({id:this._id},process.env.JWT_SECRET,{
            expiresIn: process.env.JWT_EXPIRE,

        })
    }

userSchema.methods.comparePassword = async function(password){
    return await bcrypt.compare(password,this.password);
    console.log("right password")
}

userSchema.methods.getResetPasswordToken = function () {
  // Generating Token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hashing and adding resetPasswordToken to userSchema
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

  return resetToken;
};



 module.exports = mongoose.model("User", userSchema);