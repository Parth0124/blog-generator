const express = require("express");
const { generateBlog, getAllBlogs } = require("../Controllers/blogController");
const router = express.Router();

// Route for generating a blog post
router.post("/generate", generateBlog);

// Route for getting all blogs
router.get("/", getAllBlogs);

module.exports = router;
