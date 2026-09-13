const sounds = {};

export let currentMusic = null;
export let currentMusicName = null;

export function loadSound(name, src) {
  const audio = new Audio(src);
  audio.preload = 'auto';

  sounds[name] = audio;
}

/* =====================
   MUSIC
===================== */

export function playMusic(name, volume = 0.3) {
  const music = sounds[name];

  if (!music) return;

  if (currentMusicName === name && !music.paused) {
    return;
  }

  if (currentMusic && currentMusic !== music) {
    currentMusic.pause();
  }

  music.volume = volume;
  music.loop = true;

  currentMusic = music;
  currentMusicName = name;

  music.play().catch(err => {
    console.error(
      `${err.name}: Can't play music. Error Message: ${err.message}`
    );
  });
}

export function pauseMusic() {
  currentMusic?.pause();
}

export function resumeMusic() {
  currentMusic?.play();
}

export function stopMusic(name) {
  const music = sounds[name];

  if (!music) return;

  music.pause();
  music.currentTime = 0;

  if (currentMusic === music) {
    currentMusic = null;
    currentMusicName = null;
  }
}

export function stopCurrentMusic() {
  if (!currentMusic) return;

  currentMusic.pause();
  currentMusic.currentTime = 0;

  currentMusic = null;
  currentMusicName = null;
}

/* =====================
   SFX
===================== */

export function playSound(name, volume = 1) {
  const sound = sounds[name];

  if (!sound) return;

  const clone = sound.cloneNode();

  clone.volume = volume;

  clone.play().catch(err => {
    console.error(
      `${err.name}: Can't play sound. Error Message: ${err.message}`
    );
  });
}

/* =====================
   GLOBAL
===================== */

export function stopAllSounds() {
  for (const sound of Object.values(sounds)) {
    sound.pause();
    sound.currentTime = 0;
  }

  currentMusic = null;
  currentMusicName = null;
}

export function pauseAllSounds() {
  for (const sound of Object.values(sounds)) {
    sound.pause();
  }
}

export function isMusicPlaying() {
  return !!(currentMusic && !currentMusic.paused);
}

export function getCurrentMusic() {
  return currentMusic;
}

export function getCurrentMusicName() {
  return currentMusicName;
}

export function initSounds() {
  loadSound('speakerMusic', '/assets/audio/bad_music.m4a');
  loadSound('click', '/assets/audio/click.wav');
  loadSound('purchase', '/assets/audio/purchase.mp3');
  loadSound('pop', '/assets/audio/pop.mp3');
  loadSound('success', '/assets/audio/success.wav');

  // loadSound('day', '/assets/audio/day.mp3');
  // loadSound('night', '/assets/audio/night.mp3');
}