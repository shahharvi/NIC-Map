import pandas as pd
from transformers import pipeline

# Load cleaned NIC dataset
df = pd.read_csv("nic_cleaned_filtered.csv", dtype=str)

# Load free HuggingFace model (FLAN-T5 is light and runs on CPU)
generator = pipeline("text2text-generation", model="google/flan-t5-base")

# Refined prompt for business description generation
def generate_business_description(nic_desc):
    prompt = f"""
    You are helping create training data for NIC classification.

    NIC official description: "{nic_desc}"

    Task: Write a free-form business description of a company engaged in this activity.
    It must mean the same as the NIC description, but written in natural language
    as if describing the company.

    Guidelines:
    - Keep it short (1–2 sentences).
    - Stay faithful to the NIC description (do not add unrelated activities).
    - Use simple, realistic wording (like a company profile).
    - Output only the business description.
    """
    result = generator(prompt, max_length=80, num_return_sequences=1)[0]["generated_text"]
    return result.strip()

# Apply generation (⚠️ This will take time for all 1300+ rows)
df["business_description"] = df["nic_description"].apply(generate_business_description)

# Save enriched dataset
df.to_csv("nic_with_business_desc.csv", index=False)
print("✅ Saved enriched dataset with business descriptions.")
