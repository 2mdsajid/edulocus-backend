import { TPGSyllabus } from '../utils/global-types';

// 1. Get a list of all subjects
export function getAllSubjects(syllabus: TPGSyllabus): string[] {
    return Object.keys(syllabus);
}

// 2. Get a list of topics for a specific subject
export function getTopicsBySubject(syllabus: TPGSyllabus, subject: string): string[] | null {
    if (syllabus[subject]) {
        return syllabus[subject].topics;
    } 
    return null; 
}

// 3. Get marks of all subjects
export function getMarksOfAllSubjects(syllabus: TPGSyllabus): { [subject: string]: number } {
    const marks: { [subject: string]: number } = {};
    for (const subject in syllabus) {
        marks[subject] = syllabus[subject].marks;
    }
    return marks;
}