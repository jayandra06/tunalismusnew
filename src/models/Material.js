import mongoose from "mongoose";

const MaterialSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    fileUrl: { type: String, required: true }, // PDF, video link, etc.
    type: { type: String, enum: ["pdf", "video", "doc", "link"], default: "pdf" },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    batch: { type: mongoose.Schema.Types.ObjectId, ref: "Batch" },
  },
  { timestamps: true }
);

export default mongoose.models.Material || mongoose.model("Material", MaterialSchema);
