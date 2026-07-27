#include <bits/stdc++.h>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    string s;
    if (!(cin >> s)) return 0;
    
    int n = s.length();
    int min_imb = 1e9;
    
    for (int i = 0; i < n; ++i) {
        map<char, int> freq;
        for (int j = 0; j < n; ++j) {
            if (i == j) continue;
            freq[s[j]]++;
        }
        
        int max_f = -1, min_f = 1e9;
        for (auto const& [c, count] : freq) {
            if (count > 0) {
                max_f = max(max_f, count);
                min_f = min(min_f, count);
            }
        }
        
        if (max_f != -1 && min_f != 1e9) {
            min_imb = min(min_imb, max_f - min_f);
        } else {
            min_imb = 0;
        }
    }
    
    cout << min_imb << "\n";
    return 0;
}
