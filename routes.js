const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

app.post('/register', (req, res) => {
    console.log(req.body);
    res.send('Registration data received');
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

app.post('/check', (req, res) => {
    console.log(req.body);
    res.send('Check status data received');
});

app.listen(3000, () => {
    console.log('Server listening on port 3000');
});