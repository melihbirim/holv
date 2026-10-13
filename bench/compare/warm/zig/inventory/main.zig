const std = @import("std");

const Item = struct { sku: []const u8, qty: u64, price: u64 };

fn num(s: []const u8) ?u64 {
    if (s.len == 0) return null;
    var v: u64 = 0;
    for (s) |c| {
        if (c < '0' or c > '9') return null;
        const m = @mulWithOverflow(v, 10);
        if (m[1] != 0) return null;
        const a = @addWithOverflow(m[0], c - '0');
        if (a[1] != 0) return null;
        v = a[0];
    }
    return v;
}

fn find(list: []const Item, sku: []const u8) ?usize {
    for (list, 0..) |a, i| if (std.mem.eql(u8, a.sku, sku)) return i;
    return null;
}

fn lessThan(_: void, a: Item, b: Item) bool {
    return std.mem.lessThan(u8, a.sku, b.sku);
}

pub fn main(init: std.process.Init) !void {
    const gpa = init.gpa;
    var it = init.minimal.args.iterate();
    _ = it.next();
    const input = it.next() orelse "";
    var items: std.ArrayList(Item) = .empty;
    defer items.deinit(gpa);
    var rejected: usize = 0;

    var buf: [4096]u8 = undefined;
    var w = std.Io.File.stdout().writer(init.io, &buf);

    var recs = std.mem.splitScalar(u8, input, ';');
    while (recs.next()) |rec| {
        if (rec.len == 0) continue;
        var f: [5][]const u8 = undefined;
        var n: usize = 0;
        var fi = std.mem.splitScalar(u8, rec, ':');
        var over = false;
        while (fi.next()) |p| {
            if (n == 5) {
                over = true;
                break;
            }
            f[n] = p;
            n += 1;
        }
        var ok = false;
        if (!over) {
            if (std.mem.eql(u8, f[0], "add") and n == 4) {
                if (num(f[2])) |q| if (num(f[3])) |p| {
                    if (find(items.items, f[1])) |i| {
                        const s = @addWithOverflow(items.items[i].qty, q);
                        if (s[1] == 0) {
                            items.items[i].qty = s[0];
                            items.items[i].price = p;
                            ok = true;
                        }
                    } else {
                        try items.append(gpa, .{ .sku = f[1], .qty = q, .price = p });
                        ok = true;
                    }
                };
            } else if (std.mem.eql(u8, f[0], "remove") and n == 3) {
                if (num(f[2])) |q| if (find(items.items, f[1])) |i| {
                    if (items.items[i].qty >= q) {
                        items.items[i].qty -= q;
                        ok = true;
                    }
                };
            } else if (std.mem.eql(u8, f[0], "price") and n == 3) {
                if (num(f[2])) |p| if (find(items.items, f[1])) |i| {
                    items.items[i].price = p;
                    ok = true;
                };
            } else if (std.mem.eql(u8, f[0], "report") and n == 1) {
                ok = true;
                std.mem.sort(Item, items.items, {}, lessThan);
                var total: u128 = 0;
                for (items.items) |a| {
                    const v: u128 = @as(u128, a.qty) * a.price;
                    total += v;
                    try w.interface.print("{s} {d} {d}\n", .{ a.sku, a.qty, v });
                }
                try w.interface.print("total {d}\n", .{total});
            }
        }
        if (!ok) rejected += 1;
    }
    try w.interface.print("rejected {d}\n", .{rejected});
    try w.interface.flush();
}
