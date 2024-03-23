import express from "express";
import { createBooking } from "../controllers/booking.js";
import authenticateUser from "../middleware/authentication.js";

const router = express.Router();

router.route("/create/:listingId").post(authenticateUser, createBooking);

export default router;
