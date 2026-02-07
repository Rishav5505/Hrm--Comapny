import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserCheck, UserX, TrendingUp, Plus, CalendarCheck, FileBarChart, Calendar, ChevronRight, Sparkles } from 'lucide-react';
import { getStats, getWeeklyStats, getRecentActivity } from '../services/api';
import { Skeleton } from '../components/ui/Skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

const StatCard = ({ title, value, icon: Icon, color, loading }) => (
    <div className="relative overflow-hidden bg-white dark:bg-slate-900 p-3 sm:p-8 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 group transition-all duration-300">
        <div className={`absolute top-0 right-0 w-16 sm:w-32 h-16 sm:h-32 bg-gradient-to-br ${color} opacity-10 rounded-bl-full -mr-4 sm:-mr-8 -mt-4 sm:-mt-8`}></div>

        <div className="relative z-10 flex flex-col items-center sm:items-start text-center sm:text-left h-full justify-between gap-1 sm:gap-4">
            <div className={`p-2 sm:p-4 rounded-lg sm:rounded-2xl bg-gradient-to-br ${color} text-white shadow-lg shadow-indigo-500/10 mb-1 sm:mb-0`}>
                <Icon size={16} className="sm:w-6 sm:h-6" />
            </div>

            <div className="flex-1">
                {loading ? (
                    <Skeleton className="h-6 w-10 sm:h-10 sm:w-16 mx-auto sm:mx-0" />
                ) : (
                    <h3 className="text-lg sm:text-4xl font-black text-slate-800 dark:text-white leading-tight">{value}</h3>
                )}
                <p className="text-[9px] sm:text-base text-slate-400 dark:text-slate-500 font-bold uppercase tracking-tighter sm:tracking-normal sm:capitalize whitespace-nowrap">{title}</p>
            </div>

            <div className="hidden sm:flex items-center gap-1 text-[10px] sm:text-xs font-semibold px-2 py-1 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                <TrendingUp size={14} /> +2%
            </div>
        </div>
    </div>
);

