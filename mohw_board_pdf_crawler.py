# mohw_board_pdf_crawler.py
import argparse
import contextlib
import logging
import os
import re
import sys
import time
import hashlib
import urllib.parse
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Optional, Iterable
import requests
from bs4 import BeautifulSoup
from tqdm import tqdm

BASE = "https://www.mohw.go.kr"
LIST_URL = f"{BASE}/board.es"  # https://www.mohw.go.kr/board.es?mid=a10409020000&bid=0026
MID = "a10409020000"
BID = "0026"

OUTDIR = Path("./mohw_pdfs").resolve()
FLAT_OUTPUT_DIR = OUTDIR / "flat"
LOG_DIR = Path("./logs").resolve()

# 크롤링 매너
HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; mohw-pdf-crawler/1.0; +https://example.com)",
}
REQUEST_TIMEOUT = 20
RETRY = 3
SLEEP_LIST = 0.6    # 리스트 페이지 간 딜레이(초)
SLEEP_VIEW = 0.6    # 상세 페이지 간 딜레이(초)
SLEEP_DOWNLOAD = 0.8 # 파일 다운로드 간 딜레이(초)

logger = logging.getLogger("mohw_crawler")


class Tee:
    def __init__(self, *streams):
        self.streams = streams

    def write(self, data: str):
        for stream in self.streams:
            stream.write(data)
        return len(data)

    def flush(self):
        for stream in self.streams:
            stream.flush()

    def __getattr__(self, item):
        return getattr(self.streams[0], item)


def setup_logging() -> Path:
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    log_path = LOG_DIR / f"crawler_{timestamp}.log"

    for handler in list(logger.handlers):
        logger.removeHandler(handler)

    logger.setLevel(logging.INFO)

    formatter = logging.Formatter(
        fmt="%(asctime)s %(levelname)s %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    file_handler = logging.FileHandler(log_path, encoding="utf-8")
    file_handler.setFormatter(formatter)
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)

    logger.addHandler(file_handler)
    logger.addHandler(console_handler)

    return log_path


session = requests.Session()
session.headers.update(HEADERS)

def get(url, params=None, stream=False):
    for i in range(RETRY):
        try:
            r = session.get(url, params=params, timeout=REQUEST_TIMEOUT, stream=stream)
            if r.status_code == 200:
                return r
            time.sleep(1.0 + i)
        except requests.RequestException:
            time.sleep(1.0 + i)
    raise RuntimeError(f"GET 실패: {url} {params}")

def sanitize_filename(name: str) -> str:
    # 한글/영문/숫자/일부기호만 허용
    name = re.sub(r"[^\w\-\.\s가-힣()_\[\]]+", "_", name)
    return name.strip()[:200]

def parse_list(html: str) -> List[Dict]:
    """
    목록 페이지에서 상세 페이지 링크(게시글 id 포함)를 추출.
    사이트가 act/view, list_no/bno 등 다양한 파라미터를 쓸 수 있어
    '/board.es'이면서 mid, bid가 동일하고, view로 가는 링크를 모두 수집.
    """
    soup = BeautifulSoup(html, "html.parser")
    items = []
    for a in soup.select("a[href*='/board.es']"):
        href = a.get("href", "")
        if "mid=" not in href or "bid=" not in href:
            continue
        if f"mid={MID}" not in href or f"bid={BID}" not in href:
            continue
        # 상세(view) 페이지 추정: list_no, bno, act=view 중 하나 포함
        if all(key not in href for key in ["list_no=", "bno=", "act=view"]):
            continue
        url = urllib.parse.urljoin(BASE, href)
        # 게시글 ID 추출(우선순위: list_no, bno, 그 외 전체 쿼리 해시)
        q = urllib.parse.urlparse(url).query
        qs = urllib.parse.parse_qs(q)
        post_id = qs.get("list_no", [None])[0] or qs.get("bno", [None])[0]
        if not post_id:
            post_id = hashlib.md5(q.encode("utf-8")).hexdigest()  # fallback
        title = a.get_text(strip=True)
        items.append({"title": title, "view_url": url, "post_id": str(post_id)})
    # 중복 제거(같은 post_id)
    uniq = {}
    for it in items:
        uniq[it["post_id"]] = it
    return list(uniq.values())

