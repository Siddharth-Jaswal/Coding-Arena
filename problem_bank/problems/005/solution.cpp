#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;
int main() {
    ios_base::sync_with_stdio(false); cin.tie(NULL);
    int n;
    if (!(cin >> n)) return 0;
    vector<long long> a(n);
    for(int i=0; i<n; ++i) cin >> a[i];
    long long ans = 0;
    int l = 0, r = n - 1;
    while(l < r) {
        ans = max(ans, min(a[l], a[r]) * (r - l));
        if(a[l] < a[r]) l++;
        else r--;
    }
    cout << ans << "\n";
    return 0;
}
