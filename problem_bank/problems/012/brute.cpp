#include <iostream>
#include <string>
#include <algorithm>
using namespace std;
int main() {
    string s, t; 
    if(cin >> s >> t) {
        sort(s.begin(), s.end());
        sort(t.begin(), t.end());
        cout << (s == t ? "true" : "false") << "\n";
    }
    return 0;
}
