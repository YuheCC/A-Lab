export default {
    systemMessage: {
        welcome: "Welcome to the Molecular Universe. How can I help you today?"
    },
    input: {
        placeholder: "Ask me anything, as long as it's about batteries, battery chemistry, or related topics.",
        sendButton: "Send"
    },
    checkboxes: {
        ignoreChatHistory: "Ignore chat history",
        disableLiteratureSearch: "Disable literature search",
        enterDeepSpace: "Enter Deep Space (BETA)",
        deepSpaceTooltip: "A team of LLM agents that analyze your battery question, scour the literature and our molecule database, then collaborate to craft a research‑grade answer. Expect response times between 10-20 minutes.",
        admin: "ADMIN"
    },
    queryLimit: {
        queriesRemaining: "Queries remaining this month:",
        reachedLimit: "You have reached your monthly query limit. Please contact an administrator for assistance."
    },
    status: {
        thinking: "thinking",
        searching: "searching",
        searchingDatabase: "searching our database",
        thinkingForSeconds: "thinking for {{seconds}} s",
        noMoleculesFound: "No molecules found.",
        findMoleculesFailed: "Failed to find molecules. Please try again later.",
        clarifyingQuestions: "We may ask you to reply to a few clarifying questions shortly.",
        deepSpaceWorking: "The Deep Space Multi-Agent LLM is now working, it may take 10-20 minutes to respond, depending on the complexity of your question."
    },
    buttons: {
        findMolecules: "Find Molecules",
        findSimilarMolecules: "Find Similar Molecules",
        addToFavorites: "Add To Favorites",
        copy: "Copy",
        cancel: "Cancel",
        submit: "Submit",
        viewInMolPort: "View in MolPort"
    },
    molecules: {
        llmFoundMolecules: "LLM Found Molecules",
        friendsRankedBy: "Friends ranked by likelihood to replace:",
        name: "Name",
        smiles: "SMILES",
        molecularWeight: "Molecular weight",
        homo: "HOMO",
        lumo: "LUMO",
        espMax: "ESP Max",
        espMin: "ESP Min",
        functionalGroups: "Functional groups",
        predictedMP: "Predicted MP",
        predictedBP: "Predicted BP",
        llmGrade: "LLM Grade",
        saving: "Saving...",
        rateMatch: "Rate this match:",
        detectedChemicalKeywords: "Detected chemical keywords in LLM response:",
        searchingForFriends: "Searching for friends"
    },
    feedback: {
        goodMatch: "What makes this a good match?",
        badMatch: "Why is this not a good match?",
        placeholder: "Your feedback helps us improve molecule matching",
        thankYou: "Thank you for your feedback!"
    },
    success: {
        addedToFavorites: "Molecule added to favorites successfully!",
        alreadyInFavorites: "Molecule already in favorites",
        feedbackSubmitted: "Failed to submit feedback. Please try again."
    },
    errors: {
        networkError: "Network response was not ok",
        batteryRelevance: "Your question isn't relevant to batteries or battery chemistry. Please ask a battery-related question.",
        moleculeDetailsError: "Error fetching molecule details:",
        similarMoleculesError: "Error finding similar molecules:",
        queryLimitError: "Failed to fetch query limit",
        addToFavoritesError: "Failed to add to favorites",
        loginRequired: "You must be logged in to add favorites",
        feedbackError: "Error submitting feedback:",
        copyError: "Failed to copy:"
    },
    history: {
        title: "Your Chats",
        createNewChat: "Create New Chat",
        newChat: "New Chat",
        confirmDelete: "Are you sure you want to delete this chat?",
        cancel: "Cancel",
        delete: "Delete",
        footer: "Chat history shows the last 20 chats you've had."
    }
}; 