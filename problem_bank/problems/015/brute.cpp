#include <iostream>
#include <vector>
#include <queue>
#include <algorithm>
using namespace std;
int bfs(int start, const vector<vector<int>>& adj, int& farthest) {
    int n = adj.size() - 1;
    vector<int> dist(n + 1, -1);
    queue<int> q;
    q.push(start);
    dist[start] = 0;
    int max_d = 0;
    farthest = start;
    while(!q.empty()) {
        int u = q.front(); q.pop();
        if(dist[u] > max_d) { max_d = dist[u]; farthest = u; }
        for(int v : adj[u]) {
            if(dist[v] == -1) {
                dist[v] = dist[u] + 1;
                q.push(v);
            }
        }
    }
    return max_d;
}
int main() {
    int n; if(!(cin >> n)) return 0;
    vector<vector<int>> adj(n + 1);
    for(int i=0; i<n-1; ++i) {
        int u, v; cin >> u >> v;
        adj[u].push_back(v); adj[v].push_back(u);
    }
    int mx = 0;
    for(int i=1; i<=n; ++i) {
        int f; mx = max(mx, bfs(i, adj, f));
    }
    cout << mx << "\n";
    return 0;
}
