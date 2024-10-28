"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllSubjects = getAllSubjects;
exports.getTopicsBySubject = getTopicsBySubject;
exports.getMarksOfAllSubjects = getMarksOfAllSubjects;
// 1. Get a list of all subjects
function getAllSubjects(syllabus) {
    return Object.keys(syllabus);
}
// 2. Get a list of topics for a specific subject
function getTopicsBySubject(syllabus, subject) {
    if (syllabus[subject]) {
        return syllabus[subject].topics;
    }
    return null;
}
// 3. Get marks of all subjects
function getMarksOfAllSubjects(syllabus) {
    const marks = {};
    for (const subject in syllabus) {
        marks[subject] = syllabus[subject].marks;
    }
    return marks;
}
