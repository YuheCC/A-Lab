import React from 'react';
import './index.css';

interface PropertyItem {
  id: number;
  property: string;
  type: string;
  estimatedTime?: string;
  rowSpan?: number;
}

interface PropertiesTableProps {
  properties?: PropertyItem[];
}

const defaultProperties: PropertyItem[] = [
  { id: 1, property: 'Radial distribution function (RDF)', type: 'Structural', estimatedTime: '3 Days', rowSpan: 8 },
  { id: 2, property: 'Coordination number', type: 'Structural' },
  { id: 3, property: 'Solvation cluster type and fraction analysis', type: 'Structural' },
  { id: 4, property: 'Diffusivity', type: 'Dynamic' },
  { id: 5, property: 'Conductivity', type: 'Dynamic' },
  { id: 6, property: 'Ion–ion correlation', type: 'Dynamic' },
  { id: 7, property: 'Viscosity', type: 'Dynamic' },
  { id: 8, property: 'Density', type: 'Structural' },
  { id: 9, property: 'Structure factor (S(q))', type: 'Structural', estimatedTime: '1 Week', rowSpan: 3 },
  { id: 10, property: 'Dynamic structure factor (S(q,ω))', type: 'Structural + Dynamic' },
  { id: 11, property: 'Residence time', type: 'Dynamic' },
  { id: 12, property: 'EDL (Electric Double Layer)', type: 'Thermodynamic', estimatedTime: '1-2 Weeks', rowSpan: 2 },
  { id: 13, property: 'Solubility', type: 'Thermodynamic' }
];

const PropertiesTable: React.FC<PropertiesTableProps> = ({ properties = defaultProperties }) => {
  return (
    <table className="properties-table">
      <thead>
        <tr>
          <th></th>
          <th>Property</th>
          <th>Type</th>
          <th>Estimated Time</th>
        </tr>
      </thead>
      <tbody>
        {properties.map((item) => (
          <tr key={item.id}>
            <td>{item.id}</td>
            <td>{item.property}</td>
            <td>{item.type}</td>
            {item.estimatedTime && item.rowSpan ? (
              <td rowSpan={item.rowSpan} className="time-cell">{item.estimatedTime}</td>
            ) : item.estimatedTime && !item.rowSpan ? (
              <td className="time-cell">{item.estimatedTime}</td>
            ) : null}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default PropertiesTable;