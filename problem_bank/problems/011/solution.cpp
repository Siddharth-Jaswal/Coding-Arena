#include <iostream>
#include <string>
#include <stack>
using namespace std;
int main() {
    ios_base::sync_with_stdio(false); cin.tie(NULL);
    string s; if (!(cin >> s)) return 0;
    stack<char> st;
    for(char c : s) {
        if(c == '(' || c == '{' || c == '[') st.push(c);
        else {
            if(st.empty()) { cout << "false\n"; return 0; }
            if(c == ')' && st.top() != '(') { cout << "false\n"; return 0; }
            if(c == '}' && st.top() != '{') { cout << "false\n"; return 0; }
            if(c == ']' && st.top() != '[') { cout << "false\n"; return 0; }
            st.pop();
        }
    }
    cout << (st.empty() ? "true" : "false") << "\n";
    return 0;
}
