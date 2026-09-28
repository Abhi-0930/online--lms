export interface CourseCategory {
  id: string;
  title: string;
  tagline: string;
  description: string;
  icon: string;
  accent: string;
  coursesCount: number;
  studentsCount: string;
  rating: number;
  duration: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "All Levels";
  topics: string[];
  featuredCourse: {
    title: string;
    instructor: string;
    modules: number;
    projects: number;
    problems: number;
  };
}

export interface StudentProject {
  id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  tags: string[];
  metrics: string;
  stars: number;
  demoUrl: string;
  githubUrl: string;
  student: {
    name: string;
    avatar: string;
    role: string;
  };
}

export interface SuccessStory {
  id: string;
  name: string;
  avatar: string;
  currentRole: string;
  company: string;
  companyLogo: string;
  previousRole: string;
  salaryHike: string;
  compensation?: string;
  prepDuration?: string;
  brandColor?: string;
  skills?: string[];
  category: "FAANG" | "Unicorn" | "Fintech" | "Product";
  quote: string;
  story: string;
  linkedin: string;
}

export interface VideoTestimonial {
  id: string;
  studentName: string;
  role: string;
  company: string;
  courseName: string;
  thumbnail: string;
  duration: string;
  highlight: string;
  videoUrl: string;
}

export interface Instructor {
  id: string;
  name: string;
  role: string;
  currentCompany: string;
  companyLogo: string;
  avatar: string;
  experience: string;
  studentsTaught: string;
  rating: number;
  bio: string;
  specialties: string[];
  pastCompanies: string[];
}

export interface FaqItem {
  id: string;
  category: "General" | "Courses" | "Placements" | "Mentorship" | "Billing";
  question: string;
  answer: string;
}

