const express = require('express');
const path = require('path');
const app = express();
const mysql = require('mysql2');
const axios = require('axios');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const db = mysql.createConnection({
    host: '127.0.0.1',
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
      const { name, dob, address, city, zip, id } = req.body;
      console.log(name, dob, address, city, zip, id);

      // Check against eligible voters database
      const eligibleQuery = 'SELECT * FROM voters WHERE name = ? AND date_of_birth = ? AND zip_code = ? AND street_address = ? \
                             AND (drivers_license_number = ? OR RIGHT(social_security_number, 4) = ?)';
      db.query(eligibleQuery, [name, dob, Number(zip), address, id, id], async (err, results) => {
          if (err) {
              throw err;
          }

          if (results.length == 0) {
              return res.status(400).send('Voter is not eligible to register');
          }

          registerSignature = true;
          // Add voter to the blockchain
          const voterPayload = {
              name,
              dob,
              address,
              id,
              registerSignature
          };
          try {
              const blockchainResponse = await axios.post('http://127.0.0.1:5000/voter/register', voterPayload);
              console.log('Blockchain response:', blockchainResponse.data);
              res.send('Registration successful');
          } catch (blockchainError) {
              console.error('Error communicating with blockchain:', blockchainError);
              res.status(500).send('Error adding voter to blockchain');
          }
      });
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
      const { nameCheck } = req.body;

      // Check if the voter is on the blockchain
      try {
          const blockchainResponse = await axios.get('http://127.0.0.1:5000/chain');
          const chain = blockchainResponse.data.chain;
          voterRegistered = false;
          for (let i = 0; i < chain.length; i++) {
              if (chain[i]['transactions'].length != 0) {
                  console.log(chain[i]['transactions'][0].recipient);
                  console.log(nameCheck);
                  if(chain[i]['transactions'][0].recipient === nameCheck){
                      voterRegistered = true;
                  }
              }
          }        

          if (voterRegistered) {
              res.send('Voter is registered');
          } else {
              res.send('Voter is not registered');
          }
      } catch (blockchainError) {
          console.error('Error communicating with blockchain:', blockchainError);
          res.status(500).send('Error checking registration status');
      }
  } catch (error) {
      res.status(500).send('Error checking registration status');
      console.error('Error:', error);
  }
});


app.listen(3031, () => {
    console.log('Server listening on port 3031');
});
