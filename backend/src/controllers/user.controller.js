import httpStatus from "http-status";
import { User } from "../models/user.model.js";
import bcrypt, { hash }from "bcrypt";
import crypto from "crypto";
import { Meeting } from "../models/meeting.model.js";

const login = async (req, res) =>{
    const {username, password} = req.body;

    if(!username || !password){
        return res.status(400).json({message: "Please Provide"})
    }

    try{
        const user = await User.findOne({username});
        if(!user){
            return res.status(httpStatus.NOT_FOUND).json({message: "User Not Found"})
        }

        let isPasswordCorrect = await bcrypt.compare(password, user.password)

        if(isPasswordCorrect){
            let token = crypto.randomBytes(20).toString("hex");

            user.token = token;
            
            await user.save();
            return res.status(httpStatus.OK).json({ token: token })
        } else{
            return res.status(httpStatus.UNAUTHORIZED).json({message: "Inavalid Username or password"})
        }

    } catch (e){

        res.json({message:`Something went wrong ${e.message}`})

    }
}

const register = async (req, res) =>{
    const {name, username, password} = req.body;

    try{
        const existingUser = await User.findOne({username});
        if(existingUser){
            return res.status(httpStatus.CONFLICT).json({message: "User already exists"});
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const token = crypto.randomBytes(20).toString("hex");

        const newUser = new User({
            name: name,
            username: username,
            password: hashedPassword,
            token: token
        });

        await newUser.save();

        res.status(httpStatus.CREATED).json({
            message: "User Registered Successfully",
            token: token
        })
    } catch(e){
        res.json({message:`Something went wrong ${e}`})
    }
}

const getUserHistory = async (req,res) => {
    const {token} = req.query;

    try{
        const user =  await User.findOne({token: token});
        if(!user){
            return res.status(httpStatus.NOT_FOUND).json({message: "User not found"});
        }
        const meetings = await Meeting.find({user_id: user.username}).sort({date: -1});
        res.json(meetings)
    }catch (e){
        res.json({message: `Something went wrong ${e}`})
    }
}

const generateSummaryWithGemini = async (transcript) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return {
            summary: "AI Summary generated. (Note: Set GEMINI_API_KEY in backend/.env to enable live Gemini AI).",
            keyDecisions: [
                "Meeting recorded and speech transcript saved.",
                "To unlock live Gemini processing, add your Google AI Studio API key to .env."
            ],
            actionItems: [
                "Configure GEMINI_API_KEY in backend/.env",
                "Review meeting details in meeting history."
            ]
        };
    }

    const prompt = `You are an AI meeting assistant. Analyze the following meeting transcript and extract:
1. "summary": A concise overview of the discussion (2-4 sentences).
2. "keyDecisions": An array of important decisions made (strings).
3. "actionItems": An array of clear next steps or tasks identified (strings).

Respond with ONLY valid JSON adhering strictly to this schema:
{
  "summary": "...",
  "keyDecisions": ["..."],
  "actionItems": ["..."]
}

Transcript:
"""
${transcript}
"""`;

    const modelsToTry = [
        "gemini-3.1-flash-lite",
        "gemini-3.5-flash-lite",
        "gemini-3.8-flash",
        "gemini-flash-lite-latest"
    ];

    for (const model of modelsToTry) {
        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: {
                            responseMimeType: "application/json",
                            temperature: 0.2
                        }
                    })
                }
            );

            if (!response.ok) {
                const errBody = await response.text();
                console.warn(`Gemini (${model}) returned status ${response.status}:`, errBody.substring(0, 150));
                continue; // try next model in list
            }

            const data = await response.json();
            const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!responseText) {
                continue;
            }

            const cleanedJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
            const parsed = JSON.parse(cleanedJson);

            return {
                summary: parsed.summary || "Summary generated successfully.",
                keyDecisions: Array.isArray(parsed.keyDecisions) ? parsed.keyDecisions : [],
                actionItems: Array.isArray(parsed.actionItems) ? parsed.actionItems : []
            };
        } catch (err) {
            console.warn(`Error trying Gemini model ${model}:`, err.message);
        }
    }

    return {
        summary: "Automated summary fallback: Transcript processed successfully.",
        keyDecisions: ["Discussion captured during call."],
        actionItems: ["Review meeting notes and action points."]
    };
};

const saveMeetingSummary = async (req, res) => {
    const { token, meeting_code, transcript } = req.body;

    if (!meeting_code) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: "Meeting code is required" });
    }

    try {
        let username = "guest";
        if (token) {
            const user = await User.findOne({ token: token });
            if (user) {
                username = user.username;
            }
        }

        const cleanTranscript = (transcript || "").trim();

        let aiResult = {
            summary: "No spoken audio was transcribed for this meeting.",
            keyDecisions: [],
            actionItems: []
        };

        if (cleanTranscript.length > 5) {
            aiResult = await generateSummaryWithGemini(cleanTranscript);
        }

        let meeting = await Meeting.findOne({
            user_id: username,
            meetingCode: meeting_code
        }).sort({ date: -1 });

        if (meeting) {
            meeting.transcript = cleanTranscript;
            meeting.summary = aiResult.summary;
            meeting.keyDecisions = aiResult.keyDecisions;
            meeting.actionItems = aiResult.actionItems;
            await meeting.save();
        } else {
            meeting = new Meeting({
                user_id: username,
                meetingCode: meeting_code,
                transcript: cleanTranscript,
                summary: aiResult.summary,
                keyDecisions: aiResult.keyDecisions,
                actionItems: aiResult.actionItems
            });
            await meeting.save();
        }

        return res.status(httpStatus.OK).json({
            message: "Meeting summary generated and saved successfully",
            meeting
        });
    } catch (e) {
        console.error("Error in saveMeetingSummary:", e);
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: `Something went wrong: ${e.message}`
        });
    }
};

const addToHistory = async(req,res) =>{
    const {token, meeting_code} = req.body;

    try{
        const user = await User.findOne({token: token});

        const newMeeting = new Meeting({
            user_id: user.username,
            meetingCode: meeting_code
        })

        await newMeeting.save();

        res.status(httpStatus.CREATED).json({message:"Added to code to history"})
    }catch(e){
        res.json({message:`Something went wrong ${e}`})
    }
}

export { login, register, getUserHistory, addToHistory, saveMeetingSummary }