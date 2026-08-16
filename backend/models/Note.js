import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    topic: { type: String, required: true },
    technology: { type: String, default: "" },
    content: { type: String, required: true }, // Markdown formatted study notes
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Pathway" },
    tags: [{ type: String }],
    isFavorite: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model("Note", noteSchema);
