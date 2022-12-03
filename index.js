import express, { json } from "express";
import IpGeolocation from "./api/index.js";

const app = express();

app.use(json({ extended: false }));

app.use("/api", IpGeolocation);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server is running in port ${PORT}`));