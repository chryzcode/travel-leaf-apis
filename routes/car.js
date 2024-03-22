import express from "express";
import {
  createCar,
  editCar,
  allCarTypes,
  allCars,
  currentUserCars,
  getCarsByTypes,
  getAvailableCars,
} from "../controllers/car.js";

import authenticateUser from "../middleware/authentication.js";

const router = express.Router();

router.route("/").get(allCars);
router.route("/user-houses").get(authenticateUser, currentUserCars);
router.route("/filter/:typeId").get(getCarsByTypes);

router.route("/create").post(authenticateUser, createCar);
router.route("/edit/:houseId").put(authenticateUser, editCar);
router.route("/car-types").get(allCarTypes);
router.route("/available-car").get(authenticateUser, getAvailableCars);

export default router;
