const button = document.getElementById("btn-camera");
const video = document.getElementById("video")
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const status= document.getElementById("status");

button.addEventListener("click", () => {
    camera.start();
})

const hands = new Hands({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
});

hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.7,
});

hands.onResults(function(results) {
    console.log(results.multiHandLandmarks);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Loop semua titik jari
    results.multiHandLandmarks.forEach(landmarks => {
        landmarks.forEach(point => {
        const x = point.x * canvas.width;
        const y = point.y * canvas.height;

        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = "red";
        ctx.fill();
        });
    });

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const hand = results.multiHandLandmarks[0]; // tangan pertama yang terdeteksi
        const telunjuk = hand[8]; // ujung jari telunjuk
        const pangkalTelunjuk = hand[5]; // pangkal jari telunjuk
        const jempol = hand[4];

        const deltaY = telunjuk.y - pangkalTelunjuk.y;
        const dx = jempol.x - telunjuk.x;
        const dy = jempol.y - telunjuk.y;
        const jarak = Math.sqrt(dx * dx + dy * dy);

        if (!window._zoomStart) {
        window._zoomStart = jarak; // simpan jarak awal
    }

    const perbedaanZoom = jarak - window._zoomStart;

    if (Math.abs(perbedaanZoom) > 0.05) {
    const scale = 1 + (perbedaanZoom > 0 ? 0.1 : -0.1);
    document.body.style.transform = `scale(${scale})`;
    }

    if (deltaY < -0.07) {
    console.log("⬆️ Nunjuk ke atas");
    document.body.style.backgroundColor = "cyan";
    status.innerText = "⬆️ Nunjuk ke Atas";
    } else if (deltaY > 0.07) {
    console.log("⬇️ Nunjuk ke bawah");
    document.body.style.backgroundColor = "brown";
    status.innerText = "⬇️ Nunjuk ke Bawah";
    } else {
    console.log("✋ Netral");
    document.body.style.backgroundColor = "white";
    status.innerText = "✋ Netral";
    }

}

});

const camera = new Camera(video, {
    onFrame: async () => {
    // Cek ulang ukuran canvas saat kamera aktif
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        }

        await hands.send({ image: video });
    },
    width: 640,
    height: 480
});


video.addEventListener('loadeddata', () => {
    const width = video.videoWidth;
    const height = video.videoHeight;

    video.width = width;
    video.height = height;

    canvas.width = width;
    canvas.height = height;
});
