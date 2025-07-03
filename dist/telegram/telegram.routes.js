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
const TestServices = __importStar(require("../tests/tests.services"));
const chap_syllabus_1 = require("../utils/chap_syllabus");
const router = (0, express_1.Router)();
const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
    console.error('Telegram bot token not found. Please set TELEGRAM_BOT_TOKEN in your environment variables.');
    process.exit(1);
}
const chatId = '@edulocus_test';
const bot = new node_telegram_bot_api_1.default(token);
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
 * This version sends a plain text message formatted with Markdown.
 */
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
    // Title for the schedule message
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
                    // Format:   *Subject Name* \n     Chapter 1, Chapter 2
                    subjectsForTimeSlot.push(`  *${subject.replace(/_/g, ' ')}*\n    ${chapterString.replace(/_/g, ' ')}`);
                }
            }
            if (subjectsForTimeSlot.length > 0) {
                // Format: *TIME_SLOT*\n (subjects list)
                scheduleTextParts.push(`*${timeSlot.toUpperCase()}*\n${subjectsForTimeSlot.join('\n')}\n`);
            }
        }
    }
    // Combine all parts and add the caption
    const finalMessage = scheduleTextParts.join('\n') +
        `\nHere is the schedule for today!\nDo join this chat for any discussions 👇\nhttps://t.me/+ygNs2o0PLXpjNDQ1`;
    try {
        // Send the generated text message to Telegram using Markdown parse mode
        yield bot.sendMessage(chatId, finalMessage, { parse_mode: 'Markdown' });
        console.log(`Dynamic schedule text sent to Telegram channel ${chatId}`);
        res.status(200).json({ success: true, message: 'Dynamic schedule text successfully sent to Telegram.' });
    }
    catch (error) {
        console.error('Failed to send dynamic schedule text message:', error);
        res.status(500).json({ success: false, error: 'An error occurred while sending the message.' });
    }
}));
router.get("/deactivate-chapterwise/:slug", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const leaderboardTextParts = [];
        // Title for the leaderboard message
        leaderboardTextParts.push(`*Leaderboard - ${archivedTestResult.name} (${today.toLocaleDateString('en-GB')})*\n`);
        if (archivedTestResult.usersAttended.length > 0) {
            const sortedUsers = [...archivedTestResult.usersAttended].sort((a, b) => b.totalScore - a.totalScore);
            // Calculate max widths for each column for formatting
            let maxRankWidth = 'Rank'.length;
            let maxUsernameWidth = 'Username'.length;
            let maxScoreWidth = 'Score'.length;
            sortedUsers.forEach((user, index) => {
                maxRankWidth = Math.max(maxRankWidth, (index + 1).toString().length);
                maxUsernameWidth = Math.max(maxUsernameWidth, user.username.length);
                maxScoreWidth = Math.max(maxScoreWidth, user.totalScore.toString().length);
            });
            // Add a little extra padding for readability
            maxRankWidth += 1;
            maxUsernameWidth += 2;
            maxScoreWidth += 1;
            // Start the fixed-width code block
            leaderboardTextParts.push('```'); // Markdown for code block start
            // Header row
            leaderboardTextParts.push(`${'Rank'.padEnd(maxRankWidth)}| ` +
                `${'Username'.padEnd(maxUsernameWidth)}| ` +
                `${'Score'.padEnd(maxScoreWidth)}`);
            // Separator row
            leaderboardTextParts.push(`${'-'.repeat(maxRankWidth)}|` +
                `${'-'.repeat(maxUsernameWidth + 1)}|` + // +1 for the space after '|'
                `${'-'.repeat(maxScoreWidth)}`);
            // Data rows
            sortedUsers.forEach((user, index) => {
                leaderboardTextParts.push(`${(index + 1).toString().padEnd(maxRankWidth)}| ` +
                    `${user.username.padEnd(maxUsernameWidth)}| ` +
                    `${user.totalScore.toString().padEnd(maxScoreWidth)}`);
            });
            leaderboardTextParts.push('```'); // Markdown for code block end
        }
        else {
            leaderboardTextParts.push(`_No participants yet for this test._`);
        }
        const finalLeaderboardMessage = leaderboardTextParts.join('\n');
        // Send the generated Markdown text message to Telegram
        yield bot.sendMessage(chatId, finalLeaderboardMessage, { parse_mode: 'Markdown' });
        console.log(`Leaderboard text sent to Telegram channel ${chatId}`);
        return res.status(200).json({ data: archivedTestResult, message: 'Test archived and leaderboard text sent successfully.' });
    }
    catch (error) {
        console.error("Error deactivating chapter-wise test or sending leaderboard:", error);
        return res.status(500).json({ data: null, message: 'Internal Server Error' });
    }
}));
exports.default = router;
