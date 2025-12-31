
import React, { useState, useEffect } from 'react';
import { User, UserRole, Form, Submission, School, Upazila, SubmissionStatus } from './types';
import { mockUsers, mockForms, mockSchools, mockUpazilas } from './mockData';
import Layout from './components/Layout';
import AdminDashboard from './components/AdminDashboard';
import UpazilaDashboard from './components/UpazilaDashboard';
import SchoolDashboard from './components/SchoolDashboard';
import AuthScreen from './components/AuthScreen';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [forms, setForms] = useState<Form[]>(mockForms);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [schools, setSchools] = useState<School[]>(mockSchools);
  const [upazilas, setUpazilas] = useState<Upazila[]>(mockUpazilas);

  // Persistence (Simulation)
  useEffect(() => {
    const savedUsers = localStorage.getItem('edu_users');
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    } else {
      localStorage.setItem('edu_users', JSON.stringify(mockUsers));
    }

    const savedSubmissions = localStorage.getItem('edu_submissions');
    if (savedSubmissions) setSubmissions(JSON.parse(savedSubmissions));
    
    const savedForms = localStorage.getItem('edu_forms');
    if (savedForms) setForms(JSON.parse(savedForms));

    const savedUpazilas = localStorage.getItem('edu_upazilas');
    if (savedUpazilas) setUpazilas(JSON.parse(savedUpazilas));

    const savedSchools = localStorage.getItem('edu_schools');
    if (savedSchools) setSchools(JSON.parse(savedSchools));

    const savedUser = localStorage.getItem('edu_current_user');
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
  }, []);

  useEffect(() => {
    localStorage.setItem('edu_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('edu_submissions', JSON.stringify(submissions));
  }, [submissions]);

  useEffect(() => {
    localStorage.setItem('edu_forms', JSON.stringify(forms));
  }, [forms]);

  useEffect(() => {
    localStorage.setItem('edu_upazilas', JSON.stringify(upazilas));
  }, [upazilas]);

  useEffect(() => {
    localStorage.setItem('edu_schools', JSON.stringify(schools));
  }, [schools]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('edu_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('edu_current_user');
    }
  }, [currentUser]);

  const handleLogin = (email: string, password?: string) => {
    const user = users.find(u => u.email === email || u.mobile === email);
    if (user) {
      if (user.password === password) {
        setCurrentUser(user);
      } else {
        alert('ভুল পাসওয়ার্ড! আবার চেষ্টা করুন।');
      }
    } else {
      alert('ব্যবহারকারী পাওয়া যায়নি! সঠিক ইমেইল অথবা মোবাইল নম্বর দিন।');
    }
  };

  const handleSignUp = (newUser: User) => {
    if (users.some(u => u.email === newUser.email)) {
      alert('এই ইমেইল দিয়ে ইতিপূর্বে অ্যাকাউন্ট খোলা হয়েছে।');
      return;
    }

    // If a new upazila ID was generated, add it to the upazilas list
    if (newUser.upazilaId && newUser.upazilaId.startsWith('upz-custom-')) {
      const parts = newUser.upazilaId.split('-');
      const customName = parts.slice(3).join('-') || 'নতুন উপজেলা';
      
      if (!upazilas.some(u => u.id === newUser.upazilaId)) {
        const newUpazila: Upazila = {
          id: newUser.upazilaId,
          name: customName
        };
        setUpazilas(prev => [...prev, newUpazila]);
      }
    }

    // If it's a school user, ensure a School object exists so it shows in monitoring
    if (newUser.role === UserRole.SCHOOL && newUser.schoolId && newUser.upazilaId) {
      // We'll use the user's name as a placeholder for school name initially 
      // or assume the signup process could be enhanced to provide school name.
      // For now, let's create a school entry so the Upazila sees it.
      const newSchool: School = {
        id: newUser.schoolId,
        name: newUser.name.includes('স্কুল') ? newUser.name : `${newUser.name} এর বিদ্যালয়`,
        ipemisCode: '00000000000', // Placeholder, should be updated in profile
        upazilaId: newUser.upazilaId
      };
      setSchools(prev => [...prev, newSchool]);
    }

    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    alert('অভিনন্দন! আপনার অ্যাকাউন্টটি সফলভাবে তৈরি হয়েছে।');
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleUpdateProfile = (updatedUser: User, updatedOfficeName?: string, updatedOfficeCode?: string, updatedUpazilaId?: string) => {
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    
    if (updatedUser.role === UserRole.UPAZILA && updatedOfficeName && updatedUser.upazilaId) {
      setUpazilas(prev => prev.map(u => 
        u.id === updatedUser.upazilaId ? { ...u, name: updatedOfficeName } : u
      ));
    } else if (updatedUser.role === UserRole.SCHOOL && updatedUser.schoolId) {
      setSchools(prev => {
        const schoolExists = prev.some(s => s.id === updatedUser.schoolId);
        if (schoolExists) {
          return prev.map(s => {
            if (s.id === updatedUser.schoolId) {
              return { 
                ...s, 
                name: updatedOfficeName || s.name, 
                ipemisCode: updatedOfficeCode || s.ipemisCode,
                upazilaId: updatedUpazilaId || s.upazilaId 
              };
            }
            return s;
          });
        } else {
          const newSch: School = {
            id: updatedUser.schoolId!,
            name: updatedOfficeName || 'নতুন বিদ্যালয়',
            ipemisCode: updatedOfficeCode || '00000000000',
            upazilaId: updatedUpazilaId || updatedUser.upazilaId || ''
          };
          return [...prev, newSch];
        }
      });
      if (updatedUpazilaId) {
        setCurrentUser(prev => prev ? { ...prev, upazilaId: updatedUpazilaId } : null);
      }
    }
  };

  const saveSubmission = (submission: Submission) => {
    setSubmissions(prev => {
      const existingIdx = prev.findIndex(s => s.formId === submission.formId && s.schoolId === submission.schoolId);
      if (existingIdx > -1) {
        const next = [...prev];
        next[existingIdx] = { ...submission, updatedAt: new Date().toISOString() };
        return next;
      }
      return [...prev, { ...submission, id: `sub-${Date.now()}`, submittedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }];
    });
  };

  const updateSubmissionStatus = (submissionId: string, status: SubmissionStatus) => {
    setSubmissions(prev => prev.map(s => s.id === submissionId ? { ...s, status, updatedAt: new Date().toISOString() } : s));
  };

  if (!currentUser) {
    return <AuthScreen onLogin={handleLogin} onSignUp={handleSignUp} upazilas={upazilas} />;
  }

  const currentUpazila = upazilas.find(u => u.id === currentUser.upazilaId);
  const currentSchool = schools.find(s => s.id === currentUser.schoolId);

  return (
    <Layout 
      user={currentUser} 
      onLogout={handleLogout} 
      onUpdateProfile={handleUpdateProfile}
      upazilaName={currentUpazila?.name}
      schoolName={currentSchool?.name}
      schoolIpemis={currentSchool?.ipemisCode}
      availableUpazilas={upazilas}
    >
      {currentUser.role === UserRole.ADMIN && (
        <AdminDashboard 
          forms={forms} 
          setForms={setForms} 
          schools={schools} 
          upazilas={upazilas} 
          users={users}
          setUsers={setUsers}
        />
      )}
      {currentUser.role === UserRole.UPAZILA && (
        <UpazilaDashboard 
          user={currentUser} 
          forms={forms} 
          setForms={setForms}
          submissions={submissions}
          schools={schools}
          onUpdateStatus={updateSubmissionStatus}
          onUpdateSubmission={(sub) => saveSubmission(sub)}
        />
      )}
      {currentUser.role === UserRole.SCHOOL && (
        <SchoolDashboard 
          user={currentUser} 
          forms={forms} 
          submissions={submissions}
          onSaveSubmission={saveSubmission}
        />
      )}
    </Layout>
  );
};

export default App;
