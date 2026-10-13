use std::collections::HashMap;

fn amt(s: &str) -> Option<u128> {
    if s.is_empty() || !s.bytes().all(|b| b.is_ascii_digit()) { return None; }
    let v: u128 = s.parse().ok()?;
    if v == 0 { None } else { Some(v) }
}

fn main() {
    let input = std::env::args().nth(1).unwrap_or_default();
    let mut order: Vec<String> = Vec::new();
    let mut bal: HashMap<String, u128> = HashMap::new();
    let mut rejected = 0u32;
    for rec in input.split(';') {
        if rec.is_empty() { continue; }
        let f: Vec<&str> = rec.split(':').collect();
        let ok = match (f[0], f.len()) {
            ("deposit", 3) => match amt(f[2]) {
                Some(a) => {
                    let cur = bal.get(f[1]).copied();
                    match cur.unwrap_or(0).checked_add(a) {
                        Some(n) => {
                            if cur.is_none() { order.push(f[1].to_string()); }
                            bal.insert(f[1].to_string(), n);
                            true
                        }
                        None => false,
                    }
                }
                None => false,
            },
            ("withdraw", 3) => match (amt(f[2]), bal.get(f[1]).copied()) {
                (Some(a), Some(b)) if b >= a => { bal.insert(f[1].to_string(), b - a); true }
                _ => false,
            },
            ("transfer", 4) => match (amt(f[3]), bal.get(f[1]).copied()) {
                (Some(a), Some(b)) if b >= a && f[1] != f[2] => {
                    let t = bal.get(f[2]).copied();
                    match t.unwrap_or(0).checked_add(a) {
                        Some(n) => {
                            if t.is_none() { order.push(f[2].to_string()); }
                            bal.insert(f[1].to_string(), b - a);
                            bal.insert(f[2].to_string(), n);
                            true
                        }
                        None => false,
                    }
                }
                _ => false,
            },
            _ => false,
        };
        if !ok { rejected += 1; }
    }
    for n in &order { println!("{} {}", n, bal[n]); }
    println!("rejected {}", rejected);
}
