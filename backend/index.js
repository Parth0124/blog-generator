const express = require("express");
const dotenv = require("dotenv"); // Import dotenv
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const generationRoutes = require("./Routes/blogRoute");

// Initialize environment variables
dotenv.config(); // Correct syntax

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.log("MongoDB connection error:", err));

// Create Express app
const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(bodyParser.json());

// Routes
app.use("/api/blog", generationRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