def extract_notice_meta(title: str, view_html: str) -> Dict:
    # 고시번호/시행일을 본문에서 느슨하게 추출
    num = re.search(r"제?\s*(\d{4}-\d+)\s*호", view_html)
    eff = re.search(r"(시행\s*:?|시행일\s*:?)[^\d]*(\d{4}[.\-]\d{1,2}[.\-]\d{1,2})", view_html)
    return {
        "title_in_list": title,
        "notice_no": num.group(1) if num else None,
        "effective": eff.group(2) if eff else None,
    }

PDF_EXT = ".pdf"


def extract_pdf_links(view_html: str) -> List[Dict]:
    soup = BeautifulSoup(view_html, "html.parser")
    links = []
    for a in soup.select("a[href]"):
        href = a["href"]
        url = urllib.parse.urljoin(BASE, href)
        low_href = href.lower()
        title_attr = a.get("title", "").strip()
        text = a.get_text(strip=True)
        candidate = title_attr or text or url.split("/")[-1]
        if "attachpreview.es" in low_href:
            continue
        has_pdf_hint = ".pdf" in candidate.lower() or ".pdf" in low_href
        if not has_pdf_hint:
            continue
        links.append({"name": candidate, "url": url})
    # 중복 제거
    seen = set()
    out = []
    for f in links:
        key = f["url"]
        if key in seen: 
            continue
        seen.add(key)
        out.append(f)
    return out

def _resolve_filename(response, fallback: str) -> str:
    cd = response.headers.get("Content-Disposition") or response.headers.get(
        "content-disposition"
    )
    filename = None
    if cd:
        parts = cd.split(";")
        for part in parts:
            if "=" not in part:
                continue
            key, value = part.strip().split("=", 1)
            key = key.lower()
            value = value.strip().strip('"')
            if key == "filename*":
                # RFC 5987: filename*=charset''encoded
                if "'" in value:
                    _, _, encoded = value.partition("''")
                    filename = urllib.parse.unquote(encoded)
                else:
                    filename = urllib.parse.unquote(value)
                break
            if key == "filename":
                filename = urllib.parse.unquote(value)
                break
    if not filename:
        filename = fallback
    return filename


def download_pdf(url: str, flat_dir: Path, original_name: str) -> Optional[Path]:
    r = get(url, stream=True)
    filename = _resolve_filename(r, original_name)
    filename = sanitize_filename(filename)
    suffix = Path(filename).suffix.lower()
    content_type = (r.headers.get("Content-Type") or "").lower()
    is_pdf_content = "application/pdf" in content_type

    if suffix != PDF_EXT:
        if is_pdf_content:
            stem_name = sanitize_filename(Path(filename).stem) or "document"
            filename = f"{stem_name}{PDF_EXT}"
        else:
            logger.info(
                "Skipping non-PDF download: %s (filename=%s, content-type=%s)",
                url,
                filename,
                content_type,
            )
            return None
    else:
        # ensure trailing looks sane after sanitize
        filename = sanitize_filename(Path(filename).stem) or "document"
        filename = f"{filename}{PDF_EXT}"

    flat_dir.mkdir(parents=True, exist_ok=True)
    out_path = flat_dir / filename

    # Resolve potential name collisions by appending an incrementing suffix.
    counter = 1
    candidate = out_path
    while candidate.exists():
        candidate = flat_dir / f"{Path(filename).stem}_{counter}{PDF_EXT}"
        counter += 1
    out_path = candidate

    with open(out_path, "wb") as f:
        for chunk in r.iter_content(chunk_size=8192):
            if chunk:
                f.write(chunk)
    return out_path

def _process_page(page: int, done_ids: set) -> bool:
    params = {"mid": MID, "bid": BID, "nPage": page}
    try:
        html = get(LIST_URL, params=params).text
    except Exception as exc:
        logger.warning("Failed to fetch page %s (%s)", page, exc)
        return False

    items = parse_list(html)
    if not items:
        logger.info("Page %s returned no posts", page)
        return False

    for it in items:
        pid = it["post_id"]
        if pid in done_ids:
            continue
        time.sleep(SLEEP_VIEW)
        try:
            vhtml = get(it["view_url"]).text
        except Exception as exc:
            logger.warning("Failed to fetch post %s (%s)", pid, exc)
            continue

        meta = extract_notice_meta(it["title"], vhtml)
        pdfs = extract_pdf_links(vhtml)
        if pdfs:
            for f in pdfs:
                time.sleep(SLEEP_DOWNLOAD)
                try:
                    out = download_pdf(f["url"], OUTDIR, f["name"])
                    if out:
                        logger.info("Saved PDF: '%s'", out.name)
                except Exception as exc:
                    logger.warning("Failed to download %s (%s)", f["url"], exc)

        done_ids.add(pid)

    return True


