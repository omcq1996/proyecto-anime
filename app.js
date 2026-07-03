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

// Variable global para guardar el anime destacado del Banner
let animeDestacadoGlobal = null;

// 1. CARGAR ANIMES EN LA PANTALLA PRINCIPAL e INYECTAR EL HERO BANNER
async function cargarAnimes(url) {
    try {
        contenedor.innerHTML = '<p style="color: var(--texto-gris);">Cargando recomendaciones...</p>';
        const respuesta = await fetch(url);
        const datos = await respuesta.json();
        contenedor.innerHTML = '';

        if (!datos.data || datos.data.length === 0) {
            contenedor.innerHTML = '<p style="color: var(--texto-gris);">No se encontraron resultados.</p>';
            return;
        }

        // --- TRUCO CRUNCHYROLL: Hacer el Hero Banner Dinámico ---
        // Tomamos el primer anime de la lista para colocarlo como portada destacada arriba
        const animeDestacado = datos.data[0];
        animeDestacadoGlobal = animeDestacado; // Guardamos referencia
        
        document.getElementById('hero-titulo').innerText = animeDestacado.title;
        document.getElementById('hero-sinopsis').innerText = animeDestacado.synopsis ? animeDestacado.synopsis : "Sin sinopsis disponible.";
        
        const urlFondo = animeDestacado.images.jpg.large_image_url || animeDestacado.images.jpg.image_url;
        document.getElementById('hero-banner').style.backgroundImage = `url('${urlFondo}')`;

        // Pintamos el resto del catálogo (los siguientes 12) abajo
        datos.data.slice(1, 13).forEach(anime => {
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
        console.error("Error cargando catálogo:", error);
        contenedor.innerHTML = '<p style="color: var(--texto-gris);">Error al conectar con los servidores.</p>';
    }
}

// Escuchar el clic del gran botón naranja de "Comenzar a ver" del Banner principal
document.getElementById('btn-hero-play').addEventListener('click', () => {
    if (animeDestacadoGlobal) {
        abrirReproductor(animeDestacadoGlobal);
    }
});

// 2. OBTENER EPISODIOS E INYECTAR EL REPRODUCTOR DINÁMICO
async function obtenerEpisodiosDesdeMiServidor(animeId) {
    listaEpisodiosContenedor.innerHTML = '<p style="grid-column: 1/-1; color: var(--texto-gris);">Buscando episodios en el servidor...</p>';
    
    try {
        const respuesta = await fetch(`${MI_SERVIDOR_LOCAL}/anime/${animeId}/capitulos`);
        const datos = await respuesta.json();
        listaEpisodiosContenedor.innerHTML = '';

        for (let i = 1; i <= datos.total; i++) {
            const btnEp = document.createElement('button');
            btnEp.classList.add('btn-capitulo');
            btnEp.innerText = `Ep. ${i}`;
            
            btnEp.addEventListener('click', async () => {
                document.querySelectorAll('.btn-capitulo').forEach(b => b.classList.remove('visto'));
                btnEp.classList.add('visto');
                
                document.getElementById('pantalla-presentacion').style.display = 'none';
                document.getElementById('zona-video-real').style.display = 'block';
                document.getElementById('zona-video-real').innerHTML = '<p style="color: white; padding: 20px; text-align: center;">Abriendo flujo de streaming...</p>';

                const resVideo = await fetch(`${MI_SERVIDOR_LOCAL}/anime/${animeId}/capitulo/${i}`);
                const datosVideo = await resVideo.json();
                
                const contenedorVideoReal = document.getElementById('zona-video-real');
                
                if (datosVideo.videoUrl.endsWith('.mp4') || datosVideo.videoUrl.includes('googleapis') || datosVideo.videoUrl.startsWith('/')) {
                    contenedorVideoReal.innerHTML = `
                        <video id="video-player" controls autoplay style="width: 100%; height: 100%; background: #000;">
                            <source src="${datosVideo.videoUrl}" type="video/mp4">
                        </video>
                    `;
                } else {
                    contenedorVideoReal.innerHTML = `
                        <iframe id="video-iframe" src="${datosVideo.videoUrl}" frameborder="0" allowfullscreen style="width: 100%; height: 100%; background: #000;"></iframe>
                    `;
                }
            });
            
            listaEpisodiosContenedor.appendChild(btnEp);
        }
    } catch (error) {
        console.error("Error:", error);
        listaEpisodiosContenedor.innerHTML = '<p style="grid-column: 1/-1; color: var(--texto-gris);">No hay episodios listados para este contenido.</p>';
    }
}

// 3. CONTROLADORES DEL MODAL
function abrirReproductor(anime) {
    tituloModal.innerText = anime.title;
    sinopsisModal.innerText = anime.synopsis ? anime.synopsis : "Sin sinopsis disponible.";
    
    document.getElementById('pantalla-presentacion').style.display = 'block';
    document.getElementById('zona-video-real').style.display = 'none';
    document.getElementById('zona-video-real').innerHTML = '';

    const pantallaPreview = document.getElementById('pantalla-presentacion');
    pantallaPreview.style.backgroundImage = `url('${anime.images.jpg.large_image_url || anime.images.jpg.image_url}')`;
    
    obtenerEpisodiosDesdeMiServidor(anime.mal_id);
    modal.style.display = 'flex';
}

btnCerrar.addEventListener('click', () => {
    modal.style.display = 'none';
    document.getElementById('zona-video-real').innerHTML = ''; 
    listaEpisodiosContenedor.innerHTML = ""; 
});

// 4. EVENTOS FILTROS
botonesCategoria.forEach(boton => {
    boton.addEventListener('click', (e) => {
        botonesCategoria.forEach(btn => btn.classList.remove('activo'));
        e.target.classList.add('activo');
        const tipoFiltro = e.target.getAttribute('data-tipo');
        cargarAnimes(urlsAPI[tipoFiltro]);
    });
});

// 5. BUSCADOR
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

cargarAnimes(urlsAPI.top);
