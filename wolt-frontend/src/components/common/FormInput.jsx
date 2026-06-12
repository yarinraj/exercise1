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