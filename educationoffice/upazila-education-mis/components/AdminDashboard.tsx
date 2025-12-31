
import React, { useState } from 'react';
import { User, UserRole, Form, FieldType, School, Upazila, FormField } from '../types';

interface AdminDashboardProps {
  forms: Form[];
  setForms: React.Dispatch<React.SetStateAction<Form[]>>;
  schools: School[];
  upazilas: Upazila[];
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ forms, setForms, schools, upazilas, users, setUsers }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'forms' | 'users'>('overview');
  const [isCreatingForm, setIsCreatingForm] = useState(false);
  const [newForm, setNewForm] = useState<Partial<Form>>({
    title: '',
    description: '',
    fields: [],
    isActive: true,
    deadline: ''
  });

  const addField = () => {
    const field: FormField = {
      id: `fd-${Date.now()}`,
      label: '',
      type: FieldType.TEXT,
      required: true,
      options: []
    };
    setNewForm(prev => ({ ...prev, fields: [...(prev.fields || []), field] }));
  };

  const updateField = (index: number, updates: Partial<FormField>) => {
    const fields = [...(newForm.fields || [])];
    fields[index] = { ...fields[index], ...updates };
    setNewForm({ ...newForm, fields });
  };

  const saveForm = () => {
    if (!newForm.title || !newForm.fields?.length) {
      alert('অনুগ্রহ করে শিরোনাম এবং কমপক্ষে একটি ফিল্ড যোগ করুন।');
      return;
    }
    const form: Form = {
      ...newForm as Form,
      id: `f-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setForms([form, ...forms]);
    setIsCreatingForm(false);
    setNewForm({ title: '', description: '', fields: [], isActive: true, deadline: '' });
  };

  const deleteUser = (userId: string) => {
    if (confirm('আপনি কি নিশ্চিত যে আপনি এই ব্যবহারকারীকে মুছে ফেলতে চান?')) {
      setUsers(prev => prev.filter(u => u.id !== userId));
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN: return 'এডমিন';
      case UserRole.UPAZILA: return 'উপজেলা ইউজার';
      case UserRole.SCHOOL: return 'স্কুল ইউজার';
      default: return 'অজানা';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex border-b border-gray-200">
        <button 
          onClick={() => setActiveTab('overview')} 
          className={`px-6 py-3 font-semibold text-sm transition-colors ${activeTab === 'overview' ? 'border-b-2 border-emerald-700 text-emerald-700' : 'text-gray-500 hover:text-emerald-600'}`}
        >
          📊 ওভারভিউ
        </button>
        <button 
          onClick={() => setActiveTab('forms')} 
          className={`px-6 py-3 font-semibold text-sm transition-colors ${activeTab === 'forms' ? 'border-b-2 border-emerald-700 text-emerald-700' : 'text-gray-500 hover:text-emerald-600'}`}
        >
          📝 ফরম ব্যবস্থাপনা
        </button>
        <button 
          onClick={() => setActiveTab('users')} 
          className={`px-6 py-3 font-semibold text-sm transition-colors ${activeTab === 'users' ? 'border-b-2 border-emerald-700 text-emerald-700' : 'text-gray-500 hover:text-emerald-600'}`}
        >
          👥 ব্যবহারকারী ব্যবস্থাপনা
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
              <div className="bg-blue-100 p-3 rounded-full text-blue-600 text-2xl">🏫</div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">মোট বিদ্যালয়</p>
                <p className="text-2xl font-bold text-gray-800">{schools.length}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
              <div className="bg-emerald-100 p-3 rounded-full text-emerald-600 text-2xl">📍</div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">মোট উপজেলা</p>
                <p className="text-2xl font-bold text-gray-800">{upazilas.length}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
              <div className="bg-orange-100 p-3 rounded-full text-orange-600 text-2xl">📄</div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">চলমান ফরম</p>
                <p className="text-2xl font-bold text-gray-800">{forms.filter(f => f.isActive).length}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
              <div className="bg-purple-100 p-3 rounded-full text-purple-600 text-2xl">👥</div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">ব্যবহারকারী</p>
                <p className="text-2xl font-bold text-gray-800">{users.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold mb-6 text-emerald-800">সাম্প্রতিক কার্যক্রম</h3>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl border border-dashed flex justify-between items-center">
                <p className="text-sm text-gray-600">সিস্টেমের সকল মডিউল সচল রয়েছে।</p>
                <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">ONLINE</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'forms' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">গ্লোবাল ডাটা ফরম তালিকা</h2>
            <button 
              onClick={() => setIsCreatingForm(true)}
              className="bg-emerald-700 text-white px-5 py-2.5 rounded-xl hover:bg-emerald-800 shadow-lg transition transform active:scale-95 font-bold"
            >
              + নতুন ডাটা ফরম তৈরি করুন
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {forms.map(form => (
              <div key={form.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition group">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-bold text-emerald-800 text-lg group-hover:text-emerald-700">{form.title}</h4>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${form.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                    {form.isActive ? 'সক্রিয়' : 'বন্ধ'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-6 h-8 line-clamp-2">{form.description || 'কোনো বর্ণনা নেই'}</p>
                <div className="flex justify-between items-center pt-4 border-t">
                  <span className="text-[10px] text-gray-400 font-bold uppercase">ফিল্ড: {form.fields.length} | ডেডলাইন: {form.deadline || 'নেই'}</span>
                  <div className="flex gap-3">
                    <button className="text-blue-600 hover:underline text-xs font-bold">সম্পাদনা</button>
                    <button onClick={() => setForms(prev => prev.filter(f => f.id !== form.id))} className="text-red-500 hover:underline text-xs font-bold">মুছে ফেলুন</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">নিবন্ধিত ব্যবহারকারী তালিকা</h2>
            <p className="text-sm text-gray-500 font-medium">মোট ব্যবহারকারী: {users.length}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="px-6 py-4 font-bold text-gray-700 text-sm">নাম ও পদবী</th>
                    <th className="px-6 py-4 font-bold text-gray-700 text-sm">ইমেইল ও মোবাইল</th>
                    <th className="px-6 py-4 font-bold text-gray-700 text-sm">রোল (Role)</th>
                    <th className="px-6 py-4 font-bold text-gray-700 text-sm">অফিস/এলাকা</th>
                    <th className="px-6 py-4 font-bold text-gray-700 text-sm text-center">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map(user => {
                    const userUpazila = upazilas.find(u => u.id === user.upazilaId);
                    const userSchool = schools.find(s => s.id === user.schoolId);
                    return (
                      <tr key={user.id} className="hover:bg-gray-50/50 transition">
                        <td className="px-6 py-4">
                          <p className="font-bold text-gray-800 text-sm">{user.name}</p>
                          <p className="text-[10px] text-gray-500">{user.designation || 'পদবী উল্লেখ নেই'}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-700">{user.email}</p>
                          <p className="text-[10px] text-gray-400">{user.mobile || '-'}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            user.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-700' : 
                            user.role === UserRole.UPAZILA ? 'bg-emerald-100 text-emerald-700' : 
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {getRoleLabel(user.role)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-600">
                          {user.role === UserRole.ADMIN ? 'সারা বাংলাদেশ' : 
                           user.role === UserRole.UPAZILA ? userUpazila?.name : 
                           userSchool?.name || 'অজ্ঞাত স্কুল'}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button 
                            onClick={() => deleteUser(user.id)}
                            className="text-red-400 hover:text-red-600 transition p-2 hover:bg-red-50 rounded-full"
                            title="মুছে ফেলুন"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {users.length === 0 && (
              <div className="p-12 text-center text-gray-400">
                <p>কোনো ব্যবহারকারী পাওয়া যায়নি।</p>
              </div>
            )}
          </div>
        </div>
      )}

      {isCreatingForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 overflow-y-auto backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full my-8 border border-gray-200 overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center bg-emerald-700 text-white">
              <h3 className="text-xl font-bold">নতুন গ্লোবাল ডাটা ফরম তৈরি</h3>
              <button onClick={() => setIsCreatingForm(false)} className="text-2xl hover:bg-white/10 p-2 rounded-full transition">&times;</button>
            </div>
            
            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto bg-gray-50/50">
              <div className="bg-white p-5 rounded-2xl border shadow-sm">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">ফরমের শিরোনাম (বাংলায়)</label>
                <input 
                  type="text" 
                  value={newForm.title}
                  onChange={(e) => setNewForm({...newForm, title: e.target.value})}
                  className="w-full p-2.5 bg-gray-50 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-bold"
                  placeholder="যেমন: মাসিক উপস্থিতির হার"
                />
              </div>

              <div className="bg-white p-5 rounded-2xl border shadow-sm">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">সংক্ষিপ্ত বর্ণনা</label>
                <textarea 
                  value={newForm.description}
                  onChange={(e) => setNewForm({...newForm, description: e.target.value})}
                  className="w-full p-2.5 bg-gray-50 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none h-20 text-sm"
                  placeholder="এই ফরমটি কেন পুরণ করতে হবে তার বিস্তারিত..."
                ></textarea>
              </div>

              <div className="bg-white p-5 rounded-2xl border shadow-sm">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">জমাদানের শেষ তারিখ (ডেডলাইন)</label>
                <input 
                  type="date" 
                  value={newForm.deadline}
                  onChange={(e) => setNewForm({...newForm, deadline: e.target.value})}
                  className="w-full p-2.5 bg-gray-50 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center bg-emerald-50 p-4 rounded-xl">
                  <h4 className="font-bold text-emerald-800">তথ্য ক্ষেত্রসমূহ (Fields)</h4>
                  <button onClick={addField} className="bg-emerald-700 text-white px-3 py-1 rounded-full font-bold text-xs">+ ফিল্ড যোগ করুন</button>
                </div>

                {newForm.fields?.map((field, idx) => (
                  <div key={field.id} className="p-4 border rounded-2xl bg-white shadow-sm space-y-3 relative border-l-8 border-l-emerald-600">
                    <button 
                      onClick={() => setNewForm({...newForm, fields: newForm.fields?.filter((_, i) => i !== idx)})}
                      className="absolute top-2 right-2 text-red-300 hover:text-red-500 transition"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">লেবেল/প্রশ্ন</label>
                        <input 
                          type="text" 
                          value={field.label}
                          onChange={(e) => updateField(idx, { label: e.target.value })}
                          className="w-full p-2 bg-gray-50 border rounded-lg text-sm"
                          placeholder="প্রশ্ন লিখুন"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">তথ্যের টাইপ</label>
                        <select 
                          value={field.type}
                          onChange={(e) => updateField(idx, { type: e.target.value as FieldType })}
                          className="w-full p-2 bg-gray-50 border rounded-lg text-sm font-bold text-emerald-800"
                        >
                          <option value={FieldType.TEXT}>সংক্ষিপ্ত লেখা (Text)</option>
                          <option value={FieldType.NUMBER}>সংখ্যা (Number)</option>
                          <option value={FieldType.DATE}>তারিখ (Date)</option>
                          <option value={FieldType.BOOLEAN}>হ্যাঁ/না (Yes/No)</option>
                          <option value={FieldType.DROPDOWN}>ড্রপডাউন (Dropdown)</option>
                        </select>
                      </div>
                    </div>

                    {field.type === FieldType.DROPDOWN && (
                      <div className="mt-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">অপশনসমূহ (কমা দিয়ে আলাদা করুন)</label>
                        <input 
                          type="text" 
                          value={field.options?.join(', ') || ''}
                          onChange={(e) => updateField(idx, { options: e.target.value.split(',').map(s => s.trim()).filter(s => s !== '') })}
                          className="w-full p-2 bg-gray-50 border rounded-lg text-sm"
                          placeholder="ভালো, খারাপ, জরাজীর্ণ"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-8 border-t bg-white flex justify-end gap-3">
              <button onClick={() => setIsCreatingForm(false)} className="px-6 py-2.5 text-gray-500 font-bold hover:bg-gray-50 rounded-xl transition">বাতিল</button>
              <button onClick={saveForm} className="px-10 py-2.5 bg-emerald-700 text-white rounded-xl font-bold shadow-xl hover:bg-emerald-800 transition transform active:scale-95">
                ফরমটি চূড়ান্ত করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
