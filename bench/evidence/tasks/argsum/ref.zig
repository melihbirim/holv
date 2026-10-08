const std = @import("std");
pub fn main() !void {
    const alloc = std.heap.page_allocator;
    const args = try std.process.argsAlloc(alloc);
    defer std.process.argsFree(alloc, args);
    const a = try std.fmt.parseInt(i64, args[1], 10);
    const b = try std.fmt.parseInt(i64, args[2], 10);
    const c = try std.fmt.parseInt(i64, args[3], 10);
    var buf: [256]u8 = undefined;
    var w = std.fs.File.stdout().writer(&buf);
    const out = &w.interface;
    try out.print("{d}\n", .{a + b + c});
    try out.flush();
}
