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
} from "../controllers/car.js";

import authenticateUser from "../middleware/authentication.js";

const router = express.Router();

router.route("/").get(allCars);
router.route("/user-cars").get(authenticateUser, currentUserCars);
router.route("/filter/:typeId").get(getCarsByTypes);
router.route("/create").post(authenticateUser, createCar);
router.route("/edit/:carId").put(authenticateUser, editCar);
router.route("/:carId/detail").get(authenticateUser, getCarDetail);
router.route("/car-types").get(allCarTypes);
router.route("/available-cars").get(authenticateUser, getAvailableCars);
router.route("/booked-cars").get(authenticateUser, getBookedCars);

export default router;
