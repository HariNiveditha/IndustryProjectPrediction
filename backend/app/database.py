import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
MONGODB_DB = os.getenv("MONGODB_DB", "marg")

if not MONGODB_URI:
    raise ValueError("MONGODB_URI is not set in .env")

client = MongoClient(MONGODB_URI)

db = client[MONGODB_DB]

users_collection = db["users"]
projects_collection = db["projects"]
predictions_collection = db["predictions"]
alerts_collection = db["alerts"]
snapshots_collection = db["snapshots"]
explanations_collection = db["explanations"]

print("✅ MongoDB connection configured")