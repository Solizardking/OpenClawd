/**
 * MusicPlayer - Background music player for OpenClawd UI
 */

const MUSIC_URL = "https://pub-9a12d2869ea54d26bc39b55ba9a84e9a.r2.dev/beats/Solana%2BClawd.mp3";

let audio: HTMLAudioElement | null = null;
let isPlaying = false;
let volume = 0.5;

export function initMusicPlayer(): void {
    // Create audio element
    audio = new Audio(MUSIC_URL);
    audio.loop = true;
    audio.volume = volume;
    
    // Create floating music button
    const button = document.createElement('button');
    button.id = 'music-toggle';
    button.innerHTML = '🎵';
    button.className = 'music-toggle';
    button.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: linear-gradient(135deg, #9945FF, #14F195);
        border: none;
        cursor: pointer;
        font-size: 20px;
        z-index: 10000;
        box-shadow: 0 4px 20px rgba(153, 69, 255, 0.4);
        transition: all 0.3s ease;
    `;
    
    button.addEventListener('click', toggleMusic);
    button.addEventListener('mouseenter', () => {
        button.style.transform = 'scale(1.1)';
    });
    button.addEventListener('mouseleave', () => {
        button.style.transform = 'scale(1)';
    });
    
    document.body.appendChild(button);
}

export function toggleMusic(): void {
    if (!audio) return;
    
    if (isPlaying) {
        audio.pause();
        document.getElementById('music-toggle')!.innerHTML = '🎵';
        isPlaying = false;
    } else {
        audio.play().catch(() => {
            console.log('Music autoplay blocked by browser');
        });
        document.getElementById('music-toggle')!.innerHTML = '🔊';
        isPlaying = true;
    }
}

export function setVolume(v: number): void {
    volume = Math.max(0, Math.min(1, v));
    if (audio) audio.volume = volume;
}

export function getIsPlaying(): boolean {
    return isPlaying;
}
