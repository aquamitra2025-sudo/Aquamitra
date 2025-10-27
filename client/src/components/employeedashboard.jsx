// src/components/EmployeeDashboard.jsx
import React, { useState, useEffect, useMemo } from 'react';
import useAuth from '../hooks/useauth';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { format, subDays, startOfWeek, getWeek, getYear, isToday } from 'date-fns';
import { TrendingUp, AlertTriangle, Users, Download, Filter } from 'lucide-react'; 
import logoPath from '../assets/logo.png'; // <--- ADDED IMPORT

// --- Custom Logo Component (Icon Size) ---
const CustomLogoIcon = ({ className }) => (
    <div className={`font-bold text-lg text-center ${className}`}>
        {/* Use the imported path */}
        <img src={logoPath} alt="Aquamitra Logo" className="h-full w-full object-contain"/>
    </div>
);
// --- End Custom Logo Component ---

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

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
            // THEME: Deep-water blue for icon wrapper
            <div className={`w-12 h-12 ${bgColor} rounded-full flex items-center justify-center shadow-md`}>
                <Icon className={`h-6 w-6 ${textColor}`} />
            </div>
        </div>
    </div>
);


function EmployeeDashboard() {
    const { user: employeeId, logout } = useAuth();
    const [employeeDetails, setEmployeeDetails] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [view, setView] = useState('daily');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [availableCities, setAvailableCities] = useState([]);
    const [selectedCity, setSelectedCity] = useState('all');
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

    // ... (rest of the component logic remains the same)

    useEffect(() => {
        if (!employeeId) return;

        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // --- MODIFIED LINE ---
                const response = await axios.get(`https://aquamitra-1.onrender.com/api/employee/dashboard/${employeeId}`, {
                    params: { city: selectedCity, date: selectedDate }
                });
                
                setEmployeeDetails(response.data.employeeDetails);
                setTransactions(response.data.transactions);
                
                if (response.data.cities) {
                    setAvailableCities(response.data.cities);
                } else {
                    setAvailableCities(["Central Reservoir", "Northern Zone", "Southern Zone", "Industrial Hub", "Rural Outskirts"]);
                }

            } catch (err) {
                setError(err.response?.data?.message || "Could not load dashboard data.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [employeeId, selectedCity, selectedDate]);

    const dashboardMetrics = useMemo(() => {
        const todaysTransactions = transactions.filter(t => isToday(new Date(t.timestamp)));
        const totalConsumptionToday = todaysTransactions.reduce((acc, curr) => acc + curr.amount, 0);
        const consumptionByCity = todaysTransactions.reduce((acc, curr) => {
            const city = curr.city || 'Unassigned'; 
            acc[city] = (acc[city] || 0) + curr.amount;
            return acc;
        }, {});
        const totalAllocated = transactions.reduce((acc, curr) => acc + (curr.allocated || 500), 0); 
        const totalRemaining = totalAllocated - totalConsumptionToday;
        const topCity = Object.entries(consumptionByCity).sort((a, b) => b[1] - a[1])[0];

        return {
            totalAllocated,
            totalConsumptionToday,
            totalRemaining,
            totalHouseholds: new Set(transactions.map(t => t.householdId || t.userid)).size, 
            cityCount: selectedCity === 'all' ? availableCities.length : 1,
            consumptionPercentage: totalAllocated > 0 ? (totalConsumptionToday / totalAllocated) * 100 : 0,
            topCityToday: topCity ? { name: topCity[0], amount: topCity[1] } : { name: 'N/A', amount: 0 },
            cityPerformance: Object.entries(consumptionByCity).sort((a, b) => b[1] - a[1])
        };
    }, [transactions, availableCities, selectedCity]);
    
    const chartData = useMemo(() => {
        if (transactions.length === 0) return { labels: [], datasets: [] };
        const timeAggregatedData = {};
        const allCitiesInChart = [...new Set([...availableCities, ...transactions.map(t => t.city || 'Unassigned')])].filter(c => c !== 'all').sort();
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
                timeAggregatedData[key] = { date: date, ...Object.fromEntries(allCitiesInChart.map(c => [c, 0])) };
            }
            const city = t.city || 'Unassigned';
            if (allCitiesInChart.includes(city)) {
                   timeAggregatedData[key][city] = (timeAggregatedData[key][city] || 0) + t.amount;
            }
        });
        
        const sortedData = Object.entries(timeAggregatedData).sort((a, b) => a[1].date - b[1].date);
        
        const labels = sortedData.map(([key, value]) => {
            switch (view) {
                case 'weekly': return `Week ${getWeek(value.date, { weekStartsOn: 1 })}`;
                case 'monthly': return format(value.date, 'MMM yyyy');
                case 'yearly': return key;
                default: return format(value.date, 'MMM d');
            }
        });

        const datasets = allCitiesInChart.map((city, index) => ({
            label: city,
            data: sortedData.map(([key, value]) => value[city] || 0),
            backgroundColor: `hsl(${(index * 35 + 200) % 360}, 70%, 50%)`, 
            borderColor: `hsl(${(index * 35 + 200) % 360}, 80%, 70%)`,
        }));

        return { labels, datasets };
    }, [transactions, view, availableCities]);

    const chartOptions = {
        plugins: { 
            title: { display: true, text: `Regional Water Consumption Trends`, font: { size: 18, weight: 'bold' }, color: '#E5E7EB' }, 
            legend: { position: 'bottom', labels: { color: '#9CA3AF' } } 
        },
        responsive: true,
        maintainAspectRatio: false,
        scales: { 
            x: { 
                stacked: true, 
                grid: { display: false },
                ticks: { color: '#9CA3AF' } 
            }, 
            y: { 
                stacked: true, 
                beginAtZero: true, 
                title: { display: true, text: 'Consumption (Liters)', color: '#06B6D4' }, 
                grid: { color: 'rgba(55, 65, 81, 0.5)' }, 
                ticks: { color: '#9CA3AF' } 
            } 
        },
    };

    if (loading && !employeeDetails) return <div className="min-h-screen flex items-center justify-center font-semibold text-lg text-white">Loading Dashboard...</div>;
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-400 font-semibold p-4 text-center">{error}</div>;

    const statsData = [
        { 
            title: "Total Allocation", 
            value: `${dashboardMetrics.totalAllocated.toFixed(0)}L`, 
            detail: `Across ${dashboardMetrics.totalHouseholds} accounts`, 
            Icon: CustomLogoIcon,
            bgColor: 'bg-blue-600/20', 
            textColor: 'text-blue-400' 
        },
        { 
            title: "Today's Consumption", 
            value: `${dashboardMetrics.totalConsumptionToday.toFixed(0)}L`, 
            detail: `${dashboardMetrics.consumptionPercentage.toFixed(1)}% of total allocation`, 
            Icon: TrendingUp, 
            bgColor: 'bg-cyan-600/20', 
            textColor: 'text-cyan-400' 
        },
        { 
            title: "Remaining Reserve", 
            value: `${dashboardMetrics.totalRemaining.toFixed(0)}L`, 
            detail: "Today's available capacity", 
            Icon: AlertTriangle, 
            bgColor: 'bg-fuchsia-600/20', 
            textColor: 'text-fuchsia-400' 
        },
        { 
            title: "Managed Regions", 
            value: `${dashboardMetrics.cityCount}`, 
            Icon: Users, 
            bgColor: 'bg-indigo-600/20', 
            textColor: 'text-indigo-400' 
        },
    ];

    return (
        // THEME: Background to deep indigo/blue gradient
        <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-gray-900 to-blue-950 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2 border-b-2 border-cyan-500 pb-1 inline-block">Government Water Oversight 🌊</h1>
                    <p className="text-gray-400">Monitor regional water distribution and household consumption for informed policy making</p>
                </div>
                
                {/* Filters and Export */}
                <div className="bg-gray-800 rounded-xl p-6 shadow-xl border border-blue-900 mb-8">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                            <div className="flex items-center space-x-2">
                                <Filter className="h-5 w-5 text-cyan-500" />
                                <span className="text-sm font-medium text-gray-300">Filter View:</span>
                            </div>
                            
                            {/* Region Filter */}
                            <div>
                                <label htmlFor="region" className="sr-only">Region</label>
                                <select 
                                    id="region" 
                                    value={selectedCity} 
                                    onChange={(e) => setSelectedCity(e.target.value)} 
                                    // THEME: Dark input field, Cyan focus ring
                                    className="px-3 py-2 border border-blue-700 bg-gray-900 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                                >
                                    <option value="all">All Regions</option>
                                    {availableCities.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>

                            {/* Date Filter */}
                            <div>
                                <label htmlFor="date" className="sr-only">Date</label>
                                <input 
                                    type="date" 
                                    id="date" 
                                    value={selectedDate} 
                                    onChange={(e) => setSelectedDate(e.target.value)} 
                                    // THEME: Dark input field, Cyan focus ring
                                    className="px-3 py-2 border border-blue-700 bg-gray-900 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500" 
                                />
                            </div>
                        </div>
                        
                        {/* THEME: Export button to electric cyan (primary action) */}
                        <button className="bg-cyan-600 hover:bg-cyan-500 text-gray-900 px-4 py-2 rounded-md font-medium transition-colors flex items-center space-x-2 shadow-lg hover:shadow-cyan-500/50">
                            <Download className="h-4 w-4" />
                            <span>Export Data</span>
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {statsData.map((stat) => (
                        <StatsCard key={stat.title} {...stat} />
                    ))}
                </div>

                <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Regional Distribution Chart */}
                    <div className="lg:col-span-2 bg-gray-800 rounded-xl p-6 shadow-xl border border-blue-900">
                        <h3 className="text-xl font-semibold text-white mb-4 border-b pb-2 border-gray-700">Regional Consumption Trend</h3>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {['daily', 'weekly', 'monthly', 'yearly'].map(v => (
                                <button 
                                    key={v} 
                                    onClick={() => setView(v)} 
                                    // THEME: Trend button to use vibrant electric blue
                                    className={`px-4 py-1 text-sm font-medium rounded-full transition ${view === v ? 'bg-cyan-600 text-gray-900 shadow-md' : 'bg-gray-700 text-cyan-400 hover:bg-cyan-900'}`}
                                >
                                    {v.charAt(0).toUpperCase() + v.slice(1)}
                                </button>
                            ))}
                        </div>
                        <div className="h-96 w-full">
                            {chartData.labels.length > 0 ? (
                                <Bar options={chartOptions} data={chartData} /> 
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-500">
                                    <p>No historical transaction data available for this view.</p>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* City Performance List */}
                    <div className="lg:col-span-1 bg-gray-800 p-6 rounded-xl shadow-xl border border-blue-900">
                        <h2 className="text-xl font-semibold text-white mb-4 border-b pb-2 border-gray-700">Region Performance (Today)</h2>
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                            {dashboardMetrics.cityPerformance.length > 0 ? (
                                dashboardMetrics.cityPerformance.map(([city, amount]) => (
                                    <div key={city} className="flex justify-between items-center p-3 bg-blue-900 rounded-lg border border-cyan-900">
                                        <p className="font-semibold text-gray-300">{city}</p>
                                        {/* THEME: Consumption amount color to electric cyan */}
                                        <p className="font-bold text-cyan-400">{amount.toFixed(2)} L</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-center py-8">No consumption data for the current date/filters.</p>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default EmployeeDashboard;