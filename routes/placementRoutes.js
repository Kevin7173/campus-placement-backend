const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {

  createPlacement,
  getPlacements,
  getStudentPlacements,
  updatePlacement,
  deletePlacement

} = require("../controllers/placementController");

// Admin

router.get(
  "/",
  protect,
  authorize("admin"),
  getPlacements
);

router.post(
  "/",
  protect,
  authorize("admin"),
  createPlacement
);

router.put(
  "/:id",
  protect,
  authorize("admin"),
  updatePlacement
);

router.delete(
  "/:id",
  protect,
  authorize("admin"),
  deletePlacement
);

// Student

router.get(
  "/student",
  protect,
  authorize("student"),
  getStudentPlacements
);

module.exports = router;