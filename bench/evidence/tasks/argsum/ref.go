package main

import (
	"fmt"
	"os"
	"strconv"
)

func main() {
	a, _ := strconv.ParseInt(os.Args[1], 10, 64)
	b, _ := strconv.ParseInt(os.Args[2], 10, 64)
	c, _ := strconv.ParseInt(os.Args[3], 10, 64)
	fmt.Println(a + b + c)
}
