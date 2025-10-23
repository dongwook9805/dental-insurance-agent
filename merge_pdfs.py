#!/usr/bin/env python3
"""
Utility to combine every PDF underneath mohw_pdfs/ into a single PDF.

Usage
-----
    python3 merge_pdfs.py

The script will scan /Users/lucas.dw.lee/Desktop/dental-insurance-agent/mohw_pdfs
recursively, gather every *.pdf file (case-insensitive), sort them by path, and
merge them into:

    /Users/lucas.dw.lee/Desktop/dental-insurance-agent/mohw_pdfs_combined.pdf

Requires the `pypdf` package. Install once with:

    pip install pypdf
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

try:
    from pypdf.errors import PdfReadError
    from pypdf import PdfReader, PdfWriter
except ModuleNotFoundError as exc:  # pragma: no cover
    raise SystemExit(
        "Missing dependency: pypdf\nInstall it with `pip install pypdf`."
    ) from exc


DEFAULT_INPUT_DIR = Path(
    "/Users/lucas.dw.lee/Desktop/dental-insurance-agent/mohw_pdfs"
).resolve()
DEFAULT_OUTPUT = Path(
    "/Users/lucas.dw.lee/Desktop/dental-insurance-agent/mohw_pdfs_combined.pdf"
).resolve()


def collect_pdfs(root: Path) -> list[Path]:
    """Return a sorted list of all PDF files beneath ``root``."""
    if not root.exists():
        raise FileNotFoundError(f"Input directory does not exist: {root}")

    pdfs = sorted(
        (path for path in root.rglob("*.pdf") if path.is_file()),
        key=lambda p: p.as_posix().lower(),
    )
    if not pdfs:
        raise FileNotFoundError(f"No PDF files found under {root}")
    return pdfs


def merge_pdfs(pdfs: list[Path], output: Path) -> tuple[int, list[tuple[Path, str]]]:
    """Merge the PDFs in ``pdfs`` into ``output``."""
    writer = PdfWriter()
    skipped: list[tuple[Path, str]] = []
    for pdf in pdfs:
        try:
            reader = PdfReader(pdf, strict=False)
        except PdfReadError as exc:
            skipped.append((pdf, str(exc)))
            continue
        for page in reader.pages:
            writer.add_page(page)

    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open("wb") as f:
        writer.write(f)
    return len(pdfs) - len(skipped), skipped


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Merge all PDFs under a directory into a single PDF."
    )
    parser.add_argument(
        "--input-dir",
        type=Path,
        default=DEFAULT_INPUT_DIR,
        help=f"Directory to scan for PDFs (default: {DEFAULT_INPUT_DIR})",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=DEFAULT_OUTPUT,
        help=f"Output PDF path (default: {DEFAULT_OUTPUT})",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> None:
    args = parse_args(argv or sys.argv[1:])
    pdfs = collect_pdfs(args.input_dir)
    merged_count, skipped = merge_pdfs(pdfs, args.output)

    total_found = len(pdfs)
    print(f"Found {total_found} PDF files under {args.input_dir}")
    print(f"Merged {merged_count} PDF files into {args.output}")

    if skipped:
        print("Skipped files due to read errors:")
        for path, reason in skipped:
            print(f"  - {path}: {reason}")


if __name__ == "__main__":
    main()
