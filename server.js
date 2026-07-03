const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');

const app = express();
app.use(cors());

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, './')));

// Ruta principal para cargar el index.html en Render
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

// 2. Ruta con los Enlaces Reales de los Servidores por ID y Capítulo
app.get('/api/anime/:id/capitulo/:num', async (req, res) => {
    const animeId = req.params.id;
    const { num } = req.params;
    
    // Lista de servidores por defecto (reproductores de anime activos que sirven de ejemplo base)
    let misServidores = [
        { nombre: "Streamwish", url: "https://awish.pro/e/f97bshgq6m97" },
        { nombre: "Filemoon", url: "https://filemoon.sx/e/5k9z2xj1b8" },
        { nombre: "Espejo Local", url: "/video-prueba.mp4" }
    ];

    // ======================================================================
    // EJEMPLO: Configurar links reales para RE:ZERO (Su ID de MyAnimeList es 31240)
    // ======================================================================
    if (animeId === "31240") { 
        if (num === "1") {
            misServidores = [
                { nombre: "Streamwish", url: "https://awish.pro/e/aquí_va_el_id_real_del_cap_1" },
                { nombre: "Filemoon", url: "https://filemoon.sx/e/aquí_va_el_id_real_del_cap_1" }
            ];
        }
        if (num === "2") {
            misServidores = [
                { nombre: "Streamwish", url: "https://awish.pro/e/aquí_va_el_id_real_del_cap_2" }
            ];
        }
    }

    // ======================================================================
    // EJEMPLO: Configurar links reales para ONE PIECE (Su ID de MyAnimeList es 21)
    // ======================================================================
    if (animeId === "20") {
        if (num === "1") {
            misServidores = [
                { nombre: "Magi (JKPlayer)", url:"https://jkanime.net/jkplayer/um?e=Y1BBRUwxT1o5MUxyRmVaNmpCd05MN09sTElxTnNEODJpL0R2bmNqSDdwQzViVXo1QnRzTzVVcEtOL1BiemFodDo6tzws9qbEq.I3i_nKwWTeQQ--&t=b628386c9b92481fab68fbf284bd6a64&op=MjcxNA==" }
            ];
        }
    }

    res.json({
        capitulo: num,
        servidores: misServidores
    });
});

// Puerto dinámico para Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor con capítulos reales corriendo en el puerto ${PORT}`);
});
   
       
