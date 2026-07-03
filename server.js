const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json()); // Permite al servidor entender los datos que le mande tu robot cazador

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, './')));

// Ruta principal para cargar el index.html en Render
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ======================================================================
// 🗄️ BASE DE DATOS DE EPISODIOS (En Memoria)
// Aquí se guardan los enlaces fijos y los que el robot inyecte dinámicamente
// ======================================================================
const baseDatosEpisodios = {
    // NARUTO (ID de MyAnimeList: 20)
    "20": {
        "1": [
            { nombre: "Magi (JKPlayer)", url: "https://jkanime.net/jkplayer/um?e=Y1BBRUwxT1o5MUxyRmVaNmpCd05MN09sTElxTnNEODJpL0R2bmNqSDdwQzViVXo1QnRzTzVVcEtOL1BiemFodDo6tzws9qbEq.I3i_nKwWTeQQ--&t=b628386c9b92481fab68fbf284bd6a64&op=MjcxNA==" }
        ]
    }
};

// ======================================================================
// 1. OBTENER NÚMERO REAL DE CAPÍTULOS (Corrección de los 12 episodios)
// ======================================================================
app.get('/api/anime/:id/capitulos', async (req, res) => {
    const animeId = req.params.id;
    try {
        const respuestaJikan = await axios.get(`https://api.jikan.moe/v4/anime/${animeId}`);
        let totalCapitulos = respuestaJikan.data.data.episodes; 

        // Si el anime está en emisión (episodes es null o 0), investigamos cuántos van al aire hoy
        if (!totalCapitulos || totalCapitulos === 0) {
            console.log(`📡 Anime ${animeId} en emisión o sin total definido. Buscando episodios publicados...`);
            const respuestaEpisodios = await axios.get(`https://api.jikan.moe/v4/anime/${animeId}/episodes`);
            
            if (respuestaEpisodios.data && respuestaEpisodios.data.data) {
                totalCapitulos = respuestaEpisodios.data.data.length;
            }
        }

        // Respaldo final si todo lo demás marca cero, para que al menos salga el episodio 1
        if (!totalCapitulos || totalCapitulos === 0) {
            totalCapitulos = 1;
        }

        console.log(`📊 Anime ID ${animeId} procesado con: ${totalCapitulos} capítulos.`);
        res.json({ total: totalCapitulos, animeId: animeId });

    } catch (error) {
        console.error("❌ Error al consultar episodios en Jikan:", error.message);
        // Si la API se satura (Error 429), le damos un colchón de 24 episodios para no romper la web
        res.json({ total: 24, animeId: animeId });
    }
});

// ======================================================================
// 2. RUTA PARA ENVIAR LOS REPRODUCTORES AL FRONTEND
// ======================================================================
app.get('/api/anime/:id/capitulo/:num', async (req, res) => {
    const animeId = req.params.id;
    const { num } = req.params;
    
    // 1. Primero revisamos si el capítulo está guardado en la Base de Datos dinámica (Inyectado por el robot)
    if (baseDatosEpisodios[animeId] && baseDatosEpisodios[animeId][num]) {
        return res.json({
            capitulo: num,
            servidores: baseDatosEpisodios[animeId][num]
        });
    }

    // 2. Si no está en la BD, revisamos los casos fijos que escribiste a mano (Hardcoded)
    
    // Caso fijo: RE:ZERO (ID: 31240)
    if (animeId === "31240") { 
        if (num === "1") {
            return res.json({
                capitulo: num,
                servidores: [
                    { nombre: "Streamwish", url: "https://awish.pro/e/aquí_va_el_id_real_del_cap_1" },
                    { nombre: "Filemoon", url: "https://filemoon.sx/e/aquí_va_el_id_real_del_cap_1" }
                ]
            });
        }
        if (num === "2") {
            return res.json({
                capitulo: num,
                servidores: [
                    { nombre: "Streamwish", url: "https://awish.pro/e/aquí_va_el_id_real_del_cap_2" }
                ]
            });
        }
    }

    // 3. Si no hay nada registrado para este capítulo, enviamos los servidores espejo por defecto
    let servidoresPorDefecto = [
        { nombre: "Streamwish", url: "https://awish.pro/e/f97bshgq6m97" },
        { nombre: "Filemoon", url: "https://filemoon.sx/e/5k9z2xj1b8" },
        { nombre: "Espejo Local", url: "/video-prueba.mp4" }
    ];

    res.json({
        capitulo: num,
        servidores: servidoresPorDefecto
    });
});

// ======================================================================
// 🚪 3. PUERTA DE ENTRADA PARA EL ROBOT CAZADOR (POST)
// ======================================================================
app.post('/api/subir-links', (req, res) => {
    const { animeId, capitulo, servidores } = req.body;

    if (!animeId || !capitulo || !servidores) {
        return res.status(400).json({ error: "Datos incompletos enviados por el robot." });
    }

    if (!baseDatosEpisodios[animeId]) {
        baseDatosEpisodios[animeId] = {};
    }

    // Guardamos los links que el robot cazó en internet
    baseDatosEpisodios[animeId][capitulo] = servidores;

    console.log(`🤖 [Robot] Enlaces guardados con éxito para el Anime ID: ${animeId}, Cap: ${capitulo}`);
    res.json({ mensaje: "Enlaces guardados exitosamente en producción." });
});

// Puerto dinámico para Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor maestro corriendo en el puerto ${PORT}`);
});
       
