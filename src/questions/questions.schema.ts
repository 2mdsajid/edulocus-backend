import { Option, Question, QuestionCount } from "@prisma/client";

export type TBaseQuestion = Omit<Question,
    'category' |
    'attempt' |
    'correctattempt' |
    'userId'
>

export type TBaseOption = Omit<Option, 'questionId'>

export type TQuestion = TBaseQuestion & { options: TBaseOption }

export type TAddQuestion = Omit<TQuestion, 'id'>

export type TAddQuestionCount = Omit<QuestionCount, 'id'>
export type TTotalQuestionsPerSubject = Pick<QuestionCount, 'subject' | 'count'>
export type TTotalQuestionsPerSubjectAndChapter =
    {
        [subject: string]: {
            [chapter: string]: number
        }
    }