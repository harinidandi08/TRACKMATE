/*require("dotenv").config();

const express = require("express");
const cors = require("cors");
const db = require("./database");

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json({ limit: "1mb" }));

const PORT = process.env.PORT || 5000;

function validDate(value) {
  return typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(value));
}
function validText(value, max = 120) {
  return typeof value === "string" &&
    value.trim().length > 0 &&
    value.trim().length <= max;
}

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "HealthSphere 360" });
});

// LAB REPORTS: Only user-confirmed values are saved.
app.get("/api/labs", (req, res) => {
  const patientId = String(req.query.patientId || "demo-patient");

  res.json(
    db.prepare(`
      SELECT * FROM lab_results
      WHERE patient_id = ?
      ORDER BY report_date DESC, id DESC
    `).all(patientId)
  );
  });

app.post("/api/labs", (req, res) => {
  const {
    patientId = "demo-patient",
    testName,
    value,
    unit,
    referenceMin,
    referenceMax,
    bloodGroup,
    reportDate,
    confirmed
  } = req.body;

  if (!validText(patientId, 100) ||
      !validText(testName) ||
      !validText(unit, 40) ||
      !Number.isFinite(value) ||
      !validDate(reportDate) ||
      confirmed !== true) {
    return res.status(400).json({
const Database = require("better-sqlite3");
const path = require("path");
const db = new Database(path.join(__dirname, "healthsphere.db"));
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
db.exec(`
  CREATE TABLE IF NOT EXISTS lab_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id TEXT NOT NULL,
    test_name TEXT NOT NULL,
    value REAL NOT NULL,
    unit TEXT NOT NULL,
    reference_min REAL,
    reference_max REAL,
    blood_group TEXT,
    report_date TEXT NOT NULL,
    confirmed INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  ');

  CREATE TABLE IF NOT EXISTS medicines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    barcode TEXT,
    batch_number TEXT NOT NULL,
    expiry_date TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0 CHECK(quantity >= 0),
    minimum_stock INTEGER NOT NULL DEFAULT 10,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS environment_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    location TEXT NOT NULL,
    temperature REAL,
    aqi INTEGER,
    recorded_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

module.exports = db;
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const db = require("./database");

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json({ limit: "1mb" }));

const PORT = process.env.PORT || 5000;

function validDate(value) {
  return typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(value));
}

function validText(value, max = 120) {
  return typeof value === "string" &&
    value.trim().length > 0 &&
    value.trim().length <= max;
}

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "HealthSphere 360" });
});

// LAB REPORTS: Only user-confirmed values are saved.
app.get("/api/labs", (req, res) => {
  const patientId = String(req.query.patientId || "demo-patient");

  res.json(
    db.prepare(`
      SELECT * FROM lab_results
      WHERE patient_id = ?
      ORDER BY report_date DESC, id DESC
    `).all(patientId)
  );
});

app.post("/api/labs", (req, res) => {
  const {
    patientId = "demo-patient",
    testName,
    value,
    unit,
    referenceMin,
    referenceMax,
    bloodGroup,
    reportDate,
    confirmed
  } = req.body;

  if (!validText(patientId, 100) ||
      !validText(testName) ||
      !validText(unit, 40) ||
      !Number.isFinite(value) ||
      !validDate(reportDate) ||
      confirmed !== true) {
    return res.status(400).json({
      error: "Valid lab details and explicit confirmation are required."
    });
  }

  const min = referenceMin === null || referenceMin === undefined
    ? null : referenceMin;
  const max = referenceMax === null || referenceMax === undefined
    ? null : referenceMax;

  if ((min !== null && !Number.isFinite(min)) ||
      (max !== null && !Number.isFinite(max)) ||
      (min !== null && max !== null && min > max)) {
    return res.status(400).json({ error: "Invalid reference range." });
  }

  const group = bloodGroup || null;
  const allowedGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  if (group !== null && !allowedGroups.includes(group)) {
    return res.status(400).json({ error: "Invalid blood group." });
  }
  const result = db.prepare(`
    INSERT INTO lab_results
    (patient_id, test_name, value, unit, reference_min,
     reference_max, blood_group, report_date, confirmed)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
  `).run(
    patientId.trim(), testName.trim(), value, unit.trim(),
    min, max, group, reportDate
  );

  res.status(201).json(
    db.prepare("SELECT * FROM lab_results WHERE id = ?")
      .get(result.lastInsertRowid)
  );
});
// Trend endpoint: comparison only, not a diagnosis.
app.get("/api/labs/:id/trend", (req, res) => {
  const current = db.prepare(
    "SELECT * FROM lab_results WHERE id = ? AND confirmed = 1"
  ).get(Number(req.params.id));

  if (!current) {
    return res.status(404).json({ error: "Confirmed result not found." });
  }

  const previous = db.prepare('
    SELECT * FROM lab_results
    WHERE patient_id = ?
      AND test_name = ?
      AND unit = ?
      AND confirmed = 1
      AND report_date < ?
    ORDER BY report_date DESC, id DESC
    LIMIT 1
  ').get(
    current.patient_id,
    current.test_name,
const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "healthsphere.db"));

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS lab_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id TEXT NOT NULL,
    test_name TEXT NOT NULL,
    value REAL NOT NULL,
    unit TEXT NOT NULL,
    reference_min REAL,
    reference_max REAL,
    blood_group TEXT,
    report_date TEXT NOT NULL,
    confirmed INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS medicines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    barcode TEXT,
    batch_number TEXT NOT NULL,
    expiry_date TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0 CHECK(quantity >= 0),
    minimum_stock INTEGER NOT NULL DEFAULT 10,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS environment_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    location TEXT NOT NULL,
    temperature REAL,
    aqi INTEGER,
    recorded_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

module.exports = db;

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const db = require("./database");

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json({ limit: "1mb" }));

const PORT = process.env.PORT || 5000;

function validDate(value) {
  return typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(value));
}

function validText(value, max = 120) {
  return typeof value === "string" &&
    value.trim().length > 0 &&
    value.trim().length <= max;
}

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "HealthSphere 360" });
});

// LAB REPORTS: Only user-confirmed values are saved.
app.get("/api/labs", (req, res) => {
  const patientId = String(req.query.patientId || "demo-patient");

  res.json(
    db.prepare(`
      SELECT * FROM lab_results
      WHERE patient_id = ?
      ORDER BY report_date DESC, id DESC
    `).all(patientId)
  );
});

app.post("/api/labs", (req, res) => {
  const {
    patientId = "demo-patient",
    testName,
    value,
    unit,
    referenceMin,
    referenceMax,
    bloodGroup,
    reportDate,
    confirmed
  } = req.body;

  if (!validText(patientId, 100) ||
      !validText(testName) ||
      !validText(unit, 40) ||
      !Number.isFinite(value) ||
      !validDate(reportDate) ||
      confirmed !== true) {
    return res.status(400).json({
      error: "Valid lab details and explicit confirmation are required."
    });
  }

  const min = referenceMin === null || referenceMin === undefined
    ? null : referenceMin;
  const max = referenceMax === null || referenceMax === undefined
    ? null : referenceMax;

  if ((min !== null && !Number.isFinite(min)) ||
      (max !== null && !Number.isFinite(max)) ||
      (min !== null && max !== null && min > max)) {
    return res.status(400).json({ error: "Invalid reference range." });
  }

  const group = bloodGroup || null;
  const allowedGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  if (group !== null && !allowedGroups.includes(group)) {
    return res.status(400).json({ error: "Invalid blood group." });
  }

  const result = db.prepare(`
    INSERT INTO lab_results
    (patient_id, test_name, value, unit, reference_min,
     reference_max, blood_group, report_date, confirmed)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
  `).run(
    patientId.trim(), testName.trim(), value, unit.trim(),
    min, max, group, reportDate
  );

  res.status(201).json(
    db.prepare("SELECT * FROM lab_results WHERE id = ?")
      .get(result.lastInsertRowid)
  );
});

// Trend endpoint: comparison only, not a diagnosis.
app.get("/api/labs/:id/trend", (req, res) => {
  const current = db.prepare(
    "SELECT * FROM lab_results WHERE id = ? AND confirmed = 1"
  ).get(Number(req.params.id));

  if (!current) {
    return res.status(404).json({ error: "Confirmed result not found." });
  }

  const previous = db.prepare(`
    SELECT * FROM lab_results
    WHERE patient_id = ?
      AND test_name = ?
      AND unit = ?
      AND confirmed = 1
      AND report_date < ?
    ORDER BY report_date DESC, id DESC
    LIMIT 1
  `).get(
    current.patient_id,
    current.test_name,
    current.unit,
    current.report_date
  );

  const outsideRange =
    (current.reference_min !== null &&
      current.value < current.reference_min) ||
    (current.reference_max !== null &&
      current.value > current.reference_max);

  res.json({
    current,
    previous: previous || null,
    change: previous ? current.value - previous.value : null,
    percentChange: previous && previous.value !== 0
      ? ((current.value - previous.value) /
          Math.abs(previous.value)) * 100
      : null,
    outsideReferenceRange: outsideRange,
    explanation: previous
      ? "Compare this change with the laboratory's reference range and clinical context."
      : "A previous comparable result is not available.",
    disclaimer: "This comparison does not diagnose disease."
  });
});

// MEDISTOCK: create inventory item.
app.get("/api/medicines", (req, res) => {
    const rows = db.prepare(`
    SELECT * FROM medicines ORDER BY expiry_date ASC
  `).all();

  const today = new Date().toISOString().slice(0, 10);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + 30);
  const nearDate = cutoff.toISOString().slice(0, 10);

  res.json(rows.map(m => ({
    ...m,
    expired: m.expiry_date < today,
    nearExpiry: m.expiry_date >= today &&
      m.expiry_date <= nearDate,
    lowStock: m.quantity <= m.minimum_stock
  })));
});

app.post("/api/medicines", (req, res) => {
  const {
    name, barcode, batchNumber, expiryDate,
    quantity, minimumStock = 10
  } = req.body;
 if (!validText(name) ||
      !validText(batchNumber, 80) ||
      !validDate(expiryDate) ||
      !Number.isInteger(quantity) || quantity < 0 ||
      !Number.isInteger(minimumStock) || minimumStock < 0 ||
      (barcode != null &&
        (typeof barcode !== "string" || barcode.length > 100))) {
    return res.status(400).json({ error: "Invalid medicine details." });
  }

  const result = db.prepare(`
    INSERT INTO medicines
    (name, barcode, batch_number, expiry_date, quantity, minimum_stock)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    name.trim(), barcode || null, batchNumber.trim(),
    expiryDate, quantity, minimumStock
  );

  res.status(201).json(
    db.prepare("SELECT * FROM medicines WHERE id = ?")
      .get(result.lastInsertRowid)
  );
});

// Stock adjustments use a transaction to prevent negative inventory.
app.patch("/api/medicines/:id/stock", (req, res) => {
  const { change } = req.body;

  if (!Number.isInteger(change) || change === 0) {
    return res.status(400).json({
      error: "Provide a non-zero integer stock change."
    });
  }

  const update = db.transaction(() => {
    const medicine = db.prepare(
      "SELECT * FROM medicines WHERE id = ?"
    ).get(Number(req.params.id));

    if (!medicine) return null;

    const next = medicine.quantity + change;
    if (next < 0) throw new Error("Stock cannot be negative.");

    db.prepare("UPDATE medicines SET quantity = ? WHERE id = ?")
      .run(next, medicine.id);

    return db.prepare("SELECT * FROM medicines WHERE id = ?")
      .get(medicine.id);
  });

  try {
    const result = update();
    if (!result) {
      return res.status(404).json({ error: "Medicine not found." });
    }
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ENVIRONMENT: store provider-reported observations.
app.post("/api/environment", (req, res) => {
  const { location, temperature, aqi } = req.body;

  if (!validText(location) ||
      (temperature != null && !Number.isFinite(temperature)) ||
      (aqi != null &&
        (!Number.isInteger(aqi) || aqi < 0 || aqi > 1000))) {
    return res.status(400).json({ error: "Invalid environment data." });
  }

  const result = db.prepare(`
    INSERT INTO environment_logs (location, temperature, aqi)
    VALUES (?, ?, ?)
  `).run(location.trim(), temperature ?? null, aqi ?? null);

  res.status(201).json(
    db.prepare("SELECT * FROM environment_logs WHERE id = ?")
      .get(result.lastInsertRowid)
  );
});

app.get("/api/environment", (req, res) => {
  res.json(db.prepare(`
    SELECT * FROM environment_logs
    ORDER BY recorded_at DESC LIMIT 20
  `).all());
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "An unexpected server error occurred." });
});

app.listen(PORT, () => {
  console.log(`HealthSphere API running on http://localhost:${PORT}`);
});
*/



    require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./database");

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json({ limit: "1mb" }));

