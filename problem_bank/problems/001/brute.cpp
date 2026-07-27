#include <bits/stdc++.h>
using namespace std;

bool has_peak(const vector<int>& A) {
    for (int i = 1; i < (int)A.size() - 1; ++i) {
        if (A[i] > A[i - 1] && A[i] > A[i + 1]) {
            return true;
        }
    }
    return false;
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    int N;
    if (!(cin >> N)) return 0;
    
    vector<int> A(N);
    for (int i = 0; i < N; ++i) {
        cin >> A[i];
    }
    
    queue<vector<int>> q;
    set<vector<int>> visited;
    
    q.push(A);
    visited.insert(A);
    
    int ops = 0;
    while (!q.empty()) {
        int sz = q.size();
        while (sz--) {
            vector<int> curr = q.front();
            q.pop();
            
            if (!has_peak(curr)) {
                cout << ops << "\n";
                return 0;
            }
            
            for (int i = 0; i < N; ++i) {
                if (curr[i] > 1) {
                    vector<int> nxt = curr;
                    nxt[i]--;
                    if (visited.find(nxt) == visited.end()) {
                        visited.insert(nxt);
                        q.push(nxt);
                    }
                }
            }
        }
        ops++;
    }
    
    return 0;
}
