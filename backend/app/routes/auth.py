from fastapi import APIRouter
from pydantic import BaseModel
from passlib.context import CryptContext

from app.database import users_collection


router = APIRouter()

# Password hashing
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


class RegisterRequest(BaseModel):
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


# REGISTER
@router.post("/register")
async def register(user: RegisterRequest):

    # Check if user already exists
    existing_user = users_collection.find_one({
        "email": user.email
    })

    if existing_user:
        return {
            "success": False,
            "message": "User already exists"
        }

    # Hash password
    hashed_password = pwd_context.hash(user.password)

    # Save user in MongoDB
    users_collection.insert_one({
        "email": user.email,
        "password": hashed_password
    })

    return {
        "success": True,
        "message": "User registered successfully"
    }


# LOGIN
@router.post("/login")
async def login(user: LoginRequest):

    # Find user in MongoDB
    existing_user = users_collection.find_one({
        "email": user.email
    })

    if not existing_user:
        return {
            "success": False,
            "message": "User not found"
        }

    # Verify password
    password_correct = pwd_context.verify(
        user.password,
        existing_user["password"]
    )

    if not password_correct:
        return {
            "success": False,
            "message": "Invalid password"
        }

    return {
        "success": True,
        "message": "Login successful"
    }