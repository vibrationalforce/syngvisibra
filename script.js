function startExperience() {
    document.getElementById('intro').style.display = 'none';
    document.getElementById('visualization').style.display = 'block';
    startVisualization();
}

function startVisualization() {
    const canvas = document.getElementById('visualizer');
    const canvasCtx = canvas.getContext('2d');
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;

    navigator.mediaDevices.getUserMedia({ audio: true, video: false })
        .then(stream => {
            const source = audioCtx.createMediaStreamSource(stream);
            source.connect(analyser);
            visualize();
        })
        .catch(error => {
            console.error('Error accessing microphone:', error);
        });

    function visualize() {
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        function draw() {
            requestAnimationFrame(draw);
            analyser.getByteFrequencyData(dataArray);

            canvasCtx.fillStyle = 'rgb(0, 0, 0)';
            canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

            const maxIdx = dataArray.indexOf(Math.max(...dataArray));
            const frequency = maxIdx * audioCtx.sampleRate / analyser.fftSize;
            const { color, flickerRate } = getColorAndFlicker(frequency);

            canvasCtx.fillStyle = color;
            canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

            if (Math.random() < flickerRate) {
                canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }

        draw();
    }

    function getColorAndFlicker(frequency) {
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
}
