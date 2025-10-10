const express = require('express');
const sql = require('mssql/msnodesqlv8');
const bodyParser = require('body-parser');
const cors = require('cors');
const crypto = require('crypto');
const cheerio = require('cheerio');
const js2xmlparser = require('js2xmlparser');

const app = express();
const PORT = 4000;

// SQL config
const config = {
  connectionString: 'Driver={ODBC Driver 17 for SQL Server};Server=localhost;Database=SafetyApp;Trusted_Connection=Yes;Encrypt=No;',
  driver: 'msnodesqlv8'
};

// Middleware
app.use(express.json({ limit: '20mb' }));
app.use(bodyParser.json({ limit: '20mb' }));
app.use(bodyParser.urlencoded({ limit: '20mb', extended: true }));
app.use(cors());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE'); 
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); 
  next();
});

// Test DB connection
async function testConnection() {
  let pool;
  try {
    pool = await sql.connect(config);
    console.log('✅ Connected to SQL Server!');
  } catch (err) {
    console.error('❌ Connection failed:', err);
  } finally {
    if (pool) await pool.close();
  }
}

// Basic route
app.get('/', (req, res) => res.send('Hello from server!'));

// ----------------- EMPLOYEES -----------------
app.get('/employees', async (req, res) => {
  let pool;
  try {
    pool = await sql.connect(config);
    const result = await pool.request().query(`SELECT * FROM employee_profile`);
    res.json(result.recordset);
  } catch (err) {
    console.error('Failed to fetch employees:', err.message);
    res.status(500).json({ error: 'Failed to fetch employees', details: err.message });
  } finally {
    if (pool) await pool.close();
  }
});

// ----------------- ACTIONS -----------------
app.get('/actions', async (req, res) => {
  let pool;
  try {
    pool = await sql.connect(config);
    const result = await pool.request().query(`
      SELECT 
        a.id, 
        a.employee_id, 
        e.first_name, 
        e.last_name, 
        e.clocknumber, 
        a.action_name, 
        a.description, 
        a.status 
      FROM actions a
      LEFT JOIN employee_profile e ON a.employee_id = e.employee_id
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching actions:', err);
    res.status(500).json({ error: 'Error fetching actions' });
  } finally {
    if (pool) await pool.close();
  }
});

// Updated /addAction: uses employee_id from frontend/localStorage
app.post('/addAction', async (req, res) => {
  const { action_name, description, status, employee_id } = req.body; // employee_id sent from frontend
  if (!employee_id) {
    return res.status(400).json({ error: 'employee_id is required' });
  }

  let pool;
  try {
    pool = await sql.connect(config);
    await pool.request()
      .input('employee_id', sql.Int, employee_id)
      .input('action_name', sql.NVarChar, action_name)
      .input('description', sql.NVarChar, description)
      .input('status', sql.NVarChar, status)
      .query(`
        INSERT INTO actions (employee_id, action_name, description, status)
        VALUES (@employee_id, @action_name, @description, @status)
      `);
    res.json({ message: 'Action added successfully' });
  } catch (err) {
    console.error('Error adding action:', err.message);
    res.status(500).json({ error: `Error adding action: ${err.message}` });
  } finally {
    if (pool) await pool.close();
  }
});

// ----------------- ISSUES -----------------
app.get('/issues', async (req, res) => {
  let pool;
  try {
    pool = await sql.connect(config);
    const result = await pool.request().query('SELECT * FROM issues');
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching issues:', err);
    res.status(500).json({ error: 'Error fetching issues' });
  } finally {
    if (pool) await pool.close();
  }
});

app.post('/addIssue', async (req, res) => {
  const { employee_id, issue_name, description, status } = req.body;
  let pool;
  try {
    pool = await sql.connect(config);
    await pool.request()
      .input('employee_id', sql.Int, employee_id)
      .input('issue_name', sql.NVarChar, issue_name)
      .input('description', sql.NVarChar, description)
      .input('status', sql.NVarChar, status)
      .query(`INSERT INTO issues (employee_id, issue_name, description, status) VALUES (@employee_id, @issue_name, @description, @status)`);
    res.json({ message: 'Issue added successfully' });
  } catch (err) {
    console.error('Error adding issue:', err.message);
    res.status(500).json({ error: `Error adding issue: ${err.message}` });
  } finally {
    if (pool) await pool.close();
  }
});

// ----------------- START SERVER -----------------
app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  await testConnection();
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down server...');
  try {
    await sql.close();
    console.log('Database connections closed');
  } catch (err) {
    console.error('Error closing database connections:', err);
  }
  process.exit(0);
});
