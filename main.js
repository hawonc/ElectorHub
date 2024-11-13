const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const temp = {
  'polling123': {
      passwordHash: '$2a$10$WSoRfKK5gct8tqxzYHlqbeIItF1u8sFDK.4.Su7OklhXmHZ15aSxO' // bcrypt hash of "password123"
  },
};


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

app.post('/login', (req, res) => {
  if (users[pollingId]) {
    // Compare the provided password hash with the stored one
    bcrypt.compare(passwordHash, users[pollingId].passwordHash, (err, isMatch) => {
        if (err) {
            return res.status(500).send('Error comparing password hashes.');
        }
        
        if (isMatch) {
            res.sendFile('query.html');
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
  }
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});