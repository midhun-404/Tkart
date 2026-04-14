import React from 'react';
import DealManager from '../components/admin/DealManager';

const AdminDealManager = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold font-serif text-slate-800">Manage Deal of the Day</h1>
            <p className="text-gray-500">Set a product as the daily deal, configure the discount, and set the timer.</p>

            <DealManager />
        </div>
    );
};

export default AdminDealManager;
