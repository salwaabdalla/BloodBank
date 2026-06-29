# Blood Bank Management System

A full-stack web application for managing blood bank operations — donors, donations, inventory, blood requests, patients, hospitals, camps, staff, payments, and notifications.

## Tech Stack

- **Frontend:** React (Vite), Axios
- **Backend:** Node.js, Express.js
- **Database:** Oracle DB
- **ORM/Driver:** oracledb (node-oracledb)

## Features

- Dashboard with live statistics
- Donor registration and eligibility management
- Donation tracking with medical test results
- Blood inventory management per bank and blood type
- Blood request processing with automatic inventory deduction and transfusion recording
- Patient and hospital management
- Donation camps scheduling
- Staff management
- Payment tracking
- Notifications system
- Chat widget

## Database

The Oracle schema includes 15 tables, sequences, stored procedures, functions, triggers, and a package:

- **Tables:** blood_type, blood_bank, hospital, staff, donor, patient, camp, appointment, donation, medical_test, blood_inventory, blood_request, transfusion, payment, notification
- **PL/SQL:** `register_donor`, `record_donation`, `process_blood_request`, `check_and_deduct_inventory`, `pkg_blood_bank` package, triggers on donor/donation/blood_request

## Project Structure

```
BloodBank/
├── client/              # React frontend (Vite)
│   └── src/
│       ├── components/  # ChatWidget, Sidebar, Splash
│       └── pages/       # Dashboard, Donors, Donations, Inventory, etc.
├── server/              # Express backend
│   ├── routes/          # API route handlers (banks, donors, donations, etc.)
│   ├── db.js            # Oracle DB connection setup
│   └── index.js         # Server entry point
├── schema.sql           # Table and sequence definitions
├── data.sql             # Sample data
├── plsql.sql            # Functions, procedures, package, triggers
└── demo.sql             # Anonymous block demos for testing PL/SQL
```

## Setup & Installation

### Prerequisites

- Node.js (v18+)
- Oracle Database (XE or equivalent) with a `bloodbank` user/schema
- npm

### 1. Clone the repository


git clone https://github.com/salwaabdalla/BloodBank.git
cd BloodBank
```

### 2. Set up the database

Run the SQL scripts in order against your Oracle instance:


-- In SQL*Plus or your preferred Oracle client
@schema.sql
@data.sql
@plsql.sql
```

Optionally run `@demo.sql` to verify the procedures, functions, package, and triggers work as expected.

### 3. Configure environment variables

In `server/`, create a `.env` file (see `server/.env.example` for the required keys) with your Oracle connection details and any API keys used by the chat widget.

### 4. Install dependencies


# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 5. Run the application


# Start the backend (from /server)
npm start

# Start the frontend (from /client, in a separate terminal)
npm run dev
```

The frontend will be available at the local Vite dev URL (typically `http://localhost:5173`), and the backend API at the port configured in `server/index.js`.
