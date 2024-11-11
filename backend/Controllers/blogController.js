const Blog = require("../Models/blog");
const axios = require("axios");

exports.generateBlog = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ message: "Prompt is required" });
    }

    const apiKey = process.env.HUGGING_FACE_API_KEY;
    console.log(apiKey)
    if (!apiKey) {
      return res.status(500).json({ message: "API key is missing" });
    }

    const response = await axios.post(
      "https://api-inference.huggingface.co/models/EleutherAI/gpt-neo-2.7B",
      {
        inputs: `Write a 1000-word blog post about: ${prompt}. Include a title.`,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const generatedText = response.data[0].generated_text.trim();
    if (!generatedText) {
      return res.status(500).json({ message: "Failed to generate content" });
    }

    const [title, ...contentArray] = generatedText.split("\n\n");
    const blog = new Blog({
      title: title.replace("Title: ", "").trim(),
      content: contentArray.join("\n\n"),
      prompt,
      generatedText,
    });

    await blog.save();
    res.json(blog);
  } catch (error) {
    console.error(
      "Error generating blog:",
      error.response?.data || error.message
    );
    res.status(500).json({
      message: "Error generating blog",
      error: error.response?.data?.error || error.message,
    });
  }
};

// Controller function to fetch recent blog posts
exports.getRecentBlogs = async (req, res) => {
  try {
    // Fetch the 5 most recent blog posts
    const blogs = await Blog.find().sort({ createdAt: -1 }).limit(5);
    res.json(blogs);
  } catch (error) {
    console.error("Error fetching recent blogs:", error);
    res.status(500).json({
      message: "Error fetching recent blogs",
      error: error.message,
    });
  }
};
