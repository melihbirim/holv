use std::collections::HashMap;

fn amount(s: &str) -> Option<u128> {
    if s.is_empty() || !s.bytes().all(|b| b.is_ascii_digit()) {
        return None;
    }
    match s.parse::<u128>() {
        Ok(v) if v > 0 => Some(v),
        _ => None,
    }
}

fn main() {
    let input = std::env::args().nth(1).unwrap_or_default();
    let mut names: Vec<String> = Vec::new();
    let mut bal: HashMap<String, u128> = HashMap::new();
    let mut rejected = 0u32;
    for rec in input.split(';') {
        if rec.is_empty() {
            continue;
        }
        let f: Vec<&str> = rec.split(':').collect();
        let ok = match (f[0], f.len()) {
            ("deposit", 3) => match amount(f[2]) {
                Some(a) => {
                    if !bal.contains_key(f[1]) {
                        names.push(f[1].to_string());
                        bal.insert(f[1].to_string(), 0);
                    }
                    let b = bal.get_mut(f[1]).unwrap();
                    match b.checked_add(a) {
                        Some(n) => { *b = n; true }
                        None => false,
                    }
                }
                None => false,
            },
            ("withdraw", 3) => match (amount(f[2]), bal.get_mut(f[1])) {
                (Some(a), Some(b)) if *b >= a => { *b -= a; true }
                _ => false,
            },
            ("transfer", 4) => {
                match amount(f[3]) {
                    Some(a) if f[1] != f[2] && bal.get(f[1]).map_or(false, |b| *b >= a) => {
                        let tb = bal.get(f[2]).copied();
                        if tb.map_or(0, |x| x).checked_add(a).is_none() {
                            false
                        } else {
                            if tb.is_none() {
                                names.push(f[2].to_string());
                                bal.insert(f[2].to_string(), 0);
                            }
                            *bal.get_mut(f[1]).unwrap() -= a;
                            *bal.get_mut(f[2]).unwrap() += a;
                            true
                        }
                    }
                    _ => false,
                }
            }
            _ => false,
        };
        if !ok { rejected += 1; }
    }
    for n in &names {
        println!("{} {}", n, bal[n]);
    }
    println!("rejected {}", rejected);
}