const Dashboard = () => {
    const [stats, setStats] = useState({ total_employees: 0, present_today: 0, absent_today: 0 });
    const [weeklyData, setWeeklyData] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const [statsRes, weeklyRes, recentRes] = await Promise.all([
                getStats(),
                getWeeklyStats(),
                getRecentActivity()
            ]);
            setStats(statsRes.data);
            setWeeklyData(weeklyRes.data);
            setRecentActivity(recentRes.data);
        } catch (err) {
            console.error("Failed to load stats", err);
        } finally {
            setLoading(false);
        }
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning ☀️';
        if (hour < 18) return 'Good Afternoon 🌤️';
        return 'Good Evening 🌙';
    };

    const downloadReport = () => {
        // Simple mock report generation
        const headers = ["Employee ID,Date,Status"];
        const rows = [
            `E001,${new Date().toISOString().split('T')[0]},Present`,
            `E002,${new Date().toISOString().split('T')[0]},Absent`,
        ];
        const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `attendance_report_${new Date().toLocaleDateString()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const quickActions = [
        {
            title: 'Add New Employee',
            desc: 'Register a new team member',
            icon: Plus,
            color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
            border: 'hover:border-blue-100 dark:hover:border-blue-900/50',
            path: '/employees'
        },
        {
            title: 'Mark Attendance',
            desc: 'Log daily attendance',
            icon: CalendarCheck,
            color: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
            border: 'hover:border-emerald-100 dark:hover:border-emerald-900/50',
            path: '/attendance'
        },
        {
            title: 'View Reports',
            desc: 'Analyze workforce data',
            icon: FileBarChart,
            color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
            border: 'hover:border-purple-100 dark:hover:border-purple-900/50',
            action: downloadReport
        },
        {
            title: 'Work Calendar',
            desc: 'Check holidays & shifts',
            icon: Calendar,
            color: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
            border: 'hover:border-orange-100 dark:hover:border-orange-900/50',
            path: '/calendar'
        }
    ];



    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                    <h2 className="text-2xl sm:text-4xl font-black text-slate-800 dark:text-white mb-2 tracking-tight transition-colors">{getGreeting()}, Admin</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-lg">Here's what's happening today.</p>
                </div>
                <div className="hidden md:block text-right bg-white dark:bg-slate-900 px-6 py-3 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Current Date</p>
                    <p className="text-lg font-bold text-slate-700 dark:text-slate-200">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-8">
                <StatCard
                    title="Employees"
                    value={stats.total_employees}
                    icon={Users}
                    color="from-blue-500 to-blue-600"
                    loading={loading}
                />
                <StatCard
                    title="Present"
                    value={stats.present_today}
                    icon={UserCheck}
                    color="from-emerald-500 to-emerald-600"
                    loading={loading}
                />
                <StatCard
                    title="Absent"
                    value={stats.absent_today}
                    icon={UserX}
                    color="from-rose-500 to-rose-600"
                    loading={loading}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Quick Actions */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 dark:border-slate-800 flex flex-col transition-colors">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                        🚀 Quick Actions
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 sm:gap-5 flex-1">
                        {quickActions.map((action, i) => (
                            <button
                                key={i}
                                onClick={() => action.path ? navigate(action.path) : action.action()}
                                className={`group relative p-4 sm:p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 ${action.border} hover:shadow-xl hover:shadow-slate-200/40 dark:hover:shadow-black/40 transition-all duration-300 text-left overflow-hidden h-full`}
                            >
                                <div className={`absolute top-0 right-0 w-16 sm:w-24 h-16 sm:h-24 ${action.color} opacity-10 rounded-bl-full -mr-3 sm:-mr-4 -mt-3 sm:-mt-4 transition-transform group-hover:scale-110`}></div>

                                <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-xl ${action.color} flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                                    <action.icon size={20} className="sm:w-6 sm:h-6" />
                                </div>

                                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm sm:text-lg mb-0.5 sm:mb-1 group-hover:text-primary transition-colors leading-tight">{action.title}</h4>
                                <p className="text-[10px] sm:text-sm text-slate-500 dark:text-slate-400 font-medium line-clamp-1 sm:line-clamp-none">{action.desc}</p>

                                <div className="absolute bottom-4 right-4 opacity-0 transform translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 hidden sm:block">
                                    <ChevronRight size={16} className="text-slate-300 dark:text-slate-600" />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Recent Activity Feed */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 dark:border-slate-800 transition-colors">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                        ⚡ Recent Activity
                    </h3>
                    <div className="space-y-6">
                        {loading ? (
                            Array(4).fill(0).map((_, i) => (
                                <div key={i} className="flex items-start gap-4">
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <div className="space-y-2 flex-1">
                                        <Skeleton className="h-3 w-3/4" />
                                        <Skeleton className="h-2 w-1/4" />
                                    </div>
                                </div>
                            ))
                        ) : recentActivity.length === 0 ? (
                            <p className="text-sm text-slate-400 text-center py-4 italic">No recent activity</p>
                        ) : (
                            recentActivity.map((activity, i) => (
                                <div key={i} className="flex items-start gap-4 group">
                                    <div className={`z-10 h-10 w-10 min-w-[2.5rem] rounded-full flex items-center justify-center font-bold text-sm ${activity.color} ring-4 ring-white dark:ring-slate-800 shadow-sm transition-all group-hover:scale-110`}>
                                        {activity.initial}
                                    </div>
                                    <div className="pt-1">
                                        <p className="text-sm text-slate-700 dark:text-slate-300">
                                            <span className="font-bold text-slate-900 dark:text-white">{activity.user}</span> {activity.action}.
                                        </p>
                                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-medium">{activity.time}</p>
                                    </div>
                                </div>
                            ))
                        )}
                        <div className="pt-2">
                            <button className="w-full py-3 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                                View All Activity
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Weekly Activity Chart (Premium Clean Redesign) */}
            <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] shadow-[0_8px_40px_rgba(0,0,0,0.03)] border border-slate-100 dark:border-slate-800 relative overflow-hidden group/chart transition-all duration-500">
                {/* Subtle background glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full -mr-32 -mt-32"></div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                        <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
                            <div className="h-8 w-1.5 bg-primary rounded-full"></div>
                            Weekly Attendance
                        </h3>
                        <p className="text-slate-400 dark:text-slate-500 text-sm font-medium mt-1">
                            Tracking team engagement over the rolling 7-day period
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                            <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_10px_rgba(79,70,229,0.4)]"></div>
                            <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">Efficiency</span>
                        </div>
                    </div>
                </div>

                <div className="h-60 sm:h-72 flex items-end justify-between gap-3 sm:gap-6 relative select-none">
                    {/* Horizontal Guide Lines */}
                    <div className="absolute inset-x-0 inset-y-0 flex flex-col justify-between pointer-events-none opacity-40 py-4">
                        {[100, 75, 50, 25, 0].map((v) => (
                            <div key={v} className="w-full border-t border-slate-100 dark:border-slate-800/50 flex justify-end">
                                <span className="text-[9px] font-bold text-slate-300 dark:text-slate-600 -mt-2.5 pr-1">{v}%</span>
                            </div>
                        ))}
                    </div>

                    {loading ? (
                        Array(7).fill(0).map((_, i) => (
                            <div key={i} className="flex-1 h-full flex flex-col items-center gap-4">
                                <Skeleton className="w-full max-w-[32px] flex-1 rounded-xl bg-slate-50 dark:bg-slate-800" />
                                <Skeleton className="h-3 w-8" />
                            </div>
                        ))
                    ) : (
                        (weeklyData.length > 0 ? weeklyData : [
                            { day: 'Mon', present: 0 }, { day: 'Tue', present: 0 }, { day: 'Wed', present: 0 },
                            { day: 'Thu', present: 0 }, { day: 'Fri', present: 0 }, { day: 'Sat', present: 0 }, { day: 'Sun', present: 0 }
                        ]).map((item, i) => (
                            <div
                                key={i}
                                className="flex-1 h-full flex flex-col items-center gap-4 group/pillar relative"
                            >
                                {/* Simple Modern Bar */}
                                <div className="w-full max-w-[36px] flex-1 bg-slate-50 dark:bg-slate-800/50 rounded-2xl relative overflow-hidden flex flex-col justify-end border border-slate-100 dark:border-slate-800 transition-all duration-300 group-hover/pillar:border-primary/20 group-hover/pillar:shadow-lg">
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${item.present || 5}%` }}
                                        transition={{ delay: i * 0.05, duration: 1, ease: "circOut" }}
                                        className="w-full bg-gradient-to-t from-primary/80 to-indigo-400 rounded-t-xl relative group-hover/pillar:from-primary group-hover/pillar:to-indigo-300 transition-all"
                                    >
                                        {/* Activity Glow */}
                                        <div className="absolute top-0 left-0 w-full h-1 bg-white/30 backdrop-blur-sm"></div>
                                    </motion.div>

                                    {/* Tooltip on Hover */}
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover/pillar:opacity-100 transition-all duration-300 pointer-events-none">
                                        <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-2 py-1 rounded-lg text-[10px] font-black shadow-xl">
                                            {item.present}%
                                        </div>
                                    </div>
                                </div>

                                <span className={`text-[10px] font-black tracking-widest uppercase transition-colors ${item.day === format(new Date(), 'EEE') ? 'text-primary' : 'text-slate-400 group-hover/pillar:text-slate-600 dark:group-hover/pillar:text-slate-200'}`}>
                                    {item.day}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
