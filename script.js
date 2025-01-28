function startExperience() {
    document.getElementById('landing-page').style.display = 'none'; // Korrekte ID
    document.getElementById('app').style.display = 'block'; // Korrekte ID
    const canvas = document.getElementById('visualisierung'); // Korrekte ID
    canvas.width = window.innerWidth; // Canvas an Fenstergröße anpassen
    canvas.height = window.innerHeight;
    startVisualization(canvas); // Übergabe des Canvas an die Funktion
}

function startVisualization(canvas) { // Canvas als Parameter
    const canvasCtx = canvas.getContext('2d');
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;

    navigator.mediaDevices.getUserMedia({ audio: true, video: false })
        .then(stream => {
            const source = audioCtx.createMediaStreamSource(stream);
            source.connect(analyser);
            visualize(canvas, canvasCtx, analyser); // Parameter an visualize übergeben
        })
        .catch(error => {
            console.error('Error accessing microphone:', error);
        });
}

function visualize(canvas, canvasCtx, analyser) { // Parameter für Canvas, Kontext und Analyser
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function draw() {
        requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);

        // Canvas leeren (effizienter als jedes Mal neu füllen)
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height); 

        const maxIdx = dataArray.indexOf(Math.max(...dataArray));
        const frequency = maxIdx * audioCtx.sampleRate / analyser.fftSize;
        const { color, flickerRate } = getColorAndFlicker(frequency);

        canvasCtx.fillStyle = color;
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

        // Flackern optimieren (weniger Berechnungen)
        if (Math.random() < flickerRate) {
            canvasCtx.fillStyle = 'black'; // Schnelleres Flackern
            canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }

    draw();
}

function getColorAndFlicker(frequency) {
    // Optimierte Farbbereiche (direkte Zuordnung)
    if (frequency >= 256 && frequency < 512) {
        return { color: 'green', flickerRate: 0.125 };
    } else if (frequency >= 512 && frequency < 1024) {
        return { color: 'blue', flickerRate: 0.0625 };
    } else if (frequency >= 1024 && frequency < 2048) {
        return { color: 'red', flickerRate: 0.03125 };
    } else {
        return { color: 'white', flickerRate: 0.0 };
    }
}