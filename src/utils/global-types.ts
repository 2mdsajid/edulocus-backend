export type TStream = "PG" | "UG"

export type ShadcnToast = {
  state: "success" | "destructive";
  message: string;
};

export type TSyllabus = {
  [key: string]: { //this is the chapter name
    marks: number, //this is the marks of the chapter
    topics: string[] //this is the topics in the chapter
  }
}

export type TSyllabusCombined = {
  [key: string]: TSyllabus //this is the subject name
}


export type TAffiliation = string;
export type Category = {
  name: string;
  affiliations: TAffiliation[];
};
export type TStreamHierarchy = {
  name: TStream;
  categories: Category[];
  affiliations?: TAffiliation[];
};