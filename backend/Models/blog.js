const mongoose = require("mongoose");

const GeneratedContentSchema = new mongoose.Schema({
  prompt: {
    type: String,
    required: true,
  },
  generatedText: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const GeneratedContent = mongoose.model(
  "GeneratedContent",
  GeneratedContentSchema
);

module.exports = GeneratedContent;
