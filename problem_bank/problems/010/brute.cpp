#include <iostream>
#include <set>
using namespace std;
int main() {
    int n;
    if (!(cin >> n)) return 0;
    set<long long> s;
    for(int i=0; i<n; ++i) {
        long long x; cin >> x;
        s.insert(x);
    }
    cout << s.size() << "\n";
    return 0;
}
