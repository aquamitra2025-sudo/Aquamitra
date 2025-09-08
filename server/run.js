// run.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");
const moment = require('moment-timezone');
const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());


// 3. Print a list of all the available function names (the "keys")
// --- ⚙️ MONGOOSE SETUP ---
mongoose.connect("mongodb+srv://vishveshbece:Vishvesh%402005@cluster0.fwpiw.mongodb.net/Aquamitra?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
).then(() => console.log("MongoDB connected")).catch((error) => console.log("Connection error", error));

// --- ⚙️ MONGOOSE SCHEMAS (Final & Corrected Versions) ---

const userSchema = new mongoose.Schema({
    userid: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    threshold: { type: Number, default: 0 }
});

const publicSchema = new mongoose.Schema({
    userid: String,
    headcout: Number, // Sticking with the typo as standardized
    Country: String, State: String, City: String,
    Address: String, pincode: String
});

const employeeSchema = new mongoose.Schema({
    userid: { type: String, required: true, unique: true },
    Name: { type: String },
    password: { type: String, default: null },
    isRegistered: { type: Boolean, default: false },
    country: String, state: String
});

const transactionSchema = new mongoose.Schema({
    userId: {type: String, required: true},
    amount: Number,
    timestamp: { type: Date, default: Date.now }
});

const complaintSchema = new mongoose.Schema({
    userId: {type: String, required: true},
    complaintType: { type: String, enum: ['Leakage', 'Meter Issue', 'Billing Error', 'No Water Supply', 'Other'], required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ['Submitted', 'In Progress', 'Resolved', 'Closed'], default: 'Submitted' }
}, { timestamps: true });

const User = mongoose.model('user', userSchema);
const Public = mongoose.model('public', publicSchema);
const Employee = mongoose.model('employee', employeeSchema);
const Transaction = mongoose.model('transaction', transactionSchema);
const Complaint = mongoose.model('complaint', complaintSchema);


