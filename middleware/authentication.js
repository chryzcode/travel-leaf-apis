export default async (req, res, next) => {
  // Check header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    throw new UnauthenticatedError("Token does not start with Bearer");
  }
  const token = authHeader.split(" ")[1];

  // Check if user exists with the provided token
  const user = await User.findOne({ token: token });
  if (!user) {
    throw new UnauthenticatedError("User does not exist or not verified");
  }

  // If user exists, check if they are verified
  if (!user.verified) {
    // Set a specific status code for email verification error
    res.status(402).json({ error: "Email verification required" });
    return;
  }

  try {
    // Verify the JWT token
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the user to the request object
    req.user = { userId: payload.userId, firstName: payload.firstName };

    next();
  } catch (error) {
    // Check if the error is a token expiration error
    if (error.name === "TokenExpiredError") {
      res.status(401).json({ error: "Token expired" });
    } else {
      throw new UnauthenticatedError("Authentication invalid");
    }
  }
};
