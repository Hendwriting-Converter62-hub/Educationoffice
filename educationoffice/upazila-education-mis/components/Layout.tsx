
import React, { useState, useEffect } from 'react';
import { User, UserRole, Upazila } from '../types';

interface LayoutProps {
  user: User;
  onLogout: () => void;
  onUpdateProfile: (updatedUser: User, updatedOfficeName?: string, updatedOfficeCode?: string, updatedUpazilaId?: string) => void;
  upazilaName?: string;
  schoolName?: string;
  schoolIpemis?: string;
  availableUpazilas?: Upazila[];
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ user, onLogout, onUpdateProfile, upazilaName, schoolName, schoolIpemis, availableUpazilas = [], children }) => {
  const [showProfile, setShowProfile] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Editable fields
  const [editName, setEditName] = useState(user.name);
  const [editDesignation, setEditDesignation] = useState(user.designation || '');
  const [editMobile, setEditMobile] = useState(user.mobile || '');
  const [editDivision, setEditDivision] = useState(user.division || '');
  const [editDistrict, setEditDistrict] = useState(user.district || '');
  const [editOfficeName, setEditOfficeName] = useState('');
  const [editOfficeCode, setEditOfficeCode] = useState(''); // IPEMIS for School
  const [editUpazilaId, setEditUpazilaId] = useState(user.upazilaId || '');
  const [editPassword, setEditPassword] = useState(user.password || '');

  useEffect(() => {
    setEditName(user.name);
    setEditDesignation(user.designation || '');
    setEditMobile(user.mobile || '');
    setEditDivision(user.division || '');
    setEditDistrict(user.district || '');
    setEditUpazilaId(user.upazilaId || '');
    setEditPassword(user.password || '');
    if (user.role === UserRole.UPAZILA) {
      setEditOfficeName(upazilaName || '');
    } else if (user.role === UserRole.SCHOOL) {
      setEditOfficeName(schoolName || '');
      setEditOfficeCode(schoolIpemis || '');
    }
  }, [user, upazilaName, schoolName, schoolIpemis, showProfile]);

  const roleLabel = {
    [UserRole.ADMIN]: 'সুপার এডমিন',
    [UserRole.UPAZILA]: 'উপজেলা ইউজার',
    [UserRole.SCHOOL]: 'স্কুল ইউজার'
  }[user.role];

  const upazilaDesignations = [
    'উপজেলা প্রাথমিক শিক্ষা অফিসার',
    'সহকারী উপজেলা প্রাথমিক শিক্ষা অফিসার',
    'উচ্চমান সহকারী কাম-হিসাবরক্ষক',
    'অফিস সহকারী কাম-কম্পিউটার অপারেটর',
    'হিসাব সহকারী',
    'ডাটা এন্ট্রি অপারেটর'
  ];

  const schoolDesignations = [
    'প্রধান শিক্ষক',
    'সহকারী শিক্ষক',
    'প্রাক-প্রাথমিক শিক্ষক',
    'সংগীত শিক্ষক'
  ];

  const currentDesignations = user.role === UserRole.SCHOOL ? schoolDesignations : upazilaDesignations;

  const handleSave = () => {
    const updatedUser: User = {
      ...user,
      name: editName,
      designation: editDesignation,
      mobile: editMobile,
      division: editDivision,
      district: editDistrict,
      upazilaId: editUpazilaId,
      password: editPassword
    };
    onUpdateProfile(
      updatedUser, 
      editOfficeName,
      user.role === UserRole.SCHOOL ? editOfficeCode : undefined,
      user.role === UserRole.SCHOOL ? editUpazilaId : undefined
    );
    setIsEditing(false);
    setShowPassword(false);
    alert('প্রোফাইল সফলভাবে আপডেট করা হয়েছে!');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-emerald-700 text-white shadow-lg no-print">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-white p-1 rounded-full">
              <img src="https://upload.wikimedia.org/wikipedia/commons/8/84/Government_Seal_of_Bangladesh.svg" alt="Govt Seal" className="h-10 w-10" />
            </div>
            <div>
              <h1 className="text-xl font-bold leading-tight">উপজেলা প্রাথমিক শিক্ষা তথ্য ব্যবস্থা</h1>
              <p className="text-xs text-emerald-100">প্রাথমিক ও গণশিক্ষা মন্ত্রণালয়, গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setShowProfile(true)}
              className="text-right hidden sm:block hover:bg-white/10 p-2 rounded transition group"
            >
              <p className="text-sm font-medium group-hover:text-emerald-100">{user.name}</p>
              <p className="text-xs opacity-75">{user.designation || roleLabel}</p>
            </button>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setShowProfile(true)}
                className="bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded text-sm transition"
              >
                প্রোফাইল
              </button>
              <button 
                onClick={onLogout}
                className="bg-red-600/20 hover:bg-red-600/40 text-red-100 px-3 py-1.5 rounded text-sm transition border border-red-500/30"
              >
                লগআউট
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Profile Modal */}
      {showProfile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100] animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-200 my-8">
            <div className="bg-emerald-700 p-8 text-white text-center relative">
              <button 
                onClick={() => { setShowProfile(false); setIsEditing(false); setShowPassword(false); }}
                className="absolute top-4 right-4 text-white/80 hover:text-white text-2xl"
              >&times;</button>
              <div className="w-24 h-24 bg-white rounded-full mx-auto mb-4 flex items-center justify-center text-emerald-700 text-4xl font-bold shadow-xl">
                {user.name.charAt(0)}
              </div>
              <h3 className="text-2xl font-bold">{user.name}</h3>
              <p className="text-sm opacity-90 mt-1">{user.designation || roleLabel}</p>
              {user.role === UserRole.UPAZILA && upazilaName && (
                <p className="text-xs bg-black/20 px-3 py-1 rounded-full inline-block mt-2">{upazilaName}</p>
              )}
              {user.role === UserRole.SCHOOL && schoolName && (
                <p className="text-xs bg-black/20 px-3 py-1 rounded-full inline-block mt-2">{schoolName}</p>
              )}
            </div>
            
            <div className="p-8 space-y-6">
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">আপনার নাম</label>
                    <input 
                      type="text" 
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">পদবী</label>
                    <select 
                      value={editDesignation}
                      onChange={(e) => setEditDesignation(e.target.value)}
                      className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                    >
                      <option value="">পদবী নির্বাচন করুন</option>
                      {currentDesignations.map(d => <option key={d} value={d}>{d}</option>)}
                      {user.role === UserRole.ADMIN && <option value="সিস্টেম এডমিনিস্ট্রেটর">সিস্টেম এডমিনিস্ট্রেটর</option>}
                      <option value="অন্যান্য">অন্যান্য</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">মোবাইল নম্বর</label>
                    <input 
                      type="tel" 
                      value={editMobile}
                      onChange={(e) => setEditMobile(e.target.value)}
                      className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="যেমন: ০১৭০০০০০০০০"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">লগইন পাসওয়ার্ড</label>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        value={editPassword}
                        onChange={(e) => setEditPassword(e.target.value)}
                        className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                        placeholder="পাসওয়ার্ড লিখুন"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-gray-400 hover:text-emerald-600"
                      >
                        {showPassword ? "🙈" : "👁️"}
                      </button>
                    </div>
                  </div>

                  {user.role === UserRole.UPAZILA && (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">বিভাগ</label>
                        <input 
                          type="text" 
                          value={editDivision}
                          onChange={(e) => setEditDivision(e.target.value)}
                          className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">জেলা</label>
                        <input 
                          type="text" 
                          value={editDistrict}
                          onChange={(e) => setEditDistrict(e.target.value)}
                          className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                      </div>
                    </>
                  )}

                  {user.role !== UserRole.ADMIN && (
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                        {user.role === UserRole.UPAZILA ? 'উপজেলার নাম' : 'স্কুলের নাম'}
                      </label>
                      <input 
                        type="text" 
                        value={editOfficeName}
                        onChange={(e) => setEditOfficeName(e.target.value)}
                        className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                  )}

                  {user.role === UserRole.SCHOOL && (
                    <>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">আইপিইএমআইএস (IPEMIS) কোড</label>
                        <input 
                          type="text" 
                          value={editOfficeCode}
                          onChange={(e) => setEditOfficeCode(e.target.value)}
                          className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                          placeholder="আইপিইএমআইএস কোড লিখুন"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">উপজেলা নির্বাচন করুন</label>
                        <select 
                          value={editUpazilaId}
                          onChange={(e) => setEditUpazilaId(e.target.value)}
                          className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                        >
                          <option value="">উপজেলা নির্বাচন করুন</option>
                          {availableUpazilas.map(upz => (
                            <option key={upz.id} value={upz.id}>{upz.name}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}

                  <div className="md:col-span-2 flex gap-2 pt-4">
                    <button onClick={handleSave} className="flex-grow bg-emerald-700 text-white py-2.5 rounded-xl font-bold hover:bg-emerald-800 transition shadow-md">সেভ করুন</button>
                    <button onClick={() => { setIsEditing(false); setShowPassword(false); }} className="px-4 py-2.5 text-gray-600 border rounded-xl font-medium hover:bg-gray-50">বাতিল</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <span className="text-xl">📧</span>
                      <div className="overflow-hidden">
                        <p className="text-[10px] text-gray-500 uppercase font-bold">ইমেইল</p>
                        <p className="text-sm font-medium text-gray-800 truncate">{user.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <span className="text-xl">📱</span>
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase font-bold">মোবাইল</p>
                        <p className="text-sm font-medium text-gray-800">{user.mobile || 'যুক্ত নেই'}</p>
                      </div>
                    </div>

                    <div className="md:col-span-2 flex items-center space-x-3 p-4 bg-gray-50 rounded-xl border border-gray-100 relative group">
                      <span className="text-xl">🔑</span>
                      <div className="flex-grow">
                        <p className="text-[10px] text-gray-500 uppercase font-bold">পাসওয়ার্ড</p>
                        <p className="text-sm font-mono font-bold text-gray-800">
                          {showPassword ? (user.password || 'সেট করা নেই') : '••••••••'}
                        </p>
                      </div>
                      <button 
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-400 hover:text-emerald-600 transition"
                        title={showPassword ? "লুকান" : "দেখুন"}
                      >
                        {showPassword ? "🙈" : "👁️"}
                      </button>
                    </div>

                    {user.role === UserRole.UPAZILA && (
                      <>
                        <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                          <span className="text-xl">🏢</span>
                          <div>
                            <p className="text-[10px] text-gray-500 uppercase font-bold">বিভাগ</p>
                            <p className="text-sm font-medium text-gray-800">{user.division || 'যুক্ত নেই'}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                          <span className="text-xl">🏘️</span>
                          <div>
                            <p className="text-[10px] text-gray-500 uppercase font-bold">জেলা</p>
                            <p className="text-sm font-medium text-gray-800">{user.district || 'যুক্ত নেই'}</p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {user.role === UserRole.UPAZILA && user.upazilaId && (
                    <div className="flex items-center space-x-3 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                      <span className="text-xl">📍</span>
                      <div className="flex-grow">
                        <p className="text-[10px] text-emerald-600 uppercase font-bold">উপজেলা আইডি ও অফিস</p>
                        <p className="text-sm font-bold text-emerald-800">{user.upazilaId} | {upazilaName}</p>
                      </div>
                    </div>
                  )}

                  {user.role === UserRole.SCHOOL && user.schoolId && (
                    <>
                      <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <span className="text-xl">🏫</span>
                        <div className="flex-grow">
                          <p className="text-[10px] text-blue-600 uppercase font-bold">স্কুল আইডি ও নাম</p>
                          <p className="text-sm font-bold text-blue-800">{user.schoolId} | {schoolName}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-xl">🆔</span>
                        <div className="flex-grow">
                          <p className="text-[10px] text-gray-500 uppercase font-bold">আইপিইএমআইএস (IPEMIS) কোড</p>
                          <p className="text-sm font-mono font-bold text-gray-800">{schoolIpemis || 'যুক্ত নেই'}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                        <span className="text-xl">📍</span>
                        <div className="flex-grow">
                          <p className="text-[10px] text-emerald-600 uppercase font-bold">অধীনস্থ উপজেলা</p>
                          <p className="text-sm font-bold text-emerald-800">{upazilaName || 'যুক্ত নেই'}</p>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="flex gap-2 pt-4">
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="flex-grow bg-emerald-700 text-white py-2.5 rounded-xl font-bold hover:bg-emerald-800 transition shadow-md"
                    >
                      সম্পাদনা করুন
                    </button>
                    <button 
                      onClick={() => { setShowProfile(false); setShowPassword(false); }}
                      className="px-6 py-2.5 text-gray-600 border rounded-xl font-medium hover:bg-gray-50"
                    >
                      বন্ধ করুন
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 border-t py-6 text-center text-sm text-gray-500 no-print">
        <div className="container mx-auto">
          <p className="font-bold text-emerald-700 mb-1">উপজেলা প্রাথমিক শিক্ষা অফিস</p>
          <p>&copy; {new Date().getFullYear()} গণপ্রজাতন্ত্রী বাংলাদেশ সরকার | কারিগরি সহযোগিতায়: MIS টিম</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