const PORT = process.env.PORT || 5000;

function validDate(value) {
  return typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(value));
}
function validText(value, max = 120) {
  return typeof value === "string" &&
    value.trim().length > 0 &&
    value.trim().length <= max;pm
}

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "TrackMate" });
});

app.get("/api/labs", (req, res) => {
  const patientId = String(req.query.patientId || "demo-patient");
  res.json(
    db.prepare(`
      SELECT * FROM lab_results
      WHERE patient_id = ?
      ORDER BY report_date DESC, id DESC
    `).all(patientId)
  );
});

app.post("/api/labs", (req, res) => {
  const {
    patientId = "demo-patient",
    testName,
    value,
    unit,
    referenceMin,
    referenceMax,
    bloodGroup,
    reportDate,
    confirmed
  } = req.body;

  if (!validText(patientId, 100) ||
      !validText(testName) ||
      !validText(unit, 40) ||
      !Number.isFinite(value) ||
      !validDate(reportDate) ||
      confirmed !== true) {
    return res.status(400).json({
      error: "Valid lab details and explicit confirmation are required."
    });
  }

  const min = referenceMin === null || referenceMin === undefined ? null : referenceMin;
  const max = referenceMax === null || referenceMax === undefined ? null : referenceMax;

  if ((min !== null && !Number.isFinite(min)) ||
      (max !== null && !Number.isFinite(max)) ||
      (min !== null && max !== null && min > max)) {
    return res.status(400).json({ error: "Invalid reference range." });
  }

  const group = bloodGroup || null;
  const allowedGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  if (group !== null && !allowedGroups.includes(group)) {
    return res.status(400).json({ error: "Invalid blood group." });
  }

  const result = db.prepare(`
    INSERT INTO lab_results
    (patient_id, test_name, value, unit, reference_min, reference_max, blood_group, report_date, confirmed)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
  `).run(patientId.trim(), testName.trim(), value, unit.trim(), min, max, group, reportDate);

  res.status(201).json(db.prepare("SELECT * FROM lab_results WHERE id = ?").get(result.lastInsertRowid));
});

