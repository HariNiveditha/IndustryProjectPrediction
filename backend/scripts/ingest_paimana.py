from __future__ import annotations

import argparse
import json
from pathlib import Path

from app.services.dataset_ingestion_service import run_ingestion


def main() -> None:
    parser = argparse.ArgumentParser(description="Import the PAIMANA engineered dataset into MongoDB.")
    parser.add_argument(
        "--source",
        type=Path,
        help="CSV path; defaults to PAIMANA_DATASET_PATH or the project-relative default.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Validate and report the dataset without writing MongoDB.",
    )
    parser.add_argument(
        "--batch-size",
        type=int,
        help="MongoDB operations per bulk write; defaults to PAIMANA_INGEST_BATCH_SIZE or 500.",
    )
    args = parser.parse_args()
    report = run_ingestion(
        source_path=args.source,
        dry_run=args.dry_run,
        batch_size=args.batch_size,
    )
    print(json.dumps(report, indent=2, default=str))


if __name__ == "__main__":
    main()