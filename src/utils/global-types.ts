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


export type TAffiliation = string;
export type Category = {
  name: string;
  affiliations: TAffiliation[];
};
export type TStreamHierarchy = {
  name: string;
  categories: Category[];
  affiliations?: TAffiliation[];
};