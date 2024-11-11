const express = require("express");
const {
  generateBlog,
  getRecentBlogs,
} = require("../Controllers/blogController");

const router = express.Router();

// Route to generate blog post text
router.post("/generate", generateBlog);

// Route to get all generated content
router.get("/all", getRecentBlogs);

module.exports = router;
