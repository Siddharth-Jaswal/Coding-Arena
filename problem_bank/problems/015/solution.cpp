#include <iostream>
#include <vector>
using namespace std;
void dfs(int u, int p, int d, const vector<vector<int>>& adj, int& max_d, int& farthest) {
    if(d > max_d) { max_d = d; farthest = u; }
    for(int v : adj[u]) {
        if(v != p) dfs(v, u, d + 1, adj, max_d, farthest);
    }
}
int main() {
    ios_base::sync_with_stdio(false); cin.tie(NULL);
    int n; if(!(cin >> n)) return 0;
    vector<vector<int>> adj(n + 1);
    for(int i=0; i<n-1; ++i) {
        int u, v; cin >> u >> v;
        adj[u].push_back(v); adj[v].push_back(u);
    }
    if(n == 0 || n == 1) { cout << 0 << "\n"; return 0; }
    int max_d = -1, f1 = 1;
    dfs(1, 0, 0, adj, max_d, f1);
    max_d = -1; int f2 = f1;
    dfs(f1, 0, 0, adj, max_d, f2);
    cout << max_d << "\n";
    return 0;
}
