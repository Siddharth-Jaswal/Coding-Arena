#include <iostream>
#include <vector>
using namespace std;
int main() {
    int n; if(!(cin >> n)) return 0;
    vector<int> a, zeros;
    for(int i=0; i<n; ++i) {
        int x; cin >> x;
        if(x == 0) zeros.push_back(0);
        else a.push_back(x);
    }
    for(int i=0; i<zeros.size(); ++i) a.push_back(0);
    for(int i=0; i<n; ++i) cout << a[i] << (i == n-1 ? "" : " ");
    cout << "\n";
    return 0;
}
