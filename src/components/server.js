const express = require('express');
const sql = require('mssql/msnodesqlv8');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const jwtConfig = require('./config');
const crypto = require('crypto');
const cheerio = require('cheerio');
const js2xmlparser = require('js2xmlparser');

const app = express();
const PORT = 3000;

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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); 
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
app.get('/', (req, res) => res.send('Hello from server!!!!'));

// ----------------- EMPLOYEES -----------------
app.get('/employees', async (req, res) => {
  let pool;
  try {
    pool = await sql.connect(config);
    const result = await pool.request().query(`SELECT * FROM employee_profile`);
    res.json(result.recordset);
  } catch (err) {
    console.error('❌ Failed to fetch employees:', err.message);
    res.status(500).json({ error: 'Failed to fetch employees', details: err.message });
  } finally {
    if (pool) await pool.close();
  }
});

app.post('/authenticate', async (req, res) => {
  const { clocknumber, password } = req.body;
  let pool;
  try {
    pool = await sql.connect(config);
    const result = await pool.request()
      .input('clocknumber', sql.NVarChar, clocknumber)
      .query(`
        SELECT employee_id, clocknumber, password 
        FROM employee_profile 
        WHERE LOWER(clocknumber) = LOWER(@clocknumber)
      `);

    if (!result.recordset.length) 
      return res.status(401).json({ error: 'Invalid clocknumber or password' });

    const storedPassword = result.recordset[0].password;
    if (storedPassword.toLowerCase() !== password.toLowerCase()) 
      return res.status(401).json({ error: 'Invalid clocknumber or password' });

    const tokenPayload = { id: result.recordset[0].employee_id, clocknumber: result.recordset[0].clocknumber };
    const token = jwt.sign(tokenPayload, jwtConfig.JWT_SECRET);

    res.json({ success: true, token });
  } catch (err) {
    console.error('Error authenticating user:', err);
    res.status(500).json({ error: 'Error authenticating user' });
  } finally {
    if (pool) await pool.close();
  }
});


// ----------------- ACTIONS -----------------
async function addAction(decodedToken, action_name, description, status) {
  let pool;
  try {
    const clocknumber = decodedToken.clocknumber;
    pool = await sql.connect(config);

    const userResult = await pool.request()
      .input('clocknumber', sql.Int, clocknumber)
      .query(`SELECT id FROM employee_profile WHERE LOWER(clocknumber)=LOWER(@clocknumber)`);
    
    if (!userResult.recordset.length) throw new Error('User not found');

    const employee_id = userResult.recordset[0].id;

    await pool.request()
      .input('employee_id', sql.Int, employee_id)
      .input('action_name', sql.NVarChar, action_name)
      .input('description', sql.NVarChar, description)
      .input('status', sql.NVarChar, status)
      .query(`INSERT INTO actions (employee_id, action_name, description, status) VALUES (@employee_id, @action_name, @description, @status)`);

    console.log('Action added successfully');
  } catch (err) {
    console.error('Error adding action:', err.message);
    throw err;
  } finally {
    if (pool) await pool.close();
  }
}

app.get('/actions', async (req, res) => {
  let pool;
  try {
    pool = await sql.connect(config);
    const result = await pool.request().query('SELECT * FROM actions');
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching actions:', err);
    res.status(500).json({ error: 'Error fetching actions' });
  } finally {
    if (pool) await pool.close();
  }
});

app.post('/addAction', async (req, res) => {
  try {
    const { action_name, description, status } = req.body;
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, jwtConfig.JWT_SECRET);

    await addAction(decodedToken, action_name, description, status);
    res.json({ message: 'Action added successfully' });
  } catch (err) {
    console.error('Error adding action:', err.message);
    res.status(500).json({ error: `Error adding action: ${err.message}` });
  }
});

