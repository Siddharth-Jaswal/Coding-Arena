#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;
int main() {
    ios_base::sync_with_stdio(false); cin.tie(NULL);
    int n;
    if (!(cin >> n)) return 0;
    long long mx = -1e18, cur = 0;
    for(int i=0; i<n; ++i) {
        long long x; cin >> x;
        cur += x;
        mx = max(mx, cur);
        if(cur < 0) cur = 0;
    }
    cout << mx << "\n";
    return 0;
}
