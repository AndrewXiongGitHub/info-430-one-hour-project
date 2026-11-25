require("dotenv").config();

const express = require("express");
const fs = require("node:fs");
const path = require("node:path");
const sql = require("mssql");

const app = express();
const port = process.env.PORT || 3000;
const webDirectory = path.join(__dirname, "..", "web");
const prospectsQuery = fs.readFileSync(path.join(__dirname, "..", "db", "queries.sql"), "utf8");
let poolPromise;

async function getPool() {
  if (!poolPromise) {
    poolPromise = sql.connect({
      server: process.env.DB_SERVER,
      port: Number(process.env.DB_PORT || 1433),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      options: { encrypt: true, trustServerCertificate: true }
    });
  }

  try {
    return await poolPromise;
  } catch (error) {
    poolPromise = undefined;
    throw error;
  }
}

function parseAgeFilter(value) {
  if (value === undefined || value === "") {
    return { valid: true, age: null };
  }
  if (typeof value !== "string" || !/^\d+$/.test(value)) {
    return { valid: false, age: null };
  }

  const age = Number(value);
  return {
    valid: Number.isInteger(age) && age >= 14 && age <= 20,
    age
  };
}

app.get("/api/prospects", async (request, response) => {
  const search = request.query.search === undefined ? "" : request.query.search;
  if (typeof search !== "string") {
    return response.status(400).json({ error: "Search must be a single text value." });
  }

  const searchTerm = search.trim();
  if (searchTerm.length > 100) {
    return response.status(400).json({ error: "Search must be 100 characters or fewer." });
  }

  const squad = request.query.squad === undefined ? "" : request.query.squad;
  if (typeof squad !== "string") {
    return response.status(400).json({ error: "Squad must be a single value." });
  }
  const squadFilter = squad.trim();
  if (squadFilter.length > 20) {
    return response.status(400).json({ error: "Squad must be 20 characters or fewer." });
  }

  const minimumAge = parseAgeFilter(request.query.minAge);
  const maximumAge = parseAgeFilter(request.query.maxAge);
  if (!minimumAge.valid || !maximumAge.valid) {
    return response.status(400).json({ error: "Age filters must be whole numbers from 14 through 20." });
  }
  if (minimumAge.age !== null && maximumAge.age !== null && minimumAge.age > maximumAge.age) {
    return response.status(400).json({ error: "Minimum age cannot be greater than maximum age." });
  }

  try {
    const pool = await getPool();
    const result = await pool.request()
      .input("searchTerm", sql.NVarChar(100), searchTerm)
      .input("squad", sql.NVarChar(20), squadFilter)
      .input("minAge", sql.Int, minimumAge.age)
      .input("maxAge", sql.Int, maximumAge.age)
      .query(prospectsQuery);
    response.json(result.recordset);
  } catch (error) {
    console.error("Prospect query failed:", error.message);
    response.status(500).json({ error: "Could not load prospect data. Check the server connection and database setup." });
  }
});

app.use(express.static(webDirectory));

app.listen(port, () => {
  console.log(`La Masia Prospect Watch is running at http://localhost:${port}`);
});
