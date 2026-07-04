const User = require("../models/User");
const Student = require("../models/Student");
const Company = require("../models/Company");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// =====================================
// Register User
// =====================================

const registerUser = async (req, res) => {
  try {

    const {
      name,
      companyName,
      email,
      password,
      role,
      department,
      cgpa,
      location,
    } = req.body;

    // Check Existing User

    const existingUser =
      await User.findOne({
        email,
      });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // Hash Password

    const hashedPassword =
      await bcrypt.hash(password, 10);

    // Create User

    const user = await User.create({
      name:
        role === "company"
          ? companyName
          : name,

      email,

      password: hashedPassword,

      role,
    });

    // =====================================
    // Student Profile
    // =====================================

    if (role === "student") {

      await Student.create({

        user: user._id,

        fullName: name,

        email,

        department,

        cgpa,

      });

    }

    // =====================================
    // Company Profile
    // =====================================

    if (role === "company") {

      await Company.create({

        user: user._id,

        companyName,

        email,

        location,

      });

    }

    res.status(201).json({

      success: true,

      message:
        "Registration Successful",

      user,

    });

  } catch (error) {

    

    res.status(500).json({

      success: false,

      message: error.message,

    });

  }
};

// =====================================
// Login User
// =====================================

const loginUser = async (req, res) => {
  try {

    const { email, password } = req.body;

    const user = await User.findOne({
      email,
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid Credentials",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid Credentials",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      success: true,
      token,
      role: user.role,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {

    

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ========================================
// Change Password
// ========================================



const changePassword = async (req, res) => {
  try {

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {

      return res.status(400).json({
        success: false,
        message: "Please provide both current and new password.",
      });

    }

    const user = await User.findById(req.user._id);

    if (!user) {

      return res.status(404).json({
        success: false,
        message: "User not found.",
      });

    }

    const isMatch = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isMatch) {

      return res.status(400).json({
        success: false,
        message: "Current password is incorrect.",
      });

    }

    const hashedPassword = await bcrypt.hash(
      newPassword,
      10
    );

    user.password = hashedPassword;

    await user.save();

    res.json({
      success: true,
      message: "Password changed successfully.",
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};
// =====================================
// Exports
// =====================================

module.exports = {
  registerUser,
  loginUser,
  changePassword,
};