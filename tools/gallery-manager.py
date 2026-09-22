from __future__ import annotations

import io
import json
import mimetypes
import os
import re
import shutil
import subprocess
import sys
import threading
import time
import urllib.parse
import webbrowser
from datetime import datetime
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

try:
    from PIL import Image, ImageOps
except ImportError:
    print("Pillow が必要です。start-gallery-manager.bat から起動してください。")
    raise

ROOT = Path(__file__).resolve().parent.parent
GALLERY_DIR = ROOT / "assets" / "gallery"
THUMBS_DIR = ROOT / "assets" / "thumbs"
MANIFEST = ROOT / "gallery.json"
MANAGER_HTML = Path(__file__).resolve().parent / "gallery-manager.html"
HOST = "127.0.0.1"
PORT = 8765
MAX_UPLOAD = 25 * 1024 * 1024
MAX_LONG_EDGE = 1600
THUMB_LONG_EDGE = 640
WEBP_QUALITY = 82
THUMB_QUALITY = 78

GALLERY_DIR.mkdir(parents=True, exist_ok=True)
THUMBS_DIR.mkdir(parents=True, exist_ok=True)


def load_manifest():
    try:
        data = json.loads(MANIFEST.read_text(encoding="utf-8"))
        if not isinstance(data, list):
            raise ValueError
        result = []
        for item in data:
            if isinstance(item, dict) and isinstance(item.get("file"), str):
                result.append({"file": item["file"], "thumb": item.get("thumb") or item["file"]})
        return result
    except Exception:
        return []


def save_manifest(items):
    MANIFEST.write_text(json.dumps(items, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def safe_filename(name):
    name = Path(name).name
    stem = re.sub(r"[^A-Za-z0-9_-]+", "-", Path(name).stem).strip("-_:") or "photo"
    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    candidate = f"{stamp}-{stem}.webp"
    n = 2
    while (GALLERY_DIR / candidate).exists():
        candidate = f"{stamp}-{stem}-{n}.webp"
        n += 1
    return candidate


def open_image(raw):
    img = Image.open(io.BytesIO(raw))
    img = ImageOps.exif_transpose(img)
    if img.mode not in ("RGB", "RGBA"):
        img = img.convert("RGB")
    if img.mode == "RGBA":
        bg = Image.new("RGB", img.size, "white")
        bg.paste(img, mask=img.getchannel("A"))
        img = bg
    return img


def fit_long_edge(img, max_edge):
    w, h = img.size
    edge = max(w, h)
    if edge <= max_edge:
        return img.copy()
    scale = max_edge / edge
    size = (max(1, round(w * scale)), max(1, round(h * scale)))
    return img.resize(size, Image.Resampling.LANCZOS)


def process_upload(raw, original_name):
    img = open_image(raw)
    filename = safe_filename(original_name)
    main = fit_long_edge(img, MAX_LONG_EDGE)
    thumb = fit_long_edge(img, THUMB_LONG_EDGE)
    main.save(GALLERY_DIR / filename, "WEBP", quality=WEBP_QUALITY, method=6)
    thumb.save(THUMBS_DIR / filename, "WEBP", quality=THUMB_QUALITY, method=6)
    return {"file": filename, "thumb": filename}


class Handler(BaseHTTPRequestHandler):
    server_version = "TetohouseGalleryManager/1.0"

    def log_message(self, format, *args):
        return

    def send_json(self, obj, status=200):
        payload = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(payload)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(payload)

    def send_file(self, path, content_type=None):
        if not path.exists() or not path.is_file():
            self.send_error(404)
            return
        data = path.read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", content_type or mimetypes.guess_type(path.name)[0] or "application/octet-stream")
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        if path in ("/", "/manager"):
            return self.send_file(MANAGER_HTML, "text/html; charset=utf-8")
        if path == "/api/gallery":
            return self.send_json(load_manifest())
        if path == "/api/status":
            return self.send_json({"ok": True, "root": str(ROOT), "count": len(load_manifest())})
        if path.startswith("/assets/"):
            rel = Path(urllib.parse.unquote(path.lstrip("/")))
            full = (ROOT / rel).resolve()
            if ROOT.resolve() not in full.parents:
                return self.send_error(403)
            return self.send_file(full)
        if path == "/preview":
            return self.send_file(ROOT / "index.html", "text/html; charset=utf-8")
        if path in ("/script.js", "/styles.css", "/gallery.json"):
            return self.send_file(ROOT / path.lstrip("/"))
        return self.send_error(404)

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/api/upload":
            length = int(self.headers.get("Content-Length", "0"))
            if length <= 0 or length > MAX_UPLOAD:
                return self.send_json({"ok": False, "error": "画像サイズは1枚25MB以下にしてください。"}, 400)
            original_name = urllib.parse.unquote(self.headers.get("X-Filename", "photo"))
            raw = self.rfile.read(length)
            try:
                item = process_upload(raw, original_name)
                items = load_manifest()
                items.append(item)
                save_manifest(items)
                return self.send_json({"ok": True, "item": item})
            except Exception as exc:
                return self.send_json({"ok": False, "error": f"画像を処理できませんでした: {exc}"}, 400)

        if parsed.path == "/api/order":
            try:
                length = int(self.headers.get("Content-Length", "0"))
                payload = json.loads(self.rfile.read(length).decode("utf-8"))
                files = payload.get("files")
                if not isinstance(files, list):
                    raise ValueError("files が不正です")
                current = {item["file"]: item for item in load_manifest()}
                if set(files) != set(current):
                    raise ValueError("写真一覧が変更されています。画面を再読み込みしてください。")
                save_manifest([current[name] for name in files])
                return self.send_json({"ok": True})
            except Exception as exc:
                return self.send_json({"ok": False, "error": str(exc)}, 400)

        if parsed.path == "/api/delete":
            try:
                length = int(self.headers.get("Content-Length", "0"))
                payload = json.loads(self.rfile.read(length).decode("utf-8"))
                filename = Path(payload.get("file", "")).name
                if not filename:
                    raise ValueError("ファイル名が不正です")
                items = load_manifest()
                kept = [item for item in items if item["file"] != filename]
                if len(kept) == len(items):
                    raise ValueError("写真が見つかりません")
                # 公開サイトの他セクションでも同じ画像を使うことがあるため、
                # ファイル本体は削除せず、室内写真ギャラリーの一覧からのみ外します。
                # これにより比較写真や設備写真のリンク切れを防ぎます。
                save_manifest(kept)
                return self.send_json({"ok": True})
            except Exception as exc:
                return self.send_json({"ok": False, "error": str(exc)}, 400)

        self.send_error(404)


def main():
    if not MANAGER_HTML.exists():
        raise SystemExit("gallery-manager.html が見つかりません")
    server = ThreadingHTTPServer((HOST, PORT), Handler)
    url = f"http://{HOST}:{PORT}/manager"
    print("TETO HOUSE 写真管理を起動しました。")
    print(f"管理画面: {url}")
    print("終了するにはこの黒い画面で Ctrl+C を押してください。")
    threading.Timer(0.7, lambda: webbrowser.open(url)).start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
