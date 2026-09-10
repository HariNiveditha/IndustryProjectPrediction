import os
from pathlib import Path

from dotenv import load_dotenv


ENV_FILE = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(ENV_FILE)


def _required_environment_variable(name: str) -> str:
	value = os.getenv(name)
	if not value:
		raise RuntimeError(
			f"Required environment variable '{name}' is missing. "
			f"Set it in {ENV_FILE} or the process environment."
		)
	return value


MONGODB_URI = _required_environment_variable("MONGODB_URI")
DATABASE_NAME = _required_environment_variable("DATABASE_NAME")
