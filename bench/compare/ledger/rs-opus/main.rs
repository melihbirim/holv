use std::cmp::Ordering;
use std::collections::HashMap;

// Big unsigned integers as little-endian base 1e9 limbs, normalized (no trailing zero limbs).
type Big = Vec<u64>;
const BASE: u64 = 1_000_000_000;

fn parse_amount(s: &str) -> Option<Big> {
    if s.is_empty() || !s.bytes().all(|b| b.is_ascii_digit()) {
        return None;
    }
    let t = s.trim_start_matches('0');
    if t.is_empty() {
        return None;
    }
    let b = t.as_bytes();
    let mut v = Vec::new();
    let mut end = b.len();
    while end > 0 {
        let start = if end >= 9 { end - 9 } else { 0 };
        let mut x = 0u64;
        for &c in &b[start..end] {
            x = x * 10 + (c - b'0') as u64;
        }
        v.push(x);
        end = start;
    }
    Some(v)
}

fn cmp(a: &Big, b: &Big) -> Ordering {
    if a.len() != b.len() {
        return a.len().cmp(&b.len());
    }
    for i in (0..a.len()).rev() {
        if a[i] != b[i] {
            return a[i].cmp(&b[i]);
        }
    }
    Ordering::Equal
}

fn add(a: &mut Big, b: &Big) {
    let mut carry = 0;
    let n = a.len().max(b.len());
    a.resize(n, 0);
    for i in 0..n {
        let s = a[i] + b.get(i).copied().unwrap_or(0) + carry;
        a[i] = s % BASE;
        carry = s / BASE;
    }
    if carry > 0 {
        a.push(carry);
    }
}

fn sub(a: &mut Big, b: &Big) {
    let mut borrow = 0u64;
    for i in 0..a.len() {
        let d = b.get(i).copied().unwrap_or(0) + borrow;
        if a[i] >= d {
            a[i] -= d;
            borrow = 0;
        } else {
            a[i] = a[i] + BASE - d;
            borrow = 1;
        }
    }
    while a.last() == Some(&0) {
        a.pop();
    }
}

fn to_string(a: &Big) -> String {
    if a.is_empty() {
        return "0".to_string();
    }
    let mut s = a.last().unwrap().to_string();
    for i in (0..a.len() - 1).rev() {
        s.push_str(&format!("{:09}", a[i]));
    }
    s
}

fn main() {
    let input = std::env::args().nth(1).unwrap_or_default();
    let mut order: Vec<String> = Vec::new();
    let mut bal: HashMap<String, Big> = HashMap::new();
    let mut rejected = 0u64;

    for rec in input.split(';') {
        if rec.is_empty() {
            continue;
        }
        let f: Vec<&str> = rec.split(':').collect();
        let ok = match f[0] {
            "deposit" if f.len() == 3 => match parse_amount(f[2]) {
                Some(amt) => {
                    let name = f[1].to_string();
                    if !bal.contains_key(&name) {
                        order.push(name.clone());
                        bal.insert(name.clone(), Vec::new());
                    }
                    add(bal.get_mut(&name).unwrap(), &amt);
                    true
                }
                None => false,
            },
            "withdraw" if f.len() == 3 => match parse_amount(f[2]) {
                Some(amt) => match bal.get_mut(f[1]) {
                    Some(b) if cmp(b, &amt) != Ordering::Less => {
                        sub(b, &amt);
                        true
                    }
                    _ => false,
                },
                None => false,
            },
            "transfer" if f.len() == 4 => match parse_amount(f[3]) {
                Some(amt) => {
                    let (from, to) = (f[1], f[2]);
                    let can = from != to
                        && bal.get(from).map_or(false, |b| cmp(b, &amt) != Ordering::Less);
                    if can {
                        sub(bal.get_mut(from).unwrap(), &amt);
                        if !bal.contains_key(to) {
                            order.push(to.to_string());
                            bal.insert(to.to_string(), Vec::new());
                        }
                        add(bal.get_mut(to).unwrap(), &amt);
                    }
                    can
                }
                None => false,
            },
            _ => false,
        };
        if !ok {
            rejected += 1;
        }
    }
    for n in &order {
        println!("{} {}", n, to_string(&bal[n]));
    }
    println!("rejected {}", rejected);
}
