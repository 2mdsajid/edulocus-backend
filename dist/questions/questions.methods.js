"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllSubjects = getAllSubjects;
exports.getTopicsBySubject = getTopicsBySubject;
exports.getMarksOfAllSubjects = getMarksOfAllSubjects;
exports.getAllStreams = getAllStreams;
exports.getCategoriesOfStream = getCategoriesOfStream;
exports.getAffiliationsOfStreamCategory = getAffiliationsOfStreamCategory;
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
// Get all stream names
function getAllStreams(STREAM_HIERARCHY) {
    return STREAM_HIERARCHY.map(stream => stream.name);
}
// Get categories of the given stream
function getCategoriesOfStream(STREAM_HIERARCHY, streamName) {
    const stream = STREAM_HIERARCHY.find(s => s.name === streamName);
    return stream ? stream.categories.map(category => category.name) : null;
}
// Get affiliations of the given stream and category
function getAffiliationsOfStreamCategory(STREAM_HIERARCHY, streamName, categoryName) {
    const stream = STREAM_HIERARCHY.find(s => s.name === streamName);
    if (!stream)
        return null;
    const category = stream.categories.find(c => c.name === categoryName);
    return category ? category.affiliations : null;
}
