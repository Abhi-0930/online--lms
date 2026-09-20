import { useState, useEffect, useCallback } from "react";

export interface PublicProblem {
  id: string | number;
  slug?: string;
  title: string;
  category: string;
  topic?: string;
  difficulty: "Easy" | "Medium" | "Hard";
  acceptance: string;
  submissions: number;
  testCases: number;
  status: "Live" | "Draft";
  description?: string;
  sampleInput?: string;
  sampleOutput?: string;
  constraints?: string;
  hints?: string[];
  starterCode?: Record<string, string>;
  solved?: boolean;
  attempts?: number;
}

export const DEFAULT_PROBLEMS: PublicProblem[] = [
  {
    id: "prob-1",
    slug: "two-sum",
    title: "Two Sum & Hash Map Optimizations",
    category: "Arrays",
    topic: "Arrays",
    difficulty: "Easy",
    acceptance: "84.2%",
    submissions: 2420,
    testCases: 15,
    status: "Live",
    description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.",
    sampleInput: "nums = [2,7,11,15], target = 9",
    sampleOutput: "[0,1]",
    constraints: "2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9\nOnly one valid answer exists.",
    hints: [
      "A really brute force way would be to search for all possible pairs of numbers but that would be O(N^2). Can you do better?",
      "Can we use a Hash Map to store previously seen numbers and their indices in O(1) time complexity?"
    ],
    starterCode: {
      python: "class Solution:\n    def solve(self, nums: list[int], target: int) -> list[int]:\n        lookup = {}\n        for i, num in enumerate(nums):\n            diff = target - num\n            if diff in lookup:\n                return [lookup[diff], i]\n            lookup[num] = i\n        return []\n",
      javascript: "function solve(nums, target) {\n    const map = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const diff = target - nums[i];\n        if (map.has(diff)) {\n            return [map.get(diff), i];\n        }\n        map.set(nums[i], i);\n    }\n    return [];\n}\n",
      cpp: "class Solution {\npublic:\n    vector<int> solve(vector<int>& nums, int target) {\n        unordered_map<int, int> lookup;\n        for (int i = 0; i < (int)nums.size(); i++) {\n            int complement = target - nums[i];\n            if (lookup.count(complement)) {\n                return {lookup[complement], i};\n            }\n            lookup[nums[i]] = i;\n        }\n        return {};\n    }\n};\n"
    },
    solved: false,
    attempts: 0,
  },
  {
    id: "prob-2",
    slug: "valid-parentheses",
    title: "Valid Parentheses & Stack Matching",
    category: "Stack",
    topic: "Stack",
    difficulty: "Easy",
    acceptance: "89.5%",
    submissions: 3120,
    testCases: 12,
    status: "Live",
    description: "Given a string `s` containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.",
    sampleInput: "s = \"()[]{}\"",
    sampleOutput: "true",
    constraints: "1 <= s.length <= 10^4\ns consists of parentheses only '()[]{}'.",
    hints: [
      "Use a Last-In-First-Out (LIFO) stack to keep track of opening brackets as you iterate through the string.",
      "When encountering a closing bracket, check if the top of the stack matches its corresponding pair."
    ],
    starterCode: {
      python: "def isValid(s: str) -> bool:\n    stack = []\n    mapping = {')': '(', '}': '{', ']': '['}\n    for char in s:\n        if char in mapping:\n            top = stack.pop() if stack else '#'\n            if mapping[char] != top:\n                return False\n        else:\n            stack.append(char)\n    return not stack\n",
      javascript: "function isValid(s) {\n    const stack = [];\n    const map = { ')': '(', '}': '{', ']': '[' };\n    for (const char of s) {\n        if (char in map) {\n            if (stack.pop() !== map[char]) return false;\n        } else {\n            stack.push(char);\n        }\n    }\n    return stack.length === 0;\n}\n",
      cpp: "class Solution {\npublic:\n    bool isValid(string s) {\n        stack<char> st;\n        for (char c : s) {\n            if (c == '(' || c == '{' || c == '[') st.push(c);\n            else {\n                if (st.empty()) return false;\n                if (c == ')' && st.top() != '(') return false;\n                if (c == '}' && st.top() != '{') return false;\n                if (c == ']' && st.top() != '[') return false;\n                st.pop();\n            }\n        }\n        return st.empty();\n    }\n};\n"
    },
    solved: false,
    attempts: 0,
  },
  {
    id: "prob-3",
    slug: "longest-substring-without-repeating-characters",
    title: "Longest Substring Without Repeating Characters",
    category: "Sliding Window",
    topic: "Sliding Window",
    difficulty: "Medium",
    acceptance: "62.8%",
    submissions: 1890,
    testCases: 24,
    status: "Live",
    description: "Given a string `s`, find the length of the longest substring without repeating characters.",
    sampleInput: "s = \"abcabcbb\"",
    sampleOutput: "3",
    constraints: "0 <= s.length <= 5 * 10^4\ns consists of English letters, digits, symbols and spaces.",
    hints: [
      "Use the Sliding Window technique with two pointers `left` and `right`.",
      "Store the most recent index of each character to jump the `left` pointer forward immediately."
    ],
    starterCode: {
      python: "def lengthOfLongestSubstring(s: str) -> int:\n    char_map = {}\n    left = 0\n    max_len = 0\n    for right, char in enumerate(s):\n        if char in char_map and char_map[char] >= left:\n            left = char_map[char] + 1\n        char_map[char] = right\n        max_len = max(max_len, right - left + 1)\n    return max_len\n",
      javascript: "function lengthOfLongestSubstring(s) {\n    let maxLen = 0, left = 0;\n    const map = new Map();\n    for (let right = 0; right < s.length; right++) {\n        if (map.has(s[right]) && map.get(s[right]) >= left) {\n            left = map.get(s[right]) + 1;\n        }\n        map.set(s[right], right);\n        maxLen = Math.max(maxLen, right - left + 1);\n    }\n    return maxLen;\n}\n",
      cpp: "class Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        vector<int> last(256, -1);\n        int left = 0, maxLen = 0;\n        for (int right = 0; right < s.size(); ++right) {\n            if (last[s[right]] >= left) left = last[s[right]] + 1;\n            last[s[right]] = right;\n            maxLen = max(maxLen, right - left + 1);\n        }\n        return maxLen;\n    }\n};\n"
    },
    solved: false,
    attempts: 0,
  },
  {
    id: "prob-4",
    slug: "merge-intervals",
    title: "Merge Intervals",
    category: "Arrays",
    topic: "Arrays",
    difficulty: "Medium",
    acceptance: "58.4%",
    submissions: 1450,
    testCases: 18,
    status: "Live",
    description: "Given an array of `intervals` where `intervals[i] = [start_i, end_i]`, merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.",
    sampleInput: "intervals = [[1,3],[2,6],[8,10],[15,18]]",
    sampleOutput: "[[1,6],[8,10],[15,18]]",
    constraints: "1 <= intervals.length <= 10^4\nintervals[i].length == 2\n0 <= start_i <= end_i <= 10^4",
    hints: [
      "Sort the intervals by their start times first.",
      "Iterate through sorted intervals. If the current interval overlaps with the previous one, merge them by updating the end time."
    ],
    starterCode: {
      python: "def merge(intervals: list[list[int]]) -> list[list[int]]:\n    if not intervals: return []\n    intervals.sort(key=lambda x: x[0])\n    merged = [intervals[0]]\n    for current in intervals[1:]:\n        prev = merged[-1]\n        if current[0] <= prev[1]:\n            prev[1] = max(prev[1], current[1])\n        else:\n            merged.append(current)\n    return merged\n",
      javascript: "function merge(intervals) {\n    if (!intervals.length) return [];\n    intervals.sort((a, b) => a[0] - b[0]);\n    const res = [intervals[0]];\n    for (let i = 1; i < intervals.length; i++) {\n        const prev = res[res.length - 1];\n        if (intervals[i][0] <= prev[1]) {\n            prev[1] = Math.max(prev[1], intervals[i][1]);\n        } else {\n            res.push(intervals[i]);\n        }\n    }\n    return res;\n}\n",
      cpp: "class Solution {\npublic:\n    vector<vector<int>> merge(vector<vector<int>>& intervals) {\n        if (intervals.empty()) return {};\n        sort(intervals.begin(), intervals.end());\n        vector<vector<int>> res = {intervals[0]};\n        for (int i = 1; i < intervals.size(); ++i) {\n            if (intervals[i][0] <= res.back()[1]) {\n                res.back()[1] = max(res.back()[1], intervals[i][1]);\n            } else {\n                res.push_back(intervals[i]);\n            }\n        }\n        return res;\n    }\n};\n"
    },
    solved: false,
    attempts: 0,
  },
  {
    id: "prob-5",
    slug: "trapping-rain-water",
    title: "Trapping Rain Water",
    category: "Two Pointers",
    topic: "Two Pointers",
    difficulty: "Hard",
    acceptance: "48.1%",
    submissions: 1140,
    testCases: 32,
    status: "Live",
    description: "Given `n` non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
    sampleInput: "height = [0,1,0,2,1,0,1,3,2,1,2,1]",
    sampleOutput: "6",
    constraints: "n == height.length\n1 <= n <= 2 * 10^4\n0 <= height[i] <= 10^5",
    hints: [
      "For each element, the water trapped depends on the minimum of max height to its left and max height to its right minus its own height.",
      "You can solve this in O(N) time and O(1) extra space using two pointers."
    ],
    starterCode: {
      python: "def trap(height: list[int]) -> int:\n    left, right = 0, len(height) - 1\n    left_max, right_max = 0, 0\n    water = 0\n    while left < right:\n        if height[left] < height[right]:\n            if height[left] >= left_max:\n                left_max = height[left]\n            else:\n                water += left_max - height[left]\n            left += 1\n        else:\n            if height[right] >= right_max:\n                right_max = height[right]\n            else:\n                water += right_max - height[right]\n            right -= 1\n    return water\n",
      javascript: "function trap(height) {\n    let left = 0, right = height.length - 1;\n    let leftMax = 0, rightMax = 0, water = 0;\n    while (left < right) {\n        if (height[left] < height[right]) {\n            if (height[left] >= leftMax) leftMax = height[left];\n            else water += leftMax - height[left];\n            left++;\n        } else {\n            if (height[right] >= rightMax) rightMax = height[right];\n            else water += rightMax - height[right];\n            right--;\n        }\n    }\n    return water;\n}\n",
      cpp: "class Solution {\npublic:\n    int trap(vector<int>& height) {\n        int left = 0, right = height.size() - 1;\n        int leftMax = 0, rightMax = 0, water = 0;\n        while (left < right) {\n            if (height[left] < height[right]) {\n                if (height[left] >= leftMax) leftMax = height[left];\n                else water += leftMax - height[left];\n                left++;\n            } else {\n                if (height[right] >= rightMax) rightMax = height[right];\n                else water += rightMax - height[right];\n                right--;\n            }\n        }\n        return water;\n    }\n};\n"
    },
    solved: false,
    attempts: 0,
  },
  {
    id: "prob-6",
    slug: "lowest-common-ancestor-in-binary-tree",
    title: "Lowest Common Ancestor in Binary Tree",
    category: "Trees",
    topic: "Trees",
    difficulty: "Medium",
    acceptance: "71.4%",
    submissions: 1560,
    testCases: 20,
    status: "Live",
    description: "Given a binary tree, find the lowest common ancestor (LCA) of two given nodes in the tree.\n\nAccording to the definition of LCA on Wikipedia: “The lowest common ancestor is defined between two nodes `p` and `q` as the lowest node in `T` that has both `p` and `q` as descendants (where we allow a node to be a descendant of itself).”",
    sampleInput: "root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 1",
    sampleOutput: "3",
    constraints: "The number of nodes in the tree is in the range [2, 10^5].\n-10^9 <= Node.val <= 10^9\nAll Node.val are unique.\np != q\np and q will exist in the tree.",
    hints: [
      "Traverse the tree recursively from the root.",
      "If the current node is equal to p or q, return it. If both left and right subtree returns non-null, the current node is the LCA."
    ],
    starterCode: {
      python: "def lowestCommonAncestor(root, p, q):\n    if not root or root == p or root == q:\n        return root\n    left = lowestCommonAncestor(root.left, p, q)\n    right = lowestCommonAncestor(root.right, p, q)\n    if left and right:\n        return root\n    return left or right\n",
      javascript: "function lowestCommonAncestor(root, p, q) {\n    if (!root || root === p || root === q) return root;\n    const left = lowestCommonAncestor(root.left, p, q);\n    const right = lowestCommonAncestor(root.right, p, q);\n    if (left && right) return root;\n    return left || right;\n}\n",
      cpp: "class Solution {\npublic:\n    TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {\n        if (!root || root == p || root == q) return root;\n        TreeNode* left = lowestCommonAncestor(root->left, p, q);\n        TreeNode* right = lowestCommonAncestor(root->right, p, q);\n        if (left && right) return root;\n        return left ? left : right;\n    }\n};\n"
    },
    solved: false,
    attempts: 0,
  },
  {
    id: "prob-8",
    slug: "container-with-most-water",
    title: "Container With Most Water",
    category: "Two Pointers",
    topic: "Two Pointers",
    difficulty: "Medium",
    acceptance: "75.0%",
    submissions: 980,
    testCases: 20,
    status: "Live",
    description: "You are given an integer array `height` of length `n`. There are `n` vertical lines drawn such that the two endpoints of the `i`th line are `(i, 0)` and `(i, height[i])`.\n\nFind two lines that together with the x-axis form a container, such that the container contains the most water.\n\nReturn the maximum amount of water a container can store.",
    sampleInput: "height = [1,8,6,2,5,4,8,3,7]",
    sampleOutput: "49",
    constraints: "n == height.length\n2 <= n <= 10^5\n0 <= height[i] <= 10^4",
    hints: [
      "Start with the widest container using two pointers at the ends.",
      "Move the pointer corresponding to the shorter line inward."
    ],
    starterCode: {
      python: "class Solution:\n    def maxArea(self, height: list[int]) -> int:\n        left, right = 0, len(height) - 1\n        max_water = 0\n        while left < right:\n            w = right - left\n            h = min(height[left], height[right])\n            max_water = max(max_water, w * h)\n            if height[left] < height[right]:\n                left += 1\n            else:\n                right -= 1\n        return max_water\n",
      javascript: "function maxArea(height) {\n    let left = 0, right = height.length - 1;\n    let maxWater = 0;\n    while (left < right) {\n        const w = right - left;\n        const h = Math.min(height[left], height[right]);\n        maxWater = Math.max(maxWater, w * h);\n        if (height[left] < height[right]) left++;\n        else right--;\n    }\n    return maxWater;\n}\n",
      cpp: "class Solution {\npublic:\n    int maxArea(vector<int>& height) {\n        int left = 0, right = height.size() - 1;\n        int maxWater = 0;\n        while (left < right) {\n            int w = right - left;\n            int h = min(height[left], height[right]);\n            maxWater = max(maxWater, w * h);\n            if (height[left] < height[right]) left++;\n            else right--;\n        }\n        return maxWater;\n    }\n};\n"
    },
    solved: false,
    attempts: 0,
  },
  {
    id: "prob-9",
    slug: "search-in-rotated-sorted-array-8585",
    title: "Search in Rotated Sorted Array",
    category: "Binary Search",
    topic: "Binary Search",
    difficulty: "Medium",
    acceptance: "75.0%",
    submissions: 1240,
    testCases: 30,
    status: "Live",
    description: "Given the array `nums` after the possible rotation and an integer `target`, return the index of `target` if it is in `nums`, or `-1` if it is not in `nums`.\n\nYou must write an algorithm with `O(log n)` runtime complexity.",
    sampleInput: "nums = [4,5,6,7,0,1,2], target = 0",
    sampleOutput: "4",
    constraints: "1 <= nums.length <= 5000\n-10^4 <= nums[i] <= 10^4\nAll values of nums are unique.\nnums is an ascending array that is possibly rotated.",
    hints: [
      "In a rotated sorted array, at least one half is always sorted.",
      "Check if the target falls within the sorted half to decide where to search."
    ],
    starterCode: {
      python: "class Solution:\n    def search(self, nums: list[int], target: int) -> int:\n        left, right = 0, len(nums) - 1\n        while left <= right:\n            mid = (left + right) // 2\n            if nums[mid] == target:\n                return mid\n            if nums[left] <= nums[mid]:\n                if nums[left] <= target < nums[mid]:\n                    right = mid - 1\n                else:\n                    left = mid + 1\n            else:\n                if nums[mid] < target <= nums[right]:\n                    left = mid + 1\n                else:\n                    right = mid - 1\n        return -1\n",
      javascript: "function search(nums, target) {\n    let left = 0, right = nums.length - 1;\n    while (left <= right) {\n        const mid = Math.floor((left + right) / 2);\n        if (nums[mid] === target) return mid;\n        if (nums[left] <= nums[mid]) {\n            if (nums[left] <= target && target < nums[mid]) right = mid - 1;\n            else left = mid + 1;\n        } else {\n            if (nums[mid] < target && target <= nums[right]) left = mid + 1;\n            else right = mid - 1;\n        }\n    }\n    return -1;\n}\n",
      cpp: "class Solution {\npublic:\n    int search(vector<int>& nums, int target) {\n        int left = 0, right = nums.size() - 1;\n        while (left <= right) {\n            int mid = left + (right - left) / 2;\n            if (nums[mid] == target) return mid;\n            if (nums[left] <= nums[mid]) {\n                if (nums[left] <= target && target < nums[mid]) right = mid - 1;\n                else left = mid + 1;\n            } else {\n                if (nums[mid] < target && target <= nums[right]) left = mid + 1;\n                else right = mid - 1;\n            }\n        }\n        return -1;\n    }\n};\n"
    },
    solved: false,
    attempts: 0,
  },
];

