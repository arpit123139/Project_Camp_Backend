import mongoose, { Schema } from "mongoose";

const noteSchema = new Schema({
  content: String,
  project: {
    type: Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
  createdByBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  timestamps: true,
});

export const ProjectNote = mongoose.Schema("ProjectNote", noteSchema);
