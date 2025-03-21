'use client';

import { useState } from 'react';
import { DataFilter, DataFilterType } from '../../../services/reporting/ReportDefinition';
import { v4 as uuidv4 } from 'uuid';

interface FilterConfigurationProps {
  filters: DataFilter[];
  onSave: (filters: DataFilter[]) => void;
  onClose: () => void;
}

const OPERATORS = {
  string: ['equals', 'contains', 'starts with', 'ends with', 'is empty', 'is not empty'],
  number: ['equals', 'greater than', 'less than', 'between', 'not equals'],
  date: ['equals', 'after', 'before', 'between', 'last 7 days', 'last 30 days', 'last 90 days', 'year to date'],
  boolean: ['is true', 'is false'],
};

const FILTER_FIELDS = {
  [DataFilterType.DateRange]: [
    { id: 'reportDate', name: 'Report Date', type: 'date' },
    { id: 'prescriptionDate', name: 'Prescription Date', type: 'date' },
    { id: 'transactionDate', name: 'Transaction Date', type: 'date' },
    { id: 'visitDate', name: 'HCP Visit Date', type: 'date' },
  ],
  [DataFilterType.Category]: [
    { id: 'productCategory', name: 'Product Category', type: 'string' },
    { id: 'therapeuticArea', name: 'Therapeutic Area', type: 'string' },
    { id: 'diseaseState', name: 'Disease State', type: 'string' },
    { id: 'patientType', name: 'Patient Type', type: 'string' },
  ],
  [DataFilterType.Threshold]: [
    { id: 'revenueThreshold', name: 'Revenue Threshold', type: 'number' },
    { id: 'marketShareThreshold', name: 'Market Share Threshold', type: 'number' },
    { id: 'growthRateThreshold', name: 'Growth Rate Threshold', type: 'number' },
    { id: 'conversionRateThreshold', name: 'Conversion Rate Threshold', type: 'number' },
  ],
  [DataFilterType.ComparisonType]: [
    { id: 'vsLastPeriod', name: 'vs Last Period', type: 'boolean' },
    { id: 'vsCompetitors', name: 'vs Competitors', type: 'boolean' },
    { id: 'vsProjection', name: 'vs Projection', type: 'boolean' },
    { id: 'vsBenchmark', name: 'vs Industry Benchmark', type: 'boolean' },
  ],
  [DataFilterType.Region]: [
    { id: 'country', name: 'Country', type: 'string' },
    { id: 'state', name: 'State/Province', type: 'string' },
    { id: 'city', name: 'City', type: 'string' },
    { id: 'salesRegion', name: 'Sales Region', type: 'string' },
  ],
  [DataFilterType.Demographic]: [
    { id: 'ageGroup', name: 'Age Group', type: 'string' },
    { id: 'gender', name: 'Gender', type: 'string' },
    { id: 'income', name: 'Income Level', type: 'string' },
    { id: 'hcpSpecialty', name: 'HCP Specialty', type: 'string' },
  ],
};

