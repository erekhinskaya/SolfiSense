const octaves = [2, 3, 4, 5];  // Adjusted to span from C2 to C5
const noteFrequencies = {
    'C': 261.63, 'C#': 277.18, 'D': 293.66, 'D#': 311.13, 'E': 329.63,
    'F': 349.23, 'F#': 369.99, 'G': 392.00, 'G#': 415.30, 'A': 440.00,
    'A#': 466.16, 'B': 493.88
};
let generatedSequence = [];
let selectedNotes = [];

function generateSequence() {
    const sequenceLength = parseInt(document.getElementById("sequenceLength").value);
    const firstNote = document.getElementById("firstNote").value;
    const lastNote = document.getElementById("lastNote").value;

    selectedNotes = getNotesInRange(firstNote, lastNote);
    generatedSequence = [];
    for (let i = 0; i < sequenceLength; i++) {
        const randomNote = selectedNotes[Math.floor(Math.random() * selectedNotes.length)];
        generatedSequence.push(randomNote);
    }
    document.getElementById("result").innerText = "New sequence generated!";
}

async function playSequence() {
    if (generatedSequence.length === 0) {
        generateSequence();
    }
    for (const note of generatedSequence) {
        await playNoteSound(note);
    }
}

function playNoteSound(note) {
    return new Promise((resolve) => {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        oscillator.type = "sine";
        oscillator.frequency.value = noteFrequencies[note.slice(0, -1)] * Math.pow(2, parseInt(note.slice(-1)) - 4);
        oscillator.connect(audioCtx.destination);
        oscillator.start();
        setTimeout(() => {
            oscillator.stop();
            resolve();
        }, 500);
    });
}

function checkSequence() {
    const userInput = document.getElementById("userInput").value.trim().split(" ");
    const isCorrect = userInput.length === generatedSequence.length &&
        userInput.every((note, i) => note === generatedSequence[i]);

    document.getElementById("result").innerText = isCorrect ? "Correct! Generating new sequence..." : "Incorrect. Try again!";

    if (isCorrect) {
        setTimeout(generateSequence, 1000);
    }
}

function getNotesInRange(firstNote, lastNote) {
    const allNotes = [];
    let addNotes = false;

    octaves.forEach(octave => {
        for (const note in noteFrequencies) {
            const fullNote = note + octave;
            if (fullNote === firstNote) addNotes = true;
            if (addNotes) allNotes.push(fullNote);
            if (fullNote === lastNote) addNotes = false;
        }
    });
    return allNotes;
}

function setupPiano() {
    const piano = document.getElementById("pianoKeyboard");

    octaves.forEach(octave => {
        const octaveDiv = document.createElement("div");
        octaveDiv.className = "octave";

        const whiteNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
        const blackNotes = { 'C': 'C#', 'D': 'D#', 'F': 'F#', 'G': 'G#', 'A': 'A#' };

        whiteNotes.forEach((note, index) => {
            const whiteKey = document.createElement("div");
            whiteKey.className = "white-key";
            whiteKey.onclick = () => playNoteSound(note + octave);
            whiteKey.innerText = note + octave;
            octaveDiv.appendChild(whiteKey);

            if (blackNotes[note]) {
                const blackKey = document.createElement("div");
                blackKey.className = "black-key";
                blackKey.style.left = `${(index * 40) + 30}px`; // Position black keys accurately
                blackKey.onclick = () => playNoteSound(blackNotes[note] + octave);
                blackKey.innerText = blackNotes[note] + octave;
                octaveDiv.appendChild(blackKey);
            }
        });

        piano.appendChild(octaveDiv);
    });
}

setupPiano();
