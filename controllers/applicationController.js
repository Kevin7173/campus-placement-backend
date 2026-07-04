const sendEmail = require("../utils/sendEmail");

const Application = require("../models/Application");
const Student = require("../models/Student");
const Company = require("../models/Company");
const Job = require("../models/Job");
const Placement = require("../models/Placement");
const Notification = require("../models/Notification");

// ========================================
// Apply for Job
// ========================================

const applyJob = async (req, res) => {

  try {

    const student = await Student.findOne({
      user: req.user._id,
    });

    if (!student) {

      return res.status(404).json({
        message: "Student profile not found",
      });

    }

    const job = await Job.findById(
      req.params.jobId
    );

    if (!job) {

      return res.status(404).json({
        message: "Job not found",
      });

    }

    if (!job.isActive) {

      return res.status(400).json({
        message:
          "This job is no longer accepting applications.",
      });

    }

    const alreadyApplied =
      await Application.findOne({

        student: student._id,

        job: job._id,

      });

    if (alreadyApplied) {

      return res.status(400).json({

        message:
          "You have already applied for this job",

      });

    }

    const application =
      await Application.create({

        student: student._id,

        job: job._id,

      });

    // Notify Company

    const company =
      await Company.findById(
        job.company
      );

    if (company?.user) {

      await Notification.create({

        user: company.user,

        title: "New Job Application",

        message: `${student.fullName} applied for ${job.title}.`,

        type: "Application",

      });

    }

    res.status(201).json({

      success: true,

      application,

    });

  } catch (error) {

    console.error(error);

    res.status(500).json({

      message: error.message,

    });

  }

};

// ========================================
// Student Applications
// ========================================

const getStudentApplications = async (
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
        message: "Student profile not found",
      });

    }

    const applications =
      await Application.find({

        student: student._id,

      })

        .populate({

          path: "job",

          select:
            "title salary location employmentType deadline company",

          populate: {

            path: "company",

            select:
              "companyName location logo",

          },

        })

        .sort({
          createdAt: -1,
        });

    res.json(applications);

  } catch (error) {

    console.error(error);

    res.status(500).json({

      message: error.message,

    });

  }

};

// ========================================
// Company Applications
// ========================================

const getCompanyApplications = async (
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

    const jobs =
      await Job.find({
        company: company._id,
      });

    const jobIds =
      jobs.map(
        (job) => job._id
      );

    const applications =
      await Application.find({

        job: {
          $in: jobIds,
        },

      })

        .populate({

          path: "student",

          select:
            "fullName email department cgpa phone skills resume profileImage",

        })

        .populate({

          path: "job",

          select:
            "title salary employmentType location deadline company",

          populate: {

            path: "company",

            select:
              "companyName location email logo",

          },

        })

        .sort({
          createdAt: -1,
        });

    res.json(applications);

  } catch (error) {

    console.error(error);

    res.status(500).json({

      message: error.message,

    });

  }

};

// ========================================
// Update Application Status
// ========================================

