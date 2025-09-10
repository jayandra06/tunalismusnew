import mongoose from "mongoose";

const MaterialSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    fileUrl: { type: String, required: true }, // PDF, video link, etc.
    type: { type: String, enum: ["pdf", "video", "doc", "link"], default: "pdf" },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    batch: { type: mongoose.Schema.Types.ObjectId, ref: "Batch" },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["draft", "published", "archived"], default: "published" },
    size: { type: String, default: "" },
    downloads: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Material || mongoose.model("Material", MaterialSchema);
