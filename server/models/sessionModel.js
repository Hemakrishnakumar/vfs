import { model, Schema } from "mongoose";

const sessionSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref:'User'
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 3600,
    },
  },
  {
    strict: "throw",
  }
);

const Session = model("Session", sessionSchema);

export default Session;
