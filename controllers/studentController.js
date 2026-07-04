const Student = require("../models/Student");
const Application = require("../models/Application");
const Job = require("../models/Job");

// Create Student Profile
const createStudentProfile = async (req, res) => {
  try {
    const existingProfile = await Student.findOne({
      user: req.user._id,
    });

    if (existingProfile) {
      return res.status(400).json({
        message: "Profile already exists",
      });
    }

    const student = await Student.create({
      user: req.user._id,
      ...req.body,
    });

    res.status(201).json(student);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get Student Profile
const getStudentProfile = async (req, res) => {
  try {
    const student = await Student.findOne({
      user: req.user._id,
    });

    if (!student) {
      return res.status(404).json({
        message: "Student profile not found",
      });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Update Student Profile
const updateStudentProfile = async (req, res) => {
  try {
    const student = await Student.findOneAndUpdate(
      { user: req.user._id },
      req.body,
      {
        new: true,
      }
    );

    if (!student) {
      return res.status(404).json({
        message: "Profile not found",
      });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// =========================================
// Upload Resume
// =========================================

const uploadResume = async (req, res) => {
  try {
    const student = await Student.findOne({
      user: req.user._id,
    });

    if (!student) {
      return res.status(404).json({
        message: "Student profile not found",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Please upload a PDF resume",
      });
    }

    student.resume = req.file.filename;

    await student.save();

    res.json({
      success: true,
      message: "Resume uploaded successfully",
      resume: req.file.filename,
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};
// =========================================
// Upload Profile Image
// =========================================

const uploadProfileImage = async (req, res) => {
  try {

    const student = await Student.findOne({
      user: req.user._id,
    });

    if (!student) {
      return res.status(404).json({
        message: "Student profile not found",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Please upload an image",
      });
    }

    student.profileImage = req.file.filename;

    await student.save();

    res.json({
      success: true,
      message: "Profile image uploaded successfully",
      profileImage: req.file.filename,
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};
// =========================================
// Student Dashboard
// =========================================

const getStudentDashboard = async (req, res) => {
  try {

    const student = await Student.findOne({
      user: req.user._id,
    });

    if (!student) {
      return res.status(404).json({
        message: "Student profile not found",
      });
    }

    const applications = await Application.find({
      student: student._id,
    }).populate({
      path: "job",
      populate: {
        path: "company",
        select: "companyName",
      },
    });

    const availableJobs = await Job.countDocuments();

    const interviews = applications.filter(
      (app) => app.status === "Interview Scheduled"
    ).length;

    const offers = applications.filter(
      (app) => app.status === "Selected"
    ).length;

    const shortlisted = applications.filter(
      (app) => app.status === "Shortlisted"
    ).length;

    const pending = applications.filter(
      (app) => app.status === "Pending"
    ).length;

    const rejected = applications.filter(
      (app) => app.status === "Rejected"
    ).length;

    const recommendedJobs = await Job.find({
  isActive: true,
})
  .populate("company", "companyName logo")
  .sort({ createdAt: -1 })
  .limit(3);

  const recentApplications = await Application.find({
  student: student._id,
})
.populate({
  path: "job",
  populate: {
    path: "company",
    select: "companyName",
  },
})
.sort({ createdAt: -1 })
.limit(5);


const upcomingInterviews = applications.filter(
  (app) => app.status === "Interview Scheduled"
);

res.json({
  availableJobs,

  applications: applications.length,

  interviews,

  offers,

  recentApplications,

  upcomingInterviews,

  recommendedJobs,

  chartData: {
    applied: applications.length,
    shortlisted,
    interviews,
    selected: offers,
    rejected,
  },
});

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};

module.exports = {
  createStudentProfile,
  getStudentProfile,
  updateStudentProfile,
  uploadResume,
  uploadProfileImage,
  getStudentDashboard,
};