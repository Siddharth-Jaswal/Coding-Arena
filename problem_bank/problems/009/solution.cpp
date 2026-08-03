#include <iostream>
#include <vector>
using namespace std;
int main() {
    ios_base::sync_with_stdio(false); cin.tie(NULL);
    int n, m;
    if (!(cin >> n >> m)) return 0;
    vector<int> in(n + 1, 0), out(n + 1, 0);
    for(int i=0; i<m; ++i) {
        int a, b; cin >> a >> b;
        out[a]++;
        in[b]++;
    }
    int leader = -1;
    for(int i=1; i<=n; ++i) {
        if(in[i] == n - 1 && out[i] == 0) {
            leader = i;
            break;
        }
    }
    cout << leader << "\n";
    return 0;
}
