// import "dotenv/config";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
// import mongoose from "mongoose";

// const userSchema = new mongoose.Schema(
//   {
//     firstName: {
//       type: String,
//       required: [true, "Please provide name"],
//       minlength: 3,
//       maxlength: 50,
//     },
//     lastName: {
//       type: String,
//       minlength: 3,
//       maxlength: 50,
//     },
//     username: {
//       type: String,
//       required: [true, "Please provide username"],
//       unique: true,
//       minlength: 3,
//       maxlength: 25,
//     },
//     image: {
//       type: String,
//       default: "https://res.cloudinary.com/diksiwkrx/image/upload/v1707511873/default_avatar_ekflby.svg",
//     },
//     email: {
//       type: String,
//       required: [true, "Please provide email"],
//       match: [
//         /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
//         "Please provide a valid email",
//       ],
//       unique: true,
//     },
//     admin: {
//       type: Boolean,
//       default: false,
//     },
//     bio: {
//       type: String,
//       required: false,
//     },
//     password: {
//       type: String,
//       required: [true, "Please provide password"],
//       minlength: 6,
//     },
//     token: {
//       type: String,
//     },
//     verified: {
//       type: Boolean,
//       default: false,
//     },
//   },

//   {
//     timestamps: true,
//   }
// );

// userSchema.pre("save", async function () {
//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
// });

// userSchema.methods.createJWT = function () {
//   const token = jwt.sign({ userId: this._id, firstName: this.firstName }, process.env.JWT_SECRET, {
//     expiresIn: process.env.JWT_LIFETIME,
//   });
//   this.token = token;
//   return token;
// };

// userSchema.methods.comparePassword = async function (candidatePassword) {
//   const isMatch = await bcrypt.compare(candidatePassword, this.password);
//   return isMatch;
// };

// export default mongoose.model("User", userSchema);
