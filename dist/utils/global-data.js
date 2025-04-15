"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.STREAM_HIERARCHY = exports.typeOfTestsAndDescriptionData = void 0;
exports.typeOfTestsAndDescriptionData = [
    {
        type: 'MODEL',
        description: 'Mock test to simulate real exam conditions.',
        icon: '📊'
    },
    {
        type: 'SUBJECT_WISE',
        description: 'Test focused on a specific subject.',
        icon: '📚'
    },
    {
        type: 'CHAPTER_WISE',
        description: 'Test focused on specific chapters.',
        icon: '📖'
    },
    {
        type: 'TOPIC_WISE',
        description: 'Test focused on a particular topic.',
        icon: '📑'
    },
    {
        type: 'CUSTOM',
        description: 'Custom test created by the user.',
        icon: '🛠️'
    },
    {
        type: 'UNIT_WISE',
        description: 'Test focused on a specific unit.',
        icon: '🗂️'
    },
    {
        type: 'DIFFICULTY_BASED',
        description: 'Test based on difficulty level.',
        icon: '⚖️'
    },
    {
        type: 'RANDOM',
        description: 'Randomly selected questions for variety.',
        icon: '🎲'
    },
    {
        type: 'FLASH',
        description: 'Quick test with fast results.',
        icon: '⚡'
    },
    {
        type: 'AI_GENERATED',
        description: 'AI-generated test tailored to your needs.',
        icon: '🤖'
    },
    {
        type: 'PERFORMANCE_ANALYZER',
        description: 'Test designed to assess performance.',
        icon: '📈'
    },
    {
        type: 'PBQ_BASED',
        description: 'Test focused on practical-based questions (PBQ).',
        icon: '🧩'
    },
    {
        type: 'THEORY_BASED',
        description: 'Test focused on theoretical questions.',
        icon: '📜'
    },
    {
        type: 'REVISION',
        description: 'Test for reviewing learned material.',
        icon: '🔄'
    },
    {
        type: 'RETAKE',
        description: 'Test retake for improving previous scores.',
        icon: '🔁'
    }
];
exports.STREAM_HIERARCHY = [
    {
        name: "PG",
        categories: [
            { name: "NMCLE", affiliations: ["CHAITRA", "KARTIK", "MANGSIR"] }, //adding months coz NMCLE has no affiliation but different months of same year -- might think better something later on
            { name: "USMLE", affiliations: [] },
            { name: "MDMS", affiliations: ["IOM", "KU", "PAHS", "BPKIHS", "NAMS", "CEE"] }
        ]
    },
    {
        name: "UG",
        categories: [
            { name: "MBBS", affiliations: ["IOM", "KU", "PAHS", "BPKIHS", "CEE"] },
            { name: "NURSING", affiliations: ["IOM", "KU"] }
        ]
    },
    // {
    //     name: "LOKSEWA",
    //     categories: [],
    //     affiliations: []
    // },
    // {
    //     name: "IOE",
    //     categories: [
    //         { name: "PU", affiliations: [] },
    //         { name: "TU", affiliations: [] },
    //         { name: "KU", affiliations: [] }
    //     ]
    // }
];
