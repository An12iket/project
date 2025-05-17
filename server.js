const mongoose = require('mongoose');
const express = require("express");
const cors = require('cors');
const app = express();
const PORT = 3000;
require('dotenv').config();

mongoose.connect(process.env.MONGO_URL)
app.use(cors());
app.use(express.json());

const authRouter = require("./routes/auth");
app.use("/api", authRouter);

app.listen(PORT, () => {
  console.log(`Server listening on PORT ${PORT}`);
});