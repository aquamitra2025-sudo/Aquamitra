import React, { useState, useEffect, useMemo } from 'react';
import useAuth from '../hooks/useauth';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend} from 'chart.js';
import { format, subDays, startOfWeek, getWeek, getYear } from 'date-fns';
import { Droplets, TrendingUp, Calendar, MessageSquare } from 'lucide-react'; // Lucide icons

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Component for the dashboard statistics cards
const StatsCard = ({ title, value, detail, Icon, bgColor, textColor }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-600">{title}</p>
                <p className={`text-2xl font-bold ${textColor}`}>{value}</p>
                <p className="text-sm text-gray-500">{detail}</p>
            </div>
            <div className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center`}>
                <Icon className={`h-6 w-6 ${textColor}`} />
            </div>
        </div>
    </div>
);

function UserDashboard() {
    const { user, logout } = useAuth();
    
    const [transactions, setTransactions] = useState([]);
    const [complaints, setComplaints] = useState([]);
    const [metrics, setMetrics] = useState({ dailyThreshold: 0, todaysConsumption: 0, remainingToday: 0 });
    const [view, setView] = useState('daily'); // 'daily', 'weekly', 'monthly', 'yearly'
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

                // API call to fetch dashboard data
                const response = await axios.get(`https://aquamitra-1.onrender.com/api/dashboard/${user}`, {
                    headers: { 'Timezone': userTimeZone }
                });

                const { transactions, complaints, dashboardMetrics } = response.data;
                setTransactions(transactions);
                setComplaints(complaints);
                setMetrics(dashboardMetrics);
            } catch (err) {
                console.error("Failed to fetch dashboard data:", err);
                setError(err.response?.data?.message || "Could not load dashboard data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    // Chart Data Aggregation (Your original logic remains)
    const chartData = useMemo(() => {
        if (transactions.length === 0) return { labels: [], datasets: [] };
        // ... (Your original chart data logic is here) ...
        const dataMap = new Map();
        const now = new Date();

        switch (view) {
            case 'daily': {
                // Logic for the last 7 days (Daily view)
                for (let i = 6; i >= 0; i--) {
                    const date = subDays(now, i);
                    const key = format(date, 'yyyy-MM-dd');
                    const label = format(date, 'MMM d');
                    dataMap.set(key, { total: 0, label: label, date: date });
                }
                const sevenDaysAgo = subDays(now, 6);
                sevenDaysAgo.setHours(0, 0, 0, 0);
                const recentTransactions = transactions.filter(t => new Date(t.timestamp) >= sevenDaysAgo);
                recentTransactions.forEach(t => {
                    const date = new Date(t.timestamp);
                    const key = format(date, 'yyyy-MM-dd');
                    if (dataMap.has(key)) dataMap.get(key).total += t.amount;
                });
                break;
            }
            case 'weekly': {
                transactions.forEach(t => {
                    const date = new Date(t.timestamp);
                    const key = format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-ww');
                    const label = `Week ${getWeek(date, { weekStartsOn: 1 })}`;
                    if (!dataMap.has(key)) dataMap.set(key, { total: 0, label: label, date: startOfWeek(date, { weekStartsOn: 1 }) });
                    dataMap.get(key).total += t.amount;
                });
                break;
            }
            case 'monthly': {
                transactions.forEach(t => {
                    const date = new Date(t.timestamp);
                    const key = format(date, 'yyyy-MM');
                    const label = format(date, 'MMM yyyy');
                    if (!dataMap.has(key)) dataMap.set(key, { total: 0, label: label, date: date });
                    dataMap.get(key).total += t.amount;
                });
                break;
            }
            case 'yearly': {
                transactions.forEach(t => {
                    const date = new Date(t.timestamp);
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
                data: sortedData.map(d => d.total),
                backgroundColor: '#3B82F6', // Blue-600
                borderColor: '#2563EB',
                borderWidth: 1,
            }],
        };
    }, [transactions, view]);

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

    const getStatusColor = (status) => { 
        switch (status) { 
            case 'Submitted': return 'bg-yellow-100 text-yellow-800'; 
            case 'In Progress': return 'bg-blue-100 text-blue-800'; 
            case 'Resolved': return 'bg-green-100 text-green-800'; 
            case 'Closed': return 'bg-gray-100 text-gray-800'; 
            default: return 'bg-gray-100 text-gray-800'; 
        } 
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center font-semibold text-lg">Loading Dashboard...</div>;
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-600 font-semibold p-4 text-center">{error}</div>;

    const consumptionPercentage = metrics.dailyThreshold > 0 ? (metrics.todaysConsumption / metrics.dailyThreshold) * 100 : 0;
    
    let usageDetail = `of ${metrics.dailyThreshold.toFixed(0)}L allocated`;
    let usageIcon = Droplets;
    let usageBgColor = 'bg-blue-100';
    let usageTextColor = 'text-blue-600';

    let remainingColor = 'text-green-600';
    let remainingBgColor = 'bg-green-100';

    if (consumptionPercentage > 90) {
        remainingColor = 'text-red-600';
        remainingBgColor = 'bg-red-100';
    } else if (consumptionPercentage > 75) {
        remainingColor = 'text-orange-600';
        remainingBgColor = 'bg-orange-100';
    }


    const statsData = [
        { 
            title: "Today's Usage", 
            value: `${metrics.todaysConsumption.toFixed(0)}L`, 
            detail: usageDetail, 
            Icon: Droplets, 
            bgColor: usageBgColor, 
            textColor: usageTextColor 
        },
        { 
            title: "Daily Threshold", 
            value: `${metrics.dailyThreshold.toFixed(0)}L`, 
            detail: "Per day allocation", 
            Icon: TrendingUp, 
            bgColor: 'bg-green-100', 
            textColor: 'text-green-600' 
        },
        { 
            title: "Remaining Today", 
            value: `${metrics.remainingToday.toFixed(0)}L`, 
            detail: "until allocation limit", 
            Icon: Calendar, // Using Calendar as a generic alert icon
            bgColor: remainingBgColor, 
            textColor: remainingColor 
        },
    ];

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { display: false },
            title: { display: true, text: `${view.charAt(0).toUpperCase() + view.slice(1)} Water Usage`, font: { size: 16, weight: 'bold' } }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: { display: true, text: 'Consumption (Liters)' }
            }
        }
    };


    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Water Usage Dashboard</h1>
                    <p className="text-gray-600">Monitor your household water consumption and submit feedback</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {statsData.map((stat) => (
                        <StatsCard key={stat.title} {...stat} />
                    ))}
                </div>

                <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Consumption Chart */}
                    <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Consumption Trend</h3>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {['daily', 'weekly', 'monthly', 'yearly'].map(v => (
                                <button key={v} onClick={() => setView(v)} className={`px-4 py-1 text-sm font-medium rounded-md transition ${view === v ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                                    {v.charAt(0).toUpperCase() + v.slice(1)}
                                </button>
                            ))}
                        </div>
                        <div className="h-96">
                             {/* Adjust height and options as needed for recharts styling */}
                            <Bar options={chartOptions} data={chartData} /> 
                        </div>
                    </div>

                    {/* Complaint Submission/History Section */}
                    <div className="lg:col-span-1 space-y-8">
                        {/* New Complaint Form */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">New Complaint</h2>
                            <form onSubmit={handleComplaintSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="complaintType" className="block text-sm font-medium text-gray-700">Type of Issue</label>
                                    <select id="complaintType" value={complaintType} onChange={(e) => setComplaintType(e.target.value)} className="mt-1 block w-full px-4 py-2 border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors bg-white">
                                        <option>Leakage</option><option>Meter Issue</option><option>Billing Error</option><option>No Water Supply</option><option>Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                                    <textarea id="description" rows="4" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Please provide details about the issue..." className="mt-1 block w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" required></textarea>
                                </div>
                                <button type="submit" disabled={formSubmitting} className="w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
                                    <div className="flex items-center justify-center space-x-2">
                                        <MessageSquare className="h-4 w-4" />
                                        <span>{formSubmitting ? 'Submitting...' : 'Submit Complaint'}</span>
                                    </div>
                                </button>
                                {formMessage.content && <p className={`text-sm mt-2 text-center font-medium ${formMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{formMessage.content}</p>}
                            </form>
                        </div>
                        
                        {/* Complaint History List */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                            <div className="px-6 py-4 border-b border-gray-100">
                                <h2 className="text-xl font-semibold text-gray-900">Complaint History</h2>
                                <p className="text-gray-600 text-sm">View your past feedback submissions.</p>
                            </div>
                            <div className="divide-y divide-gray-200 max-h-80 overflow-y-auto">
                                {complaints.length > 0 ? (
                                    complaints.map(c => (
                                        <div key={c._id} className="px-6 py-4 hover:bg-gray-50">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h4 className="text-sm font-medium text-gray-900">{c.complaintType}</h4>
                                                    <p className="text-sm text-gray-600 mt-1 truncate">{c.description.substring(0, 50)}...</p>
                                                    <p className="text-xs text-gray-500 mt-2">Submitted on {format(new Date(c.createdAt), 'M/d/yyyy')}</p>
                                                </div>
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(c.status)}`}>{c.status}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 text-center py-4">You have no complaint history.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default UserDashboard;