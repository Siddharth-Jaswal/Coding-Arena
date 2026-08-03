#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;
int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<long long> a(n);
    for(int i=0; i<n; ++i) cin >> a[i];
    long long ans = 0;
    for(int i=0; i<n; ++i) {
        for(int j=i+1; j<n; ++j) {
            ans = max(ans, min(a[i], a[j]) * (j - i));
        }
    }
    cout << ans << "\n";
    return 0;
}
