import express from "express";
import {
  createHouse,
  editHouse,
  allHouseTypes,
  allHouses,
  currentUserHouses,
  getHousesByTypes,
  getAvailableHouses,
} from "../controllers/house.js";

import authenticateUser from "../middleware/authentication.js";

const router = express.Router();

router.route("/").get(allHouses);
router.route("/user-houses").get(authenticateUser, currentUserHouses);
router.route("/filter/:typeId").get(getHousesByTypes);
router.route("/create").post(authenticateUser, createHouse);
router.route("/edit/:houseId").put(authenticateUser, editHouse);
router.route("/house-types").get(allHouseTypes);
router.route("/available-house").get(authenticateUser, getAvailableHouses);

export default router;
