export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  descriptionLong: string;
  thumbnail?: string | null;
  banner?: string | null;
  category: string;
  difficulty: string;
  language: string;
  duration: string;
  instructorName: string;
  instructorBio: string;
  instructorAvatar?: string | null;
  tags: string;
  isFree: boolean;
  isPublished: boolean;
  isFeatured: boolean;
  sortOrder: number;
  commentsEnabled: boolean;
  reviewsEnabled: boolean;
  averageRating: number;
  studentCount: number;
  xpPoints: number;
  certificateEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  lessons?: Lesson[];
  sections?: Section[];
  _count?: {
    lessons: number;
    sections: number;
    reviews: number;
  };
}

export interface Section {
  id: string;
  title: string;
  description: string;
  order: number;
  courseId: string;
  createdAt: Date;
  updatedAt: Date;
  lessons?: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  contentType: string;
  videoUrl: string;
  fileUrl: string;
  fileType: string;
  externalUrl: string;
  codeContent: string;
  codeLanguage: string;
  order: number;
  duration: string;
  isPreview: boolean;
  courseId: string;
  sectionId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  course?: Course;
  section?: Section | null;
  quiz?: Quiz | null;
  progress?: Progress[];
}

export interface Quiz {
  id: string;
  title: string;
  passingScore: number;
  lessonId: string;
  createdAt: Date;
  updatedAt: Date;
  questions?: Question[];
}

export interface Question {
  id: string;
  text: string;
  options: string;
  correctAnswer: number;
  quizId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Progress {
  id: string;
  userId: string;
  lessonId: string;
  completed: boolean;
  lastAccessed: Date;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  lesson?: Lesson;
}

export interface Result {
  id: string;
  userId: string;
  quizId: string;
  score: number;
  answers: string;
  passed: boolean;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  quiz?: Quiz;
}

export interface Comment {
  id: string;
  userId: string;
  courseId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
}

export interface Review {
  id: string;
  userId: string;
  courseId: string;
  rating: number;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
}

export interface QuizAnswer {
  questionId: string;
  selectedOption: number;
}

export interface QuizResult {
  score: number;
  total: number;
  correct: number;
  passed: boolean;
  answers: QuizAnswer[];
}

export const CONTENT_TYPES = [
  { value: "text", label: "نص داخل الموقع", icon: "FileText" },
  { value: "youtube", label: "فيديو YouTube", icon: "Youtube" },
  { value: "youtube_playlist", label: "قائمة تشغيل YouTube", icon: "List" },
  { value: "gdrive_video", label: "فيديو Google Drive", icon: "HardDrive" },
  { value: "gdrive_folder", label: "مجلد Google Drive", icon: "FolderOpen" },
  { value: "vimeo", label: "Vimeo", icon: "Video" },
  { value: "external_link", label: "رابط خارجي", icon: "ExternalLink" },
  { value: "pdf", label: "ملف PDF", icon: "FileDown" },
  { value: "zip", label: "ملف ZIP", icon: "Archive" },
  { value: "image", label: "صورة", icon: "Image" },
  { value: "code", label: "كود برمجي", icon: "Code" },
] as const;

export type ContentType = (typeof CONTENT_TYPES)[number]["value"];
