import express, { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { checkModerator, getSubscribedUserId, RequestWithUserIdAndRole, RequestWithUserIdAndSubscription } from '../utils/middleware';
import { TcreateCustomTest, TcreateCustomTestByUser, TCreatePastPaper, TTypeOfTest } from './tests.schema';
import * as TestsServices from './tests.services';
import { createCustomTestByUserValidation, createCustomTestValidation, createPastTestValidation, createTestAnalyticValidation, saveUserScoreValidation } from './tests.validators';
import { ModeOfTest, TypeOfTest } from '@prisma/client';
import { addMultipleQuestionsForDifferentSubjectAndChapter, getQuestionsIds, updateIsPastQuestion } from '../questions/questions.services';
import prisma from '../utils/prisma';

const router = express.Router();
type TypedRequestBody<T> = Request<{}, {}, T>;

// Create a new custom test
router.post("/create-custom-tests", checkModerator, createCustomTestValidation, async (request: RequestWithUserIdAndRole, response: Response) => {
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

        const questionsIds = await getQuestionsIds(Number(limit))
        if (!questionsIds || questionsIds.length === 0) {
            return null
        }

        const data: TcreateCustomTest = {
            name: request.body.name,
            slug: request.body.slug,
            createdById: createdById,
            mode: "ALL",
            type: "MODEL",
            questions: questionsIds
        }

        const newCustomTestId = await TestsServices.createCustomTest(data);
        if (!newCustomTestId || newCustomTestId === undefined) {
            return response.status(404).json({ data: null, message: "Custom test not found" })
        }

        return response.status(201).json({ data: newCustomTestId, message: `${request.body.name} test created` });
    } catch (error: any) {
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
});


// Create a new past test
router.post("/create-past-tests", checkModerator, createPastTestValidation, async (request: RequestWithUserIdAndRole, response: Response) => {
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
        const stream = request.body.stream
        const category = request.body.category || ""

        const pastTestName = affiliation ? `${affiliation}-${year}` : `${category}-${year}`
        const data: TcreateCustomTest = {
            name: pastTestName,
            slug: `${affiliation || category}_${year}`,
            createdById: createdById,
            mode: "ALL",
            type: "PAST_PAPER",
            questions: questionsIds
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
router.post(
    "/create-custom-tests-by-users",
    getSubscribedUserId,
    createCustomTestByUserValidation,
    async (request: RequestWithUserIdAndSubscription, response: Response) => {
        try {
            const errors = validationResult(request);
            if (!errors.isEmpty()) {
                return response.status(400).json({ message: errors.array()[0].msg });
            }

            const subject = request.query.subject as string;
            const chapter = request.query.chapter as string;

            const createdById = request.userId
            const limit = !request.isSubscribed || false
            const mode = request.mode || 'ALL'
            const type = request.body.type as TTypeOfTest

            const data = { ...request.body, createdById, limit, mode } as TcreateCustomTestByUser


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

// create daily tests -- normal custom tests but will of type DAILY_TEST and will be fetched daily
router.get("/create-daily-test", async (request: RequestWithUserIdAndRole, response: Response) => {
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

        const questionsIds = await getQuestionsIds(Number(limit))
        if (!questionsIds || questionsIds.length === 0) {
            return null
        }

        const date = new Date();
        const formattedDate = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
        const slug = `dt-${formattedDate}`;
        const name = `Daily Test - ${formattedDate}`
        console.log(slug);

        const isDailyTestAlreadyExist = await TestsServices.isDailyTestSlugExist(slug)
        console.log(isDailyTestAlreadyExist);
        if (isDailyTestAlreadyExist) {
            return response.status(400).json({ data: null, message: 'Daily Test already exist' });
        }

        const data: TcreateCustomTest = {
            name: name,
            slug: slug,
            createdById: createdById,
            mode: "ALL",
            type: "DAILY_TEST",
            questions: questionsIds
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


router.get("/get-daily-test", async (request: Request, response: Response) => {
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

router.get("/get-single-test/:id", createCustomTestValidation, async (request: Request, response: Response) => {
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

router.get("/get-tests-by-type/:type", async (request: Request<{ type: TTypeOfTest }>, response: Response) => {
    try {
        const { type } = request.params
        const customTests = await TestsServices.getAllTestsByType(type);
        if (!customTests || customTests.length === 0) {
            return response.status(400).json({ data: null, message: 'No Tests Found!' });
        }
        return response.status(201).json({ data: customTests, message: `Tests found` });
    } catch (error: any) {
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



export default router