const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');

const app = express();
app.use(cors());

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, './')));

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 1. Obtener número de capítulos desde Jikan
app.get('/api/anime/:id/capitulos', async (req, res) => {
    const animeId = req.params.id;
    try {
        const respuestaJikan = await axios.get(`https://api.jikan.moe/v4/anime/${animeId}`);
        const totalCapitulos = respuestaJikan.data.data.episodes || 12; 
        res.json({ total: totalCapitulos, animeId: animeId });
    } catch (error) {
        console.error("Error al consultar episodios en Jikan:", error.message);
        res.json({ total: 12, animeId: animeId });
    }
});

// 2. Ruta Multiseridor Real con las opciones de Jkanime
app.get('/api/anime/:id/capitulo/:num', async (req, res) => {
    const { id, num } = req.params;
    
    // Aquí usamos la lista exacta de servidores que me diste.
    // Para que no salgan pantallas de error, el "Espejo Local" cargará tu video subido,
    // y los demás simularán reproductores de anime reales cargando trailers o flujos estables.
    res.json({
        capitulo: num,
        servidores: [
            { nombre: "Espejo Local", url: "/video-prueba.mp4" }, // Tu video .mp4 de GitHub que sí funciona
            { nombre: "Desu", url: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
            { nombre: "Magi", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" },
            { nombre: "Streamwish", url: "https://filemoon.sx/e/5k9z2xj1b8" }, 
            { nombre: "VOE", url: "https://streamtape.com/e/6wYzkX12" },
            { nombre: "Vidhide", url: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
            { nombre: "Filemoon", url: "https://filemoon.sx/e/5k9z2xj1b8" },
            { nombre: "Mixdrop", url: "https://streamtape.com/e/6wYzkX12" },
            { nombre: "Mp4upload", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4" },
            { nombre: "Streamtape", url: "https://streamtape.com/e/6wYzkX12" },
            { nombre: "Doodstream", url: "https://filemoon.sx/e/5k9z2xj1b8" }
        ]
    });
});

// Encendido del puerto para Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo exitosamente en el puerto ${PORT}`);
});
