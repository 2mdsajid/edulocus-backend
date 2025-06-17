"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.doesSubjectExist = doesSubjectExist;
exports.getAllSubjects = getAllSubjects;
exports.getAllTopicsBySubject = getAllTopicsBySubject;
exports.getMarksOfAllSubjects = getMarksOfAllSubjects;
exports.getAllStreams = getAllStreams;
exports.getCategoriesOfStream = getCategoriesOfStream;
exports.getAffiliationsOfStreamCategory = getAffiliationsOfStreamCategory;
function doesSubjectExist(syllabus, stream, subject) {
    if (!syllabus[stream]) {
        return false;
    }
    return subject in syllabus[stream];
}
function getAllSubjects(syllabus, stream) {
    if (syllabus[stream]) {
        return Object.keys(syllabus[stream]);
    }
    return [];
}
function getAllTopicsBySubject(syllabus, stream, subject) {
    var _a;
    if ((_a = syllabus[stream]) === null || _a === void 0 ? void 0 : _a[subject]) {
        return syllabus[stream][subject].topics;
    }
    return null;
}
function getMarksOfAllSubjects(syllabus, stream) {
    const marks = {};
    if (syllabus[stream]) {
        for (const subject in syllabus[stream]) {
            marks[subject] = syllabus[stream][subject].marks;
        }
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
