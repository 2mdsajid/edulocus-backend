import { TSyllabusCombined, TStreamHierarchy } from '../utils/global-types';


export function getAllSubjects(syllabus: TSyllabusCombined, stream: string): string[] {
    if (syllabus[stream]) {
        return Object.keys(syllabus[stream]);
    }
    return [];
}

export function getTopicsBySubject(syllabus: TSyllabusCombined, stream: string, subject: string): string[] | null {
    if (syllabus[stream]?.[subject]) {
        return syllabus[stream][subject].topics;
    }
    return null;
}

export function getMarksOfAllSubjects(syllabus: TSyllabusCombined, stream: string): { [subject: string]: number } {
    const marks: { [subject: string]: number } = {};
    if (syllabus[stream]) {
        for (const subject in syllabus[stream]) {
            marks[subject] = syllabus[stream][subject].marks;
        }
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
