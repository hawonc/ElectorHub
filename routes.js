const express = require('express');
const path = require('path');
const app = express();
const mysql = require('mysql');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'eligible_voters'
});

db.connect((err) => {
    if (err) {
      console.error('Error connecting to MySQL:', err.stack);
      return;
    }
    console.log('Connected to MySQL as ID', db.threadId);
});

app.get('/', (req, res) => {
  res.send('Registration site');
});

app.get('/register', (req, res) => {
    const options = {
        root: path.join(__dirname)
    };

    const fileName = 'register.html';
    res.sendFile(fileName, options, function (err) {
        if (err) {
            console.error('Error sending:', err);
        } else {
            console.log('Sent:', fileName);
        }
    });
});

app.post('/register', async (req, res) => {
    try {
      const { name, dob, address, id, registerSignature } = req.body;
  
      // Check against eligible voters database
      const eligibleQuery = 'SELECT * FROM voters WHERE name = ? AND dob = ? AND address = ? AND (drivers_license_number = ? OR SUBSTRING(social_security_number, -4) = ?';
      db.query(eligibleQuery, [name, dob], (err, results) => {
          if (err) {
              throw err;
          }

          if (results.length == 0) {
              return res.status(400).send('Voter is not eligible to register');
          }

          // Add voter to the blockchain

      });  
      
      
      res.send('Registration successful');
    } catch (error) {
      res.status(500).send('Error registering voter');
      console.error('Error:', error);
    }
  });
  

app.get('/status', (req, res) => {
    const options = {
        root: path.join(__dirname)
    };

    const fileName = 'status.html';
    res.sendFile(fileName, options, function (err) {
        if (err) {
            console.error('Error sending:', err);
        } else {
            console.log('Sent:', fileName);
        }
    });
});

app.post('/check', async (req, res) => {
    try {
      const { name, dob } = req.body;
  
    // Check if the voter is on the blockchain
    const registeredVoter = true;
  
      if (registeredVoter) {
        res.send('Voter is registered');
      } else {
        res.send('Voter is not registered');
      }
    } catch (error) {
      res.status(500).send('Error checking registration status');
      console.error('Error:', error);
    }
  });
  

app.listen(3031, () => {
    console.log('Server listening on port 3031');
});
