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
const cors_1 = __importDefault(require("cors"));
const dotenv = __importStar(require("dotenv"));
const express_1 = __importDefault(require("express"));
const google_routes_1 = __importDefault(require("./google/google.routes"));
const groups_routes_1 = __importDefault(require("./groups/groups.routes"));
const mail_routes_1 = __importDefault(require("./mail/mail.routes"));
const questions_routes_1 = __importDefault(require("./questions/questions.routes"));
const telegram_routes_1 = __importDefault(require("./telegram/telegram.routes"));
const tests_routes_1 = __importDefault(require("./tests/tests.routes"));
const users_routes_1 = __importDefault(require("./users/users.routes"));
dotenv.config();
if (!process.env.PORT) {
    console.log("Please specify port number ");
    process.exit(1);
}
const app = (0, express_1.default)();
// Increase payload size limit (e.g., 50MB)
app.use(express_1.default.json({ limit: "50mb" })); // For JSON payloads
app.use(express_1.default.urlencoded({ limit: "50mb", extended: true })); // For URL-encoded payloads
app.use((0, cors_1.default)()); // To avoid cross-origin blocking
// Routes
app.use("/tests", tests_routes_1.default);
app.use("/google", google_routes_1.default);
app.use("/users", users_routes_1.default);
app.use("/groups", groups_routes_1.default);
app.use("/questions", questions_routes_1.default);
app.use("/mail", mail_routes_1.default);
app.use("/telegram", telegram_routes_1.default);
app.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('trigeredddg');
        return res.status(200).json({
            message: "Hello, please do not cause unnecessary API calls",
        });
    }
    catch (error) {
        console.error(error); // Log the error for debugging
        return res.status(500).json({ message: error.message });
    }
}));
// app.get(
//   "/all-questions",
//   async (req: Request, res: Response) => {
//     try {
//       // const countsByStream = await prisma.question.groupBy({
//       //   by: ['stream'], // The field to group by
//       //   _count: {
//       //     id: true, // Field to count. 'id' is a good choice.
//       //   },
//       //   orderBy: {
//       //     _count: {
//       //       id: 'desc' // Order by count descending
//       //     }
//       //   }
//       // });
//       // // The raw result looks like: [{ _count: { id: 5000 }, stream: 'PG' }, ...]
//       // // Let's format it into a cleaner array for the response.
//       // const formattedResponse = countsByStream.map(group => ({
//       //   stream: group.stream,
//       //   count: group._count.id
//       // }));
//       // return res.status(200).json(formattedResponse);
//         // return res.json({message : questionCount})
//       // 1. Fetch all questions with the required fields in a single query.
//       const allQuestions = await prisma.question.findMany({
//         select: {
//           id:true,
//           question: true,
//           stream:true,
//           options: {
//             select: {
//               a: true,
//               b: true,
//               c: true,
//               d: true,
//             },
//           },
//           IsPast:true,
//           answer: true,
//           explanation: true,
//         },
//       });
//       console.log(`Successfully fetched ${allQuestions.length} questions.`);
//       // 2. Set headers to prompt a file download in the browser.
//       res.setHeader("Content-Type", "application/json");
//       res.setHeader(
//         "Content-Disposition",
//         'attachment; filename="all_questions.json"'
//       );
//       // 3. Stream the response to avoid memory issues with large datasets.
//       const jsonStream = new Readable();
//       jsonStream._read = () => {}; // No-op
//       jsonStream.pipe(res);
//       // 4. Push the stringified JSON data to the stream.
//       // We stringify with an indent of 2 for readability.
//       jsonStream.push(JSON.stringify(allQuestions, null, 2));
//       // 5. Signal the end of the stream.
//       jsonStream.push(null);
//       console.log("Successfully streamed all questions as a JSON file.");
//     } catch (error: any) {
//       console.error("Error generating all questions download:", error);
//       // Ensure no partial data is sent if an error occurs
//       if (!res.headersSent) {
//         res
//           .status(500)
//           .json({ message: "Failed to generate questions file." });
//       }
//     }
//   }
// )
const PORT = parseInt(process.env.PORT, 10) || 3002;
app.listen(PORT, () => {
    console.log(`Listening http://localhost:${PORT}/`);
});
