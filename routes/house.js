import express from "express";
import upload from "../middleware/multer.js";
//const upload = require("../middleware/multer.js")
  
import {
  createHouse,
  editHouse,
  allHouseTypes,
  allHouses,
  currentUserHouses,
  getHousesByTypes,
  getAvailableHouses,
  getHouseDetail,
  getBookedHouses,
  deleteHouse,
} from "../controllers/house.js";

import authenticateUser from "../middleware/authentication.js";

const router = express.Router();

router.route("/").get(allHouses);
router.route("/user-houses").get(authenticateUser, currentUserHouses);
router.route("/filter/:typeId").get(getHousesByTypes);
router.route("/create").post(authenticateUser, upload, createHouse);
router.route("/edit/:houseId").put(authenticateUser, editHouse);
router.route("/house-types").get(allHouseTypes);
router.route("/:houseId/detail").get(authenticateUser, getHouseDetail);
router.route("/available-houses").get(authenticateUser, getAvailableHouses);
router.route("/booked-houses").get(authenticateUser, getBookedHouses);
router.route("/delete/:houseId").delete(authenticateUser, deleteHouse);

export default router;
