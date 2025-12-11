export const buildQueryString = (
  cathodeInput: string,
  anodeInput: string,
  solventInput: string,
  cellDesignInput: string,
  metricInput: string,
) => {
  const cathode = cathodeInput.trim();
  const anode = anodeInput.trim();
  const solvent = solventInput.trim();
  const cellDesign = cellDesignInput.trim();
  const metric = metricInput.trim();

  const intro = solvent ? `I have ${solvent} in a battery` : 'I have a battery';

  let rest = '';
  if (cathode && anode) rest = ` with ${cathode} cathode and ${anode} anode`;
  else if (cathode) rest = ` with ${cathode} cathode`;
  else if (anode) rest = ` with ${anode} anode`;

  const cellDesignPart = cellDesign ? ` using a ${cellDesign} cell design` : '';
  const question = metric ? ` How can I improve ${metric}?` : ' How can I improve it?';

  return `${intro}${rest}${cellDesignPart}.${question}`;
};
