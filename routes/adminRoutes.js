const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {

getStudents,
deleteStudent,
getCompanies,
deleteCompany,
getPlacementAnalytics,
getChartAnalytics,
getActivityTimeline,
getDashboardHighlights,


} = require("../controllers/adminController");

// Students

router.get(
"/students",
protect,
authorize("admin"),
getStudents
);

router.delete(
"/students/:id",
protect,
authorize("admin"),
deleteStudent
);

// Companies

router.get(
"/companies",
protect,
authorize("admin"),
getCompanies
);

router.delete(
"/companies/:id",
protect,
authorize("admin"),
deleteCompany
);

router.get(
  "/analytics",
  protect,
  authorize("admin"),
  getPlacementAnalytics
);

router.get(
  "/chart-analytics",
  protect,
  authorize("admin"),
  getChartAnalytics
);

router.get(
  "/activity",
  protect,
  authorize("admin"),
  getActivityTimeline
);

router.get(
  "/dashboard-highlights",
  protect,
  authorize("admin"),
  getDashboardHighlights
);

module.exports = router;