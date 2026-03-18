import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./db/index.js";

//process.env is global in Node.js so thats the reason loading it once will work everywhere
dotenv.config({
  path: "./.env",
});

const port = process.env.PORT || 3000;

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`App is listening to the http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error ", err);
    process.exit();
  });
