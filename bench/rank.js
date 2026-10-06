const n = Number(process.argv[2] ?? 10);
const now = 1_700_000_000;
let x = 42;
const next = () => { x = (Math.imul(x, 1664525) + 1013904223) >>> 0; return x; };
const posts = [];
for (let i = 0; i < n; i++) {
  const up = next() % 1000, down = next() % 300, age = next() % 720000;
  posts.push({ id: i, up, down, created: now - age });
}
const score = (p) => { const base = Math.trunc((now - p.created) / 3600) + 2; return (p.up - p.down) / (base * Math.sqrt(base)); };
const scored = posts.map((p) => ({ id: p.id, score: score(p) }));
scored.sort((a, b) => (a.score !== b.score ? (b.score > a.score ? 1 : -1) : a.id - b.id));
let total = 0;
for (const s of scored) total += Math.floor(s.score * 1e6);
console.log(`top ${scored[0].id} ${scored[1].id} ${scored[2].id}`);
console.log(`checksum ${total}`);
