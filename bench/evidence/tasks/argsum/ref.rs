fn main() {
    let v: Vec<i64> = std::env::args().skip(1).map(|s| s.parse().unwrap()).collect();
    println!("{}", v[0] + v[1] + v[2]);
}
