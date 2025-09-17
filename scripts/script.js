// Reemplaza con tu propia API key y el ID de la hoja de cálculo
const API_KEY = '';
const SPREADSHEET_ID = '';

// Rango para la clasificación
const RANGE_CLASIFICACION = 'CLASIFICACION!B2:J8';
// Rango para los partidos de las jornadas
const RANGE_JORNADAS = 'JORNADAS!A2:F37';
const RANGE_GOLEADORES = 'GOLEADORES!A2:C54'


fetch('scripts/equipos.json')
    .then(response => response.json())
    .then(teams => {
        const container = document.getElementById('teams-container');

        // Recorrer el array de equipos y generar el HTML dinámico
        teams.forEach(team => {
            const teamSection = document.createElement('div');
            teamSection.classList.add('team-section');
            teamSection.innerHTML = `
                <h2>${team.nombre}</h2>
                <div class="team-info">
                    <div class="team-details">
                        <img src="${team.escudo}" alt="Escudo del equipo" class="team-image">
                        <img src="${team.plantilla}" alt="Plantilla del equipo" class="team-image">
                    </div>
                </div>
            `;
            container.appendChild(teamSection);
        });
    })
    .catch(error => {
        console.error("Error al cargar el JSON:", error);
    });

// Función para obtener los datos de Google Sheets
async function obtenerDatosDeGoogleSheets() {
    // Obtener clasificación
    const urlClasificacion = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE_CLASIFICACION}?key=${API_KEY}`;
    fetch(urlClasificacion)
        .then(response => response.json())
        .then(data => {
            console.log('Datos de la clasificación:', data);  // DEBUG
            const valoresClasificacion = data.values;
            cargarDatosEnTablaClasificacion(valoresClasificacion);
        })
        .catch(error => {
            console.error('Error al obtener la clasificación:', error);  // DEBUG
        });

    // Obtener jornadas
    const urlJornadas = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE_JORNADAS}?key=${API_KEY}`;
    fetch(urlJornadas)
        .then(response => response.json())
        .then(data => {
            console.log('Datos de las jornadas:', data);  // DEBUG
            const valoresJornadas = data.values;
            cargarProximosPartidos(valoresJornadas);
        })
        .catch(error => {
            console.error('Error al obtener los goleador:', error);  // DEBUG
        });

            // Obtener jornadas
    const urlGoleadores = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE_GOLEADORES}?key=${API_KEY}`;
    fetch(urlGoleadores)
        .then(response => response.json())
        .then(data => {
            console.log('Datos de los goleadores:', data);  // DEBUG
            const valoresGoleadores = data.values;
            cargarDatosEnTablaGoleadores(valoresGoleadores);
        })
        .catch(error => {
            console.error('Error al obtener los goleador:', error);  // DEBUG
        });

        try {
            const logosEquipos = await fetchLogos();
            const jornadas = await fetchPartidos();
            renderJornadas(jornadas, logosEquipos);
        } catch (error) {
            console.error("Error al inicializar la aplicación:", error);
        }

}

// Función para cargar la clasificación en la tabla
function cargarDatosEnTablaClasificacion(valores) {
    const tablaClasificacion = document.getElementById('tablaClasificacion').getElementsByTagName('tbody')[0];

    // Limpiar cualquier dato previo
    tablaClasificacion.innerHTML = '';
    let i = 0;
    // Cargar los nuevos valores
    valores.forEach((fila, index) => {
        const nuevaFila = tablaClasificacion.insertRow();

        const celdaEquipo = nuevaFila.insertCell(0);
        const celdaPuntos = nuevaFila.insertCell(1);
        const celdaPJ = nuevaFila.insertCell(2);
        const celdaPG = nuevaFila.insertCell(3);
        const celdaPE = nuevaFila.insertCell(4);
        const celdaPP = nuevaFila.insertCell(5);
        const celdaGF = nuevaFila.insertCell(6);
        const celdaGC = nuevaFila.insertCell(7);
        const celdaDG = nuevaFila.insertCell(8);

        celdaEquipo.textContent = fila[0];  // Nombre del equipo
        celdaPuntos.textContent = fila[1];  // Puntos
        celdaPJ.textContent = fila[2];      // Partidos Jugados
        celdaPG.textContent = fila[3];      // Partidos Ganados
        celdaPE.textContent = fila[4];      // Partidos Empatados
        celdaPP.textContent = fila[5];      // Partidos Perdidos
        celdaGF.textContent = fila[6];      // Goles a Favor
        celdaGC.textContent = fila[7];      // Goles en Contra
        celdaDG.textContent = fila[8];      // Diferencia de Goles
        i++;
    });
}
// Función para cargar los próximos partidos en la tabla
function cargarProximosPartidos(valores) {
    const tablaProximosPartidos = document.getElementById('tablaProximosPartidos').getElementsByTagName('tbody')[0];

    // Limpiar cualquier dato previo
    tablaProximosPartidos.innerHTML = '';

    // Filtrar los partidos que no tienen resultado (C y E vacíos o '-')
    const proximosPartidos = valores.filter(fila => {
        const resultadoLocal = fila[2] === '' || fila[2] === '-';
        const resultadoVisitante = fila[4] === '' || fila[4] === '-';
        return resultadoLocal && resultadoVisitante;
    });

    console.log('Próximos partidos filtrados:', proximosPartidos);  // DEBUG

    // Verificar si se han encontrado partidos
    if (proximosPartidos.length === 0) {
        console.log('No hay partidos sin resultados para mostrar.');  // DEBUG
        return;  // Salir de la función si no hay partidos
    }

    // Cargar los próximos partidos
    proximosPartidos.forEach(fila => {
        const nuevaFila = tablaProximosPartidos.insertRow();

        const celdaJornada = nuevaFila.insertCell(0);
        const celdaLocal = nuevaFila.insertCell(1);
        const celdaVisitante = nuevaFila.insertCell(2);
        const celdaArbitro = nuevaFila.insertCell(3);

        celdaJornada.textContent = fila[0] || '';   // Jornada
        celdaLocal.textContent = fila[1] || '';     // Equipo Local
        celdaVisitante.textContent = fila[3] || ''; // Equipo Visitante
        celdaArbitro.textContent = fila[5] || ''; // Aquí podrías manejar la columna de descanso si lo necesitas

    });
}

// Función para cargar la clasificación en la tabla
function cargarDatosEnTablaGoleadores(valores) {
    const tablaGoleadores = document.getElementById('goleadores').getElementsByTagName('tbody')[0];

    // Limpiar cualquier dato previo
    tablaGoleadores.innerHTML = '';

    // Definir el mínimo de goles para filtrar
    const golesMinimos = 1; // Puedes ajustar este número según tus necesidades

    // Filtrar los goleadores que tienen más de 'golesMinimos' goles
    const goleadores = valores.filter(fila => fila[2] > golesMinimos); // Asegúrate de que fila[2] es el número de goles

    console.log('Datos filtrados:', goleadores);  // DEBUG

    // Insertar los datos filtrados en la tabla
    goleadores.forEach((fila) => {
        const nuevaFila = tablaGoleadores.insertRow();
        
        const celdaNombre = nuevaFila.insertCell(0);
        const celdaEquipo = nuevaFila.insertCell(1);
        const celdaGoles = nuevaFila.insertCell(2);

        // Asumiendo que fila es un array donde:
        // fila[0] es el nombre del equipo
        // fila[1] es el nombre del jugador
        // fila[2] es el número de goles
        // fila[3] es el número de partidos jugados

        celdaNombre.textContent = fila[1]; // Nombre del jugador
        celdaEquipo.textContent = fila[0];  // Nombre del equipo
        celdaGoles.textContent = fila[2];   // Número de goles
    });
}






// Esperar a que el contenido de la página esté completamente cargado
window.addEventListener('load', () => {
    // Añadir la clase "loaded" al body para ocultar el preloader
    document.body.classList.add('loaded');
});



// Función para obtener datos de las jornadas
async function fetchPartidos() {
    const urlJornadas = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE_JORNADAS}?key=${API_KEY}`;
    try {
        const response = await fetch(urlJornadas);
        const data = await response.json();

        const rows = data.values; // Las filas de la hoja de cálculo
        const jornadas = {};

        // Organiza los datos en jornadas
        rows.forEach(row => {
            const [jornada, equipoLocal, resultadoLocal, equipoVisitante, resultadoVisitante, descanso, fecha, hora, arbitraje] = row;

            // Crea un objeto para cada jornada
            if (!jornadas[jornada]) {
                jornadas[jornada] = { jornada: jornada, partidos: [] };
            }

            jornadas[jornada].partidos.push({
                equipoLocal,
                golesLocal: resultadoLocal || '-',
                equipoVisitante,
                golesVisitante: resultadoVisitante || '-',
                fecha,
                hora,
                arbitraje
            });
        });

        // Devuelve las jornadas como un array
        return Object.values(jornadas);
    } catch (error) {
        console.error("Error al obtener las jornadas:", error);
        return [];
    }
}

