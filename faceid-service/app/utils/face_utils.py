import numpy as np

def embedding_to_list(embedding):
    return embedding.tolist()

def list_to_embedding(data):
    return np.array(data, dtype=np.float32)

def cosine_similarity(a, b):

    return np.dot(a,b) / (
        np.linalg.norm(a) *
        np.linalg.norm(b)
    )