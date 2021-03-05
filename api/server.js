const express = require('express');
const app = express(),
      bodyParser = require("body-parser");
      port = 3080;
const fs = require('fs');
var cors = require('cors');

// place holder for the data
// const users = [];

var whitelist = ['http://sqlgui.chrisjenkins.nz', 'http://localhost', 'http://localhost:3000']
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}

app.use(bodyParser.json(), cors(corsOptions));

app.get('/api/model/:modelJsonFilename', (req, res) => {
  // TODO: Check security on all calls
  let rawmodel = fs.readFileSync('./models/' + req.params.modelJsonFilename);
  let model = JSON.parse(rawmodel);
  res.json(model);
});

// app.post('/api/user', (req, res) => {
//   const user = req.body.user;
//   console.log('Adding user::::::::', user);
//   users.push(user);
//   res.json("user addedd");
// });


// app.get('/', (req,res) => {
//     res.send('App Works !!!!');
// });

app.listen(port, () => {
    console.log(`Server listening on the port::${port}`);
});