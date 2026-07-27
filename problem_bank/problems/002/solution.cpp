#include <bits/stdc++.h>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    string s;
    if (!(cin >> s)) return 0;
    
    map<char, int> freq;
    for (char c : s) {
        freq[c]++;
    }
    
    int min_imb = 1e9;
    
    // We can only remove a character that actually exists in the string
    for (auto const& [c_remove, count_remove] : freq) {
        int max_f = -1, min_f = 1e9;
        for (auto const& [c, count] : freq) {
            int cur_count = count;
            if (c == c_remove) {
                cur_count--;
            }
            if (cur_count > 0) {
                max_f = max(max_f, cur_count);
                min_f = min(min_f, cur_count);
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
