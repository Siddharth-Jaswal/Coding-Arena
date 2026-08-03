#include <iostream>
#include <vector>
using namespace std;
int main() {
    ios_base::sync_with_stdio(false); cin.tie(NULL);
    int n;
    if (!(cin >> n)) return 0;
    int count = 0;
    long long prev = -2e18;
    for(int i=0; i<n; ++i) {
        long long x; cin >> x;
        if(x != prev) {
            count++;
            prev = x;
        }
    }
    cout << count << "\n";
    return 0;
}
