const express = require("express");
const mongoose = require("mongoose");
const AnalyticsRecord = require("../models/AnalyticsRecord");
const { protect, requireAdmin } = require("../middleware/auth");
const {
  CATEGORIES,
  buildMatchQuery,
  buildSort,
  resolveDateRange,
  parseCsv,
  toCsv,
} = require("../utils/analyticsQuery");

const router = express.Router();

router.use(protect);

function payloadFromBody(body) {
  const { title, category, revenue, users, date } = body;

  if (!title || !category || revenue === undefined || users === undefined) {
    const error = new Error("title, category, revenue, and users are required");
    error.status = 400;
    throw error;
  }

  if (!CATEGORIES.includes(category)) {
    const error = new Error("category must be Sales, Marketing, or Operations");
    error.status = 400;
    throw error;
  }

  return {
    title: String(title).trim(),
    category,
    revenue: Number(revenue),
    users: Number(users),
    date: date ? new Date(date) : new Date(),
  };
}

router.get("/", async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
    const match = buildMatchQuery(req.query);
    const sort = buildSort(req.query);
    const skip = (page - 1) * limit;

    const [records, total] = await Promise.all([
      AnalyticsRecord.find(match).sort(sort).skip(skip).limit(limit),
      AnalyticsRecord.countDocuments(match),
    ]);

    res.json({
      data: records,
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      sort: Object.keys(sort)[0],
      order: Object.values(sort)[0] === 1 ? "asc" : "desc",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch analytics records",
      error: error.message,
    });
  }
});

router.get("/stats", async (req, res) => {
  try {
    const match = buildMatchQuery(req.query);
    const { from, to, preset } = resolveDateRange(req.query);

    const [summary] = await AnalyticsRecord.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$revenue" },
          totalUsers: { $sum: "$users" },
          totalRecords: { $sum: 1 },
          averageRevenue: { $avg: "$revenue" },
          averageUsers: { $avg: "$users" },
        },
      },
    ]);

    const categoryBreakdown = await AnalyticsRecord.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$category",
          totalRevenue: { $sum: "$revenue" },
          totalUsers: { $sum: "$users" },
          recordCount: { $sum: 1 },
          averageRevenue: { $avg: "$revenue" },
        },
      },
      { $sort: { totalRevenue: -1 } },
    ]);

    const revenueOverTime = await AnalyticsRecord.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          revenue: { $sum: "$revenue" },
          users: { $sum: "$users" },
          records: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const rangeStart = from || new Date(0);
    const rangeEnd = to || new Date();
    const duration = Math.max(1, rangeEnd.getTime() - rangeStart.getTime());
    const prevEnd = new Date(rangeStart.getTime() - 1);
    const prevStart = new Date(prevEnd.getTime() - duration);

    const [periodComparison] = await AnalyticsRecord.aggregate([
      {
        $facet: {
          current: [
            { $match: match },
            {
              $group: {
                _id: null,
                revenue: { $sum: "$revenue" },
                users: { $sum: "$users" },
                records: { $sum: 1 },
              },
            },
          ],
          previous: [
            {
              $match: {
                date: { $gte: prevStart, $lte: prevEnd },
                ...(match.category ? { category: match.category } : {}),
              },
            },
            {
              $group: {
                _id: null,
                revenue: { $sum: "$revenue" },
                users: { $sum: "$users" },
                records: { $sum: 1 },
              },
            },
          ],
        },
      },
    ]);

    const current = periodComparison?.current[0] || { revenue: 0, users: 0, records: 0 };
    const previous = periodComparison?.previous[0] || { revenue: 0, users: 0, records: 0 };

    const growth = (curr, prev) => {
      if (!prev) return curr ? 100 : 0;
      return Number((((curr - prev) / prev) * 100).toFixed(1));
    };

    const normalizedCategories = CATEGORIES.map((name) => {
      const found = categoryBreakdown.find((item) => item._id === name);
      return {
        category: name,
        totalRevenue: found?.totalRevenue || 0,
        totalUsers: found?.totalUsers || 0,
        recordCount: found?.recordCount || 0,
        averageRevenue: found?.averageRevenue || 0,
      };
    });

    res.json({
      range: { preset, from, to },
      totalRevenue: summary?.totalRevenue || 0,
      totalUsers: summary?.totalUsers || 0,
      totalRecords: summary?.totalRecords || 0,
      averageRevenue: summary?.averageRevenue || 0,
      averageUsers: summary?.averageUsers || 0,
      categoryBreakdown: normalizedCategories,
      revenueOverTime: revenueOverTime.map((item) => ({
        date: item._id,
        revenue: item.revenue,
        users: item.users,
        records: item.records,
      })),
      growth: {
        revenue: growth(current.revenue, previous.revenue),
        users: growth(current.users, previous.users),
        records: growth(current.records, previous.records),
        averageRevenue: growth(
          current.records ? current.revenue / current.records : 0,
          previous.records ? previous.revenue / previous.records : 0
        ),
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to compute analytics statistics",
      error: error.message,
    });
  }
});

router.get("/export", async (req, res) => {
  try {
    const match = buildMatchQuery(req.query);
    const sort = buildSort(req.query);
    const records = await AnalyticsRecord.find(match).sort(sort).lean();
    const csv = toCsv(records);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="datapulse-records.csv"`
    );
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: "Failed to export CSV", error: error.message });
  }
});

router.post("/import", async (req, res) => {
  try {
    const csvText = req.body.csv || req.body;
    if (typeof csvText !== "string" || !csvText.trim()) {
      return res.status(400).json({
        message: "Send CSV text in a JSON body: { \"csv\": \"title,category,...\" }",
      });
    }

    const rows = parseCsv(csvText);
    if (!rows.length) {
      return res.status(400).json({ message: "No valid CSV rows found" });
    }

    const inserted = await AnalyticsRecord.insertMany(rows);
    res.status(201).json({
      message: `Imported ${inserted.length} records`,
      count: inserted.length,
    });
  } catch (error) {
    res.status(400).json({ message: error.message || "CSV import failed" });
  }
});

router.post("/", async (req, res) => {
  try {
    const record = await AnalyticsRecord.create(payloadFromBody(req.body));
    res.status(201).json(record);
  } catch (error) {
    res.status(error.status || 400).json({
      message: error.message || "Failed to create analytics record",
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid record id" });
    }

    const updated = await AnalyticsRecord.findByIdAndUpdate(
      req.params.id,
      payloadFromBody(req.body),
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Record not found" });
    }

    res.json(updated);
  } catch (error) {
    res.status(error.status || 400).json({
      message: error.message || "Failed to update analytics record",
    });
  }
});

router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid record id" });
    }

    const deleted = await AnalyticsRecord.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Record not found" });
    }

    res.json({
      message: "Record deleted successfully",
      id: req.params.id,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete analytics record",
      error: error.message,
    });
  }
});

module.exports = router;
