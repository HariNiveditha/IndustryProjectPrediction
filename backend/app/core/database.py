from pymongo import MongoClient
from pymongo.errors import PyMongoError

from app.core.config import DATABASE_NAME, MONGODB_URI


client = MongoClient(
	MONGODB_URI,
	serverSelectionTimeoutMS=10_000,
	connectTimeoutMS=10_000,
	socketTimeoutMS=30_000,
	retryWrites=True,
)
database = client[DATABASE_NAME]


def test_connection() -> bool:
	"""Return whether MongoDB responds to a ping command."""
	try:
		client.admin.command("ping")
		return True
	except PyMongoError:
		return False
