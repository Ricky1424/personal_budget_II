// Routes for transactions. Adding, subtracting and transferring from envelopes

// Require in express and extract the router object
const { Router } = require('express');
const pool = require('../config.js')

// Create an instance of the Router object and save to 'router'
const router = Router();

// Middleware to check for the existence of a fromEnvelope
router.param('fromEnvelope', (request, response, next, name) => {
    console.log('Running middleware to check for fromEnvelope')
    pool.query('SELECT * FROM envelopes WHERE envelope = ($1)', [name], (error, results) => {
        if (error) {
            throw error;
        }

        if (results.rowCount < 1) {
            response.status(404).send(`${request.method}: ${name} not found`)
        }
        else {
            console.log(`${name} envelope found`)
            next();
        }
    });
});

// Middleware to check if enough funds in fromEnvelope
router.param('amount',(request, response, next) => {
    const { fromEnvelope, toEnvelope, amount } = request.params
    pool.query('SELECT * FROM envelopes WHERE envelope = ($1) AND budgetAmount >= ($2)', [fromEnvelope, amount], (error, results) => {
        if (error) {
            throw error
        }

        if (results.rowCount < 1) {
            console.log(`${request.method}: ${fromEnvelope} insufficent funds`)
            response.status(404).send(`${request.method}: ${fromEnvelope} insufficent funds`)
        }
        else {
            next();
        }
    });
});

// Middleware to check for the existence of a toEnvelope
router.param('toEnvelope', (request, response, next, name) => {
    console.log('Running middleware to check for toEnvelope')
    pool.query('SELECT * FROM envelopes WHERE envelope = ($1)', [name], (error, results) => {
        if (error) {
            throw error;
        }

        if (results.rowCount < 1) {
            response.status(404).send(`${request.method}: ${name} not found`)
        }
        else {
            console.log(`${name} envelope found`)
            next();
        }
    });
});

// PUT route to allow subtraction of funds from an envelope
router.put('/:fromEnvelope/:amount', (request, response, next) => {
    const { fromEnvelope, amount } = request.params; 

    pool.query('UPDATE envelopes SET budgetAmount = budgetAmount - ($1) WHERE envelope = ($2)', [amount, fromEnvelope], (error, results) => {
        if (error) {
            throw error;
        } 
        else {
            const today = new Date();
            pool.query('INSERT INTO transactions (date, amount, fromAccount) VALUES (($1), ($2), ($3))', [today, amount, fromEnvelope], (error, results) => {
                if (error) {
                    throw error;
                } 
            });
            console.log(`${request.method}: Subtracted ${amount} from ${fromEnvelope}`)
            response.status(200).send(`${request.method}: Subtracted ${amount} from ${fromEnvelope}`);
        }
    });
});

// PUT route to transfer funds from one envelope to another
router.put('/:fromEnvelope/:toEnvelope/:amount', (request, response, next) => {
    const{ fromEnvelope, toEnvelope, amount } = request.params;
    pool.query('UPDATE envelopes SET budgetAmount = budgetAmount - ($1) WHERE envelope = ($2)', [amount, fromEnvelope], (error, results) => {
        if (error) {
            throw error;
        } 
        else {
            console.log(`${request.method}: Subtracted ${amount} from ${fromEnvelope}`)
        }
    });

    pool.query('UPDATE envelopes SET budgetAmount = budgetAmount + ($1) WHERE envelope = ($2)', [amount, toEnvelope], (error, results) => {
        if (error) {
            throw error;
        } 
        else {
            const today = new Date();
            pool.query('INSERT INTO transactions (date, amount, fromAccount, toAccount) VALUES (($1), ($2), ($3), ($4))', [today, amount, fromEnvelope, toEnvelope], (error, results) => {
                if (error) {
                    throw error;
                } 
            });
            console.log(`Money transferred`)
            response.status(200).send(`Money transferred`)
        }
    });
});

// Export the router
module.exports = router; 



