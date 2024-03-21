import express from "express";
import { createHouse, editHouse } from "../controllers/house.js";

import authenticateUser from "../middleware/authentication.js";

const router = express.Router();

router.route("/create").post(authenticateUser, createHouse);
router.route("/edit/:houseId").put(authenticateUser, editHouse);

export default router;
