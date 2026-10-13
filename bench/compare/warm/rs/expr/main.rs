struct P { s: Vec<u8>, i: usize }

impl P {
    fn ws(&mut self) { while self.i < self.s.len() && self.s[self.i] == b' ' { self.i += 1; } }
    fn peek(&mut self) -> Option<u8> { self.ws(); self.s.get(self.i).copied() }
    fn expr(&mut self) -> Option<i128> {
        let mut v = self.term()?;
        while let Some(c) = self.peek() {
            if c == b'+' || c == b'-' {
                self.i += 1;
                let r = self.term()?;
                v = if c == b'+' { v.checked_add(r)? } else { v.checked_sub(r)? };
            } else { break; }
        }
        Some(v)
    }
    fn term(&mut self) -> Option<i128> {
        let mut v = self.unary()?;
        while let Some(c) = self.peek() {
            if c == b'*' || c == b'/' {
                self.i += 1;
                let r = self.unary()?;
                v = if c == b'*' { v.checked_mul(r)? } else { v.checked_div(r)? };
            } else { break; }
        }
        Some(v)
    }
    fn unary(&mut self) -> Option<i128> {
        match self.peek()? {
            b'-' => { self.i += 1; self.unary()?.checked_neg() }
            b'(' => {
                self.i += 1;
                let v = self.expr()?;
                if self.peek()? != b')' { return None; }
                self.i += 1;
                Some(v)
            }
            c if c.is_ascii_digit() => {
                let st = self.i;
                while self.i < self.s.len() && self.s[self.i].is_ascii_digit() { self.i += 1; }
                std::str::from_utf8(&self.s[st..self.i]).ok()?.parse().ok()
            }
            _ => None,
        }
    }
}

fn run(a: String) {
    let mut p = P { s: a.into_bytes(), i: 0 };
    let r = p.expr();
    match r {
        Some(v) if p.peek().is_none() => println!("{}", v),
        _ => println!("error"),
    }
}

fn main() {
    let a = std::env::args().nth(1).unwrap_or_default();
    std::thread::Builder::new().stack_size(1 << 29).spawn(move || run(a)).unwrap().join().unwrap();
}
