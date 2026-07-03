const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios'); // Asegúrate de tenerlo para consultar a Jikan

const app = express();
app.use(cors());

// 1. Servir archivos estáticos (HTML, CSS, JS y el video de pruebas)
app.use(express.static(path.join(__dirname, './')));

// Ruta principal para que Render cargue tu archivo index.html directamente
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ==========================================
//        API RUTAS PARA TU PLATAFORMA
// ==========================================

// 1. Obtener el número REAL de capítulos consultando a Jikan (API Oficial)
app.get('/api/anime/:id/capitulos', async (req, res) => {
    const animeId = req.params.id;
    try {
        // Le preguntamos a Jikan directamente los metadatos de este anime
        const respuestaJikan = await axios.get(`https://api.jikan.moe/v4/anime/${animeId}`);
        
        // Si no tiene episodios definidos (en emisión), ponemos 12 por defecto para simular la grilla
        const totalCapitulos = respuestaJikan.data.data.episodes || 12; 
        
        res.json({ total: totalCapitulos, animeId: animeId });
    } catch (error) {
        console.error("Error al consultar episodios en Jikan:", error.message);
        res.json({ total: 12, animeId: animeId }); // Respaldo por si la API se satura
    }
});

// 2. Sistema Multiseridor Estilo AnimeFLV por Capítulo
app.get('/api/anime/:id/capitulo/:num', async (req, res) => {
    const { id, num } = req.params;
    
    // Aquí es donde configuras la lista de servidores que se transformarán en pestañas.
    // Puedes meter iframes externos (como Filemoon) o tu archivo de video local directo.
    res.json({
        capitulo: num,
        servidores: [
            { nombre: "MEGA", url: "https://mega.nz/embed/xxxxxx" },
            { nombre: "Filemoon", url: "https://filemoon.sx/e/5k9z2xj1b8" },
            { nombre: "Streamtape", url: "https://streamtape.com/e/6wYzkX12" },
            { nombre: "Espejo Local", url: "/video-prueba.mp4" } // Tu video local de pruebas en la raíz del repositorio
        ]
    });
});

// ==========================================
//        ENCENDIDO DEL PUERTO DINÁMICO
// ==========================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo de forma exitosa en el puerto ${PORT}`);
});
