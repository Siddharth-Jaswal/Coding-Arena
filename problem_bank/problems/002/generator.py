import os
import subprocess
import random
import sys
import glob
import string

# Configuration
NUM_DIFF_TESTS = 1000
RANDOM_SEED = 42
TIMEOUT_SEC = 2.0

def get_exe_name(base_name):
    return f"{base_name}.exe" if os.name == 'nt' else base_name

def compile_cpp(source, executable):
    exe_path = get_exe_name(executable)
    try:
        subprocess.run(
            ["g++", "-std=c++17", "-O2", source, "-o", exe_path],
            check=True,
            capture_output=True,
            text=True
        )
    except subprocess.CalledProcessError as e:
        print(f"Compilation failed for {source}")
        print(e.stderr)
        sys.exit(1)

def run_executable(executable, input_data):
    exe_path = get_exe_name(executable)
    cmd = [f".\\{exe_path}"] if os.name == 'nt' else [f"./{exe_path}"]
    try:
        result = subprocess.run(
            cmd,
            input=input_data,
            capture_output=True,
            text=True,
            timeout=TIMEOUT_SEC
        )
        if result.returncode != 0:
            return False, f"Non-zero exit code: {result.returncode}\nStderr:\n{result.stderr}", None
        return True, None, result.stdout.strip()
    except subprocess.TimeoutExpired:
        return False, "Time Limit Exceeded", None
    except Exception as e:
        return False, f"Execution error: {e}", None

def validate():
    print("Running differential validation...")
    random.seed(RANDOM_SEED)

    brute_exe = "brute_test"
    sol_exe = "sol_test"

    compile_cpp("brute.cpp", brute_exe)
    compile_cpp("solution.cpp", sol_exe)

    for test_idx in range(1, NUM_DIFF_TESTS + 1):
        n = random.randint(2, 10)
        s = "".join(random.choices(string.ascii_lowercase, k=n))
        input_str = f"{s}\n"

        b_success, b_err, b_out = run_executable(brute_exe, input_str)
        if not b_success:
            print(f"Mismatch found! Brute-force failure.\n\nTest #{test_idx}\n\nInput:\n{input_str}\nError:\n{b_err}")
            sys.exit(1)

        s_success, s_err, s_out = run_executable(sol_exe, input_str)
        if not s_success:
            print(f"Mismatch found! Optimized solution failure.\n\nTest #{test_idx}\n\nInput:\n{input_str}\nError:\n{s_err}")
            sys.exit(1)

        if b_out != s_out:
            print(f"Mismatch found!\n\nTest #{test_idx}\n\nInput:\n{input_str.strip()}\n\nBrute output:\n{b_out}\n\nOptimized output:\n{s_out}")
            sys.exit(1)

    print(f"All {NUM_DIFF_TESTS} differential tests passed.")

    for exe in [brute_exe, sol_exe]:
        exe_path = get_exe_name(exe)
        if os.path.exists(exe_path):
            os.remove(exe_path)

def generate_test_cases():
    print("Generating private test suite...")
    random.seed(RANDOM_SEED)
    tests = []
    
    def add(s):
        if 2 <= len(s) <= 100000 and all(c in string.ascii_lowercase for c in s):
            tests.append(s)

    # 1. Boundary / minimal (10)
    add("ab")
    add("aa")
    add("a" * 100000)
    add("z" * 100000)
    add("a" * 99999 + "b")
    add("b" + "a" * 99999)
    add(string.ascii_lowercase * (100000 // 26))
    add("abcdefghijklmnopqrstuvwxyz")
    add("ab" * 50000)
    add("a" * 50000 + "b" * 50000)

    # 2. Structured (20)
    for _ in range(2): add("abc" * 1000)
    for _ in range(2): add("abacaba" * 100)
    for _ in range(2): add("".join([c * 1000 for c in string.ascii_lowercase]))
    for _ in range(2): add("xyz" * 5000 + "abc" * 5000)
    for _ in range(2): add("a" * 1000 + "b" * 1000 + "c")
    for _ in range(2): add("a" * 10 + "b" * 10 + "c" * 10)
    for _ in range(2): add("hello" * 10000)
    for _ in range(2): add("a" + "bcdefghijklmnopqrstuvwxyz" * 1000)
    for _ in range(2): add("codearena" * 5000)
    for _ in range(2): add("".join(reversed(string.ascii_lowercase)) * 1000)

    # 3. Small random (20)
    for _ in range(20):
        n = random.randint(2, 20)
        add("".join(random.choices(string.ascii_lowercase, k=n)))

    # 4. Medium random (20)
    for _ in range(20):
        n = random.randint(100, 5000)
        add("".join(random.choices(string.ascii_lowercase, k=n)))

    # 5. Large random (20)
    for _ in range(20):
        n = random.randint(50000, 100000)
        add("".join(random.choices(string.ascii_lowercase, k=n)))

    # 6. Extreme (10)
    add("a" * 99998 + "bc")
    add("a" + "b" * 49999 + "c" * 50000)
    add("a" * 50000 + "bc" * 25000)
    add("".join(random.choices("xy", k=100000)))
    add("".join(random.choices("abcdefghijklmnopqrstuvwxyz", k=100000)))
    
    a7 = list(string.ascii_lowercase * (100000 // 26 + 1))[:100000]
    add("".join(a7))
    
    a8 = ["a"] * 100000
    a8[1000] = "b"
    a8[99000] = "c"
    add("".join(a8))

    add("".join(random.choices("abc", k=100000)))
    add("".join(random.choices("aeiou", k=100000)))
    add("z" * 100000)

    # Read public tests to avoid duplicates
    public_inputs = set()
    for pub_in in glob.glob("public/*.in"):
        if os.path.exists(pub_in):
            with open(pub_in, "r") as f:
                public_inputs.add(f.read().strip())

    unique_tests = []
    seen = set()
    for s in tests:
        input_str = f"{s}"
        if input_str not in seen and input_str not in public_inputs:
            seen.add(input_str)
            unique_tests.append(input_str)
            
    # Fill remaining tests to exactly 100
    while len(unique_tests) < 100:
        n = random.randint(2, 100)
        s = "".join(random.choices(string.ascii_lowercase, k=n))
        input_str = f"{s}"
        if input_str not in seen and input_str not in public_inputs:
            seen.add(input_str)
            unique_tests.append(input_str)
            
    unique_tests = unique_tests[:100]

    sol_exe = "sol_gen"
    compile_cpp("solution.cpp", sol_exe)

    if not os.path.exists("private"):
        os.makedirs("private")

    for i, test_input in enumerate(unique_tests, 1):
        idx_str = f"{i:03d}"
        in_file = f"private/{idx_str}.in"
        out_file = f"private/{idx_str}.out"
        
        with open(in_file, "w") as f:
            f.write(test_input + "\n")
            
        success, err, out = run_executable(sol_exe, test_input + "\n")
        if not success:
            print(f"Failed to run solution on {in_file}: {err}")
            sys.exit(1)
            
        with open(out_file, "w") as f:
            f.write(out + "\n")
            
    print("Generated 100 private test cases successfully.")

    exe_path = get_exe_name(sol_exe)
    if os.path.exists(exe_path):
        os.remove(exe_path)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python generator.py [validate|generate]")
        sys.exit(1)
        
    mode = sys.argv[1]
    if mode == "validate":
        validate()
    elif mode == "generate":
        generate_test_cases()
    else:
        print("Unknown mode. Use validate or generate.")
