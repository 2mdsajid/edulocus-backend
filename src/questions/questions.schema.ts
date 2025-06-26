import { IsPastQuestion, Images, Option, Question, QuestionCount } from "@prisma/client";

export type TBaseQuestion = Omit<Question,
    'category' |
    'attempt' |
    'correctattempt' |
    'userId' 
>

export type TBaseImages = Omit<Images, 'questionId'>

export type TCreatePastQuestion = Omit<IsPastQuestion,'questionId'>

export type TBaseOption = Omit<Option, 'questionId'>

export type TQuestionVideo = {
    id:string
    url:string
    questionId:string
}

export type TQuestion = TBaseQuestion & { images: TBaseImages | null, options: TBaseOption, videoUrl?:string  }

export type TReportQuestion = TQuestion & {message : string | null}

export type TAddQuestion = Omit<TQuestion, 'id'> & {videoUrl?:string}

export type TAddQuestionCount = Omit<QuestionCount, 'id'>




export type TTotalQuestionsPerSubject = Pick<QuestionCount, 'subject' | 'count'>




export type TTotalQuestionsPerSubjectAndChapter =
    {
        [subject: string]: {
            [chapter: string]: number
        }
    }