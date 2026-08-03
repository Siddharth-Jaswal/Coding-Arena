#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;
int main() {
    int n; if(!(cin >> n)) return 0;
    vector<int> g(n); for(int i=0; i<n; ++i) cin >> g[i];
    int m; cin >> m;
    vector<int> s(m); for(int i=0; i<m; ++i) cin >> s[i];
    sort(g.begin(), g.end());
    sort(s.begin(), s.end());
    int cnt = 0, i = 0, j = 0;
    while(i < n && j < m) {
        if(s[j] >= g[i]) { cnt++; i++; j++; }
        else j++;
    }
    cout << cnt << "\n";
    return 0;
}
