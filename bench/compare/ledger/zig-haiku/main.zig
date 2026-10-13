const std = @import("std");

const Accounts = std.array_hash_map.String(i128);

/// Parses a positive integer written only in ASCII digits.
fn parseAmount(s: []const u8) ?i128 {
    if (s.len == 0) return null;
    for (s) |c| {
        if (c < '0' or c > '9') return null;
    }
    const v = std.fmt.parseInt(u64, s, 10) catch return null;
    if (v == 0) return null;
    return @intCast(v);
}

/// Applies one non-empty record. Returns true if accepted, false if rejected.
/// Changes nothing when rejected.
fn applyRecord(gpa: std.mem.Allocator, accounts: *Accounts, rec: []const u8) !bool {
    var fields: [4][]const u8 = undefined;
    var n: usize = 0;
    var it = std.mem.splitScalar(u8, rec, ':');
    while (it.next()) |f| {
        if (n == fields.len) return false;
        fields[n] = f;
        n += 1;
    }
    if (n == 0) return false;
    const cmd = fields[0];

    if (std.mem.eql(u8, cmd, "deposit")) {
        if (n != 3) return false;
        const amt = parseAmount(fields[2]) orelse return false;
        const gop = try accounts.getOrPut(gpa, fields[1]);
        if (!gop.found_existing) gop.value_ptr.* = 0;
        gop.value_ptr.* += amt;
        return true;
    }

    if (std.mem.eql(u8, cmd, "withdraw")) {
        if (n != 3) return false;
        const amt = parseAmount(fields[2]) orelse return false;
        const bal = accounts.getPtr(fields[1]) orelse return false;
        if (bal.* < amt) return false;
        bal.* -= amt;
        return true;
    }

    if (std.mem.eql(u8, cmd, "transfer")) {
        if (n != 4) return false;
        const from = fields[1];
        const to = fields[2];
        const amt = parseAmount(fields[3]) orelse return false;
        if (std.mem.eql(u8, from, to)) return false;
        const fbal = accounts.getPtr(from) orelse return false;
        if (fbal.* < amt) return false;
        fbal.* -= amt;
        const gop = try accounts.getOrPut(gpa, to);
        if (!gop.found_existing) gop.value_ptr.* = 0;
        gop.value_ptr.* += amt;
        return true;
    }

    return false;
}

pub fn main(init: std.process.Init) !void {
    const gpa = init.gpa;
    const args = try init.minimal.args.toSlice(init.arena.allocator());
    const ledger: []const u8 = if (args.len > 1) args[1] else "";

    var accounts: Accounts = .empty;
    defer accounts.deinit(gpa);
    var rejected: u64 = 0;

    var it = std.mem.splitScalar(u8, ledger, ';');
    while (it.next()) |rec| {
        if (rec.len == 0) continue;
        if (!try applyRecord(gpa, &accounts, rec)) rejected += 1;
    }

    var buf: [4096]u8 = undefined;
    var fw = std.Io.File.stdout().writer(init.io, &buf);
    const w = &fw.interface;
    for (accounts.keys(), accounts.values()) |name, bal| {
        try w.print("{s} {d}\n", .{ name, bal });
    }
    try w.print("rejected {d}\n", .{rejected});
    try w.flush();
}
