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
        print(f"Compilation failed for {source}\n{e.stderr}")
        sys.exit(1)

def run_executable(executable, input_data):
    exe_path = get_exe_name(executable)
    cmd = [f".\\{exe_path}"] if os.name == 'nt' else [f"./{exe_path}"]
    try:
        result = subprocess.run(cmd, input=input_data, capture_output=True, text=True, timeout=TIMEOUT_SEC)
        if result.returncode != 0: return False, f"Error: {result.returncode}", None
        return True, None, result.stdout.strip()
    except subprocess.TimeoutExpired: return False, "TLE", None

# --- INJECTED GEN LOGIC ---
import random
def gen_case(n_max):
    n = random.randint(1, n_max)
    m = random.randint(1, n_max)
    g = [random.randint(1, 10**9) for _ in range(n)]
    s = [random.randint(1, 10**9) for _ in range(m)]
    return f"{n}\n" + " ".join(map(str, g)) + f"\n{m}\n" + " ".join(map(str, s)) + "\n"

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
            f.write(test_input + "\n" if not test_input.endswith("\n") else test_input)
            
        success, _, out = run_executable(sol_exe, test_input + "\n")
        with open(f"private/{idx_str}.out", "w") as f:
            f.write(out + "\n")
            
    print("Generated 100 private test cases successfully.")
    if os.path.exists(get_exe_name(sol_exe)): os.remove(get_exe_name(sol_exe))

if __name__ == "__main__":
    if len(sys.argv) < 2: sys.exit(1)
    if sys.argv[1] == "validate": validate()
    elif sys.argv[1] == "generate": generate_test_cases()
