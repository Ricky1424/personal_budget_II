// Routes for retrieving and creating envelopes

// Require in express and extract the router object
const { Router } = require('express');
const pool = require('../config.js')

// Create an instance of the Router object and save to 'router'
const router = Router();

// Function to verify validity of new envelopes
function newEnvelopeValidation( request, response, next) {
    console.log('Checking validity of new envelope');
    // Store values of the required and supplied properties
    const requiredProperties = ['envelope', 'budgetAmount']
    const propOne = Object.keys(request.body)[0]
    const propTwo = Object.keys(request.body)[1]

    // Check to make sure supplied key matches required key
    if (propOne != requiredProperties[0] || propTwo != requiredProperties[1]) {
        console.log("Error: incorrect parameter")
        res.status(404).send("Incorrect Key Parameter")
    // Check to see if supplied value type matches required value type
    } else if (typeof(request.body[propOne]) != 'string' || typeof(request.body[propTwo]) != 'number') {
        console.log("Error: Incorrect value supplied")
        res.status(404).send("Incorrect Value Parameter")
    } else {
        console.log('New envelope valid')
        next();
    };
}

// Get query to return all envelopes
router.get('/envelopes', (request, response) => {
    pool.query('SELECT * FROM envelopes', (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
    console.log(`${request.method}: Retrieved all envelopes`);
  });

  // POST route to create new envelopes
/*
This route is used to create a new evelope. Must be supplied in following format.
{
    "envelope": <string>,
    "budgetAmount": <int>
}
*/
router.post('/new', newEnvelopeValidation, (request, response) => {
    const { envelope, budgetAmount } = request.body;

    pool.query('INSERT INTO envelopes (envelope, budgetAmount) VALUES ($1, $2)', [envelope, budgetAmount], (error, results) => {
        if (error) {
            throw error
        }
        console.log(`${request.method}: Created ${envelope}`)
        response.sendStatus(201);
    })
});

// GET route which return a single envelope by named request
router.get('/:envelopeName', (request, response, next) => {
    const { envelopeName } = request.params;
    pool.query('SELECT * FROM envelopes WHERE envelope = ($1)', [envelopeName], (error, results) => {
        if (error) {
            throw error;
        }

        const result = results.rows;
        if (!result.length) {
            console.log(`${request.method}: ${envelopeName} not found`);
            response.status(404).send(`${request.method}: ${envelopeName} not found`);
        }
        else {
            console.log(`${request.method}: Retrieved ${envelopeName}`)
            response.status(200).send(result);
        }
    });
});

// DELETE route to remove an envelope
router.delete('/delete/:envelopeName', (request, response, next) => {
    const { envelopeName } = request.params;
    pool.query('DELETE FROM envelopes WHERE envelope = ($1)', [envelopeName], (error, results) => {
        if (error) {
            throw error
        };

        if (results.rowCount < 1) {
            console.log(`${request.method}: Envelope not found`)
            response.status(404).send(`${request.method}: Envelope not found`)
        }
        else {
            console.log(`${request.method} ${envelopeName} successful`)
            response.status(200).send(`${request.method} ${envelopeName} successful`);
        }
    })
});

module.exports = router;