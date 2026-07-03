const JIKAN_URL = 'https://api.jikan.moe/v4';
const MI_SERVIDOR_LOCAL = 'https://proyecto-anime-zqu2.onrender.com/api'; // Tu URL de Render

const urlsAPI = {
    top: `${JIKAN_URL}/top/anime`,
    airing: `${JIKAN_URL}/top/anime?filter=airing`,
    upcoming: `${JIKAN_URL}/top/anime?filter=upcoming`,
    movie: `${JIKAN_URL}/top/anime?filter=bypopularity&type=movie`,
    buscar: `${JIKAN_URL}/anime?q=`
};

const contenedor = document.getElementById('contenedor-anime');
const inputBuscar = document.getElementById('input-buscar');
const btnBuscar = document.getElementById('btn-buscar');
const modal = document.getElementById('reproductor-modal');
const btnCerrar = document.getElementById('btn-cerrar');
const tituloModal = document.getElementById('titulo-anime-modal');
const sinopsisModal = document.getElementById('sinopsis-anime-modal');
const botonesCategoria = document.querySelectorAll('.btn-categoria');
const listaEpisodiosContenedor = document.getElementById('lista-episodios');

// 1. CARGAR ANIMES EN LA PANTALLA PRINCIPAL
async function cargarAnimes(url) {
    try {
        contenedor.innerHTML = '<p>Cargando contenido...</p>';
        const respuesta = await fetch(url);
        const datos = await respuesta.json();
        contenedor.innerHTML = '';

        if (!datos.data || datos.data.length === 0) {
            contenedor.innerHTML = '<p>No se encontraron resultados.</p>';
            return;
        }

        datos.data.slice(0, 16).forEach(anime => {
            const tarjeta = document.createElement('div');
            tarjeta.classList.add('tarjeta-anime');
            tarjeta.innerHTML = `
                <img src="${anime.images.jpg.image_url}" alt="${anime.title}" loading="lazy">
                <h3>${anime.title}</h3>
            `;
            tarjeta.addEventListener('click', () => abrirReproductor(anime));
            contenedor.appendChild(tarjeta);
        });
    } catch (error) {
        console.error("Error cargando el catálogo:", error);
        contenedor.innerHTML = '<p>Hubo un problema al conectar con el servidor.</p>';
    }
}

// 2. CONECTAR CON TU SERVIDOR LOCAL Y SELECCIONAR EL REPRODUCTOR CORRECTO
async function obtenerEpisodiosDesdeMiServidor(animeId) {
    listaEpisodiosContenedor.innerHTML = '<p style="grid-column: 1/-1;">Conectando con servidores espejo...</p>';
    
    try {
        const respuesta = await fetch(`${MI_SERVIDOR_LOCAL}/anime/${animeId}/capitulos`);
        const datos = await respuesta.json();
        
        listaEpisodiosContenedor.innerHTML = '';

        // Creamos un botón por cada capítulo dinámico entregado por el servidor
        for (let i = 1; i <= datos.total; i++) {
            const btnEp = document.createElement('button');
            btnEp.classList.add('btn-capitulo');
            btnEp.innerText = `Cap. ${i}`;
            
            btnEp.addEventListener('click', async () => {
                document.querySelectorAll('.btn-capitulo').forEach(b => b.classList.remove('visto'));
                btnEp.classList.add('visto');
                
                // Pedimos el enlace del capítulo al servidor de Render
                const resVideo = await fetch(`${MI_SERVIDOR_LOCAL}/anime/${animeId}/capitulo/${i}`);
                const datosVideo = await resVideo.json();
                
                // Seleccionamos la zona del HTML donde se pinta el video
                const contenedorVideo = document.getElementById('contenedor-reproductor');
                
                // VALIDACIÓN CLAVE: Detectar si el enlace es un archivo de video crudo (.mp4)
                if (datosVideo.videoUrl.endsWith('.mp4') || datosVideo.videoUrl.includes('googleapis')) {
                    // Reemplazamos por un reproductor nativo que sí soporta archivos en bruto
                    contenedorVideo.innerHTML = `
                        <video id="video-player" controls autoplay style="width: 100%; height: 400px; background: #000; border-radius: 5px;">
                            <source src="${datosVideo.videoUrl}" type="video/mp4">
                            Tu navegador no soporta el reproductor nativo.
                        </video>
                    `;
                } else {
                    // Si el servidor te da una página embebida como Filemoon o Streamtape, se usa el iframe tradicional
                    contenedorVideo.innerHTML = `
                        <iframe id="video-iframe" src="${datosVideo.videoUrl}" frameborder="0" allowfullscreen style="width: 100%; height: 400px; background: #000; border-radius: 5px;"></iframe>
                    `;
                }
            });
            
            listaEpisodiosContenedor.appendChild(btnEp);
        }
    } catch (error) {
        console.error("Error llamando a la lista de capítulos:", error);
        listaEpisodiosContenedor.innerHTML = '<p style="grid-column: 1/-1;">Error al cargar la lista de episodios.</p>';
    }
}

// 3. CONTROLADORES DE APERTURA DEL MODAL
function abrirReproductor(anime) {
    tituloModal.innerText = anime.title;
    sinopsisModal.innerText = anime.synopsis ? anime.synopsis : "Sin sinopsis disponible.";
    
    // Por defecto, iniciamos el contenedor con un iframe apuntando al trailer (si existe)
    const contenedorVideo = document.getElementById('contenedor-reproductor');
    if (anime.trailer && anime.trailer.embed_url) {
        contenedorVideo.innerHTML = `
            <iframe id="video-iframe" src="${anime.trailer.embed_url}" frameborder="0" allowfullscreen style="width: 100%; height: 400px; background: #000; border-radius: 5px;"></iframe>
        `;
    } else {
        contenedorVideo.innerHTML = `
            <iframe id="video-iframe" src="" frameborder="0" allowfullscreen style="width: 100%; height: 400px; background: #000; border-radius: 5px;"></iframe>
        `;
    }
    
    // Llamamos a las rutas dinámicas de tu backend
    obtenerEpisodiosDesdeMiServidor(anime.mal_id);
    modal.style.display = 'flex';
}

// 4. CONTROLADOR DE CIERRE DEL MODAL (Limpia la reproducción activa)
btnCerrar.addEventListener('click', () => {
    modal.style.display = 'none';
    const contenedorVideo = document.getElementById('contenedor-reproductor');
    // Forzamos el reseteo a un iframe vacío para detener cualquier audio que quede sonando de fondo
    contenedorVideo.innerHTML = '<iframe id="video-iframe" src="" frameborder="0" allowfullscreen style="width: 100%; height: 400px; background: #000; border-radius: 5px;"></iframe>';
    listaEpisodiosContenedor.innerHTML = ""; 
});

// 5. EVENTOS DE LAS CATEGORÍAS
botonesCategoria.forEach(boton => {
    boton.addEventListener('click', (e) => {
        botonesCategoria.forEach(btn => btn.classList.remove('activo'));
        e.target.classList.add('activo');
        const tipoFiltro = e.target.getAttribute('data-tipo');
        cargarAnimes(urlsAPI[tipoFiltro]);
    });
});

// 6. EVENTOS DEL BUSCADOR
btnBuscar.addEventListener('click', () => {
    const busqueda = inputBuscar.value.trim();
    if (busqueda !== "") {
        botonesCategoria.forEach(btn => btn.classList.remove('activo'));
        cargarAnimes(`${urlsAPI.buscar}${busqueda}`);
    }
});

inputBuscar.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') btnBuscar.click();
});

// Inicialización de la aplicación
cargarAnimes(urlsAPI.top);
