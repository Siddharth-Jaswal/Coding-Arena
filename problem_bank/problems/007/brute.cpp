#include <iostream>
using namespace std;
long long solve(int n) {
    if(n == 0 || n == 1) return 1;
    long long a = 1, b = 1;
    for(int i=2; i<=n; ++i) {
        long long c = (a + b) % 1000000007;
        a = b;
        b = c;
    }
    return b;
}
int main() {
    int n;
    if (cin >> n) cout << solve(n) << "\n";
    return 0;
}
