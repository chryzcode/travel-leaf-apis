import express from "express";
import { createHouse, } from "../controllers/house.js";

import authenticateUser from "../middleware/authentication.js";

const router = express.Router();

router.route("/create").post(authenticateUser, createHouse)

export default router;
