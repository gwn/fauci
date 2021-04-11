# Simple Ethereum Token Faucet


## Requirements

Token contract must have a `mint(toAddress, amount)` method. See
ABI in the source for details.


## Usage

    cp .env.example .env
    vim .env  # fill in the blanks
    npm i
    npm start -- 1337  # optionally pass a port parameter

Enjoy