const updateApplicationStatus = async (
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
        message: "Company profile not found",
      });

    }

    const application =
      await Application.findById(
        req.params.id
      )

        .populate({

          path: "job",

          select:
            "title salary company",

          populate: {

            path: "company",

            select:
              "companyName email logo",

          },

        })

        .populate({

          path: "student",

          select:
            "fullName email",

        });

    if (!application) {

      return res.status(404).json({
        message: "Application not found",
      });

    }

    // Verify company ownership

    if (

      application.job.company._id.toString() !==
      company._id.toString()

    ) {

      return res.status(403).json({

        message: "Access denied",

      });

    }

    // Update application fields

    application.status =
      req.body.status;

    application.interviewDate =
      req.body.interviewDate ||
      application.interviewDate;

    application.interviewTime =
      req.body.interviewTime ||
      application.interviewTime;

    application.meetingLink =
      req.body.meetingLink ||
      application.meetingLink;

    application.remarks =
      req.body.remarks ||
      application.remarks;

    await application.save();

    // Create Placement Automatically

    if (
      application.status === "Selected"
    ) {

      const existingPlacement =
        await Placement.findOne({

          application:
            application._id,

        });

      if (!existingPlacement) {

        await Placement.create({

          student:
            application.student._id,

          company:
            company._id,

          job:
            application.job._id,

          application:
            application._id,

          status:
            "Offer Sent",

          package:
            application.job.salary || "",

        });

      }

    }

    const studentProfile =
      await Student.findById(
        application.student._id
      );

    const studentEmail =
      application.student.email;

    const studentName =
      application.student.fullName;

    const companyName =
      application.job.company.companyName;

    const jobTitle =
      application.job.title;

    let subject = "";

    let html = "";

    switch (application.status) {
            case "Shortlisted":

        subject =
          "🎉 Congratulations! You Have Been Shortlisted";

        html = `
          <h2>Congratulations ${studentName}!</h2>

          <p>
            You have been shortlisted for
            <strong>${jobTitle}</strong>
            at
            <strong>${companyName}</strong>.
          </p>

          <p>
            Our recruitment team will contact you shortly.
          </p>
        `;

        if (studentProfile?.user) {

          await Notification.create({

            user: studentProfile.user,

            title: "Application Shortlisted",

            message: `You have been shortlisted for ${jobTitle}.`,

            type: "Application",

          });

        }

        break;

      case "Interview Scheduled":

        subject =
          "📅 Interview Scheduled";

        html = `
          <h2>Interview Invitation</h2>

          <p>Hello ${studentName},</p>

          <p>
            Your interview for
            <strong>${jobTitle}</strong>
            has been scheduled.
          </p>

          <p>
            <strong>Date:</strong>
            ${application.interviewDate || "-"}

          </p>

          <p>
            <strong>Time:</strong>
            ${application.interviewTime || "-"}

          </p>

          <p>
            <strong>Meeting Link:</strong><br>

            ${application.meetingLink || "-"}

          </p>

          <p>
            Best wishes!
          </p>
        `;

        if (studentProfile?.user) {

          await Notification.create({

            user: studentProfile.user,

            title: "Interview Scheduled",

            message: `Your interview for ${jobTitle} has been scheduled.`,

            type: "Interview",

          });

        }

        break;

      case "Selected":

        subject =
          "🎉 Congratulations! You Are Selected";

        html = `
          <h2>Congratulations ${studentName}!</h2>

          <p>
            We are pleased to inform you that you have been selected for

            <strong>${jobTitle}</strong>

            at

            <strong>${companyName}</strong>.
          </p>

          <p>

            Your placement record has been updated successfully.

          </p>

          <p>

            We wish you a successful career ahead!

          </p>
        `;

        if (studentProfile?.user) {

          await Notification.create({

            user: studentProfile.user,

            title: "Congratulations!",

            message: `You have been selected for ${jobTitle} at ${companyName}.`,

            type: "Placement",

          });

        }

        break;

      case "Rejected":

        subject =
          "Application Status Update";

        html = `
          <h2>Hello ${studentName},</h2>

          <p>

            Thank you for applying for

            <strong>${jobTitle}</strong>.

          </p>

          <p>

            Unfortunately, you were not selected for this opportunity.

          </p>

          <p>

            We wish you all the very best for your future.

          </p>
        `;

        if (studentProfile?.user) {

          await Notification.create({

            user: studentProfile.user,

            title: "Application Update",

            message: `Your application for ${jobTitle} was not selected.`,

            type: "Application",

          });

        }

        break;

      default:

        break;

    }
        // =====================================
    // Send Email
    // =====================================

    if (subject && html) {

      await sendEmail({

        to: studentEmail,

        subject,

        html,

      });

    }

    res.json({

      success: true,

      message: "Application updated successfully",

      application,

    });

  } catch (error) {

    console.error(error);

    res.status(500).json({

      message: error.message,

    });

  }

};

// ========================================
// Get Applicants By Job
// ========================================

const getApplicantsByJob = async (req, res) => {

  try {

    const company =
      await Company.findOne({
        user: req.user._id,
      });

    if (!company) {

      return res.status(404).json({

        message: "Company profile not found",

      });

    }

    const job =
      await Job.findById(req.params.jobId);

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

    const applicants =
      await Application.find({

        job: job._id,

      })

        .populate(
          "student",
          "fullName email department cgpa phone skills resume profileImage"
        )

        .sort({

          createdAt: -1,

        });

    res.json(applicants);

  } catch (error) {

    console.error(error);

    res.status(500).json({

      message: error.message,

    });

  }

};

// ========================================
// Exports
// ========================================

module.exports = {

  applyJob,

  getStudentApplications,

  getCompanyApplications,

  updateApplicationStatus,

  getApplicantsByJob,

};
