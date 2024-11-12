from flask import Flask, request, jsonify
from model.generate import generate_blog
from pymongo import MongoClient
import os

app = Flask(__name__)

# MongoDB connection URI
mongo_uri = os.getenv('MONGO_URI', 'mongodb+srv://abhangparth:ParthBlogGenerator@cluster0.nzrnb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')  # Use your MongoDB URI, default to localhost if not set
client = MongoClient(mongo_uri)

# Database and Collection setup
db = client.get_database("bloggenerator")  # Name of your database
blogs_collection = db.blogs  # Name of your collection

# Endpoint to create a new blog based on topic
@app.route('/generate-blog', methods=['POST'])
def create_blog():
    data = request.get_json()
    topic = data.get('topic')

    if not topic:
        return jsonify({"error": "Topic is required"}), 400

    # Construct the prompt automatically
    prompt = f"Write a 1000 words detailed blog on the topic: {topic}"

    # Generate blog text
    generated_text = generate_blog(prompt)

    # Clean up the generated text:
    cleaned_text = generated_text.replace(prompt, "").strip()  # Remove the prompt
    cleaned_text = cleaned_text.replace("\n", " ").strip()  # Remove excessive newlines

    # Store the generated blog in MongoDB
    new_blog = {
        "topic": topic,
        "content": cleaned_text
    }
    
    # Insert the blog into the MongoDB collection
    result = blogs_collection.insert_one(new_blog)
    new_blog["_id"] = str(result.inserted_id)  # Adding the MongoDB-generated _id to the response

    return jsonify(new_blog), 201

# Endpoint to get all generated blogs
@app.route('/blogs', methods=['GET'])
def get_blogs():
    # Retrieve all blogs from MongoDB
    blogs = list(blogs_collection.find())  # Returns a cursor, convert it to a list
    # Remove the MongoDB-specific _id field from each blog document
    for blog in blogs:
        blog["_id"] = str(blog["_id"])  # Convert ObjectId to string for JSON serialization
    return jsonify(blogs)

# Home page endpoint that returns all blogs or a message if no blogs are available
@app.route('/', methods=['GET'])
def home_page():
    # Retrieve all blogs from MongoDB
    blogs = list(blogs_collection.find())  # Convert cursor to a list
    
    if len(blogs) == 0:
        return jsonify({"message": "No available blogs"}), 200
    
    # Convert MongoDB ObjectId to string for JSON serialization
    for blog in blogs:
        blog["_id"] = str(blog["_id"])
    
    return jsonify(blogs)

if __name__ == '__main__':
    app.run(debug=True, port=4000)
