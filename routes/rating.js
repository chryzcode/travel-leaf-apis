import express from "express";
import { createRating, allListingRatings } from "../controllers/rating.js";
import authenticateUser from "../middleware/authentication.js";

const router = express.Router();

router.route("/:listingId/create").post(authenticateUser, createRating);
router.route("/all/:listingId").get(allListingRatings);

export default router;
