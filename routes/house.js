import express from "express";
  
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
import { multerUpload } from "../utils/cloudinaryConfig.js";

import authenticateUser from "../middleware/authentication.js";

const router = express.Router();

router.route("/").get(allHouses);
router.route("/user-houses").get(authenticateUser, currentUserHouses);
router.route("/filter/:typeId").get(getHousesByTypes);
router.route("/create").post(authenticateUser, multerUpload.array("media"), createHouse);
router.route("/edit/:houseId").put(authenticateUser,  multerUpload.array("media"), editHouse);
router.route("/house-types").get(allHouseTypes);
router.route("/:houseId/detail").get(authenticateUser, getHouseDetail);
router.route("/available-houses").get(authenticateUser, getAvailableHouses);
router.route("/booked-houses").get(authenticateUser, getBookedHouses);
router.route("/delete/:houseId").delete(authenticateUser, deleteHouse);

export default router;
