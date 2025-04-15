"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const middleware_1 = require("../utils/middleware");
const TestsServices = __importStar(require("./tests.services"));
const tests_validators_1 = require("./tests.validators");
const questions_services_1 = require("../questions/questions.services");
const prisma_1 = __importDefault(require("../utils/prisma"));
const functions_1 = require("../utils/functions");
const router = express_1.default.Router();
// Create a new custom test
router.post("/create-custom-tests", middleware_1.checkModerator, tests_validators_1.createCustomTestValidation, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const errors = (0, express_validator_1.validationResult)(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ message: errors.array()[0].msg });
        }
        const createdById = (_a = request.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!request.user || !createdById) {
            return response.status(400).json({ message: 'Unauthorized' });
        }
        const limit = request.query.limit;
        if (!limit || isNaN(Number(limit)) || Number(limit) < 1) {
            return response.status(400).json({ data: null, message: 'Please specify a valid limit' });
        }
        const questionsIds = yield (0, questions_services_1.getQuestionsIds)(Number(limit), request.body.stream);
        if (!questionsIds || questionsIds.length === 0) {
            return response.status(400).json({ data: null, message: 'No questions found' });
        }
        const data = {
            name: request.body.name,
            slug: request.body.slug,
            createdById: createdById,
            stream: request.body.stream,
            mode: "ALL",
            type: "MODEL",
            questions: questionsIds,
        };
        const newCustomTestId = yield TestsServices.createCustomTest(data);
        if (!newCustomTestId || newCustomTestId === undefined) {
            return response.status(404).json({ data: null, message: "Custom test not found" });
        }
        return response.status(201).json({ data: newCustomTestId, message: `${request.body.name} test created` });
    }
    catch (error) {
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
}));
// Create a new past test
router.post("/create-past-tests", middleware_1.checkModerator, tests_validators_1.createPastTestValidation, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const errors = (0, express_validator_1.validationResult)(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ message: errors.array()[0].msg });
        }
        const createdById = (_a = request.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!request.user || !createdById) {
            return response.status(400).json({ message: 'Unauthorized' });
        }
        const questions = request.body.questions;
        const questionsIds = yield (0, questions_services_1.addMultipleQuestionsForDifferentSubjectAndChapter)(questions, createdById);
        if (!questionsIds || questions.length === 0) {
            return response.status(400).json({ message: 'Can not process the given questions' });
        }
        const year = request.body.year;
        const affiliation = request.body.affiliation || "";
        const category = request.body.category || "";
        const stream = request.body.stream;
        const pastTestName = affiliation ? `${affiliation}-${year}` : `${category}-${year}`;
        const data = {
            name: pastTestName,
            slug: `${affiliation || category}_${year}`,
            createdById: createdById,
            mode: "ALL",
            type: "PAST_PAPER",
            questions: questionsIds,
            stream: stream
        };
        const newCustomTestId = yield TestsServices.createCustomTest(data);
        if (!newCustomTestId || newCustomTestId === undefined) {
            return response.status(400).json({ data: null, message: "Custom can't be created" });
        }
        const pastTestData = {
            year: year,
            affiliation: affiliation,
            category: category,
            stream: stream,
            customTestId: newCustomTestId
        };
        const updatedIsPastQuestions = yield (0, questions_services_1.updateIsPastQuestion)(pastTestData, questionsIds);
        if (!updatedIsPastQuestions) {
            return response.status(400).json({ data: null, message: "Unable to update the past questions" });
        }
        const newPastTest = yield TestsServices.createPastTest(pastTestData);
        if (!newPastTest) {
            return response.status(400).json({ data: null, message: "Past Test can't be created" });
        }
        return response.status(201).json({ data: newPastTest, message: `${newPastTest.stream}-${newPastTest.category}-${newPastTest.year} test created` });
    }
    catch (error) {
        console.log("🚀 ~ router.post ~ error:", error);
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
}));
// to create tests by paid  users -- esp subjectwise, chapterwise tests creation
router.post("/create-custom-tests-by-users", middleware_1.getSubscribedUserId, middleware_1.checkStreamMiddleware, tests_validators_1.createCustomTestByUserValidation, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const errors = (0, express_validator_1.validationResult)(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ message: errors.array()[0].msg });
        }
        const subject = request.query.subject;
        const chapter = request.query.chapter;
        const createdById = (_a = request.user) === null || _a === void 0 ? void 0 : _a.id;
        const limit = !((_b = request.user) === null || _b === void 0 ? void 0 : _b.isSubscribed) || false;
        const mode = request.mode || 'ALL';
        const type = request.body.type;
        const stream = request.stream;
        const data = Object.assign(Object.assign({}, request.body), { createdById, limit, mode, stream });
        if (type === 'SUBJECT_WISE') {
            if (!subject || subject === '') {
                return response.status(400).json({ message: 'No Chapter or Subject Specified' });
            }
            const newCustomTestId = yield TestsServices.createSubjectWiseCustomTestByUser(data, subject);
            if (!newCustomTestId) {
                return response.status(400).json({ data: null, message: 'Unable To Create Test' });
            }
            return response.status(201).json({ data: newCustomTestId, message: ` test created` });
        }
        else if (type === 'CHAPTER_WISE') {
            if (!chapter || chapter === '' || !subject || subject === '') {
                return response.status(400).json({ message: 'No Chapter or Subject Specified' });
            }
            const newCustomTestId = yield TestsServices.createChapterWiseCustomTestByUser(data, subject, chapter);
            if (!newCustomTestId) {
                return response.status(400).json({ data: null, message: 'Unable To Create Test' });
            }
            return response.status(201).json({ data: newCustomTestId, message: ` test created` });
        }
        else {
            return response.status(400).json({ data: null, message: ` No Specfied Type Creatable` });
        }
    }
    catch (error) {
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
}));
//  leaving this for now --  will add later for ug also
// create daily tests -- normal custom tests but will of type DAILY_TEST and will be fetched daily
router.get("/create-daily-test", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const admin = yield prisma_1.default.user.findFirst({
            where: {
                role: "SAJID"
            }
        });
        if (!admin) {
            return response.status(400).json({ data: null, message: 'Noooops No Test' });
        }
        const createdById = admin.id;
        if (!createdById) {
            return response.status(400).json({ data: null, message: 'Unauthorized' });
        }
        const limit = 50;
        const questionsIds = yield (0, questions_services_1.getQuestionsIds)(Number(limit), 'PG');
        if (!questionsIds || questionsIds.length === 0) {
            return null;
        }
        const date = new Date();
        const formattedDate = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
        const slug = `dt-${formattedDate}`;
        const name = `Daily Test - ${formattedDate}`;
        // default PG as of now
        // Might edit laterr
        const stream = request.stream || 'PG';
        if (!stream || !(0, functions_1.getStreams)().includes(stream)) {
            return response.status(400).json({ data: null, message: 'Stream Not Specified' });
        }
        const isDailyTestAlreadyExist = yield TestsServices.isDailyTestSlugExist(slug);
        console.log(isDailyTestAlreadyExist);
        if (isDailyTestAlreadyExist) {
            return response.status(400).json({ data: null, message: 'Daily Test already exist' });
        }
        const data = {
            name: name,
            slug: slug,
            createdById: createdById,
            mode: "ALL",
            type: "DAILY_TEST",
            questions: questionsIds,
            stream: stream
        };
        const newCustomTestId = yield TestsServices.createCustomTest(data);
        if (!newCustomTestId || newCustomTestId === null) {
            return response.status(404).json({ data: null, message: "Custom test not found" });
        }
        return response.status(201).json({ data: newCustomTestId, message: `${slug} test created` });
    }
    catch (error) {
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
}));
router.get("/get-daily-test", middleware_1.checkStreamMiddleware, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const date = new Date().toLocaleDateString('en-GB');
        const slug = `dt-${date}`;
        const dailyTest = yield TestsServices.getDailyTestBySlug(slug);
        if (!dailyTest) {
            return response.status(404).json({ data: null, message: "Daily test not found" });
        }
        return response.status(201).json({ data: dailyTest, message: `Daily Test ${dailyTest.name} found` });
    }
    catch (error) {
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
}));
router.get("/get-types-of-tests", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const typefOfTestsAndDescriptionData = TestsServices.getTypesOfTests();
        if (!typefOfTestsAndDescriptionData || typefOfTestsAndDescriptionData.length === 0) {
            return response.status(500).json({ data: null, message: 'No Tests Types Found!' });
        }
        return response.status(201).json({ data: typefOfTestsAndDescriptionData, message: `Types Of Tests Found` });
    }
    catch (error) {
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
}));
router.get("/get-test-metadata/:id", tests_validators_1.createCustomTestValidation, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = request.params;
        const newCustomTest = yield TestsServices.getCustomTestMetadata(id);
        if (!newCustomTest || newCustomTest === undefined) {
            return response.status(404).json({ data: null, message: "Custom test metadata not found" });
        }
        return response.status(201).json({ data: newCustomTest, message: `${newCustomTest.name} test found` });
    }
    catch (error) {
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
}));
router.get("/get-single-test/:id", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = request.params;
        const newCustomTest = yield TestsServices.getCustomTestById(id);
        if (!newCustomTest || newCustomTest === undefined) {
            return response.status(404).json({ data: null, message: "Custom test metadata not found" });
        }
        return response.status(201).json({ data: newCustomTest, message: `${newCustomTest.name} test found` });
    }
    catch (error) {
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
}));
router.get("/get-all-tests", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const customTests = yield TestsServices.getAllTests();
        if (!customTests || customTests.length === 0) {
            return response.status(400).json({ data: null, message: 'No Tests Found!' });
        }
        return response.status(201).json({ data: customTests, message: `Tests found` });
    }
    catch (error) {
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
}));
router.get("/get-tests-by-type/:type", middleware_1.checkStreamMiddleware, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { type } = request.params;
        const stream = request.stream;
        if (!stream) {
            return response.status(400).json({ data: null, message: 'Stream Not Specified' });
        }
        const customTests = yield TestsServices.getAllTestsByType(type, stream);
        if (!customTests || customTests.length === 0) {
            return response.status(400).json({ data: null, message: 'No Tests Found!' });
        }
        return response.status(201).json({ data: customTests, message: `Tests found` });
    }
    catch (error) {
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
}));
router.post("/save-test-analytic", tests_validators_1.createTestAnalyticValidation, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const errors = (0, express_validator_1.validationResult)(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ message: errors.array()[0].msg });
        }
        const newTestAnalytic = yield TestsServices.createTestAnalytic(request.body);
        if (!newTestAnalytic) {
            return response.status(400).json({ data: null, message: 'Can not create Test Analytic' });
        }
        return response.status(201).json({ data: newTestAnalytic, message: `test analytic created` });
    }
    catch (error) {
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
}));
router.post("/save-user-score", tests_validators_1.saveUserScoreValidation, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const errors = (0, express_validator_1.validationResult)(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ message: errors.array()[0].msg });
        }
        const newUserScore = yield TestsServices.saveUserScore(request.body);
        if (!newUserScore) {
            return response.status(400).json({ data: null, message: 'Can not create user score' });
        }
        return response.status(201).json({ data: newUserScore, message: `user score ccreated` });
    }
    catch (error) {
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
}));
router.get("/get-dashboard-analytics/:id", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = request.params;
        const dashboardAnalytics = yield TestsServices.getDashboardAnalytics(id);
        if (!dashboardAnalytics) {
            return response.status(500).json({ data: null, message: 'No Tests Found!' });
        }
        return response.status(201).json({ data: dashboardAnalytics, message: `Dashboard Analytics found` });
    }
    catch (error) {
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
}));
exports.default = router;
