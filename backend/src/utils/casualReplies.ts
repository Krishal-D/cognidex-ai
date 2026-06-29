type MatchType = "exact" | "contains";

type CasualIntent = {
    keywords: string[];
    match: MatchType;
    reply: string;
};

const intents: CasualIntent[] = [
    {
        keywords: [
            "hi",
            "hii",
            "hello",
            "hey",
            "good morning",
            "good afternoon",
            "good evening",
        ],
        match: "exact",
        reply: "Hi! 👋 I'm DocuSense AI. Ask me anything about your uploaded documents.",
    },
    {
        keywords: [
            "bye",
            "goodbye",
            "see you",
            "see ya",
            "cya",
            "take care",
        ],
        match: "exact",
        reply: "Goodbye! 👋 Come back anytime you need help with your documents.",
    },
    {
        keywords: [
            "thanks",
            "thank you",
            "thank u",
            "thx",
            "ty",
            "tysm",
        ],
        match: "contains",
        reply: "You're welcome! 😊",
    },
    {
        keywords: [
            "sorry",
            "my bad",
            "apologies",
        ],
        match: "contains",
        reply: "No worries at all!",
    },
    {
        keywords: [
            "who are you",
            "what are you",
            "what can you do",
            "help",
        ],
        match: "contains",
        reply: "I'm DocuSense AI. Upload a PDF, select a conversation, and ask questions about the document.",
    },
];

function normalizeMessage(message: string): string {
    return message
        .toLowerCase()
        .trim()
        .replace(/[^\w\s]/g, "")
        .replace(/\s+/g, " ");
}

export function getCasualReply(message: string): string | null {
    const text = normalizeMessage(message);

    for (const intent of intents) {
        const matched = intent.keywords.some((keyword) => {
            if (intent.match === "exact") {
                return text === keyword;
            }

            return text.includes(keyword);
        });

        if (matched) {
            return intent.reply;
        }
    }

    return null;
}