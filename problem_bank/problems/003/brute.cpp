#include <bits/stdc++.h>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    string s;
    int k;
    if (!(cin >> s >> k)) return 0;
    
    if (s.length() < k) {
        cout << -1 << "\n";
        return 0;
    }
    
    map<char, int> freq;
    for (char c : s) {
        freq[c]++;
    }
    
    int D = freq.size();
    vector<pair<char, int>> present(freq.begin(), freq.end());
    
    int min_cost = 1e9;
    
    for (int mask = 0; mask < (1 << D); mask++) {
        int X = __builtin_popcount(mask);
        if (X > k) continue;
        if (k - X > 26 - D) continue; // Not enough outside characters available
        
        int F = 0;
        for (int i = 0; i < D; i++) {
            if (!(mask & (1 << i))) {
                F += present[i].second;
            }
        }
        
        int C = k - X; // Number of outside characters we must introduce
        int cost = max(F, C);
        min_cost = min(min_cost, cost);
    }
    
    if (min_cost == 1e9) {
        cout << -1 << "\n";
    } else {
        cout << min_cost << "\n";
    }
    
    return 0;
}
