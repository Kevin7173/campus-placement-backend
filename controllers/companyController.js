const Company = require("../models/Company");
const Job = require("../models/Job");
const Application = require("../models/Application");
// Create Company Profile
const createCompanyProfile = async (req, res) => {
  try {
    const existingProfile = await Company.findOne({
      user: req.user._id,
    });

    if (existingProfile) {
      return res.status(400).json({
        message: "Company profile already exists",
      });
    }

    const company = await Company.create({
      user: req.user._id,
      ...req.body,
    });

    res.status(201).json(company);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get Company Profile
const getCompanyProfile = async (req, res) => {
  try {
    const company = await Company.findOne({
      user: req.user._id,
    });

    if (!company) {
      return res.status(404).json({
        message: "Company profile not found",
      });
    }

    res.json(company);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Update Company Profile
const updateCompanyProfile = async (req, res) => {
  try {
    const company = await Company.findOneAndUpdate(
      {
        user: req.user._id,
      },
      req.body,
      {
        new: true,
      }
    );

    if (!company) {
      return res.status(404).json({
        message: "Company profile not found",
      });
    }

    res.json(company);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ======================================
// Upload Company Logo
// ======================================

const uploadCompanyLogo = async (
  req,
  res
) => {
  try {

    const company =
      await Company.findOne({
        user: req.user._id,
      });

    if (!company) {
      return res.status(404).json({
        message:
          "Company profile not found",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message:
          "Please upload a logo",
      });
    }

    company.logo = req.file.filename;

    await company.save();

    res.json({
      success: true,
      message:
        "Logo uploaded successfully",
      logo: req.file.filename,
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};

// ======================================
// Company Dashboard
// ======================================

const getCompanyDashboard = async (req, res) => {
  try {

    const company = await Company.findOne({
      user: req.user._id,
    });

    if (!company) {
      return res.status(404).json({
        message: "Company profile not found",
      });
    }

    const jobs = await Job.find({
      company: company._id,
    });

    const jobIds = jobs.map(job => job._id);

    const applications = await Application.find({
      job: {
        $in: jobIds,
      },
    })
      .populate("student")
      .populate("job");

    const interviews = applications.filter(
      app => app.status === "Interview Scheduled"
    ).length;

    const selected = applications.filter(
      app => app.status === "Selected"
    ).length;

    const shortlisted = applications.filter(
      app => app.status === "Shortlisted"
    ).length;

    res.json({
      company,

      totalJobs: jobs.length,

      totalApplicants: applications.length,

      interviews,

      shortlisted,

      selected,

      recentApplicants: applications
        .sort(
          (a, b) =>
            new Date(b.createdAt) -
            new Date(a.createdAt)
        )
        .slice(0, 5),

      recentJobs: jobs
        .sort(
          (a, b) =>
            new Date(b.createdAt) -
            new Date(a.createdAt)
        )
        .slice(0, 5),
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};

// ======================================
// Company Interviews
// ======================================

const getCompanyInterviews = async (req, res) => {
  try {

    const company = await Company.findOne({
      user: req.user._id,
    });

    if (!company) {
      return res.status(404).json({
        message: "Company profile not found",
      });
    }

    const jobs = await Job.find({
      company: company._id,
    });

    const jobIds = jobs.map(job => job._id);

    const interviews = await Application.find({
      job: { $in: jobIds },
      status: "Interview Scheduled",
    })
      .populate(
        "student",
        "fullName email profileImage department cgpa"
      )
      .populate(
        "job",
        "title"
      )
      .sort({
        interviewDate: 1,
      });

    res.json(interviews);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};

module.exports = {
  createCompanyProfile,
  getCompanyProfile,
  updateCompanyProfile,
  uploadCompanyLogo,
  getCompanyDashboard,
  getCompanyInterviews,
};