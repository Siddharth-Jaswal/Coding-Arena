#include <iostream>
#include <vector>
using namespace std;
int main() {
    int n, m;
    if (!(cin >> n >> m)) return 0;
    vector<vector<bool>> trust(n + 1, vector<bool>(n + 1, false));
    for(int i=0; i<m; ++i) {
        int a, b; cin >> a >> b;
        trust[a][b] = true;
    }
    int leader = -1;
    for(int i=1; i<=n; ++i) {
        bool trusts_nobody = true;
        for(int j=1; j<=n; ++j) if(trust[i][j]) trusts_nobody = false;
        bool trusted_by_all = true;
        for(int j=1; j<=n; ++j) if(i != j && !trust[j][i]) trusted_by_all = false;
        if(trusts_nobody && trusted_by_all) {
            leader = i;
            break;
        }
    }
    cout << leader << "\n";
    return 0;
}
