import pandas as pd
from sentence_transformers import SentenceTransformer
import faiss

def search(query, model_name, csv_path, index_path, top_k=5):
    df = pd.read_csv(csv_path)
    model = SentenceTransformer(model_name)

    # Load FAISS index
    index = faiss.read_index(index_path)

    # Encode query
    query_vec = model.encode([query], convert_to_numpy=True, normalize_embeddings=True)

    # Search
    scores, indices = index.search(query_vec, top_k)
    results = []
    for idx, score in zip(indices[0], scores[0]):
        results.append({
            "nic_code": df.iloc[idx]['nic_code'],
            "nic_description": df.iloc[idx]['nic_description'],
            "score": float(score)
        })
    return results

if __name__ == "__main__":
    query = "Planning to open a shop that roasts coffee beans and sells packaged ground coffee"
    results = search(query, "all-mpnet-base-v2", "data/nic_dataset.csv", "models/faiss_index_mpnet.index")

    print("\n🔎 Results:")
    for r in results:
        print(f"{r['nic_code']} - {r['nic_description']} (Score: {r['score']:.4f})")
