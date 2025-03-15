/**
* A functional component that renders a form input with a label and optional error message.
*
* @param {FormInputProps} props - The properties passed to the component.
* @param {string} props.label - The label text for the input field.
* @param {string} [props.error] - An optional error message to display below the input field.
* @param {React.InputHTMLAttributes<HTMLInputElement>} props - Additional props to be spread onto the input element.
*
* @returns {JSX.Element} The rendered form input component.
*/
/**
 * FormInput component renders a labeled input field with optional error message.
*
* @param {Object} props - The properties object.
* @param {string} props.label - The label text for the input field.
* @param {string} [props.error] - The error message to display if there is an error.
* @param {Object} props.rest - The rest of the properties passed to the input element.
*
* @returns {JSX.Element} The rendered FormInput component.
*
* @example
* <FormInput
*   label="Username"
*   id="username"
*   type="text"
*   error="Username is required"
* />
*/

import React from 'react';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function FormInput({ label, error, ...props }: FormInputProps) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={props.id}>
        {label}
      </label>
      <input
        {...props}
        className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}