async function fetchLogos() {
    try {
        const response = await fetch('./scripts/equipos.json'); // Cambia a la ruta real
        if (!response.ok) {
            throw new Error(`Error ${response.status}: No se pudo cargar el archivo de logos.`);
        }
        const data = await response.json();
        
        // Transformar el array en un objeto donde el nombre del equipo es la clave
        const logos = {};
        data.forEach(equipo => {
            logos[equipo.nombre] = equipo.escudo; // Mapear nombre al escudo
        });
        
        return logos;
    } catch (error) {
        console.error('Error al cargar los logos:', error);
        return {}; // Retorna un objeto vacío si hay un error
    }
}

// Renderiza las jornadas en el HTML
function renderJornadas(jornadas, logosEquipos) {
    const container = document.getElementById('jornadas-container');
    container.innerHTML = ''; // Limpia el contenedor

    if (!jornadas || jornadas.length === 0) {
        console.error("No hay jornadas para renderizar");
        return;
    }

    jornadas.forEach(jornada => {
        const jornadaDiv = document.createElement('div');
        jornadaDiv.classList.add('jornada');

        const title = document.createElement('div');
        title.classList.add('jornada-title');
        title.textContent = `Jornada ${jornada.jornada}`;
        jornadaDiv.appendChild(title);

        jornada.partidos.forEach(partido => {
            const partidoDiv = document.createElement('div');
            partidoDiv.classList.add('partido');

            const equipoLocal = document.createElement('div');
            equipoLocal.classList.add('equipo');
            equipoLocal.innerHTML = `<img src="${logosEquipos[partido.equipoLocal]}" alt="${partido.equipoLocal}"> ${partido.equipoLocal}`;

            const resultado = document.createElement('div');
            resultado.classList.add('resultado');
            resultado.textContent = `${partido.golesLocal} - ${partido.golesVisitante}`;

            const equipoVisitante = document.createElement('div');
            equipoVisitante.classList.add('equipo');
            equipoVisitante.innerHTML = `${partido.equipoVisitante} <img src="${logosEquipos[partido.equipoVisitante]}" alt="${partido.equipoVisitante}">`;

      
            
            partidoDiv.appendChild(equipoLocal);
            partidoDiv.appendChild(resultado);
            partidoDiv.appendChild(equipoVisitante);

            jornadaDiv.appendChild(partidoDiv);
        });

        container.appendChild(jornadaDiv);
    });
}





// JavaScript para el menú hamburguesa
document.getElementById("menu-toggle").addEventListener("click", function () {
    this.classList.toggle("active");
    document.getElementById("nav-links").classList.toggle("active");
});

// Llamar a la función para obtener los datos cuando se cargue la página
document.addEventListener('DOMContentLoaded', obtenerDatosDeGoogleSheets);
// script.js
const toggleMenu = document.getElementById('menu-toggle');
const navLinks = document.getElementById('nav-links');

toggleMenu.addEventListener('click', () => {
    navLinks.style.display = navLinks.style.display === 'block' ? 'none' : 'block';
});

