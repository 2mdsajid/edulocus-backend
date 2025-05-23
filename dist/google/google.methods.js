"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.truncatedGenAiOutput = void 0;
const truncatedGenAiOutput = (html) => {
    let htmlOutput = html;
    // --- Post-processing to remove Markdown code block fences ---
    if (htmlOutput.startsWith('```html') && htmlOutput.endsWith('```')) {
        htmlOutput = htmlOutput.substring(8, htmlOutput.length - 4); // Remove '```html\n' and '\n```'
    }
    else if (htmlOutput.startsWith('```') && htmlOutput.endsWith('```')) {
        // In case it sometimes just uses generic code block
        htmlOutput = htmlOutput.substring(4, htmlOutput.length - 4);
    }
    // --- End of Post-processing ---
    return htmlOutput;
};
exports.truncatedGenAiOutput = truncatedGenAiOutput;
