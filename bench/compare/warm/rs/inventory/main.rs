use std::collections::BTreeMap;

fn num(s: &str) -> Option<u128> {
    if s.is_empty() || !s.bytes().all(|b| b.is_ascii_digit()) { return None; }
    s.parse().ok()
}

fn main() {
    let input = std::env::args().nth(1).unwrap_or_default();
    let mut inv: BTreeMap<String, (u128, u128)> = BTreeMap::new();
    let mut rejected = 0u32;
    for cmd in input.split(';') {
        if cmd.is_empty() { continue; }
        let f: Vec<&str> = cmd.split(':').collect();
        let ok = match (f[0], f.len()) {
            ("add", 4) => match (num(f[2]), num(f[3])) {
                (Some(q), Some(p)) => {
                    let cur = inv.get(f[1]).map(|e| e.0).unwrap_or(0);
                    match (cur.checked_add(q), p.checked_mul(cur.saturating_add(q))) {
                        (Some(n), Some(_)) => { inv.insert(f[1].to_string(), (n, p)); true }
                        _ => false,
                    }
                }
                _ => false,
            },
            ("remove", 3) => match (num(f[2]), inv.get_mut(f[1])) {
                (Some(q), Some(e)) if e.0 >= q => { e.0 -= q; true }
                _ => false,
            },
            ("price", 3) => match (num(f[2]), inv.get_mut(f[1])) {
                (Some(p), Some(e)) if e.0.checked_mul(p).is_some() => { e.1 = p; true }
                _ => false,
            },
            ("report", 1) => {
                let mut t: u128 = 0;
                for (k, (q, p)) in &inv {
                    let v = q * p;
                    t += v;
                    println!("{} {} {}", k, q, v);
                }
                println!("total {}", t);
                true
            }
            _ => false,
        };
        if !ok { rejected += 1; }
    }
    println!("rejected {}", rejected);
}
