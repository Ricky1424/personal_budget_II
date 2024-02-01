// Require in functionality
const express = require('express');
const bodyParser = require('body-parser');
const pool = require('./config.js');
const envelopesRouter = require('./routes/envelopes');
const transactionsRouter = require('./routes/transactions.js');

// Create an instance of express
const app = express();

// Declare port for server to listen on
const PORT = 3001;

app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// Use the required routes from ./routes/envelopes
app.use('/api', envelopesRouter);
app.use('/api', transactionsRouter);

// Set app up to listen on the port
app.listen(PORT, () => {
    console.log(`Running express server (app) on port ${PORT}.`)
  });

