const fs = require('fs');
const path = require('path');

const problems = [
  {
    id: 4,
    title: "Find the Magic Number",
    statement: "You are given a sorted array of N distinct integers. Your task is to find the index (1-based) of a target integer X in the array. If the target integer is not present in the array, output -1.\n\nYou must solve this in O(log N) time complexity.",
    input_format: "The first line contains two space-separated integers, N and X, representing the size of the array and the target number.\nThe second line contains N space-separated integers, A[1], A[2], ..., A[N].",
    output_format: "Print a single integer: the 1-based index of X in the array, or -1 if it is not found.",
    constraints: ["1 <= N <= 10^5", "1 <= X <= 10^9", "1 <= A[i] <= 10^9"],
    difficulty: "EASY",
    tags: ["binary-search"],
    time_limit_ms: 1000,
    memory_limit_mb: 256,
    tests: {
      public: [
        { in: "5 3\n1 2 3 4 5\n", out: "3\n" },
        { in: "4 10\n1 4 7 9\n", out: "-1\n" }
      ],
      private: [
        { in: "1 5\n5\n", out: "1\n" },
        { in: "3 2\n1 3 5\n", out: "-1\n" }
      ]
    }
  },
  {
    id: 5,
    title: "Maximize the Reservoir",
    statement: "You are given an array of N non-negative integers representing the heights of vertical lines drawn on a plane. The distance between adjacent lines is 1 unit.\n\nFind two lines that, together with the x-axis, form a container that holds the most water. Return the maximum amount of water the container can store.",
    input_format: "The first line contains a single integer N.\nThe second line contains N space-separated integers representing the heights.",
    output_format: "Print a single integer: the maximum area of water the container can hold.",
    constraints: ["2 <= N <= 10^5", "0 <= heights[i] <= 10^4"],
    difficulty: "MEDIUM",
    tags: ["two-pointers"],
    time_limit_ms: 2000,
    memory_limit_mb: 256,
    tests: {
      public: [
        { in: "9\n1 8 6 2 5 4 8 3 7\n", out: "49\n" },
        { in: "2\n1 1\n", out: "1\n" }
      ],
      private: [
        { in: "3\n4 3 2\n", out: "4\n" },
        { in: "4\n1 2 1 2\n", out: "3\n" }
      ]
    }
  },
  {
    id: 6,
    title: "Network Connectivity",
    statement: "You are given a network of N computers numbered from 1 to N. You are also given M direct connections between some pairs of computers.\n\nA group of computers is fully connected if there is a path of direct connections between any two computers in the group.\n\nDetermine the total number of disconnected network components in the system.",
    input_format: "The first line contains two integers N and M, representing the number of computers and the number of connections.\nThe next M lines each contain two integers U and V, indicating a direct connection between computer U and computer V.",
    output_format: "Print a single integer representing the number of connected components.",
    constraints: ["1 <= N <= 10^5", "0 <= M <= 10^5", "1 <= U, V <= N"],
    difficulty: "MEDIUM",
    tags: ["graphs"],
    time_limit_ms: 2000,
    memory_limit_mb: 256,
    tests: {
      public: [
        { in: "5 3\n1 2\n2 3\n4 5\n", out: "2\n" },
        { in: "4 0\n", out: "4\n" }
      ],
      private: [
        { in: "3 3\n1 2\n2 3\n3 1\n", out: "1\n" },
        { in: "6 4\n1 2\n2 3\n4 5\n5 6\n", out: "2\n" }
      ]
    }
  },
  {
    id: 7,
    title: "Jump the Steps",
    statement: "You are climbing a staircase. It takes N steps to reach the top.\n\nEach time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top? Since the answer may be large, print it modulo 10^9 + 7.",
    input_format: "A single line containing an integer N.",
    output_format: "Print a single integer: the number of distinct ways to climb to the top, modulo 10^9 + 7.",
    constraints: ["1 <= N <= 10^5"],
    difficulty: "EASY",
    tags: ["dynamic-programming"],
    time_limit_ms: 1000,
    memory_limit_mb: 256,
    tests: {
      public: [
        { in: "2\n", out: "2\n" },
        { in: "3\n", out: "3\n" }
      ],
      private: [
        { in: "1\n", out: "1\n" },
        { in: "5\n", out: "8\n" }
      ]
    }
  },
  {
    id: 8,
    title: "Maximum Subarray Sum",
    statement: "Given an array of N integers (which may include negative numbers), find the contiguous subarray (containing at least one number) which has the largest sum, and return its sum.",
    input_format: "The first line contains a single integer N.\nThe second line contains N space-separated integers.",
    output_format: "Print a single integer representing the maximum subarray sum.",
    constraints: ["1 <= N <= 10^5", "-10^4 <= A[i] <= 10^4"],
    difficulty: "MEDIUM",
    tags: ["dynamic-programming"],
    time_limit_ms: 2000,
    memory_limit_mb: 256,
    tests: {
      public: [
        { in: "9\n-2 1 -3 4 -1 2 1 -5 4\n", out: "6\n" },
        { in: "1\n1\n", out: "1\n" }
      ],
      private: [
        { in: "3\n-3 -5 -2\n", out: "-2\n" },
        { in: "4\n5 -1 5 -1\n", out: "9\n" }
      ]
    }
  },
  {
    id: 9,
    title: "Identify the Leader",
    statement: "In a town, there are N people labeled from 1 to N. There is a rumor that one of these people is the secret town leader.\n\nIf the leader exists, then:\n1. The leader trusts nobody.\n2. Everybody else (except for the leader) trusts the leader.\n3. There is exactly one person that satisfies properties 1 and 2.\n\nYou are given an array of M trust pairs, where each pair (A, B) means person A trusts person B.\n\nFind the label of the town leader if the leader exists and can be identified, or output -1 otherwise.",
    input_format: "The first line contains two integers N and M.\nThe next M lines each contain two space-separated integers A and B.",
    output_format: "Print a single integer: the leader's label, or -1.",
    constraints: ["1 <= N <= 1000", "0 <= M <= 10^4", "1 <= A, B <= N", "A != B"],
    difficulty: "EASY",
    tags: ["graphs"],
    time_limit_ms: 1000,
    memory_limit_mb: 256,
    tests: {
      public: [
        { in: "2 1\n1 2\n", out: "2\n" },
        { in: "3 3\n1 3\n2 3\n3 1\n", out: "-1\n" }
      ],
      private: [
        { in: "3 2\n1 3\n2 3\n", out: "3\n" },
        { in: "4 3\n1 4\n2 4\n3 4\n", out: "4\n" }
      ]
    }
  },
  {
    id: 10,
    title: "Unique Array Elements",
    statement: "Given an array of N integers sorted in non-decreasing order, find the number of unique elements in the array.",
    input_format: "The first line contains a single integer N.\nThe second line contains N space-separated integers.",
    output_format: "Print a single integer representing the number of unique elements.",
    constraints: ["1 <= N <= 10^5", "-10^9 <= A[i] <= 10^9"],
    difficulty: "EASY",
    tags: ["arrays"],
    time_limit_ms: 1000,
    memory_limit_mb: 256,
    tests: {
      public: [
        { in: "3\n1 1 2\n", out: "2\n" },
        { in: "10\n0 0 1 1 1 2 2 3 3 4\n", out: "5\n" }
      ],
      private: [
        { in: "1\n5\n", out: "1\n" },
        { in: "5\n2 2 2 2 2\n", out: "1\n" }
      ]
    }
  }
];

