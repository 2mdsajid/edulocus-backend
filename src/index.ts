import cors from "cors";
import * as dotenv from "dotenv";
import express, { Request, Response } from "express";

import questionsRouter from "./questions/questions.routes";
import testsRouter from "./tests/tests.routes";
import usersRouter from "./users/users.routes";
import googleRouter from "./google/google.routes";

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
app.use("/questions", questionsRouter);

app.get("/", async (req: Request, res: Response): Promise<any> => {
  try {
    return res.status(200).json({
      message: "Hello, please do not cause unnecessary API calls",
    });
  } catch (error: any) {
    console.error(error); // Log the error for debugging
    return res.status(500).json({ message: error.message });
  }
});

const PORT: number = parseInt(process.env.PORT as string, 10) || 3002;

app.listen(PORT, () => {
  console.log(`Listening http://localhost:${PORT}/`);
});