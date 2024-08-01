import express from "express";
import { successfulPayment, walletPayout, cancelPayment, getMonthlyIncome } from "../controllers/payment.js";
import authenticateUser from "../middleware/authentication.js";

const router = express.Router();

router.route("/:bookingId/success/:userId").get(successfulPayment);
router.route("/:bookingId/cancel/:userId").get(cancelPayment);
router.route("/:bankId/payout").post(authenticateUser, walletPayout);
router.route("/monthly/income").get(authenticateUser, getMonthlyIncome);

export default router;
