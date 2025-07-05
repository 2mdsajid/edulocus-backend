import { Request, Response, Router } from 'express';
import TelegramBot from 'node-telegram-bot-api';


import * as TestServices from '../tests/tests.services';
import { ChapterWiseSyllabus, TChapterWiseSyllabus } from '../utils/chap_syllabus';

interface ScheduleData {
  title?: string;
  caption?: string;
  headers: string[]; // Not directly used for Markdown output, but kept for consistency if needed elsewhere
  rows: string[][]; // Not directly used for Markdown output, but kept for consistency if needed elsewhere
}

const router: Router = Router();

const token = process.env.TELEGRAM_BOT_TOKEN_TEST;
if (!token) {
  console.error('Telegram bot token not found. Please set TELEGRAM_BOT_TOKEN in your environment variables.');
  process.exit(1);
}
const testChatId = '@edulocus_test';
const edulocusOriginalChatId = '@edulocus_tg';

const bot = new TelegramBot(token);

/**
 * Formats a Date object into a string like "july_6" or "august_15".
 * @param date - The Date object to format.
 * @returns A formatted string for the day.
 */
const formatDateForSyllabus = (date: Date): string => {
  const monthNames = [
    "january", "february", "march", "april", "may", "june",
    "july", "august", "september", "october", "november", "december"
  ];
  const month = monthNames[date.getMonth()];
  const day = date.getDate();
  return `${month}_${day}`;
};


// send tomorrows schedult -- at 10 pm run -- main group
router.get('/send-tomorrows-schedule', async (req: Request, res: Response) => {
    // Calculate tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const formattedTomorrow = formatDateForSyllabus(tomorrow);

    // Find tomorrow's schedule in the imported data
    const tomorrowsSyllabus = ChapterWiseSyllabus.find(
        (chapterDay) => chapterDay.day === formattedTomorrow
    );

    if (!tomorrowsSyllabus) {
        const message = `No schedule found for tomorrow (${formattedTomorrow}).`;
        console.log(message);
        return res.status(404).json({
            success: false,
            message: message
        });
    }

    const scheduleTextParts: string[] = [];
    // Title for the schedule message, reflecting tomorrow's date
    scheduleTextParts.push(`*Tomorrow's Schedule (${tomorrow.toLocaleDateString('en-GB')})*\n`);

    // Define the order of time slots
    const timeSlots: Array<keyof TChapterWiseSyllabus[0]> = ["8am", "2pm", "6pm"];

    // Populate scheduleTextParts based on tomorrow's syllabus
    for (const timeSlot of timeSlots) {
        const subjectsAtTime = tomorrowsSyllabus[timeSlot];
        if (subjectsAtTime && typeof subjectsAtTime !== 'string') {
            const subjectsForTimeSlot: string[] = [];
            for (const subject in subjectsAtTime) {
                if (Object.prototype.hasOwnProperty.call(subjectsAtTime, subject)) {
                    const chapters = subjectsAtTime[subject] as string[];
                    const chapterString = chapters.join(', ');
                    subjectsForTimeSlot.push(
                        `  *${subject.replace(/_/g, ' ')}*\n    ${chapterString.replace(/_/g, ' ')}`
                    );
                }
            }
            if (subjectsForTimeSlot.length > 0) {
                scheduleTextParts.push(`*${timeSlot.toUpperCase()}*\n${subjectsForTimeSlot.join('\n')}\n`);
            }
        }
    }

    // Combine all parts and add the updated caption
    const finalMessage = scheduleTextParts.join('\n');

    try {
        // Send the generated text message to Telegram
        await bot.sendMessage(edulocusOriginalChatId, finalMessage, { parse_mode: 'Markdown' });

        console.log(`Tomorrow's schedule sent to Telegram channel ${edulocusOriginalChatId}`);
        res.status(200).json({ success: true, message: "Tomorrow's schedule successfully sent to Telegram." });

    } catch (error) {
        console.error("Failed to send tomorrow's schedule:", error);
        res.status(500).json({ success: false, error: 'An error occurred while sending the message.' });
    }
});

