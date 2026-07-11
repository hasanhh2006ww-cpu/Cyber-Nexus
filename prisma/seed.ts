import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const adapter = new PrismaBetterSqlite3({ url: "prisma/dev.db" });
const prisma = new PrismaClient({ adapter });

const users = [
  { name: "Admin User", email: "admin@example.com", password: "admin123", role: "admin" },
  { name: "Ahmed Hassan", email: "ahmed@example.com", password: "password123", role: "student" },
  { name: "Sara Al-Rashid", email: "sara@example.com", password: "password123", role: "student" },
  { name: "Mohammed Ali", email: "mohammed@example.com", password: "password123", role: "student" },
  { name: "Fatima Khalil", email: "fatima@example.com", password: "password123", role: "student" },
  { name: "Omar Yusuf", email: "omar@example.com", password: "password123", role: "student" },
];

const coursesData = [
  {
    title: "Introduction to Cybersecurity",
    description: "Learn the fundamentals of cybersecurity, understand common threats, and build a strong foundation for your career in information security.",
    category: "Fundamentals",
    difficulty: "beginner",
    duration: "4 weeks",
    lessons: [
      { title: "What is Cybersecurity?", content: "Cybersecurity is the practice of protecting systems, networks, and programs from digital attacks. These attacks are usually aimed at accessing, changing, or destroying sensitive information; extorting money from users; or interrupting normal business processes.\n\nIn this lesson, we cover:\n- Definition of Cybersecurity\n- Why Cybersecurity Matters\n- The CIA Triad (Confidentiality, Integrity, Availability)\n- Types of Cyber Threats\n- Career Paths in Cybersecurity", order: 1, duration: "30 min" },
      { title: "Types of Cyber Attacks", content: "Understanding different types of cyber attacks is fundamental to defending against them.\n\nCommon attack types include:\n- Malware (Viruses, Worms, Trojans, Ransomware)\n- Phishing and Social Engineering\n- Man-in-the-Middle Attacks\n- Denial of Service (DoS/DDoS)\n- SQL Injection\n- Cross-Site Scripting (XSS)\n- Zero-Day Exploits", order: 2, duration: "45 min" },
      { title: "Network Security Basics", content: "Network security involves policies, processes, and practices adopted to prevent, monitor, and report unauthorized computer network access.\n\nTopics covered:\n- OSI Model and Security\n- Firewalls and IDS/IPS\n- VPN and Encryption\n- Network Monitoring\n- Secure Network Architecture", order: 3, duration: "40 min" },
      { title: "Security Policies and Compliance", content: "Organizations need security policies and compliance frameworks to maintain proper security posture.\n\nThis lesson covers:\n- Information Security Policies\n- Acceptable Use Policies\n- Compliance Frameworks (NIST, ISO 27001, GDPR)\n- Risk Management Basics\n- Security Audits", order: 4, duration: "35 min" },
    ],
  },
  {
    title: "Ethical Hacking Fundamentals",
    description: "Master the art of ethical hacking. Learn penetration testing methodologies, reconnaissance techniques, and vulnerability assessment.",
    category: "Hacking",
    difficulty: "beginner",
    duration: "6 weeks",
    lessons: [
      { title: "Introduction to Ethical Hacking", content: "Ethical hacking involves authorized attempts to gain unauthorized access to a computer system or network.\n\nTopics:\n- What is Ethical Hacking?\n- Types of Hackers (White Hat, Black Hat, Grey Hat)\n- Legal and Ethical Considerations\n- The Hacking Methodology\n- Bug Bounty Programs", order: 1, duration: "35 min" },
      { title: "Reconnaissance and Footprinting", content: "Reconnaissance is the first phase of ethical hacking where information is gathered about the target.\n\nTechniques covered:\n- Passive vs Active Reconnaissance\n- OSINT (Open Source Intelligence)\n- Google Dorking\n- WHOIS Lookups\n- DNS Enumeration\n- Social Media Reconnaissance", order: 2, duration: "50 min" },
      { title: "Scanning and Enumeration", content: "After reconnaissance, ethical hackers scan networks to discover live hosts and services.\n\nTopics:\n- Port Scanning (Nmap)\n- Vulnerability Scanning\n- Network Mapping\n- Service Enumeration\n- OS Fingerprinting", order: 3, duration: "45 min" },
      { title: "System Hacking Techniques", content: "Learn how to identify and exploit vulnerabilities in systems.\n\nTopics:\n- Password Cracking\n- Privilege Escalation\n- Maintaining Access\n- Covering Tracks\n- Post-Exploitation Techniques", order: 4, duration: "55 min" },
      { title: "Web Application Hacking", content: "Web applications are common targets. Learn the OWASP Top 10 and exploitation techniques.\n\nTopics:\n- OWASP Top 10\n- SQL Injection Deep Dive\n- Cross-Site Scripting (XSS)\n- Cross-Site Request Forgery (CSRF)\n- File Upload Vulnerabilities", order: 5, duration: "60 min" },
    ],
  },
  {
    title: "Network Security",
    description: "Deep dive into network security concepts, firewall configuration, intrusion detection systems, and network monitoring.",
    category: "Network Security",
    difficulty: "intermediate",
    duration: "5 weeks",
    lessons: [
      { title: "Network Architecture and Security", content: "Understanding network architecture is key to securing it.\n\nTopics:\n- Network Topologies\n- DMZ Architecture\n- Segmentation and Micro-segmentation\n- Zero Trust Architecture\n- Cloud Network Security", order: 1, duration: "40 min" },
      { title: "Firewall Configuration", content: "Firewalls are the first line of defense in network security.\n\nTopics:\n- Types of Firewalls\n- Stateless vs Stateful\n- Next-Generation Firewalls\n- Firewall Rules and Policies\n- Configuration Best Practices", order: 2, duration: "45 min" },
      { title: "Intrusion Detection and Prevention", content: "IDS and IPS systems monitor network traffic for suspicious activity.\n\nTopics:\n- Signature-Based Detection\n- Anomaly-Based Detection\n- Snort and Suricata\n- SIEM Solutions\n- Log Analysis", order: 3, duration: "50 min" },
      { title: "VPN and Encryption", content: "Virtual Private Networks and encryption protect data in transit.\n\nTopics:\n- VPN Protocols (IPSec, OpenVPN, WireGuard)\n- SSL/TLS Handshake\n- Certificate Management\n- Perfect Forward Secrecy\n- Network Encryption Best Practices", order: 4, duration: "45 min" },
    ],
  },
  {
    title: "Cryptography Essentials",
    description: "Understand cryptographic principles, encryption algorithms, key management, and real-world applications of cryptography.",
    category: "Cryptography",
    difficulty: "intermediate",
    duration: "5 weeks",
    lessons: [
      { title: "Introduction to Cryptography", content: "Cryptography is the practice of securing communication from adversaries.\n\nTopics:\n- History of Cryptography\n- Symmetric vs Asymmetric Encryption\n- Hash Functions\n- Digital Signatures\n- Key Management", order: 1, duration: "35 min" },
      { title: "Symmetric Encryption", content: "Symmetric encryption uses the same key for encryption and decryption.\n\nTopics:\n- AES (Advanced Encryption Standard)\n- DES and 3DES\n- ChaCha20\n- Block Cipher Modes\n- Padding Schemes", order: 2, duration: "45 min" },
      { title: "Asymmetric Encryption", content: "Asymmetric encryption uses a pair of keys for secure communication.\n\nTopics:\n- RSA Algorithm\n- Elliptic Curve Cryptography (ECC)\n- Diffie-Hellman Key Exchange\n- Key Pair Generation\n- Digital Certificates", order: 3, duration: "50 min" },
      { title: "Hash Functions and HMAC", content: "Hash functions create fixed-size outputs from variable-size inputs.\n\nTopics:\n- MD5 and SHA Family\n- Birthday Attacks\n- HMAC (Hash-based Message Authentication Code)\n- Password Hashing (bcrypt, Argon2)\n- Rainbow Tables Defense", order: 4, duration: "40 min" },
    ],
  },
  {
    title: "Web Application Security",
    description: "Master web application security testing. Learn about OWASP Top 10, secure coding practices, and vulnerability assessment.",
    category: "Web Security",
    difficulty: "intermediate",
    duration: "6 weeks",
    lessons: [
      { title: "Web Application Architecture", content: "Understanding web application architecture is essential for security testing.\n\nTopics:\n- Client-Server Model\n- REST APIs\n- Authentication Mechanisms\n- Session Management\n- Common Web Frameworks", order: 1, duration: "35 min" },
      { title: "OWASP Top 10 Deep Dive", content: "The OWASP Top 10 is a standard awareness document for web application security.\n\nTopics:\n- Injection Attacks\n- Broken Authentication\n- Sensitive Data Exposure\n- XXE (XML External Entities)\n- Broken Access Control\n- Security Misconfiguration", order: 2, duration: "60 min" },
      { title: "Burp Suite and Testing Tools", content: "Master the tools used for web application security testing.\n\nTopics:\n- Burp Suite Setup and Configuration\n- Intercepting Proxy\n- Spider and Scanner\n- Repeater and Intruder\n- SQLMap and Other Tools", order: 3, duration: "50 min" },
      { title: "Secure Coding Practices", content: "Writing secure code is the best defense against web vulnerabilities.\n\nTopics:\n- Input Validation\n- Output Encoding\n- Parameterized Queries\n- CSRF Protection\n- Content Security Policy (CSP)", order: 4, duration: "45 min" },
    ],
  },
  {
    title: "Linux Security",
    description: "Learn Linux system security, hardening techniques, permission management, and security auditing on Linux systems.",
    category: "Operating Systems",
    difficulty: "beginner",
    duration: "4 weeks",
    lessons: [
      { title: "Linux Fundamentals for Security", content: "Linux is the preferred OS for security professionals.\n\nTopics:\n- Linux File System\n- Command Line Basics\n- File Permissions\n- Process Management\n- Package Management", order: 1, duration: "40 min" },
      { title: "User and Permission Management", content: "Proper user and permission management is critical for Linux security.\n\nTopics:\n- User and Group Management\n- File Permissions and Ownership\n- SUID, SGID, and Sticky Bit\n- PAM (Pluggable Authentication Modules)\n- sudo Configuration", order: 2, duration: "45 min" },
      { title: "Linux Hardening", content: "System hardening reduces the attack surface of a Linux system.\n\nTopics:\n- Service Management\n- Firewall Configuration (iptables, nftables)\n- SSH Hardening\n- Kernel Parameters\n- AppArmor and SELinux", order: 3, duration: "50 min" },
      { title: "Log Analysis and Monitoring", content: "Logs are essential for detecting and investigating security incidents.\n\nTopics:\n- System Logs (/var/log)\n- Log Rotation\n- Centralized Logging\n- Audit Framework\n- Real-time Monitoring", order: 4, duration: "35 min" },
    ],
  },
  {
    title: "Malware Analysis",
    description: "Learn to analyze, reverse-engineer, and understand malware behavior. Covers static and dynamic analysis techniques.",
    category: "Malware",
    difficulty: "advanced",
    duration: "7 weeks",
    lessons: [
      { title: "Introduction to Malware Analysis", content: "Malware analysis helps understand the behavior and impact of malicious software.\n\nTopics:\n- Types of Malware\n- Analysis Environment Setup\n- Virtual Machines and Sandboxing\n- Safety Precautions\n- Analysis Methodology", order: 1, duration: "35 min" },
      { title: "Static Analysis Techniques", content: "Static analysis examines malware without executing it.\n\nTopics:\n- File Properties and Headers\n- String Analysis\n- PE File Analysis\n- Import/Export Table Analysis\n- YARA Rules", order: 2, duration: "55 min" },
      { title: "Dynamic Analysis Techniques", content: "Dynamic analysis observes malware behavior during execution.\n\nTopics:\n- Sandboxing\n- Process Monitoring\n- Registry Monitoring\n- Network Traffic Analysis\n- API Hooking", order: 3, duration: "60 min" },
      { title: "Reverse Engineering Basics", content: "Reverse engineering decompiles malware to understand its inner workings.\n\nTopics:\n- Assembly Language Basics\n- IDA Pro and Ghidra\n- Debugging with x64dbg\n- Function Identification\n- Control Flow Analysis", order: 4, duration: "70 min" },
    ],
  },
  {
    title: "Incident Response",
    description: "Master the incident response lifecycle. Learn to detect, contain, eradicate, and recover from security incidents.",
    category: "Security Operations",
    difficulty: "intermediate",
    duration: "5 weeks",
    lessons: [
      { title: "Incident Response Fundamentals", content: "Incident response is a structured approach to handling security breaches.\n\nTopics:\n- What is an Incident?\n- Incident Response Team\n- IR Lifecycle (NIST SP 800-61)\n- Communication Plans\n- Legal Considerations", order: 1, duration: "35 min" },
      { title: "Detection and Analysis", content: "Early detection and proper analysis are crucial for effective incident response.\n\nTopics:\n- Alert Triage\n- Log Analysis\n- Network Forensics\n- Timeline Analysis\n- Indicators of Compromise (IOCs)", order: 2, duration: "50 min" },
      { title: "Containment and Eradication", content: "Stopping the spread and removing the threat.\n\nTopics:\n- Short-term Containment\n- Long-term Containment\n- Evidence Preservation\n- Root Cause Analysis\n- Eradication Strategies", order: 3, duration: "45 min" },
      { title: "Recovery and Lessons Learned", content: "Restoring systems and improving defenses.\n\nTopics:\n- System Restoration\n- Verification and Testing\n- Post-Incident Review\n- Documentation\n- Improving Defenses", order: 4, duration: "40 min" },
    ],
  },
  {
    title: "Cloud Security",
    description: "Understand cloud security principles, AWS/Azure security features, and best practices for securing cloud infrastructure.",
    category: "Cloud Security",
    difficulty: "intermediate",
    duration: "6 weeks",
    lessons: [
      { title: "Cloud Security Fundamentals", content: "Cloud computing introduces unique security challenges.\n\nTopics:\n- Cloud Service Models (IaaS, PaaS, SaaS)\n- Shared Responsibility Model\n- Cloud Security Architecture\n- Identity and Access Management\n- Data Protection in Cloud", order: 1, duration: "40 min" },
      { title: "AWS Security Features", content: "AWS provides numerous security services and features.\n\nTopics:\n- IAM and Access Management\n- Security Groups and NACLs\n- S3 Bucket Security\n- CloudTrail and CloudWatch\n- AWS Shield and WAF", order: 2, duration: "55 min" },
      { title: "Azure Security Features", content: "Microsoft Azure offers comprehensive security capabilities.\n\nTopics:\n- Azure AD and Conditional Access\n- Network Security Groups\n- Azure Security Center\n- Key Vault\n- Azure Sentinel", order: 3, duration: "50 min" },
      { title: "Cloud Penetration Testing", content: "Testing cloud environments requires specialized approaches.\n\nTopics:\n- Cloud Pen Testing Methodology\n- Common Cloud Vulnerabilities\n- Container Security\n- Serverless Security\n- Cloud Misconfiguration Detection", order: 4, duration: "55 min" },
    ],
  },
  {
    title: "Digital Forensics",
    description: "Learn digital forensics investigation techniques, evidence collection, chain of custody, and forensic reporting.",
    category: "Forensics",
    difficulty: "advanced",
    duration: "7 weeks",
    lessons: [
      { title: "Introduction to Digital Forensics", content: "Digital forensics is the practice of collecting and analyzing digital evidence.\n\nTopics:\n- Forensic Science Principles\n- Legal Framework\n- Evidence Types\n- Forensic Workstation Setup\n- Chain of Custody", order: 1, duration: "35 min" },
      { title: "Disk Forensics", content: "Disk forensics involves examining storage media for evidence.\n\nTopics:\n- Disk Imaging\n- File System Analysis\n- File Recovery\n- Timeline Analysis\n- Forensic Tools (Autopsy, FTK)", order: 2, duration: "60 min" },
      { title: "Memory Forensics", content: "RAM analysis reveals information not available on disk.\n\nTopics:\n- Memory Acquisition\n- Volatility Framework\n- Process Analysis\n- Network Connections\n- Malware in Memory", order: 3, duration: "55 min" },
      { title: "Network Forensics", content: "Network forensics captures and analyzes network traffic.\n\nTopics:\n- Packet Capture\n- Wireshark Analysis\n- Network Log Analysis\n- Malware Communication Detection\n- Incident Timeline Reconstruction", order: 4, duration: "50 min" },
    ],
  },
];

