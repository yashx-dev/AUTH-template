import React from 'react';

const PasswordStrength = ({ password }) => {
  const getPasswordStrength = () => {
    if (!password) return null;
    
    let score = 0;
    if (password.length >= 6) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    const strengthMap = {
      0: { text: 'Very Weak', color: 'bg-red-500', width: '0%' },
      1: { text: 'Weak', color: 'bg-red-500', width: '25%' },
      2: { text: 'Fair', color: 'bg-yellow-500', width: '50%' },
      3: { text: 'Good', color: 'bg-blue-500', width: '75%' },
      4: { text: 'Strong', color: 'bg-green-500', width: '100%' },
    };
    
    return strengthMap[score];
  };

  const strength = getPasswordStrength();
  if (!strength) return null;

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-600">Password strength:</span>
        <span className="text-xs font-medium">{strength.text}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div 
          className={`h-1.5 rounded-full transition-all duration-300 ${strength.color}`}
          style={{ width: strength.width }}
        ></div>
      </div>
    </div>
  );
};

export default PasswordStrength;