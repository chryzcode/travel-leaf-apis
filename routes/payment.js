import express from "express";
import { successfulPayment } from "../controllers/payment.js";
import authenticateUser from "../middleware/authentication.js";


const router = express.Router();

router.route("/:bookingId/success").get(authenticateUser, successfulPayment);

export default router;