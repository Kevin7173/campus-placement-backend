const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const uploadLogo = require("../middleware/uploadLogo");

const {
  createCompanyProfile,
  getCompanyProfile,
  updateCompanyProfile,
  uploadCompanyLogo,
  getCompanyDashboard,
  getCompanyInterviews,
} = require("../controllers/companyController");

// Create Company Profile
router.post(
  "/profile",
  protect,
  authorize("company"),
  createCompanyProfile
);

// Get Company Profile
router.get(
  "/profile",
  protect,
  authorize("company"),
  getCompanyProfile
);

router.get(
  "/dashboard",
  protect,
  authorize("company"),
  getCompanyDashboard
);

// Update Company Profile
router.put(
  "/profile",
  protect,
  authorize("company"),
  updateCompanyProfile
);

router.post(
  "/logo",
  protect,
  authorize("company"),
  uploadLogo.single("logo"),
  uploadCompanyLogo
);

router.get(
  "/interviews",
  protect,
  authorize("company"),
  getCompanyInterviews
);

module.exports = router;