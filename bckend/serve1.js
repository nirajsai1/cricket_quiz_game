import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
const app =express();
app.use(express.json());
app.use(cors());
dotenv.config();
const server = new http.createServer(Server);
const PORT=process.env.MONGO_URI;
server.listen()
app.listen()