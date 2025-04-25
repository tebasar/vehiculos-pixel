// Fichero: script.js (v5)
// IIFE para encapsular y usar 'strict mode'
(function() {
    'use strict';

    // --- Estado Global ---
    let vehiculos = [];
    let fichaAbiertaIndex = null; // Índice numérico o null

    // --- Referencias DOM Estáticas ---
    const contenedorFichas = document.getElementById('contenedor-fichas');
    const formularioAgregarVehiculo = document.getElementById('formularioAgregarVehiculo');
    const btnToggleFormulario = document.getElementById('btnToggleFormulario');

    if (!contenedorFichas || !formularioAgregarVehiculo || !btnToggleFormulario) {
        console.error("Error CRÍTICO: No se encontraron uno o más elementos esenciales (contenedor-fichas, formularioAgregarVehiculo, btnToggleFormulario). Verifica los IDs en index.html.");
        alert("Error: La página no se cargó correctamente. Faltan elementos HTML esenciales.");
        return;
    }

    // Inputs
    const inputTipo = document.getElementById('tipo');
    const inputMarca = document.getElementById('marca');
    const inputModelo = document.getElementById('modelo');
    const inputAnio = document.getElementById('anio');
    const inputMotor = document.getElementById('motor');
    const inputHp = document.getElementById('hp');
    const inputCubiertas = document.getElementById('cubiertas');
    const inputPresion = document.getElementById('presion');
    const inputAceite = document.getElementById('aceite');
    const inputCantidadAceite = document.getElementById('cantidadAceite');
    const inputFrenos = document.getElementById('frenos');
    const inputVin = document.getElementById('vin');
    const inputPatente = document.getElementById('patente');
    const inputFechaAdquisicion = document.getElementById('fechaAdquisicion');


    // --- Persistencia ---
    function guardarVehiculos() { try { localStorage.setItem('vehiculos', JSON.stringify(vehiculos)); } catch (e) { console.error("LS Save Error:", e); alert("Error al guardar."); } }
    function cargarVehiculos() { try { const d = localStorage.getItem('vehiculos'); vehiculos = d ? JSON.parse(d) : []; vehiculos.forEach(v => { v.servicios = Array.isArray(v.servicios) ? v.servicios : []; }); } catch (e) { console.error("LS Load Error:", e); vehiculos = []; alert("Error al cargar."); } }

    // --- CRUD ---
    function agregarVehiculo(event) {
        event.preventDefault();
        const nuevoVehiculo = { id: Date.now().toString(), tipo: inputTipo.value, marca: inputMarca.value.trim(), modelo: inputModelo.value.trim(), anio: inputAnio.value, motor: inputMotor.value.trim(), hp: inputHp.value.trim(), cubiertas: inputCubiertas.value.trim(), presion: inputPresion.value.trim(), aceite: inputAceite.value.trim(), cantidadAceite: inputCantidadAceite.value, frenos: inputFrenos.value.trim(), vin: inputVin.value.trim(), patente: inputPatente.value.trim(), fechaAdquisicion: inputFechaAdquisicion.value, servicios: [] };
        if (!nuevoVehiculo.marca || !nuevoVehiculo.modelo || !nuevoVehiculo.tipo) { alert('Faltan campos obligatorios.'); inputTipo.focus(); return; }
        vehiculos.push(nuevoVehiculo);
        guardarVehiculos();
        formularioAgregarVehiculo.reset();
        toggleFormularioPrincipal(false);
        fichaAbiertaIndex = vehiculos.length - 1;
        console.log(`Vehículo agregado. Intentando abrir índice: ${fichaAbiertaIndex}`);
        renderizarVehiculos();
    }

    function eliminarVehiculo(index) {
        if (index < 0 || index >= vehiculos.length) return;
        const v = vehiculos[index];
        if (confirm(`¿Eliminar ${v.marca} ${v.modelo}?`)) {
            vehiculos.splice(index, 1);
            guardarVehiculos();
            if (fichaAbiertaIndex === index) fichaAbiertaIndex = null;
            else if (fichaAbiertaIndex > index) fichaAbiertaIndex--;
            renderizarVehiculos();
        }
    }
    // Funciones de servicio
     function agregarServicio(vIdx, form) {
         if (vIdx < 0 || vIdx >= vehiculos.length) { console.error(`Índice de vehículo inválido para agregar servicio: ${vIdx}`); return; }
         const data = { fecha: form.querySelector(`#fecha-serv-${vIdx}`)?.value, tipo: form.querySelector(`#tipo-serv-${vIdx}`)?.value.trim(), desc: form.querySelector(`#desc-serv-${vIdx}`)?.value.trim(), costo: form.querySelector(`#costo-serv-${vIdx}`)?.value, mecanico: form.querySelector(`#mecanico-serv-${vIdx}`)?.value.trim(), repuestos: form.querySelector(`#repuestos-serv-${vIdx}`)?.value.trim(), garantia: form.querySelector(`#garantia-serv-${vIdx}`)?.value, factura: form.querySelector(`#factura-serv-${vIdx}`)?.value.trim() };
         // Validar datos esenciales leídos del form
         if (!data.fecha || !data.tipo || !data.desc || data.costo === '' || data.costo === null || data.costo === undefined) {
             alert('Faltan campos de servicio obligatorios (Fecha, Tipo, Descripción, Costo).');
             return;
         }
         const serv = { id: Date.now().toString(), ...data, costo: parseFloat(data.costo) || 0 };
         console.log(`Agregando servicio al vehículo ${vIdx}:`, serv); // Log antes de agregar
         try {
            vehiculos[vIdx].servicios.push(serv);
            vehiculos[vIdx].servicios.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
            guardarVehiculos();
            renderizarVehiculos(); // Re-renderizar DESPUÉS de agregar y guardar
         } catch(error) {
             console.error(`Error al agregar/guardar servicio para vehículo ${vIdx}:`, error);
             alert("Ocurrió un error al intentar agregar el servicio.");
             // Opcional: intentar recargar datos para evitar estado inconsistente
             // cargarVehiculos();
             // renderizarVehiculos();
         }
     }
     function editarServicio(vIdx, sIdx, campo, valor, inputEl) { if (vIdx < 0 || vIdx >= vehiculos.length || sIdx < 0 || sIdx >= vehiculos[vIdx].servicios.length) return; const srv = vehiculos[vIdx].servicios[sIdx]; if (typeof srv[campo] !== 'undefined') { srv[campo] = (campo === 'costo') ? (parseFloat(valor) || 0) : valor; guardarVehiculos(); inputEl.classList.add('edited'); setTimeout(() => { inputEl.classList.remove('edited'); inputEl.classList.add('edited-fadeout'); inputEl.addEventListener('transitionend', () => { inputEl.classList.remove('edited-fadeout'); }, { once: true }); }, 100); } else { console.error(`Campo inválido '${campo}'`); } }
     function eliminarServicio(vIdx, sIdx) { if (vIdx < 0 || vIdx >= vehiculos.length || sIdx < 0 || sIdx >= vehiculos[vIdx].servicios.length) return; const srv = vehiculos[vIdx].servicios[sIdx]; if (confirm(`¿Eliminar servicio "${srv.tipo}" (${srv.fecha})?`)) { vehiculos[vIdx].servicios.splice(sIdx, 1); guardarVehiculos(); renderizarVehiculos(); } }

    // --- UI ---
    function toggleFormularioPrincipal(setVisible) {
        if (!formularioAgregarVehiculo || !btnToggleFormulario) return;
        const show = typeof setVisible === 'boolean' ? setVisible : formularioAgregarVehiculo.style.display === 'none';
        formularioAgregarVehiculo.style.display = show ? 'flex' : 'none';
        btnToggleFormulario.textContent = show ? '－ Ocultar Formulario' : '＋ Agregar Vehículo';
        if (show) { (inputTipo || formularioAgregarVehiculo.querySelector('input, select'))?.focus(); }
    }

    function toggleDetalleFicha(index) {
        if (typeof index !== 'number' || isNaN(index) || index < 0 || index >= vehiculos.length) { console.error("Llamada inválida a toggleDetalleFicha con índice:", index); return; }
        const estabaAbierta = (fichaAbiertaIndex === index);
        // console.log(`toggleDetalleFicha(${index}). Estaba abierta: ${estabaAbierta}. Índice abierto actual: ${fichaAbiertaIndex}`);
        fichaAbiertaIndex = estabaAbierta ? null : index;
        // console.log(`Estado actualizado. Nuevo índice abierto: ${fichaAbiertaIndex}`);
        renderizarVehiculos();
    }

    function renderizarVehiculos() {
        if (!contenedorFichas) { console.error("El contenedor de fichas no existe al renderizar."); return; }
        // console.log(`Renderizando vehículos. Ficha abierta índice: ${fichaAbiertaIndex}`);
        contenedorFichas.innerHTML = '';
        if (vehiculos.length === 0) { contenedorFichas.innerHTML = '<p class="no-vehiculos-mensaje">No hay vehículos.</p>'; return; }

        const fragment = document.createDocumentFragment();
        vehiculos.forEach((vehiculo, index) => {
            try { // Añadir try-catch por si un vehículo tiene datos corruptos
                const ficha = document.createElement('div');
                ficha.className = 'ficha';
                ficha.dataset.index = index;
                const estaAbierta = (fichaAbiertaIndex === index);

                // Cabecera
                const cabecera = document.createElement('div');
                cabecera.className = 'ficha-cabecera';
                cabecera.setAttribute('role', 'button');
                cabecera.setAttribute('aria-expanded', estaAbierta.toString());
                cabecera.setAttribute('aria-controls', `detalle-${index}`);
                cabecera.dataset.action = 'toggle-details';
                cabecera.dataset.index = index.toString();
                const icono = vehiculo.tipo === 'Moto' ? '🏍️' : vehiculo.tipo === 'Auto' ? '🚗' : vehiculo.tipo === 'Bicicleta' ? '🚲' : '📁';
                // Usar textContent para el nombre y modelo para evitar problemas si contienen HTML accidentalmente
                const nombreVehiculo = document.createElement('span');
                nombreVehiculo.textContent = `${icono} ${vehiculo.marca || ''} ${vehiculo.modelo || ''} (${vehiculo.anio || 'N/A'})`;
                const botonesDiv = document.createElement('div');
                botonesDiv.innerHTML = `<button class="btn btn-delete btn-small" data-action="delete-vehicle" data-index="${index}" title="Eliminar ${vehiculo.marca || ''} ${vehiculo.modelo || ''}">Eliminar</button><button class="btn btn-small" data-action="toggle-details-btn" data-index="${index}" title="${estaAbierta ? 'Ocultar' : 'Mostrar'} detalles">${estaAbierta ? '➖' : '➕'}</button>`;
                cabecera.appendChild(nombreVehiculo);
                cabecera.appendChild(botonesDiv);
                ficha.appendChild(cabecera);

                // Detalle (si aplica)
                if (estaAbierta) {
                    // console.log(`---> RENDERIZANDO DETALLE para ficha ${index}`);
                    const detalle = document.createElement('div');
                    detalle.className = 'ficha-detalle';
                    detalle.id = `detalle-${index}`;
                    const mostrar = (dato) => dato || '<span style="color: #888;">N/D</span>';
                    detalle.innerHTML = `<div><b>Motor:</b> ${mostrar(vehiculo.motor)} | <b>HP:</b> ${mostrar(vehiculo.hp)}</div><div><b>Aceite:</b> ${mostrar(vehiculo.aceite)} (${mostrar(vehiculo.cantidadAceite)} L)</div><div><b>Cubiertas:</b> ${mostrar(vehiculo.cubiertas)} | <b>Presión:</b> ${mostrar(vehiculo.presion)}</div><div><b>Frenos:</b> ${mostrar(vehiculo.frenos)}</div><div><b>VIN:</b> ${mostrar(vehiculo.vin)} | <b>Patente:</b> ${mostrar(vehiculo.patente)}</div><div><b>Adquirido:</b> ${mostrar(vehiculo.fechaAdquisicion)}</div><hr><h4>Servicios:</h4><div id="servicios-lista-${index}">${vehiculo.servicios.length === 0 ? '<p><i>Sin servicios.</i></p>' : renderizarListaServicios(index)}</div><hr>${renderizarFormularioServicio(index)}`;
                    ficha.appendChild(detalle);
                }
                fragment.appendChild(ficha);
            } catch (error) {
                console.error(`Error al renderizar la ficha del vehículo índice ${index}:`, error, vehiculo);
                // Opcional: renderizar un mensaje de error para esta ficha específica
                 const errorFicha = document.createElement('div');
                 errorFicha.className = 'ficha';
                 errorFicha.style.borderColor = 'red';
                 errorFicha.innerHTML = `<div class="ficha-cabecera" style="background: var(--accent-delete);"><span>Error al renderizar vehículo ${index}</span></div><div class="ficha-detalle" style="display:block; color:red;"><pre>${error.message}</pre></div>`;
                 fragment.appendChild(errorFicha);
            }
        });
        contenedorFichas.appendChild(fragment);
        // console.log("Renderizado completado.");
    }
    // Funciones renderizado de servicios (sin cambios lógicos)
     function renderizarListaServicios(vIdx) { try { return vehiculos[vIdx].servicios.map((s, sIdx) => `<div class="servicio-item" data-v-index="${vIdx}" data-s-index="${sIdx}"><span>🛠️<input type='date' value='${s.fecha||''}' data-field='fecha' title="Fecha"><input value='${s.tipo||''}' data-field='tipo' placeholder="Tipo *" title="Tipo" required></span><input value='${s.desc||''}' data-field='desc' placeholder="Descripción *" title="Descripción" required>$<input type='number' value='${s.costo||''}' data-field='costo' placeholder="Costo *" title="Costo ($)" style="max-width:100px;" required step="0.01"><button class='btn btn-delete btn-small' data-action="delete-service" title="Eliminar servicio">×</button><small><input value='${s.mecanico||''}' data-field='mecanico' placeholder='Mecánico'><input value='${s.repuestos||''}' data-field='repuestos' placeholder='Repuestos'><input value='${s.garantia||''}' data-field='garantia' placeholder='Garantía'><input value='${s.factura||''}' data-field='factura' placeholder='Factura Ref.'></small></div>`).join(''); } catch(e){ console.error(`Error renderizando lista servicios para vIdx ${vIdx}:`, e); return '<p style="color:red">Error al mostrar servicios.</p>'; } }
     function renderizarFormularioServicio(vIdx) { try { return `<form class="formulario-servicio" id="form-servicio-${vIdx}" data-v-index="${vIdx}"><h4>＋ Nuevo Servicio</h4><div class="input-group"><label for="fecha-serv-${vIdx}">Fecha *</label><input type='date' id='fecha-serv-${vIdx}' required></div><div class="input-group"><label for="tipo-serv-${vIdx}">Tipo *</label><input placeholder='Ej: Cambio Aceite' id='tipo-serv-${vIdx}' required></div><div class="input-group" style="flex-basis:100%;"><label for="desc-serv-${vIdx}">Descripción *</label><input placeholder='Detalles' id='desc-serv-${vIdx}' required></div><div class="input-group"><label for="costo-serv-${vIdx}">Costo ($) *</label><input placeholder='Ej: 150.50' type='number' step="0.01" id='costo-serv-${vIdx}' required></div><div class="input-group"><label for="mecanico-serv-${vIdx}">Mecánico</label><input placeholder='Nombre taller' id='mecanico-serv-${vIdx}'></div><div class="input-group" style="flex-basis:100%;"><label for="repuestos-serv-${vIdx}">Repuestos</label><input placeholder='Piezas cambiadas' id='repuestos-serv-${vIdx}'></div><div class="input-group"><label for="garantia-serv-${vIdx}">Garantía</label><select id='garantia-serv-${vIdx}' title="Garantía"><option value='' selected>N/A</option><option value='Sin garantía'>Sin garantía</option><option value='3m'>3 meses</option><option value='6m'>6 meses</option><option value='12m'>12 meses</option><option value='Otro'>Otro</option></select></div><div class="input-group"><label for="factura-serv-${vIdx}">Factura Ref.</label><input placeholder='Número o ref.' id='factura-serv-${vIdx}'></div><button type='submit' class='btn btn-add' style="width:100%;margin-top:10px;">Agregar Servicio</button></form>`; } catch(e){ console.error(`Error renderizando form servicio para vIdx ${vIdx}:`, e); return '<p style="color:red">Error al mostrar formulario de servicio.</p>'; } }

    // --- Manejador Central de Eventos ---
    function manejarClickContenedor(event) {
        try {
            const actionTarget = event.target.closest('[data-action]');
            if (!actionTarget) return;
            const action = actionTarget.dataset.action;
            const indexStr = actionTarget.dataset.index;

            if (action === 'toggle-details' || action === 'toggle-details-btn') {
                const index = parseInt(indexStr, 10);
                // console.log(`Click detectado para TOGGLE. Acción: ${action}, Índice string: "${indexStr}", Índice parseado: ${index}`);
                if (!isNaN(index) && index >= 0 && index < vehiculos.length) { toggleDetalleFicha(index); }
                else { console.warn("Índice inválido para toggle:", indexStr, index); }
            }
            else if (action === 'delete-vehicle') {
                const index = parseInt(indexStr, 10);
                // console.log(`Click detectado para DELETE VEHICLE. Índice: ${index}`);
                if (!isNaN(index)) { eliminarVehiculo(index); }
                else { console.warn("Índice inválido para delete-vehicle:", indexStr); }
            }
            else if (action === 'delete-service') {
                const itemServicio = actionTarget.closest('.servicio-item');
                if (itemServicio) {
                    const vIndex = parseInt(itemServicio.dataset.vIndex, 10);
                    const sIndex = parseInt(itemServicio.dataset.sIndex, 10);
                    // console.log(`Click detectado para DELETE SERVICE. VIndex: ${vIndex}, SIndex: ${sIndex}`);
                    if (!isNaN(vIndex) && !isNaN(sIndex)) { eliminarServicio(vIndex, sIndex); }
                    else { console.warn("Índices inválidos para delete-service"); }
                }
            }
        } catch (error) { console.error("Error en manejarClickContenedor:", error); }
    }

     function manejarSubmitServicio(event) {
        // Solo actuar en submits del form de servicio
        if (event.target.classList.contains('formulario-servicio')) {
            event.preventDefault();
            console.log("Submit detectado en formulario de servicio."); // Log para confirmar que se detecta el submit correcto
            const form = event.target;
            const vIndex = parseInt(form.dataset.vIndex, 10);
            if (!isNaN(vIndex)) {
                console.log(`Llamando a agregarServicio para vehículo índice ${vIndex}`); // Log antes de llamar
                agregarServicio(vIndex, form); // Llamada correcta
            } else {
                console.error("Índice de vehículo (vIndex) no encontrado o inválido en el formulario de servicio.");
            }
        } else {
            console.log("Submit detectado, pero NO en un .formulario-servicio. Ignorando."); // Log si el submit es de otro form
        }
    }

     function manejarCambioInputServicio(event) {
        const input = event.target;
        const itemServicio = input.closest('.servicio-item');
        if (itemServicio && input.dataset.field) {
            const vIndex = parseInt(itemServicio.dataset.vIndex, 10);
            const sIndex = parseInt(itemServicio.dataset.sIndex, 10);
            const campo = input.dataset.field;
            const valor = input.type === 'checkbox' ? input.checked : input.value;
            if (!isNaN(vIndex) && !isNaN(sIndex) && campo) {
                 editarServicio(vIndex, sIndex, campo, valor, input);
            }
        }
    }

    // --- Inicialización ---
    function init() {
        console.log("Inicializando aplicación v5...");
        cargarVehiculos();
        // Listeners asegurados por la verificación inicial
        btnToggleFormulario.addEventListener('click', () => toggleFormularioPrincipal());
        formularioAgregarVehiculo.addEventListener('submit', agregarVehiculo);
        contenedorFichas.addEventListener('click', manejarClickContenedor);
        contenedorFichas.addEventListener('submit', manejarSubmitServicio); // Listener de Submit
        contenedorFichas.addEventListener('change', manejarCambioInputServicio);
        renderizarVehiculos();
        console.log("Aplicación v5 inicializada.");
    }

    // --- Ejecución ---
    if (contenedorFichas && formularioAgregarVehiculo && btnToggleFormulario) { // Re-verificar por si acaso
        if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); }
        else { init(); }
    } else {
        console.error("Inicialización abortada por falta de elementos HTML esenciales (verificación final).");
    }

})(); // Fin IIFE