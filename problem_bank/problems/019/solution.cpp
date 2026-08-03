#include <iostream>
#include <vector>
using namespace std;
int main() {
    ios_base::sync_with_stdio(false); cin.tie(NULL);
    int n; if(!(cin >> n)) return 0;
    vector<int> a(n);
    int j = 0;
    for(int i=0; i<n; ++i) {
        cin >> a[i];
        if(a[i] != 0) {
            swap(a[i], a[j]);
            j++;
        }
    }
    for(int i=0; i<n; ++i) cout << a[i] << (i == n-1 ? "" : " ");
    cout << "\n";
    return 0;
}
