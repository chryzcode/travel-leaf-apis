import express from "express";
import {
  createCar,
  editCar,
  allCarTypes,
  allCars,
  currentUserCars,
  getCarsByTypes,
  getAvailableCars,
  getCarDetail,
  getBookedCars,
  deleteCar,
} from "../controllers/car.js";

import authenticateUser from "../middleware/authentication.js";
import { multerUpload } from "../utils/cloudinaryConfig.js";

const router = express.Router();

router.route("/").get(allCars);
router.route("/user-cars").get(authenticateUser, currentUserCars);
router.route("/filter/:typeId").get(getCarsByTypes);
router.route("/create").post(authenticateUser, multerUpload.array("media"), createCar);
router.route("/edit/:carId").put(authenticateUser, multerUpload.array("media"), editCar);
router.route("/:carId/detail").get(authenticateUser, getCarDetail);
router.route("/car-types").get(allCarTypes);
router.route("/available-cars").get(authenticateUser, getAvailableCars);
router.route("/booked-cars").get(authenticateUser, getBookedCars);
router.route("/delete/:carId").delete(authenticateUser, deleteCar);

export default router;