function generateQuestions(lessonTitle: string) {
  const questions = [
    {
      text: `What is the primary purpose of ${lessonTitle}?`,
      options: [
        "To learn basic concepts",
        "To understand advanced techniques",
        "To apply security principles",
        "All of the above",
      ],
      correctAnswer: 3,
    },
    {
      text: `Which tool is commonly used in ${lessonTitle}?`,
      options: [
        "Microsoft Word",
        "Nmap",
        "Excel",
        "PowerPoint",
      ],
      correctAnswer: 1,
    },
    {
      text: `What is the first step in ${lessonTitle}?`,
      options: [
        "Implementation",
        "Planning and reconnaissance",
        "Testing",
        "Deployment",
      ],
      correctAnswer: 1,
    },
    {
      text: `Which of the following is a best practice in ${lessonTitle}?`,
      options: [
        "Ignoring security updates",
        "Using default passwords",
        "Following least privilege principle",
        "Sharing credentials",
      ],
      correctAnswer: 2,
    },
    {
      text: `What is the CIA Triad in the context of ${lessonTitle}?`,
      options: [
        "Confidentiality, Integrity, Availability",
        "Control, Identity, Authentication",
        "Central, Internal, Accessible",
        "Compliance, Investigation, Analysis",
      ],
      correctAnswer: 0,
    },
  ];
  return questions;
}

