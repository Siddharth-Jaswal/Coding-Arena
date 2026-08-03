#include <iostream>
#include <string>
#include <vector>
using namespace std;
int main() {
    ios_base::sync_with_stdio(false); cin.tie(NULL);
    string s, t; if(!(cin >> s >> t)) return 0;
    if(s.length() != t.length()) { cout << "false\n"; return 0; }
    vector<int> cnt(26, 0);
    for(char c : s) cnt[c - 'a']++;
    for(char c : t) cnt[c - 'a']--;
    for(int i=0; i<26; ++i) if(cnt[i] != 0) { cout << "false\n"; return 0; }
    cout << "true\n";
    return 0;
}
