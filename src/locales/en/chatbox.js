export default {
    systemMessage: {
        welcome: "Welcome to the Molecular Universe. How can I help you today?"
    },
    input: {
        placeholder: "Ask me anything, as long as it's about batteries, and we will return molecules that answer your questions and suggest their friends for you to explore further.",
        sendButton: "Send"
    },
    checkboxes: {
        ignoreChatHistory: "Ignore chat history",
        disableLiteratureSearch: "Disable literature search"
    },
    queryLimit: {
        queriesRemaining: "Queries remaining this month:",
        reachedLimit: "You have reached your monthly query limit. Please contact an administrator for assistance."
    },
    status: {
        thinking: "thinking",
        searching: "searching",
        searchingDatabase: "searching our database"
    },
    buttons: {
        findMolecules: "Find Molecules",
        findSimilarMolecules: "Find Similar Molecules",
        addToFavorites: "Add to Favorites ★",
        copy: "📋",
        cancel: "Cancel",
        submit: "Submit"
    },
    molecules: {
        llmFoundMolecules: "LLM Found Molecules",
        friendsRankedBy: "Friends ranked by likelihood to replace",
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
        rateMatch: "Rate this match:"
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
    }
}; 