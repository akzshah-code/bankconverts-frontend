// src/components/admin/EditUserModal.tsx

import React, {
  useState,
  useEffect,
  FormEvent,
  ChangeEvent,
} from 'react';

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

interface EditUserModalProps {
  user: AdminUser;
  onSave: (user: AdminUser) => void;
  onClose: () => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({
  user,
  onSave,
  onClose,
}) => {
  const [formData, setFormData] =
    useState<AdminUser>(user);

  useEffect(() => {
    setFormData(user);
  }, [user]);

  const handleChange = (
    e: ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    if (name === 'usageUsed' || name === 'usageTotal') {
      const key = name === 'usageUsed' ? 'used' : 'total';
      setFormData((prev) => ({
        ...prev,
        usage: {
          ...prev.usage,
          [key]: parseInt(value, 10) || 0,
        },
      }));
    } else if (name === 'planRenews') {
      setFormData((prev) => ({
        ...prev,
        planRenews: value,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-brand-dark">
            Edit User
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-blue focus:border-brand-blue"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email (read-only)
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              readOnly
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
            />
          </div>
          <div>
            <label
              htmlFor="plan"
              className="block text-sm font-medium text-gray-700"
            >
              Subscription Plan
            </label>
            <select
              id="plan"
              name="plan"
              value={formData.plan}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-blue focus:border-brand-blue"
            >
              <option>Free</option>
              <option>Starter</option>
              <option>Professional</option>
              <option>Business</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="usageUsed"
                className="block text-sm font-medium text-gray-700"
              >
                Usage Used
              </label>
              <input
                type="number"
                id="usageUsed"
                name="usageUsed"
                value={formData.usage.used}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-blue focus:border-brand-blue"
              />
            </div>
            <div>
              <label
                htmlFor="usageTotal"
                className="block text-sm font-medium text-gray-700"
              >
                Usage Total
              </label>
              <input
                type="number"
                id="usageTotal"
                name="usageTotal"
                value={formData.usage.total}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-blue focus:border-brand-blue"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="planRenews"
              className="block text-sm font-medium text-gray-700"
            >
              Plan Renews
            </label>
            <input
              type="text"
              id="planRenews"
              name="planRenews"
              value={formData.planRenews}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-blue focus:border-brand-blue"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md font-semibold hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-brand-blue text-white px-4 py-2 rounded-md font-semibold hover:bg-opacity-90"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;