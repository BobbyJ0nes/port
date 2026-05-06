#!/usr/bin/env python3
"""
serve.py — local dev server for port_v2 with three production-matching
behaviours that Python's stock http.server lacks:

  1.  Extension-less URL fallback. GitHub Pages tries `/foo`, then
      `/foo.html`, then `/foo/index.html`. Stock Python only does the
      first two of those when paths happen to exist; this handler does
      the full ladder, so Quartz's clean URLs (e.g. /notes/animus/Methods)
      resolve locally.

  2.  HTTP Range support. Stock Python responds 200 with the full file
      to a `Range:` request, which breaks <video> seeking. This handler
      sends 206 Partial Content with a correct Content-Range, the same
      way GitHub Pages / Cloudflare / nginx do.

  3.  Cache-Control: no-store. So a hard refresh isn't needed every
      time you tweak a CSS or JS file in dev.

Usage:
    cd port_v2
    python serve.py            # defaults to port 5188
    python serve.py 8000       # custom port

Stop with Ctrl-C.
"""
import os
import re
import sys
from http.server import HTTPServer, SimpleHTTPRequestHandler


class DevHandler(SimpleHTTPRequestHandler):
    def translate_path(self, path):
        full = super().translate_path(path)
        if os.path.isfile(full):
            return full
        if os.path.isdir(full):
            idx = os.path.join(full, "index.html")
            if os.path.isfile(idx):
                return idx
        # Extension-less URL → try .html. We skip the check for dots in
        # the basename because filenames like BASAIRA---Brain-dump-16.12.25
        # contain dots that aren't file extensions. Instead just attempt
        # the .html variant and let the isfile check decide.
        if not full.endswith((".html", ".css", ".js", ".json", ".xml",
                               ".svg", ".png", ".jpg", ".webp", ".ico",
                               ".woff2", ".woff", ".ttf", ".mp4", ".pdf")):
            html = full + ".html"
            if os.path.isfile(html):
                return html
        return full

    def end_headers(self):
        # Skip auto headers when we already wrote them ourselves (Range path).
        if not getattr(self, "_range_active", False):
            self.send_header("Cache-Control", "no-store")
            self.send_header("Accept-Ranges", "bytes")
        super().end_headers()

    def do_GET(self):
        # Handle Range requests for static files (so <video> scrubbing works).
        range_header = self.headers.get("Range")
        if range_header:
            path = self.translate_path(self.path)
            if os.path.isfile(path):
                m = re.match(r"bytes=(\d+)-(\d*)$", range_header.strip())
                if m:
                    start = int(m.group(1))
                    end = int(m.group(2)) if m.group(2) else None
                    self._serve_range(path, start, end)
                    return
        super().do_GET()

    def _serve_range(self, path, start, end):
        size = os.path.getsize(path)
        if end is None or end >= size:
            end = size - 1
        if start > end or start >= size:
            self.send_response(416)
            self.send_header("Content-Range", f"bytes */{size}")
            self.end_headers()
            return
        length = end - start + 1
        ctype = self.guess_type(path)
        self._range_active = True
        self.send_response(206)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(length))
        self.send_header("Content-Range", f"bytes {start}-{end}/{size}")
        self.send_header("Accept-Ranges", "bytes")
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        try:
            with open(path, "rb") as f:
                f.seek(start)
                remaining = length
                while remaining > 0:
                    chunk = f.read(min(64 * 1024, remaining))
                    if not chunk:
                        break
                    self.wfile.write(chunk)
                    remaining -= len(chunk)
        except (BrokenPipeError, ConnectionResetError):
            pass


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 5188
    bind = "127.0.0.1"
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    print(f"port_v2 · pretty-URL + Range + no-store on http://{bind}:{port}/")
    print(f"  cwd: {os.getcwd()}")
    print("  ctrl-c to stop")
    try:
        HTTPServer((bind, port), DevHandler).serve_forever()
    except KeyboardInterrupt:
        print("\nstopped.")
