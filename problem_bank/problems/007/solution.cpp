#include <iostream>
#include <vector>
using namespace std;
int main() {
    ios_base::sync_with_stdio(false); cin.tie(NULL);
    int n;
    if (!(cin >> n)) return 0;
    if(n == 0 || n == 1) {
        cout << 1 << "\n";
        return 0;
    }
    vector<long long> dp(n + 1);
    dp[0] = 1; dp[1] = 1;
    for(int i=2; i<=n; ++i) dp[i] = (dp[i-1] + dp[i-2]) % 1000000007;
    cout << dp[n] << "\n";
    return 0;
}