async function main() {
  console.log("Seeding database...");

  await prisma.result.deleteMany();
  await prisma.progress.deleteMany();
  await prisma.question.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();

  const createdUsers = [];
  for (const user of users) {
    const hashedPassword = await hash(user.password, 12);
    const created = await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: hashedPassword,
        role: user.role,
      },
    });
    createdUsers.push(created);
  }
  console.log(`Created ${createdUsers.length} users`);

  let totalLessons = 0;
  let totalQuizzes = 0;
  let totalQuestions = 0;

  for (const courseData of coursesData) {
    const { lessons: lessonsData, ...courseInfo } = courseData;
    const course = await prisma.course.create({ data: courseInfo });

    for (const lessonData of lessonsData) {
      const lesson = await prisma.lesson.create({
        data: {
          ...lessonData,
          courseId: course.id,
        },
      });
      totalLessons++;

      const quiz = await prisma.quiz.create({
        data: {
          title: `Quiz: ${lesson.title}`,
          lessonId: lesson.id,
          passingScore: 70,
        },
      });
      totalQuizzes++;

      const questions = generateQuestions(lesson.title);
      for (const q of questions) {
        await prisma.question.create({
          data: {
            text: q.text,
            options: JSON.stringify(q.options),
            correctAnswer: q.correctAnswer,
            quizId: quiz.id,
          },
        });
        totalQuestions++;
      }
    }
  }

  console.log(`Created ${coursesData.length} courses`);
  console.log(`Created ${totalLessons} lessons`);
  console.log(`Created ${totalQuizzes} quizzes`);
  console.log(`Created ${totalQuestions} questions`);
  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