def crawl_all(
    page_numbers: Optional[Iterable[int]] = None,
    start_page: int = 1,
    end_page: Optional[int] = None,
) -> None:
    OUTDIR.mkdir(parents=True, exist_ok=True)
    done_ids: set[str] = set()
    logger.info(
        "Starting crawl (start_page=%s, end_page=%s, explicit_pages=%s)",
        start_page,
        end_page,
        list(page_numbers) if page_numbers else None,
    )

    if page_numbers:
        unique_pages = sorted({p for p in page_numbers if isinstance(p, int) and p >= 1})
        if not unique_pages:
            logger.info("No valid pages supplied; nothing to do.")
            return
        for page in unique_pages:
            _process_page(page, done_ids)
            time.sleep(SLEEP_LIST)
        logger.info("Finished requested pages.")
        return

    page = max(1, start_page)
    empty_pages = 0

    if page_numbers:
        unique_pages = sorted({p for p in page_numbers if isinstance(p, int) and p >= 1})
        total_pages = len(unique_pages)
        if not unique_pages:
            logger.info("No valid pages supplied; nothing to do.")
            return
        progress = tqdm(total=total_pages, desc="Pages", unit="page", leave=True)
        for idx, page in enumerate(unique_pages, start=1):
            _process_page(page, done_ids)
            logger.info("Progress: %d/%d pages processed", idx, total_pages)
            time.sleep(SLEEP_LIST)
            progress.update(1)
        progress.close()
        logger.info("Finished requested pages.")
        return

    final_page = None
    if end_page is not None and end_page >= page:
        final_page = end_page

    total_steps = None
    if final_page is not None:
        total_steps = final_page - page + 1
    else:
        total_steps = None

    progress = tqdm(total=total_steps, desc="Pages", unit="page", leave=True)

    while True:
        if end_page is not None and page > end_page:
            break

        processed = _process_page(page, done_ids)

        if processed:
            logger.info("Completed page %s", page)
            empty_pages = 0
        else:
            logger.info("Page %s had no data or failed", page)
            empty_pages += 1
            if empty_pages >= 2:
                break

        page += 1
        time.sleep(SLEEP_LIST)
        progress.update(1)

    progress.close()
    logger.info("Finished crawl.")


def parse_pages_argument(pages_arg: Optional[str]) -> Optional[List[int]]:
    if not pages_arg:
        return None

    pages: set[int] = set()
    for part in pages_arg.split(","):
        token = part.strip()
        if not token:
            continue
        if "-" in token:
            start_str, end_str = token.split("-", 1)
            try:
                start = int(start_str)
                end = int(end_str)
            except ValueError:
                raise ValueError(f"Invalid page range token: {token}")
            if start > end:
                start, end = end, start
            if start < 1:
                start = 1
            pages.update(range(start, end + 1))
        else:
            try:
                page = int(token)
            except ValueError:
                raise ValueError(f"Invalid page token: {token}")
            if page >= 1:
                pages.add(page)
    if not pages:
        return None
    return sorted(pages)


def build_arg_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="MOHW board PDF crawler")
    parser.add_argument(
        "--start-page",
        type=int,
        default=1,
        help="Page number to start from (default: 1)",
    )
    parser.add_argument(
        "--end-page",
        type=int,
        help="Inclusive end page (optional). Ignored when --pages is provided.",
    )
    parser.add_argument(
        "--pages",
        type=str,
        help="Comma-separated list or ranges of pages to crawl (e.g., '1,3,5-7').",
    )
    return parser


def main() -> None:
    parser = build_arg_parser()
    args = parser.parse_args()

    log_path = setup_logging()
    logger.info("Log file: %s", log_path)

    pages = None
    if args.pages:
        try:
            pages = parse_pages_argument(args.pages)
        except ValueError as exc:
            logger.error("%s", exc)
            parser.exit(status=2, message=f"{exc}\n")

    start_page = max(1, args.start_page)
    end_page = args.end_page if args.end_page and args.end_page >= start_page else None

    with open(log_path, "a", encoding="utf-8") as log_file:
        tee_out = Tee(sys.stdout, log_file)
        tee_err = Tee(sys.stderr, log_file)
        with contextlib.redirect_stdout(tee_out), contextlib.redirect_stderr(tee_err):
            crawl_all(page_numbers=pages, start_page=start_page, end_page=end_page)

if __name__ == "__main__":
    main()
