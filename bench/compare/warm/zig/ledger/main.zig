const std = @import("std");

const Acct = struct { name: []const u8, bal: u128 };

fn parseAmt(s: []const u8) ?u128 {
    if (s.len == 0) return null;
    var v: u128 = 0;
    for (s) |c| {
        if (c < '0' or c > '9') return null;
        const m = @mulWithOverflow(v, 10);
        if (m[1] != 0) return null;
        const a = @addWithOverflow(m[0], c - '0');
        if (a[1] != 0) return null;
        v = a[0];
    }
    if (v == 0) return null;
    return v;
}

fn find(list: []const Acct, name: []const u8) ?usize {
    for (list, 0..) |a, i| if (std.mem.eql(u8, a.name, name)) return i;
    return null;
}

pub fn main(init: std.process.Init) !void {
    const gpa = init.gpa;
    var it = init.minimal.args.iterate();
    _ = it.next();
    const input = it.next() orelse "";
    var accts: std.ArrayList(Acct) = .empty;
    defer accts.deinit(gpa);
    var rejected: usize = 0;

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
            if (std.mem.eql(u8, f[0], "deposit") and n == 3) {
                if (parseAmt(f[2])) |amt| {
                    if (find(accts.items, f[1])) |i| {
                        const s = @addWithOverflow(accts.items[i].bal, amt);
                        if (s[1] == 0) {
                            accts.items[i].bal = s[0];
                            ok = true;
                        }
                    } else {
                        try accts.append(gpa, .{ .name = f[1], .bal = amt });
                        ok = true;
                    }
                }
            } else if (std.mem.eql(u8, f[0], "withdraw") and n == 3) {
                if (parseAmt(f[2])) |amt| {
                    if (find(accts.items, f[1])) |i| {
                        if (accts.items[i].bal >= amt) {
                            accts.items[i].bal -= amt;
                            ok = true;
                        }
                    }
                }
            } else if (std.mem.eql(u8, f[0], "transfer") and n == 4) {
                if (parseAmt(f[3])) |amt| {
                    if (find(accts.items, f[1])) |i| {
                        if (!std.mem.eql(u8, f[1], f[2]) and accts.items[i].bal >= amt) {
                            if (find(accts.items, f[2])) |j| {
                                const s = @addWithOverflow(accts.items[j].bal, amt);
                                if (s[1] == 0) {
                                    accts.items[j].bal = s[0];
                                    accts.items[i].bal -= amt;
                                    ok = true;
                                }
                            } else {
                                accts.items[i].bal -= amt;
                                try accts.append(gpa, .{ .name = f[2], .bal = amt });
                                ok = true;
                            }
                        }
                    }
                }
            }
        }
        if (!ok) rejected += 1;
    }

    var buf: [4096]u8 = undefined;
    var w = std.Io.File.stdout().writer(init.io, &buf);
    for (accts.items) |a| try w.interface.print("{s} {d}\n", .{ a.name, a.bal });
    try w.interface.print("rejected {d}\n", .{rejected});
    try w.interface.flush();
}
