/* server.js */
'use strict';
const express = require('express');
const app = express();
const port = process.env.PORT || 4205;
const router = express.Router();
// start server
app.listen(port, function (req, res) {
    console.info(`Started Express server on port ${port}`)
});