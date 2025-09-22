const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { GoogleGenerativeAI } = require('@google/generative-ai');
const express = require("express");
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));
app.use(cors());

// Initialize Google Generative AI
const apiKey = process.env.GOOGLE_API_KEY;
if (!apiKey) {
    console.error('GOOGLE_API_KEY environment variable is not set');
    console.log('Make sure you have a .env file in the root directory with GOOGLE_API_KEY=your_api_key');
    process.exit(1);
}

console.log('API Key loaded successfully');
const genAI = new GoogleGenerativeAI(apiKey);

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// AI endpoint
app.post("/ai", async (req, res) => {
    try {
        const { prompt } = req.body;
        
        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        const systemInstruction = `ROLE: You are Detective Neil Holmes, a seasoned investigator known for your sharp mind and attention to detail. You've been called to investigate the murder of Lord Reginald Ashworth at Ashworth Manor.

        PERSONALITY:
        - Speak in first-person as Detective Neil Holmes
        - Maintain a professional but approachable tone
        - Be methodical and detail-oriented
        - Show confidence in your deductions
        - Be respectful but firm when questioning suspects

        CASE DETAILS:
        VICTIM: Lord Reginald Ashworth (65, wealthy industrialist)
        CAUSE OF DEATH: Stab wound with his own silver letter opener
        TIME OF DEATH: Around 11:45 PM (based on stopped clock)

        SUSPECTS:
        1. Lady Victoria Ashworth - The widow, heard arguing with victim earlier
        2. Mr. Charles Wainwright - Business partner, company in financial trouble
        3. Mrs. Eleanor Vance - Longtime housekeeper, about to be let go
        4. Mr. James Fletcher - Gardener, had a personal grudge against the victim

        EVIDENCE:
        - Murder weapon: Silver letter opener (wiped clean)
        - Stopped grandfather clock at 11:45 PM
        - Shattered antique vase near the desk
        - Signs of a struggle (overturned chair)

        INSTRUCTIONS:
        1. Begin by introducing yourself and the case when first addressed
        2. Guide the player through the investigation step by step
        3. When presenting information, use clear, organized formatting
        4. Ask probing questions to help uncover the truth
        5. Point out inconsistencies in alibis or evidence
        6. Suggest possible next steps in the investigation
        7. When the player seems stuck, offer subtle hints
        8. Only reveal key information when the player has uncovered sufficient evidence
        9. If the player makes an incorrect accusation, explain why it doesn't fit the evidence
        10. Maintain the mystery until the player has gathered enough clues to solve the case

        FORMATTING:
        - Use bullet points for lists of evidence or suspects
        - Separate different sections clearly with line breaks
        - Keep responses concise but detailed`;

        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            systemInstruction: systemInstruction
        });

        // Format the prompt with the system instruction
        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: systemInstruction }]
                },
                {
                    role: "model",
                    parts: [{ 
                        text: "Right then. Detective Neil Holmes reporting for duty. We've got a murder on our hands at Ashworth Manor.\n\n" +
                        "VICTIM\n" +
                        "Name: Lord Reginald Ashworth\n" +
                        "Age: 65\n" +
                        "Occupation: Wealthy industrialist\n" +
                        "Time of Death: Approximately 11:45 PM (based on stopped grandfather clock)\n\n" +
                        "CAUSE OF DEATH\n" +
                        "- Stab wound to the chest\n" +
                        "- Weapon: Victim's own silver letter opener\n" +
                        "- Weapon was wiped clean of fingerprints\n\n" +
                        "SCENE OF THE CRIME\n" +
                        "Location: Lord Ashworth's study at Ashworth Manor\n\n" +
                        "Notable Evidence:\n" +
                        "- Stopped grandfather clock (11:45 PM)\n" +
                        "- Shattered antique vase near the desk\n" +
                        "- Signs of a struggle (overturned chair)\n\n" +
                        "\nSUSPECTS\n" +
                        "----------------------------------------\n" +
                        "- SUSPECT: Lady Victoria Ashworth (The Widow)\n" +
                        "  • Heard arguing with victim earlier in the evening\n" +
                        "  • Potentially stands to inherit a significant amount\n\n" +
                        "- SUSPECT: Mr. Charles Wainwright (Business Partner)\n" +
                        "  • Company is in financial trouble\n" +
                        "  • Was seen leaving the study around time of death\n" +
                        "  • Would gain full control of the company\n\n" +
                        "- SUSPECT: Mrs. Eleanor Vance (Housekeeper)\n" +
                        "  • 30 years of service at the manor\n" +
                        "  • About to be let go without pension\n" +
                        "  • Claims to have been in the kitchen alone\n\n" +
                        "- SUSPECT: Mr. James Fletcher (Gardener)\n" +
                        "  • Had a personal grudge against the victim\n" +
                        "  • Fresh cut on his right hand\n" +
                        "  • Muddy boots at the time of questioning\n" +
                        "  • His daughter was recently involved with the victim\n\n" +
                        "NEXT STEPS\n" +
                        "1. Review alibis of all suspects\n" +
                        "2. Examine the murder weapon for any missed evidence\n" +
                        "3. Check the security footage (if available)\n" +
                        "4. Interview each suspect individually\n\n" +
                        "Where would you like to begin, detective?"
                    }]
                }
            ]
        });

        // Send the user's prompt
        const result = await chat.sendMessage(prompt);
        const response = await result.response;
        const text = response.text();
        
        res.json({ response: text });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ 
            error: 'An error occurred while processing your request',
            details: error.message 
        });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Open http://localhost:${PORT} in your browser`);
});
