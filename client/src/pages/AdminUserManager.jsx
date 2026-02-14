import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { User, Shield, Ban, CheckCircle } from 'lucide-react';

const AdminUserManager = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const querySnapshot = await getDocs(query(collection(db, 'users'), orderBy('name')));
            setUsers(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch users", error);
            setLoading(false);
        }
    };

    const toggleBlock = async (id, currentStatus) => {
        try {
            const userRef = doc(db, 'users', id);
            await updateDoc(userRef, { is_blocked: !currentStatus, updatedAt: new Date().toISOString() });
            setUsers(users.map(u => u.id === id ? { ...u, is_blocked: !currentStatus } : u));
        } catch (error) {
            console.error("Toggle Block Error", error);
            alert("Failed to update user status");
        }
    };

    if (loading) return <div>Loading Users...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold font-serif text-charcoal">User Management</h1>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="p-4 font-bold text-slate-700">User</th>
                            <th className="p-4 font-bold text-slate-700">Role</th>
                            <th className="p-4 font-bold text-slate-700">Status</th>
                            <th className="p-4 font-bold text-slate-700 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {users.map(user => (
                            <tr key={user.id} className="hover:bg-slate-50">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
                                            <User size={20} />
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-800">{user.name}</div>
                                            <div className="text-sm text-gray-500">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="p-4">
                                    {user.is_blocked ? (
                                        <span className="flex items-center gap-1 text-red-600 font-bold text-sm">
                                            <Ban size={14} /> Blocked
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-green-600 font-bold text-sm">
                                            <CheckCircle size={14} /> Active
                                        </span>
                                    )}
                                </td>
                                <td className="p-4 text-right">
                                    {user.role !== 'admin' && (
                                        <button
                                            onClick={() => toggleBlock(user.id, user.is_blocked)}
                                            className={`px-3 py-1 rounded text-sm font-bold border ${user.is_blocked
                                                ? 'border-green-500 text-green-600 hover:bg-green-50'
                                                : 'border-red-500 text-red-600 hover:bg-red-50'}`}
                                        >
                                            {user.is_blocked ? 'Unblock' : 'Block'}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminUserManager;
