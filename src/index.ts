import cors from "cors";
import * as dotenv from "dotenv";
import express, { Request, Response } from "express";

import googleRouter from "./google/google.routes";
import groupsRouter from "./groups/groups.routes";
import mailRouter from "./mail/mail.routes";
import questionsRouter from "./questions/questions.routes";
import telegramRouter from "./telegram/telegram.routes";
import testsRouter from "./tests/tests.routes";
import usersRouter from "./users/users.routes";

dotenv.config();

if (!process.env.PORT) {
  console.log("Please specify port number ");
  process.exit(1);
}

const app = express();

// Increase payload size limit (e.g., 50MB)
app.use(express.json({ limit: "50mb" })); // For JSON payloads
app.use(express.urlencoded({ limit: "50mb", extended: true })); // For URL-encoded payloads

app.use(cors()); // To avoid cross-origin blocking

// Routes
app.use("/tests", testsRouter);
app.use("/google", googleRouter)
app.use("/users", usersRouter);
app.use("/groups", groupsRouter)
app.use("/questions", questionsRouter);
app.use("/mail", mailRouter);
app.use("/telegram",telegramRouter)


app.get("/", async (req: Request, res: Response): Promise<any> => {
  try {
    console.log('trigeredddg')
    return res.status(200).json({
      message: "Hello, please do not cause unnecessary API calls",
    });
  } catch (error: any) {
    console.error(error); // Log the error for debugging
    return res.status(500).json({ message: error.message });
  }
});


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

const PORT: number = parseInt(process.env.PORT as string, 10) || 3002;

app.listen(PORT, () => {
  console.log(`Listening http://localhost:${PORT}/`);
});