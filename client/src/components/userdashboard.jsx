// src/components/UserDashboard.jsx
import React, { useState, useEffect, useMemo } from 'react';
import useAuth from '../hooks/useAuth';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { format, startOfWeek, getWeek, getYear, subDays } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function UserDashboard() {
  const { user, logout } = useAuth();
  
  const [transactions, setTransactions] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [metrics, setMetrics] = useState({ dailyThreshold: 0, todaysConsumption: 0, remainingToday: 0 });
  const [view, setView] = useState('daily'); // Default view is now 'daily'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [complaintType, setComplaintType] = useState('Leakage');
  const [description, setDescription] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState({ type: '', content: '' });

  // In src/components/UserDashboard.jsx

useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            // --- NEW: Get user's timezone from their browser ---
            const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone; // e.g., "Asia/Kolkata"

            // --- CHANGED: Add the timezone to the request headers ---
            const response = await axios.get(`http://localhost:5000/api/dashboard/${user}`, {
                headers: {
                    'Timezone': userTimeZone
                }
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

  const chartData = useMemo(() => {
    if (transactions.length === 0) return { labels: [], datasets: [] };
    const dataMap = new Map();
    const now = new Date();

    switch (view) {
        case 'daily': {
            for (let i = 6; i >= 0; i--) {
                const date = subDays(now, i);
                const key = format(date, 'yyyy-MM-dd');
                const label = format(date, 'EEE, d MMM');
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
                const label = `Week ${getWeek(date, { weekStartsOn: 1 })}, ${getYear(date)}`;
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
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
        }],
    };
}, [transactions, view]);

  const handleComplaintSubmit = async (e) => { e.preventDefault(); setFormSubmitting(true); setFormMessage({ type: '', content: '' }); try { const response = await axios.post('http://localhost:5000/api/complaints', { userid: user, complaintType, description, }); setFormMessage({ type: 'success', content: 'Complaint submitted successfully!' }); setComplaints(prev => [response.data.complaint, ...prev]); setDescription(''); setComplaintType('Leakage'); } catch (err) { const msg = err.response?.data?.message || "Failed to submit complaint."; setFormMessage({ type: 'error', content: msg }); } finally { setFormSubmitting(false); } };
  const getStatusColor = (status) => { switch (status) { case 'Submitted': return 'bg-blue-100 text-blue-800'; case 'In Progress': return 'bg-yellow-100 text-yellow-800'; case 'Resolved': return 'bg-green-100 text-green-800'; case 'Closed': return 'bg-gray-100 text-gray-800'; default: return 'bg-gray-100'; } };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-semibold text-lg">Loading Dashboard...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500 font-semibold p-4 text-center">{error}</div>;

  const remainingPercentage = (metrics.remainingToday / metrics.dailyThreshold) * 100;
  let remainingColor = 'text-green-600';
  if (remainingPercentage < 20) remainingColor = 'text-yellow-600';
  if (remainingPercentage <= 0) remainingColor = 'text-red-600';

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Welcome, {user}!</h1>
            <p className="text-gray-600 mt-1">Here is your water consumption summary for today, {format(new Date(), 'eeee, MMMM d')}.</p>
          </div>
          <button onClick={logout} className="mt-4 sm:mt-0 px-4 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 transition duration-300">Logout</button>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-full">💧</div>
            <div><p className="text-sm text-gray-500 font-medium">Today's Consumption</p><p className="text-2xl font-bold text-gray-800">{metrics.todaysConsumption.toFixed(2)} L</p></div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg flex items-center space-x-4">
            <div className="bg-purple-100 p-3 rounded-full">🎯</div>
            <div><p className="text-sm text-gray-500 font-medium">Daily Threshold</p><p className="text-2xl font-bold text-gray-800">{metrics.dailyThreshold.toFixed(2)} L</p></div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg flex items-center space-x-4">
            <div className="bg-green-100 p-3 rounded-full">🔋</div>
            <div><p className="text-sm text-gray-500 font-medium">Remaining Today</p><p className={`text-2xl font-bold ${remainingColor}`}>{metrics.remainingToday.toFixed(2)} L</p></div>
          </div>
        </section>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-gray-700 mb-4">Water Consumption History</h2>
                <div className="flex flex-wrap gap-2 mb-4 border-b pb-2">
                    {['daily', 'weekly', 'monthly', 'yearly'].map(v => (
                        <button key={v} onClick={() => setView(v)} className={`px-4 py-1 text-sm font-medium rounded-md transition ${view === v ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                            {v.charAt(0).toUpperCase() + v.slice(1)}
                        </button>
                    ))}
                </div>
                <Bar options={{ responsive: true, plugins: { legend: { position: 'top' }, title: { display: true, text: `${view.charAt(0).toUpperCase() + view.slice(1)} Water Usage` } } }} data={chartData} />
            </div>
            <div className="lg:col-span-1 space-y-8">
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-2xl font-bold text-gray-700 mb-4">File a Complaint</h2>
                    <form onSubmit={handleComplaintSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="complaintType" className="block text-sm font-medium text-gray-700">Type of Issue</label>
                            <select id="complaintType" value={complaintType} onChange={(e) => setComplaintType(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                                <option>Leakage</option><option>Meter Issue</option><option>Billing Error</option><option>No Water Supply</option><option>Other</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea id="description" rows="4" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Please provide details about the issue..." className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" required></textarea>
                        </div>
                        <button type="submit" disabled={formSubmitting} className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400">{formSubmitting ? 'Submitting...' : 'Submit Complaint'}</button>
                        {formMessage.content && <p className={`text-sm mt-2 text-center ${formMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{formMessage.content}</p>}
                    </form>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-2xl font-bold text-gray-700 mb-4">Your Complaint History</h2>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                        {complaints.length > 0 ? (
                            complaints.map(c => (
                                <div key={c._id} className="border-l-4 border-blue-500 p-3 bg-gray-50 rounded-r-lg">
                                    <div className="flex justify-between items-start">
                                        <div><p className="font-bold text-gray-800">{c.complaintType}</p><p className="text-sm text-gray-500">{c.description.substring(0, 50)}...</p><p className="text-xs text-gray-400 mt-1">{format(new Date(c.createdAt), 'dd MMM yyyy, h:mm a')}</p></div>
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(c.status)}`}>{c.status}</span>
                                    </div>
                                </div>))
                        ) : (<p className="text-gray-500 text-center">You have not filed any complaints yet.</p>)}
                    </div>
                </div>
            </div>
        </main>
      </div>
    </div>
  );
}

export default UserDashboard;