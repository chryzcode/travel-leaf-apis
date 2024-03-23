import express from "express";
import { createBooking } from "../controllers/booking.js";

const router = express.Router();

router.route("/create/:listingId").post(createBooking);

export default router;
