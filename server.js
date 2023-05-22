require("dotenv").config();
const { PORT = 4000, MONGODB_URL } = process.env;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");

mongoose.connect(MONGODB_URL, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

mongoose.connection
  .on("open", () => console.log("You are connected to mongoose"))
  .on("close", () => console.log("You are disconnected from mongoose"))
  .on("error", (error) => console.log(error));

///////////////////////////////
// MODELS
////////////////////////////////
const WeatherSchema = new mongoose.Schema({
  location: String,
  temperature: String,
})

const Weather = mongoose.model("Weather", WeatherSchema);
///////////////////////////////
// MiddleWare
////////////////////////////////
app.use(cors()); // to prevent cors errors, open access to all origins
app.use(morgan("dev")); // logging
app.use(express.json()); // parse json bodies
app.use(express.urlencoded({ extended: true }));
///////////////////////////////
// ROUTES
////////////////////////////////
// create a test route
app.get("/", (req, res) => {
  res.send("hello world");
});

app.get("/weather", async (req, res) => {
  try {
    res.json(await Weather.find({}));
  } catch (error) {
    res.status(400).json(error)
  }
});

app.post("/weather", async (req, res) => {
  try {
    res.json(await Weather.create(req.body));
  } catch (error) {
    res.status(400).json(error)
  }
});

app.delete("/weather/:id", async (req, res) => {
  try {
    res.json(await Weather.findByIdAndRemove(req.params.id));
  } catch (error) {
    res.status(400).json(error);
  }
});

app.put("/weather/:id", async (req, res) => {
  try {
    res.json(
      await Weather.findByIdAndUpdate(req.params.id, req.body, {
        new: true })
    );
  } catch (error) {
    res.status(400).json(error);
  }
});


///////////////////////////////
// LISTENER
////////////////////////////////
app.listen(PORT, () => console.log(`listening on PORT ${PORT}`));