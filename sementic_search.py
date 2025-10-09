import pandas as pd
import faiss
from sentence_transformers import SentenceTransformer


# Load once when app starts
CSV_PATH = "data/nic_dataset.csv"
INDEX_PATH = "models/faiss_index_mpnet.index"
MODEL_NAME = "all-mpnet-base-v2"

# Lazy loading - only load when first needed
_df = None
_model = None
_index = None

def get_df():
    global _df
    if _df is None:
        _df = pd.read_csv(CSV_PATH)
    return _df

def get_model():
    global _model
    if _model is None:
        _model = SentenceTransformer(MODEL_NAME)
    return _model

def get_index():
    global _index
    if _index is None:
        _index = faiss.read_index(INDEX_PATH)
    return _index

def semantic_search(query, top_k=5):
    # Get resources lazily
    df = get_df()
    model = get_model()
    index = get_index()
    
    # Encode query
    query_vec = model.encode([query], convert_to_numpy=True, normalize_embeddings=True)

    # Search in FAISS
    scores, indices = index.search(query_vec, top_k)

    results = []
    for idx, score in zip(indices[0], scores[0]):
        results.append({
            "code": str(df.iloc[idx]['nic_code']),
            "description": df.iloc[idx]['nic_description'],
            "confidence": float(score)  # similarity score
        })
    return results