app.get("/api/labs/:id/trend", (req, res) => {
  const current = db.prepare("SELECT * FROM lab_results WHERE id = ? AND confirmed = 1").get(Number(req.params.id));
  if (!current) return res.status(404).json({ error: "Confirmed result not found." });

  const previous = db.prepare(`
    SELECT * FROM lab_results
    WHERE patient_id = ? AND test_name = ? AND unit = ? AND confirmed = 1 AND report_date < ?
    ORDER BY report_date DESC, id DESC LIMIT 1
  `).get(current.patient_id, current.test_name, current.unit, current.report_date);

  const outsideRange = (current.reference_min !== null && current.value < current.reference_min) ||
    (current.reference_max !== null && current.value > current.reference_max);

  res.json({
    current,
    previous: previous || null,
    change: previous ? current.value - previous.value : null,
    percentChange: previous && previous.value !== 0 ? ((current.value - previous.value) / Math.abs(previous.value)) * 100 : null,
    outsideReferenceRange: outsideRange,
    explanation: previous ? "Compare this change with the laboratory's reference range and clinical context." : "A previous comparable result is not available.",
    disclaimer: "This comparison does not diagnose disease."
  });
});

app.get("/api/medicines", (req, res) => {
  const rows = db.prepare(`SELECT * FROM medicines ORDER BY expiry_date ASC`).all();
  const today = new Date().toISOString().slice(0, 10);
  const cutoff = new Date(); cutoff.setDate(cutoff.getDate() + 30);
  const nearDate = cutoff.toISOString().slice(0, 10);
  res.json(rows.map(m => ({ ...m, expired: m.expiry_date < today, nearExpiry: m.expiry_date >= today && m.expiry_date <= nearDate, lowStock: m.quantity <= m.minimum_stock })));
});

