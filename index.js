import cors from 'cors'
import { configDotenv } from 'dotenv';
// import http from 'node:http';
// import express from "express";
// import { Server } from 'socket.io'
// import { fileURLToPath } from 'node:url';
// import { dirname, join } from 'node:path';
// const app = express();
// const server = http.createServer(app);

// const socket = new Server(server);

// const __dirname = dirname(fileURLToPath(import.meta.url));

// app.use(cors);
// app.get('/', (req, res) => {
//     console.log("get request")
//     res.sendFile(join(__dirname, 'index.html'))
// })

// socket.on('connection', (soc) => {
//     console.log("socket connected", soc.connected)
// })

// server.listen(8000, () => {
//     console.log("server started at 8000 port")
// })
import { GoogleGenerativeAI } from '@google/generative-ai'
import express from 'express';
const app = express();
configDotenv();
app.use(cors());
app.use(express.json());
const API_KEY = process.env.GOOGLE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
app.get('/', (req, res) => {
    res.send("Hello World")
})
app.post('/generate', async (req, res) => {
    try {
        const { prompt } = req.body;
        const result = await model.generateContentStream(prompt);
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Transfer-Encoding', 'chunked');
        for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            res.write(chunkText);
        }
        res.end();
    } catch (error) {
        res.send(error.message)
    }
    // res.json({ result: result.response.text() })
})
app.post('/chat', async (req, res) => {
    try {
        const chat = model.startChat({
            history: req.body.history,
        });
        let result = await chat.sendMessageStream(req.body.message);
        for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            res.write(chunkText);
        }
        res.end();
    } catch (error) {
        console.log(error.message)
    }
})
app.listen(8000, () => {
    console.log("server started at 8000 port")
})