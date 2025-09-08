import React, { useState, useEffect, useMemo } from 'react';
import useAuth from '../hooks/useAuth';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { format, subDays, startOfWeek, getWeek, getYear, isToday } from 'date-fns';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function EmployeeDashboard() {
    const { user: employeeId, logout } = useAuth();
    const [employeeDetails, setEmployeeDetails] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [view, setView] = useState('daily');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [availableCities, setAvailableCities] = useState([]);
    const [selectedCity, setSelectedCity] = useState('all');

    useEffect(() => {
        if (!employeeId) return;

        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`http://localhost:5000/api/employee/dashboard/${employeeId}`, {
                    params: { city: selectedCity }
                });
                
                setEmployeeDetails(response.data.employeeDetails);
                setTransactions(response.data.transactions);
                
                // The API should also send back a list of all cities in the employee's state
                if (response.data.cities) {
                    setAvailableCities(response.data.cities);
                }

            } catch (err) {
                setError(err.response?.data?.message || "Could not load dashboard data.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [employeeId, selectedCity]);

    // Calculate high-level metrics for the cards at the top
    const dashboardMetrics = useMemo(() => {
        const todaysTransactions = transactions.filter(t => isToday(new Date(t.timestamp)));
        const totalConsumptionToday = todaysTransactions.reduce((acc, curr) => acc + curr.amount, 0);

        const consumptionByCity = todaysTransactions.reduce((acc, curr) => {
            acc[curr.city] = (acc[curr.city] || 0) + curr.amount;
            return acc;
        }, {});

        const topCity = Object.entries(consumptionByCity).sort((a, b) => b[1] - a[1])[0];

        return {
            totalConsumptionToday,
            cityCount: selectedCity === 'all' ? availableCities.length : 1,
            topCityToday: topCity ? { name: topCity[0], amount: topCity[1] } : { name: 'N/A', amount: 0 },
            cityPerformance: Object.entries(consumptionByCity).sort((a, b) => b[1] - a[1])
        };
    }, [transactions, availableCities, selectedCity]);

    // This chart logic now mirrors the UserDashboard, performing aggregation on the frontend
    const chartData = useMemo(() => {
        if (transactions.length === 0) return { labels: [], datasets: [] };

        const timeAggregatedData = {};
        const citiesInDataset = [...new Set(transactions.map(t => t.city))].sort();
        const now = new Date();

        transactions.forEach(t => {
            const date = new Date(t.timestamp);
            let key;
            switch (view) {
                case 'weekly': key = format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-ww'); break;
                case 'monthly': key = format(date, 'yyyy-MM'); break;
                case 'yearly': key = getYear(date).toString(); break;
                default:
                    if (date < subDays(now, 6)) return;
                    key = format(date, 'yyyy-MM-dd'); break;
            }
            if (!timeAggregatedData[key]) {
                timeAggregatedData[key] = { date: date };
                citiesInDataset.forEach(city => { timeAggregatedData[key][city] = 0; });
            }
            timeAggregatedData[key][t.city] += t.amount;
        });
        
        const sortedData = Object.entries(timeAggregatedData).sort((a, b) => a[1].date - b[1].date);
        const labels = sortedData.map(([key, value]) => {
            switch (view) {
                case 'weekly': return `Week ${getWeek(value.date, { weekStartsOn: 1 })}`;
                case 'monthly': return format(value.date, 'MMM yyyy');
                case 'yearly': return key;
                default: return format(value.date, 'EEE, d MMM');
            }
        });

        const datasets = citiesInDataset.map((city, index) => ({
            label: city,
            data: sortedData.map(([key, value]) => value[city] || 0),
            backgroundColor: `hsl(${(index * 360) / (citiesInDataset.length || 1)}, 70%, 60%)`,
        }));

        return { labels, datasets };
    }, [transactions, view]);

    const chartOptions = {
        plugins: { title: { display: true, text: `Water Consumption in ${employeeDetails?.state || ''}` } },
        responsive: true,
        scales: { x: { stacked: false }, y: { stacked: false, beginAtZero: true } },
    };

    if (loading && !employeeDetails) return <div className="min-h-screen flex items-center justify-center font-semibold text-lg">Loading Employee Dashboard...</div>;
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-500 font-semibold p-4 text-center">{error}</div>;

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Employee Dashboard</h1>
                        <p className="text-gray-600 mt-1">
                            Viewing data for: <strong className="text-indigo-600">{employeeDetails?.state}</strong> | Logged in as: <strong>{employeeId}</strong>
                        </p>
                    </div>
                    <button onClick={logout} className="mt-4 sm:mt-0 px-4 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 transition">
                        Logout
                    </button>
                </header>

                <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-lg flex items-center space-x-4">
                        <div className="bg-blue-100 p-3 rounded-full">💧</div>
                        <div><p className="text-sm text-gray-500 font-medium">Today's Total Consumption</p><p className="text-2xl font-bold text-gray-800">{dashboardMetrics.totalConsumptionToday.toFixed(2)} L</p></div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-lg flex items-center space-x-4">
                        <div className="bg-purple-100 p-3 rounded-full">🏙️</div>
                        <div><p className="text-sm text-gray-500 font-medium">Cities Monitored</p><p className="text-2xl font-bold text-gray-800">{dashboardMetrics.cityCount}</p></div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-lg flex items-center space-x-4">
                        <div className="bg-yellow-100 p-3 rounded-full">📈</div>
                        <div><p className="text-sm text-gray-500 font-medium">Highest Consumption (Today)</p><p className="text-xl font-bold text-gray-800">{dashboardMetrics.topCityToday.name}</p></div>
                    </div>
                </section>

                <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
                        <h2 className="text-2xl font-bold text-gray-700 mb-4">Consumption History</h2>
                        <div className="flex flex-wrap items-center gap-2 mb-4 border-b pb-2">
                            {['daily', 'weekly', 'monthly', 'yearly'].map(v => (
                                <button key={v} onClick={() => setView(v)} className={`px-4 py-1 text-sm font-medium rounded-md transition ${view === v ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                                    {v.charAt(0).toUpperCase() + v.slice(1)}
                                </button>
                            ))}
                            <div className="h-6 w-px bg-gray-300 mx-2"></div>
                            <select
                                value={selectedCity}
                                onChange={(e) => setSelectedCity(e.target.value)}
                                disabled={loading}
                                className="px-4 py-1 text-sm font-medium rounded-md transition bg-gray-200 text-gray-700 hover:bg-gray-300 border-transparent focus:border-indigo-500 focus:ring-indigo-500 disabled:opacity-50"
                            >
                                <option value="all">All Cities</option>
                                {availableCities.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>
                        <Bar options={chartOptions} data={chartData} />
                    </div>

                    <div className="lg:col-span-1 space-y-8">
                        <div className="bg-white p-6 rounded-xl shadow-lg">
                            <h2 className="text-2xl font-bold text-gray-700 mb-4">City Performance (Today)</h2>
                            <div className="space-y-4 max-h-96 overflow-y-auto">
                                {dashboardMetrics.cityPerformance.length > 0 ? (
                                    dashboardMetrics.cityPerformance.map(([city, amount]) => (
                                        <div key={city} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                            <p className="font-semibold text-gray-800">{city}</p>
                                            <p className="font-bold text-indigo-600">{amount.toFixed(2)} L</p>
                                        </div>
                                    ))
                                ) : (<p className="text-gray-500 text-center">No consumption data for today.</p>)}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default EmployeeDashboard;

