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
        });
    } catch (error) {
        console.error("Error cargando catálogo:", error);
        contenedor.innerHTML = '<p style="color: var(--texto-gris);">Error al conectar con los servidores.</p>';
    }
}

document.getElementById('btn-hero-play').addEventListener('click', () => {
    if (animeDestacadoGlobal) abrirReproductor(animeDestacadoGlobal);
});

// 2. OBTENER EPISODIOS Y CARGAR EL SISTEMA MULTISERVIDOR DE ANIMEFLV
async function obtenerEpisodiosDesdeMiServidor(animeId) {
    listaEpisodiosContenedor.innerHTML = '<p style="grid-column: 1/-1; color: var(--texto-gris);">Buscando episodios en el servidor...</p>';
    document.getElementById('contenedor-servidores').innerHTML = ''; 
    
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
    } catch (error) {
        console.error("Error cargando episodios:", error);
        listaEpisodiosContenedor.innerHTML = '<p style="grid-column: 1/-1; color: var(--texto-gris);">Episodios no listados en el servidor.</p>';
    }
}

// 3. CONTROLADORES MODAL
function abrirReproductor(anime) {
    tituloModal.innerText = anime.title;
    sinopsisModal.innerText = anime.synopsis ? anime.synopsis : "Sin sinopsis disponible.";
    
    document.getElementById('pantalla-presentacion').style.display = 'block';
    document.getElementById('zona-video-real').style.display = 'none';
    document.getElementById('zona-video-real').innerHTML = '';
    document.getElementById('contenedor-servidores').innerHTML = '';

    const pantallaPreview = document.getElementById('pantalla-presentacion');
    const urlImagen = anime.images.jpg.large_image_url || anime.images.jpg.image_url;
    pantallaPreview.style.backgroundImage = `url('${urlImagen}')`;
    
    obtenerEpisodiosDesdeMiServidor(anime.mal_id);
    modal.style.display = 'flex';
}

btnCerrar.addEventListener('click', () => {
    modal.style.display = 'none';
    document.getElementById('zona-video-real').innerHTML = ''; 
    document.getElementById('contenedor-servidores').innerHTML = ''; 
    listaEpisodiosContenedor.innerHTML = ""; 
});

// 4. CATEGORIAS Y BUSCADOR
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
