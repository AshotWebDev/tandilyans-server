import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
// import uuid from "uuid"

config()
const app = express();

app.use(cors())

app.use(express.json());


app.listen(process.env.PORT, () => {
    console.log("Server started on port 4000");
});
