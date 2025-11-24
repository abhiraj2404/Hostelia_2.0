export interface Notification {
  _id: string;
  id: string;
  userId: string;
  type:
    | "problem_created"
    | "problem_status_updated"
    | "announcement_created"
    | "mess_feedback_submitted"
    | "hostel_fee_submitted"
    | "mess_fee_submitted"
    | "fee_status_updated"
    | "mess_menu_updated";
  title: string;
  message: string;
  relatedEntityId: string;
  relatedEntityType: "problem" | "announcement" | "fee" | "transit" | "mess";
  read: boolean;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
}
