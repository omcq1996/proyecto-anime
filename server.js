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

// ======================================================================
// 🗄️ "BASE DE DATOS" SIMULADA DE TU PLATAFORMA
// Aquí es donde tu futuro robot guardará los enlaces encriptados automáticamente.
// Cada anime se guarda por su ID global de MyAnimeList.
// ======================================================================
const baseDatosEpisodios = {
    // NARUTO (ID: 20)
    "20": {
        "1": [
            { nombre: "Magi (JKPlayer)", url: "https://jkanime.net/jkplayer/um?e=Y1BBRUwxT1o5MUxyRmVaNmpCd05MN09sTElxTnNEODJpL0R2bmNqSDdwQzViVXo1QnRzTzVVcEtOL1BiemFodDo6tzws9qbEq.I3i_nKwWTeQQ--&t=b628386c9b92481fab68fbf284bd6a64&op=MjcxNA==" },
            { nombre: "Espejo Local", url: "/video-prueba.mp4" }
        ],
        "2": [
            { nombre: "Streamwish Real", url: "https://awish.pro/e/f97bshgq6m97" }
        ]
    },
    // RE:ZERO 4th Season (ID: 61642 o el ID de la temporada que cliquees)
    "61642": {
        "1": [
            { nombre: "Streamwish", url: "https://awish.pro/e/f97bshgq6m97" },
            { nombre: "Filemoon", url: "https://filemoon.sx/e/5k9z2xj1b8" }
        ]
    }
};

// 1. Obtener número de capítulos desde Jikan (Se queda igual, es automático)
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

// 2. RUTA MAESTRA DINÁMICA: Ya no usa "IFS" manuales por anime
app.get('/api/anime/:id/capitulo/:num', async (req, res) => {
    const animeId = req.params.id;
    const { num } = req.params;

    console.log(`🔍 Buscando en la base de datos: Anime ${animeId} -> Capítulo ${num}`);

    // Verificamos si tenemos los servidores de ese anime y ese capítulo guardados
    if (baseDatosEpisodios[animeId] && baseDatosEpisodios[animeId][num]) {
        // Si existen, los enviamos de inmediato a la plantilla
        return res.json({
            capitulo: num,
            servidores: baseDatosEpisodios[animeId][num]
        });
    }

    // SI NO EXISTE: En lugar de dar error, tu servidor actúa de forma inteligente
    // y le manda servidores espejo genéricos de prueba para que la web nunca se rompa.
    res.json({
        capitulo: num,
        servidores: [
            { nombre: "Servidor Automático", url: "https://filemoon.sx/e/5k9z2xj1b8" },
            { nombre: "Espejo Local", url: "/video-prueba.mp4" }
        ]
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Base de datos dinámica corriendo en el puerto ${PORT}`);
});
   
       
