#include <iostream>
#include <string>
using namespace std;
bool isValid(string s) {
    while (s.find("()") != string::npos || s.find("[]") != string::npos || s.find("{}") != string::npos) {
        size_t p = s.find("()");
        if (p != string::npos) s.erase(p, 2);
        else {
            p = s.find("[]");
            if (p != string::npos) s.erase(p, 2);
            else {
                p = s.find("{}");
                if (p != string::npos) s.erase(p, 2);
            }
        }
    }
    return s.empty();
}
int main() {
    string s; if(cin >> s) cout << (isValid(s) ? "true" : "false") << "\n";
    return 0;
}
