const express = require("express");

const app = express();
const Db = require("./Db_config/Connect");

const api = require("./routes/index");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/api", api);
const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server is connected at port ${PORT}`));
