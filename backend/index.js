import express from "express";

const app = express();

app.get("/", (req, res) => {
    res.send("Welcome to backend server of Hostelia");
})

app.post("/create-user", (req, res) => {
    const { name, email, password } = req.body;
    console.log(name, email, password);
    res.send("User created successfully");
})

app.listen(3000, () => {
    console.log("Server is running on port 3000");
})