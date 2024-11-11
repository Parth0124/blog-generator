const axios = require("axios");
const Blog = require("../Models/blog");

// Controller function to generate a blog post
const generateBlog = async (req, res) => {
  const { topic } = req.body;

  if (!topic) {
    return res.status(400).json({ message: "Topic is required" });
  }

  try {
    // Prepare a dynamic and detailed prompt to improve the diversity of the output
    const prompt = `Write a 1000-word, well-researched blog post about ${topic}. Be detailed and provide examples where necessary.`;

    // Call Hugging Face API to generate blog content
    const response = await axios.post(
      "https://api-inference.huggingface.co/models/gpt-neo-2.7B", // Using a larger model for better quality
      {
        inputs: prompt,
        parameters: {
          temperature: 0.7, // Controls randomness: 1 is most random, 0 is deterministic
          max_length: 1500, // You can adjust the max length here
          top_p: 0.9, // Helps to sample from a more diverse set of tokens
          top_k: 50, // Limits the model's sampling options
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
        },
      }
    );

    // Extract the generated content and clean it up (remove prompt from content)
    const generatedContent = response.data[0].generated_text;
    const cleanContent = generatedContent.replace(prompt, "").trim();

    // Create a new blog post with the cleaned-up content
    const blogPost = new Blog({
      title: `Blog on ${topic}`,
      content: cleanContent, // Store only the content, excluding the prompt
      topic: topic,
    });

    // Save the blog post to the database
    await blogPost.save();

    // Send the response with the generated blog
    res.status(200).json({
      message: "Blog generated successfully!",
      blog: blogPost,
    });
  } catch (error) {
    console.error("Error generating blog:", error);
    res.status(500).json({ message: "Error generating blog", error });
  }
};

module.exports = { generateBlog };


// Controller function to get all blogs
const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find(); // Retrieve all blogs from the database
    res.status(200).json({
      message: "Blogs fetched successfully!",
      blogs: blogs,
    });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({ message: "Error fetching blogs", error });
  }
};

module.exports = { generateBlog, getAllBlogs };
