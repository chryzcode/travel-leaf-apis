import { House, houseType } from "../models/house.js";
import cloudinary from "cloudinary";
import { StatusCodes } from "http-status-codes";
import { BadRequestError, UnauthenticatedError, NotFoundError } from "../errors/index.js";
import notFound from "../middleware/not-found.js";

cloudinary.v2.config({
  cloudinary_url: process.env.CLOUDINARY_URL,
});

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
  const mediaFiles = req.media; // Use req.files from Multer
  let type = await houseType.findOne({ name: req.body.houseType });
  if (!type) {
    throw new NotFoundError("House type does not exist");
  }
  req.body.houseType = type.id;

  if (mediaFiles) {
    req.body.media = [];
    for (const file of mediaFiles) {
      try {
        const result = await new Promise((resolve, reject) => {
          cloudinary.v2.uploader
            .upload_stream(
              {
                folder: "Trave-Leaf/House/Media/",
                use_filename: true,
              },
              (error, result) => {
                if (error) reject(error);
                resolve(result);
              }
            )
            .end(file.buffer);
        });
        req.body.media.push({ url: result.url }); // Replace media URL with Cloudinary URL
      } catch (error) {
        console.error(error);
        throw new BadRequestError({ "error uploading image on cloudinary": error });
      }
    }
  }

  let house = await House.create({ ...req.body });
  house = await House.findOne({ _id: house._id })
    .populate("user", "fullName avatar username userType _id")
    .populate("houseType", "name _id");
  res.status(StatusCodes.OK).json({ house });
};

export const editHouse = async (req, res) => {
  const { houseId } = req.params;
  const userId = req.user.userId;
  const media = req.body.media;

  var type = await houseType.findOne({ name: req.body.houseType });
  if (!type) {
    throw NotFoundError(`House type does not exist`);
  }
  req.body.houseType = type.id;

  var house = await House.findOne({ _id: houseId, user: userId });
  if (!house) {
    throw new NotFoundError(`House with id ${houseId} does not exist`);
  }
  if (media !== house.media) {
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

  house = await House.findOneAndUpdate({ _id: houseId, user: userId }, req.body, {
    new: true,
    runValidators: true,
  })
    .populate("user", "fullName avatar username userType _id")
    .populate("houseType", "name _id");

  res.status(StatusCodes.OK).json({ house });
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
