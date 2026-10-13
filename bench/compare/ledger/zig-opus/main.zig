const std = @import("std");

const Bal = u1024;
const Acct = struct { name: []const u8, bal: Bal };

fn parseAmt(s: []const u8) ?Bal {
    if (s.len == 0) return null;
    var v: Bal = 0;
    for (s) |c| {
        if (c < '0' or c > '9') return null;
        const m = @mulWithOverflow(v, @as(Bal, 10));
        if (m[1] != 0) return null;
        const a = @addWithOverflow(m[0], @as(Bal, c - '0'));
        if (a[1] != 0) return null;
        v = a[0];
    }
    if (v == 0) return null;
    return v;
}

fn find(list: []Acct, name: []const u8) ?usize {
    for (list, 0..) |a, i| {
        if (std.mem.eql(u8, a.name, name)) return i;
    }
    return null;
}

pub fn main(init: std.process.Init) !void {
    const gpa = init.arena.allocator();
    const args = try init.minimal.args.toSlice(gpa);
    const input: []const u8 = if (args.len > 1) args[1] else "";

    var accts: std.ArrayList(Acct) = .empty;
    var rejected: usize = 0;

    var recs = std.mem.splitScalar(u8, input, ';');
    while (recs.next()) |rec| {
        if (rec.len == 0) continue;
        var fields: [5][]const u8 = undefined;
        var n: usize = 0;
        var it = std.mem.splitScalar(u8, rec, ':');
        while (it.next()) |f| {
            if (n < fields.len) fields[n] = f;
            n += 1;
        }
        var ok = false;
        if (n == 3 and std.mem.eql(u8, fields[0], "deposit")) {
            if (parseAmt(fields[2])) |amt| {
                if (find(accts.items, fields[1])) |i| {
                    const r = @addWithOverflow(accts.items[i].bal, amt);
                    if (r[1] == 0) {
                        accts.items[i].bal = r[0];
                        ok = true;
                    }
                } else {
                    try accts.append(gpa, .{ .name = fields[1], .bal = amt });
                    ok = true;
                }
            }
        } else if (n == 3 and std.mem.eql(u8, fields[0], "withdraw")) {
            if (parseAmt(fields[2])) |amt| {
                if (find(accts.items, fields[1])) |i| {
                    if (accts.items[i].bal >= amt) {
                        accts.items[i].bal -= amt;
                        ok = true;
                    }
                }
            }
        } else if (n == 4 and std.mem.eql(u8, fields[0], "transfer")) {
            if (parseAmt(fields[3])) |amt| {
                if (!std.mem.eql(u8, fields[1], fields[2])) {
                    if (find(accts.items, fields[1])) |i| {
                        if (accts.items[i].bal >= amt) {
                            if (find(accts.items, fields[2])) |j| {
                                const r = @addWithOverflow(accts.items[j].bal, amt);
                                if (r[1] == 0) {
                                    accts.items[i].bal -= amt;
                                    accts.items[j].bal = r[0];
                                    ok = true;
                                }
                            } else {
                                accts.items[i].bal -= amt;
                                try accts.append(gpa, .{ .name = fields[2], .bal = amt });
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
    var fw = std.Io.File.stdout().writer(init.io, &buf);
    const w = &fw.interface;
    for (accts.items) |a| {
        try w.print("{s} {d}\n", .{ a.name, a.bal });
    }
    try w.print("rejected {d}\n", .{rejected});
    try w.flush();
}