// will deactivate all tests and publish the results -- at 10pm run -- main group
router.get("/deactivate-chapterwise-all", async (req: Request, res: Response) => {
    try {
        if (!edulocusOriginalChatId) {
            console.error("Error: TELEGRAM_TEST_CHAT_ID is not defined in environment variables.");
            return res.status(500).json({ data: null, message: 'Server configuration error.' });
        }

        const timeSlots = ['8am', '2pm', '6pm'];
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        
        const processingResults = [];

        // Process each time slot sequentially to send messages one by one
        for (const slug of timeSlots) {
            const generatedSlug = `cws-${year}-${month}-${day}-${slug}`;

            const archivedTestResult = await TestServices.archiveCustomTestBySlug(generatedSlug, 'UG');

            if (!archivedTestResult) {
                const message = `Test for time slot ${slug} not found or already archived.`;
                console.log(message);
                processingResults.push({ slug, status: 'Not Found', message });
                continue; // Move to the next time slot
            }

            const leaderboardTextParts: string[] = [];
            leaderboardTextParts.push(`*Leaderboard - ${archivedTestResult.name} (${today.toLocaleDateString('en-GB')})*\n`);

            if (archivedTestResult.usersAttended && archivedTestResult.usersAttended.length > 0) {
                const sortedUsers = [...archivedTestResult.usersAttended].sort((a, b) => b.totalScore - a.totalScore);

                let maxRankWidth = 'Rank'.length;
                let maxUsernameWidth = 'Username'.length;
                let maxScoreWidth = 'Score'.length;

                sortedUsers.forEach((user, index) => {
                    maxRankWidth = Math.max(maxRankWidth, (index + 1).toString().length);
                    maxUsernameWidth = Math.max(maxUsernameWidth, user.username.length);
                    maxScoreWidth = Math.max(maxScoreWidth, user.totalScore.toString().length);
                });
                
                maxRankWidth += 1;
                maxUsernameWidth += 2;
                maxScoreWidth += 1;

                leaderboardTextParts.push('```');
                leaderboardTextParts.push(
                    `${'Rank'.padEnd(maxRankWidth)}| ` +
                    `${'Username'.padEnd(maxUsernameWidth)}| ` +
                    `${'Score'.padEnd(maxScoreWidth)}`
                );
                leaderboardTextParts.push(
                    `${'-'.repeat(maxRankWidth)}|` +
                    `${'-'.repeat(maxUsernameWidth + 1)}|` +
                    `${'-'.repeat(maxScoreWidth)}`
                );

                sortedUsers.forEach((user, index) => {
                    leaderboardTextParts.push(
                        `${(index + 1).toString().padEnd(maxRankWidth)}| ` +
                        `${user.username.padEnd(maxUsernameWidth)}| ` +
                        `${user.totalScore.toString().padEnd(maxScoreWidth)}`
                    );
                });

                leaderboardTextParts.push('```');
            } else {
                leaderboardTextParts.push(`_No participants yet for this test._`);
            }

            const finalLeaderboardMessage = leaderboardTextParts.join('\n');
            await bot.sendMessage(edulocusOriginalChatId, finalLeaderboardMessage, { parse_mode: 'Markdown' });
            
            const message = `Leaderboard for ${slug} sent successfully.`;
            console.log(message);
            processingResults.push({ slug, status: 'Sent', message });
        }

        return res.status(200).json({ data: processingResults, message: 'All chapter-wise test deactivations processed.' });

    } catch (error: any) {
        console.error("Error processing all chapter-wise test deactivations:", error);
        return res.status(500).json({ data: null, message: 'Internal Server Error' });
    }
});

// will send all the tests in combined way -- send at morning 1 day before in test group -- for testing
// and for question corrections
router.get("/send-daily-schedule-combined", async (req: Request, res: Response) => {
    try {
        if (!testChatId) {
            console.error("Error: TELEGRAM_CHAT_ID is not defined in environment variables.");
            return res.status(500).json({ data: null, message: 'Server configuration error.' });
        }

        const timeSlots = ['8am', '2pm', '6pm'];
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth()+1).padStart(2, '0');
        const day = String(today.getDate()+1).padStart(2, '0');

        const messageParts: string[] = [`*Free Chapterwise Series* - ${year}-${month}-${day}`];
        const processedTests:any = [];

        // Process all time slots concurrently
        const testPromises = timeSlots.map(async (slug) => {
            const generatedSlug = `cws-${year}-${month}-${day}-${slug}`;
            console.log(generatedSlug)
            const test = await TestServices.getChapterWiseTestBySlugAndStream(generatedSlug, 'UG');
            
            if (test) {
                const testViewUrl = `${process.env.FRONTEND}/tests/view/${test.id}`;
                return {
                    slug,
                    name: test.name,
                    url: testViewUrl,
                    id: test.id
                };
            }
            return null;
        });

        const results = await Promise.all(testPromises);

        let testsFound = 0;
        results.forEach(result => {
            if (result) {
                // Add a blank line before each test entry for better spacing
                messageParts.push(
                    ``, 
                    `${result.slug}`,
                     `${result.name}`,
                    result.url
                );
                processedTests.push({ testId: result.id, url: result.url });
                testsFound++;
            }
        });

        if (testsFound === 0) {
            console.log("No chapter-wise tests found for today's schedule.");
            return res.status(404).json({ data: null, message: 'No tests found for any time slot today.' });
        }

        const telegramMessage = messageParts.join('\n');

        await bot.sendMessage(testChatId, telegramMessage, { parse_mode: 'Markdown' });

        console.log(`Consolidated daily schedule sent to Telegram channel ${edulocusOriginalChatId}`);
        
        return res.status(200).json({
            data: processedTests,
            message: 'Daily schedule notification sent successfully.'
        });

    } catch (error: any) {
        console.error("Error in /send-daily-schedule route:", error);
        return res.status(500).json({ data: null, message: 'An internal server error occurred.' });
    }
});



