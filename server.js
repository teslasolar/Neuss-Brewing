// Local Test Server - Brewery SCADA
// Run: node server.js [port]
import http from 'http';
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';

const __dirname=path.dirname(fileURLToPath(import.meta.url));
const PORT=process.argv[2]||3000;

const MIME={
  '.html':'text/html','.css':'text/css','.js':'application/javascript',
  '.json':'application/json','.svg':'image/svg+xml','.png':'image/png',
  '.ico':'image/x-icon','.woff':'font/woff','.woff2':'font/woff2'
};

// Simple static file server
const serve=(req,res)=>{
  let url=req.url==='/'?'/index.html':req.url;
  url=url.split('?')[0];
  const file=path.join(__dirname,url);
  const ext=path.extname(file);

  fs.readFile(file,(err,data)=>{
    if(err){
      res.writeHead(404,{'Content-Type':'text/plain'});
      res.end('Not Found: '+url);
      return;
    }
    res.writeHead(200,{'Content-Type':MIME[ext]||'text/plain','Cache-Control':'no-cache'});
    res.end(data);
  });
};

// Create server
const server=http.createServer((req,res)=>{
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','GET,POST,PUT,DELETE');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');

  if(req.method==='OPTIONS'){res.writeHead(200);res.end();return;}

  console.log(`[${new Date().toISOString().substr(11,8)}] ${req.method} ${req.url}`);
  serve(req,res);
});

server.listen(PORT,()=>{
  console.log(`\n🍺 Brewery SCADA Server`);
  console.log(`   http://localhost:${PORT}`);
  console.log(`   http://localhost:${PORT}/scada/screens/brewhouse.html`);
  console.log(`   http://localhost:${PORT}/scada/screens/fermentation.html`);
  console.log(`   http://localhost:${PORT}/scada/screens/recipes.html`);
  console.log(`   http://localhost:${PORT}/scada/screens/history.html`);
  console.log(`   http://localhost:${PORT}/scada/screens/compliance.html`);
  console.log(`\nPress Ctrl+C to stop\n`);
});
