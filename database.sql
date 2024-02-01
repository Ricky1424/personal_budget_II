-- Useful to delete everything during testing
DELETE FROM envelopes
WHERE id > 0;


-- Create the envelopes table
CREATE TABLE envelopes (
    id SERIAL PRIMARY KEY,
    envelope VARCHAR(100),
    budgetAmount INTEGER
);

-- Create the transactions table
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  date DATE,
  amount INTEGER,
  fromAccount VARCHAR(100),
  toAccount VARCHAR(100)
  );
