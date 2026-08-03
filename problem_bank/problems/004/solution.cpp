#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;
int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    int N, X;
    if (!(cin >> N >> X)) return 0;
    vector<int> A(N);
    for(int i=0; i<N; ++i) cin >> A[i];
    auto it = lower_bound(A.begin(), A.end(), X);
    if(it != A.end() && *it == X) {
        cout << (distance(A.begin(), it) + 1) << "\n";
    } else {
        cout << "-1\n";
    }
    return 0;
}
