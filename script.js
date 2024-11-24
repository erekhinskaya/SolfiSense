// Create a Tone.js Sampler for piano-like sounds
let samplerLoaded = false;

const pianoSampler = new Tone.Sampler({
    urls: {
        "C3": "C3.mp3",
        "D#3": "Ds3.mp3",
        "F#3": "Fs3.mp3",
        "A3": "A3.mp3",
        "C4": "C4.mp3",
        "D#4": "Ds4.mp3",
        "F#4": "Fs4.mp3",
        "A4": "A4.mp3",
        "C5": "C5.mp3",
    },
    release: 1, // Controls how long the note sustains
    baseUrl: "https://tonejs.github.io/audio/salamander/",
    onload: () => {
        samplerLoaded = true;
        console.log("Sampler loaded successfully.");
    },
}).toDestination();

const octaves = [2, 3, 4, 5]; // Adjusted to span from C2 to C5
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
        try {
            await playNoteSound(note);
        } catch (error) {
            console.error(error.message);
        }
    }
}

function playNoteSound(note) {
    return new Promise((resolve, reject) => {
        if (samplerLoaded) {
            pianoSampler.triggerAttackRelease(note, "500ms"); // Play note for 500ms
            setTimeout(resolve, 500); // Resolve after the note plays
        } else {
            reject(new Error("Sampler is not loaded yet."));
        }
    });
}

function checkSequence() {
    const userInput = document.getElementById("userInput").value.trim().split(" ");
    const isCorrect =
        userInput.length === generatedSequence.length &&
        userInput.every((note, i) => note === generatedSequence[i]);

    document.getElementById("result").innerText = isCorrect
        ? "Correct! Generating new sequence..."
        : "Incorrect. Try again!";

    if (isCorrect) {
        setTimeout(generateSequence, 1000);
    }
}

function getNotesInRange(firstNote, lastNote) {
    const allNotes = [];
    let addNotes = false;

    octaves.forEach(octave => {
        for (const note of ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]) {
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

        const whiteNotes = ["C", "D", "E", "F", "G", "A", "B"];
        const blackNotes = { C: "C#", D: "D#", F: "F#", G: "G#", A: "A#" };

        whiteNotes.forEach((note, index) => {
            const whiteKey = document.createElement("div");
            whiteKey.className = "white-key";
            whiteKey.onclick = () => playNoteSound(note + octave);
            whiteKey.innerText = note + octave;
            octaveDiv.appendChild(whiteKey);

            if (blackNotes[note]) {
                const blackKey = document.createElement("div");
                blackKey.className = "black-key";
                blackKey.style.left = `${index * 40 + 30}px`; // Position black keys accurately
                blackKey.onclick = () => playNoteSound(blackNotes[note] + octave);
                blackKey.innerText = blackNotes[note] + octave;
                octaveDiv.appendChild(blackKey);
            }
        });

        piano.appendChild(octaveDiv);
    });
}

// Initialize the piano
setupPiano();
