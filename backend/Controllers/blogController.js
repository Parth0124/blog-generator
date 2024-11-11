const Blog = require("../Models/blog");
const axios = require("axios");

// Controller function to generate a blog post
exports.generateBlog = async (req, res) => {
  try {
    const { prompt } = req.body;

    // Validate input
    if (!prompt) {
      return res.status(400).json({ message: "Prompt is required" });
    }

    // Fetch OpenAI API key from environment variables
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: "API key is missing" });
    }

    // Generate blog content using OpenAI API
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a professional blog writer.",
          },
          {
            role: "user",
            content: `Write a 1000-word blog post about: ${prompt}. Include a title at the beginning of the post.`,
          },
        ],
        max_tokens: 1500,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Process the generated text
    const generatedText = response.data.choices[0].message.content.trim();
    const [title, ...contentArray] = generatedText.split("\n\n");

    // Create and save the new blog post
    const blog = new Blog({
      title: title.replace("Title: ", "").trim(),
      content: contentArray.join("\n\n"),
    });
    await blog.save();

    // Send the generated blog post as the response
    res.json(blog);
  } catch (error) {
    console.error("Error generating blog:", error);

    // Enhanced error handling
    if (error.response) {
      // OpenAI API error
      return res.status(error.response.status).json({
        message: "Error generating blog",
        error: error.response.data.error.message,
      });
    }

    res.status(500).json({
      message: "Error generating blog",
      error: error.message,
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
