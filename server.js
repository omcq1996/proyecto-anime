const express = require('express');
const cors = require('cors');
const path = require('path'); // <-- Asegúrate de que esta línea esté aquí arriba

const app = express();
app.use(cors());

// 1. Servir archivos estáticos (Le dice a Render dónde están index.html, estilos.css y app.js)
app.use(express.static(path.join(__dirname, './')));

// 2. Ruta principal (Cuando la gente entra a la URL limpia)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// --- TUS RUTAS DE LA API (Dejalas tal como estaban) ---
const servidoresEspejo = {
    20: {
        1: "https://filemoon.sx/e/5k9z2xj1b8",
        2: "https://streamtape.com/e/6wYzkX12", 
        3: "https://vidoza.net/embed-x9z2.html"
    },
    "default": [
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4"
    ]
};

app.get('/api/anime/:id/capitulos', (req, res) => {
    const animeId = req.params.id;
    const totalCapitulos = 12; 
    res.json({ total: totalCapitulos, animeId: animeId });
});

app.get('/api/anime/:id/capitulo/:num', (req, res) => {
    const { id, num } = req.params;
    if (servidoresEspejo[id] && servidoresEspejo[id][num]) {
        return res.json({ videoUrl: servidoresEspejo[id][num] });
    }
    const listaDefault = servidoresEspejo["default"];
    const videoUrl = listaDefault[(num - 1) % listaDefault.length];
    res.json({ videoUrl: videoUrl });
});

// 3. Encendido del puerto dinámico para Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});
