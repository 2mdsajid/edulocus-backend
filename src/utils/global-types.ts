export type TStream = "PG" | "UG"

export type ShadcnToast = {
  state: "success" | "destructive";
  message: string;
};

export type TSyllabus = {
  [key: string]: { //this is the subject name
    marks: number, //this is the marks of the subject
    topics: string[] //this is the topics in the subject
  }
}

export type TSyllabusCombined = {
  [key: string]: TSyllabus //this is the stream name
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