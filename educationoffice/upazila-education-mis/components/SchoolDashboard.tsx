
import React, { useState, useMemo } from 'react';
import { User, Form, Submission, SubmissionStatus, FieldType, FormField } from '../types';

interface SchoolDashboardProps {
  user: User;
  forms: Form[];
  submissions: Submission[];
  onSaveSubmission: (sub: Submission) => void;
}

const SchoolDashboard: React.FC<SchoolDashboardProps> = ({ user, forms, submissions, onSaveSubmission }) => {
  const [activeForm, setActiveForm] = useState<Form | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});

  // Show forms that are active AND (Global OR match user's Upazila)
  const visibleForms = useMemo(() => {
    return forms.filter(f => f.isActive && (!f.upazilaId || f.upazilaId === user.upazilaId));
  }, [forms, user.upazilaId]);

  const getStatus = (formId: string) => {
    const sub = submissions.find(s => s.formId === formId && s.schoolId === user.schoolId);
    return sub ? sub.status : 'NOT_STARTED';
  };

  const startForm = (form: Form) => {
    const sub = submissions.find(s => s.formId === form.id && s.schoolId === user.schoolId);
    if (sub?.status === SubmissionStatus.LOCKED) {
      alert('এই ফরমটি লক করা হয়েছে, আপনি আর পরিবর্তন করতে পারবেন না।');
      return;
    }
    const initialData = JSON.parse(JSON.stringify(sub?.data || {}));
    form.fields.forEach(field => {
      if (field.type === FieldType.TABLE) {
        if (!initialData[field.id] || initialData[field.id].length === 0) {
          initialData[field.id] = field.rowLabels && field.rowLabels.length > 0 
            ? field.rowLabels.map(() => ({})) 
            : [{}];
        } else if (field.rowLabels && field.rowLabels.length > 0) {
          // If labels exist, ensure the data array matches the labels length
          if (initialData[field.id].length !== field.rowLabels.length) {
            const newData = field.rowLabels.map((_, idx) => initialData[field.id][idx] || {});
            initialData[field.id] = newData;
          }
        }
      }
    });
    setFormData(initialData);
    setActiveForm(form);
  };

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleFileUpload = (fieldId: string, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      handleInputChange(fieldId, reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const addTableRow = (fieldId: string) => {
    const currentTable = formData[fieldId] || [];
    handleInputChange(fieldId, [...currentTable, {}]);
  };

  const removeTableRow = (fieldId: string, rowIndex: number) => {
    const currentTable = [...(formData[fieldId] || [])];
    if (currentTable.length <= 1) {
      alert('কমপক্ষে একটি রো থাকতে হবে।');
      return;
    }
    currentTable.splice(rowIndex, 1);
    handleInputChange(fieldId, currentTable);
  };

  const updateTableRow = (fieldId: string, rowIndex: number, columnId: string, value: any) => {
    const currentTable = [...(formData[fieldId] || [])];
    currentTable[rowIndex] = { ...currentTable[rowIndex], [columnId]: value };
    handleInputChange(fieldId, currentTable);
  };

  const handleSubmit = (status: SubmissionStatus) => {
    if (!activeForm) return;
    const submission: Submission = {
      id: submissions.find(s => s.formId === activeForm.id && s.schoolId === user.schoolId)?.id || `sub-${Date.now()}`,
      formId: activeForm.id,
      schoolId: user.schoolId!,
      data: formData,
      status: status,
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    onSaveSubmission(submission);
    setActiveForm(null);
    alert(status === SubmissionStatus.SUBMITTED ? 'সফলভাবে সাবমিট করা হয়েছে!' : 'খসড়া হিসেবে সেভ করা হয়েছে।');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center no-print">
        <h2 className="text-2xl font-bold text-gray-800">অপেক্ষমান ফরমসমূহ</h2>
        <p className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
          মোট ফরম: {visibleForms.length}টি
        </p>
      </div>

      {!activeForm ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
          {visibleForms.length > 0 ? (
            visibleForms.map(form => (
              <div key={form.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col hover:shadow-lg transition group">
                <div className="p-6 flex-grow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-emerald-800 group-hover:text-emerald-700">{form.title}</h3>
                      <p className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${form.upazilaId ? 'text-blue-600' : 'text-emerald-600'}`}>
                        {form.upazilaId ? 'উপজেলা শিক্ষা অফিস হতে' : 'সুপার এডমিন (ঢাকা) হতে'}
                      </p>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-1 rounded-lg ${
                      getStatus(form.id) === 'NOT_STARTED' ? 'bg-gray-100 text-gray-500' : 
                      getStatus(form.id) === SubmissionStatus.PENDING ? 'bg-orange-50 text-orange-600' :
                      'bg-emerald-50 text-emerald-700'
                    }`}>
                      {getStatus(form.id) === 'NOT_STARTED' ? 'নতুন' : 
                       getStatus(form.id) === SubmissionStatus.PENDING ? 'অসম্পূর্ণ' : 'সম্পন্ন'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-6 h-10 line-clamp-2">{form.description || 'এই ফরমের জন্য কোনো বর্ণনা নেই।'}</p>
                  {form.deadline && (
                    <div className="flex items-center gap-2 text-[10px] text-red-500 font-bold uppercase border-t pt-3 border-dashed">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      শেষ তারিখ: {new Date(form.deadline).toLocaleDateString('bn-BD', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </div>
                  )}
                </div>
                <div className="p-4 bg-gray-50 border-t">
                  <button 
                    onClick={() => startForm(form)} 
                    className={`w-full py-3 rounded-xl font-bold transition shadow-md transform active:scale-95 ${
                      getStatus(form.id) === 'NOT_STARTED' 
                      ? 'bg-emerald-700 hover:bg-emerald-800 text-white' 
                      : 'bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                    }`}
                  >
                    {getStatus(form.id) === 'NOT_STARTED' ? 'পুরণ শুরু করুন' : 'বিস্তারিত / সংশোধন'}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-gray-100">
               <span className="text-5xl opacity-20 block mb-4">📄</span>
               <p className="font-bold text-gray-400">এই মুহূর্তে কোনো অপেক্ষমান ফরম নেই।</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-[40px] shadow-2xl border border-gray-200 max-w-5xl mx-auto overflow-hidden animate-in zoom-in-95 duration-200 mb-10">
          <div className="bg-emerald-700 text-white p-8">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold">{activeForm.title}</h3>
                <p className="text-sm opacity-80 mt-1">{activeForm.description || 'সবগুলো ঘর মনোযোগ সহকারে পুরণ করুন।'}</p>
              </div>
              <button onClick={() => setActiveForm(null)} className="bg-white/10 hover:bg-white/20 p-3 rounded-full transition text-2xl font-light">&times;</button>
            </div>
          </div>
          
          <div className="p-8 space-y-10">
            {activeForm.fields.map(field => {
              const hasRowLabels = field.rowLabels && field.rowLabels.length > 0;
              return (
                <div key={field.id} className="space-y-4 bg-gray-50/50 p-8 rounded-3xl border border-gray-100 shadow-inner">
                  <label className="block text-lg font-bold text-emerald-900 border-l-[6px] border-emerald-600 pl-4">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>
                  
                  <div className="bg-white p-5 rounded-2xl border shadow-sm">
                    {field.type === FieldType.TEXT && (
                      <input 
                        type="text" 
                        value={formData[field.id] || ''} 
                        onChange={(e) => handleInputChange(field.id, e.target.value)} 
                        className="w-full p-2.5 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-medium transition-all" 
                        placeholder="এখানে লিখুন..." 
                      />
                    )}
                    {field.type === FieldType.NUMBER && (
                      <input 
                        type="number" 
                        value={formData[field.id] || ''} 
                        onChange={(e) => handleInputChange(field.id, e.target.value)} 
                        className="w-full p-2.5 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-bold transition-all" 
                        placeholder="সংখ্যা দিন" 
                      />
                    )}
                    {field.type === FieldType.FILE && (
                      <div className="space-y-4">
                        <input type="file" id={`file-${field.id}`} className="hidden" onChange={(e) => e.target.files?.[0] && handleFileUpload(field.id, e.target.files[0])} />
                        <label htmlFor={`file-${field.id}`} className="flex flex-col items-center justify-center border-2 border-dashed border-emerald-100 rounded-2xl p-8 hover:bg-emerald-50 cursor-pointer transition group">
                          <span className="text-3xl mb-2 grayscale group-hover:grayscale-0">📂</span>
                          <span className="text-sm font-bold text-emerald-800">ছবি বা ফাইল নির্বাচন করুন</span>
                        </label>
                        {formData[field.id] && (
                          <div className="flex items-center gap-4 bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                            <span className="text-2xl">📄</span>
                            <span className="text-xs font-bold text-emerald-700">ফাইলটি সফলভাবে নির্বাচন করা হয়েছে</span>
                            <button onClick={() => handleInputChange(field.id, null)} className="ml-auto text-red-500 text-xs font-bold hover:underline">বাতিল</button>
                          </div>
                        )}
                      </div>
                    )}
                    {field.type === FieldType.TABLE && (
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse rounded-xl overflow-hidden border">
                          <thead>
                            <tr className="bg-emerald-700 text-white text-[11px] font-bold">
                              {hasRowLabels && <th className="p-3 border-r border-emerald-600 text-left uppercase tracking-wider bg-emerald-800 w-32">বিবরণ</th>}
                              {field.subFields?.map(sf => <th key={sf.id} className="p-3 border-r border-emerald-600 text-left uppercase tracking-wider">{sf.label}</th>)}
                              <th className="p-3 text-center w-16 uppercase tracking-wider">অ্যাকশন</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(formData[field.id] || []).map((row: any, ridx: number) => (
                              <tr key={ridx} className="hover:bg-gray-50 transition-colors">
                                {hasRowLabels && (
                                  <td className="p-2 border border-gray-100 bg-gray-50/50 font-bold text-[11px] text-emerald-800">
                                    {field.rowLabels![ridx] || `সারি ${ridx + 1}`}
                                  </td>
                                )}
                                {field.subFields?.map(sf => (
                                  <td key={sf.id} className="p-2 border border-gray-100">
                                    <input 
                                      type="text" 
                                      value={row[sf.id] || ''} 
                                      onChange={(e) => updateTableRow(field.id, ridx, sf.id, e.target.value)} 
                                      className="w-full p-2 bg-transparent border-none rounded-lg focus:bg-white focus:ring-1 focus:ring-emerald-200 outline-none text-xs transition-all" 
                                      placeholder="..."
                                    />
                                  </td>
                                ))}
                                <td className="p-2 border border-gray-100 text-center">
                                  <button 
                                    onClick={() => !hasRowLabels && removeTableRow(field.id, ridx)}
                                    disabled={hasRowLabels}
                                    className={`${hasRowLabels ? 'text-gray-200 cursor-not-allowed' : 'text-red-400 hover:text-red-600 hover:bg-red-50'} p-2 rounded-full transition-colors`}
                                    title={hasRowLabels ? "এটি উপজেলা কর্তৃক নির্ধারিত সারি" : "মুছে ফেলুন"}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {!hasRowLabels && (
                          <div className="mt-4 flex justify-start">
                            <button 
                              onClick={() => addTableRow(field.id)} 
                              className="text-[10px] bg-emerald-100 text-emerald-700 px-4 py-2 rounded-xl font-bold hover:bg-emerald-200 transition-all border border-emerald-200 shadow-sm"
                            >
                              + নতুন তথ্য সারি যোগ করুন
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-10 bg-gray-50 border-t flex justify-end space-x-4">
            <button onClick={() => handleSubmit(SubmissionStatus.PENDING)} className="px-8 py-3.5 bg-white border border-gray-200 rounded-2xl text-gray-600 hover:bg-gray-100 transition font-bold shadow-sm">খসড়া (Save Draft)</button>
            <button onClick={() => handleSubmit(SubmissionStatus.SUBMITTED)} className="px-14 py-3.5 bg-emerald-700 text-white rounded-2xl hover:bg-emerald-800 shadow-xl transition font-bold transform active:scale-95">চূড়ান্তভাবে জমা দিন</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchoolDashboard;
