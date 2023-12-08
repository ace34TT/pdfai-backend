import mongoose from "mongoose";

const SessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
  },
});

const Session = mongoose.model("custom_sessions", SessionSchema);
export default Session;
