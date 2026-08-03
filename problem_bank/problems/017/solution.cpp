#include <iostream>
using namespace std;
int main() {
    ios_base::sync_with_stdio(false); cin.tie(NULL);
    int n; if(!(cin >> n)) return 0;
    long long expected = (long long)n * (n + 1) / 2;
    long long actual = 0;
    for(int i=0; i<n; ++i) {
        int x; cin >> x; actual += x;
    }
    cout << expected - actual << "\n";
    return 0;
}
