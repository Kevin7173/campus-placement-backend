const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
  applyJob,
  getStudentApplications,
  getCompanyApplications,
  getApplicantsByJob,
  updateApplicationStatus,
} = require("../controllers/applicationController");

// ======================================
// Student Routes
// ======================================

// Apply for a Job
router.post(
  "/:jobId",
  protect,
  authorize("student"),
  applyJob
);

// View Logged-in Student Applications
router.get(
  "/student",
  protect,
  authorize("student"),
  getStudentApplications
);

// ======================================
// Company Routes
// ======================================

// View Applicants for Company's Jobs
router.get(
  "/company",
  protect,
  authorize("company"),
  getCompanyApplications
);

router.get(
  "/company/job/:jobId",
  protect,
  authorize("company"),
  getApplicantsByJob
);

// Update Application Status
router.put(
  "/:id/status",
  protect,
  authorize("company"),
  updateApplicationStatus
);

module.exports = router;