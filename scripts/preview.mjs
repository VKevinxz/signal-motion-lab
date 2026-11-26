/* Signal Motion Lab — local static production preview, MIT. */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),".."),dir=path.join(root,"dist");
if(!fs.existsSync(path.join(dir,"index.html"))) throw new Error("Run npm run build first");
const config=JSON.parse(fs.readFileSync(path.join(root,"vercel.json"),"utf8"));
const headers=Object.fromEntries(config.headers[0].headers.map(x=>[x.key,x.value]));
const types={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".webp":"image/webp",".png":"image/png",".avif":"image/avif",".jpeg":"image/jpeg",".jpg":"image/jpeg",".svg":"image/svg+xml",".woff2":"font/woff2",".ico":"image/x-icon",".json":"application/json",".mp4":"video/mp4",".webm":"video/webm",".txt":"text/plain"};
const server=http.createServer((req,res)=>{
  if(!["GET","HEAD"].includes(req.method)){res.writeHead(405,headers);return res.end();}
  let url;
  try{url=decodeURIComponent(new URL(req.url,"http://localhost").pathname);}catch{res.writeHead(400,headers);return res.end();}
  let file=path.resolve(dir,"."+url);
  if(file!==dir&&!file.startsWith(dir+path.sep)){res.writeHead(403,headers);return res.end();}
  if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,"index.html");
  let status=200;
  if(!fs.existsSync(file)||!fs.statSync(file).isFile()){status=404;file=path.join(dir,"404.html");}
  const size=fs.statSync(file).size;
  const base={...headers,"Content-Type":types[path.extname(file)]??"application/octet-stream","Content-Length":size,"Accept-Ranges":"bytes"};
  const range=req.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
  let stream;
  if(status===200&&range){
    const start=Number(range[1]),end=Math.min(range[2]?Number(range[2]):size-1,size-1);
    if(start>end){res.writeHead(416,{...headers,"Content-Range":"bytes */"+size});return res.end();}
    res.writeHead(206,{...base,"Content-Length":end-start+1,"Content-Range":"bytes "+start+"-"+end+"/"+size});
    stream=()=>fs.createReadStream(file,{start,end});
  }else{res.writeHead(status,base);stream=()=>fs.createReadStream(file);}
  if(req.method==="HEAD")return res.end();
  stream().pipe(res);
});
const port=Number(process.env.PORT||4174);
server.listen(port,"127.0.0.1",()=>console.log("Signal Motion Lab preview: http://127.0.0.1:"+port));
