"""Capture public frontend resources for a local, read-only visual replica."""
import re, html, json, hashlib, pathlib, urllib.request, urllib.parse, concurrent.futures, mimetypes
BASE="https://www.bonanza-studios.com"
ROOT=pathlib.Path(__file__).resolve().parent / "site"
ROOT.mkdir(exist_ok=True)
ASSET=re.compile(r'(?<![\w/])(?:/|(?=static/immutable/))[\w./~@%+-]+\.(?:js|css|woff2?|ttf|otf|webp|avif|png|jpe?g|gif|svg|mp4|webm|mov|ico|glb|gltf|wasm|json|ktx2|hdr|bin|riv|lottie|txt)(?:\?[\w%=&;.+/-]+)?', re.I)
OPT=re.compile(r'/_next/image\?[^"\'\s<>\\,]+')
REL=re.compile(r'(?:\.\./media/|static/immutable/(?:chunks|media)/)[\w.-]+\.(?:js|css|woff2?|webp|png|svg|mp4|webm|wasm|json|glb)',re.I)
def path_for(u):
    p=urllib.parse.urlsplit(u)
    if p.path=="/_next/image":
        return ROOT/"_optimized"/hashlib.sha256(p.query.encode()).hexdigest()
    return ROOT / p.path.lstrip("/")
def fetch(u):
    if not u.startswith("/") or u.startswith("//") or ".." in urllib.parse.urlsplit(u).path.split("/"):
        return u,False,"invalid"
    dest=path_for(u)
    if dest.is_file() and dest.stat().st_size:
        return u,True,"cached"
    try:
        req=urllib.request.Request(BASE+u,headers={"User-Agent":"Mozilla/5.0","Accept":"image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8" if u.startswith("/_next/image?") else "*/*"})
        with urllib.request.urlopen(req,timeout=25) as r:
            if urllib.parse.urlsplit(r.geturl()).hostname != "www.bonanza-studios.com":
                raise ValueError("external redirect")
            data=r.read(80*1024*1024+1)
            if len(data)>80*1024*1024: raise ValueError("too large")
            if r.headers.get_content_type()=="text/html" and not u.endswith(".html"): raise ValueError("unexpected html")
            dest.parent.mkdir(parents=True,exist_ok=True)
            dest.write_bytes(data)
            if u.startswith("/_next/image?"):
                dest.with_suffix(".mime").write_text(r.headers.get_content_type())
        return u,True,str(len(data))
    except Exception as e:
        return u,False,str(e)
def discover(t):
    t=html.unescape(t).replace(r'\"','"').replace(r'\u0026','&').replace(r'\/','/')
    found=set()
    for x in ASSET.findall(t):
        if x.startswith("static/immutable/"): x="/_next/"+x
        if x.startswith(("/_next/static/","/images/","/videos/","/models/","/fonts/","/assets/","/animations/","/media/","/favicon","/icon.","/apple-icon.")):
            found.add(x)
    for x in REL.findall(t):
        found.add("/_next/static/immutable/"+x[3:] if x.startswith("../") else "/_next/"+x)
    for x in OPT.findall(t):
        if "url=" in x and "&w=" in x: found.add(x)
    return found
def clean(t):
    # Local demo does not initiate third-party analytics. Keep original client hydration.
    return re.sub(r'<link[^>]+href="https://cloud\.umami\.is/[^"]+"[^>]*>','',t)
def main():
    pages={"/":pathlib.Path("reference.html").read_text(encoding="utf-8")}
    # Home page is the primary replica. Secondary routes are deliberately limited.
    def page(route):
        try:
            req=urllib.request.Request(BASE+route,headers={"User-Agent":"Mozilla/5.0","Accept":"text/html"})
            with urllib.request.urlopen(req,timeout=15) as r:
                if urllib.parse.urlsplit(r.geturl()).hostname!="www.bonanza-studios.com": return route,None
                return route,r.read().decode("utf-8")
        except Exception: return route,None
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
        for route,t in pool.map(page,["/service","/case-studies","/resources","/about-us","/de"]):
            if t: pages[route]=t
    todo=set()
    for route,t in pages.items():
        out=ROOT / route.lstrip("/") / "index.html"
        out.parent.mkdir(parents=True,exist_ok=True);out.write_text(clean(t),encoding="utf-8")
        todo |= discover(t)
    seen=set();report=[]
    for _ in range(5):
        batch=sorted(todo-seen)
        if not batch: break
        seen.update(batch)
        with concurrent.futures.ThreadPoolExecutor(max_workers=12) as pool:
            for u,ok,msg in pool.map(fetch,batch):
                report.append({"url":u,"ok":ok,"result":msg})
                if ok and urllib.parse.urlsplit(u).path.endswith((".js",".css")):
                    todo |= discover(path_for(u).read_text(encoding="utf-8",errors="replace"))
        print("Round",_,len(batch),"OK",sum(x["ok"] for x in report),flush=True)
    pathlib.Path("qa/assets-manifest.json").write_text(json.dumps(report,indent=2),encoding="utf-8")
    print("Pages",list(pages),"Assets",len(report),"Failed",sum(not x["ok"] for x in report),flush=True)
if __name__=="__main__": main()
