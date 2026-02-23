// Controllers/chatController.js
const Chat = require('../Models/Chat.model');
const axios = require('axios');

const startNewChat = async (req, res) => {
    try {
        const patient_Id = req.PatientId; // From middleware

        // Attempt to create the chat
        const newChat = await Chat.create({ 
            patient_Id, 
            messages: [] 
        });
        
        // Return the _id as the session ID
        return res.status(201).json({ sessionId: newChat._id });

    } catch (error) {
        // --- SELF-HEALING LOGIC ---
        // If we get the specific "Duplicate Key" error for "sessionId_1"
        if (error.code === 11000 && error.message.includes('sessionId_1')) {
            console.warn("⚠️ Detected phantom index 'sessionId_1'. Removing it now...");
            try {
                // 1. Drop the bad index
                await Chat.collection.dropIndex('sessionId_1');
                console.log("✅ Index dropped. Retrying creation...");
                
                // 2. Retry creating the chat
                const retryChat = await Chat.create({ 
                    patient_Id: req.PatientId, 
                    messages: [] 
                });
                return res.status(201).json({ sessionId: retryChat._id });

            } catch (retryError) {
                console.error("❌ Failed to fix index:", retryError.message);
                return res.status(500).json({ error: "Database needs manual repair. Drop 'chats' collection." });
            }
        }
        
        console.error("Start Chat Error:", error.message);
        res.status(500).json({ error: "Failed to start session" });
    }
};

// --- 2. SEND MESSAGE ---
const SendMessage = async (req, res) => {
    try {
        const { question, session_id } = req.body;
        const patient_Id = req.PatientId;

        if (!question || !session_id) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // A. Call Python/FastAPI AI
        let aiResponse = { answer: "AI unavailable", sources: [] };
        try {
            const fastAiRes = await axios.post('http://127.0.0.1:8000/chat', {
                question: String(question),
                session_id: String(session_id)
            });
            aiResponse = fastAiRes.data;
        } catch (err) {
            console.error("AI Service Error:", err.message);
            aiResponse.answer = "I am currently offline. Please try again later.";
        }

        // B. Save to Database (Push to History)
        const updatedChat = await Chat.findOneAndUpdate(
            { _id: session_id, patient_Id: patient_Id }, // Ensure patient owns this chat
            { 
                $push: { 
                    messages: { 
                        $each: [
                            { sender: 'patient', text: question },
                            { sender: 'ai', text: aiResponse.answer, sources: aiResponse.sources || [] }
                        ]
                    } 
                } 
            },
            { new: true }
        );

        if (!updatedChat) {
            return res.status(404).json({ error: "Session not found" });
        }

        res.json({ 
            answer: aiResponse.answer, 
            sources: aiResponse.sources, 
            session_id 
        });

    } catch (error) {
        console.error("SendMessage Error:", error.message);
        res.status(500).json({ error: "Server Error" });
    }
};

// --- 3. GET PATIENT HISTORY (For your future use) ---
const getPatientHistory = async (req, res) => {
    try {
        const patient_Id = req.PatientId;
        // Find all chats for this patient, newest first
        const history = await Chat.find({ patient_Id }).sort({ createdAt: -1 });
        res.json({ status: 1, history });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { startNewChat, SendMessage, getPatientHistory };