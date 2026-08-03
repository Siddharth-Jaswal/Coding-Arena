#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;
int main() {
    ios_base::sync_with_stdio(false); cin.tie(NULL);
    int n; if(!(cin >> n)) return 0;
    vector<int> lis;
    for(int i=0; i<n; ++i) {
        int x; cin >> x;
        auto it = lower_bound(lis.begin(), lis.end(), x);
        if(it == lis.end()) lis.push_back(x);
        else *it = x;
    }
    cout << lis.size() << "\n";
    return 0;
}
