import "dotenv/config";
import express from "express";
import "express-async-errors";
import mongoose from "mongoose";

import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";

import session from "express-session";
import passport from "passport";
import "./utils/passport.js";

//error handler
import errorHandlerMiddleware from "./middleware/error-handler.js";
import notFoundMiddleware from "./middleware/not-found.js";

//import route
import userRouter from "./routes/user.js";
import houseRouter from "./routes/house.js";
import carRouter from "./routes/car.js";
import yatchRouter from "./routes/yatch.js";
import bookingRouter from "./routes/booking.js";
import paymentRouter from "./routes/payment.js";
import notificationRouter from "./routes/notification.js";
import ratingRouter from "./routes/rating.js";

const app = express();
const port = process.env.PORT || 8000;

app.set("trust proxy", 1);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, //15 mins
    max: 100, //limit each ip to 100 requests per windowsMs
  })
);

app.use(express.json());
app.use(helmet());
//app.use(cors());
app.use(express.urlencoded({ extended: true }));

// Define a whitelist of allowed origins
const whitelist = ['http://localhost:3000', 'https://travel-leaf.vercel.app', "https://travle-leaf.onrender.com"];

// Define the CORS options
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  optionsSuccessStatus: 200, // Some legacy browsers (IE11, various SmartTVs) choke on 204
  methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
  credentials: true,
};

app.use((req, res, next) => {
  res.header(
    "Access-Control-Allow-Origin",
    `http://localhost:3000, https://travel-leaf.vercel.app, https://travle-leaf.onrender.com`
  );
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,DELETE");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  // Pass to next layer of middleware
  next();
});

// Enable CORS with the specified options
app.use(cors(corsOptions));

app.get("/", (req, res) => {
  res.send(
    `Travel Leaf API <p>Checkout the <a href="https://documenter.getpostman.com/view/31014226/2sA35K1LDs">Travel Leaf API Documentation</a></p>`
  );
});


app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());


app.use("/", userRouter);
app.use("/house", houseRouter);
app.use("/car", carRouter);
app.use("/yatch", yatchRouter);
app.use("/booking", bookingRouter);
app.use("/payment", paymentRouter);
app.use("/rating", ratingRouter);
app.use("/notification", notificationRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const start = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    app.listen(port, () => console.log(`server is running on port ${port}`));
  } catch (error) {
    console.log(error);
  }
};

start();
