const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const moment = require('moment-timezone'); // Used for timezone-aware calculations
const app = express();

// Configuration
// **SECURITY WARNING**: In a production environment, it's safer to use an environment variable for the origin.
app.use(cors({ origin: "https://aquamitra-ten.vercel.app" })); 
app.use(express.json());

// --- ⚙️ MONGOOSE SETUP ---
// **SECURITY WARNING**: Never hardcode credentials in source code. Use environment variables (process.env.DB_URI).
mongoose.connect("mongodb+srv://vishveshbece:Vishvesh%402005@cluster0.fwpiw.mongodb.net/Aquamitra?retryWrites=true&w=majority")
    .then(() => console.log("MongoDB connected"))
    .catch((error) => console.error("Connection error to MongoDB:", error));

// --- ⚙️ MONGOOSE SCHEMAS ---

const userSchema = new mongoose.Schema({
    userid: { type: String, required: true, unique: true },
    // Password should be marked as select: false in a real app, 
    // but it's okay here since it's only retrieved for login/signup checks.
    password: { type: String, required: true }, 
    threshold: { type: Number, default: 0 }
});

const publicSchema = new mongoose.Schema({
    userid: { type: String, required: true, unique: true }, // Added required and unique for good practice
    headcout: Number,
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
    userId: {type: String, required: true, index: true},
    amount: Number,
    timestamp: { type: Date, default: Date.now } // MongoDB stores this in UTC (ISO 8601)
});

const complaintSchema = new mongoose.Schema({
    userId: {type: String, required: true, index: true},
    complaintType: { type: String, enum: ['Leakage', 'Meter Issue', 'Billing Error', 'No Water Supply', 'Other'], required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ['Submitted', 'In Progress', 'Resolved', 'Closed'], default: 'Submitted' }
}, { timestamps: true }); // timestamps: true adds createdAt and updatedAt fields

const User = mongoose.model('user', userSchema);
const Public = mongoose.model('public', publicSchema);
const Employee = mongoose.model('employee', employeeSchema);
const Transaction = mongoose.model('transaction', transactionSchema);
const Complaint = mongoose.model('complaint', complaintSchema);


// ===================================
//              🔥 API ROUTES
// ===================================

