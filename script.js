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
    const mode = document.getElementById("modeType").value;
    const sequenceLength = parseInt(document.getElementById("sequenceLength").value);
    const firstNote = document.getElementById("firstNote").value;
    const lastNote = document.getElementById("lastNote").value;

    if (mode === "random") {
        selectedNotes = getNotesInRange(firstNote, lastNote);
        generatedSequence = [];
        for (let i = 0; i < sequenceLength; i++) {
            const randomNote = selectedNotes[Math.floor(Math.random() * selectedNotes.length)];
            generatedSequence.push(randomNote);
        }
    } else if (mode === "melody") {
        const melody = predefinedMelodies[Math.floor(Math.random() * predefinedMelodies.length)];
        console.log('selected melody: ', melody);
        selectedNotes = getNotesInRange(firstNote, lastNote);

        // Transpose the entire melody to fit within the range
        generatedSequence = transposeMelodyToRange(melody, selectedNotes);

        // Trim or pad the melody to match the sequence length
        generatedSequence = generatedSequence.slice(0, sequenceLength);
        while (generatedSequence.length < sequenceLength) {
            generatedSequence.push(...generatedSequence.slice(0, sequenceLength - generatedSequence.length));
        }
    }

    console.log(generatedSequence);
    document.getElementById("result").innerText = "New sequence generated!";
}

/**
 * Transposes an entire melody to fit within the given range of notes.
 * @param {string[]} melody - The original melody (e.g., ["C4", "E4", "G4"]).
 * @param {string[]} range - Array of notes in the desired range.
 * @returns {string[]} - Transposed melody within the range.
 */
function transposeMelodyToRange(melody, range) {
    if (!melody || melody.length === 0) {
        throw new Error("Melody is empty or undefined.");
    }
    if (!range || range.length === 0) {
        throw new Error("Range is empty or undefined.");
    }

    // Convert all notes to MIDI numbers for easy calculations
    const melodyMidi = melody.map(noteToMidi);
    const rangeMidi = range.map(noteToMidi);

    const melodyMin = Math.min(...melodyMidi);
    const melodyMax = Math.max(...melodyMidi);
    const rangeMin = Math.min(...rangeMidi);
    const rangeMax = Math.max(...rangeMidi);

    // Calculate the transposition needed to fit within the range
    let transposition = 0;
    if (melodyMin < rangeMin) {
        transposition = rangeMin - melodyMin; // Shift up
    } else if (melodyMax > rangeMax) {
        transposition = rangeMax - melodyMax; // Shift down
    }

    // Apply the transposition to the entire melody
    return melodyMidi.map(midi => midiToNote(midi + transposition));
}

/**
 * Converts a note (e.g., "C4") to its MIDI number.
 * @param {string} note - The note to convert.
 * @returns {number} - The MIDI number.
 */
function noteToMidi(note) {
    const noteBase = note.slice(0, -1); // e.g., "C"
    const noteOctave = parseInt(note.slice(-1)); // e.g., 4
    const noteMap = { C: 0, "C#": 1, D: 2, "D#": 3, E: 4, F: 5, "F#": 6, G: 7, "G#": 8, A: 9, "A#": 10, B: 11 };
    return noteMap[noteBase] + (noteOctave + 1) * 12; // MIDI calculation
}

/**
 * Converts a MIDI number to a note (e.g., 60 -> "C4").
 * @param {number} midi - The MIDI number to convert.
 * @returns {string} - The note name.
 */
function midiToNote(midi) {
    const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const noteBase = noteNames[midi % 12];
    const noteOctave = Math.floor(midi / 12) - 1;
    return `${noteBase}${noteOctave}`;
}


async function playSequence() {
    const playSequenceButton = document.querySelector("button[onclick='playSequence()']");
    if (generatedSequence.length === 0) {
        generateSequence();
    }

    // Disable the "Play" button for the generated sequence
    playSequenceButton.disabled = true;

    // Play the generated sequence
    await playMelody(generatedSequence);

    // Re-enable the button after playback
    playSequenceButton.disabled = false;

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

    // Define major and minor scales
    const scaleIntervals = {
        major: ["C", "D", "E", "F", "G", "A", "B"],
        minor: ["C", "D", "D#", "F", "G", "G#", "A#"],
    };

    // Get selected scale type
    const scaleType = document.getElementById("scaleType").value;

    octaves.forEach(octave => {
        for (const note of scaleIntervals[scaleType]) {
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

function playUserInput() {
    const userInput = document.getElementById("userInput").value.trim();
    const playUserButton = document.querySelector("button[onclick='playUserInput()']");

    if (!userInput) {
        document.getElementById("result").innerText = "Please enter a melody!";
        return;
    }

    const userNotes = userInput.split(" ").map(note => note.trim()); // Parse user input
    console.log("User Input Notes:", userNotes);

    // Validate the user input
    const validNotes = userNotes.every(note => /^[A-G](#?)[0-8]$/.test(note)); // Regex for valid notes
    if (!validNotes) {
        document.getElementById("result").innerText = "Invalid notes in input!";
        return;
    }

    // Disable the "Play" button for user input
    playUserButton.disabled = true;

    // Play the user-inputted melody
    playMelody(userNotes).then(() => {
        playUserButton.disabled = false; // Re-enable the button after playback
    });
}

/**
 * Plays a melody from an array of notes.
 * @param {string[]} notes - Array of notes to play (e.g., ["C4", "E4", "G4"]).
 */
async function playMelody(notes) {
    for (const note of notes) {
        try {
            await playNoteSound(note);
        } catch (error) {
            console.error("Error playing note:", note, error.message);
        }
    }
}

// Initialize the piano
setupPiano();
