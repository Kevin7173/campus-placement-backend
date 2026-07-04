const mongoose = require("mongoose");

const placementSchema = new mongoose.Schema(
  {

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },

    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
    },

    status: {
      type: String,
      enum: [
        "Placed",
        "Rejected",
        "Offer Sent",
        "Joined",
      ],
      default: "Offer Sent",
    },

    package: {
      type: String,
      default: "",
    },

    joiningDate: {
      type: Date,
    },

    remarks: {
      type: String,
      default: "",
    },

  },
  {
    timestamps: true,
  }
);

module.exports =
mongoose.model(
  "Placement",
  placementSchema
);