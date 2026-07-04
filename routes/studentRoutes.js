const express = require("express");

const router = express.Router();


const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const uploadResume = require("../middleware/uploadResume");
const uploadProfileImageMiddleware = require("../middleware/uploadProfileImage");
const {
  getStudentProfile,
  createStudentProfile,
  updateStudentProfile,
  uploadResume: uploadResumeController,
  uploadProfileImage,
  getStudentDashboard,
} = require("../controllers/studentController");

// Create Profile
router.post(
  "/profile",
  protect,
  authorize("student"),
  createStudentProfile
);

// Get Profile
router.get(
  "/profile",
  protect,
  authorize("student"),
  getStudentProfile
);

router.get(
  "/dashboard",
  protect,
  authorize("student"),
  getStudentDashboard
);

// Update Profile
router.put(
  "/profile",
  protect,
  authorize("student"),
  updateStudentProfile
);

router.post(
  "/resume",
  protect,
  authorize("student"),
  uploadResume.single("resume"),
  uploadResumeController
);

router.post(
  "/profile-image",
  protect,
  authorize("student"),
  uploadProfileImageMiddleware.single("profileImage"),
  uploadProfileImage
);
module.exports = router;