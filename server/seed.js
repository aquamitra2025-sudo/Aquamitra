const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

// -------------------------------------------------------------------
// Employee Schema and Model
// -------------------------------------------------------------------

const employeeSchema = new mongoose.Schema({
    userid: { type: String, required: true, unique: true },
    Name: { type: String },
    password: { type: String, default: null },
    isRegistered: { type: Boolean, default: false },
    country: String,
    state: String
});

// Create the Employee Model
const Employee = mongoose.model("Employee", employeeSchema);

// -------------------------------------------------------------------
// Mongo Connection
// -------------------------------------------------------------------

mongoose
    .connect(
        "mongodb+srv://vishveshbece:Vishvesh%402005@cluster0.fwpiw.mongodb.net/Aquamitra?retryWrites=true&w=majority",
        { useNewUrlParser: true, useUnifiedTopology: true }
    )
    .then(() => console.log("MongoDB connected for seeding"))
    .catch((err) => console.error(err));

// -------------------------------------------------------------------
// Seed Function with Employee Data Insertion
// -------------------------------------------------------------------

async function seed() {
    try {
        console.log("Starting employee seed process...");

        // Employee data to insert
        const employeeData = {
            userid: 'aqmgvt001',
            Name: 'gunaalan',
            // password and isRegistered will use the default values (null and false)
            country: 'India',
            state: 'Tamil Nadu'
        };

        // Use findOneAndUpdate with upsert: true to insert or update the employee
        const result = await Employee.findOneAndUpdate(
            { userid: employeeData.userid },
            employeeData,
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        if (result) {
            console.log(`✅ Employee '${employeeData.Name}' (ID: ${employeeData.userid}) seeded/updated successfully.`);
        } else {
            console.error("❌ Failed to seed employee data.");
        }
        
        process.exit(0); // Success
    } catch (error) {
        console.error("❌ Seeding error:", error);
        process.exit(1); // Failure
    }
}

seed();