const express = require('express');
const path = require('path');
const app = express();

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
    console.log(req.body);
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});