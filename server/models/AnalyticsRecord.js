const mongoose = require("mongoose");

const CATEGORIES = ["Sales", "Marketing", "Operations"];

const analyticsRecordSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: CATEGORIES,
        message: "Category must be Sales, Marketing, or Operations",
      },
    },
    revenue: {
      type: Number,
      required: [true, "Revenue is required"],
      min: [0, "Revenue cannot be negative"],
    },
    users: {
      type: Number,
      required: [true, "Users is required"],
      min: [0, "Users cannot be negative"],
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

analyticsRecordSchema.index({ date: -1 });
analyticsRecordSchema.index({ category: 1 });

module.exports = mongoose.model("AnalyticsRecord", analyticsRecordSchema);
module.exports.CATEGORIES = CATEGORIES;
