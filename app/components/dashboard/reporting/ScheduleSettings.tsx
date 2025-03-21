'use client';

import { useState, useEffect } from 'react';
import {
  ReportSchedule,
  ReportScheduleFrequency,
  ExportFormat,
} from '../../../services/reporting/ReportDefinition';

interface ScheduleSettingsProps {
  schedule?: ReportSchedule;
  onSave: (schedule: ReportSchedule) => void;
  onClose: () => void;
}

const defaultSchedule: ReportSchedule = {
  frequency: ReportScheduleFrequency.Monthly,
  time: '09:00',
  dayOfMonth: 1,
  startDate: new Date(),
  recipients: [],
  exportFormats: [ExportFormat.PDF],
};

const ScheduleSettings: React.FC<ScheduleSettingsProps> = ({
  schedule,
  onSave,
  onClose,
}) => {
  const [currentSchedule, setCurrentSchedule] = useState<ReportSchedule>(
    schedule || defaultSchedule
  );
  const [emailInput, setEmailInput] = useState('');
  const [emailError, setEmailError] = useState('');

  // Format the start date for the date input
  useEffect(() => {
    if (currentSchedule.startDate) {
      const formattedStartDate = currentSchedule.startDate instanceof Date
        ? currentSchedule.startDate.toISOString().split('T')[0]
        : new Date(currentSchedule.startDate).toISOString().split('T')[0];
      
      setCurrentSchedule((prev) => ({
        ...prev,
        startDate: new Date(formattedStartDate),
      }));
    }
  }, []);

  const handleFrequencyChange = (frequency: ReportScheduleFrequency) => {
    const updatedSchedule = { ...currentSchedule, frequency };

    // Reset schedule-specific fields based on frequency
    switch (frequency) {
      case ReportScheduleFrequency.Daily:
        delete updatedSchedule.dayOfWeek;
        delete updatedSchedule.dayOfMonth;
        break;
      case ReportScheduleFrequency.Weekly:
        updatedSchedule.dayOfWeek = 1; // Monday by default
        delete updatedSchedule.dayOfMonth;
        break;
      case ReportScheduleFrequency.Monthly:
        delete updatedSchedule.dayOfWeek;
        updatedSchedule.dayOfMonth = 1; // 1st of month by default
        break;
      case ReportScheduleFrequency.Quarterly:
        delete updatedSchedule.dayOfWeek;
        updatedSchedule.dayOfMonth = 1; // 1st of quarter by default
        break;
    }

    setCurrentSchedule(updatedSchedule);
  };

  const handleAddRecipient = () => {
    if (!emailInput.trim()) return;

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setCurrentSchedule({
      ...currentSchedule,
      recipients: [...currentSchedule.recipients, emailInput.trim()],
    });
    setEmailInput('');
    setEmailError('');
  };

  const handleRemoveRecipient = (email: string) => {
    setCurrentSchedule({
      ...currentSchedule,
      recipients: currentSchedule.recipients.filter((recipient) => recipient !== email),
    });
  };

  const handleExportFormatToggle = (format: ExportFormat) => {
    const currentFormats = currentSchedule.exportFormats;
    const updatedFormats = currentFormats.includes(format)
      ? currentFormats.filter((f) => f !== format)
      : [...currentFormats, format];

    setCurrentSchedule({
      ...currentSchedule,
      exportFormats: updatedFormats,
    });
  };

  const handleDateChange = (date: string) => {
    setCurrentSchedule({
      ...currentSchedule,
      startDate: new Date(date),
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-6 max-w-3xl w-full max-h-[80vh] overflow-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Schedule Report</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          ✕
        </button>
      </div>

      <div className="space-y-6">
        {/* Frequency Settings */}
        <div>
          <h3 className="font-semibold mb-3">Frequency</h3>
          <div className="grid grid-cols-4 gap-3">
            {Object.values(ReportScheduleFrequency).map((frequency) => (
              <button
                key={frequency}
                className={`p-3 rounded border ${
                  currentSchedule.frequency === frequency
                    ? 'bg-blue-100 border-blue-500 text-blue-700'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => handleFrequencyChange(frequency)}
              >
                {frequency}
              </button>
            ))}
          </div>
        </div>

        {/* Frequency-specific settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
            <input
              type="time"
              className="w-full border rounded p-2"
              value={currentSchedule.time || '09:00'}
              onChange={(e) =>
                setCurrentSchedule({ ...currentSchedule, time: e.target.value })
              }
            />
          </div>

          {currentSchedule.frequency === ReportScheduleFrequency.Weekly && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Day of Week</label>
              <select
                className="w-full border rounded p-2"
                value={currentSchedule.dayOfWeek || 1}
                onChange={(e) =>
                  setCurrentSchedule({
                    ...currentSchedule,
                    dayOfWeek: Number(e.target.value),
                  })
                }
              >
                <option value={1}>Monday</option>
                <option value={2}>Tuesday</option>
                <option value={3}>Wednesday</option>
                <option value={4}>Thursday</option>
                <option value={5}>Friday</option>
                <option value={6}>Saturday</option>
                <option value={0}>Sunday</option>
              </select>
            </div>
          )}

          {(currentSchedule.frequency === ReportScheduleFrequency.Monthly ||
            currentSchedule.frequency === ReportScheduleFrequency.Quarterly) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Day of Month</label>
              <select
                className="w-full border rounded p-2"
                value={currentSchedule.dayOfMonth || 1}
                onChange={(e) =>
                  setCurrentSchedule({
                    ...currentSchedule,
                    dayOfMonth: Number(e.target.value),
                  })
                }
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              className="w-full border rounded p-2"
              value={currentSchedule.startDate instanceof Date
                ? currentSchedule.startDate.toISOString().split('T')[0]
                : new Date(currentSchedule.startDate).toISOString().split('T')[0]}
              onChange={(e) => handleDateChange(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date (Optional)</label>
            <input
              type="date"
              className="w-full border rounded p-2"
              value={currentSchedule.endDate instanceof Date
                ? currentSchedule.endDate.toISOString().split('T')[0]
                : currentSchedule.endDate
                ? new Date(currentSchedule.endDate).toISOString().split('T')[0]
                : ''}
              onChange={(e) =>
                setCurrentSchedule({
                  ...currentSchedule,
                  endDate: e.target.value ? new Date(e.target.value) : undefined,
                })
              }
            />
          </div>
        </div>

        {/* Export Formats */}
        <div>
          <h3 className="font-semibold mb-3">Export Formats</h3>
          <div className="grid grid-cols-3 gap-3">
            {Object.values(ExportFormat).map((format) => (
              <div
                key={format}
                className={`p-3 rounded border cursor-pointer ${
                  currentSchedule.exportFormats.includes(format)
                    ? 'bg-blue-100 border-blue-500 text-blue-700'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => handleExportFormatToggle(format)}
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={currentSchedule.exportFormats.includes(format)}
                    onChange={() => {}}
                  />
                  {format}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recipients */}
        <div>
          <h3 className="font-semibold mb-3">Recipients</h3>
          <div className="mb-4">
            <div className="flex">
              <input
                type="email"
                className={`flex-1 border rounded-l p-2 ${
                  emailError ? 'border-red-500' : 'border-gray-300'
                }`}
                value={emailInput}
                onChange={(e) => {
                  setEmailInput(e.target.value);
                  setEmailError('');
                }}
                placeholder="Enter email address"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddRecipient();
                  }
                }}
              />
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-r hover:bg-blue-700"
                onClick={handleAddRecipient}
              >
                Add
              </button>
            </div>
            {emailError && <div className="text-red-500 text-sm mt-1">{emailError}</div>}
          </div>

          <div className="space-y-2">
            {currentSchedule.recipients.length === 0 ? (
              <div className="text-gray-500 p-4 border border-dashed rounded text-center">
                No recipients added yet. Add email addresses above.
              </div>
            ) : (
              currentSchedule.recipients.map((email) => (
                <div
                  key={email}
                  className="flex justify-between items-center bg-gray-100 p-2 rounded"
                >
                  <span>{email}</span>
                  <button
                    onClick={() => handleRemoveRecipient(email)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 mt-6 border-t pt-6">
        <button
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={() => onSave(currentSchedule)}
          disabled={currentSchedule.recipients.length === 0 || currentSchedule.exportFormats.length === 0}
          className={`px-4 py-2 rounded ${
            currentSchedule.recipients.length > 0 && currentSchedule.exportFormats.length > 0
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Save Schedule
        </button>
      </div>
    </div>
  );
};

export default ScheduleSettings; 