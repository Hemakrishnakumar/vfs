import { model, Schema } from "mongoose";

const directorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    parentDirId: {
      type: Schema.Types.ObjectId,
      default: null,
      ref: "Directory",
    },
    size: {
      type: Number,
      required: true,
      default: 0
    },
    fileCount: {
      type: Number,
      required: true,
      default: 0
    },
    directoryCount: {
      type: Number,
      required: true,
      default: 0
    },
  },
  {
    timestamps: true,
    strict: "throw",
  }
);

const Directory = model("Directory", directorySchema);

export default Directory;
