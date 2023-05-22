require("dotenv").config();
const { PORT = 4000, MONGODB_URL, GOOGLE_CREDENTIALS } = process.env;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const admin = require("firebase-admin");
const serviceAccount = JSON.parse(GOOGLE_CREDENTIALS);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
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
const weatherSchema = new mongoose.Schema({
  zip: String,
  temperature: String,
  uid: String,
})

const Weather = mongoose.model("Weather", weatherSchema);
///////////////////////////////
// MiddleWare
////////////////////////////////
app.use(cors()); // to prevent cors errors, open access to all origins
app.use(morgan("dev")); // logging
app.use(express.json()); // parse json bodies
app.use(express.urlencoded({ extended: true }));

app.use(async function(req, res, next) {
  try {
    const token = req.get('Authorization');
    if(!token) return next();
    
    const user = await admin.auth().verifyIdToken(token.replace('Bearer ',''));
    if(!user) throw new Error('something went wrong');

    req.user = user;
    next();
  } catch (error) {
    res.status(400).json(error);
  }
});

function isAuthenticated(req, res, next) {
  if(!req.user) return res.status(401).json({message: 'you must be logged in first!'});
  next();
}
///////////////////////////////
// ROUTES
////////////////////////////////
// create a test route
app.get("/", (req, res) => {
  res.send("hello world");
});

app.get("/weather", isAuthenticated, async (req, res) => {
  try {
    req.body.uid = req.user.uid;
    res.json(await Weather.find({uid: req.user.uid}));
  } catch (error) {
    res.status(400).json(error)
  }
});

app.post("/weather", isAuthenticated, async (req, res) => {
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