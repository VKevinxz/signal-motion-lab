/* Signal Motion Lab — original deployment adapter, MIT. */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const site = path.join(root, "site"), dist = path.join(root, "dist");
const manifest = path.join(site, "capture-manifest.json");
if (!fs.existsSync(path.join(site,"index.html")) || !fs.existsSync(manifest)) {
  throw new Error("Authorized local capture missing. See README and THIRD_PARTY_NOTICES.md. Do not publish third-party materials without permission.");
}
const hash = value => crypto.createHash("sha256").update(value).digest("hex");
const files = JSON.parse(fs.readFileSync(manifest,"utf8"));
const index = Object.create(null);
const variant = (src,w,q) => [src,w,q].join("|");
fs.rmSync(dist,{recursive:true,force:true});
fs.cpSync(site,dist,{recursive:true,filter:src=>!["_optimized","capture-manifest.json"].includes(path.relative(site,src).split(path.sep)[0])});
fs.mkdirSync(path.join(dist,"_lab-images"),{recursive:true});
let copied=0;
for (const item of files) {
  if (!item.ok || !item.url.startsWith("/_next/image?")) continue;
  const url = new URL(item.url,"https://example.invalid");
  const source = url.searchParams.get("url");
  if (!source?.startsWith("/") || source.startsWith("//")) continue;
  const filename = hash(url.search.slice(1));
  const file = path.join(site,"_optimized",filename);
  if (!fs.existsSync(file)) throw new Error("Missing optimized image: "+source);
  const mime=fs.readFileSync(file+".mime","utf8").trim();
  const extension=({"image/webp":"webp","image/png":"png","image/jpeg":"jpg","image/avif":"avif"})[mime];
  if (!extension) throw new Error("Unexpected image MIME "+mime);
  const destination="/_lab-images/"+filename+"."+extension;
  fs.copyFileSync(file,path.join(dist,destination.slice(1)));
  index[variant(source,url.searchParams.get("w"),url.searchParams.get("q"))]=destination;
  copied++;
}
const fallback=src=>src?.startsWith("/")&&!src.startsWith("//")?src:"/lab-placeholder.svg";
function resolve(raw) {
  const url=new URL(raw.replaceAll("&amp;","&"),"https://example.invalid");
  const source=url.searchParams.get("url");
  return index[variant(source,url.searchParams.get("w"),url.searchParams.get("q"))] ?? fallback(source);
}
const chunks=path.join(dist,"_next/static/immutable/chunks");
let patched=0;
const tick=String.fromCharCode(96);
const startMarker="return"+tick+"$"+"{e.path}?url=";
const endMarker=tick+"}l.__next_img_default";
for (const name of fs.readdirSync(chunks).filter(x=>x.endsWith(".js"))) {
  const file=path.join(chunks,name), code=fs.readFileSync(file,"utf8");
  const start=code.indexOf(startMarker);
  if(start<0)continue;
  const end=code.indexOf(endMarker,start);
  if(end<0||end-start>300)throw new Error("Unexpected captured image loader");
  const replacement='return ('+JSON.stringify(index)+')[t+"|"+r+"|"+s]??(t.startsWith("/")&&!t.startsWith("//")?t:"/lab-placeholder.svg")';
  fs.writeFileSync(file,code.slice(0,start)+replacement+code.slice(end+1));
  patched++;
}
if(patched!==1) throw new Error("Expected exactly one captured Next image loader; found "+patched);
function walk(dir) {
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
}
let pages=0, rewritten=0;
for (const file of walk(dist).filter(x=>x.endsWith(".html"))) {
  let code=fs.readFileSync(file,"utf8");
  code=code.replace(/\/_next\/image\?[^"'\s<>,\\]+/g,raw=>{rewritten++;return resolve(raw)});
  code=code.replace(/<link\b[^>]*\brel="(?:canonical|alternate)"[^>]*>/gi,"");
  code=code.replace(/<meta\b[^>]*(?:property="og:[^"]+"|name="(?:twitter:[^"]+|google-site-verification|description)")[^>]*>/gi,"");
  code=code.replace(/<title>[^<]*<\/title>/i,"<title>Signal Motion Lab — Unofficial animation study</title>");
  code=code.replace("</head>",'<meta name="robots" content="noindex,nofollow,noarchive"><meta name="description" content="Unofficial educational frontend motion study."><script defer src="/lab-notice.js"></script></head>');
  fs.writeFileSync(file,code);
  pages++;
}
fs.copyFileSync(path.join(root,"scripts/lab-notice.js"),path.join(dist,"lab-notice.js"));
fs.writeFileSync(path.join(dist,"lab-placeholder.svg"),'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#0d1012"/></svg>');
fs.writeFileSync(path.join(dist,"robots.txt"),"User-agent: *\nDisallow: /\n");
fs.writeFileSync(path.join(dist,"404.html"),'<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Signal Motion Lab — Not captured</title><style>body{background:#0d1012;color:#eef0ec;font:18px system-ui;padding:3rem}a{color:#2fd6ff}</style><h1>Page not captured</h1><p>This is an unofficial educational motion study, not the original site.</p><a href="/">Return to the lab</a></html>');
console.log("Build complete: "+pages+" pages, "+copied+" image variants, "+rewritten+" image URL replacements, "+patched+" runtime loader patch.");
