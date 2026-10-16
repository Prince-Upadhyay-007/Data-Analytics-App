const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const analyticsRoutes = require("./routes/analyticsRoutes");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const AnalyticsRecord = require("./models/AnalyticsRecord");
const User = require("./models/User");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/datapulse";

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    service: "DataPulse Analytics API",
    endpoints: {
      register: "POST /api/auth/register",
      login: "POST /api/auth/login",
      me: "GET /api/auth/me",
      adminUsers: "GET /api/admin/users (Admin only)",
      records: "GET /api/analytics?page=1&limit=10&q=&category=&sort=date&order=desc&range=30",
      stats: "GET /api/analytics/stats?range=30",
      export: "GET /api/analytics/export",
      import: "POST /api/analytics/import",
    },
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/analytics", analyticsRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error", error: err.message });
});

const SAMPLE_RECORDS = [
  {
    title: "Q3 Software Subscription Sale",
    category: "Sales",
    revenue: 1250.5,
    users: 45,
    date: daysAgo(2),
  },
  {
    title: "Enterprise License Renewal",
    category: "Sales",
    revenue: 8420.0,
    users: 120,
    date: daysAgo(8),
  },
  {
    title: "Inbound Lead Campaign - LinkedIn",
    category: "Marketing",
    revenue: 3180.75,
    users: 86,
    date: daysAgo(5),
  },
  {
    title: "Product Launch Email Blast",
    category: "Marketing",
    revenue: 1960.25,
    users: 210,
    date: daysAgo(12),
  },
  {
    title: "Paid Search Optimization Sprint",
    category: "Marketing",
    revenue: 2745.0,
    users: 64,
    date: daysAgo(18),
  },
  {
    title: "Cloud Infrastructure Cost Recovery",
    category: "Operations",
    revenue: 980.4,
    users: 18,
    date: daysAgo(3),
  },
  {
    title: "Support Workflow Automation",
    category: "Operations",
    revenue: 1560.0,
    users: 32,
    date: daysAgo(15),
  },
  {
    title: "Q2 Upsell from Existing Accounts",
    category: "Sales",
    revenue: 4675.9,
    users: 58,
    date: daysAgo(22),
  },
  {
    title: "Partner Referral Program",
    category: "Sales",
    revenue: 2210.0,
    users: 27,
    date: daysAgo(28),
  },
  {
    title: "Warehouse Process Efficiency Gain",
    category: "Operations",
    revenue: 1340.6,
    users: 41,
    date: daysAgo(35),
  },
];

function daysAgo(n) {
  const date = new Date();
  date.setDate(date.getDate() - n);
  date.setHours(10, 0, 0, 0);
  return date;
}

async function seedUsers() {
  const count = await User.countDocuments();
  if (count > 0) {
    console.log(`Users already exist (${count})`);
    return;
  }

  await User.create([
    {
      name: "Alex Rivera",
      email: "admin@datapulse.com",
      password: "Admin@123",
      role: "Admin",
    },
    {
      name: "Jordan Lee",
      email: "analyst@datapulse.com",
      password: "Analyst@123",
      role: "Analyst",
    },
  ]);

  console.log("Seeded default demo users.");
}

async function seedDatabaseIfEmpty() {
  // Never delete existing user data during startup. If the collection already
  // contains records, leave it untouched and report the count.
  const count = await AnalyticsRecord.countDocuments();
  if (count > 0) {
    console.log(`Database already has ${count} analytics records; preserving them`);
    return;
  }

  await AnalyticsRecord.insertMany(SAMPLE_RECORDS);
  console.log(`Seeded ${SAMPLE_RECORDS.length} sample analytics records`);
}

async function start() {
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("MongoDB connected:", MONGO_URI);
    await seedUsers();
    await seedDatabaseIfEmpty();

    app.listen(PORT, () => {
      console.log(`DataPulse API running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    console.error(
      "Make sure MongoDB is running locally, then restart the server."
    );
    process.exit(1);
  }
}

start();
