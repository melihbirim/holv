const std = @import("std");

const Acct = struct { name: []const u8, bal: u128 };

fn parseAmt(s: []const u8) ?u128 {
    if (s.len == 0) return null;
    var v: u128 = 0;
    for (s) |c| {
        if (c < '0' or c > '9') return null;
        v = std.math.mul(u128, v, 10) catch return null;
        v = std.math.add(u128, v, c - '0') catch return null;
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
    var it = try std.process.Args.Iterator.initAllocator(init.minimal.args, gpa);
    defer it.deinit();
    _ = it.next();
    const input = it.next() orelse "";

    var list: std.ArrayList(Acct) = .empty;
    defer list.deinit(gpa);
    var rejected: usize = 0;

    var recs = std.mem.splitScalar(u8, input, ';');
    while (recs.next()) |rec| {
        if (rec.len == 0) continue;
        var f: [5][]const u8 = undefined;
        var n: usize = 0;
        var fi = std.mem.splitScalar(u8, rec, ':');
        while (fi.next()) |p| {
            if (n < 5) f[n] = p;
            n += 1;
        }
        var ok = false;
        if (n == 3 and std.mem.eql(u8, f[0], "deposit")) {
            if (parseAmt(f[2])) |amt| {
                if (find(list.items, f[1])) |i| {
                    if (std.math.add(u128, list.items[i].bal, amt)) |nb| {
                        list.items[i].bal = nb;
                        ok = true;
                    } else |_| {}
                } else {
                    try list.append(gpa, .{ .name = f[1], .bal = amt });
                    ok = true;
                }
            }
        } else if (n == 3 and std.mem.eql(u8, f[0], "withdraw")) {
            if (parseAmt(f[2])) |amt| {
                if (find(list.items, f[1])) |i| {
                    if (list.items[i].bal >= amt) {
                        list.items[i].bal -= amt;
                        ok = true;
                    }
                }
            }
        } else if (n == 4 and std.mem.eql(u8, f[0], "transfer")) {
            if (parseAmt(f[3])) |amt| {
                if (find(list.items, f[1])) |i| {
                    if (!std.mem.eql(u8, f[1], f[2]) and list.items[i].bal >= amt) {
                        if (find(list.items, f[2])) |j| {
                            if (std.math.add(u128, list.items[j].bal, amt)) |nb| {
                                list.items[i].bal -= amt;
                                list.items[j].bal = nb;
                                ok = true;
                            } else |_| {}
                        } else {
                            list.items[i].bal -= amt;
                            try list.append(gpa, .{ .name = f[2], .bal = amt });
                            ok = true;
                        }
                    }
                }
            }
        }
        if (!ok) rejected += 1;
    }

    var buf: [4096]u8 = undefined;
    var w = std.Io.File.stdout().writer(init.io, &buf);
    for (list.items) |a| try w.interface.print("{s} {d}\n", .{ a.name, a.bal });
    try w.interface.print("rejected {d}\n", .{rejected});
    try w.interface.flush();
}
