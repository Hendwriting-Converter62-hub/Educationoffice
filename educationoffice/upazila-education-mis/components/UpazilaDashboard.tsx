
import React, { useState, useMemo } from 'react';
import { User, Form, Submission, School, SubmissionStatus, FieldType, FormField } from '../types';

interface UpazilaDashboardProps {
  user: User;
  forms: Form[];
  setForms: React.Dispatch<React.SetStateAction<Form[]>>;
  submissions: Submission[];
  schools: School[];
  onUpdateStatus: (id: string, status: SubmissionStatus) => void;
  onUpdateSubmission: (sub: Submission) => void;
}

const UpazilaDashboard: React.FC<UpazilaDashboardProps> = ({ 
  user, forms, setForms, submissions, schools, onUpdateStatus, onUpdateSubmission 
}) => {
  const [activeTab, setActiveTab] = useState<'monitor' | 'forms'>('monitor');
  
  const monitorableForms = useMemo(() => {
    return forms.filter(f => !f.upazilaId || f.upazilaId === user.upazilaId);
  }, [forms, user.upazilaId]);

  const [selectedFormId, setSelectedFormId] = useState<string>(monitorableForms[0]?.id || '');
  const [viewingSubmission, setViewingSubmission] = useState<Submission | null>(null);
  const [isCreatingForm, setIsCreatingForm] = useState(false);
  const [editingFormId, setEditingFormId] = useState<string | null>(null);

  const upazilaForms = forms.filter(f => f.upazilaId === user.upazilaId);
  const currentForm = forms.find(f => f.id === selectedFormId);
  
  const upazilaSchools = useMemo(() => {
    return schools.filter(s => s.upazilaId === user.upazilaId);
  }, [schools, user.upazilaId]);

  const stats = useMemo(() => {
    const total = upazilaSchools.length;
    const submittedSubmissions = submissions.filter(s => 
      s.formId === selectedFormId && 
      upazilaSchools.some(sch => sch.id === s.schoolId) && 
      (s.status === SubmissionStatus.SUBMITTED || s.status === SubmissionStatus.APPROVED || s.status === SubmissionStatus.LOCKED)
    );
    const pendingSubmissions = submissions.filter(s => 
      s.formId === selectedFormId && 
      upazilaSchools.some(sch => sch.id === s.schoolId) && 
      s.status === SubmissionStatus.PENDING
    );
    
    return {
      total,
      submitted: submittedSubmissions.length,
      pending: pendingSubmissions.length,
      notStarted: total - submittedSubmissions.length - pendingSubmissions.length
    };
  }, [upazilaSchools, submissions, selectedFormId]);

  const getSubForSchool = (schoolId: string) => {
    return submissions.find(s => s.formId === selectedFormId && s.schoolId === schoolId);
  };

  const getSchoolHistory = (schoolId: string) => {
    return submissions
      .filter(s => s.schoolId === schoolId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  };

  const addField = () => {
    const newField: FormField = {
      id: `fd-${Date.now()}`,
      label: '',
      type: FieldType.TEXT,
      required: true,
      subFields: [],
      rowLabels: []
    };
    setNewForm(prev => ({ ...prev, fields: [...(prev.fields || []), newField] }));
  };

  const [newForm, setNewForm] = useState<Partial<Form>>({
    title: '',
    description: '',
    fields: [],
    isActive: true,
    deadline: ''
  });

  const saveForm = () => {
    if (!newForm.title || !newForm.fields?.length) {
      alert('অনুগ্রহ করে শিরোনাম এবং কমপক্ষে একটি ফিল্ড যোগ করুন।');
      return;
    }
    const form: Form = {
      ...(editingFormId ? forms.find(f => f.id === editingFormId) : {}),
      ...newForm as Form,
      id: editingFormId || `f-${Date.now()}`,
      upazilaId: user.upazilaId,
      createdAt: new Date().toISOString()
    };
    
    setForms(prev => {
      if (editingFormId) {
        return prev.map(f => f.id === editingFormId ? form : f);
      }
      return [form, ...prev];
    });
    
    setIsCreatingForm(false);
    setEditingFormId(null);
  };

  const renderFieldValue = (field: FormField, value: any) => {
    if (value === undefined || value === null || value === '') return <span className="text-gray-400 italic">তথ্য নেই</span>;

    switch (field.type) {
      case FieldType.FILE:
        const isImage = typeof value === 'string' && value.startsWith('data:image/');
        return (
          <div className="flex items-center gap-3">
            {isImage ? (
              <img src={value} alt="Preview" className="h-16 w-16 object-cover rounded-lg border shadow-sm" />
            ) : (
              <div className="h-12 w-12 flex items-center justify-center bg-gray-100 rounded-lg text-xl">📄</div>
            )}
            <a href={value} download={`file_${field.id}`} className="text-xs font-bold text-emerald-700 hover:underline bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">ডাউনলোড করুন</a>
          </div>
        );
      case FieldType.BOOLEAN:
        return (
          <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${value ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
            {value ? 'হ্যাঁ (YES)' : 'না (NO)'}
          </span>
        );
      case FieldType.TABLE:
        return (
          <div className="overflow-x-auto mt-2 border rounded-xl bg-white shadow-inner">
            <table className="w-full text-[11px] border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-700 font-bold border-b">
                  {field.rowLabels && field.rowLabels.length > 0 && <th className="p-2 text-left border-r w-24">বিবরণ</th>}
                  {field.subFields?.map(sf => <th key={sf.id} className="p-2 text-left border-r last:border-r-0">{sf.label}</th>)}
                </tr>
              </thead>
              <tbody>
                {(value || []).map((row: any, ridx: number) => (
                  <tr key={ridx} className="border-b last:border-b-0">
                    {field.rowLabels && field.rowLabels.length > 0 && (
                      <td className="p-2 font-bold bg-gray-50/50 border-r">{field.rowLabels[ridx]}</td>
                    )}
                    {field.subFields?.map(sf => (
                      <td key={sf.id} className="p-2 border-r last:border-r-0">{row[sf.id] || '-'}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      default:
        return <span className="text-sm text-gray-800 font-medium">{value}</span>;
    }
  };

  const addTableSubField = (fieldIdx: number) => {
    const fields = [...(newForm.fields || [])];
    const subField: FormField = {
      id: `sf-${Date.now()}`,
      label: 'নতুন কলাম',
      type: FieldType.TEXT,
      required: true
    };
    fields[fieldIdx].subFields = [...(fields[fieldIdx].subFields || []), subField];
    setNewForm({ ...newForm, fields });
  };

  const addTableRowLabel = (fieldIdx: number) => {
    const fields = [...(newForm.fields || [])];
    fields[fieldIdx].rowLabels = [...(fields[fieldIdx].rowLabels || []), 'নতুন সারি'];
    setNewForm({ ...newForm, fields });
  };

  return (
    <div className="space-y-6">
      <div className="flex border-b border-gray-200 no-print">
        <button onClick={() => setActiveTab('monitor')} className={`px-6 py-3 font-semibold text-sm transition-colors ${activeTab === 'monitor' ? 'border-b-2 border-emerald-700 text-emerald-700' : 'text-gray-500 hover:text-emerald-600'}`}>📊 তদারকি ও রিপোর্ট</button>
        <button onClick={() => setActiveTab('forms')} className={`px-6 py-3 font-semibold text-sm transition-colors ${activeTab === 'forms' ? 'border-b-2 border-emerald-700 text-emerald-700' : 'text-gray-500 hover:text-emerald-600'}`}>📝 নিজস্ব ফরম তৈরি</button>
      </div>

      {activeTab === 'monitor' ? (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 no-print">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">আপনার উপজেলার স্কুল</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <div className="bg-emerald-50 p-5 rounded-2xl shadow-sm border border-emerald-100">
              <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mb-1">তথ্য জমা দিয়েছে</p>
              <p className="text-2xl font-bold text-emerald-800">{stats.submitted}</p>
            </div>
            <div className="bg-orange-50 p-5 rounded-2xl shadow-sm border border-orange-100">
              <p className="text-[10px] text-orange-600 font-bold uppercase tracking-widest mb-1">ড্রাফট (Pending)</p>
              <p className="text-2xl font-bold text-orange-800">{stats.pending}</p>
            </div>
            <div className="bg-red-50 p-5 rounded-2xl shadow-sm border border-red-100">
              <p className="text-[10px] text-red-600 font-bold uppercase tracking-widest mb-1">এখনো শুরু করেনি</p>
              <p className="text-2xl font-bold text-red-800">{stats.notStarted}</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
            <h2 className="text-2xl font-bold text-gray-800">স্কুল তথ্য মনিটরিং</h2>
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-gray-400 uppercase">ফরম নির্বাচন:</label>
              <select 
                value={selectedFormId} 
                onChange={(e) => setSelectedFormId(e.target.value)} 
                className="p-2.5 border rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-emerald-500 bg-white min-w-[260px] text-sm font-bold text-emerald-800"
              >
                {monitorableForms.map(f => (
                  <option key={f.id} value={f.id}>{f.title} {f.upazilaId ? '(নিজস্ব)' : '(এডমিন)'}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-emerald-700 text-white">
                    <th className="px-6 py-5 font-bold text-sm">স্কুলের নাম ও IPEMIS</th>
                    <th className="px-6 py-5 font-bold text-sm">জমার অবস্থা (Status)</th>
                    <th className="px-6 py-5 font-bold text-sm">সর্বশেষ আপডেট</th>
                    <th className="px-6 py-5 font-bold text-sm text-center">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {upazilaSchools.length > 0 ? (
                    upazilaSchools.map(school => {
                      const sub = getSubForSchool(school.id);
                      const isSubmitted = sub && (sub.status === SubmissionStatus.SUBMITTED || sub.status === SubmissionStatus.APPROVED || sub.status === SubmissionStatus.LOCKED);
                      
                      return (
                        <tr key={school.id} className={`hover:bg-emerald-50/20 transition ${isSubmitted ? 'bg-emerald-50/5' : ''}`}>
                          <td className="px-6 py-4">
                            <p className="font-bold text-gray-800">{school.name}</p>
                            <p className="text-[10px] text-emerald-600 font-mono tracking-widest font-bold">{school.ipemisCode}</p>
                          </td>
                          <td className="px-6 py-4">
                            {!sub ? (
                              <span className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-red-50 text-red-500 border border-red-100">অসম্পূর্ণ (Waiting)</span>
                            ) : (
                              <span className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border ${
                                sub.status === SubmissionStatus.LOCKED ? 'bg-gray-100 text-gray-500' : 
                                sub.status === SubmissionStatus.APPROVED ? 'bg-green-100 text-green-700' : 
                                sub.status === SubmissionStatus.PENDING ? 'bg-orange-50 text-orange-600' :
                                'bg-emerald-100 text-emerald-700'
                              }`}>
                                {sub.status === SubmissionStatus.LOCKED ? 'লক করা' : 
                                 sub.status === SubmissionStatus.APPROVED ? 'অনুমোদিত' : 
                                 sub.status === SubmissionStatus.PENDING ? 'খসড়া (Pending)' : 
                                 'জমা দিয়েছে'}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-xs font-bold text-gray-500">
                            {sub ? new Date(sub.updatedAt).toLocaleDateString('bn-BD', { day: '2-digit', month: 'long', year: 'numeric' }) : '-'}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {sub ? (
                              <div className="flex justify-center gap-2">
                                <button 
                                  onClick={() => setViewingSubmission(sub)} 
                                  className="bg-emerald-700 text-white px-4 py-1.5 rounded-xl text-xs font-bold hover:bg-emerald-800 transition shadow-sm border border-emerald-600"
                                >
                                  তথ্য দেখুন
                                </button>
                                <button 
                                  onClick={() => onUpdateStatus(sub.id, sub.status === SubmissionStatus.LOCKED ? SubmissionStatus.SUBMITTED : SubmissionStatus.LOCKED)} 
                                  className="bg-white text-gray-600 px-3 py-1.5 rounded-xl border border-gray-200 text-[10px] font-bold hover:bg-gray-800 hover:text-white transition"
                                >
                                  {sub.status === SubmissionStatus.LOCKED ? 'আনলক' : 'লক করুন'}
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] text-gray-300 font-bold uppercase italic">অপেক্ষমান...</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-20 text-center">
                        <div className="flex flex-col items-center opacity-30">
                          <span className="text-5xl mb-4">🏫</span>
                          <p className="font-bold text-gray-500 text-lg">আপনার উপজেলার কোনো স্কুল নিবন্ধিত হয়নি।</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">নিজস্ব তথ্য সংগ্রহ ফরম</h2>
            <button 
              onClick={() => { setEditingFormId(null); setIsCreatingForm(true); setNewForm({ title: '', fields: [], isActive: true }); }} 
              className="bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg hover:bg-emerald-800 transition transform active:scale-95"
            >
              + নতুন ফরম তৈরি করুন
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upazilaForms.map(form => (
              <div key={form.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition group">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-emerald-800 text-lg group-hover:text-emerald-700">{form.title}</h3>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${form.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>{form.isActive ? 'সক্রিয়' : 'বন্ধ'}</span>
                </div>
                <p className="text-xs text-gray-400 mb-6 h-8 line-clamp-2">{form.description || 'কোনো বর্ণনা নেই'}</p>
                <div className="flex justify-between items-center border-t pt-4">
                  <span className="text-[10px] text-gray-400 font-bold uppercase">ফিল্ড: {form.fields.length}</span>
                  <div className="flex gap-3">
                    <button onClick={() => { setEditingFormId(form.id); setNewForm(form); setIsCreatingForm(true); }} className="text-blue-600 hover:underline text-xs font-bold">সংশোধন</button>
                    <button onClick={() => setForms(prev => prev.filter(f => f.id !== form.id))} className="text-red-500 hover:underline text-xs font-bold">মুছে ফেলুন</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* View Submission Details Modal (Read-only) */}
      {viewingSubmission && currentForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[110] backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col border border-gray-100">
            <div className="p-6 border-b flex justify-between items-center bg-emerald-700 text-white shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl">📋</div>
                <div>
                  <h3 className="text-lg font-bold leading-tight">জমা দেওয়া তথ্যের প্রতিবেদন</h3>
                  <p className="text-[10px] text-emerald-100 opacity-80 uppercase font-bold tracking-widest">{currentForm.title}</p>
                </div>
              </div>
              <button onClick={() => setViewingSubmission(null)} className="text-2xl hover:bg-white/10 w-10 h-10 rounded-full transition">&times;</button>
            </div>
            
            <div className="p-8 space-y-10 overflow-y-auto bg-gray-50/30">
              {/* Header Info */}
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-1">স্কুলের নাম ও IPEMIS</p>
                  <p className="text-sm font-bold text-gray-800">{schools.find(s => s.id === viewingSubmission.schoolId)?.name || 'অজানা স্কুল'}</p>
                  <p className="text-[10px] font-mono text-emerald-600 font-bold">{schools.find(s => s.id === viewingSubmission.schoolId)?.ipemisCode}</p>
                </div>
                <div className="w-px bg-gray-100 hidden md:block"></div>
                <div className="flex-1">
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-1">জমাদানের সময়</p>
                  <p className="text-sm font-bold text-gray-800">{new Date(viewingSubmission.submittedAt).toLocaleString('bn-BD')}</p>
                </div>
                <div className="w-px bg-gray-100 hidden md:block"></div>
                <div className="flex-1">
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-1">বর্তমান স্ট্যাটাস</p>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase">{viewingSubmission.status}</span>
                </div>
              </div>

              {/* Form Data Section */}
              <div className="space-y-6">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-8 h-px bg-gray-200"></span> জমাকৃত তথ্যের বিস্তারিত <span className="flex-grow h-px bg-gray-200"></span>
                </h4>
                {currentForm.fields.map((field, idx) => (
                  <div key={field.id} className="animate-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: `${idx * 50}ms` }}>
                    <label className="block text-[11px] font-bold text-emerald-800 mb-2 uppercase tracking-wider bg-emerald-50/50 px-3 py-1 rounded-lg border-l-4 border-emerald-600">
                      {idx + 1}. {field.label}
                    </label>
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm min-h-[50px] flex flex-col justify-center">
                      {renderFieldValue(field, viewingSubmission.data[field.id])}
                    </div>
                  </div>
                ))}
              </div>

              {/* Submission History Section */}
              <div className="space-y-4 pt-6">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-8 h-px bg-gray-200"></span> এই স্কুলের সকল জমার ইতিহাস <span className="flex-grow h-px bg-gray-200"></span>
                </h4>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 font-bold text-gray-600">ফরমের নাম</th>
                        <th className="px-4 py-3 font-bold text-gray-600">তারিখ</th>
                        <th className="px-4 py-3 font-bold text-gray-600">স্ট্যাটাস</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {getSchoolHistory(viewingSubmission.schoolId).map(hist => {
                        const histForm = forms.find(f => f.id === hist.formId);
                        return (
                          <tr key={hist.id} className={hist.id === viewingSubmission.id ? 'bg-emerald-50/30' : ''}>
                            <td className="px-4 py-3">
                              <p className="font-bold text-gray-800">{histForm?.title || 'অজানা ফরম'}</p>
                            </td>
                            <td className="px-4 py-3 text-gray-500 font-medium">
                              {new Date(hist.updatedAt).toLocaleDateString('bn-BD')}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                                hist.status === SubmissionStatus.LOCKED ? 'bg-gray-100 text-gray-500' :
                                hist.status === SubmissionStatus.APPROVED ? 'bg-green-100 text-green-700' :
                                hist.status === SubmissionStatus.PENDING ? 'bg-orange-100 text-orange-700' :
                                'bg-emerald-100 text-emerald-700'
                              }`}>
                                {hist.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t bg-gray-50 flex justify-between items-center shrink-0">
               <p className="text-[10px] text-gray-400 italic">* এটি একটি অটো-জেনারেটেড রিপোর্ট। কোনো সংশোধনের প্রয়োজন হলে স্কুলকে 'আনলক' করে দিন।</p>
               <button onClick={() => setViewingSubmission(null)} className="px-8 py-2.5 bg-gray-800 text-white rounded-xl font-bold text-sm hover:bg-black transition">বন্ধ করুন</button>
            </div>
          </div>
        </div>
      )}

      {/* Form Builder Modal */}
      {isCreatingForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[100] overflow-y-auto backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full my-8 border border-gray-200 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b flex justify-between items-center bg-emerald-700 text-white">
              <h3 className="text-xl font-bold">{editingFormId ? 'নিজস্ব ফরম সংশোধন' : 'নতুন তথ্য সংগ্রহ ফরম তৈরি'}</h3>
              <button onClick={() => setIsCreatingForm(false)} className="text-2xl hover:bg-white/20 p-2 rounded-full transition">&times;</button>
            </div>
            <div className="p-8 space-y-8 max-h-[75vh] overflow-y-auto">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-2xl border shadow-sm">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">ফরমের শিরোনাম</label>
                  <input type="text" value={newForm.title} onChange={(e) => setNewForm({...newForm, title: e.target.value})} className="w-full p-2.5 border-none bg-gray-50 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-bold" placeholder="যেমন: শিক্ষক হাজিরা ছক" />
                </div>
                <div className="bg-white p-4 rounded-2xl border shadow-sm">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">জমাদানের শেষ তারিখ</label>
                  <input type="date" value={newForm.deadline} onChange={(e) => setNewForm({...newForm, deadline: e.target.value})} className="w-full p-2.5 border-none bg-gray-50 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                  <h4 className="font-bold text-emerald-900">তথ্য কলাম যোগ করুন</h4>
                  <button onClick={addField} className="bg-emerald-700 text-white px-5 py-2 rounded-xl font-bold text-sm hover:bg-emerald-800 transition shadow-md">+ যোগ করুন</button>
                </div>
                {newForm.fields?.map((field, idx) => (
                  <div key={field.id} className="p-6 border rounded-3xl bg-white shadow-sm space-y-5 relative border-l-[12px] border-l-emerald-600 transition-all hover:border-emerald-500">
                    <button 
                      onClick={() => setNewForm({...newForm, fields: newForm.fields?.filter((_, i) => i !== idx)})} 
                      className="absolute top-4 right-4 text-red-400 hover:text-red-700 transition p-2 hover:bg-red-50 rounded-xl"
                      title="মুছে ফেলুন"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pr-8">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">কলামের নাম</label>
                        <input type="text" value={field.label} placeholder="যেমন: শিক্ষকের নাম" onChange={(e) => {
                          const fields = [...(newForm.fields || [])];
                          fields[idx].label = e.target.value;
                          setNewForm({...newForm, fields});
                        }} className="w-full p-3 bg-gray-50 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">তথ্যের টাইপ</label>
                        <select value={field.type} onChange={(e) => {
                          const fields = [...(newForm.fields || [])];
                          fields[idx].type = e.target.value as FieldType;
                          setNewForm({...newForm, fields});
                        }} className="w-full p-3 bg-gray-50 border rounded-xl text-sm font-bold text-emerald-800 outline-none focus:ring-2 focus:ring-emerald-500">
                          <option value={FieldType.TEXT}>সংক্ষিপ্ত লেখা (Text)</option>
                          <option value={FieldType.NUMBER}>সংখ্যা (Number)</option>
                          <option value={FieldType.TABLE}>গ্রিড টেবিল (Table)</option>
                          <option value={FieldType.FILE}>ফাইল (File)</option>
                          <option value={FieldType.BOOLEAN}>হ্যাঁ/না (Yes/No)</option>
                        </select>
                      </div>
                    </div>

                    {field.type === FieldType.TABLE && (
                      <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100 mt-4 space-y-4 animate-in fade-in zoom-in-95">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                             <label className="text-[10px] font-bold text-emerald-700 uppercase">কলাম ব্যবস্থাপনা (Columns)</label>
                             <button onClick={() => addTableSubField(idx)} className="text-[9px] bg-emerald-700 text-white px-3 py-1 rounded-lg font-bold hover:bg-emerald-800">+ কলাম যোগ</button>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            {field.subFields?.map((sf, sfIdx) => (
                              <div key={sf.id} className="flex items-center gap-2">
                                <input 
                                  type="text" 
                                  value={sf.label} 
                                  onChange={(e) => {
                                    const fields = [...(newForm.fields || [])];
                                    fields[idx].subFields![sfIdx].label = e.target.value;
                                    setNewForm({...newForm, fields});
                                  }}
                                  className="w-full p-2 text-xs border rounded-lg"
                                  placeholder="কলামের নাম"
                                />
                                <button onClick={() => {
                                  const fields = [...(newForm.fields || [])];
                                  fields[idx].subFields = fields[idx].subFields!.filter((_, i) => i !== sfIdx);
                                  setNewForm({...newForm, fields});
                                }} className="text-red-400 hover:text-red-600 text-sm">&times;</button>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="border-t pt-4">
                          <div className="flex justify-between items-center mb-2">
                             <label className="text-[10px] font-bold text-emerald-700 uppercase">সারি (Row) ব্যবস্থাপনা (নির্ধারিত সারি যোগ করলে স্কুল সারি মুছতে পারবে না)</label>
                             <button onClick={() => addTableRowLabel(idx)} className="text-[9px] bg-emerald-700 text-white px-3 py-1 rounded-lg font-bold hover:bg-emerald-800">+ সারি যোগ</button>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            {field.rowLabels?.map((rl, rlIdx) => (
                              <div key={rlIdx} className="flex items-center gap-2">
                                <input 
                                  type="text" 
                                  value={rl} 
                                  onChange={(e) => {
                                    const fields = [...(newForm.fields || [])];
                                    fields[idx].rowLabels![rlIdx] = e.target.value;
                                    setNewForm({...newForm, fields});
                                  }}
                                  className="w-full p-2 text-xs border rounded-lg"
                                  placeholder="সারির নাম"
                                />
                                <button onClick={() => {
                                  const fields = [...(newForm.fields || [])];
                                  fields[idx].rowLabels = fields[idx].rowLabels!.filter((_, i) => i !== rlIdx);
                                  setNewForm({...newForm, fields});
                                }} className="text-red-400 hover:text-red-600 text-sm">&times;</button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="p-8 border-t bg-white flex justify-end gap-5">
              <button onClick={() => setIsCreatingForm(false)} className="px-8 py-3 text-gray-500 font-bold hover:bg-gray-50 rounded-2xl transition">বাতিল</button>
              <button onClick={saveForm} className="px-14 py-3 bg-emerald-700 text-white rounded-2xl font-bold shadow-xl hover:bg-emerald-800 transition transform active:scale-95">সেভ করুন</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpazilaDashboard;
