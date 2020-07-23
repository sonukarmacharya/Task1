const mongoose = require("mongoose");

const connect = mongoose
  .connect(
    "mongodb+srv://sonu123:sonu123@cluster0.mi3cv.mongodb.net/Project1?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log(`Connected to db successfully`))
  .catch((err) => console.log(`Conection to db error`, err));
