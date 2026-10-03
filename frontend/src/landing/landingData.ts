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
    name: "Sri Vardhan Anurag",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80",
    currentRole: "Enterprise AI Orchestrator",
    company: "CloudBridge",
    companyLogo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=100&q=80",
    previousRole: "AI Specialist",
    salaryHike: "180%",
    compensation: "₹28 LPA",
    prepDuration: "5 Months",
    brandColor: "#2563EB",
    skills: ["AI Orchestration", "LLM Pipelines", "System Architecture", "Cloud Infrastructure"],
    category: "Product",
    quote: "The practical approach and continuous guidance helped me strengthen my skills and apply concepts more effectively in real-world scenarios.",
    story: "Mastered enterprise AI orchestration patterns and practical deployment architectures to step into CloudBridge.",
    linkedin: "https://linkedin.com"
  },
  {
    id: "story-2",
    name: "Vishnu Priya",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
    currentRole: "Software Developer",
    company: "CDK Global",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/4/44/CDK_Global_logo.svg",
    previousRole: "Junior Developer",
    salaryHike: "160%",
    compensation: "₹24 LPA",
    prepDuration: "4 Months",
    brandColor: "#00A4EF",
    skills: ["Full Stack Development", "API Design", "Distributed Systems", "Cloud Services"],
    category: "Product",
    quote: "Real-world projects and hands-on learning helped me improve my development skills and grow with greater confidence.",
    story: "Built real-world applications and acquired hands-on engineering confidence to succeed at CDK Global.",
    linkedin: "https://linkedin.com"
  },
  {
    id: "story-3",
    name: "Yaswitha Rao",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80",
    currentRole: "Procurement Specialist",
    company: "Standard Group Companies",
    companyLogo: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&w=100&q=80",
    previousRole: "Operations Associate",
    salaryHike: "150%",
    compensation: "₹20 LPA",
    prepDuration: "3.5 Months",
    brandColor: "#059669",
    skills: ["Strategic Sourcing", "Data Insights", "Process Optimization", "Vendor Management"],
    category: "Product",
    quote: "The sessions were easy to follow and packed with valuable insights that helped me develop new skills effectively.",
    story: "Leveraged insightful sessions and structured learning to take on strategic procurement responsibilities at Standard Group Companies.",
    linkedin: "https://linkedin.com"
  },
  {
    id: "story-4",
    name: "Akshith",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    currentRole: "Associate Software Engineer",
    company: "Accenture",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/c/cd/Accenture.svg",
    previousRole: "Engineering Student",
    salaryHike: "170%",
    compensation: "₹18 LPA",
    prepDuration: "4 Months",
    brandColor: "#A100FF",
    skills: ["Data Structures", "Algorithms", "Core Java", "Problem Solving"],
    category: "Product",
    quote: "The mock interviews helped me improve my communication, identify gaps, and prepare more confidently for technical interviews.",
    story: "Gained immense interview confidence through rigorous mock interview sessions and secured an offer at Accenture.",
    linkedin: "https://linkedin.com"
  },
  {
    id: "story-5",
    name: "Sharon Lee",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    currentRole: "Associate Engineer",
    company: "Virtusa",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Virtusa_logo.svg",
    previousRole: "Graduate Trainee",
    salaryHike: "165%",
    compensation: "₹19 LPA",
    prepDuration: "4.5 Months",
    brandColor: "#EA580C",
    skills: ["Software Engineering", "Full Stack", "Problem Solving", "Clean Code"],
    category: "Product",
    quote: "The learning journey strengthened my problem-solving abilities and encouraged a more structured approach to tackling challenges.",
    story: "Honed structured problem-solving methodologies and launched engineering career at Virtusa.",
    linkedin: "https://linkedin.com"
  },
  {
    id: "story-6",
    name: "Madhumitha",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    currentRole: "Program Analyst Trainee",
    company: "Cognizant",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/9/95/Cognizant_logo_2022.svg",
    previousRole: "Fresher",
    salaryHike: "155%",
    compensation: "₹16 LPA",
    prepDuration: "3 Months",
    brandColor: "#0033A0",
    skills: ["Analytics", "Java & Spring", "SQL", "Agile Fundamentals"],
    category: "Product",
    quote: "The guidance and career-focused learning helped me stay consistent, build confidence, and better understand industry expectations.",
    story: "Stayed disciplined and job-ready through structured mentorship to join Cognizant.",
    linkedin: "https://linkedin.com"
  },
  {
    id: "story-7",
    name: "Bala Subramanyam",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    currentRole: "Systems Engineer (Prime)",
    company: "TCS",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/b/b1/Tata_Consultancy_Services_Logo.svg",
    previousRole: "Engineering Student",
    salaryHike: "195%",
    compensation: "₹22 LPA",
    prepDuration: "5 Months",
    brandColor: "#1E293B",
    skills: ["Systems Engineering", "Algorithms", "OS & Networking", "Advanced Problem Solving"],
    category: "Product",
    quote: "The focus on practical application and continuous learning helped me build skills that extend beyond theoretical knowledge.",
    story: "Applied practical system engineering concepts to crack the premier TCS Prime recruitment track.",
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
    category: "Courses",
    question: "Are the sessions live or recorded?",
    answer: "Yes. Programs include live sessions, and recordings are provided for revision and flexible learning."
  },
  {
    id: "faq-2",
    category: "General",
    question: "Do I need prior experience to join?",
    answer: "No. We offer learning paths suitable for beginners, intermediate learners, and professionals."
  },
  {
    id: "faq-3",
    category: "Courses",
    question: "Are assignments and projects included?",
    answer: "Yes. Every program includes hands-on assignments, coding challenges, and real-world projects."
  },
  {
    id: "faq-4",
    category: "Mentorship",
    question: "Is mentorship included?",
    answer: "Yes. Learners receive guidance through mentorship, doubt-solving sessions, and project reviews."
  },
  {
    id: "faq-5",
    category: "Courses",
    question: "Will I receive a certificate?",
    answer: "Yes. A certificate of completion is provided after successfully meeting the course requirements."
  },
  {
    id: "faq-6",
    category: "Placements",
    question: "Do you provide placement support?",
    answer: "We help with resume building, mock interviews, portfolio development, and interview preparation."
  }
];
