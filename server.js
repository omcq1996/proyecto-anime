const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors()); // Permite que tu HTML se comunique con este servidor

// Base de datos de simulación con enlaces de servidores espejo reales (reproductores directos sin bloqueo)
const servidoresEspejo = {
    // Ejemplo para Naruto (ID: 20)
    20: {
        1: "https://filemoon.sx/e/5k9z2xj1b8", // Enlace de reproductor real (Filemoon)
        2: "https://streamtape.com/e/6wYzkX12", 
        3: "https://vidoza.net/embed-x9z2.html"
    },
    // Servidor genérico de respaldo para cualquier otro anime
    "default": [
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4"
    ]
};

// Le dice al servidor dónde encontrar tus archivos visuales (HTML, CSS, JS del cliente)
app.use(express.static(__dirname));

// Cuando alguien entre a la URL principal, le entrega el index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// RUTA 1: Obtener la lista de capítulos disponibles
app.get('/api/anime/:id/capitulos', (req, res) => {
    const animeId = req.params.id;
    // Simulamos que el scraper encontró 12 capítulos para este anime
    const totalCapitulos = 12; 
    res.json({ total: totalCapitulos, animeId: animeId });
});

// RUTA 2: Obtener el enlace del servidor de video real (Filemoon/Streamtape)
app.get('/api/anime/:id/capitulo/:num', (req, res) => {
    const { id, num } = req.params;
    
    // Si es Naruto, le damos sus servidores espejo específicos
    if (servidoresEspejo[id] && servidoresEspejo[id][num]) {
        return res.json({ videoUrl: servidoresEspejo[id][num] });
    }
    
    // Si es otro anime, rotamos los servidores de video estables
    const listaDefault = servidoresEspejo["default"];
    const videoUrl = listaDefault[(num - 1) % listaDefault.length];
    res.json({ videoUrl: videoUrl });
});

// Iniciar el servidor en el puerto 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});
