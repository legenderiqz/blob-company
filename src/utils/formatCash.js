

export function formatCash(value) {
  // Değeri sayıya çevir (BigInt ise)
  const num = typeof value === 'bigint' ? Number(value) : value;
  
  // Eğer 10.000'den küçükse, hiç formatlama yapma
  if (num < 10000) {
    return num.toString();
  }
  
  // 10.000 ve üzeri için K/M/B formatı
  const suffixes = ['', 'K', 'M', 'B', 'T', 'P', 'E'];
  const thousand = 1000;
  
  let tier = 0;
  let temp = num;
  
  while (temp >= thousand && tier < suffixes.length - 1) {
    temp /= thousand;
    tier++;
  }
  
  const divisor = thousand ** tier;
  const whole = Math.floor(num / divisor);
  const decimal = Math.floor((num % divisor) / (divisor / 100));
  
  // **YENİ: Anlamlı basamak mantığı**
  let decimalStr;
  
  if (whole >= 100) {
    // 100+ için: sadece 1 ondalık basamak (194.3M)
    decimalStr = Math.floor(decimal / 10).toString();
  } else {
    // 100'den küçük için: 2 ondalık basamak (28.46M, 1.76M)
    decimalStr = decimal.toString().padStart(2, '0');
  }
  
  // Eğer ondalık kısım 0 ise onu gösterme
  if (parseInt(decimalStr) === 0) {
    return `${whole}${suffixes[tier]}`;
  }
  
  return `${whole}.${decimalStr}${suffixes[tier]}`;
}