app.post("/api/medicines", (req, res) => {
  const { name, barcode, batchNumber, expiryDate, quantity, minimumStock = 10 } = req.body;
  if (!validText(name) || !validText(batchNumber, 80) || !validDate(expiryDate) || !Number.isInteger(quantity) || quantity < 0 || !Number.isInteger(minimumStock) || minimumStock < 0) {
    return res.status(400).json({ error: "Invalid medicine details." });
  }
  const result = db.prepare(`INSERT INTO medicines (name, barcode, batch_number, expiry_date, quantity, minimum_stock) VALUES (?, ?, ?, ?, ?, ?)`).run(name.trim(), barcode || null, batchNumber.trim(), expiryDate, quantity, minimumStock);
  res.status(201).json(db.prepare("SELECT * FROM medicines WHERE id = ?").get(result.lastInsertRowid));
});

app.patch("/api/medicines/:id/stock", (req, res) => {
  const { change } = req.body;
  if (!Number.isInteger(change) || change === 0) return res.status(400).json({ error: "Provide a non-zero integer stock change." });
  const update = db.transaction(() => {
    const medicine = db.prepare("SELECT * FROM medicines WHERE id = ?").get(Number(req.params.id));
    if (!medicine) return null;
    const next = medicine.quantity + change;
    if (next < 0) throw new Error("Stock cannot be negative.");
    db.prepare("UPDATE medicines SET quantity = ? WHERE id = ?").run(next, medicine.id);
    return db.prepare("SELECT * FROM medicines WHERE id = ?").get(medicine.id);
  });
  try {
    const result = update();
    if (!result) return res.status(404).json({ error: "Medicine not found." });
    res.json(result);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

app.post("/api/environment", (req, res) => {
  const { location, temperature, aqi } = req.body;
  if (!validText(location) || (temperature != null && !Number.isFinite(temperature)) || (aqi != null && (!Number.isInteger(aqi) || aqi < 0 || aqi > 1000))) {
    return res.status(400).json({ error: "Invalid environment data." });
  }
  const result = db.prepare(`INSERT INTO environment_logs (location, temperature, aqi) VALUES (?, ?, ?)`).run(location.trim(), temperature ?? null, aqi ?? null);
  res.status(201).json(db.prepare("SELECT * FROM environment_logs WHERE id = ?").get(result.lastInsertRowid));
});

app.get("/api/environment", (req, res) => {
  res.json(db.prepare(`SELECT * FROM environment_logs ORDER BY recorded_at DESC LIMIT 20`).all());
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "An unexpected server error occurred." });
});

app.listen(PORT, () => {
  console.log(`TrackMate API running on http://localhost:${PORT}`);
});