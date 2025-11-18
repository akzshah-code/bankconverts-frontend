import React, { useState } from 'react';
import EditUserModal from './EditUserModal';

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
  plan: string;
  usage: {
    used: number;
    total: number;
  };
  planRenews: string;
}

// Simple demo data – backend-driven All Users table is handled in AdminPage.tsx
const initialUsers: AdminUser[] = [
  {
    id: 1,
    name: 'Admin',
    email: 'admin@bankconverts.com',
    role: 'admin',
    plan: 'Starter',
    usage: { used: 0, total: 500 },
    planRenews: '1 month from now',
  },
];

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  const handleSaveUser = (updatedUser: AdminUser) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === updatedUser.id ? updatedUser : user,
      ),
    );
    setEditingUser(null);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-brand-dark mb-6">
        All Users (local demo)
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm whitespace-nowrap">
          <thead className="border-b font-medium bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">
                User
              </th>
              <th scope="col" className="px-6 py-3">
                Subscription Plan
              </th>
              <th scope="col" className="px-6 py-3">
                Usage
              </th>
              <th scope="col" className="px-6 py-3">
                Plan Renews
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="font-semibold">
                    {user.name}{' '}
                    {user.role === 'admin' && '(Admin)'}
                  </div>
                  <div className="text-brand-gray">
                    {user.email}
                  </div>
                </td>
                <td className="px-6 py-4">{user.plan}</td>
                <td className="px-6 py-4">
                  {user.usage.used} / {user.usage.total}
                </td>
                <td className="px-6 py-4">{user.planRenews}</td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => setEditingUser(user)}
                    className="font-medium text-brand-blue hover:text-brand-blue/80"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-4 text-center text-gray-500"
                >
                  No users yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onSave={handleSaveUser}
          onClose={() => setEditingUser(null)}
        />
      )}
    </div>
  );
};

export default UserManagement;