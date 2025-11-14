export const buildQueryString = (
  cathodeInput: string,
  anodeInput: string,
  saltInput: string,
  solventInput: string,
  cellDesignInput: string,
  metricInput: string,
) => {
  const cathode = cathodeInput.trim();
  const anode = anodeInput.trim();
  const salt = saltInput.trim();
  const solvent = solventInput.trim();
  const cellDesign = cellDesignInput.trim();
  const metric = metricInput.trim();

  const introParts: string[] = [];
  if (salt) introParts.push(salt);
  if (solvent) introParts.push(`in ${solvent}`);
  const intro = introParts.length ? `I have ${introParts.join(' ')} in a battery` : 'I have a battery';

  let rest = '';
  if (cathode && anode) rest = ` with ${cathode} cathode and ${anode} anode`;
  else if (cathode) rest = ` with ${cathode} cathode`;
  else if (anode) rest = ` with ${anode} anode`;

  const cellDesignPart = cellDesign ? ` using a ${cellDesign} cell design` : '';
  const question = metric ? ` How can I improve ${metric}?` : ' How can I improve it?';

  return `${intro}${rest}${cellDesignPart}.${question}`;
};
