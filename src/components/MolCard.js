import MolViewer2D from './MolViewer2D';

export const RowGroup = ({ data, propList = [] }) => {
    return (
        <tr>
            {propList.filter(prop => prop?.show !== false).map((prop) => (
                <td key={prop.label} colSpan={propList.length === 1 ? 2 : 1}>
                    <div className='deck-info-group'>
                        <label>{prop.label}</label>
                        <code>{prop.value ?? "N/A"}{prop.value && prop?.suffix ? prop.suffix : ""}</code>
                    </div>
                </td>
            ))}
        </tr>
    )
};

export const MolCard = (props) => {
    const { showMoreDetails = false, propGroups = [], name, children } = props;

    // Validate propGroups structure
    // - Check if propGroups is an array of arrays
    // - Each inner array should contain objects with 'value' and 'label' properties (maybe null/undefined)
    if (!propGroups.every(group => Array.isArray(group) && group.every(prop => prop.hasOwnProperty('value') && prop.hasOwnProperty('label')))) {
        return <div className='deck-hover-info' {...props}><div className='deck-error'>Invalid molecule data structure.</div></div>;
    }

    const smileString = propGroups.reduce((acc, group) => {
        if (acc) return acc; // Return early if already found
        const found = group.find(prop => prop.label && prop.label.toLowerCase().indexOf('smiles') !== -1);
        return found ? found.value : acc;
    }, null);

    if (!smileString) {
        return <div className='deck-hover-info' {...props}><div className='deck-error'>No molecule data available.</div></div>;
    }

    return (
        <div className='deck-hover-info' {...props}>
            <div style={{ display: 'flex', flexFlow: 'row' }}>
                <div className='deck-hover-vis' translate='no'>
                    {smileString ? <MolViewer2D smile={smileString} width={200} height={200} /> : <div style={{
                        width: '150px',
                        height: '150px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>Loading...</div>}
                </div>
                <div className='deck-info-panel'>
                    <div className='deck-info-title'>{name ?? "Molecule Information"}</div>
                    <table translate='no'>
                        <tbody>
                            {propGroups && propGroups.length > 0 ? (
                                propGroups.map((group, index) => (
                                    <RowGroup
                                        key={index}
                                        propList={group}
                                    />
                                ))
                            ): null}
                        </tbody>
                    </table>
                </div>
            </div>
            {showMoreDetails ? <div className='deck-info-footer'>
                Click on the molecule to view more details.
            </div> : null}
            {children ? <div className='deck-info-children'>{children}</div> : null}
        </div>
    )
}