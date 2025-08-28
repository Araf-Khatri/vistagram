import os
from dotenv import load_dotenv

load_dotenv()  # Loads .env from root project directory

class Config:
    DB_HOST = os.getenv("DB_HOST")
    DB_PORT = int(os.getenv("DB_PORT", 5432))
    DB_NAME = os.getenv("DB_NAME")
    DB_PASSWORD = os.getenv("DB_PASSWORD")
    DB_USER = os.getenv("DB_USER")

    SQLALCHEMY_DATABASE_URI = DATEBASE_URI = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
    JWT_ACCESS_TOKEN_EXPIRES_DAYS = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES_DAYS", 7))
    

    URL_HASH_SECRET = os.getenv("URL_HASH_SECRET") or ""