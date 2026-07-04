const Job = require("../models/Job");
const Company = require("../models/Company");
const Application = require("../models/Application");

// ==========================
// Create Job
// ==========================
const createJob = async (req, res) => {
  try {
    const company = await Company.findOne({
      user: req.user._id,
    });

    if (!company) {
      return res.status(404).json({
        message: "Company profile not found",
      });
    }

    const job = await Job.create({
      company: company._id,
      ...req.body,
    });

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ==========================
// Get All Jobs
// ==========================
const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate(
  "company",
  "companyName location logo"
)
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ==========================
// Get Logged-in Company's Jobs
// ==========================

const getCompanyJobs = async (req, res) => {
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
    }).sort({
      createdAt: -1,
    });

    const jobsWithApplicants = await Promise.all(

      jobs.map(async (job) => {

        const applicantCount =
          await Application.countDocuments({
            job: job._id,
          });

        return {
          ...job.toObject(),
          applicantCount,
        };

      })

    );

    res.json(jobsWithApplicants);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};

// ==========================
// Get Single Job
// ==========================
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate("company");

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    res.json(job);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ==========================
// Update Job (Only Owner Company)
// ==========================
const updateJob = async (req, res) => {
  try {
    const company = await Company.findOne({
      user: req.user._id,
    });

    if (!company) {
      return res.status(404).json({
        message: "Company profile not found",
      });
    }

    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    // Check ownership
    if (job.company.toString() !== company._id.toString()) {
      return res.status(403).json({
        message: "You are not authorized to modify this job",
      });
    }

    Object.assign(job, req.body);

    await job.save();

    res.json(job);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ==========================
// Toggle Job Status
// ==========================

const toggleJobStatus = async (req, res) => {
  try {

    const company = await Company.findOne({
      user: req.user._id,
    });

    if (!company) {
      return res.status(404).json({
        message: "Company not found",
      });
    }

    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    if (
      job.company.toString() !==
      company._id.toString()
    ) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    job.isActive = !job.isActive;

    await job.save();

    res.json(job);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};

// ==========================
// Delete Job (Only Owner Company)
// ==========================
const deleteJob = async (req, res) => {
  try {
    const company = await Company.findOne({
      user: req.user._id,
    });

    if (!company) {
      return res.status(404).json({
        message: "Company profile not found",
      });
    }

    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    // Check ownership
    if (job.company.toString() !== company._id.toString()) {
      return res.status(403).json({
        message: "You are not authorized to delete this job",
      });
    }

    await job.deleteOne();

    res.json({
      message: "Job deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createJob,
  getJobs,
  getCompanyJobs,
  getJobById,
  updateJob,
  toggleJobStatus,
  deleteJob,
};