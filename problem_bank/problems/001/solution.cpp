#include <bits/stdc++.h>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    int N;
    if (!(cin >> N)) return 0;
    
    vector<int> A(N);
    for (int i = 0; i < N; ++i) {
        cin >> A[i];
    }
    
    long long total_ops = 0;
    for (int i = 1; i < N - 1; ++i) {
        if (A[i] > A[i - 1] && A[i] > A[i + 1]) {
            int target = max(A[i - 1], A[i + 1]);
            total_ops += (A[i] - target);
        }
    }
    
    cout << total_ops << "\n";
    
    return 0;
}
