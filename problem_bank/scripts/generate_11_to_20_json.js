const fs = require('fs');
const path = require('path');

const problems = [
  {
    id: 11,
    title: "Valid Brackets",
    statement: "Given a string containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\nAn input string is valid if open brackets are closed by the same type of brackets, and they are closed in the correct order.",
    input_format: "A single line containing the string S.",
    output_format: "Print 'true' if the string is valid, otherwise print 'false'.",
    constraints: ["1 <= |S| <= 10^5", "S consists of parentheses only '()[]{}'."],
    difficulty: "EASY",
    tags: ["stack-queue"],
    time_limit_ms: 1000,
    memory_limit_mb: 256,
    tests: {
      public: [
        { in: "()\n", out: "true\n" },
        { in: "()[]{}\n", out: "true\n" },
        { in: "(]\n", out: "false\n" }
      ],
      private: []
    }
  },
  {
    id: 12,
    title: "Anagram Check",
    statement: "Given two strings S and T, write a function to determine if T is an anagram of S.",
    input_format: "The first line contains string S.\nThe second line contains string T.",
    output_format: "Print 'true' if T is an anagram of S, otherwise print 'false'.",
    constraints: ["1 <= |S|, |T| <= 10^5", "Strings consist of lowercase English letters."],
    difficulty: "EASY",
    tags: ["strings"],
    time_limit_ms: 1000,
    memory_limit_mb: 256,
    tests: {
      public: [
        { in: "anagram\nnagaram\n", out: "true\n" },
        { in: "rat\ncar\n", out: "false\n" }
      ],
      private: []
    }
  },
  {
    id: 13,
    title: "Activity Selection",
    statement: "You are given N activities with their start and finish times. Select the maximum number of activities that can be performed by a single person, assuming that a person can only work on a single activity at a time.",
    input_format: "The first line contains an integer N.\nThe next N lines each contain two space-separated integers, representing the start and finish time of an activity.",
    output_format: "Print a single integer: the maximum number of activities.",
    constraints: ["1 <= N <= 10^5", "1 <= start < finish <= 10^9"],
    difficulty: "MEDIUM",
    tags: ["greedy"],
    time_limit_ms: 1000,
    memory_limit_mb: 256,
    tests: {
      public: [
        { in: "3\n10 20\n12 15\n20 30\n", out: "2\n" },
        { in: "6\n1 2\n3 4\n0 6\n5 7\n8 9\n5 9\n", out: "4\n" }
      ],
      private: []
    }
  },
  {
    id: 14,
    title: "Middle of Linked List",
    statement: "You are given an array representing a singly linked list. Return the value of the middle node of the linked list. If there are two middle nodes, return the second middle node.\n\n*Note: Your program will receive the values sequentially. Treat them as the values of a linked list.*",
    input_format: "The first line contains an integer N, the number of nodes.\nThe second line contains N space-separated integers.",
    output_format: "Print a single integer representing the value of the middle node.",
    constraints: ["1 <= N <= 10^5", "1 <= node value <= 1000"],
    difficulty: "EASY",
    tags: ["linked-list"],
    time_limit_ms: 1000,
    memory_limit_mb: 256,
    tests: {
      public: [
        { in: "5\n1 2 3 4 5\n", out: "3\n" },
        { in: "6\n1 2 3 4 5 6\n", out: "4\n" }
      ],
      private: []
    }
  },
  {
    id: 15,
    title: "Tree Diameter",
    statement: "Given an undirected tree consisting of N nodes numbered 1 to N, find its diameter. The diameter of a tree is the number of edges in the longest path between any two nodes.",
    input_format: "The first line contains an integer N.\nThe next N-1 lines each contain two space-separated integers U and V, representing an edge between node U and V.",
    output_format: "Print a single integer representing the diameter.",
    constraints: ["1 <= N <= 10^5", "1 <= U, V <= N"],
    difficulty: "MEDIUM",
    tags: ["trees"],
    time_limit_ms: 2000,
    memory_limit_mb: 256,
    tests: {
      public: [
        { in: "5\n1 2\n1 3\n2 4\n2 5\n", out: "3\n" },
        { in: "6\n1 2\n2 3\n2 4\n4 5\n4 6\n", out: "4\n" }
      ],
      private: []
    }
  },
  {
    id: 16,
    title: "Assign Cookies",
    statement: "Assume you are an awesome parent and want to give your children some cookies. Each child i has a greed factor g[i], which is the minimum size of a cookie that the child will be content with; and each cookie j has a size s[j]. If s[j] >= g[i], we can assign the cookie j to the child i, and the child i will be content.\n\nOutput the maximum number of your children you can make content.",
    input_format: "The first line contains an integer N, the number of children.\nThe second line contains N integers representing g[i].\nThe third line contains an integer M, the number of cookies.\nThe fourth line contains M integers representing s[j].",
    output_format: "Print a single integer: the maximum number of content children.",
    constraints: ["1 <= N, M <= 10^5", "1 <= g[i], s[j] <= 2^31 - 1"],
    difficulty: "EASY",
    tags: ["greedy"],
    time_limit_ms: 1000,
    memory_limit_mb: 256,
    tests: {
      public: [
        { in: "3\n1 2 3\n2\n1 1\n", out: "1\n" },
        { in: "2\n1 2\n3\n1 2 3\n", out: "2\n" }
      ],
      private: []
    }
  },
  {
    id: 17,
    title: "Missing Number",
    statement: "Given an array containing N distinct numbers taken from the range [0, N], return the only number in the range that is missing from the array.",
    input_format: "The first line contains an integer N.\nThe second line contains N space-separated distinct integers.",
    output_format: "Print a single integer representing the missing number.",
    constraints: ["1 <= N <= 10^5", "0 <= nums[i] <= N"],
    difficulty: "EASY",
    tags: ["arrays"],
    time_limit_ms: 1000,
    memory_limit_mb: 256,
    tests: {
      public: [
        { in: "3\n3 0 1\n", out: "2\n" },
        { in: "2\n0 1\n", out: "2\n" }
      ],
      private: []
    }
  },
  {
    id: 18,
    title: "Longest Increasing Subsequence",
    statement: "Given an integer array nums, return the length of the longest strictly increasing subsequence.",
    input_format: "The first line contains an integer N.\nThe second line contains N space-separated integers.",
    output_format: "Print a single integer representing the length of the longest increasing subsequence.",
    constraints: ["1 <= N <= 10^5", "-10^9 <= nums[i] <= 10^9"],
    difficulty: "MEDIUM",
    tags: ["dynamic-programming"],
    time_limit_ms: 1000,
    memory_limit_mb: 256,
    tests: {
      public: [
        { in: "8\n10 9 2 5 3 7 101 18\n", out: "4\n" },
        { in: "6\n0 1 0 3 2 3\n", out: "4\n" }
      ],
      private: []
    }
  },
  {
    id: 19,
    title: "Move Zeroes",
    statement: "Given an integer array nums, move all 0's to the end of it while maintaining the relative order of the non-zero elements.",
    input_format: "The first line contains an integer N.\nThe second line contains N space-separated integers.",
    output_format: "Print N space-separated integers, representing the modified array.",
    constraints: ["1 <= N <= 10^5", "-2^31 <= nums[i] <= 2^31 - 1"],
    difficulty: "EASY",
    tags: ["arrays"],
    time_limit_ms: 1000,
    memory_limit_mb: 256,
    tests: {
      public: [
        { in: "5\n0 1 0 3 12\n", out: "1 3 12 0 0\n" },
        { in: "1\n0\n", out: "0\n" }
      ],
      private: []
    }
  },
  {
    id: 20,
    title: "Majority Element",
    statement: "Given an array nums of size N, return the majority element.\n\nThe majority element is the element that appears more than floor(N / 2) times. You may assume that the majority element always exists in the array.",
    input_format: "The first line contains an integer N.\nThe second line contains N space-separated integers.",
    output_format: "Print a single integer representing the majority element.",
    constraints: ["1 <= N <= 10^5", "-10^9 <= nums[i] <= 10^9"],
    difficulty: "EASY",
    tags: ["arrays"],
    time_limit_ms: 1000,
    memory_limit_mb: 256,
    tests: {
      public: [
        { in: "3\n3 2 3\n", out: "3\n" },
        { in: "7\n2 2 1 1 1 2 2\n", out: "2\n" }
      ],
      private: []
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
    
    if (!fs.existsSync(probDir)) fs.mkdirSync(probDir);
    
    const pubDir = path.join(probDir, 'public');
    const privDir = path.join(probDir, 'private');
    if (!fs.existsSync(pubDir)) fs.mkdirSync(pubDir);
    if (!fs.existsSync(privDir)) fs.mkdirSync(privDir);

    const { tests, ...schema } = prob;
    fs.writeFileSync(
      path.join(probDir, 'problem.json'),
      JSON.stringify(schema, null, 2)
    );

    tests.public.forEach((t, i) => {
      const idx = String(i + 1).padStart(2, '0');
      fs.writeFileSync(path.join(pubDir, `${idx}.in`), t.in);
      fs.writeFileSync(path.join(pubDir, `${idx}.out`), t.out);
    });

    console.log(`Generated problem JSON & public cases for ${paddedId}: ${prob.title}`);
  });
}

generate();
