export default function checkPasswordIntegrity(password: string): string[] {
  const unmatched: string[] = [];

  if (!password.match(/.{8,32}/)) unmatched.push('Heslo musí mít 8-32 znaků');
  if (!password.match(/.*\d.*\d/)) unmatched.push('Heslo musí obsahovat alespoň 2 číslice');
  if (!password.match(/([a-z].*){2,}/)) unmatched.push('Heslo musí obsahovat alespoň 2 malá písmena');
  if (!password.match(/([A-Z].*){2,}/)) unmatched.push('Heslo musí obsahovat alespoň 2 velká písmena');
  if (!password.match(/(\W.*){2,}/)) unmatched.push('Heslo musí obsahovat alespoň 2 symboly');
  if (!password.match(/[a-zA-Z0-9\W_]+/)) unmatched.push('Heslo může obsahovat pouze písmena, čísla a běžné symboly');

  return unmatched;
}
