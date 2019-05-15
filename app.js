const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const routes = require("./routes");

// Body Parser Middleware
// create application/x-www-form-urlencoded parser
app.use(bodyParser.urlencoded({ extended: false }));
// create application/json parser
app.use(bodyParser.json());

app.get('/', function(req, res) {
    res.send("Hello World!");
});

app.use("/api", routes);

app.listen('3000', function(){
    console.log('Server Stated on Port 3000...');
});