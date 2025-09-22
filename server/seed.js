const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const { Schema } = mongoose;

// --- Public Schema ---
const publicSchema = new Schema({
  userid: { type: String, required: true, unique: true },
  headcout: Number,
  Country: String,
  State: String,
  City: String,
  Address: String,
  pincode: String,
});

const Public = mongoose.model("public", publicSchema);

// --- Mongo Connection ---
mongoose
  .connect(
    "mongodb+srv://vishveshbece:Vishvesh%402005@cluster0.fwpiw.mongodb.net/Aquamitra?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("MongoDB connected for seeding"))
  .catch((err) => console.error(err));

async function seed() {
  try {
    // Clear old Public data
    await Public.deleteMany({});

    // Load kjson file
    const kjsonPath = path.join(__dirname, "data.json"); // <--- replace with your actual filename
    const kjsonData = JSON.parse(fs.readFileSync(kjsonPath, "utf-8"));

    // Insert into Public collection
    if (Array.isArray(kjsonData)) {
      await Public.insertMany(kjsonData);
    } else {
      console.error("❌ kjson file must be an array of Public documents");
    }

    console.log("✅ Public data seeded from kjson file.");
    process.exit();
  } catch (error) {
    console.error("❌ Seeding error:", error);
    process.exit(1);
  }
}

seed();
