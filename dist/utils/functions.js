"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatDateForSyllabus = exports.capitalizeWords = exports.getStreams = exports.getRandomColor = exports.generateRandomCode = exports.isCuid = exports.isUUID = exports.formatDate = void 0;
exports.getSubjectsAndMarks = getSubjectsAndMarks;
const global_data_1 = require("./global-data");
const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { month: 'short', day: '2-digit' };
    return date.toLocaleDateString('en-US', options);
};
exports.formatDate = formatDate;
const isUUID = (inputString) => {
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidPattern.test(inputString);
};
exports.isUUID = isUUID;
const isCuid = (str) => {
    const cuidRegex = /^c[a-z0-9]{24}$/;
    return cuidRegex.test(str);
};
exports.isCuid = isCuid;
// Function to generate a random code
const generateRandomCode = () => {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        code += characters[randomIndex];
    }
    return code;
};
exports.generateRandomCode = generateRandomCode;
const colors = [
    "#FF6384", // Pink
    "#36A2EB", // Blue
    "#FFCE56", // Yellow
    "#4BC0C0", // Teal
    "#9966FF", // Purple
    "#FF9F40", // Orange
    "#FF5733", // Coral
    "#C70039", // Crimson
    "#900C3F", // Dark Red
    "#581845", // Dark Purple
];
// Helper function to get a random color from the colors array
const getRandomColor = () => colors[Math.floor(Math.random() * colors.length)];
exports.getRandomColor = getRandomColor;
const getStreams = () => {
    return global_data_1.STREAM_HIERARCHY.map(stream => stream.name);
};
exports.getStreams = getStreams;
function getSubjectsAndMarks(syllabus, stream) {
    const result = [];
    const subjects = syllabus[stream];
    if (!subjects)
        return result;
    for (const [subject, { marks }] of Object.entries(subjects)) {
        result.push({ subject, marks });
    }
    return result;
}
const capitalizeWords = (str) => {
    return str.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};
exports.capitalizeWords = capitalizeWords;
const formatDateForSyllabus = (date) => {
    const monthNames = [
        "january", "february", "march", "april", "may", "june",
        "july", "august", "september", "october", "november", "december"
    ];
    const month = monthNames[date.getMonth()];
    const day = date.getDate();
    return `${month}_${day}`;
};
exports.formatDateForSyllabus = formatDateForSyllabus;
