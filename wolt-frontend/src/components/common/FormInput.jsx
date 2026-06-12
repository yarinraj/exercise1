import React from 'react';

const FormInput = ({
    label,
    type,
    value,
    onChange,
    placeholder,
    required,
    wasValidated,
    isValid,
    errorFeedback,
    hint,
    autoComplete,
    name,
    onBlur, // Added onBlur to receive the event handler from the parent component
}) => {
    // Merge Wolt styling with validation feedback classes
    const validationClass = wasValidated
        ? isValid
            ? 'is-wolt-valid'
            : 'is-wolt-invalid'
        : '';

    return (
        <div className="wolt-input-group">
            <label className="wolt-label">{label}</label>

            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                autoComplete={autoComplete}
                className={`wolt-input ${validationClass}`}
                onBlur={onBlur} // Attach the onBlur event to trigger validation when the user leaves the field
            />

            {wasValidated && !isValid && (
                <div className="wolt-invalid-feedback">
                    {errorFeedback || 'This field is required'}
                </div>
            )}

            {hint && <div className="wolt-form-hint">{hint}</div>}
        </div>
    );
};

export default FormInput;