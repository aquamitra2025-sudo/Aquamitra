// seed.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const { Schema } = mongoose;

const userSchema = new Schema({
  userid: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  threshold: { type: Number, default: 0 },
});

const publicSchema = new Schema({
  userid: { type: String, required: true, unique: true },
  headcout: Number,
  Country: String,
  State: String,
  City: String,
  Address: String,
  pincode: String,
});

const employeeSchema = new Schema({
  userid: { type: String, required: true, unique: true },
  Name: String,
  password: { type: String, default: null },
  isRegistered: { type: Boolean, default: false },
  country: String,
  state: String,
});

const transactionSchema = new Schema({
  userId: { type: String, required: true }, // store by userid (string)
  amount: Number,
  timestamp: { type: Date, default: Date.now },
});

const complaintSchema = new Schema(
  {
    userId: { type: String, required: true },
    complaintType: {
      type: String,
      enum: ["Leakage", "Meter Issue", "Billing Error", "No Water Supply", "Other"],
      required: true,
    },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ["Submitted", "In Progress", "Resolved", "Closed"],
      default: "Submitted",
    },
  },
  { timestamps: true }
);

const User = mongoose.model("user", userSchema);
const Public = mongoose.model("public", publicSchema);
const Employee = mongoose.model("employee", employeeSchema);
const Transaction = mongoose.model("transaction", transactionSchema);
const Complaint = mongoose.model("complaint", complaintSchema);

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
    // Clear old data
    await User.deleteMany({});
    await Public.deleteMany({});
    await Employee.deleteMany({});
    await Transaction.deleteMany({});
    await Complaint.deleteMany({});

    // --- Password hash for users ---
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("password123", salt);

    // --- Public + Users ---
    await Public.insertMany([
      {
        userid: "user1",
        headcout: 4,
        Country: "India",
        State: "Tamil Nadu",
        City: "Chennai",
        Address: "123 Street A",
        pincode: "600001",
      },
      {
        userid: "user2",
        headcout: 3,
        Country: "India",
        State: "Tamil Nadu",
        City: "Madurai",
        Address: "456 Street B",
        pincode: "625001",
      },
    ]);

    await User.insertMany([
      { userid: "user1", password: hashedPassword, threshold: 0 },
      { userid: "user2", password: hashedPassword, threshold: 0 },
    ]);

    // --- Employee (password = null) ---
    await Employee.insertMany([
      {
        userid: "emp1",
        Name: "Ravi Kumar",
        password: null,
        isRegistered: false,
        country: "India",
        state: "Tamil Nadu",
      },
    ]);

    // --- Transactions below threshold ---
    const today = new Date();
    const transactions = [];
    const numDays = 10;

    for (let d = 0; d < numDays; d++) {
      const date = new Date(today);
      date.setDate(today.getDate() - d);

      // user1: headcount = 4 → threshold = 220
      transactions.push({
        userId: "user1",
        amount: 150, // below threshold
        timestamp: new Date(date),
      });

      // user2: headcount = 3 → threshold = 165
      transactions.push({
        userId: "user2",
        amount: 120, // below threshold
        timestamp: new Date(date),
      });
    }

    await Transaction.insertMany(transactions);

    console.log("✅ Database seeded with user1, user2, emp1 and transactions below threshold.");
    process.exit();
  } catch (error) {
    console.error("❌ Seeding error:", error);
    process.exit(1);
  }
}

seed();
