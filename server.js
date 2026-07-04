const express = require(
  "express"
);

const cors = require(
  "cors"
);

const dotenv = require(
  "dotenv"
);

const connectDB = require(
  "./config/db"
);

const path = require("path");

const studentRoutes = require("./routes/studentRoutes");

const companyRoutes = require("./routes/companyRoutes");

const jobRoutes = require("./routes/jobRoutes");

const applicationRoutes = require("./routes/applicationRoutes");

const errorHandler = require("./middleware/errorMiddleware");

const adminDashboardRoutes =
require("./routes/adminDashboardRoutes");

const adminRoutes =
require("./routes/adminRoutes");

const placementRoutes =
require("./routes/placementRoutes");

const notificationRoutes = require("./routes/notificationRoutes");

dotenv.config();

connectDB();

const app = express();

const cors = require("cors");

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://campus-placement-frontend-theta.vercel.app"
    ],
    credentials: true,
  })
);

app.use(express.json());

app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "uploads")
  )
);

app.get("/", (req, res) => {
  res.send(
    "Campus Placement API Running"
  );
});

app.use(
  "/api/auth",
  require(
    "./routes/authRoutes"
  )
);

app.use("/api/student", studentRoutes);

app.use("/api/company", companyRoutes);

app.use("/api/jobs", jobRoutes);

app.use("/api/applications", applicationRoutes);

app.use(errorHandler);

app.use(
  "/api/admin/dashboard",
  adminDashboardRoutes
);

app.use(
"/api/admin",
adminRoutes
);

app.use(
"/api/placements",
placementRoutes
);

app.use(
  "/api/notifications",
  notificationRoutes
);

const PORT =
  process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});