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
const GroupServices = __importStar(require("../groups/groups.services"));
const tests_validators_1 = require("./tests.validators");
const questions_services_1 = require("../questions/questions.services");
const prisma_1 = __importDefault(require("../utils/prisma"));
const functions_1 = require("../utils/functions");
const syllabus_1 = require("../utils/syllabus");
const luxon_1 = require("luxon"); // Import DateTime from luxon
const chap_syllabus_1 = require("../utils/chap_syllabus");
const router = express_1.default.Router();
// Create a new custom test -- model test only as of now
// due to server issues, can't create 200 marks as of now
// so wont use now
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
        const subjectsAndMarks = (0, functions_1.getSubjectsAndMarks)(syllabus_1.SYLLABUS, request.body.stream);
        // console.log(subjectsAndMarks);
        // Calculate total marks across all subjects
        const totalMarks = subjectsAndMarks.reduce((sum, subject) => sum + subject.marks, 0);
        // Fetch questions for each subject based on their mark ratio
        const questionsPromises = subjectsAndMarks.map((subject) => __awaiter(void 0, void 0, void 0, function* () {
            const subjectLimit = Math.floor((subject.marks / totalMarks) * Number(limit));
            if (subjectLimit > 0) {
                return yield (0, questions_services_1.getQuestionsIdsBySubject)(subject.subject, subjectLimit, request.body.stream);
            }
            return [];
        }));
        const questionsArrays = yield Promise.all(questionsPromises);
        const questionsIds = questionsArrays.flat().filter((id) => typeof id === "string");
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
            description: null,
            imageUrl: null,
            specialUrl: null,
            specialImage: null,
            isLocked: false,
        };
        const newCustomTestId = yield TestsServices.createCustomTest(data);
        if (!newCustomTestId || newCustomTestId === undefined) {
            return response.status(404).json({ data: null, message: "Custom test not found" });
        }
        return response.status(201).json({ data: newCustomTestId, message: `${request.body.name} test created` });
    }
    catch (error) {
        console.log(error);
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
}));
router.post("/create-custom-test-metadata", middleware_1.checkModerator, tests_validators_1.createCustomTestValidation, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
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
        const gid = request.query.gid;
        // const limit = request.query.limit;
        // if (!limit || isNaN(Number(limit)) || Number(limit) < 1) {
        //     return response.status(400).json({ data: null, message: 'Please specify a valid limit' });
        // }
        // const subjectsAndMarks = getSubjectsAndMarks(SYLLABUS, request.body.stream);
        // console.log(subjectsAndMarks);
        // Calculate total marks across all subjects
        // const totalMarks = subjectsAndMarks.reduce((sum, subject) => sum + subject.marks, 0);
        // console.log(totalMarks)
        // Fetch questions for each subject based on their mark ratio
        // const questionsPromises = subjectsAndMarks.map(async (subject) => {
        //     const subjectLimit = Math.floor((subject.marks / totalMarks) * Number(limit));
        //     if (subjectLimit > 0) {
        //         return await getQuestionsIdsBySubject(subject.subject, subjectLimit, request.body.stream);
        //     }
        //     return [];
        // });
        const questionsArrays = []; //await Promise.all(questionsPromises);
        // const questionsIds = questionsArrays.flat().filter((id): id is string => typeof id === "string");
        // if (!questionsIds || questionsIds.length === 0) {
        //     return response.status(400).json({ data: null, message: 'No questions found' });
        // }
        // mode is USER -- it wont be shown in model tests
        const mode = gid ? 'USER' : 'ALL';
        const data = {
            name: request.body.name,
            slug: request.body.slug,
            createdById: createdById,
            stream: request.body.stream,
            description: request.body.description || null,
            imageUrl: request.body.imageUrl || null,
            specialUrl: request.body.specialUrl || null,
            specialImage: request.body.specialImage || null,
            isLocked: request.body.isLocked || false,
            mode: mode,
            type: "MODEL",
            questions: questionsArrays,
        };
        // console.log(data)
        const newCustomTestId = yield TestsServices.createCustomTest(data);
        if (!newCustomTestId || newCustomTestId === undefined) {
            return response.status(404).json({ data: null, message: "Custom test not found" });
        }
        // to add tests to the group -- crreated by the group
        if (gid && gid !== 'null' && gid !== null && gid !== null && gid !== undefined) {
            const isGroupExist = yield GroupServices.isGroupIdExist(gid);
            if (!isGroupExist) {
                return response.status(404).json({ data: null, message: "Group not found" });
            }
            const newTestInGroup = yield TestsServices.addTestToGroup(gid, newCustomTestId);
        }
        return response.status(201).json({ data: newCustomTestId, message: `${request.body.name} test created` });
    }
    catch (error) {
        console.log(error);
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
}));
// Route to create test codes for locked tests
router.post("/generate-test-codes", middleware_1.checkModerator, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const testId = request.body.testId;
        const limit = request.body.limit || 1;
        if (!testId) {
            return response.status(400).json({ message: 'Test ID is required' });
        }
        const testCodes = yield TestsServices.createTestCodes(testId, limit);
        if (!testCodes) {
            return response.status(404).json({ message: 'Failed to create test codes' });
        }
        return response.status(201).json({ data: testCodes, message: 'Test codes created successfully' });
    }
    catch (error) {
        console.error(error);
        return response.status(500).json({ message: 'Internal Server Error' });
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
            stream: stream,
            description: null,
            imageUrl: null,
            specialUrl: null,
            specialImage: null,
            isLocked: false,
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
            isUnlocked: false,
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
router.post("/create-custom-tests-by-users", middleware_1.checkStreamMiddleware, middleware_1.getSubscribedUserId, tests_validators_1.createCustomTestByUserValidation, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const errors = (0, express_validator_1.validationResult)(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ message: errors.array()[0].msg });
        }
        const subject = request.query.subject;
        const chapter = request.query.chapter;
        const createdById = (_a = request.user) === null || _a === void 0 ? void 0 : _a.id;
        const limit = ((_b = request.user) === null || _b === void 0 ? void 0 : _b.isSubscribed) ? 35 : 10;
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
        const date = new Date();
        const currentDayOfMonth = date.getDate(); // Get the current day of the month (1-31)
        // Check if the current day is an "alternate day" (odd number)
        return response.status(200).json({ data: null, message: 'Daily test can only be created on alternate days.' });
        if (currentDayOfMonth % 2 === 0) {
        }
        const admin = yield prisma_1.default.user.findFirst({
            where: {
                role: "SAJID"
            }
        });
        if (!admin) {
            return response.status(400).json({ data: null, message: 'No admin user with role SAJID found.' });
        }
        // default PG as of now
        // Might edit later
        const stream = request.stream || 'UG';
        if (!stream || !(0, functions_1.getStreams)().includes(stream)) {
            return response.status(400).json({ data: null, message: 'Stream Not Specified or Invalid.' });
        }
        const createdById = admin === null || admin === void 0 ? void 0 : admin.id;
        if (!createdById) {
            // This case should ideally not be hit if admin is found, but good to keep as a safeguard
            return response.status(400).json({ data: null, message: 'Unauthorized: Admin ID not found.' });
        }
        const limit = 30;
        const questionsIds = yield (0, questions_services_1.getQuestionsIds)(Number(limit), 'UG');
        if (!questionsIds || (questionsIds === null || questionsIds === void 0 ? void 0 : questionsIds.length) === 0) {
            return response.status(404).json({ data: null, message: 'No questions found for the daily test.' });
        }
        const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        const slug = `dt-${formattedDate}`;
        const name = `Daily Test - ${formattedDate}`;
        const isDailyTestAlreadyExist = yield TestsServices.isDailyTestSlugExist(slug, stream);
        if (isDailyTestAlreadyExist) {
            return response.status(400).json({ data: null, message: `Daily Test ${slug} already exists.` });
        }
        const data = {
            name: name,
            slug: slug,
            createdById: createdById || '',
            mode: "ALL",
            type: "DAILY_TEST",
            questions: questionsIds || [],
            stream: stream,
            description: null,
            imageUrl: null,
            specialUrl: null,
            specialImage: null,
            isLocked: false,
        };
        const newCustomTestId = yield TestsServices.createCustomTest(data);
        if (!newCustomTestId || newCustomTestId === null) {
            return response.status(500).json({ data: null, message: "Failed to create custom test." });
        }
        return response.status(201).json({ data: newCustomTestId, message: `${slug} test created successfully.` });
    }
    catch (error) {
        console.error("Error creating daily test:", error); // Log the actual error for debugging
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
}));
// create chapterwise tests for chapterwise series -- 
router.get("/create-chapter-wise-test", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const date = new Date();
        // Format today's date to match the syllabus data format (e.g., "july_6")
        const formattedDayForSyllabus = (0, functions_1.formatDateForSyllabus)(date);
        // Find today's schedule from the imported ChapterWiseSyllabus
        const todaysSyllabus = chap_syllabus_1.ChapterWiseSyllabus.find((chapterDay) => chapterDay.day === formattedDayForSyllabus);
        if (!todaysSyllabus) {
            console.log(`No schedule found for today: ${formattedDayForSyllabus}`);
            return response.status(404).json({ data: null, message: `No schedule found for today (${formattedDayForSyllabus}) to create tests.` });
        }
        const admin = yield prisma_1.default.user.findFirst({
            where: {
                role: "SAJID"
            }
        });
        if (!admin) {
            return response.status(400).json({ data: null, message: 'No admin user with role SAJID found.' });
        }
        const stream = 'UG'; // Assuming 'UG' as default stream
        const createdById = admin.id;
        const limitPerChapter = 30; // Limit for questions per chapter
        const totalQuestionsLimit = 30; // Overall limit for each test
        // Format the date for the slug (YYYY-MM-DD)
        const formattedDateForSlug = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        const timeSlots = ["8am", "2pm", "6pm"];
        const createdTestResults = [];
        // Iterate through each time slot to create separate tests
        for (const timeSlot of timeSlots) {
            const slug = `cws-${formattedDateForSlug}-${timeSlot}`;
            // Check if a test with this slug already exists
            const testExists = yield TestsServices.findCustomTestBySlug(slug, stream);
            if (testExists) {
                console.log(`Test with slug '${slug}' already exists. Skipping creation for ${timeSlot}.`);
                createdTestResults.push({
                    timeSlot: timeSlot,
                    success: false,
                    message: `Test with slug '${slug}' already exists. Skipping creation.`
                });
                continue; // Skip to the next time slot
            }
            const subjectsAtTime = todaysSyllabus[timeSlot];
            let currentSlotQuestionsIds = [];
            const currentSlotChapterNames = new Set();
            if (subjectsAtTime && typeof subjectsAtTime !== 'string') { // Ensure it's an object with subjects
                for (const subject in subjectsAtTime) {
                    if (Object.prototype.hasOwnProperty.call(subjectsAtTime, subject)) {
                        const chapters = subjectsAtTime[subject];
                        for (const chapter of chapters) {
                            // Fetch questions for each subject and chapter within this time slot
                            const chapterQuestions = yield (0, questions_services_1.getQuestionsIdsBySubjectAndChapter)(subject, chapter, limitPerChapter, stream);
                            currentSlotQuestionsIds = currentSlotQuestionsIds.concat(chapterQuestions !== null && chapterQuestions !== void 0 ? chapterQuestions : []);
                            currentSlotChapterNames.add(chapter); // Add chapter name for test name
                        }
                    }
                }
            }
            // Apply the total questions limit for this specific test
            if (currentSlotQuestionsIds.length > totalQuestionsLimit) {
                currentSlotQuestionsIds = currentSlotQuestionsIds.slice(0, totalQuestionsLimit);
            }
            if (currentSlotQuestionsIds.length === 0) {
                console.log(`No questions found for the ${timeSlot} test on ${formattedDayForSyllabus}. Skipping test creation.`);
                createdTestResults.push({
                    timeSlot: timeSlot,
                    success: false,
                    message: `No questions found for ${timeSlot}.`
                });
                continue; // Skip to the next time slot
            }
            // Construct name for the current time slot's test
            const testNameSuffix = Array.from(currentSlotChapterNames).map(functions_1.capitalizeWords).join(', ');
            const name = `Chapter Wise Series (${timeSlot.toUpperCase()}) - ${testNameSuffix}`;
            const data = {
                name: name,
                slug: slug, // Use the pre-checked slug
                createdById: createdById,
                mode: "ALL",
                type: "CHAPTER_WISE",
                questions: currentSlotQuestionsIds,
                stream: stream,
                description: null,
                imageUrl: null,
                specialUrl: null,
                specialImage: null,
                isLocked: false,
            };
            const newCustomTestId = yield TestsServices.createCustomTest(data);
            if (newCustomTestId) {
                createdTestResults.push({
                    timeSlot: timeSlot,
                    success: true,
                    message: `${slug} test created successfully.`,
                    testId: newCustomTestId
                });
            }
            else {
                // This else block will now primarily catch cases where createCustomTest returns null
                // due to the mock `mockExistingSlugs` check, or other potential internal failures.
                createdTestResults.push({
                    timeSlot: timeSlot,
                    success: false,
                    message: `Failed to create test for ${timeSlot}.`
                });
            }
        }
        // Determine overall response based on individual test creation results
        const allTestsSuccessful = createdTestResults.every(result => result.success);
        const someTestsCreated = createdTestResults.some(result => result.success);
        if (allTestsSuccessful) {
            return response.status(201).json({
                data: createdTestResults,
                message: 'All daily chapter-wise tests created successfully.'
            });
        }
        else if (someTestsCreated) {
            return response.status(207).json({
                data: createdTestResults,
                message: 'Some daily chapter-wise tests were created, others failed or had no questions/were skipped.'
            });
        }
        else {
            return response.status(500).json({
                data: createdTestResults,
                message: 'No daily chapter-wise tests could be created or all were skipped.'
            });
        }
    }
    catch (error) {
        console.error("Error creating daily tests:", error); // Log the actual error for debugging
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
}));
// This will fetch the current active test based on the server's Nepal time and date
router.get("/get-current-chapterwise-test/:datetime", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get current time in Nepal Standard Time (NST)
        const nowInNepal = luxon_1.DateTime.now().setZone('Asia/Kathmandu');
        // Check if setting the time zone was successful
        if (!nowInNepal.isValid) {
            console.error("Error setting time zone to Asia/Kathmandu:", nowInNepal.invalidExplanation);
            return response.status(500).json({ data: null, message: 'Could not determine Nepal time.' });
        }
        const year = nowInNepal.year;
        const month = String(nowInNepal.month).padStart(2, '0');
        const day = String(nowInNepal.day).padStart(2, '0');
        let timeSlot = '';
        const hour = nowInNepal.hour; // This will be the hour in Nepal time
        if (hour >= 6 && hour < 14) {
            timeSlot = '8am';
        }
        else if (hour >= 14 && hour < 18) {
            timeSlot = '2pm';
        }
        else if (hour >= 18) {
            timeSlot = '6pm';
        }
        else {
            // If the time is before 6 AM, you might want to consider what schedule applies.
            // Current logic defaults to '12am' (which seems to be a placeholder for 8am),
            // but consider if tests truly start at 12 AM or if this is for the next day's first slot.
            // For now, retaining original logic's '12am' slot (implying the 8am range for the current day)
            // Or you might want to return a "no test found" for early morning.
            timeSlot = '12am'; // Or handle as "no active test yet for today"
        }
        const slug = `cws-${year}-${month}-${day}-${timeSlot}`;
        console.log('slug generated on server (Nepal time):', slug);
        const customTest = yield TestsServices.getCustomTestBySlugAndStream(slug, 'UG');
        if (!customTest) {
            return response.status(404).json({ data: null, message: 'No test found for the given date and time on the server.' });
        }
        return response.status(200).json({ data: customTest, message: 'Test found successfully based on Nepal time.' });
    }
    catch (error) {
        console.error("Error getting current chapter-wise test:", error);
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
}));
// daily tests for everyone --
router.get("/create-daily-test-by-users/:date", middleware_1.checkModerator, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const createdById = (_a = request.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!createdById) {
            return response.status(400).json({ data: null, message: 'Unauthorized' });
        }
        const { date } = request.params;
        if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return response.status(400).json({
                data: null,
                message: 'Invalid date format. Please use yyyy-mm-dd format'
            });
        }
        const limit = 50;
        const questionsIds = yield (0, questions_services_1.getQuestionsIds)(Number(limit), 'UG');
        if (!questionsIds || questionsIds.length === 0) {
            return null;
        }
        const slug = `dt-${date}`;
        const name = `Daily Test - ${date}`;
        // default PG as of now
        // Might edit laterr
        const stream = request.stream || 'UG';
        if (!stream || !(0, functions_1.getStreams)().includes(stream)) {
            return response.status(400).json({ data: null, message: 'Stream Not Specified' });
        }
        const isDailyTestAlreadyExist = yield TestsServices.isDailyTestSlugExist(slug, stream);
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
            stream: stream,
            description: null,
            imageUrl: null,
            specialUrl: null,
            specialImage: null,
            isLocked: false,
        };
        const newCustomTestId = yield TestsServices.createCustomTest(data);
        if (!newCustomTestId || newCustomTestId === null) {
            return response.status(404).json({ data: null, message: "Custom test not found" });
        }
        return response.status(201).json({ data: newCustomTestId, message: `${slug} test created` });
    }
    catch (error) {
        console.log("🚀 ~ router.get ~ error:", error);
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
}));
router.get("/get-daily-tests/:date", middleware_1.checkStreamMiddleware, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { date } = request.params;
        if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return response.status(400).json({
                data: null,
                message: 'Invalid date format. Please use yyyy-mm-dd format'
            });
        }
        const slug = `dt-${date}`;
        const dailyTest = yield TestsServices.getDailyTestsBySlug(slug);
        if (!dailyTest) {
            return response.status(404).json({ data: null, message: "Daily test not found" });
        }
        return response.status(201).json({ data: dailyTest, message: `Daily Tests found` });
    }
    catch (error) {
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
}));
router.post("/archive-test/:id", middleware_1.checkModerator, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = request.params;
        const updatedTest = yield TestsServices.archiveTestById(id);
        if (!updatedTest) {
            return response.status(404).json({
                data: null,
                message: "Test not found"
            });
        }
        return response.status(200).json({
            data: updatedTest,
            message: `Test has been disabled`
        });
    }
    catch (error) {
        console.error("Error disabling daily test:", error);
        return response.status(500).json({
            data: null,
            message: 'Internal Server Error'
        });
    }
}));
router.get("/archive-test", middleware_1.checkModerator, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const date = new Date();
        const currentDayOfMonth = date.getDate(); // Get the current day of the month (1-31)
        // Check if the current day is an "alternate day" (odd number)
        if (currentDayOfMonth % 2 === 0) {
            return response.status(403).json({ data: null, message: 'Daily test can only be created on alternate days.' });
        }
        const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        const slug = `dt-${formattedDate}`;
        const name = `Daily Test - ${formattedDate}`;
        // default PG as of now
        // Might edit later
        const stream = request.stream || 'UG';
        if (!stream || !(0, functions_1.getStreams)().includes(stream)) {
            return response.status(400).json({ data: null, message: 'Stream Not Specified or Invalid.' });
        }
        const isDailyTestAlreadyExist = yield TestsServices.isDailyTestSlugExist(slug, stream);
        if (!isDailyTestAlreadyExist) {
            return response.status(404).json({ data: null, message: `Daily Test ${slug} not exists.` });
        }
        const updatedTest = yield TestsServices.archiveTestBySlugAndStream(slug, stream);
        if (!updatedTest) {
            return response.status(404).json({
                data: null,
                message: "Test not found"
            });
        }
        return response.status(200).json({
            data: updatedTest,
            message: `Test has been disabled`
        });
    }
    catch (error) {
        console.error("Error disabling daily test:", error);
        return response.status(500).json({
            data: null,
            message: 'Internal Server Error'
        });
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
router.get("/get-test-metadata/:id", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
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
        const testIsLocked = yield TestsServices.isTestLocked(id);
        if (testIsLocked) {
            const c = request.query.c;
            if (!c || c === undefined || c === '') {
                return response.status(400).json({ data: null, message: "Invalid request" });
            }
            const isTestRequestValid = yield TestsServices.checkTestValidity(id, c);
            if (!isTestRequestValid) {
                return response.status(400).json({ data: null, message: "Invalid request" });
            }
        }
        const newCustomTest = yield TestsServices.getCustomTestById(id);
        if (!newCustomTest) {
            return response.status(404).json({ data: null, message: "Custom test metadata not found" });
        }
        return response.status(201).json({ data: newCustomTest, message: `${newCustomTest.name} test found` });
    }
    catch (error) {
        console.log(error);
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
}));
router.get("/get-single-test-for-edit/:id", middleware_1.checkModerator, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("Fetching test for edit with id:", request.params.id);
        const { id } = request.params;
        console.log("Extracted id from params:", id);
        const newCustomTest = yield TestsServices.getCustomTestById(id);
        console.log("Test service returned:", newCustomTest);
        if (!newCustomTest) {
            console.log("Test not found");
            return response.status(404).json({ data: null, message: "Custom test metadata not found" });
        }
        console.log("Test found, returning data");
        return response.status(200).json({ data: newCustomTest, message: `${newCustomTest.name} test found` });
    }
    catch (error) {
        console.error("Error getting test for edit:", error);
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
}));
router.get("/get-test-basic-scores/:id", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = request.params;
        const testScores = yield TestsServices.getTestBasicScores(id);
        if (!testScores || testScores === undefined) {
            return response.status(404).json({ data: null, message: "Test scores not found" });
        }
        return response.status(200).json({ data: testScores, message: `Test scores retrieved successfully` });
    }
    catch (error) {
        console.error("Error getting test scores:", error);
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
router.get("/get-all-tests-created-by-user", middleware_1.checkModerator, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = request === null || request === void 0 ? void 0 : request.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return response.status(400).json({ data: null, message: 'User ID not found' });
        }
        const customTests = yield TestsServices.getAllTestsCreatedByUser(userId);
        if (!customTests || customTests.length === 0) {
            return response.status(400).json({ data: null, message: 'No Tests Found!' });
        }
        return response.status(201).json({ data: customTests, message: `Tests found` });
    }
    catch (error) {
        console.error("Error getting user's tests:", error);
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
}));
router.get("/get-tests-by-type/:type", middleware_1.checkStreamMiddleware, middleware_1.getSubscribedUserId, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
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
        console.log("🚀 ~ router.get ~ error:", error);
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
}));
router.delete("/delete-custom-test/:id", middleware_1.checkModerator, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = request.params;
        if (!id) {
            return response.status(400).json({ data: null, message: 'Test ID is required' });
        }
        const isDeleted = yield TestsServices.deleteTestById(id);
        if (!isDeleted) {
            return response.status(404).json({ data: null, message: 'Test not found or could not be deleted' });
        }
        return response.status(200).json({ data: id, message: 'Test deleted successfully' });
    }
    catch (error) {
        console.error("Error deleting test:", error);
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
router.post("/update-test-questions/:id", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = request.params;
        const { questionIds } = request.body;
        const updatedTest = yield TestsServices.updateTestQuestions(id, questionIds);
        if (!updatedTest) {
            return response.status(400).json({ data: null, message: 'Can not update test questions' });
        }
        return response.status(201).json({ data: updatedTest, message: `Test questions updated` });
    }
    catch (error) {
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
}));
exports.default = router;
