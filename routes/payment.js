import express from "express";
import { successfulPayment, walletPayout, cancelPayment } from "../controllers/payment.js";
import authenticateUser from "../middleware/authentication.js";

const router = express.Router();

router.route("/:bookingId/success").get(authenticateUser, successfulPayment);
router.route("/:bookingId/cancel").get(authenticateUser, cancelPayment);
router.route("/:bankId/payout").post(authenticateUser, walletPayout);

export default router;
