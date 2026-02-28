require("dotenv").config();

/* const connectDB = require('./config/database'); */

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");



/* const app = require('app'); */
const app = express();
const PORT = process.env.PORT || 5000;

/* // Connect to database
connectDB(); */

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

module.exports = server;