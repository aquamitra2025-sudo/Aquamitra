const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const moment = require("moment-timezone"); // <-- Import moment for date parsing
const { Schema } = mongoose;

// Define the exact format your dates are currently stored in the JSON file
const DATE_INPUT_FORMAT = "DD-MM-YYYY HH:mm:ss";

// --- Transaction Schema ---
const transactionSchema = new mongoose.Schema({
    userId: String,
    amount: Number,
    // 🔥 FIX 1: Change to Date type so MongoDB stores proper ISO dates
    timestamp: Date 
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
        console.log("Starting seed process...");
        
        // Load kjson file
        const kjsonPath = path.join(__dirname, "user_id_aqm001_365 (1).json"); 
        const kjsonData = JSON.parse(fs.readFileSync(kjsonPath, "utf-8"));

        if (!Array.isArray(kjsonData)) {
            console.error("❌ kjson file must be an array of documents.");
            process.exit(1);
        }

        // 🔥 FIX 2: Pre-process the data to convert the non-standard date strings to Date objects
        const preparedData = kjsonData.map((doc) => {
            // Parse the string using moment and the known format, then convert to a native Date object
            const dateMoment = moment.tz(doc.timestamp, DATE_INPUT_FORMAT, "Asia/Kolkata"); 
            
            // Check for valid parsing (optional but recommended)
            if (!dateMoment.isValid()) {
                console.warn(`⚠️ Invalid date found: ${doc.timestamp}. Skipping or using null.`);
                return { ...doc, timestamp: null };
            }
            
            // Return the document with the correct Date object
            return {
                userId: doc.userId,
                amount: doc.amount,
                timestamp: dateMoment.toDate() // Use .toDate() to get a native JavaScript Date object
            };
        });

        // Insert into Transactions collection
        await transactions.insertMany(preparedData.filter(doc => doc.timestamp !== null));

        console.log(`✅ ${preparedData.length} transaction documents seeded successfully.`);
        process.exit(0); // Success
    } catch (error) {
        console.error("❌ Seeding error:", error);
        process.exit(1); // Failure
    }
}

seed();