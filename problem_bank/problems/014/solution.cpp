#include <iostream>
#include <vector>
using namespace std;
int main() {
    ios_base::sync_with_stdio(false); cin.tie(NULL);
    int n; if(!(cin >> n)) return 0;
    vector<int> a(n);
    for(int i=0; i<n; ++i) cin >> a[i];
    int slow = 0, fast = 0;
    while(fast < n && fast + 1 < n) {
        slow++;
        fast += 2;
    }
    cout << a[slow] << "\n";
    return 0;
}
