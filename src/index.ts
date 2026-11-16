import express, {Request, Response} from "express";
import { initDatabase } from "./database.js";

initDatabase();

const app = express();
const port = 3000;

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
    res.send("Hello World!");
});

app.listen(port, (error) => {
    console.log(`🚀 QG de Rotina ativo em http://localhost:${port}`);
});