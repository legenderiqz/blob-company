export function randomPicker(...secenekler) {
  if (secenekler.length === 0) return undefined; 
  
  const rastgeleIndeks = Math.floor(Math.random() * secenekler.length);
  
  return secenekler[rastgeleIndeks];
}
