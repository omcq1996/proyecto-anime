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

let animeDestacadoGlobal = null;

// 1. CARGAR CATALOGO E INYECTAR PORTADA DEL HERO BANNER
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
// Configuración base de la API de tu servidor en Render
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : `${window.location.protocol}//${window.location.host}`;

        // Configurar dinámicamente el Hero Banner con el primer resultado
        const animeDestacado = datos.data[0];
        animeDestacadoGlobal = animeDestacado;
        
        document.getElementById('hero-titulo').innerText = animeDestacado.title;
        document.getElementById('hero-sinopsis').innerText = animeDestacado.synopsis ? animeDestacado.synopsis : "Sin sinopsis disponible.";
        
        const urlFondo = animeDestacado.images.jpg.large_image_url || animeDestacado.images.jpg.image_url;
        document.getElementById('hero-banner').style.backgroundImage = `url('${urlFondo}')`;

        // Renderizar las tarjetas limpias abajo (sin el indicador flotante fijo de 12)
        datos.data.slice(1, 13).forEach(anime => {
            const tarjeta = document.createElement('div');
            tarjeta.classList.add('tarjeta-anime');
            tarjeta.innerHTML = `
                <img src="${anime.images.jpg.image_url}" alt="${anime.title}" loading="lazy">
                <h3>${anime.title}</h3>
            `;
            tarjeta.addEventListener('click', () => abrirReproductor(anime));
            contenedor.appendChild(tarjeta);
let animeActualId = null;

// Ejecutar al cargar la página: Buscar los animes top por defecto
document.addEventListener('DOMContentLoaded', () => {
    cargarAnimesTop();
    
    // Configurar el buscador si tienes un input con id="buscador"
    const inputBuscador = document.getElementById('buscador');
    if (inputBuscador) {
        inputBuscador.addEventListener('input', (e) => {
            const termino = e.target.value;
            if (termino.length > 2) {
                buscarAnimes(termino);
            } else if (termino.length === 0) {
                cargarAnimesTop();
            }
        });
    }
});

// Función para traer los animes más populares de Jikan
async function cargarAnimesTop() {
    try {
        const res = await fetch('https://api.jikan.moe/v4/top/anime');
        const datos = await res.json();
        renderizarTarjetas(datos.data);
    } catch (error) {
        console.error("Error cargando catálogo:", error);
        contenedor.innerHTML = '<p style="color: var(--texto-gris);">Error al conectar con los servidores.</p>';
        console.error("Error cargando animes top:", error);
    }
}

document.getElementById('btn-hero-play').addEventListener('click', () => {
    if (animeDestacadoGlobal) abrirReproductor(animeDestacadoGlobal);
});

// 2. OBTENER EPISODIOS Y CARGAR EL SISTEMA MULTISERVIDOR DE ANIMEFLV
async function obtenerEpisodiosDesdeMiServidor(animeId) {
    listaEpisodiosContenedor.innerHTML = '<p style="grid-column: 1/-1; color: var(--texto-gris);">Buscando episodios en el servidor...</p>';
    document.getElementById('contenedor-servidores').innerHTML = ''; 
    
// Función para buscar animes por texto
async function buscarAnimes(query) {
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
                
                // Consultar las opciones de servidores para este capítulo específico al backend
                const resVideo = await fetch(`${MI_SERVIDOR_LOCAL}/anime/${animeId}/capitulo/${i}`);
                const datosCapitulo = await resVideo.json();
                
                const barraServidores = document.getElementById('contenedor-servidores');
                barraServidores.innerHTML = ''; 
                
                // Generar pestañas de servidores dinámicamente
                datosCapitulo.servidores.forEach((servidor, index) => {
                    const btnServ = document.createElement('button');
                    btnServ.classList.add('btn-servidor');
                    btnServ.innerText = sizeof = servidor.nombre;
                    
                    btnServ.addEventListener('click', () => {
                        document.querySelectorAll('.btn-servidor').forEach(b => b.classList.remove('activo'));
                        btnServ.classList.add('activo');
                        
                        document.getElementById('pantalla-presentacion').style.display = 'none';
                        document.getElementById('zona-video-real').style.display = 'block';
                        
                        const contenedorVideoReal = document.getElementById('zona-video-real');
                        
                        // Carga inteligente según la URL entregada por el servidor
                        if (servidor.url.endsWith('.mp4') || servidor.url.startsWith('/') || servidor.url.includes('googleapis')) {
                            contenedorVideoReal.innerHTML = `
                                <video id="video-player" controls autoplay style="width: 100%; height: 100%; background: #000;">
                                    <source src="${servidor.url}" type="video/mp4">
                                </video>
                            `;
                        } else {
                            contenedorVideoReal.innerHTML = `
                                <iframe id="video-iframe" src="${servidor.url}" frameborder="0" allowfullscreen style="width: 100%; height: 100%; background: #000;"></iframe>
                            `;
                        }
                    });
                    
                    barraServidores.appendChild(btnServ);
                    
                    // Clic automático en la primera opción para agilizar la carga inicial
                    if (index === 0) btnServ.click();
                });
            });
            
            listaEpisodiosContenedor.appendChild(btnEp);
        }
        const res = await fetch(`https://api.jikan.moe/v4/anime?q=${query}`);
        const datos = await res.json();
        renderizarTarjetas(datos.data);
    } catch (error) {
        console.error("Error cargando episodios:", error);
        listaEpisodiosContenedor.innerHTML = '<p style="grid-column: 1/-1; color: var(--texto-gris);">Episodios no listados en el servidor.</p>';
        console.error("Error en la búsqueda:", error);
    }
}

