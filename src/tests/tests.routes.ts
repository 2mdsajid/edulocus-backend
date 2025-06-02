import express, { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { checkModerator, checkStreamMiddleware, getSubscribedUserId, RequestExtended } from '../utils/middleware';
import { TcreateCustomTest, TcreateCustomTestByUser, TCreatePastPaper, TTypeOfTest } from './tests.schema';
import * as TestsServices from './tests.services';
import { createCustomTestByUserValidation, createCustomTestValidation, createPastTestValidation, createTestAnalyticValidation, saveUserScoreValidation } from './tests.validators';
import { addMultipleQuestionsForDifferentSubjectAndChapter, getQuestionsIds, getQuestionsIdsBySubject, updateIsPastQuestion } from '../questions/questions.services';
import prisma from '../utils/prisma';
import { getStreams, getSubjectsAndMarks } from '../utils/functions';
import { TStream } from '../utils/global-types';
import { SYLLABUS } from '../utils/syllabus';

const router = express.Router();

// Create a new custom test -- model test only as of now
router.post("/create-custom-tests",
    checkModerator,
    createCustomTestValidation,
    async (request: RequestExtended, response: Response) => {
        try {
            const errors = validationResult(request);
            if (!errors.isEmpty()) {
                return response.status(400).json({ message: errors.array()[0].msg });
            }

            const createdById = request.user?.id
            if (!request.user || !createdById) {
                return response.status(400).json({ message: 'Unauthorized' });
            }


            const limit = request.query.limit;
            if (!limit || isNaN(Number(limit)) || Number(limit) < 1) {
                return response.status(400).json({ data: null, message: 'Please specify a valid limit' });
            }


            const subjectsAndMarks = getSubjectsAndMarks(SYLLABUS, request.body.stream);
            console.log(subjectsAndMarks);

            // Calculate total marks across all subjects
            const totalMarks = subjectsAndMarks.reduce((sum, subject) => sum + subject.marks, 0);
            console.log(totalMarks)


            // Fetch questions for each subject based on their mark ratio
            const questionsPromises = subjectsAndMarks.map(async (subject) => {
                const subjectLimit = Math.floor((subject.marks / totalMarks) * Number(limit));
                if (subjectLimit > 0) {
                    return await getQuestionsIdsBySubject(subject.subject, subjectLimit, request.body.stream);
                }
                return [];
            });

            const questionsArrays = await Promise.all(questionsPromises);

            const questionsIds = questionsArrays.flat().filter((id): id is string => typeof id === "string");
            if (!questionsIds || questionsIds.length === 0) {
                return response.status(400).json({ data: null, message: 'No questions found' });
            }

            const data: TcreateCustomTest = {
                name: request.body.name,
                slug: request.body.slug,
                createdById: createdById,
                stream: request.body.stream,
                mode: "ALL",
                type: "MODEL",
                questions: questionsIds,
            }

            const newCustomTestId = await TestsServices.createCustomTest(data);
            if (!newCustomTestId || newCustomTestId === undefined) {
                return response.status(404).json({ data: null, message: "Custom test not found" })
            }

            return response.status(201).json({ data: newCustomTestId, message: `${request.body.name} test created` });
        } catch (error: any) {
            console.log(error)
            return response.status(500).json({ data: null, message: 'Internal Server Error' });
        }
    });


// Create a new past test
router.post("/create-past-tests",
    checkModerator,
    createPastTestValidation,
    async (request: RequestExtended, response: Response) => {
        try {

            const errors = validationResult(request);
            if (!errors.isEmpty()) {
                return response.status(400).json({ message: errors.array()[0].msg });
            }

            const createdById = request.user?.id
            if (!request.user || !createdById) {
                return response.status(400).json({ message: 'Unauthorized' });
            }

            const questions = request.body.questions

            const questionsIds = await addMultipleQuestionsForDifferentSubjectAndChapter(questions, createdById)
            if (!questionsIds || questions.length === 0) {
                return response.status(400).json({ message: 'Can not process the given questions' });
            }

            const year = request.body.year
            const affiliation = request.body.affiliation || ""
            const category = request.body.category || ""
            const stream = request.body.stream

            const pastTestName = affiliation ? `${affiliation}-${year}` : `${category}-${year}`
            const data: TcreateCustomTest = {
                name: pastTestName,
                slug: `${affiliation || category}_${year}`,
                createdById: createdById,
                mode: "ALL",
                type: "PAST_PAPER",
                questions: questionsIds,
                stream: stream
            }

            const newCustomTestId = await TestsServices.createCustomTest(data);
            if (!newCustomTestId || newCustomTestId === undefined) {
                return response.status(400).json({ data: null, message: "Custom can't be created" })
            }

            const pastTestData: TCreatePastPaper = {
                year: year,
                affiliation: affiliation,
                category: category,
                stream: stream,
                isUnlocked: false,
                customTestId: newCustomTestId
            }
            const updatedIsPastQuestions = await updateIsPastQuestion(pastTestData, questionsIds)
            if (!updatedIsPastQuestions) {
                return response.status(400).json({ data: null, message: "Unable to update the past questions" })
            }

            const newPastTest = await TestsServices.createPastTest(pastTestData)
            if (!newPastTest) {
                return response.status(400).json({ data: null, message: "Past Test can't be created" })
            }


            return response.status(201).json({ data: newPastTest, message: `${newPastTest.stream}-${newPastTest.category}-${newPastTest.year} test created` });
        } catch (error: any) {
            console.log("🚀 ~ router.post ~ error:", error)
            return response.status(500).json({ data: null, message: 'Internal Server Error' });
        }
    });

// to create tests by paid  users -- esp subjectwise, chapterwise tests creation
router.post("/create-custom-tests-by-users",
    checkStreamMiddleware,
    getSubscribedUserId,
    createCustomTestByUserValidation,
    async (request: RequestExtended, response: Response) => {
        try {
            const errors = validationResult(request);
            if (!errors.isEmpty()) {
                return response.status(400).json({ message: errors.array()[0].msg });
            }

            const subject = request.query.subject as string;
            const chapter = request.query.chapter as string;

            const createdById = request.user?.id
            const limit = !request.user?.isSubscribed ? 10 : 50
            const mode = request.mode || 'ALL'
            const type = request.body.type as TTypeOfTest


            const stream = request.stream as TStream
            const data = { ...request.body, createdById, limit, mode, stream } as TcreateCustomTestByUser


            if (type === 'SUBJECT_WISE') {

                if (!subject || subject === '') {
                    return response.status(400).json({ message: 'No Chapter or Subject Specified' });
                }
                const newCustomTestId = await TestsServices.createSubjectWiseCustomTestByUser(data, subject);
                if (!newCustomTestId) {
                    return response.status(400).json({ data: null, message: 'Unable To Create Test' });
                }
                return response.status(201).json({ data: newCustomTestId, message: ` test created` });

            } else if (type === 'CHAPTER_WISE') {

                if (!chapter || chapter === '' || !subject || subject === '') {
                    return response.status(400).json({ message: 'No Chapter or Subject Specified' });
                }

                const newCustomTestId = await TestsServices.createChapterWiseCustomTestByUser(data, subject, chapter);
                if (!newCustomTestId) {
                    return response.status(400).json({ data: null, message: 'Unable To Create Test' });
                }

                return response.status(201).json({ data: newCustomTestId, message: ` test created` });

            } else {
                return response.status(400).json({ data: null, message: ` No Specfied Type Creatable` });
            }

        } catch (error: any) {
            return response.status(500).json({ data: null, message: 'Internal Server Error' });
        }
    });


//  leaving this for now --  will add later for ug also
// create daily tests -- normal custom tests but will of type DAILY_TEST and will be fetched daily
router.get("/create-daily-test", async (request: RequestExtended, response: Response) => {
    try {

        const admin = await prisma.user.findFirst({
            where: {
                role: "SAJID"
            }
        })

        if (!admin) {
            return response.status(400).json({ data: null, message: 'Noooops No Test' });
        }

        const createdById = admin.id
        if (!createdById) {
            return response.status(400).json({ data: null, message: 'Unauthorized' });
        }

        const limit = 50;

        const questionsIds = await getQuestionsIds(Number(limit), 'PG')
        if (!questionsIds || questionsIds.length === 0) {
            return null
        }

        const date = new Date();
        const formattedDate = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
        const slug = `dt-${formattedDate}`;
        const name = `Daily Test - ${formattedDate}`


        // default PG as of now
        // Might edit laterr
        const stream = request.stream || 'PG'
        if (!stream || !getStreams().includes(stream)) {
            return response.status(400).json({ data: null, message: 'Stream Not Specified' });
        }

        const isDailyTestAlreadyExist = await TestsServices.isDailyTestSlugExist(slug)

        if (isDailyTestAlreadyExist) {
            return response.status(400).json({ data: null, message: 'Daily Test already exist' });
        }

        const data: TcreateCustomTest = {
            name: name,
            slug: slug,
            createdById: createdById,
            mode: "ALL",
            type: "DAILY_TEST",
            questions: questionsIds,
            stream: stream
        }

        const newCustomTestId = await TestsServices.createCustomTest(data);
        if (!newCustomTestId || newCustomTestId === null) {
            return response.status(404).json({ data: null, message: "Custom test not found" })
        }

        return response.status(201).json({ data: newCustomTestId, message: `${slug} test created` });
    } catch (error: any) {
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
});


router.get("/get-daily-test", checkStreamMiddleware, getSubscribedUserId, async (request: Request, response: Response) => {
    try {
        const date = new Date().toLocaleDateString('en-GB');
        const slug = `dt-${date}`
        const dailyTest = await TestsServices.getDailyTestBySlug(slug);
        if (!dailyTest) {
            return response.status(404).json({ data: null, message: "Daily test not found" })
        }
        return response.status(201).json({ data: dailyTest, message: `Daily Test ${dailyTest.name} found` });
    } catch (error: any) {
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
});


router.get("/get-types-of-tests", async (request: Request, response: Response) => {
    try {
        const typefOfTestsAndDescriptionData = TestsServices.getTypesOfTests();
        if (!typefOfTestsAndDescriptionData || typefOfTestsAndDescriptionData.length === 0) {
            return response.status(500).json({ data: null, message: 'No Tests Types Found!' });
        }
        return response.status(201).json({ data: typefOfTestsAndDescriptionData, message: `Types Of Tests Found` });
    } catch (error: any) {
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
});


router.get("/get-test-metadata/:id", createCustomTestValidation, async (request: Request, response: Response) => {
    try {
        const { id } = request.params
        const newCustomTest = await TestsServices.getCustomTestMetadata(id);
        if (!newCustomTest || newCustomTest === undefined) {
            return response.status(404).json({ data: null, message: "Custom test metadata not found" })
        }

        return response.status(201).json({ data: newCustomTest, message: `${newCustomTest.name} test found` });
    } catch (error: any) {
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
});

router.get("/get-single-test/:id", async (request: Request, response: Response) => {
    try {
        const { id } = request.params
        const newCustomTest = await TestsServices.getCustomTestById(id);
        if (!newCustomTest || newCustomTest === undefined) {
            return response.status(404).json({ data: null, message: "Custom test metadata not found" })
        }

        return response.status(201).json({ data: newCustomTest, message: `${newCustomTest.name} test found` });
    } catch (error: any) {
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
});

router.get("/get-test-basic-scores/:id", async (request: Request, response: Response) => {
    try {
        const { id } = request.params;
        const testScores = await TestsServices.getTestBasicScores(id);
        if (!testScores || testScores === undefined) {
            return response.status(404).json({ data: null, message: "Test scores not found" });
        }

        return response.status(200).json({ data: testScores, message: `Test scores retrieved successfully` });
    } catch (error: any) {
        console.error("Error getting test scores:", error);
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
});



router.get("/get-all-tests", async (request: Request, response: Response) => {
    try {
        const customTests = await TestsServices.getAllTests();
        if (!customTests || customTests.length === 0) {
            return response.status(400).json({ data: null, message: 'No Tests Found!' });
        }
        return response.status(201).json({ data: customTests, message: `Tests found` });
    } catch (error: any) {
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
});

router.get("/get-tests-by-type/:type", checkStreamMiddleware, getSubscribedUserId, async (request: RequestExtended, response: Response) => {
    try {
        const { type } = request.params as { type: TTypeOfTest };
        const stream = request.stream;
        if (!stream) {
            return response.status(400).json({ data: null, message: 'Stream Not Specified' });
        }

        const customTests = await TestsServices.getAllTestsByType(type, stream);
        if (!customTests || customTests.length === 0) {
            return response.status(400).json({ data: null, message: 'No Tests Found!' });
        }
        return response.status(201).json({ data: customTests, message: `Tests found` });
    } catch (error: any) {
        console.log("🚀 ~ router.get ~ error:", error)
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
});

router.post("/save-test-analytic", createTestAnalyticValidation, async (request: Request, response: Response) => {
    try {
        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ message: errors.array()[0].msg });
        }
        const newTestAnalytic = await TestsServices.createTestAnalytic(request.body);
        if (!newTestAnalytic) {
            return response.status(400).json({ data: null, message: 'Can not create Test Analytic' });
        }

        return response.status(201).json({ data: newTestAnalytic, message: `test analytic created` });
    } catch (error: any) {
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
});


router.post("/save-user-score", saveUserScoreValidation, async (request: Request, response: Response) => {
    try {
        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ message: errors.array()[0].msg });
        }

        const newUserScore = await TestsServices.saveUserScore(request.body);
        if (!newUserScore) {
            return response.status(400).json({ data: null, message: 'Can not create user score' });
        }

        return response.status(201).json({ data: newUserScore, message: `user score ccreated` });
    } catch (error: any) {
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
});



router.get("/get-dashboard-analytics/:id", async (request: Request, response: Response) => {
    try {
        const { id } = request.params
        const dashboardAnalytics = await TestsServices.getDashboardAnalytics(id);
        if (!dashboardAnalytics) {
            return response.status(500).json({ data: null, message: 'No Tests Found!' });
        }
        return response.status(201).json({ data: dashboardAnalytics, message: `Dashboard Analytics found` });
    } catch (error: any) {
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
});


router.post("/update-test-questions/:id", async (request: Request, response: Response) => {
    try {
        const { id } = request.params
        const { questionIds } = request.body

        const updatedTest = await TestsServices.updateTestQuestions(id, questionIds);
        if (!updatedTest) {
            return response.status(400).json({ data: null, message: 'Can not update test questions' });
        }

        return response.status(201).json({ data: updatedTest, message: `Test questions updated` });
    } catch (error: any) {
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
})



export default router