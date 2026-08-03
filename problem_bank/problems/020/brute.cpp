#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;
int main() {
    int n; if(!(cin >> n)) return 0;
    vector<int> a(n); for(int i=0; i<n; ++i) cin >> a[i];
    sort(a.begin(), a.end());
    cout << a[n/2] << "\n";
    return 0;
}
