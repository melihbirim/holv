#include <stdio.h>
#include <stdlib.h>
int main(int argc, char **argv) {
    long long a = atoll(argv[1]), b = atoll(argv[2]), c = atoll(argv[3]);
    printf("%lld\n", a + b + c);
    return 0;
}