// 3. CONTROLADORES MODAL
function abrirReproductor(anime) {
    tituloModal.innerText = anime.title;
    sinopsisModal.innerText = anime.synopsis ? anime.synopsis : "Sin sinopsis disponible.";
// Pintar las tarjetas de anime en la cuadrícula principal
function renderizarTarjetas(animes) {
    const contenedor = document.getElementById('contenedor-animes');
    if (!contenedor) return;

    document.getElementById('pantalla-presentacion').style.display = 'block';
    document.getElementById('zona-video-real').style.display = 'none';
    document.getElementById('zona-video-real').innerHTML = '';
    document.getElementById('contenedor-servidores').innerHTML = '';

    const pantallaPreview = document.getElementById('pantalla-presentacion');
    const urlImagen = anime.images.jpg.large_image_url || anime.images.jpg.image_url;
    pantallaPreview.style.backgroundImage = `url('${urlImagen}')`;
    contenedor.innerHTML = '';

    obtenerEpisodiosDesdeMiServidor(anime.mal_id);
    modal.style.display = 'flex';
    animes.forEach(anime => {
        const tarjeta = document.createElement('div');
        tarjeta.className = 'tarjeta-anime';
        tarjeta.innerHTML = `
            <img src="${anime.images.jpg.image_url}" alt="${anime.title}">
            <h3>${anime.title}</h3>
        `;
        tarjeta.addEventListener('click', () => abrirFichaAnime(anime));
        contenedor.appendChild(tarjeta);
    });
}

btnCerrar.addEventListener('click', () => {
    modal.style.display = 'none';
    document.getElementById('zona-video-real').innerHTML = ''; 
    document.getElementById('contenedor-servidores').innerHTML = ''; 
    listaEpisodiosContenedor.innerHTML = ""; 
});
// ======================================================================
// 🎬 FUNCIÓN CLAVE: ABRIR LA FICHA TÉCNICA CON TRAILER AUTOMÁTICO
// ======================================================================
async function abrirFichaAnime(anime) {
    animeActualId = anime.mal_id;
    
    // Mostrar la sección modal o contenedor de reproducción
    const modal = document.getElementById('modal-reproductor');
    if (modal) modal.style.display = 'block';

    // Rellenar información básica (Título, Sinopsis, etc.)
    document.getElementById('titulo-anime').innerText = anime.title;
    document.getElementById('sinopsis-anime').innerText = anime.synopsis || 'Sin sinopsis disponible.';

    // --- INYECTAR EL TRAILER EN LUGAR DE LA ETIQUETA PREMIUM ---
    const contenedorReproductor = document.getElementById('contenedor-reproductor');
    
    if (anime.trailer && anime.trailer.embed_url) {
        // Si Jikan nos da un trailer oficial de YouTube, lo incrustamos directo
        contenedorReproductor.innerHTML = `
            <iframe 
                src="${anime.trailer.embed_url}?autoplay=0&mute=0" 
                frameborder="0" 
                allowfullscreen>
            </iframe>`;
    } else {
        // Respaldo elegante si el anime no tiene trailer registrado
        contenedorReproductor.innerHTML = `
            <div class="trailer-reemplazo" style="background-image: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.8)), url('${anime.images.jpg.large_image_url}');">
                <p>🎬 Selecciona un episodio abajo para comenzar a ver</p>
            </div>`;
    }

    // Consultar a tu servidor de Render cuántos capítulos reales tiene el anime
    try {
        const res = await fetch(`${API_URL}/api/anime/${animeActualId}/capitulos`);
        const datos = await res.json();
        renderizarBotonesEpisodios(datos.total);
    } catch (error) {
        console.error("Error consultando capítulos en el servidor:", error);
        renderizarBotonesEpisodios(12); // Respaldo por si falla la red
    }
}

// Crear la cuadrícula de botones para los capítulos
function renderizarBotonesEpisodios(total) {
    const contenedorEpisodios = document.getElementById('contenedor-episodios');
    if (!contenedorEpisodios) return;

    contenedorEpisodios.innerHTML = '';

    for (let i = 1; i <= total; i++) {
        const boton = document.createElement('button');
        boton.className = 'btn-episodio';
        boton.innerText = `Ep. ${i}`;
        boton.addEventListener('click', () => cargarServidoresCapitulo(i));
        contenedorEpisodios.appendChild(boton);
    }
}

// Cargar las pestañas de servidores del capítulo seleccionado
async function cargarServidoresCapitulo(numCapitulo) {
    // Resaltar el botón del episodio activo
    const botones = document.querySelectorAll('.btn-episodio');
    botones.forEach(btn => btn.classList.remove('activo'));
    event.target.classList.add('activo');

    try {
        const res = await fetch(`${API_URL}/api/anime/${animeActualId}/capitulo/${numCapitulo}`);
        const datos = await res.json();
        
        renderizarPestañasServidores(datos.servidores);
    } catch (error) {
        console.error("Error al obtener servidores:", error);
    }
}

// Pintar los botones horizontales de los servidores (Streamwish, Filemoon, Magi, etc.)
function renderizarPestañasServidores(servidores) {
    const contenedorBarra = document.getElementById('barra-servidores');
    if (!contenedorBarra) return;

// 4. CATEGORIAS Y BUSCADOR
botonesCategoria.forEach(boton => {
    boton.addEventListener('click', (e) => {
        botonesCategoria.forEach(btn => btn.classList.remove('activo'));
        e.target.classList.add('activo');
        const tipoFiltro = e.target.getAttribute('data-tipo');
        cargarAnimes(urlsAPI[tipoFiltro]);
    contenedorBarra.innerHTML = '';

    servidores.forEach((srv, index) => {
        const btnSrv = document.createElement('button');
        btnSrv.className = 'btn-servidor';
        btnSrv.innerText = srv.nombre;
        
        // Al hacer clic en la pestaña, el iframe cambia el trailer por el capítulo real
        btnSrv.addEventListener('click', () => {
            const iframe = document.querySelector('#contenedor-reproductor iframe');
            const contenedorReproductor = document.getElementById('contenedor-reproductor');
            
            // Si antes no había iframe (estaba la imagen de reemplazo), lo creamos
            contenedorReproductor.innerHTML = `<iframe src="${srv.url}" frameborder="0" allowfullscreen></iframe>`;
            
            // Marcar pestaña activa
            document.querySelectorAll('.btn-servidor').forEach(b => b.classList.remove('activo'));
            btnSrv.classList.add('activo');
        });

        contenedorBarra.appendChild(btnSrv);

        // Cargar el primer servidor automáticamente por defecto
        if (index === 0) {
            btnSrv.click();
        }
    });
});
}

btnBuscar.addEventListener('click', () => {
    const busqueda = inputBuscar.value.trim();
    if (busqueda !== "") {
        botonesCategoria.forEach(btn => btn.classList.remove('activo'));
        cargarAnimes(`${urlsAPI.buscar}${busqueda}`);
// Función para cerrar la ficha técnica
function cerrarReproductor() {
    const modal = document.getElementById('modal-reproductor');
    if (modal) {
        modal.style.display = 'none';
        // Limpiamos el iframe para detener el video al cerrar
        document.getElementById('contenedor-reproductor').innerHTML = '';
    }
});
inputBuscar.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') btnBuscar.click();
});
}

cargarAnimes(urlsAPI.top);
