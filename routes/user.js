import express from "express";
import {
  signIn,
  signUp,
  getUser,
  updateUser,
  deleteUser,
  logout,
  sendForgotPasswordLink,
  verifyForgotPasswordToken,
  verifyAccount,
  currentUser,
  contactUs,
  changeUserToHost,
  changeUserToGuest,
  sendEmail,
} from "../controllers/user.js";

import authenticateUser from "../middleware/authentication.js";
import passport from "passport";
import { StatusCodes } from "http-status-codes";

const router = express.Router();

router.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["email", "profile"],
  })
);

// Call back route
router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    access_type: "offline",
    scope: ["email", "profile"],
  }),
  (req, res) => {
    if (!req.user) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "Authentication failed" });
    }
    res.status(StatusCodes.OK).json({
      user: { fullName: req.user.fullName },
      token: req.user.token,
    });
  }
);

router.route("/contact-us").post(contactUs);
router.route("/auth/signUp").post(signUp);
router.route("/auth/sigin").post(signIn);
router.route("/profile/:username").get(getUser);
router.route("/current-user").get(authenticateUser, currentUser);
router.route("/auth/logout").post(authenticateUser, logout);
router.route("/update").put(authenticateUser, updateUser);
router.route("/delete").delete(authenticateUser, deleteUser);
router.route("/send-forgot-password-link").post(sendForgotPasswordLink);
router
  .route("/auth/forgot-password/:userId/:token")
  .get(verifyForgotPasswordToken);
router.route("/auth/verify-account/:userId/:token").get(verifyAccount);
router.route("/switch/host").post(authenticateUser, changeUserToHost);
router.route("/switch/guest").post(authenticateUser, changeUserToGuest);
router.route("/sendemail").get(authenticateUser, sendEmail);

export default router;