function generate() {
  const problemsDir = path.join(__dirname, '../problems');

  if (!fs.existsSync(problemsDir)) {
    fs.mkdirSync(problemsDir, { recursive: true });
  }

  problems.forEach(prob => {
    const paddedId = String(prob.id).padStart(3, '0');
    const probDir = path.join(problemsDir, paddedId);
    
    // Create main folder
    if (!fs.existsSync(probDir)) fs.mkdirSync(probDir);
    
    // Create public & private folders
    const pubDir = path.join(probDir, 'public');
    const privDir = path.join(probDir, 'private');
    if (!fs.existsSync(pubDir)) fs.mkdirSync(pubDir);
    if (!fs.existsSync(privDir)) fs.mkdirSync(privDir);

    // Write problem.json
    const { tests, ...schema } = prob;
    fs.writeFileSync(
      path.join(probDir, 'problem.json'),
      JSON.stringify(schema, null, 2)
    );

    // Write public tests
    tests.public.forEach((t, i) => {
      const idx = String(i + 1).padStart(2, '0');
      fs.writeFileSync(path.join(pubDir, `${idx}.in`), t.in);
      fs.writeFileSync(path.join(pubDir, `${idx}.out`), t.out);
    });

    // Write private tests
    tests.private.forEach((t, i) => {
      const idx = String(i + 1).padStart(2, '0');
      fs.writeFileSync(path.join(privDir, `${idx}.in`), t.in);
      fs.writeFileSync(path.join(privDir, `${idx}.out`), t.out);
    });

    console.log(`Generated problem ${paddedId}: ${prob.title}`);
  });
}

generate();
