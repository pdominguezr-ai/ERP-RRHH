import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import type { UseFormRegisterReturn } from 'react-hook-form';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  registration?: UseFormRegisterReturn;
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, registration, className, id, ...props }, ref) => {
    const inputId = id ?? registration?.name;
    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
          {label}
          {props.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        <input
          id={inputId}
          ref={ref}
          {...registration}
          {...props}
          className={cn(
            'block w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition',
            'focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500',
            error
              ? 'border-red-400 bg-red-50 focus:ring-red-400/30 focus:border-red-400'
              : 'border-gray-300 bg-white hover:border-gray-400',
            className
          )}
        />
        {error && <p className="text-xs text-red-600 mt-0.5">{error}</p>}
      </div>
    );
  }
);
FormInput.displayName = 'FormInput';
export default FormInput;
