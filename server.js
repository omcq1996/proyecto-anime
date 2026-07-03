const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json()); // <-- CRUCIAL: Permite al servidor entender los datos JSON que le mande el robot

app.use(express.static(path.join(__dirname, './')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Nuestra Base de Datos en memoria
const baseDatosEpisodios = {
    "20": {
        "1": [
            { nombre: "Magi (JKPlayer)", url: "https://jkanime.net/jkplayer/um?e=Y1BBRUwxT1o5MUxyRmVaNmpCd05MN09sTElxTnNEODJpL0R2bmNqSDdwQzViVXo1QnRzTzVVcEtOL1BiemFodDo6tzws9qbEq.I3i_nKwWTeQQ--&t=b628386c9b92481fab68fbf284bd6a64&op=MjcxNA==" }
        ]
    }
};

// 1. OBTENER CAPÍTULOS DESDE JIKAN
app.get('/api/anime/:id/capitulos', async (req, res) => {
    const animeId = req.params.id;
    try {
        const respuestaJikan = await axios.get(`https://api.jikan.moe/v4/anime/${respuestaJikan}`);
        const totalCapitulos = respuestaJikan.data.data.episodes || 12; 
        res.json({ total: totalCapitulos, animeId: animeId });
    } catch (error) {
        res.json({ total: 12, animeId: animeId });
    }
});

// 2. ENTRAR A BUSCAR LOS SERVIDORES DESDE EL FRONTEND
app.get('/api/anime/:id/capitulo/:num', (req, res) => {
    const animeId = req.params.id;
    const { num } = req.params;

    if (baseDatosEpisodios[animeId] && baseDatosEpisodios[animeId][num]) {
        return res.json({
            capitulo: num,
            servidores: baseDatosEpisodios[animeId][num]
        });
    }

    res.json({
        capitulo: num,
        servidores: [
            { nombre: "Servidor Automático", url: "https://filemoon.sx/e/5k9z2xj1b8" },
            { nombre: "Espejo Local", url: "/video-prueba.mp4" }
        ]
    });
});

// ======================================================================
// 🚪 NUEVA RUTA: La puerta de entrada para tu Robot Cazador
// ======================================================================
app.post('/api/subir-links', (req, res) => {
    const { animeId, capitulo, servidores } = req.body;

    if (!animeId || !capitulo || !servidores) {
        return res.status(400).json({ error: "Datos incompletos enviados por el robot." });
    }

    // Si el anime no existe en nuestra BD, lo inicializamos vacío
    if (!baseDatosEpisodios[animeId]) {
        baseDatosEpisodios[animeId] = {};
    }

    // Guardamos automáticamente los servidores frescos que cazó el robot
    baseDatosEpisodios[animeId][capitulo] = servidores;

    console.log(`🤖 [Robot] Enlaces guardados con éxito para el Anime ID: ${animeId}, Cap: ${capitulo}`);
    res.json({ mensaje: "Enlaces guardados exitosamente en producción." });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor central de streaming corriendo en el puerto ${PORT}`);
});
       
