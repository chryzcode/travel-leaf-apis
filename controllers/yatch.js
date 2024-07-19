import { yatchType, Yatch } from "../models/yatch.js";
import { StatusCodes } from "http-status-codes";
import {
  BadRequestError,
  UnauthenticatedError,
  NotFoundError,
} from "../errors/index.js";
export const allYatchTypes = async (req, res) => {
  const types = await yatchType.find({});
  res.status(StatusCodes.OK).json({ types });
};

export const allYatchs = async (req, res) => {
  const yatchs = await Yatch.find({})
    .sort("createdAt")
    .populate("user", "fullName avatar username userType _id")
    .populate("yatchType", "name _id");
  res.status(StatusCodes.OK).json({ yatchs });
};

export const currentUserYatchs = async (req, res) => {
  const userId = req.user.userId;
  const yatch = await Yatch.find({ user: userId })
    .sort("createdAt")
    .populate("user", "fullName avatar username userType _id")
    .populate("yatchType", "name _id");
  res.status(StatusCodes.OK).json({ yatch });
};

export const getYatchsByTypes = async (req, res) => {
  const { typeId } = req.params;
  const yatch = await Yatch.find({ yatchType: typeId })
    .populate("user", "fullName avatar username userType _id")
    .populate("yatchType", "name _id");
  res.status(StatusCodes.OK).json({ yatch });
};

export const createYatch = async (req, res) => {
  req.body.user = req.user.userId;
  const mediaFiles = req.files; // Use req.files from Multer

  try {
    let type = await yatchType.findOne({ name: req.body.yatchType });
    if (!type) {
      return res.status(404).json({ error: "Yatch type does not exist" });
    }
    req.body.yatchType = type._id;

    const mediaUrls = [];
    if (mediaFiles) {
      for (const file of mediaFiles) {
        try {
          const result = await uploadToCloudinary(file);
          mediaUrls.push({ url: result.secure_url });
        } catch (error) {
          console.error("Error uploading image to Cloudinary:", error);
          return res.status(400).json({ error: "Error uploading image to Cloudinary" });
        }
      }
    }
    req.body.media = mediaUrls;

    let yatch = await Yatch.create({ ...req.body });
    yatch = await Yatch.findOne({ _id: yatch._id })
      .populate("user", "fullName avatar username userType _id")
      .populate("yatchType", "name _id");

    res.status(200).json({ yatch });
  } catch (error) {
    console.error("Error creating yatch:", error);
    res.status(500).json({ error: "Error creating yatch", details: error.message });
  }
};


export const editYatch = async (req, res) => {
  const { yatchId } = req.params;
  const userId = req.user.userId;
  const mediaFiles = req.files; // Use req.files from Multer

  try {
    let type = await yatchType.findOne({ name: req.body.yatchType });
    if (!type) {
      return res.status(404).json({ error: "Yatch type does not exist" });
    }
    req.body.yatchType = type._id;

    let yatch = await Yatch.findOne({ _id: yatchId, user: userId });
    if (!yatch) {
      return res.status(404).json({ error: `Yatch with id ${yatchId} does not exist` });
    }

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

    yatch = await Yatch.findOneAndUpdate({ _id: yatchId, user: userId }, req.body, {
      new: true,
      runValidators: true,
    })
      .populate("user", "fullName avatar username userType _id")
      .populate("yatchType", "name _id");

    res.status(200).json({ yatch });
  } catch (error) {
    console.error("Error updating yatch:", error);
    res.status(500).json({ error: "Error updating yatch", details: error.message });
  }
};

export const getAvailableYatchs = async (req, res) => {
  const { userId } = req.user;
  const yatchs = await Yatch.find({ user: userId, booked: false })
    .populate("user", "fullName avatar username userType _id")
    .populate("yatchType", "name _id");
  res.status(StatusCodes.OK).json({ yatchs });
};

export const getBookedYatchs = async (req, res) => {
  const { userId } = req.user;
  const yatchs = await Yatch.find({ user: userId, booked: true })
    .populate("user", "fullName avatar username userType _id")
    .populate("yatchType", "name _id");
  res.status(StatusCodes.OK).json({ yatchs });
};

export const getYatchDetail = async (req, res) => {
  const { yatchId } = req.params;
  const yatch = await Yatch.findOne({ _id: yatchId })
    .populate("user", "fullName avatar username userType _id")
    .populate("yatchType", "name _id");
  if (!yatch) {
    throw new NotFoundError(`Car with ${yatchId} does not exist`);
  }
  res.status(StatusCodes.OK).json({ yatch });
};

export const deleteYatch = async (req, res) => {
  const { yatchId } = req.params;
  const { userId } = req.user;
  const yatch = await Yatch.findOneAndDelete({ _id: yatchId, user: userId });
  if (!yatch) {
    throw new NotFoundError(`Yatch with ${yatchId} does not exist`);
  }
  if (yatch.booked == true) {
    throw new UnauthenticatedError(`You can not deleted a booked yatch`);
  }
  res.status(StatusCodes.OK).send();
};
