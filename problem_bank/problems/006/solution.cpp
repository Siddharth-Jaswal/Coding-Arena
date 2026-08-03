#include <iostream>
#include <vector>
using namespace std;
struct DSU {
    vector<int> parent;
    int comps;
    DSU(int n) {
        parent.resize(n + 1);
        for(int i=1; i<=n; ++i) parent[i] = i;
        comps = n;
    }
    int find(int i) {
        if(parent[i] == i) return i;
        return parent[i] = find(parent[i]);
    }
    void unite(int i, int j) {
        int root_i = find(i);
        int root_j = find(j);
        if(root_i != root_j) {
            parent[root_i] = root_j;
            comps--;
        }
    }
};
int main() {
    ios_base::sync_with_stdio(false); cin.tie(NULL);
    int n, m;
    if (!(cin >> n >> m)) return 0;
    DSU dsu(n);
    for(int i=0; i<m; ++i) {
        int u, v; cin >> u >> v;
        dsu.unite(u, v);
    }
    cout << dsu.comps << "\n";
    return 0;
}
