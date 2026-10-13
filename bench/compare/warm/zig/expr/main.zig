const std = @import("std");

const Err = error{Bad};

const P = struct {
    s: []const u8,
    i: usize = 0,

    fn skip(self: *P) void {
        while (self.i < self.s.len and self.s[self.i] == ' ') self.i += 1;
    }
    fn peek(self: *P) ?u8 {
        self.skip();
        return if (self.i < self.s.len) self.s[self.i] else null;
    }
    fn expr(self: *P, depth: u32) Err!i128 {
        var v = try self.term(depth);
        while (self.peek()) |c| {
            if (c != '+' and c != '-') break;
            self.i += 1;
            const r = try self.term(depth);
            const m = if (c == '+') @addWithOverflow(v, r) else @subWithOverflow(v, r);
            if (m[1] != 0) return Err.Bad;
            v = m[0];
        }
        return v;
    }
    fn term(self: *P, depth: u32) Err!i128 {
        var v = try self.factor(depth);
        while (self.peek()) |c| {
            if (c != '*' and c != '/') break;
            self.i += 1;
            const r = try self.factor(depth);
            if (c == '*') {
                const m = @mulWithOverflow(v, r);
                if (m[1] != 0) return Err.Bad;
                v = m[0];
            } else {
                if (r == 0) return Err.Bad;
                if (r == -1 and v == std.math.minInt(i128)) return Err.Bad;
                v = @divTrunc(v, r);
            }
        }
        return v;
    }
    fn factor(self: *P, depth: u32) Err!i128 {
        if (depth > 10000) return Err.Bad;
        const c = self.peek() orelse return Err.Bad;
        if (c == '-') {
            self.i += 1;
            const v = try self.factor(depth + 1);
            const m = @mulWithOverflow(v, -1);
            if (m[1] != 0) return Err.Bad;
            return m[0];
        }
        if (c == '(') {
            self.i += 1;
            const v = try self.expr(depth + 1);
            if ((self.peek() orelse return Err.Bad) != ')') return Err.Bad;
            self.i += 1;
            return v;
        }
        if (c >= '0' and c <= '9') {
            var v: i128 = 0;
            while (self.i < self.s.len and self.s[self.i] >= '0' and self.s[self.i] <= '9') : (self.i += 1) {
                const m = @mulWithOverflow(v, 10);
                if (m[1] != 0) return Err.Bad;
                const a = @addWithOverflow(m[0], @as(i128, self.s[self.i] - '0'));
                if (a[1] != 0) return Err.Bad;
                v = a[0];
            }
            return v;
        }
        return Err.Bad;
    }
};

pub fn main(init: std.process.Init) !void {
    var it = init.minimal.args.iterate();
    _ = it.next();
    const input = it.next() orelse "";
    var p = P{ .s = input };
    var buf: [256]u8 = undefined;
    var w = std.Io.File.stdout().writer(init.io, &buf);
    const res: Err!i128 = blk: {
        const v = p.expr(0) catch |e| break :blk e;
        if (p.peek() != null) break :blk Err.Bad;
        break :blk v;
    };
    if (res) |v| try w.interface.print("{d}\n", .{v}) else |_| try w.interface.print("error\n", .{});
    try w.interface.flush();
}
