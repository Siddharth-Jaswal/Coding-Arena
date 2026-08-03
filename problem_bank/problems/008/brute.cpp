#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;
int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<long long> a(n);
    for(int i=0; i<n; ++i) cin >> a[i];
    long long mx = a[0];
    for(int i=0; i<n; ++i) {
        long long cur = 0;
        for(int j=i; j<n; ++j) {
            cur += a[j];
            mx = max(mx, cur);
        }
    }
    cout << mx << "\n";
    return 0;
}
