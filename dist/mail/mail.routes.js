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
const mail_services_1 = require("./mail.services");
const TestServices = __importStar(require("../tests/tests.services"));
const router = express_1.default.Router();
router.post('/send-mail', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const emailInfo = yield (0, mail_services_1.sendEmail)(request.body);
        return response.status(200).json({ data: emailInfo, message: 'Mail sent' });
    }
    catch (error) {
        console.log("🚀 ~ router.post ~ error:", error);
        return response.status(500).json({ data: null, message: 'Internal Server Error' });
    }
}));
router.get("/send-todays-tests-email", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // 1. Get today's date and find the tests
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const formattedDateForSlug = `${year}-${month}-${day}`;
        const FRONTEND_URL = process.env.FRONTEND || 'https://edulocusweb.com';
        const timeSlots = ['8am', '2pm', '6pm'];
        const testPromises = timeSlots.map((slug) => __awaiter(void 0, void 0, void 0, function* () {
            const generatedSlug = `cws-${formattedDateForSlug}-${slug}`;
            const test = yield TestServices.archiveCustomTestBySlug(generatedSlug, 'UG');
            if (test) {
                return {
                    time: slug.toUpperCase(),
                    name: test.name,
                    url: `${FRONTEND_URL}/tests/view/${test.id}`,
                };
            }
            return null;
        }));
        const testResults = (yield Promise.all(testPromises)).filter(result => result !== null);
        if (testResults.length === 0) {
            const message = `No chapter-wise tests found for today's schedule (${formattedDateForSlug}).`;
            console.log(message);
            return res.status(404).json({ data: null, message });
        }
        // 2. Get the list of subscribed user emails
        const subscribedEmails = yield (0, mail_services_1.getChapterWiseSubscribedEmails)();
        if (!subscribedEmails || subscribedEmails.length === 0) {
            const message = "No subscribed users found to send the email to.";
            console.log(message);
            return res.status(404).json({ data: null, message });
        }
        // 3. Construct the main part of the HTML email body
        const mainHtmlBody = `
            <h2>Today's Chapter-wise Test Schedule</h2>
            <p><strong>Date:</strong> ${today.toLocaleDateString('en-GB')}</p>
            <p>Hello! Here is the schedule for today's free chapter-wise tests. Click the links below to start the test <b><u>after the scheduled time.</b></u></p>
            <hr>
            ${testResults.map(test => `
                <div style="margin-bottom: 20px;">
                    <h3 style="margin-bottom: 5px;">${test.time} - ${test.name}</h3>
                    <a href="${test.url}" style="display: inline-block; padding: 10px 15px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 5px;">
                        Go to Test
                    </a>
                </div>
            `).join('<hr>')}
            <p>Good luck!</p>
        `;
        // 4. Iterate and send email to each user individually
        const emailPromises = subscribedEmails.map(email => {
            // Construct the personalized footer for each email
            const footerHtml = `
                <hr>
                <div style="font-size: 12px; color: #777; text-align: center; margin-top: 20px;">
                    <p>
                        For more information about this test series, <a href="${FRONTEND_URL}/tests/chapterwise-series/info">click here</a>.
                    </p>
                    <p>
                        <a href="${FRONTEND_URL}/privacy">Privacy Policy</a> | <a href="${FRONTEND_URL}/unsubscribe?email=${encodeURIComponent(email)}">Unsubscribe</a>
                    </p>
                </div>
            `;
            const fullHtmlBody = `
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                    ${mainHtmlBody}
                    ${footerHtml}
                </div>
            `;
            const mailData = {
                to: email,
                subject: `Today's Test Link - ${today.toLocaleDateString('en-GB')}`,
                html: fullHtmlBody,
            };
            return (0, mail_services_1.sendChapterWiseTestSeriesMail)(mailData);
        });
        const results = yield Promise.allSettled(emailPromises);
        const successfulSends = results.filter(r => r.status === 'fulfilled' && r.value).length;
        const failedSends = results.length - successfulSends;
        const responseMessage = `Processing complete. Successfully sent ${successfulSends} emails. Failed to send ${failedSends} emails.`;
        console.log(responseMessage);
        return res.status(200).json({
            data: {
                successfulSends,
                failedSends,
            },
            message: responseMessage,
        });
    }
    catch (error) {
        console.error("Error in /send-todays-tests-email route:", error);
        return res.status(500).json({ data: null, message: 'An internal server error occurred.' });
    }
}));
exports.default = router;
