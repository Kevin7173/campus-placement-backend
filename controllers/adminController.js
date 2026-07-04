const Placement = require("../models/Placement");
const Student = require("../models/Student");
const Company = require("../models/Company");
const Job = require("../models/Job");
const Application = require("../models/Application");
// ======================================
// Get All Students
// ======================================

const getStudents = async (req, res) => {
  try {

    const students = await Student.find()
      .sort({ createdAt: -1 });

    res.json(students);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};

// ======================================
// Delete Student
// ======================================

const deleteStudent = async (req, res) => {
  try {

    const student =
      await Student.findById(req.params.id);

    if (!student) {

      return res.status(404).json({
        message: "Student not found",
      });

    }

    await student.deleteOne();

    res.json({
      success: true,
      message: "Student deleted",
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};

// ======================================
// Get All Companies
// ======================================

const getCompanies = async (req, res) => {
  try {

    const companies = await Company.find()
      .sort({ createdAt: -1 });

    res.json(companies);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};

// ======================================
// Delete Company
// ======================================

const deleteCompany = async (req, res) => {
  try {

    const company =
      await Company.findById(req.params.id);

    if (!company) {

      return res.status(404).json({
        message: "Company not found",
      });

    }

    await company.deleteOne();

    res.json({
      success: true,
      message: "Company deleted",
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};

const getPlacementAnalytics = async (req, res) => {

  try {

    const totalStudents =
      await Student.countDocuments();

    const totalCompanies =
      await Company.countDocuments();

    const totalPlacements =
      await Placement.countDocuments();

    const joined =
      await Placement.countDocuments({
        status: "Joined",
      });

    const offerSent =
      await Placement.countDocuments({
        status: "Offer Sent",
      });

    const rejected =
      await Placement.countDocuments({
        status: "Rejected",
      });

    const placementRate =
      totalStudents === 0
        ? 0
        : (
            (joined / totalStudents) *
            100
          ).toFixed(1);

    res.json({

      totalStudents,

      totalCompanies,

      totalPlacements,

      joined,

      offerSent,

      rejected,

      placementRate,

    });

  } catch (error) {

    res.status(500).json({

      message: error.message,

    });

  }

};

// ========================================
// Activity Timeline
// ========================================

const getActivityTimeline = async (req, res) => {

  try {

    const students =
      await Student.find()
        .sort({ createdAt: -1 })
        .limit(5);

    const companies =
      await Company.find()
        .sort({ createdAt: -1 })
        .limit(5);

    const jobs =
      await Job.find()
        .populate("company", "companyName")
        .sort({ createdAt: -1 })
        .limit(5);

    const applications =
      await Application.find()
        .populate("student", "fullName")
        .populate("job", "title")
        .sort({ createdAt: -1 })
        .limit(5);

    const placements =
      await Placement.find()
        .populate("student", "fullName")
        .populate("company", "companyName")
        .sort({ createdAt: -1 })
        .limit(5);

    const timeline = [];

    students.forEach((student) => {

      timeline.push({

        type: "Student",

        title: "New Student Registered",

        message: student.fullName,

        createdAt: student.createdAt,

      });

    });

    companies.forEach((company) => {

      timeline.push({

        type: "Company",

        title: "New Company Joined",

        message: company.companyName,

        createdAt: company.createdAt,

      });

    });

    jobs.forEach((job) => {

      timeline.push({

        type: "Job",

        title: "New Job Posted",

        message: `${job.title} - ${job.company?.companyName}`,

        createdAt: job.createdAt,

      });

    });

    applications.forEach((application) => {

      timeline.push({

        type: "Application",

        title: "Job Application",

        message: `${application.student?.fullName} applied for ${application.job?.title}`,

        createdAt: application.createdAt,

      });

    });

    placements.forEach((placement) => {

      timeline.push({

        type: "Placement",

        title: "Student Placed",

        message: `${placement.student?.fullName} → ${placement.company?.companyName}`,

        createdAt: placement.createdAt,

      });

    });

    timeline.sort(

      (a, b) =>

        new Date(b.createdAt) -

        new Date(a.createdAt)

    );

    res.json(timeline.slice(0, 20));

  } catch (error) {

    res.status(500).json({

      message: error.message,

    });

  }

};

// ========================================
// Dashboard Highlights
// ========================================

const getDashboardHighlights = async (req, res) => {

  try {

    const topCompanies =
      await Placement.aggregate([

        {

          $group: {

            _id: "$company",

            placements: {
              $sum: 1,
            },

          },

        },

        {

          $sort: {
            placements: -1,
          },

        },

        {

          $limit: 5,

        },

      ]);

    await Company.populate(
      topCompanies,
      {
        path: "_id",
        select: "companyName logo",
      }
    );

    const topJobs =
      await Application.aggregate([

        {

          $group: {

            _id: "$job",

            applications: {
              $sum: 1,
            },

          },

        },

        {

          $sort: {
            applications: -1,
          },

        },

        {

          $limit: 5,

        },

      ]);

    await Job.populate(
      topJobs,
      {
        path: "_id",
        select: "title",
      }
    );

    const topStudents =
      await Placement.find()

        .populate(
          "student",
          "fullName department cgpa"
        )

        .limit(5);

    res.json({

      topCompanies,

      topJobs,

      topStudents,

    });

  } catch (error) {

    res.status(500).json({

      message: error.message,

    });

  }

};

const getChartAnalytics = async (req, res) => {
  try {
    const placements = await Placement.find()
      .populate("student");

    const departmentMap = {};

    placements.forEach((placement) => {
      const dept =
        placement.student?.department || "Others";

      departmentMap[dept] =
        (departmentMap[dept] || 0) + 1;
    });

    res.json({
      departments: Object.keys(departmentMap),
      placements: Object.values(departmentMap),
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
module.exports = {

  getStudents,
  deleteStudent,
  getCompanies,
  deleteCompany,
    getPlacementAnalytics,
    getChartAnalytics,
    getActivityTimeline,
    getDashboardHighlights,

};