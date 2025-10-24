import React, { useState, useEffect, useMemo } from 'react';
import useAuth from '../hooks/useauth';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { format, subDays, startOfWeek, getWeek, getYear, isToday } from 'date-fns';
import { Droplets, TrendingUp, AlertTriangle, Users, Download, Filter } from 'lucide-react'; // Lucide icons

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


    useEffect(() => {
        if (!employeeId) return;

        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // NOTE: Passing selectedCity for filtering API results
                const response = await axios.get(`https://aquamitra-1.onrender.com/api/employee/dashboard/${employeeId}`, {
                    params: { city: selectedCity, date: selectedDate }
                });
                
                setEmployeeDetails(response.data.employeeDetails);
                setTransactions(response.data.transactions);
                
                // Assuming your API returns a clean list of available cities/regions
                if (response.data.cities) {
                    setAvailableCities(response.data.cities);
                } else {
                    // Placeholder regions if API doesn't return them or for initial load
                    setAvailableCities(["Pallavaram", "Tambaram", "Poonamalle", "Avadi", "Mangadu", "Kundrathur", "Thiruverkadu", "Thiruninravur", "Maraimalai Nagar", "Chengalpattu"]);
                }

            } catch (err) {
                setError(err.response?.data?.message || "Could not load dashboard data.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [employeeId, selectedCity, selectedDate]); // Dependency on selectedDate/City triggers re-fetch

    // Calculate high-level metrics for the cards at the top (Your original logic remains)
    const dashboardMetrics = useMemo(() => {
        const todaysTransactions = transactions.filter(t => isToday(new Date(t.timestamp)));
        const totalConsumptionToday = todaysTransactions.reduce((acc, curr) => acc + curr.amount, 0);

        const consumptionByCity = todaysTransactions.reduce((acc, curr) => {
            acc[curr.city] = (acc[curr.city] || 0) + curr.amount;
            return acc;
        }, {});

        const totalAllocated = transactions.reduce((acc, curr) => acc + (curr.allocated || 0), 0); // Assuming allocated data is in transactions
        const totalRemaining = totalAllocated - totalConsumptionToday;
        
        const topCity = Object.entries(consumptionByCity).sort((a, b) => b[1] - a[1])[0];

        return {
            totalAllocated,
            totalConsumptionToday,
            totalRemaining,
            totalHouseholds: transactions.length, // Simplified count
            cityCount: selectedCity === 'all' ? availableCities.length : 1,
            consumptionPercentage: totalAllocated > 0 ? (totalConsumptionToday / totalAllocated) * 100 : 0,
            topCityToday: topCity ? { name: topCity[0], amount: topCity[1] } : { name: 'N/A', amount: 0 },
            cityPerformance: Object.entries(consumptionByCity).sort((a, b) => b[1] - a[1])
        };
    }, [transactions, availableCities, selectedCity]);
    
    // Chart Data Aggregation (Your original logic remains)
    const chartData = useMemo(() => {
        // ... (Your original chart data logic is here) ...
        if (transactions.length === 0) return { labels: [], datasets: [] };

        const timeAggregatedData = {};
        // Use availableCities to ensure consistent chart colors even if some data is missing
        const citiesInDataset = availableCities.filter(c => c !== 'All Regions').sort(); 
        const now = new Date();

        transactions.forEach(t => {
            const date = new Date(t.timestamp);
            let key;
            switch (view) {
                case 'weekly': key = format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-ww'); break;
                case 'monthly': key = format(date, 'yyyy-MM'); break;
                case 'yearly': key = getYear(date).toString(); break;
                default: // Daily - showing last 7 days
                    if (date < subDays(now, 6)) return;
                    key = format(date, 'yyyy-MM-dd'); break;
            }
            if (!timeAggregatedData[key]) {
                timeAggregatedData[key] = { date: date, ...Object.fromEntries(citiesInDataset.map(c => [c, 0])) };
            }
            // Ensure data point is associated with a known city
            if (t.city && citiesInDataset.includes(t.city)) {
                 timeAggregatedData[key][t.city] = (timeAggregatedData[key][t.city] || 0) + t.amount;
            }
        });
        
        const sortedData = Object.entries(timeAggregatedData).sort((a, b) => a[1].date - b[1].date);
        
        // This is complex multi-series data, simplify labels for clarity
        const labels = sortedData.map(([key, value]) => {
            switch (view) {
                case 'weekly': return `Week ${getWeek(value.date, { weekStartsOn: 1 })}`;
                case 'monthly': return format(value.date, 'MMM yyyy');
                case 'yearly': return key;
                default: return format(value.date, 'MMM d');
            }
        });

        // Generate consistent colors for cities
        const datasets = citiesInDataset.map((city, index) => ({
            label: city,
            data: sortedData.map(([key, value]) => value[city] || 0),
            backgroundColor: `hsl(${(index * 30 + 200) % 360}, 70%, 60%)`, // Use HSL for dynamic but distinct colors
        }));

        return { labels, datasets };
    }, [transactions, view, availableCities]);

    const chartOptions = {
        plugins: { 
            title: { display: true, text: `Water Consumption Trends`, font: { size: 16, weight: 'bold' } },
            legend: { position: 'bottom' }
        },
        responsive: true,
        maintainAspectRatio: false,
        scales: { 
            x: { stacked: true }, 
            y: { stacked: true, beginAtZero: true, title: { display: true, text: 'Consumption (Liters)' } } 
        },
    };

    if (loading && !employeeDetails) return <div className="min-h-screen flex items-center justify-center font-semibold text-lg">Loading Dashboard...</div>;
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-600 font-semibold p-4 text-center">{error}</div>;

    const statsData = [
        { 
            title: "Total Allocated", 
            value: `${dashboardMetrics.totalAllocated.toFixed(0)}L`, 
            detail: `${dashboardMetrics.totalHouseholds} households`, 
            Icon: Droplets, 
            bgColor: 'bg-blue-100', 
            textColor: 'text-blue-600' 
        },
        { 
            title: "Total Consumed", 
            value: `${dashboardMetrics.totalConsumptionToday.toFixed(0)}L`, 
            detail: `${dashboardMetrics.consumptionPercentage.toFixed(0)}% of allocation`, 
            Icon: TrendingUp, 
            bgColor: 'bg-green-100', 
            textColor: 'text-green-600' 
        },
        { 
            title: "Total Remaining", 
            value: `${dashboardMetrics.totalRemaining.toFixed(0)}L`, 
            detail: "Available today", 
            Icon: AlertTriangle, 
            bgColor: 'bg-orange-100', 
            textColor: 'text-orange-600' 
        },
        { 
            title: "Active Households", 
            value: `${dashboardMetrics.totalHouseholds}`, 
            detail: "In selected region", 
            Icon: Users, 
            bgColor: 'bg-purple-100', 
            textColor: 'text-purple-600' 
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Government Dashboard</h1>
                    <p className="text-gray-600">Monitor regional water distribution and household consumption</p>
                </div>
                
                {/* Filters and Export */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                            <div className="flex items-center space-x-2">
                                <Filter className="h-5 w-5 text-gray-500" />
                                <span className="text-sm font-medium text-gray-700">Filters:</span>
                            </div>
                            
                            {/* Region Filter */}
                            <div>
                                <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                                <select 
                                    id="region" 
                                    value={selectedCity} 
                                    onChange={(e) => setSelectedCity(e.target.value)} 
                                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="all">All Regions</option>
                                    {availableCities.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>

                            {/* Date Filter */}
                            <div>
                                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                <input 
                                    type="date" 
                                    id="date" 
                                    value={selectedDate} 
                                    onChange={(e) => setSelectedDate(e.target.value)} 
                                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                />
                            </div>
                        </div>
                        
                        <button className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md font-medium transition-colors flex items-center space-x-2">
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
                    <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Regional Consumption Trend</h3>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {['daily', 'weekly', 'monthly', 'yearly'].map(v => (
                                <button key={v} onClick={() => setView(v)} className={`px-4 py-1 text-sm font-medium rounded-md transition ${view === v ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                                    {v.charAt(0).toUpperCase() + v.slice(1)}
                                </button>
                            ))}
                        </div>
                        <div className="h-96">
                            <Bar options={chartOptions} data={chartData} /> 
                        </div>
                    </div>
                    
                    {/* City Performance List */}
                    <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">City Performance (Today)</h2>
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                            {dashboardMetrics.cityPerformance.length > 0 ? (
                                dashboardMetrics.cityPerformance.map(([city, amount]) => (
                                    <div key={city} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                        <p className="font-semibold text-gray-800">{city}</p>
                                        <p className="font-bold text-blue-600">{amount.toFixed(2)} L</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-center">No consumption data for today.</p>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default EmployeeDashboard;