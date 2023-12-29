const express = require('express')
const path = require('path');
require('dotenv').config({ path: './config/.env' });

const app = express()
const PORT = process.env.PORT || 4444;

// Body Parser to extract the entire body portion of a request and expose it on req.body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Setting access to /views folder
app.use(express.static(path.join(__dirname, '/views')));

//Rendering 'index.html'
app.get('/', (req, res) => {
    res.render('index');
});

// Server Setup
app.listen(PORT, () => {
  console.log(`Server is running at PORT ${PORT}`);
});