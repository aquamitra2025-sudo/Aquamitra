// src/components/UserDashboard.jsx
import React, { useState, useEffect, useMemo } from 'react';
import useAuth from '../hooks/useauth';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend} from 'chart.js';
import { format, subDays, startOfWeek, getWeek, getYear, parse } from 'date-fns';
import { TrendingUp, Calendar, MessageSquare, Clock, Waves } from 'lucide-react'; 
import logoPath from '../assets/logo.png';
// --- Custom Logo Component (Icon Size) ---
const CustomLogoIcon = ({ className }) => (
    <div className={`font-bold text-lg text-center ${className}`}>
        {/* Use the imported path */}
        <img src={logoPath} alt="Aquamitra Logo" className="h-full w-full object-contain"/>
    </div>
);
// --- End Custom Logo Component ---

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Define the expected format of your data's timestamp string (from the backend)
const DATE_FORMAT = 'dd-MM-yyyy HH:mm:ss';

// Component for the dashboard statistics cards
const StatsCard = ({ title, value, detail, Icon, bgColor, textColor }) => (
    // THEME: Dark card background, glowing border effect
    <div className="bg-gray-800 rounded-xl p-6 shadow-xl border border-blue-900 transition-all duration-300 hover:border-cyan-500/50">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-400">{title}</p>
                <p className={`text-2xl font-bold ${textColor}`}>{value}</p>
                <p className="text-sm text-gray-500">{detail}</p>
            </div>
            <div className={`w-12 h-12 ${bgColor} rounded-full flex items-center justify-center shadow-md`}> 
                <Icon className={`h-6 w-6 ${textColor}`} />
            </div>
        </div>
    </div>
);

