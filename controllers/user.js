import { User } from "../models/user.js";
import { StatusCodes } from "http-status-codes";
import { transporter, generateToken } from "../utils/user.js";
import {
  BadRequestError,
  UnauthenticatedError,
  NotFoundError,
} from "../errors/index.js";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import cloudinary from "cloudinary";
import bcrypt from "bcryptjs";
import { Wallet } from "../models/payment.js";
import { request } from "express";

const uniqueID = uuidv4();
const domain = process.env.DOMAIN || "http://localhost:8000";

const linkVerificationtoken = generateToken(uniqueID);

export const logout = async (req, res) => {
  const { userId } = req.user;
  req.body.token = "";
  await User.findOneAndUpdate({ _id: userId }, req.body);
  res.status(StatusCodes.OK).send();
};

export const signUp = async (req, res) => {
  const user = await User.create({ ...req.body });
  const maildata = {
    from: process.env.Email_User,
    to: user.email,
    subject: `${user.fullName} verify your account`,
    html: `<p>Please use the following <a href="${domain}/auth/verify-account/?userId=${
      user.id
    }/?token=${encodeURIComponent(
      linkVerificationtoken
    )}">link</a> to verify your account. Link expires in 10 mins.</p>`,
  };
  transporter.sendMail(maildata, (error, info) => {
    if (error) {
      res.status(StatusCodes.BAD_REQUEST).send();
    }
    res.status(StatusCodes.OK).send();
  });
  //const token = jwt.sign(user, process.env.JWT_SECRET, {
    //expiresIn: "5d",
  //});
  const token = user.createJWT();
  const wallet = await Wallet.findOne({ user: user.id });
  if (!wallet) {
    await Wallet.create({
      user: user.id,
    });
  }
  res.status(StatusCodes.CREATED).json({
    user: { fullName: user.fullName },
    token,
    msg: "check your mail for account verification",
  });
};

export const sendEmail = async (res, req) => {
  const { userId } = req.user;
  const user = await User.findById(userId);
  const maildata = {
    from: process.env.Email_User,
    to: user.email,
    subject: `${user.fullName} verify your account`,
    html: `<p>Please use the following <a href="${domain}/auth/verify-account/?userId=${
      user.id
    }/?token=${encodeURIComponent(
      linkVerificationtoken
    )}">link</a> to verify your account. Link expires in 10 mins.</p>`,
  };
  transporter.sendMail(maildata, (error, info) => {
    if (error) {
      res.status(StatusCodes.BAD_REQUEST).send();
    }
    res.status(StatusCodes.OK).send();
  });
  const token = user.createJWT();
  const wallet = await Wallet.findOne({ user: user.id });
  if (!wallet) {
    await Wallet.create({
      user: user.id,
    });
  }
  res.status(StatusCodes.CREATED).json({
    user: { fullName: user.fullName },
    token,
    msg: "check your mail for account verification",
  });
};

export const verifyAccount = async (req, res) => {
  const token = req.params.token;
  const userId = req.params.userId;
  const secretKey = process.env.JWT_SECRET;
  try {
    jwt.verify(token, secretKey);
    const user = await User.findOneAndUpdate(
      { _id: userId },
      { verified: true },
      { new: true, runValidators: true }
    );
    res.status(StatusCodes.OK).send();
  } catch (error) {
    console.error("Token verification failed:", error);
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: "Invalid or expired token" });
  }
};

export const signIn = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError("Put in your email/username and password");
  }

  const user = await User.findOne({ email: email });

  if (!user) {
    throw new UnauthenticatedError("User does not exist");
  }

  const passwordMatch = await user.comparePassword(password);
  if (!passwordMatch) {
    throw new UnauthenticatedError("Invalid password");
  }

  if (!user.verified) {
    const maildata = {
      from: process.env.Email_User,
      to: user.email,
      subject: `${user.fullName} verify your account`,
      html: `<p>Please use the following <a href="${domain}/auth/verify-account/?userId=${
        user.id
      }/?token=${encodeURIComponent(
        linkVerificationtoken
      )}">link</a> to verify your account. Link expires in 10 mins.</p>`,
    };

    nodemailer
      .createTransport({
        service: "Gmail",
        auth: {
          user: process.env.Email_User,
          pass: process.env.Email_Pass,
        },
      })
      .sendMail(maildata, (error, info) => {
        if (error) {
          console.log(error);
          return res.status(StatusCodes.BAD_REQUEST).send();
        }
        console.log(info);
        return res.status(StatusCodes.OK).send();
      });

    throw new UnauthenticatedError("Account is not verified, kindly check your mail for verification");
  }

  let token = user.createJWT();
  await User.findOneAndUpdate({ _id: user._id }, { token: token });
  token = user.token;


  res.status(StatusCodes.OK).json({ user: { fullName: user.fullName }, token });
};

