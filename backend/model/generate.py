from transformers import pipeline

# Initialize the generator once to avoid reloading for each request
generator = pipeline("text-generation", model="gpt2")

def generate_blog(prompt):
    # Adjust max_length for approximately 1000 words (set lower if necessary for coherence)
    blog = generator(prompt, max_length=1000, num_return_sequences=1)
    return blog[0]['generated_text']
