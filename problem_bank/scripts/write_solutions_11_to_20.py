import os

PROBLEMS = {
    "011": {
        "brute": """\
#include <iostream>
#include <string>
using namespace std;
bool isValid(string s) {
    while (s.find("()") != string::npos || s.find("[]") != string::npos || s.find("{}") != string::npos) {
        size_t p = s.find("()");
        if (p != string::npos) s.erase(p, 2);
        else {
            p = s.find("[]");
            if (p != string::npos) s.erase(p, 2);
            else {
                p = s.find("{}");
                if (p != string::npos) s.erase(p, 2);
            }
        }
    }
    return s.empty();
}
int main() {
    string s; if(cin >> s) cout << (isValid(s) ? "true" : "false") << "\\n";
    return 0;
}
""",
        "solution": """\
#include <iostream>
#include <string>
#include <stack>
using namespace std;
int main() {
    ios_base::sync_with_stdio(false); cin.tie(NULL);
    string s; if (!(cin >> s)) return 0;
    stack<char> st;
    for(char c : s) {
        if(c == '(' || c == '{' || c == '[') st.push(c);
        else {
            if(st.empty()) { cout << "false\\n"; return 0; }
            if(c == ')' && st.top() != '(') { cout << "false\\n"; return 0; }
            if(c == '}' && st.top() != '{') { cout << "false\\n"; return 0; }
            if(c == ']' && st.top() != '[') { cout << "false\\n"; return 0; }
            st.pop();
        }
    }
    cout << (st.empty() ? "true" : "false") << "\\n";
    return 0;
}
""",
        "gen": """\
import random
def gen_case(n_max):
    n = random.randint(2, n_max)
    if n % 2 != 0: n -= 1
    if n == 0: n = 2
    if random.random() < 0.5:
        # valid
        pairs = {"(": ")", "[": "]", "{": "}"}
        res = []
        stack = []
        for _ in range(n):
            if stack and (len(stack) >= n - len(res) or random.random() < 0.3):
                res.append(pairs[stack.pop()])
            else:
                br = random.choice(["(", "[", "{"])
                res.append(br)
                stack.append(br)
        return "".join(res) + "\\n"
    else:
        return "".join(random.choices("()[]{}", k=n)) + "\\n"
"""
    },
    "012": {
        "brute": """\
#include <iostream>
#include <string>
#include <algorithm>
using namespace std;
int main() {
    string s, t; 
    if(cin >> s >> t) {
        sort(s.begin(), s.end());
        sort(t.begin(), t.end());
        cout << (s == t ? "true" : "false") << "\\n";
    }
    return 0;
}
""",
        "solution": """\
#include <iostream>
#include <string>
#include <vector>
using namespace std;
int main() {
    ios_base::sync_with_stdio(false); cin.tie(NULL);
    string s, t; if(!(cin >> s >> t)) return 0;
    if(s.length() != t.length()) { cout << "false\\n"; return 0; }
    vector<int> cnt(26, 0);
    for(char c : s) cnt[c - 'a']++;
    for(char c : t) cnt[c - 'a']--;
    for(int i=0; i<26; ++i) if(cnt[i] != 0) { cout << "false\\n"; return 0; }
    cout << "true\\n";
    return 0;
}
""",
        "gen": """\
import random, string
def gen_case(n_max):
    n = random.randint(1, n_max)
    s = "".join(random.choices(string.ascii_lowercase, k=n))
    if random.random() < 0.5:
        t = list(s)
        random.shuffle(t)
        t = "".join(t)
    else:
        t = "".join(random.choices(string.ascii_lowercase, k=n))
    return f"{s}\\n{t}\\n"
"""
    },
    "013": {
        "brute": """\
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;
struct Act { int s, f; };
bool cmp(Act a, Act b) { return a.f < b.f; }
int main() {
    int n; if(!(cin >> n)) return 0;
    vector<Act> a(n);
    for(int i=0; i<n; ++i) cin >> a[i].s >> a[i].f;
    sort(a.begin(), a.end(), cmp);
    int cnt = 0, last = -1;
    for(int i=0; i<n; ++i) {
        if(a[i].s >= last) {
            cnt++;
            last = a[i].f;
        }
    }
    cout << cnt << "\\n";
    return 0;
}
""",
        "solution": """\
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
    cout << cnt << "\\n";
    return 0;
}
""",
        "gen": """\
import random
def gen_case(n_max):
    n = random.randint(1, n_max)
    res = [f"{n}"]
    for _ in range(n):
        s = random.randint(1, 10**9 - 1)
        f = random.randint(s + 1, 10**9)
        res.append(f"{s} {f}")
    return "\\n".join(res) + "\\n"
"""
    },
    "014": {
        "brute": """\
#include <iostream>
#include <vector>
using namespace std;
int main() {
    int n; if(!(cin >> n)) return 0;
    vector<int> a(n);
    for(int i=0; i<n; ++i) cin >> a[i];
    cout << a[n/2] << "\\n";
    return 0;
}
""",
        "solution": """\
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
    cout << a[slow] << "\\n";
    return 0;
}
""",
        "gen": """\
import random
def gen_case(n_max):
    n = random.randint(1, n_max)
    arr = [random.randint(1, 1000) for _ in range(n)]
    return f"{n}\\n" + " ".join(map(str, arr)) + "\\n"
"""
    },
    "015": {
        "brute": """\
#include <iostream>
#include <vector>
#include <queue>
#include <algorithm>
using namespace std;
int bfs(int start, const vector<vector<int>>& adj, int& farthest) {
    int n = adj.size() - 1;
    vector<int> dist(n + 1, -1);
    queue<int> q;
    q.push(start);
    dist[start] = 0;
    int max_d = 0;
    farthest = start;
    while(!q.empty()) {
        int u = q.front(); q.pop();
        if(dist[u] > max_d) { max_d = dist[u]; farthest = u; }
        for(int v : adj[u]) {
            if(dist[v] == -1) {
                dist[v] = dist[u] + 1;
                q.push(v);
            }
        }
    }
    return max_d;
}
int main() {
    int n; if(!(cin >> n)) return 0;
    vector<vector<int>> adj(n + 1);
    for(int i=0; i<n-1; ++i) {
        int u, v; cin >> u >> v;
        adj[u].push_back(v); adj[v].push_back(u);
    }
    int mx = 0;
    for(int i=1; i<=n; ++i) {
        int f; mx = max(mx, bfs(i, adj, f));
    }
    cout << mx << "\\n";
    return 0;
}
""",
        "solution": """\
#include <iostream>
#include <vector>
using namespace std;
void dfs(int u, int p, int d, const vector<vector<int>>& adj, int& max_d, int& farthest) {
    if(d > max_d) { max_d = d; farthest = u; }
    for(int v : adj[u]) {
        if(v != p) dfs(v, u, d + 1, adj, max_d, farthest);
    }
}
int main() {
    ios_base::sync_with_stdio(false); cin.tie(NULL);
    int n; if(!(cin >> n)) return 0;
    vector<vector<int>> adj(n + 1);
    for(int i=0; i<n-1; ++i) {
        int u, v; cin >> u >> v;
        adj[u].push_back(v); adj[v].push_back(u);
    }
    if(n == 0 || n == 1) { cout << 0 << "\\n"; return 0; }
    int max_d = -1, f1 = 1;
    dfs(1, 0, 0, adj, max_d, f1);
    max_d = -1; int f2 = f1;
    dfs(f1, 0, 0, adj, max_d, f2);
    cout << max_d << "\\n";
    return 0;
}
""",
        "gen": """\
import random
def gen_case(n_max):
    # To keep generation fast and simple, we generate a random tree using Prufer or simple attachment
    # For a simple attachment tree:
    n = random.randint(1, n_max)
    if n == 1: return "1\\n"
    edges = []
    for i in range(2, n + 1):
        edges.append((random.randint(1, i - 1), i))
    # rename nodes randomly
    nodes = list(range(1, n + 1))
    random.shuffle(nodes)
    res = f"{n}\\n"
    for u, v in edges:
        res += f"{nodes[u-1]} {nodes[v-1]}\\n"
    return res
"""
    },
    "016": {
        "brute": """\
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;
int main() {
    int n; if(!(cin >> n)) return 0;
    vector<int> g(n); for(int i=0; i<n; ++i) cin >> g[i];
    int m; cin >> m;
    vector<int> s(m); for(int i=0; i<m; ++i) cin >> s[i];
    sort(g.begin(), g.end());
    sort(s.begin(), s.end());
    int cnt = 0, i = 0, j = 0;
    while(i < n && j < m) {
        if(s[j] >= g[i]) { cnt++; i++; j++; }
        else j++;
    }
    cout << cnt << "\\n";
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
    int n; if(!(cin >> n)) return 0;
    vector<int> g(n); for(int i=0; i<n; ++i) cin >> g[i];
    int m; cin >> m;
    vector<int> s(m); for(int i=0; i<m; ++i) cin >> s[i];
    sort(g.begin(), g.end());
    sort(s.begin(), s.end());
    int cnt = 0, i = 0, j = 0;
    while(i < n && j < m) {
        if(s[j] >= g[i]) { cnt++; i++; j++; }
        else j++;
    }
    cout << cnt << "\\n";
    return 0;
}
""",
        "gen": """\
import random
def gen_case(n_max):
    n = random.randint(1, n_max)
    m = random.randint(1, n_max)
    g = [random.randint(1, 10**9) for _ in range(n)]
    s = [random.randint(1, 10**9) for _ in range(m)]
    return f"{n}\\n" + " ".join(map(str, g)) + f"\\n{m}\\n" + " ".join(map(str, s)) + "\\n"
"""
    },
    "017": {
        "brute": """\
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;
int main() {
    int n; if(!(cin >> n)) return 0;
    vector<int> a(n); for(int i=0; i<n; ++i) cin >> a[i];
    sort(a.begin(), a.end());
    for(int i=0; i<n; ++i) {
        if(a[i] != i) { cout << i << "\\n"; return 0; }
    }
    cout << n << "\\n";
    return 0;
}
""",
        "solution": """\
#include <iostream>
using namespace std;
int main() {
    ios_base::sync_with_stdio(false); cin.tie(NULL);
    int n; if(!(cin >> n)) return 0;
    long long expected = (long long)n * (n + 1) / 2;
    long long actual = 0;
    for(int i=0; i<n; ++i) {
        int x; cin >> x; actual += x;
    }
    cout << expected - actual << "\\n";
    return 0;
}
""",
        "gen": """\
import random
def gen_case(n_max):
    n = random.randint(1, n_max)
    arr = list(range(n + 1))
    arr.remove(random.randint(0, n))
    random.shuffle(arr)
    return f"{n}\\n" + " ".join(map(str, arr)) + "\\n"
"""
    },
    "018": {
        "brute": """\
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;
int main() {
    int n; if(!(cin >> n)) return 0;
    vector<int> a(n); for(int i=0; i<n; ++i) cin >> a[i];
    vector<int> dp(n, 1);
    int mx = 0;
    for(int i=0; i<n; ++i) {
        for(int j=0; j<i; ++j) {
            if(a[j] < a[i]) dp[i] = max(dp[i], dp[j] + 1);
        }
        mx = max(mx, dp[i]);
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
    int n; if(!(cin >> n)) return 0;
    vector<int> lis;
    for(int i=0; i<n; ++i) {
        int x; cin >> x;
        auto it = lower_bound(lis.begin(), lis.end(), x);
        if(it == lis.end()) lis.push_back(x);
        else *it = x;
    }
    cout << lis.size() << "\\n";
    return 0;
}
""",
        "gen": """\
import random
def gen_case(n_max):
    n = random.randint(1, n_max)
    arr = [random.randint(-10**9, 10**9) for _ in range(n)]
    return f"{n}\\n" + " ".join(map(str, arr)) + "\\n"
"""
    },
    "019": {
        "brute": """\
#include <iostream>
#include <vector>
using namespace std;
int main() {
    int n; if(!(cin >> n)) return 0;
    vector<int> a, zeros;
    for(int i=0; i<n; ++i) {
        int x; cin >> x;
        if(x == 0) zeros.push_back(0);
        else a.push_back(x);
    }
    for(int i=0; i<zeros.size(); ++i) a.push_back(0);
    for(int i=0; i<n; ++i) cout << a[i] << (i == n-1 ? "" : " ");
    cout << "\\n";
    return 0;
}
""",
        "solution": """\
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
    cout << "\\n";
    return 0;
}
""",
        "gen": """\
import random
def gen_case(n_max):
    n = random.randint(1, n_max)
    arr = [random.randint(-1000, 1000) for _ in range(n)]
    for i in range(n):
        if random.random() < 0.3: arr[i] = 0
    return f"{n}\\n" + " ".join(map(str, arr)) + "\\n"
"""
    },
    "020": {
        "brute": """\
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;
int main() {
    int n; if(!(cin >> n)) return 0;
    vector<int> a(n); for(int i=0; i<n; ++i) cin >> a[i];
    sort(a.begin(), a.end());
    cout << a[n/2] << "\\n";
    return 0;
}
""",
        "solution": """\
#include <iostream>
using namespace std;
int main() {
    ios_base::sync_with_stdio(false); cin.tie(NULL);
    int n; if(!(cin >> n)) return 0;
    int candidate = 0, count = 0;
    for(int i=0; i<n; ++i) {
        int x; cin >> x;
        if(count == 0) { candidate = x; count = 1; }
        else if(x == candidate) count++;
        else count--;
    }
    cout << candidate << "\\n";
    return 0;
}
""",
        "gen": """\
import random
def gen_case(n_max):
    n = random.randint(1, n_max)
    c = random.randint(-10**9, 10**9)
    arr = [c] * (n // 2 + 1)
    for _ in range(n - len(arr)):
        arr.append(random.randint(-10**9, 10**9))
    random.shuffle(arr)
    return f"{n}\\n" + " ".join(map(str, arr)) + "\\n"
"""
    }
}

GENERATOR_TEMPLATE = """\
import os
import subprocess
import random
import sys

NUM_DIFF_TESTS = 100 # fewer tests to save generation time (if brute force is slow like O(N^2), N=100 is fast)
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
        input_str = gen_case(100) # Small N for validation to avoid TLE on O(N^2) brutes
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
            f.write(test_input + "\\n" if not test_input.endswith("\\n") else test_input)
            
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
