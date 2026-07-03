const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const puppeteer = require('puppeteer'); // <-- El motor de nuestro robot

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
        console.error("Error al consultar episodios:", error.message);
        res.json({ total: 12, animeId: animeId });
    }
});

// 2. RUTA CON WEB SCRAPING EN TIEMPO REAL
app.get('/api/anime/:id/capitulo/:num', async (req, res) => {
    const { id, num } = req.params;
    
    console.log(`🤖 Robot activado: Buscando servidores para el capítulo ${num}...`);

    let navegador = null;
    try {
        // Lanzamos el navegador invisible optimizado para entornos en la nube como Render
        navegador = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const pagina = await navegador.newPage();

        // 🚨 CONFIGURACIÓN CRUCIAL: Bloquear imágenes y CSS para que el raspado sea 10 veces más rápido
        await pagina.setRequestInterception(true);
        pagina.on('request', (req) => {
            if (['image', 'stylesheet', 'font', 'media'].includes(req.resourceType())) {
                req.abort();
            } else {
                req.continue();
            }
        });

        // 🔗 PASO A: Construir la URL del capítulo.
        // Simularemos buscar el ID en una estructura estándar de anime en internet.
        // NOTA: Para producción real, aquí deberías mapear el nombre del anime en formato slug (ej: "one-piece-capitulo-1")
        const urlDestino = `https://jkanime.net/naruto/${num}/`; 

        // El robot entra a la página de forma invisible
        await pagina.goto(urlDestino, { waitUntil: 'domcontentloaded', timeout: 10000 });

        // 🕵️‍♂️ PASO B: El robot inspecciona el código buscando los reproductores
        // Usamos una función nativa de Puppeteer para extraer las URLs de los iframes presentes
        const enlacesEncontrados = await pagina.evaluate(() => {
            const iframes = Array.from(document.querySelectorAll('iframe'));
            return iframes.map(iframe => iframe.src).filter(src => src && src.includes('http'));
        });

        // Cerramos el navegador para liberar la memoria del servidor de inmediato
        await navegador.close();

        // 📋 PASO C: Formatear las respuestas para tu barra de pestañas en el frontend
        // Filtramos y le ponemos el nombre correspondiente según la URL que detectó el robot
        const servidoresReales = enlacesEncontrados.map(url => {
            let nombre = "Servidor Externo";
            if (url.includes('streamwish')) nombre = "Streamwish";
            else if (url.includes('filemoon')) nombre = "Filemoon";
            else if (url.includes('voe')) nombre = "VOE";
            else if (url.includes('streamtape')) nombre = "Streamtape";
            else if (url.includes('mixdrop')) nombre = "Mixdrop";
            else if (url.includes('dood')) nombre = "Doodstream";
            else if (url.includes('mp4upload')) nombre = "Mp4Upload";
            
            return { nombre: nombre, url: url };
        });

        // Si el robot no encontró nada porque la página cambió de diseño, mandamos tu video local de respaldo
        if (servidoresReales.length === 0) {
            servidoresReales.push({ nombre: "Espejo Local", url: "/video-prueba.mp4" });
        }

        // Enviamos la lista real y fresca a tu app.js
        res.json({
            capitulo: num,
            servidores: servidoresReales
        });

    } catch (error) {
        console.error("❌ Error en el Scraping:", error.message);
        if (navegador) await navegador.close();
        
        // Respuesta de emergencia si el robot falla por timeout
        res.json({
            capitulo: num,
            servidores: [{ nombre: "Espejo Local (Respaldo)", url: "/video-prueba.mp4" }]
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor con Web Scraping corriendo en el puerto ${PORT}`);
});
