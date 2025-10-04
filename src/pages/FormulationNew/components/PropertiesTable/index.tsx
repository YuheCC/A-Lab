import React from 'react';
import './index.css';

interface PropertyItem {
  id: number;
  property: string;
  type: string;
  group?: string;
  estimatedTime?: string;
  groupRowSpan?: number;
  timeRowSpan?: number;
}

interface PropertiesTableProps {
  properties?: PropertyItem[];
}

const defaultProperties: PropertyItem[] = [
  { id: 1, property: 'Radial distribution function (RDF)', type: 'Structural', group: 'Standard Properties', estimatedTime: '3 Days', groupRowSpan: 7, timeRowSpan: 7 },
  { id: 2, property: 'Coordination number', type: 'Structural' },
  { id: 3, property: 'Solvation cluster type and fraction analysis', type: 'Structural' },
  { id: 4, property: 'Diffusivity', type: 'Dynamic' },
  { id: 5, property: 'Conductivity', type: 'Dynamic' },
  { id: 6, property: 'Viscosity', type: 'Dynamic' },
  { id: 7, property: 'Density', type: 'Structural' },
  { id: 8, property: 'Ion-ion correlation', type: 'Dynamic', group: 'Advanced Analysis', estimatedTime: '1 Week', groupRowSpan: 4, timeRowSpan: 4 },
  { id: 9, property: 'Structure factor (S(q))', type: 'Structural' },
  { id: 10, property: 'Dynamic structure factor (S(q,ω))', type: 'Structural + Dynamic' },
  { id: 11, property: 'Residence time', type: 'Dynamic' },
  { id: 12, property: 'EDL (Electric Double Layer)', type: 'Thermodynamic', group: 'Custom Studies', estimatedTime: '1-2 Weeks', groupRowSpan: 2, timeRowSpan: 2 },
  { id: 13, property: 'Solubility', type: 'Thermodynamic' }
];

const PropertiesTable: React.FC<PropertiesTableProps> = ({ properties = defaultProperties }) => {
  return (
    <table className="md-properties-table">
      <thead>
        <tr>
          <th>No.</th>
          <th>Property</th>
          <th>Type</th>
          <th>Group</th>
          <th>Estimated Time</th>
        </tr>
      </thead>
      <tbody>
        {properties.map((item) => (
          <tr key={item.id}>
            <td>{item.id}</td>
            <td>{item.property}</td>
            <td>{item.type}</td>
            {item.groupRowSpan && (
              <td rowSpan={item.groupRowSpan} className="group-cell">{item.group}</td>
            )}
            {item.timeRowSpan && (
              <td rowSpan={item.timeRowSpan} className="time-cell">{item.estimatedTime}</td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default PropertiesTable;