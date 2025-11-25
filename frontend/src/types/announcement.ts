export interface Comment {
  user: string;
  role: "student" | "warden" | "admin";
  message: string;
  createdAt: string;
}

export interface Announcement {
  _id: string;
  title: string;
  message: string;
  fileUrl?: string;
  postedBy: {
    name: string;
    email: string;
    role: string;
  };
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface AnnouncementFormData {
  title: string;
  message: string;
  file?: FileList;
}

export interface CommentFormData {
  message: string;
}
