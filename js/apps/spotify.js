// --- SPOTIFY CLONE LOGIC ---
let spIsPlaying = false;
let spCurrentSong = { title: "Neon Vibes", artist: "Unknown Artist", duration: 200 };
let spProgress = 0;
let spInterval = null;

function spPlay(id) {
    const titles = ["Neon Vibes", "Daily Mix 1", "Coding Mode", "Top Brasil", "Midnight City", "Blinding Lights", "Nightcall"];
    const artists = ["Unknown", "Spotify", "Focus", "Charts", "M83", "The Weeknd", "Kavinsky"];

    spCurrentSong.title = titles[id] || "Unknown Song";
    spCurrentSong.artist = artists[id] || "Unknown Artist";

    document.getElementById('sp-current-track').textContent = spCurrentSong.title;
    document.getElementById('sp-current-artist').textContent = spCurrentSong.artist;

    spIsPlaying = true;
    spUpdateBtn();
    spStartTimer();
}

function spTogglePlay() {
    spIsPlaying = !spIsPlaying;
    spUpdateBtn();
    if (spIsPlaying) spStartTimer();
    else clearInterval(spInterval);
}

function spUpdateBtn() {
    const btn = document.getElementById('sp-play-btn');
    if (btn) btn.textContent = spIsPlaying ? "⏸" : "▶";
}

function spStartTimer() {
    clearInterval(spInterval);
    spInterval = setInterval(() => {
        if (!spIsPlaying) return;
        spProgress += 0.5; // fake speed
        if (spProgress > 100) spProgress = 0;

        const bar = document.getElementById('sp-progress');
        if (bar) bar.style.width = spProgress + '%';
    }, 100);
}

window.spPlay = spPlay;
window.spTogglePlay = spTogglePlay;
