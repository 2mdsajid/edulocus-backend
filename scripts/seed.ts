import { PrismaClient } from '@prisma/client';
import { loginUser, userSignUp } from '../src/users/users.services';
import { createCustomTest } from '../src/tests/tests.services';
import { addSingleQuestion } from '../src/questions/questions.services';
import { TQuestion } from '../src/questions/questions.schema';
import { TcreateCustomTest } from '../src/tests/tests.schema';
import { questionsCountData } from '../src/utils/countt';

const prisma = new PrismaClient();

const main = async () => {
    // Define user data
    const userData = {
        name: 'EduLocus',
        email: '2mdsajissad@gmail.com',
        password: '2mdsajid@gmail.com',
        role: "SAJID"
    };


    try {
        // Sign up a new user
        // const newUser = await userSignUp(userData as any);
        // console.log('User created:', newUser);

        // // const newUser2 = await userSignUp(userData2 as any);
        // // console.log('User created:', newUser2);

        // // Check if the user was successfully created
        // if (!newUser?.id) {
        //     throw new Error('User creation failed');
        // }

        // Seed questions
        const question1 = {
            question: 'What is the capital of France?',
            answer: 'a',
            explanation: 'Paris is the capital of France.',
            options: { a: 'Paris', b: 'Berlin', c: 'Madrid', d: 'Rome' },
            subject: 'zoology',
            chapter: 'chapter1',
            unit: 'Capital Cities',
            difficulty: 'easy',
        } as TQuestion

        const question2 = {
            question: 'What is the chemical symbol for water?',
            answer: 'b',
            explanation: 'Water is represented by H2O in chemistry.',
            options: { a: 'CO2', b: 'H2O', c: 'O2', d: 'He' },
            subject: 'zoology',
            chapter: 'chemistry',
            unit: 'Molecules',
            difficulty: 'medium',
        } as TQuestion

        const question3 = {
            question: 'Who wrote "Hamlet"?',
            answer: 'a',
            explanation: 'William Shakespeare is the author of "Hamlet".',
            options: { a: 'Charles Dickens', b: 'William Shakespeare', c: 'Mark Twain', d: 'Ernest Hemingway' },
            subject: 'zoology',
            chapter: 'human',
            unit: 'Classic Works',
            difficulty: 'hard',
        } as TQuestion

        const question4 = {
            question: 'Who wrote "Hamlet"?',
            answer: 'a',
            explanation: 'William Shakespeare is the author of "Hamlet".',
            options: { a: 'Charles Dickens', b: 'William Shakespeare', c: 'Mark Twain', d: 'Ernest Hemingway' },
            subject: 'zoology',
            chapter: 'cell',
            unit: 'Classic Works',
            difficulty: 'hard',
        } as TQuestion
        const question5 = {
            question: 'Who wrote "Hamlet"?',
            answer: 'a',
            explanation: 'William Shakespeare is the author of "Hamlet".',
            options: { a: 'Charles Dickens', b: 'William Shakespeare', c: 'Mark Twain', d: 'Ernest Hemingway' },
            subject: 'physics',
            chapter: 'plant',
            unit: 'Classic Works',
            difficulty: 'hard',
        } as TQuestion
        const question6 = {
            question: 'Who wrote "Hamlet"?',
            answer: 'a',
            explanation: 'William Shakespeare is the author of "Hamlet".',
            options: { a: 'Charles Dickens', b: 'William Shakespeare', c: 'Mark Twain', d: 'Ernest Hemingway' },
            subject: 'physics',
            chapter: 'plant',
            unit: 'Classic Works',
            difficulty: 'hard',
        } as TQuestion
        const question7 = {
            question: 'Who wrote "Hamlet"?',
            answer: 'a',
            explanation: 'William Shakespeare is the author of "Hamlet".',
            options: { a: 'Charles Dickens', b: 'William Shakespeare', c: 'Mark Twain', d: 'Ernest Hemingway' },
            subject: 'physics',
            chapter: 'plant',
            unit: 'Classic Works',
            difficulty: 'hard',
        } as TQuestion
        const question8 = {
            question: 'Who wrote "Hamlet"?',
            answer: 'a',
            explanation: 'William Shakespeare is the author of "Hamlet".',
            options: { a: 'Charles Dickens', b: 'William Shakespeare', c: 'Mark Twain', d: 'Ernest Hemingway' },
            subject: 'physics',
            chapter: 'plant',
            unit: 'Classic Works',
            difficulty: 'hard',
        } as TQuestion
        const question9 = {
            question: 'Who wrote "Hamlet"?',
            answer: 'a',
            explanation: 'William Shakespeare is the author of "Hamlet".',
            options: { a: 'Charles Dickens', b: 'William Shakespeare', c: 'Mark Twain', d: 'Ernest Hemingway' },
            subject: 'zoology',
            chapter: 'plant',
            unit: 'Classic Works',
            difficulty: 'hard',
        } as TQuestion


        // Add the questions
        const questionId1 = await addSingleQuestion(question1, '6d5b884f-474d-4623-9259-cdd3e2f4c18c') as string
        const questionId2 = await addSingleQuestion(question2, '6d5b884f-474d-4623-9259-cdd3e2f4c18c') as string
        const questionId3 = await addSingleQuestion(question3, '6d5b884f-474d-4623-9259-cdd3e2f4c18c') as string
        const questionId4 = await addSingleQuestion(question4, '6d5b884f-474d-4623-9259-cdd3e2f4c18c') as string
        const questionId5 = await addSingleQuestion(question5, '6d5b884f-474d-4623-9259-cdd3e2f4c18c') as string
        const questionId6 = await addSingleQuestion(question6, '6d5b884f-474d-4623-9259-cdd3e2f4c18c') as string
        const questionId7 = await addSingleQuestion(question7, '6d5b884f-474d-4623-9259-cdd3e2f4c18c') as string
        const questionId8 = await addSingleQuestion(question8, '6d5b884f-474d-4623-9259-cdd3e2f4c18c') as string
        const questionId9 = await addSingleQuestion(question9, '6d5b884f-474d-4623-9259-cdd3e2f4c18c') as string


        // // Create a test using the newly added questions
        // const customTestData = {
        //     name: 'Combined physics Pediatric',
        //     slug: 'GKT2024',
        //     mode:'ALL',
        //     createdById: '6d5b884f-474d-4623-9259-cdd3e2f4c18c', //newUser.id,
        //     questions: [questionId1, questionId2, questionId3,questionId4,questionId5,questionId6,questionId7,questionId8,questionId9]
        // } as TcreateCustomTest
        // const customTestData2 = {
        //     name: 'branching ',
        //     slug: 'GKT2024',
        //     mode:'ALL',
        //     createdById: '6d5b884f-474d-4623-9259-cdd3e2f4c18c',
        //     questions: [questionId1, questionId2, questionId3,questionId4,questionId5]
        // } as TcreateCustomTest

        // const newTest = await createCustomTest(customTestData);

        // const newTest2 = await createCustomTest(customTestData2);
        // let results = [] as any
        // for (const item of questionsCountData) {
        //     try {
        //         const result = await prisma.questionCount.create({
        //             data: {
        //                 id: item.id,
        //                 subject: item.subject,
        //                 chapter: item.chapter,
        //                 count: item.count
        //             }
        //         });
        //         results.push(result);
        //     } catch (error:any) {
        //         console.error(`Error importing ${item.subject} - ${item.chapter}:`, error.message);
        //     }
        // }

    } catch (error) {
        console.error('Error during seeding:', error);
    } finally {
        // Disconnect Prisma after the script is done
        await prisma.$disconnect();
    }
};

main();
