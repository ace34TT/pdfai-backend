import mongoose from "mongoose";
require("dotenv").config();

mongoose.connect(process.env.MONGODB_CONNECTION_STR!, {});

export { mongoose };
