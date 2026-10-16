const CATEGORIES = ["Sales", "Marketing", "Operations"];
const SORT_FIELDS = ["date", "revenue", "users", "title", "category"];

function startOfDay(date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function endOfDay(date) {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}

function daysAgo(n) {
  const date = new Date();
  date.setDate(date.getDate() - n);
  return startOfDay(date);
}

function resolveDateRange(query = {}) {
  const preset = String(query.range || "").toLowerCase();
  let from = query.from ? startOfDay(query.from) : null;
  let to = query.to ? endOfDay(query.to) : null;

  if (!from && !to) {
    if (preset === "7") {
      from = daysAgo(7);
      to = endOfDay(new Date());
    } else if (preset === "30") {
      from = daysAgo(30);
      to = endOfDay(new Date());
    } else if (preset === "90") {
      from = daysAgo(90);
      to = endOfDay(new Date());
    }
  }

  return { from, to, preset: preset || "all" };
}

function buildMatchQuery(query = {}) {
  const match = {};
  const { from, to } = resolveDateRange(query);

  if (from || to) {
    match.date = {};
    if (from) match.date.$gte = from;
    if (to) match.date.$lte = to;
  }

  if (query.category && CATEGORIES.includes(query.category)) {
    match.category = query.category;
  }

  const q = String(query.q || "").trim();
  if (q) {
    const numeric = Number(q);
    match.$or = [
      { title: { $regex: q, $options: "i" } },
      { category: { $regex: q, $options: "i" } },
    ];
    if (!Number.isNaN(numeric) && q !== "") {
      match.$or.push({ revenue: numeric }, { users: numeric });
    }
  }

  return match;
}

function buildSort(query = {}) {
  const field = SORT_FIELDS.includes(query.sort) ? query.sort : "date";
  const order = String(query.order || "desc").toLowerCase() === "asc" ? 1 : -1;
  return { [field]: order };
}

function parseCsv(text) {
  const raw = String(text || "").replace(/^\uFEFF/, "").trim();
  if (!raw) return [];

  const lines = raw.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return [];

  const headers = splitCsvLine(lines[0]).map((h) => h.trim().toLowerCase());
  const required = ["title", "category", "revenue", "users"];
  const missing = required.filter((key) => !headers.includes(key));
  if (missing.length) {
    throw new Error(`CSV is missing columns: ${missing.join(", ")}`);
  }

  return lines.slice(1).map((line, index) => {
    const cols = splitCsvLine(line);
    const row = {};
    headers.forEach((header, i) => {
      row[header] = cols[i] == null ? "" : cols[i].trim();
    });

    if (!row.title || !row.category || row.revenue === "" || row.users === "") {
      throw new Error(`Row ${index + 2} is missing required values`);
    }

    if (!CATEGORIES.includes(row.category)) {
      throw new Error(
        `Row ${index + 2}: category must be Sales, Marketing, or Operations`
      );
    }

    return {
      title: row.title,
      category: row.category,
      revenue: Number(row.revenue),
      users: Number(row.users),
      date: row.date ? new Date(row.date) : new Date(),
    };
  });
}

function splitCsvLine(line) {
  const result = [];
  let current = "";
  let quoted = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (quoted && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === "," && !quoted) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

function toCsv(records) {
  const header = "title,category,revenue,users,date";
  const rows = records.map((record) =>
    [
      csvEscape(record.title),
      csvEscape(record.category),
      record.revenue,
      record.users,
      new Date(record.date).toISOString().slice(0, 10),
    ].join(",")
  );
  return [header, ...rows].join("\n");
}

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

module.exports = {
  CATEGORIES,
  buildMatchQuery,
  buildSort,
  resolveDateRange,
  parseCsv,
  toCsv,
};
