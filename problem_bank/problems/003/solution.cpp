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
    
    int d = freq.size();
    if (d < k) {
        cout << k - d << "\n";
    } else {
        vector<int> counts;
        for (auto const& [c, count] : freq) {
            counts.push_back(count);
        }
        sort(counts.begin(), counts.end());
        int cost = 0;
        for (int i = 0; i < d - k; i++) {
            cost += counts[i];
        }
        cout << cost << "\n";
    }
    
    return 0;
}
