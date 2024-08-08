import { User } from "../models/user.js";
import { BadRequestError, UnauthenticatedError, NotFoundError } from "../errors/index.js";
import jwt from "jsonwebtoken";

export default async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    throw new UnauthenticatedError("Token does not start with Bearer");
  }
  const token = authHeader.split(" ")[1];

  const user = await User.findOne({ token });
  if (!user) {
    throw new UnauthenticatedError("User does not exist or not verified");
  }

  if (!user.verified) {
    res.status(402).json({ error: "Email verification required" });
    return;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    req.user = { userId: payload.userId, firstName: payload.firstName };

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      res.status(401).json({ error: "Token expired" });
    } else {
      throw new UnauthenticatedError("Authentication invalid");
    }
  }
};
