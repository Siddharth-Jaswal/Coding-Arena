#include <iostream>
#include <vector>
using namespace std;
void dfs(int u, vector<vector<int>>& adj, vector<bool>& vis) {
    vis[u] = true;
    for(int v : adj[u]) if(!vis[v]) dfs(v, adj, vis);
}
int main() {
    int n, m;
    if (!(cin >> n >> m)) return 0;
    vector<vector<int>> adj(n + 1);
    for(int i=0; i<m; ++i) {
        int u, v; cin >> u >> v;
        adj[u].push_back(v);
        adj[v].push_back(u);
    }
    vector<bool> vis(n + 1, false);
    int comp = 0;
    for(int i=1; i<=n; ++i) {
        if(!vis[i]) {
            comp++;
            dfs(i, adj, vis);
        }
    }
    cout << comp << "\n";
    return 0;
}
