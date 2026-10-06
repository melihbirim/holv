// The host. Owns the socket and the Store implementation; the holv program only sees `handle`.
// Run: holvc build examples/api/api.holv && node --experimental-strip-types examples/api/serve.ts
import { createServer } from "node:http";
import * as api from "./.holv-out/api.ts";

const items: string[] = [];
const store: api.Store = { add: (name) => items.push(name) - 1, count: () => items.length, get: (i) => items[i] ?? "" };

createServer((req, res) => {
  let body = "";
  req.on("data", (c) => (body += c));
  req.on("end", () => {
    const r = api.handle(store, { method: req.method ?? "GET", path: req.url ?? "/", body: body.trim() });
    res.writeHead(r.status, { "content-type": "application/json" }).end(r.body);
  });
}).listen(Number(process.env.PORT ?? 8787), () => console.log("listening"));
