const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
  createJob,
  getJobs,
  getCompanyJobs,
  getJobById,
  updateJob,
  toggleJobStatus,
  deleteJob,
} = require("../controllers/jobController");

// Public
router.get("/", getJobs);
router.get(
  "/company",
  protect,
  authorize("company"),
  getCompanyJobs
);
router.get("/:id", getJobById);

// Company Only
router.post(
  "/",
  protect,
  authorize("company"),
  createJob
);

router.put(
  "/:id",
  protect,
  authorize("company"),
  updateJob
);

router.put(
  "/toggle/:id",
  protect,
  authorize("company"),
  toggleJobStatus
);

router.delete(
  "/:id",
  protect,
  authorize("company"),
  deleteJob
);

module.exports = router;