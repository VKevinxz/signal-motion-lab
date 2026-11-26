"""Local static replica server. No proxy, no forms, no external API requests."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlsplit, unquote, parse_qs
import hashlib, mimetypes, os
ROOT=Path(__file__).resolve().parent/"site"
class Handler(SimpleHTTPRequestHandler):
    def __init__(self,*a,**kw): super().__init__(*a,directory=str(ROOT),**kw)
    def end_headers(self):
        self.send_header("Content-Security-Policy","default-src 'self' data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; media-src 'self' blob: data:; connect-src 'self'; worker-src 'self' blob:; frame-src 'none'; form-action 'none'; object-src 'none'")
        self.send_header("Cache-Control","no-store")
        super().end_headers()
    def do_POST(self):
        self.send_error(405,"Read-only local preview")
    def do_GET(self):
        u=urlsplit(self.path)
        if u.path=="/_next/image":
            q=ROOT/"_optimized"/hashlib.sha256(u.query.encode()).hexdigest()
            if q.is_file():
                return self.asset(q,q.with_suffix(".mime").read_text())
            source=parse_qs(u.query).get("url",[""])[0]
            p=(ROOT/source.lstrip("/")).resolve()
            if p.is_relative_to(ROOT) and p.is_file():
                return self.asset(p,mimetypes.guess_type(p)[0] or "application/octet-stream")
            return self.send_error(404,"Image not captured")
        target=(ROOT/unquote(u.path).lstrip("/")).resolve()
        if not target.is_relative_to(ROOT): return self.send_error(403)
        if target.is_dir() and (target/"index.html").is_file():
            return self.asset(target/"index.html","text/html; charset=utf-8")
        if target.is_file(): return super().do_GET()
        if u.path.startswith("/_next/") or "." in u.path.split("/")[-1] or u.query:
            return self.send_error(404)
        body=b'<!doctype html><meta charset=utf-8><title>Local replica</title><h1>Page not captured in the local replica</h1><a href="/">Return to home</a>'
        self.send_response(404);self.send_header("Content-Type","text/html; charset=utf-8");self.send_header("Content-Length",str(len(body)));self.end_headers();self.wfile.write(body)
    def asset(self,p,typ):
        size=p.stat().st_size
        start,end=0,size-1
        range_header=self.headers.get("Range")
        if range_header and range_header.startswith("bytes="):
            try:
                a,b=range_header[6:].split("-",1)
                start=int(a) if a else max(0,size-int(b))
                end=min(int(b),size-1) if a and b else size-1
                if not 0<=start<=end<size: raise ValueError()
            except ValueError: return self.send_error(416)
        self.send_response(206 if range_header else 200)
        self.send_header("Content-Type",typ)
        self.send_header("Accept-Ranges","bytes")
        self.send_header("Content-Length",str(end-start+1))
        if range_header:self.send_header("Content-Range",f"bytes {start}-{end}/{size}")
        self.end_headers()
        try:
            with p.open("rb") as f:
                f.seek(start)
                remaining=end-start+1
                while remaining:
                    data=f.read(min(remaining,65536))
                    if not data:break
                    self.wfile.write(data);remaining-=len(data)
        except (BrokenPipeError,ConnectionResetError):pass
if __name__=="__main__":
    port=int(os.environ.get("PORT","4173"))
    print(f"Local Bonanza replica: http://127.0.0.1:{port}",flush=True)
    ThreadingHTTPServer(("127.0.0.1",port),Handler).serve_forever()
