export function randomPicker(...secenekler) {
  // Eğer hiç parametre verilmediyse undefined döner
  if (secenekler.length === 0) return undefined; 
  
  // Dizi uzunluğuna göre rastgele bir indeks seçer
  const rastgeleIndeks = Math.floor(Math.random() * secenekler.length);
  
  // O indeksteki değeri döndürür
  return secenekler[rastgeleIndeks];
}
