import express from "express";
import { createNotification, getAllNotifications } from "../controllers/notification.js";
import authenticateUser from "../middleware/authentication.js";

const router = express.Router();

router.route("/:listingId/create").post(authenticateUser, createNotification);
router.route("/").get(authenticateUser, getAllNotifications);

export default router;