export const HIRING_COMPANIES = [
  { name: "Google", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" },
  { name: "Microsoft", logo: "https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg" },
  { name: "Amazon", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" },
  { name: "Adobe", logo: "https://upload.wikimedia.org/wikipedia/commons/5/5f/Adobe_Inc._logo.svg" },
  { name: "Deloitte", logo: "https://upload.wikimedia.org/wikipedia/commons/5/56/Deloitte.svg" },
  { name: "Accenture", logo: "https://upload.wikimedia.org/wikipedia/commons/c/cd/Accenture.svg" },
  { name: "Infosys", logo: "https://upload.wikimedia.org/wikipedia/commons/9/95/Infosys_logo.svg" },
  { name: "TCS", logo: "https://upload.wikimedia.org/wikipedia/commons/b/b1/Tata_Consultancy_Services_Logo.svg" },
  { name: "Capgemini", logo: "https://upload.wikimedia.org/wikipedia/commons/9/9d/Capgemini_201x_logo.svg" },
  { name: "Uber", logo: "https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png" },
  { name: "Netflix", logo: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" },
  { name: "Atlassian", logo: "https://upload.wikimedia.org/wikipedia/commons/d/d4/Atlassian-Logo.svg" }
];

export const PLATFORM_STATS = [
  { label: "Active Learners", value: 45000, suffix: "+", prefix: "", description: "Across 35+ countries learning daily" },
  { label: "Practice Problems", value: 2500000, suffix: "+", prefix: "", description: "Solved with automated test suites" },
  { label: "Placement Rate", value: 96, suffix: "%", prefix: "", description: "Hired within 6 months of graduation" },
  { label: "Average CTC Hike", value: 168, suffix: "%", prefix: "+", description: "Across all transition tracks" },
  { label: "Hiring Partners", value: 500, suffix: "+", prefix: "", description: "Top tech companies recruiting directly" },
  { label: "1:1 Mentorship Hours", value: 18000, suffix: "+", prefix: "", description: "Delivered by senior tech leads" }
];

export const COURSE_CATEGORIES: CourseCategory[] = [
  {
    id: "dsa",
    title: "Data Structures & Algorithms",
    tagline: "Master Problem Solving & FAANG Interviews",
    description: "From basic arrays and linked lists to dynamic programming, graphs, and system complexity. Crack any technical coding round with confidence.",
    icon: "Code2",
    accent: "from-blue-600 to-indigo-600",
    coursesCount: 14,
    studentsCount: "18.4k",
    rating: 4.9,
    duration: "16 Weeks",
    level: "All Levels",
    topics: ["Arrays & Strings", "Trees & Graphs", "Dynamic Programming", "Bit Manipulation", "Greedy Algorithms", "LeetCode Hard Patterns"],
    featuredCourse: {
      title: "Mastering Algorithmic Thinking & Competitive Programming",
      instructor: "Ex-Google Staff Engineer",
      modules: 24,
      projects: 6,
      problems: 450
    }
  },
  {
    id: "fullstack",
    title: "Full Stack Development",
    tagline: "Build Scalable Production Web Apps",
    description: "Modern web architecture with Next.js 15, TypeScript, React 19, Node.js, GraphQL, Prisma, and PostgreSQL with high performance.",
    icon: "Layers",
    accent: "from-indigo-600 to-violet-600",
    coursesCount: 18,
    studentsCount: "24.1k",
    rating: 4.9,
    duration: "20 Weeks",
    level: "Intermediate",
    topics: ["Next.js 15 App Router", "Server Actions & RSC", "PostgreSQL & Prisma", "Auth & Session Security", "Tailwind CSS & Radix", "Microservices"],
    featuredCourse: {
      title: "Enterprise Full Stack SaaS Engineering with Next.js & Node",
      instructor: "Senior Architect @ Vercel Alumni",
      modules: 32,
      projects: 8,
      problems: 280
    }
  },
  {
    id: "frontend",
    title: "Frontend Mastery",
    tagline: "Craft Awwwards-Level UI & Animations",
    description: "Master React, modern CSS systems, Three.js, GSAP, Framer Motion, web performance, and state management for state-of-the-art experiences.",
    icon: "Sparkles",
    accent: "from-cyan-600 to-blue-600",
    coursesCount: 12,
    studentsCount: "15.2k",
    rating: 4.95,
    duration: "14 Weeks",
    level: "Intermediate",
    topics: ["Three.js & WebGL", "Framer Motion & GSAP", "Component Architecture", "Core Web Vitals", "State Machines", "Accessibility (a11y)"],
    featuredCourse: {
      title: "Creative Frontend & 3D Interactive Web Experiences",
      instructor: "Lead Design Engineer",
      modules: 18,
      projects: 7,
      problems: 190
    }
  },
  {
    id: "backend",
    title: "Backend & Distributed Systems",
    tagline: "Engineer High-Throughput Fault-Tolerant Systems",
    description: "Deep dive into distributed architectures, concurrency, caching strategies with Redis, Apache Kafka, database sharding, and gRPC.",
    icon: "Server",
    accent: "from-emerald-600 to-teal-600",
    coursesCount: 15,
    studentsCount: "13.8k",
    rating: 4.88,
    duration: "18 Weeks",
    level: "Advanced",
    topics: ["System Design (HLD & LLD)", "Distributed Caching & Redis", "Kafka Event Streaming", "Database Indexing & Sharding", "Go & Rust Services", "gRPC & Protocol Buffers"],
    featuredCourse: {
      title: "Distributed Systems Engineering for Extreme Scale",
      instructor: "Principal Engineer @ Amazon",
      modules: 28,
      projects: 5,
      problems: 210
    }
  },
  {
    id: "ai-ml",
    title: "AI & Machine Learning",
    tagline: "Build Intelligent LLM Agents & GenAI Apps",
    description: "From mathematical foundations and deep learning to fine-tuning LLMs, RAG pipelines, LangChain, vector databases, and PyTorch production deployments.",
    icon: "BrainCircuit",
    accent: "from-purple-600 to-pink-600",
    coursesCount: 11,
    studentsCount: "19.5k",
    rating: 4.92,
    duration: "16 Weeks",
    level: "Intermediate",
    topics: ["PyTorch & Neural Networks", "LLM Fine-Tuning", "Vector DBs (Pinecone/Milvus)", "RAG Architectures", "Autonomous AI Agents", "Model Quantization & vLLM"],
    featuredCourse: {
      title: "Production Generative AI & Autonomous Agent Systems",
      instructor: "AI Researcher @ Meta AI",
      modules: 22,
      projects: 6,
      problems: 160
    }
  },
  {
    id: "cloud",
    title: "Cloud Computing & AWS",
    tagline: "Architect Resilient Cloud Infrastructures",
    description: "Master Amazon Web Services, GCP, Docker containerization, Kubernetes orchestration, serverless lambdas, and multi-region deployments.",
    icon: "Cloud",
    accent: "from-amber-600 to-orange-600",
    coursesCount: 9,
    studentsCount: "10.4k",
    rating: 4.86,
    duration: "12 Weeks",
    level: "Intermediate",
    topics: ["AWS Solutions Architect", "Kubernetes & Docker", "Terraform Infrastructure as Code", "Serverless Architectures", "Cloud Cost Optimization", "Zero-Trust Security"],
    featuredCourse: {
      title: "AWS Cloud Architect & Infrastructure Automation Masterclass",
      instructor: "AWS Certified Solution Architect",
      modules: 20,
      projects: 5,
      problems: 140
    }
  },
  {
    id: "cybersecurity",
    title: "Cyber Security & Ethical Hacking",
    tagline: "Defend Enterprise Infrastructures & Apps",
    description: "Web application security (OWASP Top 10), penetration testing, network defense, reverse engineering, cryptography, and cloud security audits.",
    icon: "ShieldCheck",
    accent: "from-rose-600 to-red-600",
    coursesCount: 8,
    studentsCount: "8.7k",
    rating: 4.9,
    duration: "14 Weeks",
    level: "Intermediate",
    topics: ["OWASP Top 10 Vulnerabilities", "Network Penetration Testing", "Cryptography & Cryptanalysis", "Binary Exploitation", "Cloud Security Auditing", "Incident Response"],
    featuredCourse: {
      title: "Offensive & Defensive Web Application Security Engineering",
      instructor: "Senior Penetration Tester @ CrowdStrike",
      modules: 18,
      projects: 4,
      problems: 120
    }
  },
  {
    id: "career-prep",
    title: "Career & Interview Preparation",
    tagline: "Resume Review, Behavioral & System Design Prep",
    description: "Mock technical interviews with senior hiring managers, resume optimization with ATS audits, salary negotiation tactics, and live whiteboard rounds.",
    icon: "Briefcase",
    accent: "from-blue-700 to-sky-600",
    coursesCount: 6,
    studentsCount: "29.3k",
    rating: 4.98,
    duration: "6 Weeks",
    level: "All Levels",
    topics: ["1:1 Live Mock Interviews", "FAANG Behavioral & STAR Framework", "System Design Whiteboard Rounds", "ATS-Proof Resume Optimization", "Salary & Equity Negotiation", "Offer Comparison Matrix"],
    featuredCourse: {
      title: "The Ultimate Tech Career Acceleration & FAANG Placement Blueprint",
      instructor: "Tech Recruiter & Director of Engineering",
      modules: 14,
      projects: 3,
      problems: 95
    }
  }
];

export const LEARNING_JOURNEY_STEPS = [
  {
    step: "01",
    title: "Begin Learning",
    tagline: "Personalized Diagnostic & Roadmap",
    description: "Take our adaptive skill assessment to identify strengths, knowledge gaps, and get a tailored weekly learning roadmap aligned with your dream roles.",
    icon: "Compass",
    deliverables: ["Diagnostic skill matrix", "Personalized syllabus track", "Dedicated mentor assignment"]
  },
  {
    step: "02",
    title: "Core Fundamentals",
    tagline: "Rock-Solid Conceptual Foundation",
    description: "Deep dive into language mechanics, memory models, time/space complexity, and architecture patterns through crisp, visual, concept-first modules.",
    icon: "BookOpenCheck",
    deliverables: ["Visual interactive notes", "Conceptual quizzes & checks", "Weekly live doubt sessions"]
  },
  {
    step: "03",
    title: "Practice Problems",
    tagline: "400+ Curated LeetCode Patterns",
    description: "Solve hand-picked algorithmic problems categorized by core patterns (Sliding Window, Two Pointers, Top-K, Dynamic Programming, Tree Traversal).",
    icon: "Code2",
    deliverables: ["Browser code execution engine", "Automated edge case test suite", "Optimal solution breakdowns"]
  },
  {
    step: "04",
    title: "Hands-on Assignments",
    tagline: "Rigorous Graded Code Reviews",
    description: "Build weekly mini-systems with automated unit tests and receive detailed line-by-line code reviews from industry mentors to refine code quality.",
    icon: "FileCheck2",
    deliverables: ["Automated grading runner", "Mentor code review feedback", "Clean code refactoring tips"]
  },
  {
    step: "05",
    title: "Real-World Projects",
    tagline: "Production-Grade Distributed Software",
    description: "Engineer 4+ enterprise-scale portfolio projects including full-stack microservices, real-time WebSockets, cloud CI/CD pipelines, and AI integrations.",
    icon: "Rocket",
    deliverables: ["GitHub repo architecture", "CI/CD cloud deployment", "Live production URL"]
  },
  {
    step: "06",
    title: "Mock Interviews",
    tagline: "Real-World Simulation with FAANG Mentors",
    description: "Experience realistic 60-minute technical and behavioral mock interviews with senior engineers from Google, Amazon, and Microsoft with instant rubric scores.",
    icon: "Users2",
    deliverables: ["Recorded interview review", "Detailed grading rubric (1-10)", "Actionable improvement items"]
  },
  {
    step: "07",
    title: "Career Preparation",
    tagline: "Resume, LinkedIn & Negotiation Coaching",
    description: "Transform your resume into a top 1% recruiter magnet, optimize your GitHub profile, and learn high-leverage compensation negotiation strategies.",
    icon: "Sparkle",
    deliverables: ["ATS-verified resume redesign", "Direct recruiter introductions", "Offer negotiation strategy"]
  },
  {
    step: "08",
    title: "Job Ready & Placed",
    tagline: "Direct Hiring Partner Referrals",
    description: "Get showcased directly on our talent board accessed by 500+ top tech hiring partners, skip first-round filters, and land high-paying software roles.",
    icon: "Award",
    deliverables: ["Fast-track interview loops", "Verified skill certificate", "Alumni network access for life"]
  }
];

export const WHY_CHOOSE_US = [
  {
    icon: "GitFork",
    title: "Structured Learning",
    description: "No more random tutorials. Step-by-step sequential curriculum designed by top industry engineers."
  },
  {
    icon: "Laptop",
    title: "Real Projects",
    description: "Build production apps with distributed databases, serverless architecture, caching, and CI/CD."
  },
  {
    icon: "Terminal",
    title: "Practice Problems",
    description: "Integrated in-browser code editor with instant test runner and multi-language compilation."
  },
  {
    icon: "ClipboardCheck",
    title: "Assignments & Rubrics",
    description: "Structured deadlines, automated test suites, and line-by-line senior mentor code reviews."
  },
  {
    icon: "Video",
    title: "Live Interactive Sessions",
    description: "Weekly interactive live masterclasses, system design teardowns, and live coding workshops."
  },
  {
    icon: "PlaySquare",
    title: "High-Bitrate Recordings",
    description: "4K crisp recordings with chapter timestamps, searchable transcripts, and downloadable slides."
  },
  {
    icon: "UserCheck",
    title: "1:1 Mentorship",
    description: "Direct weekly 1:1 mentorship calls with senior software engineers working at leading tech firms."
  },
  {
    icon: "MessagesSquare",
    title: "Community Support",
    description: "24/7 active Discord community with dedicated TA channels resolving doubts in under 15 minutes."
  },
  {
    icon: "Target",
    title: "Career Guidance",
    description: "Resume audits, LinkedIn branding, portfolio reviews, and direct hiring partner referrals."
  }
];

export const STUDENT_PROJECTS: StudentProject[] = [
  {
    id: "proj-1",
    title: "AI Resume & Portfolio Analyzer",
    category: "AI & Full Stack",
    description: "Intelligent ATS scoring engine powered by LLMs, vector search, semantic resume parsing, and actionable gap analysis recommendations.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
    tags: ["Next.js 15", "FastAPI", "OpenAI API", "Pinecone", "TailwindCSS"],
    metrics: "45K+ Resumes Processed",
    stars: 1240,
    demoUrl: "https://demo.preppath.dev/ai-resume",
    githubUrl: "https://github.com/preppath-students/ai-resume-analyzer",
    student: {
      name: "Rohan Verma",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      role: "SDE @ Microsoft"
    }
  },
  {
    id: "proj-2",
    title: "CloudScale: Distributed E-Commerce Microservices",
    category: "Backend & Cloud",
    description: "High-throughput e-commerce platform processing 10,000+ orders/sec with Kafka event streaming, Redis distributed locking, and PostgreSQL sharding.",
    image: "https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&w=800&q=80",
    tags: ["Go", "Kafka", "PostgreSQL", "Redis", "Docker", "Kubernetes"],
    metrics: "10K req/sec sustained",
    stars: 980,
    demoUrl: "https://demo.preppath.dev/cloudscale",
    githubUrl: "https://github.com/preppath-students/cloudscale-microservices",
    student: {
      name: "Ananya Sharma",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80",
      role: "Backend Engineer @ Amazon"
    }
  },
  {
    id: "proj-3",
    title: "SyncRoom: Realtime Collaborative Code & Canvas",
    category: "Frontend & WebSockets",
    description: "Figma + VS Code hybrid collaborative IDE with CRDT-based operational transform, low-latency WebRTC video mesh, and Monaco code execution.",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
    tags: ["React 19", "WebSockets", "WebRTC", "Canvas API", "Node.js"],
    metrics: "<15ms Sync Latency",
    stars: 1450,
    demoUrl: "https://demo.preppath.dev/syncroom",
    githubUrl: "https://github.com/preppath-students/syncroom-ide",
    student: {
      name: "Siddharth Iyer",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
      role: "Frontend Engineer @ Razorpay"
    }
  },
  {
    id: "proj-4",
    title: "FinFlow: Personal Wealth & Expense Analytics",
    category: "Full Stack",
    description: "Modern personal finance dashboard with automated bank statement reconciliation, multi-currency wallets, and predictive budgeting charts.",
    image: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80",
    tags: ["Next.js 15", "Prisma", "Chart.js", "Plaid API", "PostgreSQL"],
    metrics: "$2.4M tracked",
    stars: 820,
    demoUrl: "https://demo.preppath.dev/finflow",
    githubUrl: "https://github.com/preppath-students/finflow-analytics",
    student: {
      name: "Pooja Hegde",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
      role: "Full Stack Dev @ Swiggy"
    }
  }
];

export const SUCCESS_STORIES: SuccessStory[] = [
  {
    id: "story-1",
    name: "Arjun Mehta",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80",
    currentRole: "Software Engineer II",
    company: "Google",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
    previousRole: "Service QA Analyst",
    salaryHike: "240%",
    compensation: "₹48 LPA",
    prepDuration: "5 Months",
    brandColor: "#4285F4",
    skills: ["System Design", "Distributed Caching", "Graph Algorithms", "Concurrency"],
    category: "FAANG",
    quote: "The structured DSA pattern approach and system design deep-dives helped me clear the Google L4 loop in one go.",
    story: "Transitioned from a non-CS background and manual QA role to Google after 5 months of intense practice and 1:1 mock interview coaching.",
    linkedin: "https://linkedin.com"
  },
  {
    id: "story-2",
    name: "Sneha Reddy",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
    currentRole: "Full Stack Engineer",
    company: "Microsoft",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg",
    previousRole: "Junior React Dev",
    salaryHike: "190%",
    compensation: "₹42 LPA",
    prepDuration: "4 Months",
    brandColor: "#00A4EF",
    skills: ["React 19", "Next.js 15", "Distributed Microservices", "Azure Cloud"],
    category: "FAANG",
    quote: "Building distributed microservices and handling high-concurrency assignments gave me the exact confidence needed for the Azure interview.",
    story: "Landed an SDE role at Microsoft Azure Core team. The code reviews from mentor engineers pushed my code quality to senior levels.",
    linkedin: "https://linkedin.com"
  },
  {
    id: "story-3",
    name: "Vikram Malhotra",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    currentRole: "Senior Backend Engineer",
    company: "Amazon",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
    previousRole: "Support Engineer",
    salaryHike: "210%",
    compensation: "₹52 LPA",
    prepDuration: "6 Months",
    brandColor: "#FF9900",
    skills: ["Kafka Streams", "Redis Sharding", "PostgreSQL Internals", "AWS DynamoDB"],
    category: "FAANG",
    quote: "The low-level design and distributed systems modules were gold. The system design mock interview changed how I think about scale.",
    story: "Cracked Amazon SDE-2 after mastering Kafka, Redis sharding, and concurrency patterns in the distributed systems track.",
    linkedin: "https://linkedin.com"
  },
  {
    id: "story-4",
    name: "Priya Nair",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80",
    currentRole: "Lead Frontend Engineer",
    company: "Adobe",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/5/5f/Adobe_Inc._logo.svg",
    previousRole: "Frontend Intern",
    salaryHike: "175%",
    compensation: "₹38 LPA",
    prepDuration: "3.5 Months",
    brandColor: "#FF0000",
    skills: ["WebGL & Canvas", "Framer Motion", "Core Web Vitals", "TypeScript"],
    category: "Product",
    quote: "The focus on WebGL, Framer Motion, and Core Web Vitals optimization set my portfolio miles ahead of other candidates.",
    story: "Joined Adobe Creative Cloud team. The portfolio projects built during the course became the central discussion topic in all 4 interview rounds.",
    linkedin: "https://linkedin.com"
  },
  {
    id: "story-5",
    name: "Rohan Varma",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    currentRole: "Staff Backend Engineer",
    company: "Uber",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png",
    previousRole: "Backend Dev @ Local Agency",
    salaryHike: "280%",
    compensation: "₹65 LPA",
    prepDuration: "5.5 Months",
    brandColor: "#000000",
    skills: ["Geospatial Indexing (H3)", "High-Throughput Go", "gRPC", "Distributed Locking"],
    category: "Unicorn",
    quote: "Mastering real-time geospatial pipelines and high-throughput Go services helped me ace Uber's rigorous architectural round.",
    story: "Transitioned from a local agency building simple CRUD apps to building Uber's high-frequency dispatch engines.",
    linkedin: "https://linkedin.com"
  },
  {
    id: "story-6",
    name: "Ananya Iyer",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    currentRole: "Senior Payments Engineer",
    company: "Razorpay",
    companyLogo: "https://cdn.simpleicons.org/razorpay/002992",
    previousRole: "Junior PHP Developer",
    salaryHike: "205%",
    compensation: "₹36 LPA",
    prepDuration: "4 Months",
    brandColor: "#002992",
    skills: ["Payment Gateways", "Event-Driven Architecture", "Idempotency", "PostgreSQL ACID"],
    category: "Fintech",
    quote: "The ledger consistency and idempotency modules were identical to the real-world technical problems Razorpay tests for.",
    story: "Transformed from legacy PHP maintenance into a core fintech payments architect handling millions in daily transaction volumes.",
    linkedin: "https://linkedin.com"
  },
  {
    id: "story-7",
    name: "Kabir Sengupta",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80",
    currentRole: "AI / LLM Systems Engineer",
    company: "Swiggy",
    companyLogo: "https://cdn.simpleicons.org/swiggy/FC8019",
    previousRole: "Data Analyst",
    salaryHike: "230%",
    compensation: "₹45 LPA",
    prepDuration: "5 Months",
    brandColor: "#FC8019",
    skills: ["Vector DBs (Milvus)", "RAG Systems", "LangGraph Agents", "FastAPI"],
    category: "Unicorn",
    quote: "Building autonomous agents and low-latency RAG architectures during the AI track gave me an unstoppable edge during interviews.",
    story: "Pivot from tabular SQL reporting to designing Swiggy's GenAI voice ordering and personalized recommendation systems.",
    linkedin: "https://linkedin.com"
  },
  {
    id: "story-8",
    name: "Tara Deshmukh",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    currentRole: "DevOps & Infrastructure Lead",
    company: "Atlassian",
    companyLogo: "https://cdn.simpleicons.org/atlassian/0052CC",
    previousRole: "System Admin",
    salaryHike: "185%",
    compensation: "₹40 LPA",
    prepDuration: "4.5 Months",
    brandColor: "#0052CC",
    skills: ["Kubernetes Operators", "Terraform Cloud", "ArgoCD GitOps", "Chaos Engineering"],
    category: "Product",
    quote: "The production-grade Kubernetes and Terraform capstone labs gave me immediate answers to every scenario Atlassian threw at me.",
    story: "Moved from on-premise hardware maintenance to orchestrating multi-region Kubernetes clusters on AWS at global scale.",
    linkedin: "https://linkedin.com"
  }
];

export const VIDEO_TESTIMONIALS: VideoTestimonial[] = [
  {
    id: "vid-1",
    studentName: "Aditya Roy",
    role: "SDE @ Uber",
    company: "Uber",
    courseName: "Data Structures & Advanced Algorithms",
    thumbnail: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80",
    duration: "3:42",
    highlight: "How I cracked the Uber coding round with the 14-pattern framework",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
  },
  {
    id: "vid-2",
    studentName: "Kavya Patel",
    role: "AI Engineer @ Atlassian",
    company: "Atlassian",
    courseName: "Generative AI & LLM Systems",
    thumbnail: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=800&q=80",
    duration: "4:15",
    highlight: "From zero AI experience to deploying production RAG systems",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
  },
  {
    id: "vid-3",
    studentName: "Manish Kumar",
    role: "Cloud Architect @ Deloitte",
    company: "Deloitte",
    courseName: "AWS Cloud & DevOps Engineering",
    thumbnail: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80",
    duration: "2:58",
    highlight: "Switched careers from mechanical engineering in 5 months",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
  }
];

export const INSTRUCTORS: Instructor[] = [
  {
    id: "inst-1",
    name: "Dr. Sandeep Kulkarni",
    role: "Ex-Staff Software Engineer",
    currentCompany: "Google",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80",
    experience: "14+ Years",
    studentsTaught: "32,000+",
    rating: 4.97,
    bio: "Former Google Search infrastructure architect and competitive programming Grandmaster. Authored algorithms taught in top university curricula.",
    specialties: ["Advanced Algorithms", "Distributed Systems", "Competitive Programming"],
    pastCompanies: ["Google", "Meta", "Directi"]
  },
  {
    id: "inst-2",
    name: "Natasha Romanov",
    role: "Principal AI Research Scientist",
    currentCompany: "Meta AI",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80",
    experience: "11+ Years",
    studentsTaught: "21,500+",
    rating: 4.95,
    bio: "Specializes in LLM optimization, multimodal vision architectures, and autonomous agent frameworks. Led core machine learning infra teams.",
    specialties: ["Generative AI", "LLM Fine-Tuning", "PyTorch Systems"],
    pastCompanies: ["Meta AI", "OpenAI Contributor", "Stanford AI Lab"]
  },
  {
    id: "inst-3",
    name: "Karthik Sundaram",
    role: "VP of Engineering & Cloud Fellow",
    currentCompany: "Amazon AWS",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
    experience: "16+ Years",
    studentsTaught: "28,000+",
    rating: 4.98,
    bio: "Built core telemetry and serverless infrastructure at AWS. Mentored over 500+ engineers into Staff and Principal engineering roles.",
    specialties: ["System Design HLD/LLD", "AWS Cloud Architecture", "High Concurrency"],
    pastCompanies: ["Amazon", "Uber", "Salesforce"]
  }
];

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: "faq-1",
    category: "General",
    question: "How is Velorah different from YouTube or generic EdTech platforms?",
    answer: "Unlike static video tutorials or passive video libraries, Velorah is built as an interactive engineering school. You write and test real code in our cloud sandbox, build production-grade distributed microservices, receive line-by-line pull request reviews from senior FAANG engineers, and participate in live weekly architectural teardowns."
  },
  {
    id: "faq-2",
    category: "Courses",
    question: "Do I get lifetime access to all course tracks, codebases, and future updates?",
    answer: "Yes, 100%! Once enrolled, you receive permanent lifetime access to all course modules, GitHub repositories, production boilerplate templates, community discussions, and any future curriculum updates at zero additional charge."
  },
  {
    id: "faq-3",
    category: "Billing",
    question: "What is your 100% money-back guarantee and refund policy?",
    answer: "We offer a 7-day unconditional 100% money-back guarantee. If you dive in, explore the materials, and feel it's not the right fit for your learning goals, simply email support@velorah.dev within 7 days for an immediate, no-questions-asked refund."
  },
  {
    id: "faq-4",
    category: "Placements",
    question: "How does placement support, hiring referrals, and mock interviews work?",
    answer: "After completing your capstone projects and passing two 1:1 technical mock interviews, your profile is spotlighted on our exclusive Talent Board accessed by 500+ tech hiring partners (Google, Microsoft, Razorpay, Swiggy, Uber, etc.) with fast-tracked interview loops that bypass resume filters."
  },
  {
    id: "faq-5",
    category: "Mentorship",
    question: "What happens during 1:1 mentorship sessions and live doubt clearing?",
    answer: "You are paired with active senior engineers from top tech companies. You can schedule 1:1 Zoom sessions to audit code, practice system design whiteboards, or get tailored career roadmap advice. Plus, our Discord community has dedicated TA bots and staff responding within 15 minutes."
  },
  {
    id: "faq-6",
    category: "Courses",
    question: "Are course completion certificates recognized and verifiable?",
    answer: "Yes. Every graduate earns a cryptographic, verifiable digital certificate with a permanent URL and QR code. Top recruiters recognize our rigorous capstone evaluation criteria, making it a powerful asset for LinkedIn and resumes."
  },
  {
    id: "faq-7",
    category: "General",
    question: "I am from a non-CS or beginner background. Can I still enroll and succeed?",
    answer: "Over 40% of our successful alumni transitioned from non-traditional or service backgrounds. Every track begins with foundational deep-dives (data structures, memory models, clean architecture) before scaling up to distributed systems and advanced engineering."
  },
  {
    id: "faq-8",
    category: "Courses",
    question: "What are the hardware and software prerequisites to get started?",
    answer: "All you need is a modern web browser and an internet connection. Our integrated in-browser IDE compiles and executes code in the cloud with automated test runners. For local project development, any standard laptop (8GB+ RAM, Windows/Mac/Linux) is sufficient."
  },
  {
    id: "faq-9",
    category: "Placements",
    question: "How do you prepare students for System Design and Behavioral (STAR) rounds?",
    answer: "We dedicate entire modules to Low-Level Design (LLD / Design Patterns) and High-Level Design (HLD / Distributed Systems, Caching, Event Queues, Sharding). You also undergo real-time whiteboard simulations and behavioral coaching using the Amazon Leadership Principles STAR framework."
  },
  {
    id: "faq-10",
    category: "Mentorship",
    question: "How active is the alumni and student community after graduating?",
    answer: "Our Discord network connects 25,000+ engineers worldwide. Even after landing your dream job, you keep full access to exclusive alumni hackathons, internal job referrals, engineering book clubs, and technical AMAs with industry leaders."
  }
];
