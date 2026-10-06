struct Post { id: i64, up: i64, down: i64, created: i64 }
struct Scored { id: i64, score: f64 }

fn main() {
    let n: usize = std::env::args().nth(1).unwrap().parse().unwrap();
    let now: i64 = 1_700_000_000;
    let mut x: u32 = 42;
    let mut next = || { x = x.wrapping_mul(1664525).wrapping_add(1013904223); x };
    let mut posts = Vec::with_capacity(n);
    for i in 0..n {
        let up = (next() % 1000) as i64;
        let down = (next() % 300) as i64;
        let age = (next() % 720000) as i64;
        posts.push(Post { id: i as i64, up, down, created: now - age });
    }
    let mut scored: Vec<Scored> = posts.iter().map(|p| {
        let base = ((now - p.created) / 3600 + 2) as f64;
        Scored { id: p.id, score: (p.up - p.down) as f64 / (base * base.sqrt()) }
    }).collect();
    scored.sort_by(|a, b| b.score.partial_cmp(&a.score).unwrap().then(a.id.cmp(&b.id)));
    let total: i64 = scored.iter().map(|s| (s.score * 1e6).floor() as i64).sum();
    println!("top {} {} {}", scored[0].id, scored[1].id, scored[2].id);
    println!("checksum {}", total);
}