// will send all the tests in combined way -- send at morning 
// combined and archived so can be activated later onn when the time comes
router.get("/send-daily-schedule-combined-for-test", async (req: Request, res: Response) => {
    try {
        if (!edulocusOriginalChatId) {
            console.error("Error: TELEGRAM_CHAT_ID is not defined in environment variables.");
            return res.status(500).json({ data: null, message: 'Server configuration error.' });
        }

        const timeSlots = ['8am', '2pm', '6pm'];
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth()+1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');

        const messageParts: string[] = [`*Free Chapterwise Series* - ${year}-${month}-${day}`];
        const processedTests:any = [];

        // Process all time slots concurrently
        const testPromises = timeSlots.map(async (slug) => {
            const generatedSlug = `cws-${year}-${month}-${day}-${slug}`;
            console.log(generatedSlug)
            const test = await TestServices.archiveCustomTestBySlug(generatedSlug, 'UG');
            
            if (test) {
                const testViewUrl = `${process.env.FRONTEND}/tests/view/${test.id}`;
                return {
                    slug,
                    name: test.name,
                    url: testViewUrl,
                    id: test.id
                };
            }
            return null;
        });

        const results = await Promise.all(testPromises);

        let testsFound = 0;
        results.forEach(result => {
            if (result) {
                // Add a blank line before each test entry for better spacing
                messageParts.push(
                    ``, 
                    `${result.slug}`,
                     `${result.name}`,
                    result.url
                );
                processedTests.push({ testId: result.id, url: result.url });
                testsFound++;
            }
        });

        if (testsFound === 0) {
            console.log("No chapter-wise tests found for today's schedule.");
            return res.status(404).json({ data: null, message: 'No tests found for any time slot today.' });
        }

        const telegramMessage = messageParts.join('\n');

        await bot.sendMessage(edulocusOriginalChatId, telegramMessage, { parse_mode: 'Markdown' });

        console.log(`Consolidated daily schedule sent to Telegram channel ${edulocusOriginalChatId}`);
        
        return res.status(200).json({
            data: processedTests,
            message: 'Daily schedule notification sent successfully.'
        });

    } catch (error: any) {
        console.error("Error in /send-daily-schedule route:", error);
        return res.status(500).json({ data: null, message: 'An internal server error occurred.' });
    }
});

// will activate the test at the time for attending
// no telegram message will be sent
router.get("/send-daily-schedule/:slug", async (req: Request, res: Response) => {
    try {
        const { slug } = req.params;

        if (!slug) {
            return res.status(400).json({ data: null, message: 'Time slot slug is required.' });
        }

        if (!edulocusOriginalChatId) {
            console.error("Error: TELEGRAM_CHAT_ID is not defined in environment variables.");
            return res.status(500).json({ data: null, message: 'Server configuration error.' });
        }

        const validTimeSlots = ['8am', '2pm', '6pm'];
        if (!validTimeSlots.includes(slug)) {
            return res.status(400).json({ data: null, message: 'Invalid time slot provided.' });
        }

        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const generatedSlug = `cws-${year}-${month}-${day}-${slug}`;

        const archivedTest = await TestServices.activateCustomTestBySlug(generatedSlug, 'UG');

        if (!archivedTest) {
            return res.status(404).json({ data: null, message: 'Test not found or has already been processed.' });
        }

        const testViewUrl = `${process.env.FRONTEND}/tests/view/${archivedTest.id}`;

        // const telegramMessage = [
        //     `*Free Chapterwise Series - ${slug}*`,
        //     `${year}-${month}-${day}`,
        //     ``,
        //     `${archivedTest.name}`,
        //     ``,
        //     testViewUrl,
        //     ``
        // ].join('\n');

        // await bot.sendMessage(edulocusOriginalChatId, telegramMessage, { parse_mode: 'Markdown' });

        // console.log(`Deactivation message sent to Telegram channel ${edulocusOriginalChatId} for test: ${archivedTest.name}`);
        
        return res.status(200).json({
            data: {
                testId: archivedTest.id,
                url: testViewUrl
            },
            message: 'Test archived and notification sent successfully.'
        });

    } catch (error: any) {
        console.error("Error in /send-daily-schedule/:slug route:", error);
        return res.status(500).json({ data: null, message: 'An internal server error occurred.' });
    }
});

export default router;