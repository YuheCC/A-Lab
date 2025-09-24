// Format ion display
export const formatIonDisplay = (ionValue: string) => {
    const ionMap: { [key: string]: string } = {
      'Li': 'Li⁺',
      'Na': 'Na⁺',
      'Mg2': 'Mg²⁺',
      'Zn2': 'Zn²⁺',
      'BF4': 'BF₄⁻',
      'PF6': 'PF₆⁻',
      'FSI': 'FSI⁻',
      'TFSI': 'TFSI⁻'
    };
    console.log('ionMap', ionMap);
    console.log('ionMap[ionValue]', ionMap[ionValue]);
    return ionMap[ionValue] || ionValue;
};