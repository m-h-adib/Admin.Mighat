export function latinDigits(value: string) {
  return value
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 0x0660));
}

export function persianDigits(value: string) {
  return value.replace(/\d/g, (digit) => String.fromCharCode(0x06f0 + Number(digit)));
}

export function isNationalId(value: string) {
  if (!/^\d{10}$/.test(value) || /^(\d)\1{9}$/.test(value)) return false;
  const sum = [...value.slice(0, 9)].reduce(
    (total, digit, index) => total + Number(digit) * (10 - index),
    0,
  );
  const rest = sum % 11;
  return Number(value[9]) === (rest < 2 ? rest : 11 - rest);
}
