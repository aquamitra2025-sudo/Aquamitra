import React from 'react';
import { Link } from 'react-router-dom';
import { 
    Droplets, 
    ArrowRight, 
    CheckCircle, 
    Users, 
    Shield, 
    BarChart3 
} from 'lucide-react';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        
        {/* === 1. Hero Section === */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Smart Water Management for
              <span className="text-blue-600 block">Sustainable Communities</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Aquamitra empowers communities and governments to monitor, manage, and optimize water usage through intelligent data analytics and real-time tracking.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/signup" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center"
              >
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link 
                to="/login" 
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </section>

        {/* === 2. What is Aquamitra? Section === */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">What is Aquamitra?</h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Aquamitra is a comprehensive water management platform that bridges the gap between households and government agencies. We provide real-time insights, predictive analytics, and seamless communication tools to ensure sustainable water usage across communities.
              </p>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-0.5" />
                  <span className="text-gray-700">Real-time water consumption tracking</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-0.5" />
                  <span className="text-gray-700">Predictive usage analytics</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-0.5" />
                  <span className="text-gray-700">Community-government collaboration tools</span>
                </div>
              </div>
            </div>
            {/* Visual Block */}
            <div className="bg-gradient-to-br from-blue-100 to-teal-100 rounded-2xl p-8 flex items-center justify-center">
              <Droplets className="h-32 w-32 text-blue-600" />
            </div>
          </div>
        </section>
        
        {/* Removed: <hr className="my-8" /> */}
        
        {/* === 3. Who We Are Section (Mission, Values, Approach) === */}
        <section className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Who We Are</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                We're a team of environmental engineers, data scientists, and policy experts committed to solving the world's water challenges through technology and collaboration.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {/* Mission Card */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Our Mission</h3>
                <p className="text-gray-600">
                  To democratize water management through transparent data and collaborative tools that empower both communities and governments.
                </p>
              </div>
              {/* Values Card */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Our Values</h3>
                <p className="text-gray-600">
                  Transparency, sustainability, and equity in water access. We believe every community deserves reliable water management tools.
                </p>
              </div>
              {/* Approach Card */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Our Approach</h3>
                <p className="text-gray-600">
                  Data-driven solutions that combine real-time monitoring with predictive analytics to optimize water distribution and usage.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Removed: <hr className="my-8" /> */}

        {/* === 4. Our Solutions Section (Household/Government) === */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Solutions</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Comprehensive tools designed for different stakeholders in the water management ecosystem
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Household Solution Card */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-blue-100">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">For Households</h3>
              <ul className="space-y-3 text-gray-600 mb-6">
                <li className="flex items-center space-x-3"><CheckCircle className="h-5 w-5 text-green-500" /><span>Track daily water consumption</span></li>
                <li className="flex items-center space-x-3"><CheckCircle className="h-5 w-5 text-green-500" /><span>View allocation vs. usage trends</span></li>
                <li className="flex items-center space-x-3"><CheckCircle className="h-5 w-5 text-green-500" /><span>Submit complaints and feedback</span></li>
                <li className="flex items-center space-x-3"><CheckCircle className="h-5 w-5 text-green-500" /><span>Receive conservation recommendations</span></li>
              </ul>
              <Link 
                to="/signup" 
                className="text-blue-600 hover:text-blue-700 font-semibold flex items-center"
              >
                Join as Household <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            {/* Government Solution Card */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-teal-100">
              <div className="w-16 h-16 bg-teal-100 rounded-xl flex items-center justify-center mb-6">
                <BarChart3 className="h-8 w-8 text-teal-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">For Government</h3>
              <ul className="space-y-3 text-gray-600 mb-6">
                <li className="flex items-center space-x-3"><CheckCircle className="h-5 w-5 text-green-500" /><span>Monitor regional water distribution</span></li>
                <li className="flex items-center space-x-3"><CheckCircle className="h-5 w-5 text-green-500" /><span>Analyze consumption patterns</span></li>
                <li className="flex items-center space-x-3"><CheckCircle className="h-5 w-5 text-green-500" /><span>Manage community complaints</span></li>
                <li className="flex items-center space-x-3"><CheckCircle className="h-5 w-5 text-green-500" /><span>Generate policy insights</span></li>
              </ul>
              <Link 
                to="/signup" 
                className="text-teal-600 hover:text-teal-700 font-semibold flex items-center"
              >
                Join as Government <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* === 5. CTA Section === */}
        <section className="bg-blue-600 py-16">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Transform Water Management?</h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of communities already using Aquamitra to build a sustainable future.
            </p>
            <Link 
              to="/signup" 
              className="bg-white text-blue-600 hover:bg-gray-50 px-8 py-3 rounded-lg font-semibold transition-colors inline-flex items-center"
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