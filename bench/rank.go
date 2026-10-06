package main

import (
	"fmt"
	"math"
	"os"
	"sort"
	"strconv"
)

type Post struct{ id, up, down, created int64 }
type Scored struct {
	id    int64
	score float64
}

func main() {
	n, _ := strconv.Atoi(os.Args[1])
	const now int64 = 1_700_000_000
	var x uint32 = 42
	next := func() uint32 { x = x*1664525 + 1013904223; return x }
	posts := make([]Post, 0, n)
	for i := 0; i < n; i++ {
		up, down, age := int64(next()%1000), int64(next()%300), int64(next()%720000)
		posts = append(posts, Post{int64(i), up, down, now - age})
	}
	scored := make([]Scored, n)
	for i, p := range posts {
		base := float64((now-p.created)/3600 + 2)
		scored[i] = Scored{p.id, float64(p.up-p.down) / (base * math.Sqrt(base))}
	}
	sort.Slice(scored, func(i, j int) bool {
		if scored[i].score != scored[j].score {
			return scored[i].score > scored[j].score
		}
		return scored[i].id < scored[j].id
	})
	var total int64
	for _, s := range scored {
		total += int64(math.Floor(s.score * 1e6))
	}
	fmt.Printf("top %d %d %d\n", scored[0].id, scored[1].id, scored[2].id)
	fmt.Printf("checksum %d\n", total)
}
