const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : `${window.location.protocol}//${window.location.host}`;

let animeActualId = null;

document.addEventListener('DOMContentLoaded', () => {
    cargarAnimesTop();
    
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

async function cargarAnimesTop() {
    try {
        const res = await fetch('https://api.jikan.moe/v4/top/anime');
        const datos = await res.json();
        renderizarTarjetas(datos.data);
    } catch (error) {
        console.error("Error cargando animes top:", error);
    }
}

async function buscarAnimes(query) {
    try {
        const res = await fetch(`https://api.jikan.moe/v4/anime?q=${query}`);
        const datos = await res.json();
        renderizarTarjetas(datos.data);
    } catch (error) {
        console.error("Error en la búsqueda:", error);
    }
}

function renderizarTarjetas(animes) {
    const contenedor = document.getElementById('contenedor-animes');
    if (!contenedor) return;
    
    contenedor.innerHTML = '';
    
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

async function abrirFichaAnime(anime) {
    animeActualId = anime.mal_id;
    
    const modal = document.getElementById('modal-reproductor');
    if (modal) modal.style.display = 'block';

    document.getElementById('titulo-anime').innerText = anime.title;
    document.getElementById('sinopsis-anime').innerText = anime.synopsis || 'Sin sinopsis disponible.';

    // Dejar el reproductor limpio inicialmente al abrir
    document.getElementById('contenedor-reproductor').innerHTML = '<p style="padding: 20px; text-align:center; color:#999;">Selecciona un episodio abajo</p>';

    try {
        const res = await fetch(`${API_URL}/api/anime/${animeActualId}/capitulos`);
        const datos = await res.json();
        renderizarBotonesEpisodios(datos.total);
    } catch (error) {
        console.error("Error consultando capítulos:", error);
        renderizarBotonesEpisodios(12);
    }
}

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

async function cargarServidoresCapitulo(numCapitulo) {
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

function renderizarPestañasServidores(servidores) {
    const contenedorBarra = document.getElementById('barra-servidores');
    if (!contenedorBarra) return;

    contenedorBarra.innerHTML = '';

    servidores.forEach((srv, index) => {
        const btnSrv = document.createElement('button');
        btnSrv.className = 'btn-servidor';
        btnSrv.innerText = srv.nombre;
        
        btnSrv.addEventListener('click', () => {
            const contenedorReproductor = document.getElementById('contenedor-reproductor');
            contenedorReproductor.innerHTML = `<iframe src="${srv.url}" frameborder="0" allowfullscreen></iframe>`;
            
            document.querySelectorAll('.btn-servidor').forEach(b => b.classList.remove('activo'));
            btnSrv.classList.add('activo');
        });

        contenedorBarra.appendChild(btnSrv);

        if (index === 0) {
            btnSrv.click();
        }
    });
}

function cerrarReproductor() {
    const modal = document.getElementById('modal-reproductor');
    if (modal) {
        modal.style.display = 'none';
        document.getElementById('contenedor-reproductor').innerHTML = '';
    }
}
