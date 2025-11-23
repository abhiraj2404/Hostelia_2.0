export type ComplaintFormInput = {
  problemTitle: string;
  problemDescription: string;
  category?: string | null;
  hostel?: string | null;
  roomNo?: string | null;
  problemImage?: FileList | null;
};

