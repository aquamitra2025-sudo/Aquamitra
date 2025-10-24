const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const { Schema } = mongoose;

// --- Public Schema ---
const transactionSchema = new mongoose.Schema({
    userId: String,
    amount: Number,
    timestamp: String
});

const transactions = mongoose.model("transactions", transactionSchema);

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
    await transactions.deleteMany({});

    // Load kjson file
    const kjsonPath = path.join(__dirname, "user_id_aqm001_365 (1).json"); // <--- replace with your actual filename
    const kjsonData = JSON.parse(fs.readFileSync(kjsonPath, "utf-8"));

    // Insert into Public collection
    if (Array.isArray(kjsonData)) {
      await transactions.insertMany(kjsonData);
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
