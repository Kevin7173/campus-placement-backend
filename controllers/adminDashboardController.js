const Student = require("../models/Student");
const Company = require("../models/Company");
const Job = require("../models/Job");
const Application = require("../models/Application");

const getDashboard = async (req, res) => {
  try {

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // ==========================
    // Overall Statistics
    // ==========================

    const totalStudents =
      await Student.countDocuments();

    const totalCompanies =
      await Company.countDocuments();

    const totalJobs =
      await Job.countDocuments();

    const totalApplications =
      await Application.countDocuments();

    const selectedStudents =
      await Application.countDocuments({
        status: "Selected",
      });

    const activeJobs =
      await Job.countDocuments({
        isActive: true,
      });

    // ==========================
    // Today's Activity
    // ==========================

    const todayStudents =
      await Student.countDocuments({
        createdAt: { $gte: today },
      });

    const todayCompanies =
      await Company.countDocuments({
        createdAt: { $gte: today },
      });

    const todayJobs =
      await Job.countDocuments({
        createdAt: { $gte: today },
      });

    const todayApplications =
      await Application.countDocuments({
        createdAt: { $gte: today },
      });

    const todayInterviews =
      await Application.countDocuments({
        status: "Interview Scheduled",
      });

    // ==========================
    // Placement Rate
    // ==========================

    const placementRate =
      totalStudents === 0
        ? 0
        : (
            (selectedStudents /
              totalStudents) *
            100
          ).toFixed(1);

    // ==========================
    // Recent Data
    // ==========================

    const recentStudents =
      await Student.find()
        .sort({ createdAt: -1 })
        .limit(5);

    const recentCompanies =
      await Company.find()
        .sort({ createdAt: -1 })
        .limit(5);

    const recentJobs =
      await Job.find()
        .populate(
          "company",
          "companyName"
        )
        .sort({ createdAt: -1 })
        .limit(5);

    res.json({

      totalStudents,
      totalCompanies,
      totalJobs,
      totalApplications,

      selectedStudents,
      placementRate,
      activeJobs,

      todayStudents,
      todayCompanies,
      todayJobs,
      todayApplications,
      todayInterviews,

      recentStudents,
      recentCompanies,
      recentJobs,

    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};

module.exports = {
  getDashboard,
};