function UserDashboard() {
    const { user, logout } = useAuth();
    
    const [transactions, setTransactions] = useState([]);
    const [complaints, setComplaints] = useState([]);
    const [metrics, setMetrics] = useState({ dailyThreshold: 400, todaysConsumption: 0, remainingToday: 400 }); 
    const [view, setView] = useState('daily'); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [last30Transactions, setLast30Transactions] = useState([]); 

    const [complaintType, setComplaintType] = useState('Leakage');
    const [description, setDescription] = useState('');
    const [formSubmitting, setFormSubmitting] = useState(false);
    const [formMessage, setFormMessage] = useState({ type: '', content: '' });

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

                // 1. API call to fetch dashboard data
                const response = await axios.get(`http://localhost:5000/api/dashboard/${user}`, {
                    headers: { 'Timezone': userTimeZone }
                });

                const { transactions, complaints, dashboardMetrics } = response.data;
                
                const parsedTransactions = transactions
                    .map(t => {
                        const parsedDate = parse(t.timestamp, DATE_FORMAT, new Date());
                        
                        return {
                            ...t,
                            timestamp: parsedDate
                        };
                    })
                    .filter(t => t.timestamp instanceof Date && !isNaN(t.timestamp.getTime()))
                    .sort((a, b) => b.timestamp - a.timestamp); 

                setTransactions(parsedTransactions);
                setComplaints(complaints);
                setMetrics(dashboardMetrics);
                
                setLast30Transactions(parsedTransactions.slice(0, 30));

            } catch (err) {
                console.error("Failed to fetch dashboard data:", err);
                setError(err.response?.data?.message || "Could not load dashboard data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    // Chart Data Aggregation logic remains the same...
    const chartData = useMemo(() => {
        if (transactions.length === 0) return { labels: [], datasets: [] };
        
        const dataMap = new Map();
        const now = new Date(); 

        switch (view) {
            case 'daily': {
                for (let i = 6; i >= 0; i--) {
                    const date = subDays(now, i);
                    date.setHours(0, 0, 0, 0); 
                    const key = format(date, 'yyyy-MM-dd');
                    const label = format(date, 'MMM d');
                    dataMap.set(key, { total: 0, label: label, date: date });
                }
                
                const sevenDaysAgo = subDays(now, 6);
                sevenDaysAgo.setHours(0, 0, 0, 0);
                
                const recentTransactions = transactions.filter(t => t.timestamp >= sevenDaysAgo);
                recentTransactions.forEach(t => {
                    const key = format(t.timestamp, 'yyyy-MM-dd');
                    if (dataMap.has(key)) dataMap.get(key).total += t.amount;
                });
                break;
            }
            case 'weekly': {
                transactions.forEach(t => {
                    const date = t.timestamp;
                    const key = format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-ww');
                    const label = `Week ${getWeek(date, { weekStartsOn: 1 })}`;
                    if (!dataMap.has(key)) dataMap.set(key, { total: 0, label: label, date: date });
                    dataMap.get(key).total += t.amount;
                });
                break;
            }
            case 'monthly': {
                transactions.forEach(t => {
                    const date = t.timestamp;
                    const key = format(date, 'yyyy-MM');
                    const label = format(date, 'MMM yyyy');
                    if (!dataMap.has(key)) dataMap.set(key, { total: 0, label: label, date: date });
                    dataMap.get(key).total += t.amount;
                });
                break;
            }
            case 'yearly': {
                transactions.forEach(t => {
                    const date = t.timestamp;
                    const key = getYear(date);
                    const label = key.toString();
                    if (!dataMap.has(key)) dataMap.set(key, { total: 0, label: label, date: date });
                    dataMap.get(key).total += t.amount;
                });
                break;
            }
            default:
                break;
        }

        const sortedData = Array.from(dataMap.values()).sort((a, b) => a.date - b.date);

        return {
            labels: sortedData.map(d => d.label),
            datasets: [{
                label: 'Water Consumption (Liters)',
                // THEME: Chart Bar Color to Electric Blue
                data: sortedData.map(d => d.total),
                backgroundColor: '#06B6D4', // Tailwind cyan-500
                borderColor: '#0891B2', // Tailwind cyan-600
                borderWidth: 1,
            }],
        };
    }, [transactions, view]);

    // Complaint Submission Handler
    const handleComplaintSubmit = async (e) => { 
        e.preventDefault(); 
        setFormSubmitting(true); 
        setFormMessage({ type: '', content: '' }); 
        try { 
            const response = await axios.post('http://localhost:5000/api/complaints', { userid: user, complaintType, description, }); 
            setFormMessage({ type: 'success', content: 'Complaint submitted successfully!' }); 
            setComplaints(prev => [response.data.complaint, ...prev]); 
            setDescription(''); 
            setComplaintType('Leakage'); 
        } catch (err) { 
            const msg = err.response?.data?.message || "Failed to submit complaint."; 
            setFormMessage({ type: 'error', content: msg }); 
        } finally { 
            setFormSubmitting(false); 
        } 
    };

    // Helper for Complaint Status Color (Theme-specific colors used)
    const getStatusColor = (status) => { 
        switch (status) { 
            case 'Submitted': return 'bg-fuchsia-900 text-fuchsia-400'; 
            case 'In Progress': return 'bg-cyan-900 text-cyan-400'; 
            case 'Resolved': return 'bg-green-900 text-green-400'; 
            case 'Closed': return 'bg-gray-700 text-gray-300'; 
            default: return 'bg-gray-700 text-gray-300'; 
        } 
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center font-semibold text-lg text-white">Loading Dashboard...</div>;
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-400 font-semibold p-4 text-center">{error}</div>;

    const consumptionPercentage = metrics.dailyThreshold > 0 ? (metrics.todaysConsumption / metrics.dailyThreshold) * 100 : 0;
    
    // THEME: Use Cyan for general usage
    let usageDetail = `of ${metrics.dailyThreshold.toFixed(0)}L allocated`;
    let usageBgColor = 'bg-cyan-900';
    let usageTextColor = 'text-cyan-400';

    let remainingColor = 'text-green-400';
    let remainingBgColor = 'bg-green-900';

    // Usage over 75% triggers the warning colors (Fuchsia/Red)
    if (consumptionPercentage > 90) {
        remainingColor = 'text-red-400';
        remainingBgColor = 'bg-red-900';
    } else if (consumptionPercentage > 75) {
        remainingColor = 'text-fuchsia-400';
        remainingBgColor = 'bg-fuchsia-900';
    }


    const statsData = [
        { 
            title: "Today's Usage", 
            value: `${metrics.todaysConsumption.toFixed(2)}L`, 
            detail: usageDetail, 
            Icon: CustomLogoIcon, // Using CustomLogoIcon
            bgColor: usageBgColor, 
            textColor: usageTextColor 
        },
        { 
            title: "Daily Threshold", 
            value: `${metrics.dailyThreshold.toFixed(0)}L`, 
            detail: "Per day allocation", 
            Icon: Waves, 
            // THEME: Light Indigo
            bgColor: 'bg-indigo-900', 
            textColor: 'text-indigo-400' 
        },
        { 
            title: "Remaining Today", 
            value: `${metrics.remainingToday.toFixed(2)}L`, 
            detail: "until allocation limit", 
            Icon: Calendar, 
            bgColor: remainingBgColor, 
            textColor: remainingColor 
        },
    ];

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: { 
                display: true, 
                // THEME: Title text color to white
                text: `${view.charAt(0).toUpperCase() + view.slice(1)} Water Flow`, 
                font: { size: 18, weight: 'bold' },
                color: '#E5E7EB' 
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                // THEME: Y-axis title color (Cyan)
                title: { display: true, text: 'Consumption (Liters)', color: '#06B6D4' },
                grid: { color: 'rgba(55, 65, 81, 0.5)' }, // Dark Grid
                ticks: { color: '#9CA3AF' } // Gray-400
            },
            x: {
                // THEME: X-axis title color (Cyan)
                title: { display: true, text: 'Time Period', color: '#06B6D4' },
                ticks: { color: '#9CA3AF' } // Gray-400
            }
        }
    };


    return (
        // THEME: Main background to deep indigo/blue gradient
        <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-gray-900 to-blue-950 text-white"> 
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-white mb-2 border-b-2 border-cyan-500 pb-1 inline-block">Household Water Flow Dashboard 💧</h1>
                    <p className="text-gray-400">Monitor your household water consumption and submit feedback directly to the municipal team</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {statsData.map((stat) => (
                        <StatsCard key={stat.title} {...stat} />
                    ))}
                </div>
                
                <hr className="border-indigo-800 my-4" />

                {/* Main Content: Chart (2/3) and Complaints (1/3) */}
                <main className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    {/* Consumption Chart */}
                    {/* THEME: Dark component background, sharp border */}
                    <div className="lg:col-span-2 bg-gray-800 rounded-xl p-6 shadow-xl border border-blue-900">
                        <h3 className="text-xl font-semibold text-white mb-4 border-b pb-2 border-gray-700">Consumption Trend</h3>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {['daily', 'weekly', 'monthly', 'yearly'].map(v => (
                                <button 
                                    key={v} 
                                    onClick={() => setView(v)} 
                                    // THEME: Button colors to Electric Cyan
                                    className={`px-4 py-1 text-sm font-medium rounded-full transition ${view === v ? 'bg-cyan-600 text-gray-900 shadow-md' : 'bg-gray-700 text-cyan-400 hover:bg-cyan-900'}`}>
                                    {v.charAt(0).toUpperCase() + v.slice(1)}
                                </button>
                            ))}
                        </div>
                        {/* Fixed height for chart area */}
                        <div className="h-96 w-full"> 
                            {chartData.labels.length > 0 ? (
                                <Bar options={chartOptions} data={chartData} /> 
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-500">No consumption data to display for this period.</div>
                            )}
                        </div>
                    </div>

                    {/* Complaint Submission/History Section */}
                    <div className="lg:col-span-1 space-y-8">
                        {/* New Complaint Form */}
                        {/* THEME: Dark component background, sharp border */}
                        <div className="bg-gray-800 p-6 rounded-xl shadow-xl border border-blue-900">
                            {/* THEME: Icon color to Electric Cyan */}
                            <h2 className="text-xl font-semibold text-white mb-4 flex items-center"><MessageSquare className="h-5 w-5 mr-2 text-cyan-400" /> Report an Issue</h2>
                            <form onSubmit={handleComplaintSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="complaintType" className="block text-sm font-medium text-gray-300">Type of Issue</label>
                                    {/* THEME: Dark input field, Cyan focus ring */}
                                    <select id="complaintType" value={complaintType} onChange={(e) => setComplaintType(e.target.value)} className="mt-1 block w-full px-4 py-2 border border-indigo-700 bg-gray-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm transition-colors">
                                        <option>Leakage</option><option>Meter Issue</option><option>Billing Error</option><option>No Water Supply</option><option>Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-300">Description</label>
                                    {/* THEME: Dark input field, Cyan focus ring */}
                                    <textarea id="description" rows="4" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Please provide details about the issue..." className="mt-1 block w-full p-2 border border-indigo-700 bg-gray-900 text-white rounded-lg shadow-sm focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm" required></textarea>
                                </div>
                                {/* THEME: Button color to Electric Cyan */}
                                <button type="submit" disabled={formSubmitting} className="w-full py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-medium text-gray-900 bg-cyan-600 hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 transition-all duration-300 shadow-cyan-500/30">
                                    <div className="flex items-center justify-center space-x-2">
                                        <MessageSquare className="h-4 w-4" />
                                        <span>{formSubmitting ? 'Submitting...' : 'Submit Complaint'}</span>
                                    </div>
                                </button>
                                {formMessage.content && <p className={`text-sm mt-2 text-center font-medium ${formMessage.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>{formMessage.content}</p>}
                            </form>
                        </div>
                    </div>
                </main>
                
                <hr className="border-indigo-800 my-4" />

                {/* NEW ROW: Complaint History (1/2) and Transaction History (1/2) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* Complaint History List */}
                    {/* THEME: Dark component background, sharp border */}
                    <div className="bg-gray-800 rounded-xl shadow-lg border border-blue-900">
                        <div className="px-6 py-4 border-b border-gray-700 flex items-center">
                            {/* THEME: Icon color to Electric Cyan */}
                            <h2 className="text-xl font-semibold text-white"><MessageSquare className="h-5 w-5 mr-2 text-cyan-400 inline-block" /> Complaint History</h2>
                        </div>
                        <div className="divide-y divide-gray-700 max-h-96 overflow-y-auto">
                            {complaints.length > 0 ? (
                                complaints.map(c => (
                                    <div key={c._id} className="px-6 py-4 hover:bg-indigo-900 transition-colors"> 
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0 pr-4">
                                                <h4 className="text-sm font-medium text-gray-200 truncate">{c.complaintType}</h4>
                                                <p className="text-sm text-gray-400 mt-1 truncate">{c.description}</p>
                                                <p className="text-xs text-gray-500 mt-2">Submitted on {format(new Date(c.createdAt), 'MMM d, yyyy')}</p>
                                            </div>
                                            <span className={`inline-flex flex-shrink-0 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(c.status)}`}>{c.status}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-center py-8">You have no complaint history.</p>
                            )}
                        </div>
                    </div>

                    {/* NEW: Last 30 Transactions History */}
                    {/* THEME: Dark component background, sharp border */}
                    <div className="bg-gray-800 rounded-xl shadow-lg border border-blue-900">
                        <div className="px-6 py-4 border-b border-gray-700 flex items-center">
                            {/* THEME: Icon color to Electric Cyan */}
                            <h2 className="text-xl font-semibold text-white"><Clock className="h-5 w-5 mr-2 text-cyan-400 inline-block" /> Last 30 Transactions</h2>
                        </div>
                        <div className="divide-y divide-gray-700 max-h-96 overflow-y-auto">
                            {last30Transactions.length > 0 ? (
                                last30Transactions.map((t, index) => (
                                    <div key={index} className="px-6 py-3 hover:bg-indigo-900 transition-colors flex justify-between items-center"> 
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-cyan-400">
                                                {t.amount.toFixed(2)} L
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                {format(t.timestamp, 'MMM d, yyyy HH:mm')}
                                            </span>
                                        </div>
                                        {/* THEME: Badge colors to Cyan for visibility */}
                                        <span className="text-xs font-semibold text-cyan-400 bg-cyan-900 px-2 py-1 rounded-full border border-cyan-700">
                                            Water Usage
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-center py-8">No recent transactions to display.</p>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default UserDashboard;