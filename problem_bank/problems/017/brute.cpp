#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;
int main() {
    int n; if(!(cin >> n)) return 0;
    vector<int> a(n); for(int i=0; i<n; ++i) cin >> a[i];
    sort(a.begin(), a.end());
    for(int i=0; i<n; ++i) {
        if(a[i] != i) { cout << i << "\n"; return 0; }
    }
    cout << n << "\n";
    return 0;
}
