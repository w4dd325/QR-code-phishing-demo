// const express = require('express');
// const path = require('path');

// const app = express();
// const PORT = process.env.PORT || 3000;

// // Serve static files
// app.use(express.static(path.join(__dirname)));

// // Fallback route
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'index.html'));
// });

// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });


//-------------------

const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'submissions.json');

// Middleware
app.use(express.static(path.join(__dirname)));
app.use(bodyParser.json());

// Handle form submission
app.post('/submit', (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Missing name or email' });
  }

  let submissions = [];

  try {
    if (fs.existsSync(DATA_FILE)) {
      submissions = JSON.parse(fs.readFileSync(DATA_FILE));
    }
  } catch (err) {
    console.error('Error reading file:', err);
  }

  submissions.push({ name, email, timestamp: new Date().toISOString() });

  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(submissions, null, 2));
    res.json({ message: 'Submission saved!' });
  } catch (err) {
    console.error('Error writing file:', err);
    res.status(500).json({ error: 'Failed to save submission' });
  }
});

app.get('/submissions', (req, res) => {
  if (fs.existsSync(DATA_FILE)) {
    const data = fs.readFileSync(DATA_FILE);
    res.type('json').send(data);
  } else {
    res.json([]);
  }
});


// Fallback route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
