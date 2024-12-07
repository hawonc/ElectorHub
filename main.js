const express = require('express');
const path = require('path');
const app = express();
const mysql = require('mysql2');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'password',
    database: 'eligible_voters'
});

const { createHash } = require('crypto');

function hash(string) {
  return createHash('sha256').update(string).digest('hex');
}


app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/checkin', (req, res) => {
    const options = {
        root: path.join(__dirname)
    };

    const fileName = 'login.html';
    res.sendFile(fileName, options, function (err) {
        if (err) {
            console.error('Error sending:', err);
        } else {
            console.log('Sent:', fileName);
        }
    });
  });

app.post('/checkin/login', (req, res) => {
const { polling_place_id, password } = req.body;
  if (polling_place_id && password) {
    // Compare the provided password hash with the stored one
    const query = 'SELECT password FROM polling_places WHERE polling_place_id = ?';
    connection.query(query, [polling_place_id], (err, results) =>{
        if (err || results.length === 0) {
            res.status(500).send(`
                <html>
                    <body>
                        <h1>Login Failed</h1>
                        <p>Invalid polling ID or password hash. Please try again.</p>
                        <a href="/">Back to login</a>
                    </body>
                </html>
            `);
            return;
        }
        if (results[0].password === password) {
            return res.status(200).json({ message: 'Login successful!' });
        }
    });
  }
  res.send(`
    <html>
        <body>
            <h1>Login Failed</h1>
            <p>Invalid polling ID or password hash. Please try again.</p>
            <a href="/">Back to login</a>
        </body>
    </html>
`);
});

app.listen(3030, () => {
  console.log('Server listening on port 3030');
});
