import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
// import

dotenv.config()

const app=express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
    res.send("Hello, Backend is running!");
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});