export const currentUser = async (req, res) => {
  const { userId } = req.user;
  const user = await User.findOne({ _id: userId });
  if (!user) {
    throw new UnauthenticatedError(
      "No account is currently logged in or User does not exist"
    );
  }
  res.status(StatusCodes.OK).json({ user });
};

export const getUser = async (req, res) => {
  const { username } = req.params;
  const user = await User.findOne({ username: username });
  if (!user) {
    throw new NotFoundError(`User with username ${username} does not exist`);
  }
  res.status(StatusCodes.OK).json({ user });
};

export const updateUser = async (req, res) => {
  const { userId } = req.user;
  let user = await User.findOne({ _id: userId });
  if (!user) {
    throw new NotFoundError(`User with id ${userId} does not exist`);
  }

  if (req.body.avatar) {
    try {
      const result = await cloudinary.uploader.upload(req.body.avatar, {
        folder: "Trave-Leaf/User/Avatar/",
        use_filename: true,
      });
      req.body.avatar = result.url;
    } catch (error) {
      console.error(error);
      throw new BadRequestError({
        "error uploading image on cloudinary": error,
      });
    }
  }

  if (req.body.password) {
    const salt = await bcrypt.genSalt(10);
    req.body.password = await bcrypt.hash(req.body.password, salt);
  }

  user = await User.findOneAndUpdate({ _id: userId }, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(StatusCodes.OK).json({ user });
};



export const deleteUser = async (req, res) => {
  const { userId } = req.user;
  const user = await User.findOneAndUpdate(
    { _id: userId },
    { verified: false },
    { new: true, runValidators: true }
  );
  if (!user) {
    throw new NotFoundError(`User with id ${userId} does not exist`);
  }
  res.status(StatusCodes.OK).send("Your account has been disabled");
};

export const sendForgotPasswordLink = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new BadRequestError("Email field is required");
  }
  const user = await User.findOne({ email: email });
  if (!user) {
    throw new NotFoundError("User does not exists");
  }
  const maildata = {
    from: process.env.Email_User,
    to: user.email,
    subject: `${user.fullName} you forgot your password`,
    html: `<p>Please use the following <a href="${domain}/verify/forgot-password/?userId=${
      user.id
    }/?token=${encodeURIComponent(
      linkVerificationtoken
    )}">link</a> for verification. Link expires in 30 mins.</p>`,
  };
  transporter.sendMail(maildata, (error, info) => {
    if (error) {
      res.status(StatusCodes.BAD_REQUEST).send();
    }
    res.status(StatusCodes.OK).send("Check you email to change your password");
  });
};

export const verifyForgotPasswordToken = async (req, res) => {
  const token = req.params.token;
  const userId = req.params.userId;
  const secretKey = process.env.JWT_SECRET;
  var { password } = req.body;
  try {
    jwt.verify(token, secretKey);
    const salt = await bcrypt.genSalt(10);
    password = await bcrypt.hash(password, salt);
    const user = await User.findOneAndUpdate(
      { _id: userId },
      { password: password, token: token },
      { runValidators: true, new: true }
    );

    res.status(StatusCodes.OK).json({ user });
  } catch (error) {
    console.error("Token verification failed:", error);
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: "Invalid or expired token" });
  }
};

export const contactUs = async (req, res) => {
  const { fullName, email, message } = req.body;
  if (!fullName || !email || !message) {
    throw new BadRequestError(
      "fullName, email and message fields are compulsory"
    );
  }
  const maildata = {
    from: email,
    to: process.env.Email_User,
    subject: `${email} sent mail to Travel Leaf`,
    html: `${message}`,
  };
  transporter.sendMail(maildata, (error, info) => {
    if (error) {
      res.status(StatusCodes.BAD_REQUEST).send();
    }
    res.status(StatusCodes.OK).send("Mail sent");
  });
};

export const changeUserToHost = async (req, res) => {
  const { userId } = req.user;
  var user = await User.findOne({ _id: userId });
  if (!user) {
    throw new NotFoundError(`User with id ${userId} does not exist`);
  }

  user = await User.findOneAndUpdate(
    { _id: userId },
    { userType: "Host" },
    { new: true, runValidators: true }
  );
  res.status(StatusCodes.OK).json({ user });
};

export const changeUserToGuest = async (req, res) => {
  const { userId } = req.user;
  var user = await User.findOne({ _id: userId });
  if (!user) {
    throw new NotFoundError(`User with id ${userId} does not exist`);
  }

  user = await User.findOneAndUpdate(
    { _id: userId },
    { userType: "Guest" },
    { new: true, runValidators: true }
  );
  res.status(StatusCodes.OK).json({ user });
};