// ----------------- ISSUES -----------------
async function addIssue(decodedToken, issue_name, description, status, imageBuffers) {
  let pool;
  try {
    const clocknumber = decodedToken.clocknumber;
    pool = await sql.connect(config);

    const userResult = await pool.request()
      .input('clocknumber', sql.Int, clocknumber)
      .query(`SELECT id FROM employee_profile WHERE LOWER(clocknumber)=LOWER(@clocknumber)`);
    
    if (!userResult.recordset.length) throw new Error('User not found');

    const employee_id = userResult.recordset[0].id;

    const request = pool.request();
    request.input('employee_id', sql.Int, employee_id);
    request.input('issue_name', sql.NVarChar, issue_name);
    request.input('description', sql.NVarChar, description);
    request.input('status', sql.NVarChar, status);
    request.input('image1', sql.VarBinary(sql.MAX), imageBuffers[0] || null);
    request.input('image2', sql.VarBinary(sql.MAX), imageBuffers[1] || null);
    request.input('image3', sql.VarBinary(sql.MAX), imageBuffers[2] || null);
    request.input('image4', sql.VarBinary(sql.MAX), imageBuffers[3] || null);

    await request.query(`
      INSERT INTO issues (employee_id, issue_name, description, status, image1, image2, image3, image4)
      VALUES (@employee_id, @issue_name, @description, @status, @image1, @image2, @image3, @image4)
    `);
    console.log('Issue added successfully');
  } catch (err) {
    console.error('Error adding issue:', err.message);
    throw err;
  } finally {
    if (pool) await pool.close();
  }
}

app.get('/issues', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, jwtConfig.JWT_SECRET);
    const employeeId = decodedToken.id;

    let pool = await sql.connect(config);
    const result = await pool.request()
      .query(`
        SELECT 
          i.issue_id AS recordID,  -- frontend expects this
          i.issue_name, 
          i.description, 
          i.status,
          i.employee_id, 
          e.first_name, 
          e.last_name
        FROM issues i
        LEFT JOIN employee_profile e ON i.employee_id = e.employee_id

      `);

    const issues = result.recordset.map(issue => ({
      ...issue,
      employee_id: issue.employee_id || employeeId,
      employee_name: issue.first_name && issue.last_name ? `${issue.first_name} ${issue.last_name}` : null
    }));

    res.json(issues);
    await pool.close();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch issues' });
  }
});


app.post('/addIssue', async (req, res) => {
  try {
    const { issue_name, description, status, photos } = req.body;
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, jwtConfig.JWT_SECRET);

    if (!photos || !Array.isArray(photos)) throw new Error('Invalid photos array');

    const imageBuffers = photos.map(photo => Buffer.from(photo, 'hex'));
    await addIssue(decodedToken, issue_name, description, status, imageBuffers);

    res.json({ message: 'Issue added successfully' });
  } catch (err) {
    console.error('Error adding issue:', err.message);
    res.status(500).json({ error: `Error adding issue: ${err.message}` });
  }
});

// ----------------- TEMPLATE / QA -----------------
async function processHtmlAndStoreInSQL(htmlContent, employeeId, templateName) {
  try {
    const $ = cheerio.load(htmlContent);
    const questions = [];

    $('ion-card').each((i, card) => {
      const questionText = $(card).find('ion-label').text().trim();
      const answers = $(card).find('ion-button').map((i, btn) => $(btn).text().trim()).get();
      questions.push({ question: questionText, answers });
    });

    const xmlObj = {
      questions: questions.map(q => ({
        template_name: templateName,
        question: { _text: q.question, answers: q.answers.map(a => ({ answer: a })) }
      }))
    };

    const xmlData = js2xmlparser.parse("root", xmlObj, {
      declaration: { include: true, encoding: 'UTF-16', version: '1.0' }
    });

    let pool = await sql.connect(config);
    await pool.request()
      .input('employee_id', sql.Int, employeeId)
      .input('template_name', sql.NVarChar, templateName)
      .input('xmlData', sql.Xml, xmlData)
      .query(`INSERT INTO qa (employee_id, template_name, xml_data) VALUES (@employee_id, @template_name, @xmlData)`);

    console.log('HTML content processed and XML stored successfully');
    await pool.close();
  } catch (err) {
    console.error('Error processing HTML and storing XML:', err);
    throw err;
  }
}

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
