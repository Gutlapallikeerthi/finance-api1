# Finance API

This is a RESTful API for managing personal financial records. Users can record their income and expenses, retrieve past transactions, and generate reports, such as monthly spending by category. The API also supports user authentication via JWT, allowing users to manage their own transactions securely.

## Table of Contents
- [Setup Instructions](#setup-instructions)
- [Run the Application](#run-the-application)
- [API Documentation](#api-documentation)
  - [POST /register](#post-register)
  - [POST /login](#post-login)
  - [POST /transactions](#post-transactions)
  - [GET /transactions](#get-transactions)
  - [GET /transactions/:id](#get-transactionsid)
  - [PUT /transactions/:id](#put-transactionsid)
  - [DELETE /transactions/:id](#delete-transactionsid)
  - [GET /summary](#get-summary)
  - [GET /report](#get-report)


## Setup Instructions

### Prerequisites
- Node.js and npm (or yarn) installed on your machine.
- SQLite installed or use of an in-memory database (default).

**###** Steps to Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/finance-api.git
cd finance-api

2.Navigate into the project directory:

    cd finance-api

3.Install the dependencies:

    npm install

4.Set up the SQLite database:

    Ensure that database.js sets up the required tables: transactions, categories, and users.

5.Run the application:

    node app.js
6.The server will run on http://localhost:3000.

Run the Application

To start the server:


node app.js

You can test the API using Postman, curl, or any other API client.

###API Documentation
POST /register
Description: Register a new user.

Request:

json

###POST /register
Content-Type: application/json
{
  "username": "testuser",
  "password": "password123"
}
Response:

json
201 Created
{
  "id": 1
}
###POST /login
Description: Log in an existing user and retrieve a JWT token.

Request:

json

###POST /login
Content-Type: application/json
{
  "username": "testuser",
  "password": "password123"
}
Response:

json

200 OK
{
  "token": "your-jwt-token"
}
###POST /transactions
Description: Add a new transaction (income or expense).

Request:

json

###POST /transactions
Authorization: Bearer <token>
Content-Type: application/json
{
  "type": "income",
  "category_id": 1,
  "amount": 500,
  "date": "2024-10-22",
  "description": "Freelance work"
}
Response:

json

201 Created
{
  "id": 1
}
###GET /transactions
Description: Retrieve all transactions for the authenticated user. Supports pagination with page and limit query parameters.

Request:


###GET /transactions?page=1&limit=10
Authorization: Bearer <token>
Response:

json

200 OK
[
  {
    "id": 1,
    "type": "income",
    "category_id": 1,
    "amount": 500,
    "date": "2024-10-22",
    "description": "Freelance work",
    "user_id": 1
  }
]
###GET /transactions/
Description: Retrieve a specific transaction by ID.

Request:


###GET /transactions/1
Authorization: Bearer <token>
Response:

json

200 OK
{
  "id": 1,
  "type": "income",
  "category_id": 1,
  "amount": 500,
  "date": "2024-10-22",
  "description": "Freelance work",
  "user_id": 1
}
###PUT /transactions/
Description: Update a transaction by ID.

Request:

json

###PUT /transactions/1
Authorization: Bearer <token>
Content-Type: application/json
{
  "type": "expense",
  "category_id": 2,
  "amount": 200,
  "date": "2024-10-23",
  "description": "Updated description"
}
Response:

json
200 OK
{
  "updated": 1
}
###DELETE /transactions/
Description: Delete a transaction by ID.

Request:


###DELETE /transactions/1
Authorization: Bearer <token>
Response:

json

204 No Content
###GET /summary
Description: Retrieve a summary of the user's transactions (total income, total expenses, and balance). Optionally filter by category_id, startDate, and endDate.

Request:

###GET /summary
Authorization: Bearer <token>
Response:

json

200 OK
{
  "total_income": 1000,
  "total_expenses": 500,
  "balance": 500
}
###GET /report
Description: Retrieve a monthly report of spending by category.

Request:


###GET /report?year=2024&month=10
Authorization: Bearer <token>
Response:

json

200 OK
[
  {
    "category": "Food",
    "total_spent": 300
  },
  {
    "category": "Entertainment",
    "total_spent": 100
  }
]











