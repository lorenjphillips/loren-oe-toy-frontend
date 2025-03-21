/**
 * ScenarioNode Component
 * 
 * Presents the initial clinical situation to the physician
 * Displays patient information and contextual details
 */

'use client';

import React from 'react';
import { ScenarioNode as ScenarioNodeType } from '../../../services/decisionTreeService';

// Component props
interface ScenarioNodeProps {
  node: ScenarioNodeType;
  onContinue: () => void;
}

/**
 * Lab result display component
 */
const LabResult: React.FC<{
  name: string;
  value: string;
  unit: string;
  referenceRange?: string;
  isAbnormal?: boolean;
}> = ({ name, value, unit, referenceRange, isAbnormal }) => (
  <div className={`flex justify-between py-1 ${isAbnormal ? 'text-red-600 font-medium' : ''}`}>
    <span className="mr-4">{name}:</span>
    <div className="flex space-x-2">
      <span>{value} {unit}</span>
      {referenceRange && <span className="text-gray-500 text-sm">({referenceRange})</span>}
    </div>
  </div>
);

/**
 * ScenarioNode Component
 */
const ScenarioNode: React.FC<ScenarioNodeProps> = ({ node, onContinue }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      {/* Title and description */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{node.title}</h2>
        <p className="text-gray-700">{node.content}</p>
      </div>
      
      {/* Patient information card */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">Patient Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Basic demographics */}
          <div className="bg-white rounded p-3 shadow-sm">
            <h4 className="font-medium text-gray-700 mb-2">Demographics</h4>
            <div className="grid grid-cols-2 gap-2">
              <div>Age: <span className="font-medium">{node.patientInfo.age}</span></div>
              <div>Gender: <span className="font-medium">{node.patientInfo.gender}</span></div>
            </div>
          </div>
          
          {/* Chief complaint */}
          <div className="bg-white rounded p-3 shadow-sm">
            <h4 className="font-medium text-gray-700 mb-2">Chief Complaint</h4>
            <p className="font-medium text-red-700">{node.patientInfo.chiefComplaint}</p>
          </div>
          
          {/* Vital signs if available */}
          {node.patientInfo.vitalSigns && (
            <div className="bg-white rounded p-3 shadow-sm">
              <h4 className="font-medium text-gray-700 mb-2">Vital Signs</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {node.patientInfo.vitalSigns.bloodPressure && (
                  <div>BP: <span className="font-medium">{node.patientInfo.vitalSigns.bloodPressure}</span></div>
                )}
                {node.patientInfo.vitalSigns.heartRate && (
                  <div>HR: <span className="font-medium">{node.patientInfo.vitalSigns.heartRate} bpm</span></div>
                )}
                {node.patientInfo.vitalSigns.respiratoryRate && (
                  <div>RR: <span className="font-medium">{node.patientInfo.vitalSigns.respiratoryRate} /min</span></div>
                )}
                {node.patientInfo.vitalSigns.temperature && (
                  <div>Temp: <span className="font-medium">{node.patientInfo.vitalSigns.temperature}°C</span></div>
                )}
                {node.patientInfo.vitalSigns.oxygenSaturation && (
                  <div>O2 Sat: <span className="font-medium">{node.patientInfo.vitalSigns.oxygenSaturation}%</span></div>
                )}
              </div>
            </div>
          )}
          
          {/* Medical history if available */}
          {node.patientInfo.medicalHistory && node.patientInfo.medicalHistory.length > 0 && (
            <div className="bg-white rounded p-3 shadow-sm">
              <h4 className="font-medium text-gray-700 mb-2">Medical History</h4>
              <ul className="list-disc list-inside text-sm">
                {node.patientInfo.medicalHistory.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Medications if available */}
          {node.patientInfo.medications && node.patientInfo.medications.length > 0 && (
            <div className="bg-white rounded p-3 shadow-sm">
              <h4 className="font-medium text-gray-700 mb-2">Current Medications</h4>
              <ul className="list-disc list-inside text-sm">
                {node.patientInfo.medications.map((med, index) => (
                  <li key={index}>{med}</li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Allergies if available */}
          {node.patientInfo.allergies && node.patientInfo.allergies.length > 0 && (
            <div className="bg-white rounded p-3 shadow-sm">
              <h4 className="font-medium text-gray-700 mb-2">Allergies</h4>
              <ul className="list-disc list-inside text-sm">
                {node.patientInfo.allergies.map((allergy, index) => (
                  <li key={index}>{allergy}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        {/* Lab results if available */}
        {node.patientInfo.labResults && node.patientInfo.labResults.length > 0 && (
          <div className="mt-4 bg-white rounded p-3 shadow-sm">
            <h4 className="font-medium text-gray-700 mb-2">Laboratory Results</h4>
            <div className="text-sm">
              {node.patientInfo.labResults.map((lab, index) => (
                <LabResult key={index} {...lab} />
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Image if available */}
      {node.image && (
        <div className="mb-6">
          <img 
            src={node.image} 
            alt={`Image for ${node.title}`} 
            className="rounded-lg shadow-md max-h-80 mx-auto"
          />
        </div>
      )}
      
      {/* Continue button */}
      <div className="flex justify-center mt-6">
        <button
          onClick={onContinue}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md shadow transition-colors"
        >
          Continue to Assessment
        </button>
      </div>
    </div>
  );
};

export default ScenarioNode; 