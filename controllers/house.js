import { House, houseType } from "../models/house.js";
import { uploadToCloudinary } from "../utils/cloudinaryConfig.js";
import { StatusCodes } from "http-status-codes";
import {
  BadRequestError,
  UnauthenticatedError,
  NotFoundError,
} from "../errors/index.js";


export const allHouseTypes = async (req, res) => {
  const types = await houseType.find({});
  res.status(StatusCodes.OK).json({ types });
};

export const allHouses = async (req, res) => {
  const houses = await House.find({})
    .sort("createdAt")
    .populate("user", "fullName avatar username userType _id")
    .populate("houseType", "name _id");
  res.status(StatusCodes.OK).json({ houses });
};

export const currentUserHouses = async (req, res) => {
  const userId = req.user.userId;
  const houses = await House.find({ user: userId })
    .sort("createdAt")
    .populate("user", "fullName avatar username userType _id")
    .populate("houseType", "name _id");
  res.status(StatusCodes.OK).json({ houses });
};

export const getHousesByTypes = async (req, res) => {
  const { typeId } = req.params;
  const houses = await House.find({ houseType: typeId })
    .populate("user", "fullName avatar username userType _id")
    .populate("houseType", "name _id");
  res.status(StatusCodes.OK).json({ houses });
};

export const createHouse = async (req, res) => {
  req.body.user = req.user.userId;
  const mediaFiles = req.files; // Use req.files from Multer

  let type = await houseType.findOne({ name: req.body.houseType });
  if (!type) {
    return res.status(404).json({ error: "House type does not exist" });
  }
  req.body.houseType = type._id;


  if (mediaFiles) {
    req.body.media = [];
    for (const file of mediaFiles) {
      try {
        const result = await uploadToCloudinary(file);
        req.body.media.push({ url: result.secure_url }); // Replace media URL with Cloudinary URL
      } catch (error) {
        console.error("Error uploading image to Cloudinary:", error);
        return res.status(400).json({ error: "Error uploading image to Cloudinary" });
      }
    }
  }

  try {
    let house = await House.create({ ...req.body });
    house = await House.findOne({ _id: house._id })
      .populate("user", "fullName avatar username userType _id")
      .populate("houseType", "name _id");
    res.status(200).json({ house });
  } catch (error) {
    console.error("Error creating house:", error);
    res.status(500).json({ error: "Error creating house", details: error.message });
  }
};


export const editHouse = async (req, res) => {
  const { houseId } = req.params;
  const userId = req.user.userId;
  const mediaFiles = req.files; // Use req.files from Multer

  // Check if houseType exists
  let type = await houseType.findOne({ name: req.body.houseType });
  if (!type) {
    return res.status(404).json({ error: "House type does not exist" });
  }
  req.body.houseType = type._id;

  // Find and validate the house
  let house = await House.findOne({ _id: houseId, user: userId });
  if (!house) {
    return res.status(404).json({ error: `House with id ${houseId} does not exist` });
  }

  // Handle media file uploads
  if (mediaFiles && mediaFiles.length > 0) {
    try {
      const uploadPromises = mediaFiles.map(file => uploadToCloudinary(file));
      const results = await Promise.all(uploadPromises);
      req.body.media = results.map(result => ({ url: result.secure_url }));
    } catch (error) {
      console.error("Error uploading images to Cloudinary:", error);
      return res.status(400).json({ error: "Error uploading images" });
    }
  }

  // Update house information
  house = await House.findOneAndUpdate({ _id: houseId, user: userId }, req.body, {
    new: true,
    runValidators: true,
  })
    .populate("user", "fullName avatar username userType _id")
    .populate("houseType", "name _id");

  res.status(200).json({ house });
};

export const getAvailableHouses = async (req, res) => {
  const { userId } = req.user;
  const houses = await House.find({ user: userId, booked: false })
    .populate("user", "fullName avatar username userType _id")
    .populate("houseType", "name _id");
  res.status(StatusCodes.OK).json({ houses });
};

export const getBookedHouses = async (req, res) => {
  const { userId } = req.user;
  const houses = await House.find({ user: userId, booked: true })
    .populate("user", "fullName avatar username userType _id")
    .populate("houseType", "name _id");
  res.status(StatusCodes.OK).json({ houses });
};

export const getHouseDetail = async (req, res) => {
  const { houseId } = req.params;
  const house = await House.findOne({ _id: houseId });
  if (!house) {
    throw new NotFoundError(`House with ${houseId} does not exist`);
  }
  res
    .status(StatusCodes.OK)
    .json({ house })
    .populate("user", "fullName avatar username userType _id")
    .populate("houseType", "name _id");
};

export const deleteHouse = async (req, res) => {
  const { houseId } = req.params;
  const { userId } = req.user;
  const house = await House.findOneAndDelete({ _id: houseId, user: userId });
  if (!house) {
    throw new NotFoundError(`House with ${houseId} does not exist`);
  }
  if (house.booked == true) {
    throw new UnauthenticatedError(`You can not deleted a booked house`);
  }
  res.status(StatusCodes.OK).send();
};
