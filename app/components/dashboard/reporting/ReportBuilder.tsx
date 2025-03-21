'use client';

import { useState, useEffect } from 'react';
import { ReportDefinition, ReportSection, ReportComponentConfig } from '../../../services/reporting/ReportDefinition';
import ComponentPicker from './ComponentPicker';
import FilterConfiguration from './FilterConfiguration';
import ScheduleSettings from './ScheduleSettings';
import { v4 as uuidv4 } from 'uuid';

interface ReportBuilderProps {
  initialReport?: ReportDefinition;
  onSave: (report: ReportDefinition) => void;
  onPreview: (report: ReportDefinition) => void;
  onCancel: () => void;
}

const defaultReportDefinition: ReportDefinition = {
  id: uuidv4(),
  name: 'New Report',
  description: 'Report description',
  author: 'Current User',
  createdAt: new Date(),
  updatedAt: new Date(),
  sections: [
    {
      id: uuidv4(),
      title: 'Section 1',
      components: [],
    },
  ],
  filters: [],
};

const ReportBuilder: React.FC<ReportBuilderProps> = ({
  initialReport,
  onSave,
  onPreview,
  onCancel,
}) => {
  const [report, setReport] = useState<ReportDefinition>(
    initialReport || defaultReportDefinition
  );
  const [activeSection, setActiveSection] = useState<string>(report.sections[0]?.id || '');
  const [draggedComponent, setDraggedComponent] = useState<ReportComponentConfig | null>(null);
  const [showComponentPicker, setShowComponentPicker] = useState<boolean>(false);
  const [showFilterConfig, setShowFilterConfig] = useState<boolean>(false);
  const [showScheduleSettings, setShowScheduleSettings] = useState<boolean>(false);

  // Update the report's updatedAt timestamp when changes are made
  useEffect(() => {
    setReport((prevReport) => ({
      ...prevReport,
      updatedAt: new Date(),
    }));
  }, [report.name, report.description, report.sections, report.filters]);

  const handleUpdateReport = (field: keyof ReportDefinition, value: any) => {
    setReport({
      ...report,
      [field]: value,
    });
  };

  const handleAddSection = () => {
    const newSection: ReportSection = {
      id: uuidv4(),
      title: `Section ${report.sections.length + 1}`,
      components: [],
    };

    setReport({
      ...report,
      sections: [...report.sections, newSection],
    });
    setActiveSection(newSection.id);
  };

  const handleRemoveSection = (sectionId: string) => {
    const updatedSections = report.sections.filter((section) => section.id !== sectionId);
    setReport({
      ...report,
      sections: updatedSections,
    });

    if (activeSection === sectionId && updatedSections.length > 0) {
      setActiveSection(updatedSections[0].id);
    }
  };

  const handleUpdateSection = (sectionId: string, field: keyof ReportSection, value: any) => {
    const updatedSections = report.sections.map((section) => {
      if (section.id === sectionId) {
        return {
          ...section,
          [field]: value,
        };
      }
      return section;
    });

    setReport({
      ...report,
      sections: updatedSections,
    });
  };

  const handleAddComponent = (component: ReportComponentConfig) => {
    const updatedSections = report.sections.map((section) => {
      if (section.id === activeSection) {
        return {
          ...section,
          components: [...section.components, component],
        };
      }
      return section;
    });

    setReport({
      ...report,
      sections: updatedSections,
    });
    setShowComponentPicker(false);
  };

  const handleRemoveComponent = (sectionId: string, componentId: string) => {
    const updatedSections = report.sections.map((section) => {
      if (section.id === sectionId) {
        return {
          ...section,
          components: section.components.filter((comp) => comp.id !== componentId),
        };
      }
      return section;
    });

    setReport({
      ...report,
      sections: updatedSections,
    });
  };

  const handleUpdateComponent = (
    sectionId: string,
    componentId: string,
    updates: Partial<ReportComponentConfig>
  ) => {
    const updatedSections = report.sections.map((section) => {
      if (section.id === sectionId) {
        return {
          ...section,
          components: section.components.map((component) => {
            if (component.id === componentId) {
              return {
                ...component,
                ...updates,
              };
            }
            return component;
          }),
        };
      }
      return section;
    });

    setReport({
      ...report,
      sections: updatedSections,
    });
  };

  const handleDragStart = (component: ReportComponentConfig) => {
    setDraggedComponent(component);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (sectionId: string) => {
    if (!draggedComponent) return;

    const updatedSections = report.sections.map((section) => {
      if (section.id === sectionId) {
        return {
          ...section,
          components: [...section.components, { ...draggedComponent, id: uuidv4() }],
        };
      }
      return section;
    });

    setReport({
      ...report,
      sections: updatedSections,
    });
    setDraggedComponent(null);
  };

  const activeReportSection = report.sections.find((section) => section.id === activeSection);

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white shadow-md p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Report Builder</h1>
            <div className="flex space-x-4 mt-2">
              <input
                type="text"
                value={report.name}
                onChange={(e) => handleUpdateReport('name', e.target.value)}
                className="border p-2 rounded"
                placeholder="Report Name"
              />
              <input
                type="text"
                value={report.description}
                onChange={(e) => handleUpdateReport('description', e.target.value)}
                className="border p-2 rounded w-64"
                placeholder="Report Description"
              />
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => onPreview(report)}
              className="bg-blue-100 text-blue-700 px-4 py-2 rounded"
            >
              Preview
            </button>
            <button
              onClick={() => setShowFilterConfig(true)}
              className="bg-purple-100 text-purple-700 px-4 py-2 rounded"
            >
              Filters
            </button>
            <button
              onClick={() => setShowScheduleSettings(true)}
              className="bg-green-100 text-green-700 px-4 py-2 rounded"
            >
              Schedule
            </button>
            <button
              onClick={() => onSave(report)}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Save
            </button>
            <button
              onClick={onCancel}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Section Navigator */}
        <div className="w-64 bg-gray-100 p-4 overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold">Sections</h2>
            <button
              onClick={handleAddSection}
              className="bg-green-500 text-white p-1 rounded"
            >
              + Add
            </button>
          </div>
          <div className="space-y-2">
            {report.sections.map((section) => (
              <div
                key={section.id}
                className={`p-2 rounded cursor-pointer ${
                  activeSection === section.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-white hover:bg-blue-100'
                }`}
                onClick={() => setActiveSection(section.id)}
              >
                <div className="flex justify-between items-center">
                  <span>{section.title}</span>
                  {report.sections.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveSection(section.id);
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Report Canvas */}
        <div 
          className="flex-1 bg-gray-50 p-4 overflow-auto"
          onDragOver={handleDragOver}
          onDrop={() => handleDrop(activeSection)}
        >
          {activeReportSection && (
            <div className="bg-white border rounded shadow p-4 mb-4">
              <div className="flex justify-between items-center mb-4">
                <input
                  type="text"
                  value={activeReportSection.title}
                  onChange={(e) =>
                    handleUpdateSection(activeReportSection.id, 'title', e.target.value)
                  }
                  className="text-xl font-bold border-b border-gray-200 focus:border-blue-500 focus:outline-none"
                />
                <button
                  onClick={() => setShowComponentPicker(true)}
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                >
                  + Add Component
                </button>
              </div>

              <div className="space-y-4">
                {activeReportSection.components.map((component) => (
                  <div
                    key={component.id}
                    className="border rounded p-3 bg-gray-50"
                    draggable
                    onDragStart={() => handleDragStart(component)}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold">{component.title}</h3>
                      <button
                        onClick={() =>
                          handleRemoveComponent(activeReportSection.id, component.id)
                        }
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="text-sm text-gray-500">
                      {component.type} - {component.dataSource}
                    </div>
                  </div>
                ))}

                {activeReportSection.components.length === 0 && (
                  <div className="border border-dashed rounded p-8 text-center text-gray-400">
                    Drag and drop components here or click "Add Component"
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Component Picker Dialog */}
      {showComponentPicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
          <ComponentPicker
            onSelect={handleAddComponent}
            onClose={() => setShowComponentPicker(false)}
          />
        </div>
      )}

      {/* Filter Configuration Dialog */}
      {showFilterConfig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
          <FilterConfiguration
            filters={report.filters || []}
            onSave={(filters) => {
              handleUpdateReport('filters', filters);
              setShowFilterConfig(false);
            }}
            onClose={() => setShowFilterConfig(false)}
          />
        </div>
      )}

      {/* Schedule Settings Dialog */}
      {showScheduleSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
          <ScheduleSettings
            schedule={report.schedule}
            onSave={(schedule) => {
              handleUpdateReport('schedule', schedule);
              setShowScheduleSettings(false);
            }}
            onClose={() => setShowScheduleSettings(false)}
          />
        </div>
      )}
    </div>
  );
};

export default ReportBuilder; 