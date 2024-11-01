import express, { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { checkModerator, getSubscribedUserId, RequestWithUserIdAndRole, RequestWithUserIdAndSubscription } from '../utils/middleware';
import { TcreateCustomTest, TcreateCustomTestByUser, TTypeOfTest } from './tests.schema';
import * as TestsServices from './tests.services';
import { createCustomTestByUserValidation, createCustomTestValidation, createTestAnalyticValidation, saveUserScoreValidation } from './tests.validators';
import { ModeOfTest, TypeOfTest } from '@prisma/client';

const router = express.Router();
type TypedRequestBody<T> = Request<{}, {}, T>;

// Create a new custom test
router.post("/create-custom-tests", checkModerator, createCustomTestValidation, async (request: RequestWithUserIdAndRole, response: Response) => {
    try {
        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ message: errors.array()[0].msg });
        }

        const limit = request.query.limit;
        if (!limit || isNaN(Number(limit)) || Number(limit) < 1) {
            return response.status(400).json({ data: null, message: 'Please specify a valid limit' });
        }

        const createdById = request.user?.id
        const data = {
            name: request.body.name,
            slug: request.body.slug,
            createdById: createdById,
            mode: "ALL"
        } as TcreateCustomTest

        const newCustomTest = await TestsServices.createCustomTest(data, Number(limit));
        if (!newCustomTest || newCustomTest === undefined) {
            return response.status(404).json({ data: null, message: "Custom test not found" })
        }

        return response.status(201).json({ data: newCustomTest.id, message: `${newCustomTest.name} test created` });
    } catch (error: any) {
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
});


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