import pandas as pd
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
import os

def build_faiss(model_name, input_csv, index_path):
    df = pd.read_csv(input_csv)
    descriptions = df['nic_description'].tolist()

    print(f"Encoding with {model_name}...")
    model = SentenceTransformer(model_name)
    embeddings = model.encode(descriptions, convert_to_numpy=True, normalize_embeddings=True)

    # Create FAISS index
    dimension = embeddings.shape[1]
    index = faiss.IndexFlatIP(dimension)
    index.add(embeddings)

    faiss.write_index(index, index_path)
    print(f"✅ FAISS index saved: {index_path}")

if __name__ == "__main__":
    os.makedirs("models", exist_ok=True)
    # build_faiss("all-MiniLM-L6-v2", "data/nic_cleaned.csv", "models/faiss_index_minilm.index")
    build_faiss("all-mpnet-base-v2", "data/nic_dataset.csv", "models/faiss_index_mpnet.index")
