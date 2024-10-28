export type ShadcnToast = {
  state: "success" | "destructive";
  message: string;
};

export type TPGSyllabus = {
  [key: string]: {
    marks: number,
    topics: string[]
  }
}
