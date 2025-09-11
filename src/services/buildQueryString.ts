export const buildQueryString = (c: string, a: string, s: string, sv: string, m: string) => {
    const introParts: string[] = [];
    if (s) introParts.push(s);
    if (sv) introParts.push(`in ${sv}`);
    const intro = introParts.length ? `I have ${introParts.join(' ')} in a battery` : 'I have a battery';
    let rest = '';
    if (c && a) rest = ` with ${c} cathode and ${a} anode`;
    else if (c) rest = ` with ${c} cathode`;
    else if (a) rest = ` with ${a} anode`;
    const question = m ? ` How can I improve ${m}?` : ' How can I improve it?';
    return `${intro}${rest}.${question}`;
  };