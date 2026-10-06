const std = @import("std");

const Post = struct { id: i64, up: i64, down: i64, created: i64 };
const Scored = struct { id: i64, score: f64 };

var x: u32 = 42;
fn next() u32 {
    x = x *% 1664525 +% 1013904223;
    return x;
}
fn lessThan(_: void, a: Scored, b: Scored) bool {
    if (a.score != b.score) return a.score > b.score;
    return a.id < b.id;
}

pub fn main() !void {
    const alloc = std.heap.page_allocator;
    const args = try std.process.argsAlloc(alloc);
    defer std.process.argsFree(alloc, args);
    const n = try std.fmt.parseInt(usize, args[1], 10);
    const now: i64 = 1_700_000_000;

    const posts = try alloc.alloc(Post, n);
    for (posts, 0..) |*p, i| {
        const up: i64 = next() % 1000;
        const down: i64 = next() % 300;
        const age: i64 = next() % 720000;
        p.* = .{ .id = @intCast(i), .up = up, .down = down, .created = now - age };
    }
    const scored = try alloc.alloc(Scored, n);
    for (posts, scored) |p, *s| {
        const base: f64 = @floatFromInt(@divTrunc(now - p.created, 3600) + 2);
        const votes: f64 = @floatFromInt(p.up - p.down);
        s.* = .{ .id = p.id, .score = votes / (base * @sqrt(base)) };
    }
    std.mem.sort(Scored, scored, {}, lessThan);
    var total: i64 = 0;
    for (scored) |s| total += @as(i64, @intFromFloat(@floor(s.score * 1e6)));

    var buf: [256]u8 = undefined;
    var w = std.fs.File.stdout().writer(&buf);
    const out = &w.interface;
    try out.print("top {d} {d} {d}\n", .{ scored[0].id, scored[1].id, scored[2].id });
    try out.print("checksum {d}\n", .{total});
    try out.flush();
}
