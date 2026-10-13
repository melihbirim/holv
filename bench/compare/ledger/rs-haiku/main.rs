use std::cmp::Ordering;
use std::collections::HashMap;
use std::env;
use std::fmt;

const BASE: u64 = 1_000_000_000;

// Unsigned arbitrary-precision integer, base 1e9, little-endian limbs,
// with no trailing zero limbs (zero is the empty vector).
#[derive(Clone, Debug, PartialEq, Eq)]
struct Big {
    limbs: Vec<u32>,
}

impl Big {
    fn zero() -> Big {
        Big { limbs: Vec::new() }
    }

    // Accepts only non-empty ASCII digit strings.
    fn parse_digits(s: &str) -> Option<Big> {
        if s.is_empty() || !s.bytes().all(|b| b.is_ascii_digit()) {
            return None;
        }
        let bytes = s.as_bytes();
        let mut limbs = Vec::new();
        let mut end = bytes.len();
        while end > 0 {
            let start = if end >= 9 { end - 9 } else { 0 };
            let mut v: u32 = 0;
            for &b in &bytes[start..end] {
                v = v * 10 + (b - b'0') as u32;
            }
            limbs.push(v);
            end = start;
        }
        let mut big = Big { limbs };
        big.normalize();
        Some(big)
    }

    fn normalize(&mut self) {
        while let Some(&0) = self.limbs.last() {
            self.limbs.pop();
        }
    }

    fn is_zero(&self) -> bool {
        self.limbs.is_empty()
    }

    fn add(&self, other: &Big) -> Big {
        let n = self.limbs.len().max(other.limbs.len());
        let mut out = Vec::with_capacity(n + 1);
        let mut carry = 0u64;
        for i in 0..n {
            let a = *self.limbs.get(i).unwrap_or(&0) as u64;
            let b = *other.limbs.get(i).unwrap_or(&0) as u64;
            let s = a + b + carry;
            out.push((s % BASE) as u32);
            carry = s / BASE;
        }
        if carry > 0 {
            out.push(carry as u32);
        }
        let mut r = Big { limbs: out };
        r.normalize();
        r
    }

    // Requires self >= other.
    fn sub(&self, other: &Big) -> Big {
        let mut out = Vec::with_capacity(self.limbs.len());
        let mut borrow = 0i64;
        for i in 0..self.limbs.len() {
            let a = self.limbs[i] as i64;
            let b = *other.limbs.get(i).unwrap_or(&0) as i64;
            let mut d = a - b - borrow;
            if d < 0 {
                d += BASE as i64;
                borrow = 1;
            } else {
                borrow = 0;
            }
            out.push(d as u32);
        }
        let mut r = Big { limbs: out };
        r.normalize();
        r
    }

    fn cmp_big(&self, other: &Big) -> Ordering {
        if self.limbs.len() != other.limbs.len() {
            return self.limbs.len().cmp(&other.limbs.len());
        }
        for i in (0..self.limbs.len()).rev() {
            match self.limbs[i].cmp(&other.limbs[i]) {
                Ordering::Equal => continue,
                o => return o,
            }
        }
        Ordering::Equal
    }
}

impl fmt::Display for Big {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        if self.limbs.is_empty() {
            return write!(f, "0");
        }
        let mut s = format!("{}", self.limbs[self.limbs.len() - 1]);
        for limb in self.limbs.iter().rev().skip(1) {
            s.push_str(&format!("{:09}", limb));
        }
        write!(f, "{}", s)
    }
}

// A positive integer written in digits; zero is rejected.
fn parse_amount(s: &str) -> Option<Big> {
    Big::parse_digits(s).filter(|b| !b.is_zero())
}

struct Ledger {
    // Accounts in creation order.
    accounts: Vec<(String, Big)>,
    index: HashMap<String, usize>,
}

impl Ledger {
    fn new() -> Ledger {
        Ledger {
            accounts: Vec::new(),
            index: HashMap::new(),
        }
    }

    fn find(&self, name: &str) -> Option<usize> {
        self.index.get(name).copied()
    }

    fn get_or_create(&mut self, name: &str) -> usize {
        if let Some(i) = self.find(name) {
            return i;
        }
        let i = self.accounts.len();
        self.accounts.push((name.to_string(), Big::zero()));
        self.index.insert(name.to_string(), i);
        i
    }
}

// Applies one non-empty record. Returns false (and changes nothing) if rejected.
fn apply(l: &mut Ledger, rec: &str) -> bool {
    let f: Vec<&str> = rec.split(':').collect();
    match f[0] {
        "deposit" if f.len() == 3 => {
            let amt = match parse_amount(f[2]) {
                Some(a) => a,
                None => return false,
            };
            let i = l.get_or_create(f[1]);
            l.accounts[i].1 = l.accounts[i].1.add(&amt);
            true
        }
        "withdraw" if f.len() == 3 => {
            let amt = match parse_amount(f[2]) {
                Some(a) => a,
                None => return false,
            };
            let i = match l.find(f[1]) {
                Some(i) => i,
                None => return false,
            };
            if l.accounts[i].1.cmp_big(&amt) == Ordering::Less {
                return false;
            }
            l.accounts[i].1 = l.accounts[i].1.sub(&amt);
            true
        }
        "transfer" if f.len() == 4 => {
            let amt = match parse_amount(f[3]) {
                Some(a) => a,
                None => return false,
            };
            if f[1] == f[2] {
                return false;
            }
            let from = match l.find(f[1]) {
                Some(i) => i,
                None => return false,
            };
            if l.accounts[from].1.cmp_big(&amt) == Ordering::Less {
                return false;
            }
            let to = l.get_or_create(f[2]);
            l.accounts[from].1 = l.accounts[from].1.sub(&amt);
            l.accounts[to].1 = l.accounts[to].1.add(&amt);
            true
        }
        _ => false,
    }
}

fn main() {
    let input = env::args().nth(1).unwrap_or_default();
    let mut ledger = Ledger::new();
    let mut rejected = 0usize;
    for rec in input.split(';') {
        if rec.is_empty() {
            continue;
        }
        if !apply(&mut ledger, rec) {
            rejected += 1;
        }
    }
    for (name, bal) in &ledger.accounts {
        println!("{} {}", name, bal);
    }
    println!("rejected {}", rejected);
}
