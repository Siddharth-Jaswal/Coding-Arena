import os
import textwrap

PROBLEMS = {
    "004": {
        "brute": """\
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
    cout << ans << "\\n";
    return 0;
}
""",
        "solution": """\
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
        cout << (distance(A.begin(), it) + 1) << "\\n";
    } else {
        cout << "-1\\n";
    }
    return 0;
}
""",
        "gen": """\
import random
def gen_case(n_max):
    n = random.randint(1, n_max)
    arr = sorted(random.sample(range(1, 10**9), n))
    x = random.choice(arr) if random.random() < 0.5 else random.randint(1, 10**9)
    return f"{n} {x}\\n" + " ".join(map(str, arr))
"""
    },
    "005": {
        "brute": """\
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;
int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<long long> a(n);
    for(int i=0; i<n; ++i) cin >> a[i];
    long long ans = 0;
    for(int i=0; i<n; ++i) {
        for(int j=i+1; j<n; ++j) {
            ans = max(ans, min(a[i], a[j]) * (j - i));
        }
    }
    cout << ans << "\\n";
    return 0;
}
""",
        "solution": """\
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;
int main() {
    ios_base::sync_with_stdio(false); cin.tie(NULL);
    int n;
    if (!(cin >> n)) return 0;
    vector<long long> a(n);
    for(int i=0; i<n; ++i) cin >> a[i];
    long long ans = 0;
    int l = 0, r = n - 1;
    while(l < r) {
        ans = max(ans, min(a[l], a[r]) * (r - l));
        if(a[l] < a[r]) l++;
        else r--;
    }
    cout << ans << "\\n";
    return 0;
}
""",
        "gen": """\
import random
def gen_case(n_max):
    n = random.randint(2, n_max)
    arr = [random.randint(0, 10**4) for _ in range(n)]
    return f"{n}\\n" + " ".join(map(str, arr))
"""
    },
    "006": {
        "brute": """\
#include <iostream>
#include <vector>
using namespace std;
void dfs(int u, vector<vector<int>>& adj, vector<bool>& vis) {
    vis[u] = true;
    for(int v : adj[u]) if(!vis[v]) dfs(v, adj, vis);
}
int main() {
    int n, m;
    if (!(cin >> n >> m)) return 0;
    vector<vector<int>> adj(n + 1);
    for(int i=0; i<m; ++i) {
        int u, v; cin >> u >> v;
        adj[u].push_back(v);
        adj[v].push_back(u);
    }
    vector<bool> vis(n + 1, false);
    int comp = 0;
    for(int i=1; i<=n; ++i) {
        if(!vis[i]) {
            comp++;
            dfs(i, adj, vis);
        }
    }
    cout << comp << "\\n";
    return 0;
}
""",
        "solution": """\
#include <iostream>
#include <vector>
using namespace std;
struct DSU {
    vector<int> parent;
    int comps;
    DSU(int n) {
        parent.resize(n + 1);
        for(int i=1; i<=n; ++i) parent[i] = i;
        comps = n;
    }
    int find(int i) {
        if(parent[i] == i) return i;
        return parent[i] = find(parent[i]);
    }
    void unite(int i, int j) {
        int root_i = find(i);
        int root_j = find(j);
        if(root_i != root_j) {
            parent[root_i] = root_j;
            comps--;
        }
    }
};
int main() {
    ios_base::sync_with_stdio(false); cin.tie(NULL);
    int n, m;
    if (!(cin >> n >> m)) return 0;
    DSU dsu(n);
    for(int i=0; i<m; ++i) {
        int u, v; cin >> u >> v;
        dsu.unite(u, v);
    }
    cout << dsu.comps << "\\n";
    return 0;
}
""",
        "gen": """\
import random
def gen_case(n_max):
    n = random.randint(1, n_max)
    m_max = min(10**5, n * (n - 1) // 2)
    m = random.randint(0, min(n_max, m_max))
    edges = set()
    while len(edges) < m:
        u, v = random.randint(1, n), random.randint(1, n)
        if u != v:
            edges.add((min(u,v), max(u,v)))
    res = f"{n} {len(edges)}\\n"
    for u, v in edges:
        res += f"{u} {v}\\n"
    return res
"""
    },
    "007": {
        "brute": """\
#include <iostream>
using namespace std;
long long solve(int n) {
    if(n == 0 || n == 1) return 1;
    long long a = 1, b = 1;
    for(int i=2; i<=n; ++i) {
        long long c = (a + b) % 1000000007;
        a = b;
        b = c;
    }
    return b;
}
int main() {
    int n;
    if (cin >> n) cout << solve(n) << "\\n";
    return 0;
}
""",
        "solution": """\
#include <iostream>
#include <vector>
using namespace std;
int main() {
    ios_base::sync_with_stdio(false); cin.tie(NULL);
    int n;
    if (!(cin >> n)) return 0;
    if(n == 0 || n == 1) {
        cout << 1 << "\\n";
        return 0;
    }
    vector<long long> dp(n + 1);
    dp[0] = 1; dp[1] = 1;
    for(int i=2; i<=n; ++i) dp[i] = (dp[i-1] + dp[i-2]) % 1000000007;
    cout << dp[n] << "\\n";
    return 0;
}
""",
        "gen": """\
import random
def gen_case(n_max):
    n = random.randint(1, n_max)
    return f"{n}\\n"
"""
    },
    "008": {
        "brute": """\
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;
int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<long long> a(n);
    for(int i=0; i<n; ++i) cin >> a[i];
    long long mx = a[0];
    for(int i=0; i<n; ++i) {
        long long cur = 0;
        for(int j=i; j<n; ++j) {
            cur += a[j];
            mx = max(mx, cur);
        }
    }
    cout << mx << "\\n";
    return 0;
}
""",
        "solution": """\
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;
int main() {
    ios_base::sync_with_stdio(false); cin.tie(NULL);
    int n;
    if (!(cin >> n)) return 0;
    long long mx = -1e18, cur = 0;
    for(int i=0; i<n; ++i) {
        long long x; cin >> x;
        cur += x;
        mx = max(mx, cur);
        if(cur < 0) cur = 0;
    }
    cout << mx << "\\n";
    return 0;
}
""",
        "gen": """\
import random
def gen_case(n_max):
    n = random.randint(1, n_max)
    arr = [random.randint(-10000, 10000) for _ in range(n)]
    return f"{n}\\n" + " ".join(map(str, arr))
"""
    },
    "009": {
        "brute": """\
#include <iostream>
#include <vector>
using namespace std;
int main() {
    int n, m;
    if (!(cin >> n >> m)) return 0;
    vector<vector<bool>> trust(n + 1, vector<bool>(n + 1, false));
    for(int i=0; i<m; ++i) {
        int a, b; cin >> a >> b;
        trust[a][b] = true;
    }
    int leader = -1;
    for(int i=1; i<=n; ++i) {
        bool trusts_nobody = true;
        for(int j=1; j<=n; ++j) if(trust[i][j]) trusts_nobody = false;
        bool trusted_by_all = true;
        for(int j=1; j<=n; ++j) if(i != j && !trust[j][i]) trusted_by_all = false;
        if(trusts_nobody && trusted_by_all) {
            leader = i;
            break;
        }
    }
    cout << leader << "\\n";
    return 0;
}
""",
        "solution": """\
#include <iostream>
#include <vector>
using namespace std;
int main() {
    ios_base::sync_with_stdio(false); cin.tie(NULL);
    int n, m;
    if (!(cin >> n >> m)) return 0;
    vector<int> in(n + 1, 0), out(n + 1, 0);
    for(int i=0; i<m; ++i) {
        int a, b; cin >> a >> b;
        out[a]++;
        in[b]++;
    }
    int leader = -1;
    for(int i=1; i<=n; ++i) {
        if(in[i] == n - 1 && out[i] == 0) {
            leader = i;
            break;
        }
    }
    cout << leader << "\\n";
    return 0;
}
""",
        "gen": """\
import random
def gen_case(n_max):
    n = random.randint(1, n_max)
    m = random.randint(0, min(10000, n*(n-1)))
    has_leader = random.random() < 0.5
    edges = set()
    if has_leader and n > 0:
        leader = random.randint(1, n)
        for i in range(1, n+1):
            if i != leader: edges.add((i, leader))
        rem = m - (n - 1)
        while rem > 0:
            a, b = random.randint(1, n), random.randint(1, n)
            if a != leader and a != b:
                if (a, b) not in edges:
                    edges.add((a, b))
                    rem -= 1
    else:
        while len(edges) < m:
            a, b = random.randint(1, n), random.randint(1, n)
            if a != b: edges.add((a, b))
    res = f"{n} {len(edges)}\\n"
    for u, v in edges: res += f"{u} {v}\\n"
    return res
"""
    },
    "010": {
        "brute": """\
#include <iostream>
#include <set>
using namespace std;
int main() {
    int n;
    if (!(cin >> n)) return 0;
    set<long long> s;
    for(int i=0; i<n; ++i) {
        long long x; cin >> x;
        s.insert(x);
    }
    cout << s.size() << "\\n";
    return 0;
}
""",
        "solution": """\
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
    cout << count << "\\n";
    return 0;
}
""",
        "gen": """\
import random
def gen_case(n_max):
    n = random.randint(1, n_max)
    arr = [random.randint(-10**9, 10**9) for _ in range(n)]
    if random.random() < 0.5:
        # lots of duplicates
        base = [random.randint(-10**9, 10**9) for _ in range(max(1, n//10))]
        arr = [random.choice(base) for _ in range(n)]
    arr.sort()
    return f"{n}\\n" + " ".join(map(str, arr))
"""
    }
}

