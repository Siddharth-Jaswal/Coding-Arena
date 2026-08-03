import React from 'react';
import { Select } from '@/components/ui/Forms';

export const LanguageSelector = ({ value, onChange, className }) => {
  // In the future, this list will be populated dynamically from the backend
  const languageOptions = [
    { label: "C++ (GCC 11.2.0)", value: "cpp" },
    { label: "Python (3.9.5)", value: "python" },
    { label: "Java (OpenJDK 17)", value: "java" },
    { label: "JavaScript (Node 16)", value: "javascript" },
  ];

  return (
    <Select
      value={value}
      onChange={onChange}
      options={languageOptions}
      className={className}
      placeholder="Select Language"
    />
  );
};
