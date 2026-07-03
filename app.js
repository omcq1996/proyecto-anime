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
        contenedor.innerHTML = '<p style="color: var(--texto-secundario); padding: 20px;">Cargando catálogo...</p>';
        const respuesta = await fetch(url);
        const datos = await respuesta.json();
        contenedor.innerHTML = '';

        if (!datos.data || datos.data.length === 0) {
            contenedor.innerHTML = '<p style="color: var(--texto-secundario); padding: 20px;">No se encontraron resultados.</p>';
            return;
        }

        datos.data.slice(0, 16).forEach(anime => {
            const tarjeta = document.createElement('div');
            tarjeta.classList.add('tarjeta-anime');
            
            // Asignamos una etiqueta de simulación de episodio inicial (Estilo AnimeFLV)
            tarjeta.style.setProperty('--capitulo', '"Episodio 12"'); 

            tarjeta.innerHTML = `
                <img src="${anime.images.jpg.image_url}" alt="${anime.title}" loading="lazy">
                <h3>${anime.title}</h3>
            `;
            tarjeta.addEventListener('click', () => abrirReproductor(anime));
            contenedor.appendChild(tarjeta);
        });
    } catch (error) {
        console.error("Error cargando el catálogo:", error);
        contenedor.innerHTML = '<p style="color: var(--texto-secundario); padding: 20px;">Hubo un problema al conectar con el servidor.</p>';
    }
}

// 2. OBTENER EPISODIOS E INYECTAR EL REPRODUCTOR DINÁMICO
async function obtenerEpisodiosDesdeMiServidor(animeId) {
    listaEpisodiosContenedor.innerHTML = '<p style="grid-column: 1/-1; color: var(--texto-secundario);">Conectando con servidores espejo...</p>';
    
    try {
        const respuesta = await fetch(`${MI_SERVIDOR_LOCAL}/anime/${animeId}/capitulos`);
        const datos = await respuesta.json();
        
        listaEpisodiosContenedor.innerHTML = '';

        // Creamos los botones de capítulos según el total real devuelto por el backend
        for (let i = 1; i <= datos.total; i++) {
            const btnEp = document.createElement('button');
            btnEp.classList.add('btn-capitulo');
            btnEp.innerText = `Cap. ${i}`;
            
            btnEp.addEventListener('click', async () => {
                document.querySelectorAll('.btn-capitulo').forEach(b => b.classList.remove('visto'));
                btnEp.classList.add('visto');
                
                // OCULTAR BIENVENIDA Y MOSTRAR CONTENEDOR DE VIDEO
                document.getElementById('pantalla-presentacion').style.display = 'none';
                document.getElementById('zona-video-real').style.display = 'block';
                document.getElementById('zona-video-real').innerHTML = '<p style="color: white; padding: 20px; text-align: center;">Cargando flujo de video...</p>';

                // Pedimos el enlace del capítulo a tu backend en Render
                const resVideo = await fetch(`${MI_SERVIDOR_LOCAL}/anime/${animeId}/capitulo/${i}`);
                const datosVideo = await resVideo.json();
                
                const contenedorVideoReal = document.getElementById('zona-video-real');
                
                // DETECCIÓN INTELIGENTE: Si es un video local o de Google Storage (.mp4 directo)
                if (datosVideo.videoUrl.endsWith('.mp4') || datosVideo.videoUrl.includes('googleapis') || datosVideo.videoUrl.startsWith('/')) {
                    contenedorVideoReal.innerHTML = `
                        <video id="video-player" controls autoplay style="width: 100%; height: 100%; background: #000;">
                            <source src="${datosVideo.videoUrl}" type="video/mp4">
                            Tu navegador no soporta el reproductor nativo de video.
                        </video>
                    `;
                } else {
                    // Si en el futuro agregas servidores embebidos externos (Filemoon, Streamtape, etc.)
                    contenedorVideoReal.innerHTML = `
                        <iframe id="video-iframe" src="${datosVideo.videoUrl}" frameborder="0" allowfullscreen style="width: 100%; height: 100%; background: #000;"></iframe>
                    `;
                }
            });
            
            listaEpisodiosContenedor.appendChild(btnEp);
        }
    } catch (error) {
        console.error("Error llamando a la lista de capítulos:", error);
        listaEpisodiosContenedor.innerHTML = '<p style="grid-column: 1/-1; color: var(--texto-secundario);">Error al cargar la lista de episodios.</p>';
    }
}

// 3. ABRIR MODAL CONFIGURANDO LA PANTALLA DE PRESENTACIÓN DE ENTRADA
function abrirReproductor(anime) {
    tituloModal.innerText = anime.title;
    sinopsisModal.innerText = anime.synopsis ? anime.synopsis : "Sin sinopsis disponible.";
    
    // Resetear el estado de las pantallas internas del reproductor
    document.getElementById('pantalla-presentacion').style.display = 'block';
    document.getElementById('zona-video-real').style.display = 'none';
    document.getElementById('zona-video-real').innerHTML = '';

    // Colocar la imagen grande del anime como fondo estilizado de la presentación
    const pantallaPreview = document.getElementById('pantalla-presentacion');
    const urlImagen = anime.images.jpg.large_image_url || anime.images.jpg.image_url;
    pantallaPreview.style.backgroundImage = `url('${urlImagen}')`;
    
    // Cargar la lista de episodios conectando al backend
    obtenerEpisodiosDesdeMiServidor(anime.mal_id);
    modal.style.display = 'flex';
}

// 4. CERRAR MODAL Y LIMPIAR FLUJOS MULTIMEDIA ACTIVOS
btnCerrar.addEventListener('click', () => {
    modal.style.display = 'none';
    document.getElementById('zona-video-real').innerHTML = ''; // Destruye el reproductor para apagar audios de fondo
    listaEpisodiosContenedor.innerHTML = ""; 
});

// 5. EVENTOS DE FILTRADO POR CATEGORÍAS
botonesCategoria.forEach(boton => {
    boton.addEventListener('click', (e) => {
        botonesCategoria.forEach(btn => btn.classList.remove('activo'));
        e.target.classList.add('activo');
        const tipoFiltro = e.target.getAttribute('data-tipo');
        cargarAnimes(urlsAPI[tipoFiltro]);
    });
});

// 6. LOGICA DEL BUSCADOR
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

// Inicialización automática de la app con el catálogo Top
cargarAnimes(urlsAPI.top);
