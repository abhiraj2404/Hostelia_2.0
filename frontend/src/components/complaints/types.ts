export type ComplaintFormInput = {
  problemTitle: string;
  problemDescription: string;
  category?: string | null;
  hostelId?: string | null;
  roomNo?: string | null;
  problemImage?: FileList | null;
};

