
import React, { useState } from 'react';
import { User, UserRole, Upazila } from '../types';

interface AuthScreenProps {
  onLogin: (email: string, password?: string) => void;
  onSignUp: (user: User) => void;
  upazilas: Upazila[];
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, onSignUp, upazilas }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('admin@edu.gov.bd');
  const [loginPassword, setLoginPassword] = useState('123');
  
  // Sign Up states
  const [name, setName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.SCHOOL);
  const [upazilaNameInput, setUpazilaNameInput] = useState('');
  const [schoolIpemis, setSchoolIpemis] = useState('');
  const [mobile, setMobile] = useState('');

  const [showPassword, setShowPassword] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, loginPassword);
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !signUpEmail || !mobile || !signUpPassword) {
      alert('অনুগ্রহ করে সকল তথ্য প্রদান করুন।');
      return;
    }

    if (signUpPassword !== confirmPassword) {
      alert('পাসওয়ার্ড দুটি মিলছে না!');
      return;
    }

    if (signUpPassword.length < 3) {
      alert('পাসওয়ার্ড কমপক্ষে ৩ অক্ষরের হতে হবে।');
      return;
    }

    if (role === UserRole.SCHOOL && (!upazilaNameInput || !schoolIpemis)) {
      alert('স্কুল ইউজারের জন্য উপজেলা এবং IPEMIS কোড আবশ্যক।');
      return;
    }

    // Resolve Upazila ID from name
    const existingUpazila = upazilas.find(u => u.name === upazilaNameInput.trim());
    const finalUpazilaId = existingUpazila 
      ? existingUpazila.id 
      : `upz-custom-${Date.now()}-${upazilaNameInput.trim()}`;

    const newUser: User = {
      id: `u-${Date.now()}`,
      name,
      email: signUpEmail,
      password: signUpPassword,
      role,
      mobile,
      upazilaId: role === UserRole.ADMIN ? undefined : finalUpazilaId,
      schoolId: role === UserRole.SCHOOL ? `sch-new-${Date.now()}` : undefined,
      designation: role === UserRole.SCHOOL ? 'প্রধান শিক্ষক' : (role === UserRole.UPAZILA ? 'উপজেলা অফিসার' : 'এডমিন')
    };

    onSignUp(newUser);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-emerald-100 animate-in zoom-in-95 duration-300">
        <div className="bg-emerald-700 p-8 text-white text-center">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/8/84/Government_Seal_of_Bangladesh.svg" 
            alt="Seal" 
            className="h-16 w-16 mx-auto mb-4 bg-white p-2 rounded-full shadow-lg" 
          />
          <h2 className="text-2xl font-bold">{isLogin ? 'লগইন করুন' : 'নতুন একাউন্ট খুলুন'}</h2>
          <p className="opacity-80 text-sm mt-1">উপজেলা প্রাথমিক শিক্ষা তথ্য ব্যবস্থা</p>
        </div>

        <div className="flex border-b">
          <button 
            onClick={() => { setIsLogin(true); setShowPassword(false); }}
            className={`flex-1 py-4 text-sm font-bold transition-all ${isLogin ? 'text-emerald-700 border-b-4 border-emerald-700 bg-emerald-50' : 'text-gray-400 hover:text-emerald-600'}`}
          >
            প্রবেশ (Login)
          </button>
          <button 
            onClick={() => { setIsLogin(false); setShowPassword(false); }}
            className={`flex-1 py-4 text-sm font-bold transition-all ${!isLogin ? 'text-emerald-700 border-b-4 border-emerald-700 bg-emerald-50' : 'text-gray-400 hover:text-emerald-600'}`}
          >
            নিবন্ধন (Sign Up)
          </button>
        </div>
        
        <div className="p-8">
          {isLogin ? (
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">ইমেইল অথবা মোবাইল নম্বর</label>
                <input 
                  type="text" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none transition bg-gray-50"
                  placeholder="আপনার ইমেইল দিন"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">পাসওয়ার্ড</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none transition bg-gray-50"
                    placeholder="পাসওয়ার্ড দিন"
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-emerald-600"
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3.5 rounded-xl shadow-lg transform active:scale-95 transition-all mt-4"
              >
                প্রবেশ করুন
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignUpSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">আপনার পূর্ণ নাম</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none transition bg-gray-50 text-sm"
                  placeholder="সম্পূর্ণ নাম লিখুন"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">ইমেইল এড্রেস</label>
                  <input 
                    type="email" 
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none transition bg-gray-50 text-sm"
                    placeholder="email@example.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">মোবাইল নম্বর</label>
                  <input 
                    type="tel" 
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none transition bg-gray-50 text-sm"
                    placeholder="০১৭০০০০০০০০"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">পাসওয়ার্ড</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none transition bg-gray-50 text-sm"
                      placeholder="কমপক্ষে ৩ অক্ষর"
                      required
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
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">নিশ্চিত করুন</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none transition bg-gray-50 text-sm"
                      placeholder="পাসওয়ার্ড পুনরায় দিন"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">ব্যবহারকারীর ধরণ (Role)</label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    type="button"
                    onClick={() => setRole(UserRole.SCHOOL)}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition ${role === UserRole.SCHOOL ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-gray-50 text-gray-500 hover:border-emerald-300'}`}
                  >
                    স্কুল ইউজার
                  </button>
                  <button 
                    type="button"
                    onClick={() => setRole(UserRole.UPAZILA)}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition ${role === UserRole.UPAZILA ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-gray-50 text-gray-500 hover:border-emerald-300'}`}
                  >
                    উপজেলা ইউজার
                  </button>
                </div>
              </div>

              {(role === UserRole.SCHOOL || role === UserRole.UPAZILA) && (
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">উপজেলার নাম (সিলেক্ট করুন বা লিখুন)</label>
                  <input 
                    type="text"
                    list="upazila-list"
                    value={upazilaNameInput}
                    onChange={(e) => setUpazilaNameInput(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none transition bg-gray-50 text-sm"
                    placeholder="উপজেলার নাম লিখুন"
                    required
                  />
                  <datalist id="upazila-list">
                    {upazilas.map(u => <option key={u.id} value={u.name} />)}
                  </datalist>
                </div>
              )}

              {role === UserRole.SCHOOL && (
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">IPEMIS কোড (স্কুলের জন্য)</label>
                  <input 
                    type="text" 
                    value={schoolIpemis}
                    onChange={(e) => setSchoolIpemis(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none transition bg-gray-50 text-sm font-mono"
                    placeholder="১১ ডিজিটের কোড"
                    required
                  />
                </div>
              )}

              <button 
                type="submit"
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3.5 rounded-xl shadow-lg transform active:scale-95 transition-all mt-4"
              >
                নিবন্ধন সম্পন্ন করুন
              </button>
            </form>
          )}
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #10b981;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default AuthScreen;
