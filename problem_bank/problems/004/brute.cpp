#include <iostream>
#include <vector>
using namespace std;
int main() {
    int N, X;
    if (!(cin >> N >> X)) return 0;
    vector<int> A(N);
    for(int i=0; i<N; ++i) cin >> A[i];
    int ans = -1;
    for(int i=0; i<N; ++i) {
        if(A[i] == X) {
            ans = i + 1;
            break;
        }
    }
    cout << ans << "\n";
    return 0;
}
