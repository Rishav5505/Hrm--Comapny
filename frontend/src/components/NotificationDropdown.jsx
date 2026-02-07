import React, { useEffect, useState } from 'react';
import { getNotifications, markAsRead, markAllRead } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Trash2, X, AlertCircle, Info, CheckCircle2, Clock } from 'lucide-react';
import { format } from 'date-fns';

const NotificationDropdown = ({ isOpen, onClose, onUpdate }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    const fetchNotifications = async () => {
        try {
            const { data } = await getNotifications();
            setNotifications(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkRead = async (id) => {
        try {
            await markAsRead(id);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, is_read: true } : n));
            onUpdate();
        } catch (err) {
            console.error(err);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllRead();
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            onUpdate();
        } catch (err) {
            console.error(err);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'success': return <CheckCircle2 className="text-emerald-500" size={18} />;
            case 'warning': return <AlertCircle className="text-amber-500" size={18} />;
            case 'error': return <X className="text-rose-500" size={18} />;
            default: return <Info className="text-blue-500" size={18} />;
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 z-40" onClick={onClose}></div>
            <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-4 w-96 bg-white dark:bg-slate-900 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 dark:border-slate-800 z-50 overflow-hidden"
            >
                <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                    <h3 className="font-black text-slate-800 dark:text-white flex items-center gap-2">
                        <Bell size={18} className="text-primary" /> Notifications
                    </h3>
                    {notifications.some(n => !n.is_read) && (
                        <button
                            onClick={handleMarkAllRead}
                            className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-indigo-400 transition-colors"
                        >
                            Mark all read
                        </button>
                    )}
                </div>

                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="p-10 text-center"><div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div></div>
                    ) : notifications.length === 0 ? (
                        <div className="p-10 text-center text-slate-400">
                            <Bell size={40} className="mx-auto mb-4 opacity-10" />
                            <p className="text-sm font-medium italic">No new notifications</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-50 dark:divide-slate-800">
                            {notifications.map((notif) => (
                                <div
                                    key={notif._id}
                                    className={`p-5 flex gap-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 group ${!notif.is_read ? 'bg-indigo-50/30 dark:bg-primary/5' : ''}`}
                                >
                                    <div className={`h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 ${notif.is_read ? 'bg-slate-100 dark:bg-slate-800' : 'bg-white dark:bg-slate-800 shadow-sm'}`}>
                                        {getIcon(notif.type)}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex justify-between items-start">
                                            <p className={`text-sm font-bold ${notif.is_read ? 'text-slate-600 dark:text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                                                {notif.title}
                                            </p>
                                            {!notif.is_read && (
                                                <button
                                                    onClick={() => handleMarkRead(notif._id)}
                                                    className="p-1 rounded-lg bg-primary/10 text-primary opacity-0 group-hover:opacity-100 transition-all"
                                                >
                                                    <Check size={12} />
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                            {notif.message}
                                        </p>
                                        <div className="flex items-center gap-1.5 pt-1 text-[10px] font-bold text-slate-400">
                                            <Clock size={10} />
                                            {format(new Date(notif.created_at), 'hh:mm a, MMM dd')}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-4 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-50 dark:border-slate-800">
                    <button className="w-full py-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        View All Notification Settings
                    </button>
                </div>
            </motion.div>
        </>
    );
};

export default NotificationDropdown;
