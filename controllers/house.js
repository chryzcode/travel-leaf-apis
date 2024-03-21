import { House, houseType } from "../models/house.js";
import cloudinary from "cloudinary";
import { StatusCodes } from "http-status-codes";
import { User } from "../models/user.js";

export const createHouse = async (req, res) => {
  req.body.user = req.user.userId;
  const media = req.body.media;
  var type = await houseType.findOne({ name: req.body.houseType });
  if (!type) {
    await houseType.create({
      name: req.body.houseType,
    });
  }
  type = await houseType.findOne({ name: req.body.houseType });
  req.body.houseType = type.id;
  if (media) {
    for (let i = 0; i < media.length; i++) {
      try {
        const result = await cloudinary.v2.uploader.upload(media[i].url, {
          folder: "Trave-Leaf/House/Media/",
          use_filename: true,
        });
        media[i].url = result.url; // Replace media URL w
      } catch (error) {
        console.error(error);
        throw new BadRequestError({ "error uploading image on cloudinary": error });
      }
    }
  }
  const house = await House.create({ ...req.body });
  res.status(StatusCodes.OK).json({ house });
};

export const editHouse = async (req, res) => {
  const { houseId } = req.params;
  const userId = req.user.userId;
  const media = req.body.media;

  var type = await houseType.findOne({ name: req.body.houseType });
  if (!type) {
    await houseType.create({
      name: req.body.houseType,
    });
  }
  type = await houseType.findOne({ name: req.body.houseType });
  req.body.houseType = type.id;
  if (media) {
    for (let i = 0; i < media.length; i++) {
      try {
        const result = await cloudinary.v2.uploader.upload(media[i].url, {
          folder: "Trave-Leaf/House/Media/",
          use_filename: true,
        });
        media[i].url = result.url; // Replace media URL w
      } catch (error) {
        console.error(error);
        throw new BadRequestError({ "error uploading image on cloudinary": error });
      }
    }
  }

  const house = await House.findOneAndUpdate({ _id: houseId, user: userId }, req.body, {
    new: true,
    runValidators: true,
  });
  if (!house) {
    throw new NotFoundError(`House with id ${houseId} does not exist`);
  }

  res.status(StatusCodes.OK).json({ house });
};
