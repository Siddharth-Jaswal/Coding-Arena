#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;
struct Act { int s, f; };
int main() {
    ios_base::sync_with_stdio(false); cin.tie(NULL);
    int n; if(!(cin >> n)) return 0;
    vector<Act> a(n);
    for(int i=0; i<n; ++i) cin >> a[i].s >> a[i].f;
    sort(a.begin(), a.end(), [](const Act& x, const Act& y) {
        return x.f < y.f;
    });
    int cnt = 0, last = -1;
    for(int i=0; i<n; ++i) {
        if(a[i].s >= last) {
            cnt++;
            last = a[i].f;
        }
    }
    cout << cnt << "\n";
    return 0;
}