// --- AUTHENTICATION ---

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
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.post("/api/employees/signup", async (req, res) => {
    const { userid, password } = req.body;
    if (!userid || !password) { return res.status(400).json({ message: "All fields are required." }); }
    try {
        const employee = await Employee.findOne({ userid });
        if (!employee) { return res.status(404).json({ message: "This Employee ID has not been pre-registered." }); }
        if (employee.password !== null) { return res.status(400).json({ message: "This account's password has already been configured." }); }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        employee.password = hashedPassword;
        await employee.save();
        res.status(200).json({ message: "Account setup successful! You can now log in." });
    } catch (error) {
        console.error(error);
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
        // **SECURITY**: In a real app, return a JWT token here, not just a success message.
        res.json({ message: 'Login successful' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/api/employees/login', async (req, res) => {
    const { userid, password } = req.body;
    try {
        const employee = await Employee.findOne({ userid });
        if (!employee || !employee.password) { return res.status(401).json({ message: 'Invalid credentials or account not yet set up.' }); }
        const isMatch = await bcrypt.compare(password, employee.password);
        if (!isMatch) { return res.status(401).json({ message: 'Invalid credentials.' }); }
        // **SECURITY**: In a real app, return a JWT token here, not just a success message.
        res.json({ message: 'Login successful' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// --- SENSOR DATA RECEIPT ---

app.post('/api/sensordata', async (req, res) => {
    const { userid, DO, Temp } = req.body; // DO is water consumption (Dissolved Oxygen is irrelevant here)

    if (!userid || !DO) {
        return res.status(400).json({ message: "Missing required fields: userid and DO are required." });
    }

    try {
        const consumptionAmount = parseFloat(DO);
        if (isNaN(consumptionAmount)) {
            return res.status(400).json({ message: "Invalid 'DO' value. Must be a number." });
        }

        const newTransaction = new Transaction({
            userId: userid,
            amount: consumptionAmount
        });

        await newTransaction.save();
        
        res.status(201).json({ message: 'Sensor data received and saved successfully.' });

    } catch (error) {
        console.error('Error saving sensor data:', error);
        res.status(500).json({ message: 'Internal server error while saving data.' });
    }
});

// ===================================
//      📊 DASHBOARD & DATA ROUTES
// ===================================

app.get('/api/dashboard/:userid', async (req, res) => {
    try {
        const { userid } = req.params;
        // Default to a common timezone (e.g., UTC or Asia/Kolkata) if header is missing
        const userTimeZone = req.headers['timezone'] || 'Asia/Kolkata'; 
        const nowMoment = moment.tz(userTimeZone); // Current time in user's timezone

        const user = await User.findOne({ userid });
        if (!user) { return res.status(404).json({ message: 'User not found' }); }
        
        const publicUser = await Public.findOne({ userid });
        // Use 4 as a fallback headcount if data is missing
        const headCount = publicUser ? (publicUser.headcout || 4) : 4; 
        
        const dailyThreshold = 55 * headCount; // 55 Litres per person per day (Lpcd)
        
        // --- 1. Calculate Today's Consumption (Timezone-Aware) ---
        // Get the UTC equivalent of the start of TODAY in the user's timezone.
        const todayStartUTC = nowMoment.clone().startOf('day').toDate();
        
        const todayConsumptionResult = await Transaction.aggregate([
            { 
                $match: { 
                    userId: userid, 
                    timestamp: { $gte: todayStartUTC } // Filter based on UTC time >= local start of day
                } 
            },
            { 
                $group: { 
                    _id: null, 
                    totalConsumption: { $sum: '$amount' } 
                } 
            }
        ]);

        const todaysConsumption = todayConsumptionResult.length > 0 ? todayConsumptionResult[0].totalConsumption : 0;
        
        // --- 2. Calculate Month-to-Date (Timezone-Aware) ---
        // Get the UTC equivalent of the 1st day of the current month in the user's timezone
        const monthStartUTC = nowMoment.clone().startOf('month').toDate();
        
        const monthConsumptionResult = await Transaction.aggregate([
            { 
                $match: { 
                    userId: userid, 
                    timestamp: { $gte: monthStartUTC } 
                } 
            },
            { 
                $group: { 
                    _id: null, 
                    totalMonthToDate: { $sum: '$amount' } 
                } 
            }
        ]);

        const totalMonthToDate = monthConsumptionResult.length > 0 ? monthConsumptionResult[0].totalMonthToDate : 0;
        
        const daysPassed = nowMoment.date(); // Current day of the month (1-31)
        const averageDailyConsumption = totalMonthToDate / daysPassed;

        // --- 3. Fetch and Format Transactions & Complaints ---
        
        const rawTransactions = await Transaction.find({ userId: userid }).sort({ timestamp: -1 }).lean();
        
        // **FIX for Moment.js Warning:** // We assume t.timestamp is a Date object from MongoDB, so no format string is needed.
        // If the error was truly happening here, it means t.timestamp was an unformatted string.
        // We will keep the original (correct) logic for a Date object:
        const formattedTransactions = rawTransactions.map(t => {
            // t.timestamp is a Date object (ISO format from MongoDB), moment.tz handles this correctly.
            const momentObject = moment.tz(t.timestamp, userTimeZone); 
            return {
                ...t,
                // Apply the desired frontend format (DD-MM-YYYY HH:mm:ss)
                timestamp: momentObject.format('DD-MM-YYYY HH:mm:ss')
            };
        });
        
        const allComplaints = await Complaint.find({ userId: userid }).sort({ createdAt: -1 });
        
        res.json({
            transactions: formattedTransactions,
            complaints: allComplaints,
            dashboardMetrics: {
                dailyThreshold: parseFloat(dailyThreshold.toFixed(2)),
                todaysConsumption: parseFloat(todaysConsumption.toFixed(2)),
                remainingToday: parseFloat((dailyThreshold - todaysConsumption).toFixed(2)),
                totalMonthToDate: parseFloat(totalMonthToDate.toFixed(2)),
                averageDailyConsumption: parseFloat(averageDailyConsumption.toFixed(2))
            }
        });

    } catch (error) {
        console.error('Dashboard API Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/api/employee/dashboard/:employeeId', async (req, res) => {
    try {
        const { employeeId } = req.params;
        const { city } = req.query;

        const employee = await Employee.findOne({ userid: employeeId });
        if (!employee || !employee.state || !employee.country) {
            return res.status(404).json({ message: 'Employee not found or state/country not assigned.' });
        }
        
        // Build the filter for the Publics collection
        const publicLocationMatch = {
            Country: employee.country,
            State: employee.state
        };
        if (city && city !== 'all') {
            publicLocationMatch.City = city;
        }

        // 1. Find all matching public records based on employee's region filter
        const matchingPublicDocs = await Public.find(publicLocationMatch);
        const userIdsFromPublic = matchingPublicDocs.map(doc => doc.userid);
        
        if (userIdsFromPublic.length === 0) {
            return res.json({
                employeeDetails: { name: employee.Name, state: employee.state, country: employee.country },
                cities: [],
                transactions: [] 
            });
        }
        
        // 2. Fetch transactions for all filtered user IDs
        const allTransactions = await Transaction.find({ 
            userId: { $in: userIdsFromPublic }
        }).sort({ timestamp: -1 });

        // 3. Get the list of all unique cities in the employee's state/country
        const citiesInState = await Public.distinct('City', {
            State: employee.state,
            Country: employee.country
        });

        res.json({
            employeeDetails: {
                name: employee.Name,
                state: employee.state,
                country: employee.country
            },
            cities: citiesInState.sort(),
            // Transactions contain Date objects which will be handled by the frontend
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
    
    // Simple validation
    if (!userid || !complaintType || !description) {
        return res.status(400).json({ message: 'Missing required fields.' });
    }

    try {
        const user = await User.findOne({ userid });
        if (!user) { return res.status(404).json({ message: 'User not found' }); }
        
        const newComplaint = new Complaint({ userId: userid, complaintType, description });
        await newComplaint.save();
        
        res.status(201).json({ message: 'Complaint submitted successfully', complaint: newComplaint });
    } catch (error) {
        console.error(error);
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
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// --- 🚀 SERVER START ---
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));