# [A Simple Expense Tracker](https://my-simple-expense-tracker.vercel.app/)

_Money is important. It is important to know the amount of money you are spending on things.._

This is a simple tool to track expenses, and is useful even in other countries, with automatic currency conversion, so that I can get a sense of the relative price of an item I am purchasing.

## Stack

- Vite
- React
- Tailwindcss
- Shadcn

## Features

- [x] display JSON data in a table
- [x] 'Add Item' button that opens a form to allow users to enter data
- [x] validation in form fields
- [x] the data in the form should added to the table upon form submission
- [x] light / dark mode toggle
- [x] use of exchange rate API
- [x] responsive design

## Running Locally

- clone the repo
- run `npm install` to install dependencies
- create a `.env` file in the root directory
- add your API key: `VITE_EXCHANGE_API_KEY=your_api_key_here`
- run `npm run dev` to start the dev server
- open `http://localhost:5173` in your browser

## Getting an API Key

- head to [ExchangeRate-API](https://www.exchangerate-api.com/)
- sign up for a free account
- grab your API key from the dashboard

## Deployment

For this application, I have it deployed on Vercel for simplicity.

In theory, deploying on AWS can be done using S3 and CloudFront to host the page as a static site
