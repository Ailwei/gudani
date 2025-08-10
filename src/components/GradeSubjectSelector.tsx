import React from 'react';

// Types matching MVP
interface UserSelection {
  grade: string;
  subject: string;
}

// Grade & Subject Selector Component
const GradeSubjectSelector: React.FC<{
  selection: UserSelection;
  onSelectionChange: (selection: UserSelection) => void;
}> = ({ selection, onSelectionChange }) => {
  const grades = ['Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];
  const subjects = ['Mathematics', 'Physical Sciences', 'Life Sciences', 'English', 'History', 'Geography', 'Accounting', 'Business Studies'];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Your Grade & Subject</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Grade</label>
          <select 
            value={selection.grade}
            onChange={(e) => onSelectionChange({ ...selection, grade: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">Choose your grade</option>
            {grades.map(grade => (
              <option key={grade} value={grade}>{grade}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
          <select 
            value={selection.subject}
            onChange={(e) => onSelectionChange({ ...selection, subject: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">Choose your subject</option>
            {subjects.map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default GradeSubjectSelector;