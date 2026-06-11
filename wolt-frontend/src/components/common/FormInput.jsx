import React from 'react';

const FormInput = ({ label, type, value, onChange, placeholder, required, wasValidated, isValid, errorFeedback, hint }) => {
    // Merging Wolt styling with core validation feedback classes
    const validationClass = wasValidated ? (isValid ? 'is-wolt-valid' : 'is-wolt-invalid') : '';

    return (
        <div className="wolt-input-group">
            <label className="wolt-label">{label}</label>
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className={`wolt-input ${validationClass}`}
            />
            {wasValidated && !isValid && (
                <div className="wolt-invalid-feedback">{errorFeedback}</div>
            )}
            {hint && <div className="wolt-form-hint">{hint}</div>}
        </div>
    );
};

export default FormInput;