GENERATOR_TEMPLATE = """\
import os
import subprocess
import random
import sys
import glob

NUM_DIFF_TESTS = 200 # fewer tests to save generation time
RANDOM_SEED = 42
TIMEOUT_SEC = 2.0

def get_exe_name(base_name):
    return f"{base_name}.exe" if os.name == 'nt' else base_name

def compile_cpp(source, executable):
    exe_path = get_exe_name(executable)
    try:
        subprocess.run(
            ["g++", "-std=c++17", "-O2", source, "-o", exe_path],
            check=True, capture_output=True, text=True
        )
    except subprocess.CalledProcessError as e:
        print(f"Compilation failed for {source}\\n{e.stderr}")
        sys.exit(1)

def run_executable(executable, input_data):
    exe_path = get_exe_name(executable)
    cmd = [f".\\\\{exe_path}"] if os.name == 'nt' else [f"./{exe_path}"]
    try:
        result = subprocess.run(cmd, input=input_data, capture_output=True, text=True, timeout=TIMEOUT_SEC)
        if result.returncode != 0: return False, f"Error: {result.returncode}", None
        return True, None, result.stdout.strip()
    except subprocess.TimeoutExpired: return False, "TLE", None

# --- INJECTED GEN LOGIC ---
{gen_logic}
# --------------------------

def validate():
    random.seed(RANDOM_SEED)
    brute_exe, sol_exe = "brute_test", "sol_test"
    compile_cpp("brute.cpp", brute_exe)
    compile_cpp("solution.cpp", sol_exe)
    
    for _ in range(NUM_DIFF_TESTS):
        input_str = gen_case(100) # Small N for validation
        b_success, _, b_out = run_executable(brute_exe, input_str)
        s_success, _, s_out = run_executable(sol_exe, input_str)
        
        if not b_success or not s_success or b_out != s_out:
            print("Mismatch or failure on validation!")
            sys.exit(1)
            
    print("Validation passed.")
    for exe in [brute_exe, sol_exe]:
        if os.path.exists(get_exe_name(exe)): os.remove(get_exe_name(exe))

def generate_test_cases():
    random.seed(RANDOM_SEED)
    tests = []
    
    for _ in range(100):
        tests.append(gen_case(10**5))
        
    sol_exe = "sol_gen"
    compile_cpp("solution.cpp", sol_exe)

    if not os.path.exists("private"):
        os.makedirs("private")

    for i, test_input in enumerate(tests, 1):
        idx_str = f"{i:03d}"
        with open(f"private/{idx_str}.in", "w") as f:
            f.write(test_input + "\\n")
            
        success, _, out = run_executable(sol_exe, test_input + "\\n")
        with open(f"private/{idx_str}.out", "w") as f:
            f.write(out + "\\n")
            
    print("Generated 100 private test cases successfully.")
    if os.path.exists(get_exe_name(sol_exe)): os.remove(get_exe_name(sol_exe))

if __name__ == "__main__":
    if len(sys.argv) < 2: sys.exit(1)
    if sys.argv[1] == "validate": validate()
    elif sys.argv[1] == "generate": generate_test_cases()
"""

def generate_all():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../problems'))
    for prob_id, data in PROBLEMS.items():
        prob_dir = os.path.join(base_dir, prob_id)
        if not os.path.exists(prob_dir):
            os.makedirs(prob_dir)
            
        with open(os.path.join(prob_dir, "brute.cpp"), "w") as f:
            f.write(data["brute"])
            
        with open(os.path.join(prob_dir, "solution.cpp"), "w") as f:
            f.write(data["solution"])
            
        with open(os.path.join(prob_dir, "generator.py"), "w") as f:
            f.write(GENERATOR_TEMPLATE.replace("{gen_logic}", data["gen"]))
            
        print(f"Written files for {prob_id}")

generate_all()
