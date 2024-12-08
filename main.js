const express = require('express');
const path = require('path');
const app = express();
const mysql = require('mysql2');
const session = require('express-session');
const axios = require('axios');
const { createHash } = require('crypto');
const fs = require('fs');
const pathToSecretKey = path.join(__dirname, 'secret.key');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const secretKey = fs.readFileSync(pathToSecretKey, 'utf8').trim();

app.use(session({
    secret: secretKey,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

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

app.post('/login', (req, res) => {
    const { polling_place_id, password } = req.body;
    
    if (polling_place_id && password) {
        const query = 'SELECT password FROM polling_places WHERE polling_place_id = ?';
        connection.query(query, [polling_place_id], (err, results) => {
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
            console.log(results[0].password)
            console.log(password)
            if (results[0].password === hash(password)) {
                req.session.loggedIn = true;
                const fileName = 'checkin.html';
                const options = {
                    root: path.join(__dirname)
                };
                res.status(200).sendFile(fileName, options, function (err) {
                    if (err) {
                        console.error('Error sending:', err);
                    } else {
                        console.log('Sent:', fileName);
                    }
                });
            } else {
                res.status(500).send(`
                    <html>
                        <body>
                            <h1>Login Failed</h1>
                            <p>Invalid polling ID or password hash. Please try again.</p>
                            <a href="/">Back to login</a>
                        </body>
                    </html>
                `);
            }
        });
    } else {
        res.send(`
            <html>
                <body>
                    <h1>Login Failed</h1>
                    <p>Invalid polling ID or password hash. Please try again.</p>
                    <a href="/">Back to login</a>
                </body>
            </html>
        `);
    }
});

app.post('/query', async (req, res) => {
    if (req.session.loggedIn) {
        try {
            const { name } = req.body;
            const blockchainResponse = await axios.post('http://127.0.0.1:5000/vote', {'name': name});
            console.log('Blockchain response:', blockchainResponse.data);
            res.status(200).send('Voter checkin successful');
        } catch (blockchainError) {
            console.error('Error communicating with blockchain:', blockchainError);
            res.status(500).send('Error querying blockchain');
        }
    } else {
        return res.status(403).send(`
            <html>
                <body>
                    <h1>Forbidden</h1>
                    <p>You must be logged in to access this resource.</p>
                    <a href="/">Back to login</a>
                </body>
            </html>
        `);
    }
});

app.listen(3030, () => {
    console.log('Server listening on port 3030');
});
