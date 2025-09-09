import mongoose from "mongoose";

const ProgressSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    completedLessons: { type: Number, default: 0 },
    totalLessons: { type: Number, required: true },
    percentage: { type: Number, default: 0 }, // calculated
  },
  { timestamps: true }
);

export default mongoose.models.Progress || mongoose.model("Progress", ProgressSchema);
