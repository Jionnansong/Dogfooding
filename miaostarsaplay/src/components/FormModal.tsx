import React, { useState, useEffect } from 'react';
import Modal, { ModalContent, ModalHeader } from './ui/Modal';

interface FormField {
  name: string;
  label: string;
  type?: 'text' | 'textarea' | 'select';
  placeholder?: string;
  required?: boolean;
  defaultValue?: string;
  options?: { value: string; label: string }[];
}

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  fields: FormField[];
  initialValues?: Record<string, string>;
  onSubmit: (values: Record<string, string>) => Promise<void> | void;
  submitLabel?: string;
  cancelLabel?: string;
}

const FormModal: React.FC<FormModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  fields,
  initialValues = {},
  onSubmit,
  submitLabel = '确定',
  cancelLabel = '取消',
}) => {
  const [values, setValues] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const defaultValues: Record<string, string> = {};
      fields.forEach((field) => {
        defaultValues[field.name] = initialValues[field.name] || field.defaultValue || '';
      });
      setValues(defaultValues);
    }
  }, [isOpen, fields, initialValues]);

  const handleSubmit = async () => {
    const requiredFields = fields.filter((f) => f.required);
    const hasEmptyRequired = requiredFields.some((f) => !values[f.name]);
    if (hasEmptyRequired) return;

    setIsSubmitting(true);
    try {
      await onSubmit(values);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const isFormValid = fields.filter((f) => f.required).every((f) => values[f.name]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalHeader title={title} subtitle={subtitle} icon={icon} onClose={onClose} />
      <ModalContent>
        <div className="space-y-5">
          {fields.map((field) => (
            <div key={field.name}>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 pl-1">
                {field.label}
                {field.required && <span className="text-rose-500 ml-1">*</span>}
              </label>
              {field.type === 'textarea' ? (
                <textarea
                  placeholder={field.placeholder}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-slate-700 h-28 md:h-32 resize-none text-sm md:text-base"
                  value={values[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                />
              ) : field.type === 'select' ? (
                <select
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-700 text-sm md:text-base"
                  value={values[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                >
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  placeholder={field.placeholder}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-700 text-sm md:text-base"
                  value={values[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  autoFocus={field === fields[0]}
                />
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 md:mt-10 flex flex-col sm:flex-row gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-4 bg-slate-100 text-slate-500 font-black rounded-xl md:rounded-2xl hover:bg-slate-200 transition-all text-sm"
          >
            {cancelLabel}
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting}
            className={`flex-[2] py-4 bg-indigo-600 text-white font-black rounded-xl md:rounded-2xl shadow-xl shadow-indigo-100 transition-all text-sm ${
              !isFormValid || isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700 active:scale-95'
            }`}
          >
            {isSubmitting ? '处理中...' : submitLabel}
          </button>
        </div>
      </ModalContent>
    </Modal>
  );
};

export default FormModal;
