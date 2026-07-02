const JIKAN_URL = 'https://api.jikan.moe/v4';
const MI_SERVIDOR_LOCAL = 'http://localhost:3000/api'; // Tu nuevo backend

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
const videoIframe = document.getElementById('video-iframe');
const botonesCategoria = document.querySelectorAll('.btn-categoria');
const listaEpisodiosContenedor = document.getElementById('lista-episodios');

// 1. CARGAR ANIMES EN LA PANTALLA PRINCIPAL
async function cargarAnimes(url) {
    try {
        contenedor.innerHTML = '<p>Cargando contenido...</p>';
        const respuesta = await fetch(url);
        const datos = await respuesta.json();
        contenedor.innerHTML = '';

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
        console.error("Error:", error);
        contenedor.innerHTML = '<p>Hubo un problema al conectar con el servidor.</p>';
    }
}

// 2. CONECTAR CON TU SERVIDOR LOCAL PARA TRAER LOS CAPÍTULOS
async function obtenerEpisodiosDesdeMiServidor(animeId) {
    listaEpisodiosContenedor.innerHTML = '<p style="grid-column: 1/-1;">Conectando con servidores espejo...</p>';
    
    try {
        // Llamamos a tu propio servidor local
        const respuesta = await fetch(`${MI_SERVIDOR_LOCAL}/anime/${animeId}/capitulos`);
        const datos = await respuesta.json();
        
        listaEpisodiosContenedor.innerHTML = '';

        // Creamos los botones basados en la respuesta de tu servidor
        for (let i = 1; i <= datos.total; i++) {
            const btnEp = document.createElement('button');
            btnEp.classList.add('btn-capitulo');
            btnEp.innerText = `Cap. ${i}`;
            
            btnEp.addEventListener('click', async () => {
                document.querySelectorAll('.btn-capitulo').forEach(b => b.classList.remove('visto'));
                btnEp.classList.add('visto');
                
                // Pedimos el enlace de video real a tu servidor
                const resVideo = await fetch(`${MI_SERVIDOR_LOCAL}/anime/${animeId}/capitulo/${i}`);
                const datosVideo = await resVideo.json();
                
                // Cargamos el servidor espejo (Filemoon/Streamtape) directamente en el iframe
                videoIframe.src = datosVideo.videoUrl;
            });
            
            listaEpisodiosContenedor.appendChild(btnEp);
        }
    } catch (error) {
        console.error("Error en servidor local:", error);
        listaEpisodiosContenedor.innerHTML = '<p style="grid-column: 1/-1;">Error: Enciende tu terminal con "node server.js".</p>';
    }
}

// 3. CONTROLADORES DEL MODAL
function abrirReproductor(anime) {
    tituloModal.innerText = anime.title;
    sinopsisModal.innerText = anime.synopsis ? anime.synopsis : "Sin sinopsis disponible.";
    videoIframe.src = ""; // Limpio al iniciar
    
    // Llamamos a tu backend usando el ID seguro del anime
    obtenerEpisodiosDesdeMiServidor(anime.mal_id);
    modal.style.display = 'flex';
}

btnCerrar.addEventListener('click', () => {
    modal.style.display = 'none';
    videoIframe.src = ""; 
    listaEpisodiosContenedor.innerHTML = ""; 
});

// 4. EVENTOS DE NAVEGACIÓN Y BUSCADOR
botonesCategoria.forEach(boton => {
    boton.addEventListener('click', (e) => {
        botonesCategoria.forEach(btn => btn.classList.remove('activo'));
        e.target.classList.add('activo');
        const tipoFiltro = e.target.getAttribute('data-tipo');
        cargarAnimes(urlsAPI[tipoFiltro]);
    });
});

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