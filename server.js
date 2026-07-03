const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');

const app = express();
app.use(cors());

app.use(express.static(path.join(__dirname, './')));

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
        res.json({ total: 12, animeId: animeId });
    }
});

// 2. Ruta con los Enlaces Reales de los Servidores
app.get('/api/anime/:id/capitulo/:num', async (req, res) => {
    const animeId = req.params.id;
    const { num } = req.params;
    
    // Aquí es donde empieza la magia real.
    // Creamos una lista de servidores por defecto (reproductores reales activos)
    let misServidores = [
        { nombre: "Streamwish", url: "https://awish.pro/e/f97bshgq6m97" }, // Enlace real de un reproductor de anime activo
        { nombre: "Filemoon", url: "https://filemoon.sx/e/5k9z2xj1b8" },
        { nombre: "Espejo Local", url: "/video-prueba.mp4" }
    ];

    // [OPCIONAL] Si quieres configurar capítulos específicos de un anime:
    // Por ejemplo, si el ID del anime es de One Piece o Re:Zero, puedes cambiar los links:
    if (animeId === "21") { // ID de Jikan para un anime específico
        if (num === "1") {
            misServidores = [
                { nombre: "Streamwish", url: const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');

const app = express();
app.use(cors());

app.use(express.static(path.join(__dirname, './')));

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
        res.json({ total: 12, animeId: animeId });
    }
});

// 2. Ruta con los Enlaces Reales de los Servidores
app.get('/api/anime/:id/capitulo/:num', async (req, res) => {
    const animeId = req.params.id;
    const { num } = req.params;
    
    // Aquí es donde empieza la magia real.
    // Creamos una lista de servidores por defecto (reproductores reales activos)
    let misServidores = [
        { nombre: "Streamwish", url: "https://awish.pro/e/f97bshgq6m97" }, // Enlace real de un reproductor de anime activo
        { nombre: "Filemoon", url: "https://filemoon.sx/e/5k9z2xj1b8" },
        { nombre: "Espejo Local", url: "/video-prueba.mp4" }
    ];

    // [OPCIONAL] Si quieres configurar capítulos específicos de un anime:
    // Por ejemplo, si el ID del anime es de One Piece o Re:Zero, puedes cambiar los links:
    if (animeId === "20") { // ID de Jikan para un anime específico
        if (num === "1") {
            misServidores = [
                { nombre: "Streamwish", url: "https://cdn.jkdesa.com/assets3/js/ua-parser.js?v=2.0.184" },
                { nombre: "VOE", url: "URL_DE_VOE_QUE_COPIASTE" }
            ];
        }
    }

    res.json({
        capitulo: num,
        servidores: misServidores
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor con capítulos reales corriendo en el puerto ${PORT}`);
}); },
                { nombre: "VOE", url: "URL_DE_VOE_QUE_COPIASTE" }
            ];
        }
    }

    res.json({
        capitulo: num,
        servidores: misServidores
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor con capítulos reales corriendo en el puerto ${PORT}`);
});
   
       
