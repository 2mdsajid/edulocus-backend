import { TPGSyllabus, TStreamHierarchy } from '../utils/global-types';

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

// Get all stream names
export function getAllStreams(STREAM_HIERARCHY: TStreamHierarchy[]): string[] {
    return STREAM_HIERARCHY.map(stream => stream.name);
}

// Get categories of the given stream
export function getCategoriesOfStream(STREAM_HIERARCHY: TStreamHierarchy[], streamName: string): string[] | null {
    const stream = STREAM_HIERARCHY.find(s => s.name === streamName);
    return stream ? stream.categories.map(category => category.name) : null;
}

// Get affiliations of the given stream and category
export function getAffiliationsOfStreamCategory(
    STREAM_HIERARCHY: TStreamHierarchy[],
    streamName: string,
    categoryName: string
): string[] | null {
    const stream = STREAM_HIERARCHY.find(s => s.name === streamName);
    if (!stream) return null;

    const category = stream.categories.find(c => c.name === categoryName);
    return category ? category.affiliations : null;
}
