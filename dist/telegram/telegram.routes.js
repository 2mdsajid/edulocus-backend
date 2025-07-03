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
const express_1 = require("express");
const node_telegram_bot_api_1 = __importDefault(require("node-telegram-bot-api"));
const puppeteer_1 = __importDefault(require("puppeteer")); // Import puppeteer directly for PDF generation
const node_html_to_image_1 = __importDefault(require("node-html-to-image"));
const promises_1 = __importDefault(require("fs/promises")); // Used for deleting the temporary file
const path_1 = __importDefault(require("path")); // Used for creating a reliable file path
const chap_syllabus_1 = require("../utils/chap_syllabus");
const TestServices = __importStar(require("../tests/tests.services"));
const router = (0, express_1.Router)();
const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
    console.error('Telegram bot token not found. Please set TELEGRAM_BOT_TOKEN in your environment variables.');
    process.exit(1);
}
const chatId = '@edulocus_test';
const bot = new node_telegram_bot_api_1.default(token);
const generateScheduleHtml = (scheduleData) => {
    const { title, headers, rows } = scheduleData;
    const ths = headers.map(header => `<th>${header}</th>`).join('');
    const trs = rows.map(row => {
        const tds = row.map(cell => `<td>${cell}</td>`).join('');
        return `<tr>${tds}</tr>`;
    }).join('');
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          width: 500px;
          padding: 15px;
          background-color: #f8f9fa;
        }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          border-radius: 8px;
          overflow: hidden;
        }
        h2 {
          text-align: center;
          color: #333;
        }
        th, td { 
          border: 1px solid #dee2e6; 
          padding: 12px; 
          text-align: left; 
        }
        th { 
          background-color: #343a40;
          color: white;
        }
        tr:nth-child(even) { 
          background-color: #f2f2f2; 
        }
        tr:hover { 
          background-color: #e9ecef; 
        }
      </style>
    </head>
    <body>
      ${title ? `<h2>${title}</h2>` : ''}
      <table>
        <thead>
          <tr>${ths}</tr>
        </thead>
        <tbody>
          ${trs}
        </tbody>
      </table>
    </body>
    </html>
  `;
};
/**
 * Formats a Date object into a string like "july_6" or "august_15".
 * @param date - The Date object to format.
 * @returns A formatted string for the day.
 */
const formatDateForSyllabus = (date) => {
    const monthNames = [
        "january", "february", "march", "april", "may", "june",
        "july", "august", "september", "october", "november", "december"
    ];
    const month = monthNames[date.getMonth()];
    const day = date.getDate();
    return `${month}_${day}`;
};
/**
 * GET route to send today's schedule to the Telegram channel.
 * It dynamically fetches the schedule based on the current date from ChapterWiseSyllabus.
 */
router.get('/send-todays-schedule-image', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const today = new Date();
    const formattedToday = formatDateForSyllabus(today);
    // Find today's schedule in the imported data
    const todaysSyllabus = chap_syllabus_1.ChapterWiseSyllabus.find((chapterDay) => chapterDay.day === formattedToday);
    if (!todaysSyllabus) {
        console.log(`No schedule found for today: ${formattedToday}`);
        return res.status(404).json({
            success: false,
            message: `No schedule found for today (${formattedToday}).`
        });
    }
    const scheduleRows = [];
    // Define the order of time slots
    const timeSlots = ["8am", "2pm", "6pm"];
    // Populate scheduleRows based on today's syllabus
    for (const timeSlot of timeSlots) {
        const subjectsAtTime = todaysSyllabus[timeSlot];
        if (subjectsAtTime && typeof subjectsAtTime !== 'string') {
            for (const subject in subjectsAtTime) {
                if (Object.prototype.hasOwnProperty.call(subjectsAtTime, subject)) {
                    const chapters = subjectsAtTime[subject];
                    // Join multiple chapters with a comma and space
                    const chapterString = chapters.join(', ');
                    scheduleRows.push([timeSlot.toUpperCase(), subject.replace(/_/g, ' '), chapterString.replace(/_/g, ' ')]);
                }
            }
        }
    }
    const scheduleData = {
        title: `Today's Schedule (${today.toLocaleDateString('en-GB')})`,
        caption: `Here is the schedule for today!\nDo join this chat for any discussions 👇\nhttps://t.me/+ygNs2o0PLXpjNDQ1`,
        headers: ["Time", "Subject", "Chapter"],
        rows: scheduleRows
    };
    const outputPath = path_1.default.join(__dirname, 'todays_schedule.png');
    try {
        const html = generateScheduleHtml(scheduleData);
        // Generate image from HTML
        yield (0, node_html_to_image_1.default)({
            output: outputPath,
            html,
            puppeteerArgs: { args: ['--no-sandbox'] } // Required for running in some environments
        });
        // Send the generated image to Telegram
        yield bot.sendPhoto(chatId, outputPath, { caption: scheduleData.caption });
        console.log(`Dynamic schedule image sent to Telegram channel ${chatId}`);
        res.status(200).json({ success: true, message: 'Dynamic schedule image successfully sent to Telegram.' });
    }
    catch (error) {
        console.error('Failed to send dynamic schedule image:', error);
        res.status(500).json({ success: false, error: 'An error occurred while generating or sending the image.' });
    }
    finally {
        // Clean up the created temporary image file
        try {
            yield promises_1.default.unlink(outputPath);
        }
        catch (cleanupError) {
            console.error('Failed to cleanup temporary image file:', cleanupError);
        }
    }
}));
router.get('/send-todays-schedule', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const today = new Date();
    const formattedToday = formatDateForSyllabus(today);
    // Find today's schedule in the imported data
    const todaysSyllabus = chap_syllabus_1.ChapterWiseSyllabus.find((chapterDay) => chapterDay.day === formattedToday);
    if (!todaysSyllabus) {
        console.log(`No schedule found for today: ${formattedToday}`);
        return res.status(404).json({
            success: false,
            message: `No schedule found for today (${formattedToday}).`
        });
    }
    const scheduleTextParts = [];
    scheduleTextParts.push(`*Today's Schedule (${today.toLocaleDateString('en-GB')})*\n`);
    // Define the order of time slots
    const timeSlots = ["8am", "2pm", "6pm"];
    // Populate scheduleTextParts based on today's syllabus
    for (const timeSlot of timeSlots) {
        const subjectsAtTime = todaysSyllabus[timeSlot];
        if (subjectsAtTime && typeof subjectsAtTime !== 'string') {
            const subjectsForTimeSlot = [];
            for (const subject in subjectsAtTime) {
                if (Object.prototype.hasOwnProperty.call(subjectsAtTime, subject)) {
                    const chapters = subjectsAtTime[subject];
                    const chapterString = chapters.join(', '); // Join multiple chapters with a comma and space
                    subjectsForTimeSlot.push(`  *${subject.replace(/_/g, ' ')}*\n    ${chapterString.replace(/_/g, ' ')}`);
                }
            }
            if (subjectsForTimeSlot.length > 0) {
                scheduleTextParts.push(`*${timeSlot.toUpperCase()}*\n${subjectsForTimeSlot.join('\n')}\n`);
            }
        }
    }
    const finalMessage = scheduleTextParts.join('\n') +
        `\nHere is the schedule for today!\nDo join this chat for any discussions 👇\nhttps://t.me/+ygNs2o0PLXpjNDQ1`;
    try {
        // Send the generated text message to Telegram
        // Using MarkdownV2 for bolding. Escaping might be needed for certain characters.
        yield bot.sendMessage(chatId, finalMessage, { parse_mode: 'Markdown' });
        console.log(`Dynamic schedule text sent to Telegram channel ${chatId}`);
        res.status(200).json({ success: true, message: 'Dynamic schedule text successfully sent to Telegram.' });
    }
    catch (error) {
        console.error('Failed to send dynamic schedule text message:', error);
        res.status(500).json({ success: false, error: 'An error occurred while sending the message.' });
    }
    // No finally block needed for file cleanup since no image is generated
}));
// Mock TestServices for demonstration
// const TestServices = {
//   archiveCustomTestBySlug: async (slug: string, stream: string): Promise<TTestArchiveResult | null> => {
//       console.log(`Mock: Archiving test with slug: ${slug} for stream: ${stream}`);
//       // Simulate finding and archiving a test
//       if (slug.includes('cws-2025-07-03-8am')) { // Example slug for a successful archive
//           return {
//               name: "Chapter Wise Series (8AM) - Reproductive System",
//               id: "test_id_8am",
//               slug: slug,
//               usersAttended: [
//                   { id: "user1", customTestId: "test_id_8am", username: "Alice", totalScore: 95 },
//                   { id: "user2", customTestId: "test_id_8am", username: "Bob", totalScore: 88 },
//                   { id: "user3", customTestId: "test_id_8am", username: "Charlie", totalScore: 72 },
//                   { id: "user4", customTestId: "test_id_8am", username: "David", totalScore: 95 },
//                   { id: "user5", customTestId: "test_id_8am", username: "Eve", totalScore: 60 },
//               ]
//           };
//       }
//       return null; // Simulate test not found or already archived
//   }
// };
router.get("/deactivate-chapterwise/:slug", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const outputPath = path_1.default.join(__dirname, 'leaderboard.pdf'); // Change extension to .pdf
    let browser; // Declare browser outside try block for finally access
    try {
        const { slug } = req.params;
        if (!slug) {
            return res.status(400).json({ data: null, message: 'Time slot is required.' });
        }
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const validTimeSlots = ['8am', '2pm', '6pm'];
        if (!validTimeSlots.includes(slug)) {
            return res.status(400).json({ data: null, message: 'Invalid time slot.' });
        }
        const generatedSlug = `cws-${year}-${month}-${day}-${slug}`;
        const archivedTestResult = yield TestServices.archiveCustomTestBySlug(generatedSlug, 'UG');
        if (!archivedTestResult) {
            return res.status(404).json({ data: null, message: 'Test not found or already archived.' });
        }
        const leaderboardData = {
            title: `Leaderboard - ${archivedTestResult.name} (${today.toLocaleDateString('en-GB')})`,
            headers: ["Rank", "Username", "Score"],
            rows: []
        };
        if (archivedTestResult.usersAttended.length > 0) {
            const sortedUsers = [...archivedTestResult.usersAttended].sort((a, b) => b.totalScore - a.totalScore);
            sortedUsers.forEach((user, index) => {
                leaderboardData.rows.push([
                    (index + 1).toString(),
                    user.username,
                    user.totalScore.toString()
                ]);
            });
        }
        else {
            leaderboardData.rows.push(["-", "No participants yet", "-"]);
        }
        const html = generateScheduleHtml(leaderboardData);
        // Use puppeteer to generate PDF
        browser = yield puppeteer_1.default.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = yield browser.newPage();
        yield page.setContent(html, { waitUntil: 'networkidle0' }); // Wait for network to be idle
        yield page.pdf({
            path: outputPath,
            format: 'A4',
            printBackground: true, // Ensure background colors/images are printed
            margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' }
        });
        // Send the generated PDF to Telegram
        yield bot.sendDocument(chatId, outputPath, { caption: `Leaderboard for ${archivedTestResult.name}` });
        console.log(`Leaderboard PDF sent to Telegram channel ${chatId}`);
        return res.status(200).json({ data: archivedTestResult, message: 'Test archived and leaderboard PDF sent successfully.' });
    }
    catch (error) {
        console.error("Error deactivating chapter-wise test or sending leaderboard:", error);
        return res.status(500).json({ data: null, message: 'Internal Server Error' });
    }
    finally {
        if (browser) {
            yield browser.close(); // Close the browser instance
        }
        try {
            yield promises_1.default.unlink(outputPath); // Clean up the created PDF file
        }
        catch (cleanupError) {
            console.error('Failed to cleanup temporary PDF file:', cleanupError);
        }
    }
}));
exports.default = router;