const FilterConfiguration: React.FC<FilterConfigurationProps> = ({
  filters,
  onSave,
  onClose,
}) => {
  const [activeFilters, setActiveFilters] = useState<DataFilter[]>(filters);
  const [filterType, setFilterType] = useState<DataFilterType>(DataFilterType.DateRange);
  const [field, setField] = useState('');
  const [operator, setOperator] = useState('');
  const [value, setValue] = useState<string | number | boolean>('');
  const [filterLabel, setFilterLabel] = useState('');

  const handleAddFilter = () => {
    if (!field || !operator) return;

    const newFilter: DataFilter = {
      type: filterType,
      field,
      operator,
      value,
      label: filterLabel || `${field} ${operator} ${value}`,
    };

    setActiveFilters([...activeFilters, newFilter]);
    resetForm();
  };

  const resetForm = () => {
    setField('');
    setOperator('');
    setValue('');
    setFilterLabel('');
  };

  const handleRemoveFilter = (index: number) => {
    const updatedFilters = [...activeFilters];
    updatedFilters.splice(index, 1);
    setActiveFilters(updatedFilters);
  };

  const getOperatorOptions = () => {
    if (!field) return [];

    const selectedField = FILTER_FIELDS[filterType].find((f) => f.id === field);
    if (!selectedField) return [];

    return OPERATORS[selectedField.type as keyof typeof OPERATORS] || [];
  };

  const renderValueInput = () => {
    if (!field) return null;

    const selectedField = FILTER_FIELDS[filterType].find((f) => f.id === field);
    if (!selectedField) return null;

    switch (selectedField.type) {
      case 'string':
        return (
          <input
            type="text"
            className="w-full border rounded p-2"
            value={value as string}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Enter value"
          />
        );
      case 'number':
        return (
          <input
            type="number"
            className="w-full border rounded p-2"
            value={value as number}
            onChange={(e) => setValue(Number(e.target.value))}
            placeholder="Enter number"
          />
        );
      case 'date':
        return (
          <input
            type="date"
            className="w-full border rounded p-2"
            value={value as string}
            onChange={(e) => setValue(e.target.value)}
          />
        );
      case 'boolean':
        return (
          <select
            className="w-full border rounded p-2"
            value={value as string}
            onChange={(e) => setValue(e.target.value === 'true')}
          >
            <option value="">Select value</option>
            <option value="true">True</option>
            <option value="false">False</option>
          </select>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-6 max-w-3xl w-full max-h-[80vh] overflow-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Configure Report Filters</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          ✕
        </button>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold mb-3">Active Filters</h3>
        {activeFilters.length === 0 ? (
          <div className="text-gray-500 p-4 border border-dashed rounded text-center">
            No filters configured yet. Add a filter below.
          </div>
        ) : (
          <div className="space-y-2">
            {activeFilters.map((filter, index) => (
              <div
                key={index}
                className="flex justify-between items-center bg-blue-50 p-3 rounded border border-blue-200"
              >
                <div>
                  <span className="font-medium">{filter.label}</span>
                  <div className="text-xs text-gray-500">
                    {filter.type}: {filter.field} {filter.operator} {filter.value}
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveFilter(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t pt-6">
        <h3 className="font-semibold mb-4">Add New Filter</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter Type</label>
            <select
              className="w-full border rounded p-2"
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value as DataFilterType);
                setField('');
                setOperator('');
              }}
            >
              {Object.values(DataFilterType).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Field</label>
            <select
              className="w-full border rounded p-2"
              value={field}
              onChange={(e) => {
                setField(e.target.value);
                setOperator('');
              }}
            >
              <option value="">Select field</option>
              {FILTER_FIELDS[filterType].map((fieldOption) => (
                <option key={fieldOption.id} value={fieldOption.id}>
                  {fieldOption.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Operator</label>
            <select
              className="w-full border rounded p-2"
              value={operator}
              onChange={(e) => setOperator(e.target.value)}
              disabled={!field}
            >
              <option value="">Select operator</option>
              {getOperatorOptions().map((op) => (
                <option key={op} value={op}>
                  {op}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
            {renderValueInput()}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Filter Label (optional)
          </label>
          <input
            type="text"
            className="w-full border rounded p-2"
            value={filterLabel}
            onChange={(e) => setFilterLabel(e.target.value)}
            placeholder="Enter a user-friendly label for this filter"
          />
        </div>

        <button
          onClick={handleAddFilter}
          disabled={!field || !operator}
          className={`px-4 py-2 rounded ${
            field && operator
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Add Filter
        </button>
      </div>

      <div className="flex justify-end space-x-3 mt-6 border-t pt-6">
        <button
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={() => onSave(activeFilters)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Save Filters
        </button>
      </div>
    </div>
  );
};

export default FilterConfiguration; 