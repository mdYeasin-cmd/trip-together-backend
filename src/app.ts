import express from "express";
import { UserRoutes } from "./app/modules/User/user.route";

// configure app
const app = express();

// parser
app.use(express.json());

app.use("/api", UserRoutes);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

export default app;
