import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Save, LogOut } from 'lucide-react';
import api from '../services/api';

const ProfilePage = () => {
    const { user, login } = useAuth();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setName(user.name);
            setEmail(user.email);
        } else {
            navigate('/login');
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            setLoading(true);
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`,
                },
            };

            const { data } = await api.put(
                '/auth/profile',
                { name, password },
                config
            );

            // Update context
            login(data);
            setMessage('Profile updated successfully');
            setPassword('');
            setConfirmPassword('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0F172A] pt-10 pb-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
            <div className="w-full max-w-2xl">
                {/* Header Section */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white tracking-tight">Account Settings</h1>
                    <p className="mt-2 text-gray-400">Manage your profile information and security</p>
                </div>

                <div className="bg-[#1E293B] rounded-2xl border border-slate-700 shadow-2xl overflow-hidden">
                    {/* User Avatar Banner */}
                    <div className="bg-gradient-to-r from-red-900/50 to-slate-900/50 p-8 flex items-center gap-6 border-b border-slate-700">
                        <div className="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg ring-4 ring-[#1E293B]">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">{user?.name}</h2>
                            <p className="text-gray-400 flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                {user?.email}
                            </p>
                        </div>
                    </div>

                    <div className="p-8">
                        {message && (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 px-4 py-3 rounded-lg flex items-center gap-2 mb-6">
                                <Save className="w-5 h-5" />
                                {message}
                            </div>
                        )}
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-lg mb-6">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Personal Information */}
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
                                    <User className="w-5 h-5 text-red-500" />
                                    Personal Information
                                </h3>
                                <div className="grid gap-8">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-300 ">Name</label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full bg-[#0F172A] border border-slate-600 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder-gray-600"
                                            placeholder="Your full name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-300">Email Address</label>
                                        <input
                                            type="email"
                                            value={email}
                                            disabled
                                            className="w-full bg-[#0F172A]/50 border border-slate-700 rounded-xl px-5 py-4 text-gray-400 cursor-not-allowed"
                                            placeholder="example@gmail.com"
                                        />
                                        <p className="text-xs text-gray-500 pt-1">Linked to your account. Cannot be changed.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Security Section */}
                            <div className="pt-8 border-t border-slate-700">
                                <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                                    <Lock className="w-5 h-5 text-red-500" />
                                    Security
                                </h3>
                                <div className="grid gap-8 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-300">New Password (Optional)</label>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-[#0F172A] border border-slate-600 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder-gray-600"
                                            placeholder="Min 6 characters"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-300">Confirm Password</label>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full bg-[#0F172A] border border-slate-600 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder-gray-600"
                                            placeholder="Re-enter password"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="pt-6 border-t border-slate-700 flex items-center justify-between">
                                <button
                                    type="button"
                                    onClick={() => navigate('/my-bookings')}
                                    className="text-gray-400 hover:text-white transition-colors text-sm font-medium hover:underline"
                                >
                                    &larr; Back to My Bookings
                                </button>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-red-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-red-700 active:scale-95 transition-all shadow-lg shadow-red-900/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Saving Changes...' : 'Save Profile'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
