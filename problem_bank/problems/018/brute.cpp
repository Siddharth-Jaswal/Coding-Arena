#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;
int main() {
    int n; if(!(cin >> n)) return 0;
    vector<int> a(n); for(int i=0; i<n; ++i) cin >> a[i];
    vector<int> dp(n, 1);
    int mx = 0;
    for(int i=0; i<n; ++i) {
        for(int j=0; j<i; ++j) {
            if(a[j] < a[i]) dp[i] = max(dp[i], dp[j] + 1);
        }
        mx = max(mx, dp[i]);
    }
    cout << mx << "\n";
    return 0;
}
