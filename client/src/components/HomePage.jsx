// src/components/HomePage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { 
    ArrowRight, 
    CheckCircle, 
    Users, 
    Shield, 
    BarChart3,
    Youtube // New Icon for Video Link
} from 'lucide-react'; 
import logoPath from '../assets/logo.png'; 
// import videoPath from '../assets/AQUA-MITRA-2-1.mp4'; // REMOVED: No longer using local video file

// --- Placeholder for Google Drive Link ---
// NOTE: Replace 'YOUR_GOOGLE_DRIVE_LINK_HERE' with the actual shared link
const GOOGLE_DRIVE_VIDEO_LINK = 'https://drive.google.com/file/d/1oNWpC97BYlX6VDvk_kWQ_LkqtIHG9TBA/view?usp=sharing'; 
// ------------------------------------------

// --- Custom Logo Component (Navbar/Hero Size) ---
const CustomLogo = () => (
    // Use the imported path
    <img src={logoPath} alt="Aquamitra Logo" className="h-10 w-10 drop-shadow-lg object-contain" />
);
// --- End Custom Logo Component ---

const HomePage = () => {
    return (
        // THEME: Background to deep-water blue/indigo gradient
        <div className="min-h-screen bg-indigo-950 text-white">
            <div className="min-h-screen bg-gradient-to-b from-indigo-950 to-gray-900">
                
                {/* === 1. Hero Section === */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-6xl font-bold font-serif text-white mb-6">
                            EMPOWERING EVERY DROP,
                            <span className="text-cyan-400 block">EVERY HOME</span>
                        </h1>
                        <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                            Aquamitra empowers communities and governments to monitor, manage, and optimize water usage through intelligent data analytics and real-time tracking, ensuring the vital flow of water for future generations.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link 
                                to="/signup" 
                                // THEME: Primary button to electric cyan
                                className="bg-cyan-600 hover:bg-cyan-500 text-gray-900 px-8 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center shadow-lg hover:shadow-cyan-500/50"
                            >
                                Get Started <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                            <Link 
                                to="/login" 
                                // THEME: Secondary button to indigo border with white text
                                className="border-2 border-indigo-500 text-indigo-300 hover:bg-indigo-900 px-8 py-3 rounded-lg font-semibold transition-colors"
                            >
                                Sign In
                            </Link>
                        </div>
                    </div>
                </section>

                {/* --- */}

                {/* === 2. What is Aquamitra? Section === */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold font-serif text-white mb-6">What is Aquamitra?</h2>
                            <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                                Aquamitra is a comprehensive water management platform that bridges the gap between households and government agencies. We provide real-time insights, predictive analytics, and seamless communication tools to ensure sustainable water usage across communities.
                            </p>
                            <div className="space-y-4 mb-6"> {/* Added margin bottom to separate from link */}
                                {/* THEME: Check circles to sharp cyan */}
                                <div className="flex items-start space-x-3">
                                    <CheckCircle className="h-6 w-6 text-cyan-400 mt-0.5" />
                                    <span className="text-gray-300">Real-time water consumption tracking</span>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <CheckCircle className="h-6 w-6 text-cyan-400 mt-0.5" />
                                    <span className="text-gray-300">Predictive usage analytics</span>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <CheckCircle className="h-6 w-6 text-cyan-400 mt-0.5" />
                                    <span className="text-gray-300">Community-government collaboration tools</span>
                                </div>
                            </div>

                            {/* === NEW: Google Drive Link Button === */}
                            <a 
                                href={GOOGLE_DRIVE_VIDEO_LINK} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center bg-indigo-700 hover:bg-indigo-600 text-white px-5 py-2 rounded-lg font-semibold transition-colors shadow-lg mt-4"
                            >
                                Watch Platform Demo (Google Drive) <Youtube className="ml-2 h-5 w-5" />
                            </a>
                            {/* ================================== */}

                        </div>
                        
                        {/* === IMAGE BLOCK ADDED HERE (Replacing Video) === */}
                        {/* Use the logo or a placeholder image to maintain layout and style */}
                        <div className="bg-gray-800/50 rounded-2xl p-4 flex items-center justify-center shadow-xl border border-blue-800">
                            <div className="w-full h-80 rounded-xl flex items-center justify-center bg-gray-900 border border-cyan-700/50 relative overflow-hidden">
                                <CustomLogo />
                                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent flex items-end justify-center pb-4">
                                    <p className="text-cyan-400 font-bold text-lg">Click button on the left to view demo</p>
                                </div>
                            </div>
                        </div>
                        {/* ================================================== */}
                    </div>
                </section>

                {/* --- */}

                {/* === 3. Who We Are Section (Mission, Values, Approach) === */}
                <section className="bg-gray-900 py-16 border-t border-b border-indigo-900">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold font-serif text-white mb-4">The Core of Aquamitra</h2>
                            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
                                We're a team of environmental engineers, data scientists, and policy experts committed to solving the world's water challenges through technology and collaboration.
                            </p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8">
                            {/* Mission Card */}
                            <div className="bg-gray-800 rounded-xl p-6 shadow-md border border-indigo-700">
                                {/* THEME: Icon background/color to electric blue */}
                                <div className="w-12 h-12 bg-blue-900 rounded-lg flex items-center justify-center mb-4 border border-blue-700">
                                    <Users className="h-6 w-6 text-blue-400" />
                                </div>
                                <h3 className="text-xl font-semibold font-serif text-white mb-2">Our Mission: Equity</h3>
                                <p className="text-gray-400">
                                    To democratize water management through transparent data and collaborative tools that empower both communities and governments.
                                </p>
                            </div>
                            {/* Values Card */}
                            <div className="bg-gray-800 rounded-xl p-6 shadow-md border border-indigo-700">
                                {/* THEME: Icon background/color to contrasting purple */}
                                <div className="w-12 h-12 bg-fuchsia-900 rounded-lg flex items-center justify-center mb-4 border border-fuchsia-700">
                                    <Shield className="h-6 w-6 text-fuchsia-400" />
                                </div>
                                <h3 className="text-xl font-semibold font-serif text-white mb-2">Our Values: Clarity</h3>
                                <p className="text-gray-400">
                                    Transparency, sustainability, and equity in water access. We believe every community deserves reliable water management tools.
                                </p>
                            </div>
                            {/* Approach Card */}
                            <div className="bg-gray-800 rounded-xl p-6 shadow-md border border-indigo-700">
                                {/* THEME: Icon background/color to bright cyan */}
                                <div className="w-12 h-12 bg-cyan-900 rounded-lg flex items-center justify-center mb-4 border border-cyan-700">
                                    <BarChart3 className="h-6 w-6 text-cyan-400" />
                                </div>
                                <h3 className="text-xl font-semibold font-serif text-white mb-2">Our Approach: Data</h3>
                                <p className="text-gray-400">
                                    Data-driven solutions that combine real-time monitoring with predictive analytics to optimize water distribution and usage.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- */}

                {/* === 4. Our Solutions Section (Household/Government) === */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold font-serif text-white mb-4">Optimized Solutions for Every Stakeholder</h2>
                        <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                            Comprehensive tools designed for different stakeholders in the water management ecosystem
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Household Solution Card */}
                        <div className="bg-gray-800 rounded-2xl p-8 shadow-xl border-t-4 border-cyan-500 transition-shadow hover:shadow-cyan-500/30">
                            <div className="w-16 h-16 bg-cyan-900 rounded-xl flex items-center justify-center mb-6 border border-cyan-700">
                                <Users className="h-8 w-8 text-cyan-400" />
                            </div>
                            <h3 className="text-2xl font-bold font-serif text-white mb-4">For Households: Empowering Users</h3>
                            <ul className="space-y-3 text-gray-400 mb-6">
                                {/* THEME: Check circles to cyan */}
                                <li className="flex items-center space-x-3"><CheckCircle className="h-5 w-5 text-cyan-500" /><span>Track daily water consumption</span></li>
                                <li className="flex items-center space-x-3"><CheckCircle className="h-5 w-5 text-cyan-500" /><span>View allocation vs. usage trends</span></li>
                                <li className="flex items-center space-x-3"><CheckCircle className="h-5 w-5 text-cyan-500" /><span>Submit complaints and feedback</span></li>
                                <li className="flex items-center space-x-3"><CheckCircle className="h-5 w-5 text-cyan-500" /><span>Receive conservation recommendations</span></li>
                            </ul>
                            {/* THEME: Link color to cyan */}
                            <Link 
                                to="/signup" 
                                className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center group"
                            >
                                Join as Household <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                        {/* Government Solution Card */}
                        <div className="bg-gray-800 rounded-2xl p-8 shadow-xl border-t-4 border-indigo-500 transition-shadow hover:shadow-indigo-500/30">
                            <div className="w-16 h-16 bg-indigo-900 rounded-xl flex items-center justify-center mb-6 border border-indigo-700">
                                <BarChart3 className="h-8 w-8 text-indigo-400" />
                            </div>
                            <h3 className="text-2xl font-bold font-serif text-white mb-4">For Government: Informed Policy</h3>
                            <ul className="space-y-3 text-gray-400 mb-6">
                                {/* THEME: Check circles to purple/indigo */}
                                <li className="flex items-center space-x-3"><CheckCircle className="h-5 w-5 text-fuchsia-500" /><span>Monitor regional water distribution</span></li>
                                <li className="flex items-center space-x-3"><CheckCircle className="h-5 w-5 text-fuchsia-500" /><span>Analyze consumption patterns</span></li>
                                <li className="flex items-center space-x-3"><CheckCircle className="h-5 w-5 text-fuchsia-500" /><span>Manage community complaints</span></li>
                                <li className="flex items-center space-x-3"><CheckCircle className="h-5 w-5 text-fuchsia-500" /><span>Generate policy insights</span></li>
                            </ul>
                            {/* THEME: Link color to indigo */}
                            <Link 
                                to="/signup" 
                                className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center group"
                            >
                                Join as Government <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* --- */}

                {/* === 5. CTA Section === */}
                <section className="bg-indigo-900 py-16 border-t border-cyan-900">
                    <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl font-bold font-serif text-white mb-4">Ready to Dive into Smart Water Management?</h2>
                        <p className="text-xl text-indigo-300 mb-8">
                            Join thousands of communities already using Aquamitra to build a sustainable future.
                        </p>
                        <Link 
                            to="/signup" 
                            // THEME: Button to a bright, contrasting color (Cyan)
                            className="bg-cyan-500 text-gray-900 hover:bg-cyan-400 px-8 py-3 rounded-lg font-bold transition-colors inline-flex items-center shadow-lg shadow-cyan-500/30"
                        >
                            Start Today <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default HomePage;