// --- 🔥 FIREBASE SETUP & LISTENER ---
app.post("/api/users/signup", async (req, res) => {
    const { userid, password } = req.body;
    if (!userid || !password) { return res.status(400).json({ message: "All fields are required." }); }
    try {
        const publicUser = await Public.findOne({ userid });
        if (!publicUser) { return res.status(400).json({ message: "Invalid User ID. Not found in public records." }); }
        const existingUser = await User.findOne({ userid });
        if (existingUser) { return res.status(400).json({ message: "User account already exists." }); }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = new User({ userid, password: hashedPassword });
        await user.save();
        res.status(201).json({ message: "User signup successful" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

app.post("/api/employees/signup", async (req, res) => {
    const { userid, password } = req.body;
    console.log("one");
    if (!userid || !password) { return res.status(400).json({ message: "All fields are required." }); }
    try {
        const employee = await Employee.findOne({ userid });
        console.log(employee);
        if (!employee) { return res.status(404).json({ message: "This Employee ID has not been pre-registered." }); }
        if (employee.password !== null) { return res.status(400).json({ message: "This account's password has already been configured." }); }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        employee.password = hashedPassword;
        await employee.save();
        res.status(200).json({ message: "Account setup successful! You can now log in." });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

app.post('/api/users/login', async (req, res) => {
    const { userid, password } = req.body;
    try {
        const user = await User.findOne({ userid });
        if (!user) { return res.status(401).json({ message: 'Invalid credentials' }); }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) { return res.status(401).json({ message: 'Invalid credentials' }); }
        res.json({ message: 'Login successful' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/api/employees/login', async (req, res) => {
    const { userid, password } = req.body;
    try {
        const employee = await Employee.findOne({ userid });
        if (!employee) { return res.status(401).json({ message: 'Invalid credentials or account not yet set up.' }); }
        const isMatch = await bcrypt.compare(password, employee.password);
        if (!isMatch) { return res.status(401).json({ message: 'Invalid credentials.' }); }
        res.json({ message: 'Login successful' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});


// --- 📊 DASHBOARD & DATA ROUTES ---

app.get('/api/dashboard/:userid', async (req, res) => {
    try {
        const { userid } = req.params;

        // --- NEW: Timezone Handling ---
        // Get the user's timezone from the request headers sent by the frontend.
        const userTimeZone = req.headers['timezone'] || 'Asia/Kolkata'; // Default to India's timezone
        const now = new Date();

        // --- UNCHANGED: User and Public Data Fetching ---
        const user = await User.findOne({ userid });
        if (!user) { return res.status(404).json({ message: 'User not found' }); }
        const publicUser = await Public.findOne({ userid });
        if (!publicUser || !publicUser.headcout) { return res.status(404).json({ message: 'User public data not found.' }); }

        // --- UNCHANGED: Daily Threshold Calculation ---
        const dailyThreshold = 55 * publicUser.headcout;

        // --- CHANGED: Today's Consumption Calculation ---
        const todayStart = moment.tz(userTimeZone).startOf('day').toDate();
        const todaysTransactions = await Transaction.aggregate([
            { $match: { userId: userid, timestamp: { $gte: todayStart } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const todaysConsumption = todaysTransactions.length > 0 ? todaysTransactions[0].total : 0;
        
        // --- CHANGED: Monthly Consumption Calculation ---
        const monthStart = moment.tz(userTimeZone).startOf('month').toDate();
        const monthlyTransactions = await Transaction.aggregate([
            { $match: { userId: userid, timestamp: { $gte: monthStart } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalMonthToDate = monthlyTransactions.length > 0 ? monthlyTransactions[0].total : 0;
        const averageDailyConsumption = totalMonthToDate / now.getDate();

        // --- UNCHANGED: Fetching All Transactions and Complaints ---
        const allTransactions = await Transaction.find({ userId: userid }).sort({ timestamp: -1 });
        const allComplaints = await Complaint.find({ userId: userid }).sort({ createdAt: -1 });
        
        res.json({
            transactions: allTransactions,
            complaints: allComplaints,
            dashboardMetrics: {
                dailyThreshold,
                todaysConsumption, // Will now be correct
                remainingToday: dailyThreshold - todaysConsumption,
                totalMonthToDate, // Will now be correct
                averageDailyConsumption
            }
        });

    } catch (error) {
        console.error('Dashboard API Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// In your server file (e.g., run.js)   
// Replace the entire employee dashboard route
app.get('/api/employee/dashboard/:employeeId', async (req, res) => {
    try {
        const { employeeId } = req.params;
        const { city } = req.query;

        // 1. Find the employee to get their assigned region (Unchanged)
        const employee = await Employee.findOne({ userid: employeeId });
        if (!employee || !employee.state || !employee.country) {
            return res.status(404).json({ message: 'Employee not found or state/country not assigned.' });
        }
        
        // 2. Build the filter for the Publics collection (Unchanged)
        const publicLocationMatch = {
            'Country': employee.country,
            'State': employee.state
        };
        if (city && city !== 'all') {
            publicLocationMatch['City'] = city;
        }
        const matchingPublicDocs = await Public.find(publicLocationMatch);
        const userIdsFromPublic = matchingPublicDocs.map(doc => doc.userid);
        if (userIdsFromPublic.length === 0) {
            return res.json({
                employeeDetails: { name: employee.Name, state: employee.state, country: employee.country },
                cities: [],
                transactions: [] // Return empty array since no users were found
            });
        }
        // This is the final, correctly filtered list.
        const allTransactions = await Transaction.find({ userId: { $in: userIdsFromPublic }
        }).sort({ timestamp: -1 });

        // Get the list of all unique cities for the dropdown (Unchanged)
        const citiesInState = await Public.distinct('City', {
            State: employee.state,
            Country: employee.country
        });
        console.log(allTransactions);
        // 4. Send the response with the correctly found transactions
        res.json({
            employeeDetails: {
                name: employee.Name,
                state: employee.state,
                country: employee.country
            },
            cities: citiesInState.sort(),
            transactions: allTransactions
        });

    } catch (error) {
        console.error('[CRITICAL] An error occurred in the employee dashboard API:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// --- 📝 COMPLAINTS ROUTES ---
app.post('/api/complaints', async (req, res) => {
    const { userid, complaintType, description } = req.body;
    try {
        const user = await User.findOne({ userid });
        if (!user) { return res.status(404).json({ message: 'User not found' }); }
        const newComplaint = new Complaint({ userId: userid, complaintType, description, });
        await newComplaint.save();
        res.status(201).json({ message: 'Complaint submitted successfully', complaint: newComplaint });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});
app.get('/api/complaints/:userid', async (req, res) => {
    const { userid } = req.params;
    try {
        const user = await User.findOne({ userid });
        if (!user) { return res.status(404).json({ message: 'User not found' }); }
        const complaints = await Complaint.find({ userId: userid }).sort({ createdAt: -1 });
        res.json(complaints);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});


// --- 🚀 SERVER START ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));