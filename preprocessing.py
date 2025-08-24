import pandas as pd
import re

# Load your NIC file
df = pd.read_csv("data/nic_cleaned_final.csv", encoding="ISO-8859-1")

# Preprocessing function 
def preprocess(text):
    text = str(text).lower()  # lowercase for uncased models
    text = text.strip()  # remove leading/trailing spaces
    text = re.sub(r"\s+", " ", text)  # collapse multiple spaces
    return text


df["nic_description"] = df["nic_description"].apply(preprocess)

# Save the cleaned file
df.to_csv("data/nic_dataset.csv", index=False)

print("✅ Preprocessed dataset and save as nic_dataset")