const CACHE_KEY = "lms_user_cache_practice_problems";
const SOLVED_KEY = "lms_user_solved_problems";

export function useLiveProblems() {
  const [problems, setProblems] = useState<PublicProblem[]>(DEFAULT_PROBLEMS);
  const [solvedIds, setSolvedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load client cache after hydration
  useEffect(() => {
    try {
      const solved = localStorage.getItem(SOLVED_KEY);
      if (solved) {
        setSolvedIds(JSON.parse(solved));
      }
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        setProblems(JSON.parse(cached));
      }
    } catch {}
  }, []);

  const fetchProblems = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:4000/api/v1/practice-problems");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const mapped: PublicProblem[] = data.map((p: any) => ({
            ...p,
            topic: p.category || p.topic || "General",
            solved: solvedIds.includes(String(p.id)) || solvedIds.includes(p.slug || ""),
            attempts: typeof p.attempts === "number" ? p.attempts : Math.floor((p.submissions || 100) / 15),
          }));
          setProblems(mapped);
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(mapped));
          } catch {}
        }
      }
    } catch {
      // Offline fallback
    } finally {
      setIsLoading(false);
    }
  }, [solvedIds]);

  useEffect(() => {
    fetchProblems();
  }, [fetchProblems]);

  const markProblemSolved = (idOrSlug: string) => {
    setSolvedIds((prev) => {
      const updated = prev.includes(idOrSlug) ? prev : [...prev, idOrSlug];
      try {
        localStorage.setItem(SOLVED_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    setProblems((prev) =>
      prev.map((p) =>
        String(p.id) === idOrSlug || p.slug === idOrSlug ? { ...p, solved: true } : p
      )
    );
  };

  return {
    problems,
    solvedIds,
    isLoading,
    refresh: fetchProblems,
    markProblemSolved,
  };
}
