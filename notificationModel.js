const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "Motion has been detected, view video",
    },
    videoUrl: {
      type: String,
      required: true,
    },
    latitude: {
      type: String,
      required: true,
    },
    longitude: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["READ", "UNREAD"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notifications", notificationSchema);
// module.exports = playerSchema;
