"use client";

import React, { useRef, useEffect } from 'react';

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  numInputs?: number;
  inputType?: 'text' | 'number';
  containerStyle?: string;
  inputStyle?: string;
  placeholder?: string;
  isDisabled?: boolean;
  hasErrored?: boolean;
}

const OtpInput: React.FC<OtpInputProps> = ({
  value,
  onChange,
  numInputs = 6,
  inputType = 'number',
  containerStyle = '',
  inputStyle = '',
  placeholder = '',
  isDisabled = false,
  hasErrored = false,
}) => {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputsRef.current = inputsRef.current.slice(0, numInputs);
  }, [numInputs]);

  const handleChange = (element: HTMLInputElement, index: number) => {
    const val = element.value;

    // Only allow single character
    if (val.length > 1) {
      element.value = val.charAt(val.length - 1);
      return;
    }

    // Update the OTP value
    const newOtp = value.split('');
    newOtp[index] = val;
    onChange(newOtp.join(''));

    // Move to next input
    if (val && index < numInputs - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    const target = e.target as HTMLInputElement;

    // Handle backspace
    if (e.key === 'Backspace') {
      if (!target.value && index > 0) {
        // Move to previous input if current is empty
        inputsRef.current[index - 1]?.focus();
      } else {
        // Clear current input
        const newOtp = value.split('');
        newOtp[index] = '';
        onChange(newOtp.join(''));
      }
    }

    // Handle arrow keys
    if (e.key === 'ArrowLeft' && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < numInputs - 1) {
      inputsRef.current[index + 1]?.focus();
    }

    // Only allow numbers if inputType is number
    if (inputType === 'number' && !/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').slice(0, numInputs);

    // Filter based on input type
    const validData = inputType === 'number'
      ? pastedData.replace(/[^0-9]/g, '')
      : pastedData;

    onChange(validData.padEnd(numInputs, '').slice(0, numInputs));

    // Focus the last filled input
    const nextIndex = Math.min(validData.length, numInputs - 1);
    inputsRef.current[nextIndex]?.focus();
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  return (
    <div className={`flex justify-center ${containerStyle}`}>
      {Array.from({ length: numInputs }, (_, index) => (
        <input
          key={index}
          ref={(el) => {
            if (el) {
              inputsRef.current[index] = el;
            }
          }}
          type={inputType === 'number' ? 'tel' : 'text'}
          inputMode={inputType === 'number' ? 'numeric' : 'text'}
          value={value[index] || ''}
          onChange={(e) => handleChange(e.target, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          onFocus={handleFocus}
          disabled={isDisabled}
          placeholder={placeholder}
          maxLength={1}
          className={`
            w-10 h-10 text-center text-lg font-semibold rounded-lg
            transition-all duration-200 border border-gray-300 shadow-sm focus:outline-none
            ${hasErrored
              ? 'border-red-500 bg-red-50'
              : 'border-gray-300 focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/30'
            }
            ${isDisabled
              ? 'bg-gray-100 cursor-not-allowed'
              : 'bg-white'
            }
            ${inputStyle}
          `}
        />
      ))}
    </div>
  );
};

export default OtpInput;
