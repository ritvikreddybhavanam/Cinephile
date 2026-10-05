from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import numpy as np
import joblib
import os

app = FastAPI(title="Cinephile Box Office Prediction API")

# Enable CORS for frontend and cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

MODEL_FILE = os.path.join(
    BASE_DIR,
    "models",
    "elastic_net_model4.pkl"
)

# Load model pipeline
model = joblib.load(MODEL_FILE)


class MovieInput(BaseModel):
    title: str
    budget: float
    runtime: float
    release_year: int
    release_month: int
    original_language: str
    main_country: str
    genres: list[str]


@app.get("/")
def home():
    return {
        "status": "online",
        "message": "Box Office Prediction API is running",
        "model": "ElasticNetPipeline"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


@app.post("/predict")
def predict(movie: MovieInput):
    safe_budget = max(0.0, float(movie.budget))
    safe_runtime = max(1.0, float(movie.runtime))

    data = {
        "budget": safe_budget,
        "log_budget": np.log1p(safe_budget),
        "runtime": safe_runtime,
        "release_year": int(movie.release_year),
        "release_month": int(movie.release_month),
        "original_language": str(movie.original_language or "en"),
        "main_country": str(movie.main_country or "United States of America")
    }

    genres = [
        "action",
        "adventure",
        "animation",
        "comedy",
        "crime",
        "documentary",
        "drama",
        "family",
        "fantasy",
        "history",
        "horror",
        "music",
        "mystery",
        "romance",
        "science_fiction",
        "thriller",
        "war",
        "western"
    ]

    input_genres = {str(g).strip().lower() for g in movie.genres}

    for genre in genres:
        key = genre.lower()
        readable = genre.replace("_", " ").lower()
        is_matched = (
            key in input_genres
            or readable in input_genres
            or (key == "science_fiction" and ("sci-fi" in input_genres or "scifi" in input_genres))
        )
        data["genre_" + genre] = 1 if is_matched else 0

    movie_data = pd.DataFrame([data])

    predicted_log_revenue = model.predict(movie_data)[0]

    predicted_revenue = np.expm1(predicted_log_revenue)
    predicted_revenue = max(0.0, float(predicted_revenue))

    return {
        "title": movie.title,
        "predicted_revenue": round(predicted_revenue, 2),
        "predicted_revenue_millions": round(predicted_revenue / 1_000_000, 2)
    }