import "dotenv/config";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const userTypeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  userType: {
    type: String,
    enum: ["HOST", "GUEST"],
    required: [true, "Please provide user type HOST or ADMIN"],
  },
});

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Please provide full name"],
    },
    avatar: {
      type: String,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      match: [/^\S+$/, "Please provide a valid username"],
    },
    email: {
      required: true,
      type: String,
      unique: true,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please provide a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Please provide password"],
      minlength: 6,
    },
    token: {
      type: String,
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },

  {
    timestamps: true,
  }
);

userSchema.pre("save", async function () {
  const salt = await bcrypt.genSalt(10);
  this.password = bcrypt.hash(this.password, salt);
});

userSchema.methods.createJWT = function () {
  const token = jwt.sign({ userId: this._id, fullName: this.fullName }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME,
  });
  this.token = token;
  return token;
};

userSchema.methods.comparePassword = async function (candidatePassword) {
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  return isMatch;
};

const User = mongoose.model("User", userSchema);
const userType = mongoose.model("userType", userTypeSchema);

export { User, userType };
