const Placement = require("../models/Placement");
const Company = require("../models/Company");
const Student = require("../models/Student");
const Application = require("../models/Application");

// ==========================================
// Create Placement
// ==========================================

const createPlacement = async (req, res) => {
  try {

    const placement = await Placement.create(req.body);

    res.status(201).json(placement);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};

// ==========================================
// Get All Placements (Admin)
// ==========================================

const getPlacements = async (req, res) => {
  try {

    const placements = await Placement.find()

      .populate(
        "student",
        "fullName department"
      )

      .populate(
        "company",
        "companyName logo"
      )

      .populate(
        "job",
        "title salary"
      )

      .sort({
        createdAt: -1,
      });

    res.json(placements);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};

// ==========================================
// Get Logged-in Student Placements
// ==========================================

const getStudentPlacements = async (
  req,
  res
) => {

  try {

    const student =
      await Student.findOne({
        user: req.user._id,
      });

    if (!student) {

      return res.status(404).json({
        message:
          "Student profile not found",
      });

    }

    const placements =
      await Placement.find({

        student: student._id,

      })

        .populate(
          "company",
          "companyName logo location website"
        )

        .populate(
          "job",
          "title salary location employmentType"
        )

        .sort({
          createdAt: -1,
        });

    res.json(placements);

  } catch (error) {

    res.status(500).json({

      message: error.message,

    });

  }

};

// ==========================================
// Update Placement
// ==========================================

const updatePlacement = async (
  req,
  res
) => {

  try {

    const placement =
      await Placement.findById(
        req.params.id
      );

    if (!placement) {

      return res.status(404).json({
        message:
          "Placement not found",
      });

    }

    Object.assign(
      placement,
      req.body
    );

    await placement.save();

    res.json(placement);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }

};

// ==========================================
// Delete Placement
// ==========================================

const deletePlacement = async (
  req,
  res
) => {

  try {

    const placement =
      await Placement.findById(
        req.params.id
      );

    if (!placement) {

      return res.status(404).json({
        message:
          "Placement not found",
      });

    }

    await placement.deleteOne();

    res.json({

      success: true,

      message:
        "Placement deleted successfully",

    });

  } catch (error) {

    res.status(500).json({

      message: error.message,

    });

  }

};

module.exports = {

  createPlacement,
  getPlacements,
  getStudentPlacements,
  updatePlacement,
    deletePlacement,

};