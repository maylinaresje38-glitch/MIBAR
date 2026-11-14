/* ============================================================
   REGISTRO DE IA
   Pegá acá tu registro de uso de IA. El código empieza abajo.
   ============================================================ */


/* ------------------------------------------------------------
   1. DATOS EN MEMORIA
   ------------------------------------------------------------ */
const CLAVE_STORAGE = "bar-datos";

// { id, nombre, categoria, precio, disponible }
let productos = [];

// { id, numero, capacidad, estado }  estado: "libre" | "ocupada"
let mesas = [];

// { id, mesaId, items, estado, apertura, cierre, total, formaPago }
//   items:  [{ productoId, nombre, precio, cantidad }]
//   estado: "abierto" | "cerrado"
//   apertura / cierre: fecha ISO (cierre es null mientras esté abierto)
let pedidos = [];

// { id, nombre, telefono, email }
let contactos = [];

// { id, titulo, fecha, hora, contactoId }   fecha: "AAAA-MM-DD"   hora: "HH:MM"
let eventos = [];


/* ------------------------------------------------------------
   2. DATOS DE EJEMPLO
   ------------------------------------------------------------ */
function crearMesasIniciales() {
  const capacidades = [2, 2, 4, 4, 4, 4, 6, 8];
  return capacidades.map((capacidad, i) => ({
    id: i + 1,
    numero: i + 1,
    capacidad: capacidad,
    estado: "libre"
  }));
}

function crearProductosIniciales() {
  return [
    { id: 1, nombre: "Cerveza tirada",     categoria: "bebidas", precio: 3500, disponible: true },
    { id: 2, nombre: "Gaseosa",            categoria: "bebidas", precio: 2000, disponible: true },
    { id: 3, nombre: "Hamburguesa completa", categoria: "comidas", precio: 7500, disponible: true },
    { id: 4, nombre: "Papas fritas",       categoria: "comidas", precio: 4500, disponible: true },
    { id: 5, nombre: "Flan casero",        categoria: "postres", precio: 3000, disponible: true }
  ];
}


/* ------------------------------------------------------------
   3. GUARDAR Y CARGAR (localStorage)
   ------------------------------------------------------------ */
function guardarDatos() {
  try {
    const datos = { productos, mesas, pedidos, contactos, eventos };
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(datos));
    return true;
  } catch (error) {
    console.error("No se pudieron guardar los datos:", error);
    return false;
  }
}

function cargarDatos() {
  let datos = null;

  try {
    const texto = localStorage.getItem(CLAVE_STORAGE);
    datos = texto ? JSON.parse(texto) : null;
  } catch (error) {
    console.error("No se pudieron leer los datos guardados:", error);
  }

  const datosValidos =
    datos &&
    Array.isArray(datos.productos) &&
    Array.isArray(datos.mesas) &&
    Array.isArray(datos.pedidos);

  if (datosValidos) {
    productos = datos.productos;
    mesas = datos.mesas;
    pedidos = datos.pedidos;
    // Los guardados anteriores no tenían contactos ni eventos
    contactos = Array.isArray(datos.contactos) ? datos.contactos : [];
    eventos = Array.isArray(datos.eventos) ? datos.eventos : [];
  } else {
    // Sin datos guardados: 8 mesas libres y 5 productos de ejemplo
    productos = crearProductosIniciales();
    mesas = crearMesasIniciales();
    pedidos = [];
    contactos = [];
    eventos = [];
    guardarDatos();
  }
}


/* ------------------------------------------------------------
   4. MENÚ: muestra una sección y oculta las otras
   ------------------------------------------------------------ */
const SECCION_INICIAL = "seccion-salon";

function mostrarSeccion(idSeccion) {
  const secciones = document.querySelectorAll("#contenido > section");
  const enlaces = document.querySelectorAll("#menu-principal a");

  // Si el id no existe, se vuelve al Salón
  const existe = Array.from(secciones).some((s) => s.id === idSeccion);
  if (!existe) idSeccion = SECCION_INICIAL;

  secciones.forEach((seccion) => {
    seccion.hidden = seccion.id !== idSeccion;
  });

  enlaces.forEach((enlace) => {
    if (enlace.getAttribute("href") === "#" + idSeccion) {
      enlace.setAttribute("aria-current", "page");
    } else {
      enlace.removeAttribute("aria-current");
    }
  });
}

function iniciarMenu() {
  const enlaces = document.querySelectorAll("#menu-principal a");

  enlaces.forEach((enlace) => {
    enlace.addEventListener("click", (evento) => {
      evento.preventDefault();
      const id = enlace.getAttribute("href").slice(1);
      mostrarSeccion(id);
      try {
        history.replaceState(null, "", "#" + id);
      } catch (error) {
        // Si el navegador no permite cambiar la URL, el menú igual funciona
      }
    });
  });

  // Al abrir la página se respeta el #hash de la URL (o se muestra el Salón)
  mostrarSeccion(location.hash.slice(1));
}


/* ------------------------------------------------------------
   5. CONTACTOS Y EVENTOS
   ------------------------------------------------------------ */
function generarId(lista) {
  return lista.reduce((maximo, item) => Math.max(maximo, item.id), 0) + 1;
}

function mostrarContactos() {
  const lista = document.getElementById("lista-contactos");
  lista.innerHTML = "";

  contactos.forEach((contacto) => {
    const tarjeta = document.createElement("li");

    const nombre = document.createElement("strong");
    nombre.textContent = contacto.nombre;

    const telefono = document.createElement("span");
    telefono.textContent = "📞 " + contacto.telefono;

    const email = document.createElement("span");
    email.textContent = "✉️ " + contacto.email;

    tarjeta.append(nombre, telefono, email);
    lista.appendChild(tarjeta);
  });
}

function mostrarEventos() {
  const lista = document.getElementById("lista-eventos");
  lista.innerHTML = "";

  // Copia ordenada por fecha y hora: los más próximos primero
  const ordenados = [...eventos].sort((a, b) =>
    (a.fecha + "T" + a.hora).localeCompare(b.fecha + "T" + b.hora)
  );

  ordenados.forEach((evento) => {
    const contacto = contactos.find((c) => c.id === evento.contactoId);
    const tarjeta = document.createElement("li");

    const titulo = document.createElement("strong");
    titulo.textContent = evento.titulo;

    const cuando = document.createElement("span");
    cuando.textContent =
      "📅 " + evento.fecha.split("-").reverse().join("/") + " · 🕒 " + evento.hora;

    const quien = document.createElement("span");
    quien.textContent = "👤 " + (contacto ? contacto.nombre : "Contacto eliminado");

    tarjeta.append(titulo, cuando, quien);
    lista.appendChild(tarjeta);
  });
}

function llenarSelectContactos() {
  const select = document.getElementById("evento-contacto");
  select.innerHTML = "";

  const opcionBase = document.createElement("option");
  opcionBase.value = "";
  opcionBase.textContent = contactos.length
    ? "Seleccionar contacto…"
    : "Primero agregá un contacto";
  select.appendChild(opcionBase);

  contactos.forEach((contacto) => {
    const opcion = document.createElement("option");
    opcion.value = contacto.id;
    opcion.textContent = contacto.nombre;
    select.appendChild(opcion);
  });
}

function guardarContacto(ev) {
  ev.preventDefault();
  const formulario = ev.target;

  contactos.push({
    id: generarId(contactos),
    nombre: formulario.elements.nombre.value.trim(),
    telefono: formulario.elements.telefono.value.trim(),
    email: formulario.elements.email.value.trim()
  });

  guardarDatos();
  mostrarContactos();
  llenarSelectContactos();
  formulario.reset();
}

function guardarEvento(ev) {
  ev.preventDefault();
  const formulario = ev.target;

  eventos.push({
    id: generarId(eventos),
    titulo: formulario.elements.titulo.value.trim(),
    fecha: formulario.elements.fecha.value,
    hora: formulario.elements.hora.value,
    contactoId: Number(formulario.elements.contacto.value)
  });

  guardarDatos();
  mostrarEventos();
  formulario.reset();
}

function iniciarFormularios() {
  document.getElementById("form-contacto").addEventListener("submit", guardarContacto);
  document.getElementById("form-evento").addEventListener("submit", guardarEvento);

  mostrarContactos();
  mostrarEventos();
  llenarSelectContactos();
}


/* ------------------------------------------------------------
   6. SALÓN: mesas y pedido de la mesa elegida
   ------------------------------------------------------------ */
let mesaSeleccionadaId = null;

function formatearPrecio(valor) {
  return "$ " + valor.toLocaleString("es-AR");
}

function calcularTotal(items) {
  return items.reduce((suma, item) => suma + item.precio * item.cantidad, 0);
}

function buscarPedidoAbierto(mesaId) {
  return pedidos.find((p) => p.mesaId === mesaId && p.estado === "abierto");
}

function mostrarMesas() {
  const grilla = document.getElementById("grilla-mesas");
  grilla.innerHTML = "";

  mesas.forEach((mesa) => {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "mesa " + mesa.estado;
    if (mesa.id === mesaSeleccionadaId) boton.classList.add("seleccionada");
    boton.dataset.id = mesa.id;
    boton.setAttribute("aria-label", "Mesa " + mesa.numero + ", " + mesa.estado);

    const numero = document.createElement("span");
    numero.className = "mesa-numero";
    numero.textContent = mesa.numero;
    boton.appendChild(numero);

    const capacidad = document.createElement("span");
    capacidad.className = "mesa-capacidad";
    capacidad.textContent = "👥 " + mesa.capacidad;
    boton.appendChild(capacidad);

    // Las mesas ocupadas muestran el total parcial de su pedido
    if (mesa.estado === "ocupada") {
      const pedido = buscarPedidoAbierto(mesa.id);
      const total = document.createElement("span");
      total.className = "mesa-total";
      total.textContent = formatearPrecio(pedido ? calcularTotal(pedido.items) : 0);
      boton.appendChild(total);
    }

    grilla.appendChild(boton);
  });
}

function mostrarPedido() {
  const titulo = document.getElementById("mesa-seleccionada");
  const lista = document.getElementById("lista-pedido");
  const total = document.getElementById("total-pedido");
  lista.innerHTML = "";

  const mesa = mesas.find((m) => m.id === mesaSeleccionadaId);
  const pedido = mesa ? buscarPedidoAbierto(mesa.id) : null;

  // El formulario para agregar productos solo funciona con un pedido abierto
  document.getElementById("campos-agregar").disabled = !pedido;
  document.getElementById("campos-cierre").disabled = !pedido;
  document.getElementById("mensaje-pedido").textContent = "";

  if (!mesa || !pedido) {
    titulo.textContent = mesa
      ? "Mesa " + mesa.numero + " · sin pedido abierto"
      : "Ninguna mesa seleccionada";
    total.textContent = "Total: " + formatearPrecio(0);
    return;
  }

  const hora = new Date(pedido.apertura).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit"
  });
  const unidades = pedido.items.reduce((suma, item) => suma + item.cantidad, 0);
  titulo.textContent =
    "Mesa " + mesa.numero + " · 👥 " + mesa.capacidad + " lugares · abierto desde las " + hora +
    " · " + unidades + (unidades === 1 ? " producto" : " productos");

  pedido.items.forEach((item) => {
    const fila = document.createElement("li");

    const info = document.createElement("div");
    info.className = "item-info";
    const nombre = document.createElement("strong");
    nombre.textContent = item.nombre;
    const unitario = document.createElement("small");
    unitario.textContent = formatearPrecio(item.precio) + " c/u";
    info.append(nombre, unitario);

    const controles = document.createElement("div");
    controles.className = "item-controles";
    const cantidad = document.createElement("span");
    cantidad.className = "item-cantidad";
    cantidad.textContent = item.cantidad;
    controles.append(
      crearBotonCantidad("menos", item),
      cantidad,
      crearBotonCantidad("mas", item)
    );

    const subtotal = document.createElement("strong");
    subtotal.className = "item-subtotal";
    subtotal.textContent = formatearPrecio(item.precio * item.cantidad);

    fila.append(info, controles, subtotal);
    lista.appendChild(fila);
  });

  total.textContent = "Total: " + formatearPrecio(calcularTotal(pedido.items));
}

function crearBotonCantidad(accion, item) {
  const boton = document.createElement("button");
  boton.type = "button";
  boton.className = "btn-cantidad";
  boton.dataset.accion = accion;
  boton.dataset.productoId = item.productoId;
  boton.textContent = accion === "mas" ? "+" : "\u2212";
  boton.setAttribute(
    "aria-label",
    (accion === "mas" ? "Sumar una unidad de " : "Restar una unidad de ") + item.nombre
  );
  return boton;
}

function llenarSelectProductos() {
  const select = document.getElementById("item-producto");
  const seleccionado = select.value;
  select.innerHTML = "";

  const disponibles = productos.filter((p) => p.disponible);

  if (disponibles.length === 0) {
    const vacio = document.createElement("option");
    vacio.value = "";
    vacio.textContent = "No hay productos disponibles";
    select.appendChild(vacio);
    return;
  }

  disponibles.forEach((producto) => {
    const opcion = document.createElement("option");
    opcion.value = producto.id;
    opcion.textContent = producto.nombre + " \u2014 " + formatearPrecio(producto.precio);
    select.appendChild(opcion);
  });

  // Si el producto elegido sigue disponible, se conserva la selección
  if (disponibles.some((p) => String(p.id) === seleccionado)) {
    select.value = seleccionado;
  }
}

function actualizarPedido(pedido) {
  pedido.total = calcularTotal(pedido.items);
  guardarDatos();
  mostrarMesas();
  mostrarPedido();
}

function agregarItem(ev) {
  ev.preventDefault();
  const pedido = buscarPedidoAbierto(mesaSeleccionadaId);
  if (!pedido) return;

  const formulario = ev.target;
  const producto = productos.find(
    (p) => p.id === Number(formulario.elements.producto.value) && p.disponible
  );
  const cantidad = parseInt(formulario.elements.cantidad.value, 10);
  if (!producto || !(cantidad >= 1)) return;

  const existente = pedido.items.find((i) => i.productoId === producto.id);
  if (existente) {
    // Ya estaba en el pedido: se suma la cantidad y se respeta el precio original
    existente.cantidad += cantidad;
  } else {
    // Se guardan nombre y precio de este momento, no una referencia a la carta
    pedido.items.push({
      productoId: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      cantidad: cantidad
    });
  }

  formulario.elements.cantidad.value = 1;
  actualizarPedido(pedido);
}

function cambiarCantidad(productoId, diferencia) {
  const pedido = buscarPedidoAbierto(mesaSeleccionadaId);
  if (!pedido) return;

  const item = pedido.items.find((i) => i.productoId === productoId);
  if (!item) return;

  item.cantidad += diferencia;
  if (item.cantidad <= 0) {
    pedido.items = pedido.items.filter((i) => i !== item);
  }
  actualizarPedido(pedido);
}

function tocarMesa(id) {
  const mesa = mesas.find((m) => m.id === id);
  if (!mesa) return;

  // Mesa libre: se abre un pedido nuevo y la mesa pasa a ocupada
  if (mesa.estado === "libre") {
    pedidos.push({
      id: generarId(pedidos),
      mesaId: mesa.id,
      items: [],
      estado: "abierto",
      apertura: new Date().toISOString(),
      cierre: null,
      total: 0,
      formaPago: null
    });
    mesa.estado = "ocupada";
    guardarDatos();
  }

  // Mesa libre (recién ocupada) u ocupada: se muestra su pedido en el panel
  mesaSeleccionadaId = mesa.id;
  mostrarMesas();
  mostrarPedido();
}

function iniciarSalon() {
  document.getElementById("grilla-mesas").addEventListener("click", (ev) => {
    const boton = ev.target.closest(".mesa");
    if (boton) tocarMesa(Number(boton.dataset.id));
  });

  document.getElementById("form-agregar-item").addEventListener("submit", agregarItem);

  document.getElementById("lista-pedido").addEventListener("click", (ev) => {
    const boton = ev.target.closest(".btn-cantidad");
    if (!boton) return;
    const diferencia = boton.dataset.accion === "mas" ? 1 : -1;
    cambiarCantidad(Number(boton.dataset.productoId), diferencia);
  });

  llenarSelectProductos();
  mostrarMesas();
  mostrarPedido();
}


/* ------------------------------------------------------------
   6B. CARTA: alta de productos, disponibilidad y baja
   ------------------------------------------------------------ */
const CATEGORIAS = {
  bebidas: "🥤 Bebidas",
  comidas: "🍔 Comidas",
  postres: "🍮 Postres"
};

function mostrarProductos() {
  const lista = document.getElementById("lista-productos");
  lista.innerHTML = "";

  // Ordenados por categoría y después por nombre
  const orden = Object.keys(CATEGORIAS);
  const ordenados = [...productos].sort((a, b) =>
    orden.indexOf(a.categoria) - orden.indexOf(b.categoria) ||
    a.nombre.localeCompare(b.nombre, "es")
  );

  ordenados.forEach((producto) => {
    const tarjeta = document.createElement("li");
    if (!producto.disponible) tarjeta.classList.add("no-disponible");

    const info = document.createElement("div");
    info.className = "producto-info";
    const nombre = document.createElement("strong");
    nombre.textContent = producto.nombre;
    const detalle = document.createElement("small");
    detalle.textContent =
      (CATEGORIAS[producto.categoria] || producto.categoria || "Sin categoría") +
      " · " + formatearPrecio(producto.precio) +
      (producto.disponible ? "" : " · No disponible");
    info.append(nombre, detalle);

    const acciones = document.createElement("div");
    acciones.className = "producto-acciones";

    const botonDisponible = document.createElement("button");
    botonDisponible.type = "button";
    botonDisponible.className = "btn-chico";
    botonDisponible.dataset.accion = "disponible";
    botonDisponible.dataset.id = producto.id;
    botonDisponible.textContent = producto.disponible ? "Pausar" : "Activar";
    botonDisponible.setAttribute(
      "aria-label",
      (producto.disponible ? "Marcar como no disponible: " : "Marcar como disponible: ") + producto.nombre
    );

    const botonEliminar = document.createElement("button");
    botonEliminar.type = "button";
    botonEliminar.className = "btn-chico btn-eliminar";
    botonEliminar.dataset.accion = "eliminar";
    botonEliminar.dataset.id = producto.id;
    botonEliminar.textContent = "🗑️";
    botonEliminar.setAttribute("aria-label", "Eliminar " + producto.nombre);

    acciones.append(botonDisponible, botonEliminar);
    tarjeta.append(info, acciones);
    lista.appendChild(tarjeta);
  });
}

// Después de cualquier cambio en la carta se actualiza también el Salón
function actualizarCarta() {
  guardarDatos();
  mostrarProductos();
  llenarSelectProductos();
}

function guardarProducto(ev) {
  ev.preventDefault();
  const formulario = ev.target;

  const nombre = formulario.elements.nombre.value.trim();
  const precio = Number(formulario.elements.precio.value);
  if (!nombre || !Number.isFinite(precio) || precio < 0) return;

  productos.push({
    id: generarId(productos),
    nombre: nombre,
    categoria: formulario.elements.categoria.value,
    precio: precio,
    disponible: formulario.elements.disponible.checked
  });

  actualizarCarta();
  formulario.reset();
  formulario.elements.nombre.focus();
}

function accionProducto(ev) {
  const boton = ev.target.closest("button[data-accion]");
  if (!boton) return;

  const producto = productos.find((p) => p.id === Number(boton.dataset.id));
  if (!producto) return;

  if (boton.dataset.accion === "disponible") {
    producto.disponible = !producto.disponible;
  } else if (boton.dataset.accion === "eliminar") {
    // Los pedidos guardan su propia copia de nombre y precio,
    // así que borrar un producto no cambia cuentas abiertas ni la caja
    if (!confirm("¿Eliminar «" + producto.nombre + "» de la carta?")) return;
    productos = productos.filter((p) => p !== producto);
  }

  actualizarCarta();
}

function iniciarCarta() {
  document.getElementById("form-producto").addEventListener("submit", guardarProducto);
  document.getElementById("lista-productos").addEventListener("click", accionProducto);
  mostrarProductos();
}


/* ------------------------------------------------------------
   7. CIERRE DE CUENTA, TICKET Y CAJA DEL DÍA
   ------------------------------------------------------------ */
const FORMAS_PAGO = [
  { valor: "efectivo",      etiqueta: "Efectivo",      icono: "💵" },
  { valor: "debito",        etiqueta: "Débito",        icono: "💳" },
  { valor: "transferencia", etiqueta: "Transferencia", icono: "🏦" }
];

function buscarFormaPago(valor) {
  return FORMAS_PAGO.find((f) => f.valor === valor);
}

function crearElemento(etiqueta, clase, texto) {
  const elemento = document.createElement(etiqueta);
  if (clase) elemento.className = clase;
  if (texto !== undefined) elemento.textContent = texto;
  return elemento;
}

function formatearHora(iso) {
  return new Date(iso).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
}

function formatearFechaHora(iso) {
  return new Date(iso).toLocaleDateString("es-AR") + " " + formatearHora(iso);
}

function esDeHoy(iso) {
  return new Date(iso).toDateString() === new Date().toDateString();
}

function llenarSelectFormasPago() {
  const select = document.getElementById("forma-pago");
  select.innerHTML = "";

  const base = crearElemento("option", "", "Elegir forma de pago…");
  base.value = "";
  select.appendChild(base);

  FORMAS_PAGO.forEach((forma) => {
    const opcion = crearElemento("option", "", forma.icono + " " + forma.etiqueta);
    opcion.value = forma.valor;
    select.appendChild(opcion);
  });
}

function mostrarMensajePedido(texto) {
  document.getElementById("mensaje-pedido").textContent = texto;
}

function cerrarCuenta(ev) {
  ev.preventDefault();
  const pedido = buscarPedidoAbierto(mesaSeleccionadaId);
  if (!pedido) return;

  // No se puede cerrar un pedido vacío
  if (pedido.items.length === 0) {
    mostrarMensajePedido("No se puede cerrar un pedido vacío. Agregá al menos un producto.");
    return;
  }

  const select = document.getElementById("forma-pago");
  const forma = buscarFormaPago(select.value);
  if (!forma) {
    mostrarMensajePedido("Elegí la forma de pago para cerrar la cuenta.");
    return;
  }

  pedido.total = calcularTotal(pedido.items);
  pedido.formaPago = forma.valor;
  pedido.estado = "cerrado";
  pedido.cierre = new Date().toISOString();

  const mesa = mesas.find((m) => m.id === pedido.mesaId);
  if (mesa) mesa.estado = "libre";

  guardarDatos();

  select.value = "";
  mesaSeleccionadaId = null;
  mostrarMesas();
  mostrarPedido();
  mostrarCaja();
  mostrarTicket(pedido);
}

function mostrarTicket(pedido) {
  const mesa = mesas.find((m) => m.id === pedido.mesaId);
  const forma = buscarFormaPago(pedido.formaPago);
  const detalle = document.getElementById("ticket-detalle");
  detalle.innerHTML = "";

  detalle.append(
    crearElemento("p", "ticket-dato", "Ticket Nº " + pedido.id),
    crearElemento("p", "ticket-dato", "Mesa " + (mesa ? mesa.numero : "?")),
    crearElemento("p", "ticket-dato", "Apertura: " + formatearFechaHora(pedido.apertura)),
    crearElemento("p", "ticket-dato", "Cierre: " + formatearFechaHora(pedido.cierre))
  );

  const lista = crearElemento("ul", "ticket-items");
  pedido.items.forEach((item) => {
    const fila = crearElemento("li");
    fila.append(
      crearElemento(
        "span",
        "",
        item.cantidad + " × " + item.nombre + " (" + formatearPrecio(item.precio) + " c/u)"
      ),
      crearElemento("strong", "", formatearPrecio(item.precio * item.cantidad))
    );
    lista.appendChild(fila);
  });

  const total = crearElemento("p", "ticket-total");
  total.append(crearElemento("span", "", "Total"), crearElemento("strong", "", formatearPrecio(pedido.total)));

  detalle.append(
    lista,
    total,
    crearElemento("p", "ticket-pago", "Forma de pago: " + (forma ? forma.icono + " " + forma.etiqueta : pedido.formaPago)),
    crearElemento("p", "ticket-gracias", "¡Gracias por visitarnos!")
  );

  document.getElementById("ticket").hidden = false;
  document.getElementById("btn-cerrar-ticket").focus();
}

function cerrarTicket() {
  document.getElementById("ticket").hidden = true;
}

function mostrarCaja() {
  const cuerpo = document.getElementById("cuerpo-caja");
  const subtotales = document.getElementById("subtotales-pago");
  cuerpo.innerHTML = "";
  subtotales.innerHTML = "";

  // Pedidos cerrados hoy, el más reciente primero
  const cerrados = pedidos
    .filter((p) => p.estado === "cerrado" && p.cierre && esDeHoy(p.cierre))
    .sort((a, b) => b.cierre.localeCompare(a.cierre));

  if (cerrados.length === 0) {
    const fila = crearElemento("tr");
    const celda = crearElemento("td", "sin-datos", "🧾 Todavía no hay cuentas cerradas hoy");
    celda.colSpan = 4;
    fila.appendChild(celda);
    cuerpo.appendChild(fila);
  }

  let recaudado = 0;
  const porForma = {};
  FORMAS_PAGO.forEach((f) => { porForma[f.valor] = { total: 0, cantidad: 0 }; });

  cerrados.forEach((pedido) => {
    const mesa = mesas.find((m) => m.id === pedido.mesaId);
    const forma = buscarFormaPago(pedido.formaPago);

    const fila = crearElemento("tr");
    fila.append(
      crearElemento("td", "", formatearHora(pedido.cierre)),
      crearElemento("td", "", "Mesa " + (mesa ? mesa.numero : "?")),
      crearElemento("td", "", forma ? forma.icono + " " + forma.etiqueta : String(pedido.formaPago)),
      crearElemento("td", "", formatearPrecio(pedido.total))
    );
    cuerpo.appendChild(fila);

    recaudado += pedido.total;
    if (porForma[pedido.formaPago]) {
      porForma[pedido.formaPago].total += pedido.total;
      porForma[pedido.formaPago].cantidad += 1;
    }
  });

  document.getElementById("total-caja").textContent = formatearPrecio(recaudado);

  FORMAS_PAGO.forEach((forma) => {
    const dato = porForma[forma.valor];
    const tarjeta = crearElemento("li");
    tarjeta.append(
      crearElemento("span", "subtotal-nombre", forma.icono + " " + forma.etiqueta),
      crearElemento("strong", "subtotal-monto", formatearPrecio(dato.total)),
      crearElemento("small", "", dato.cantidad + (dato.cantidad === 1 ? " cuenta" : " cuentas"))
    );
    subtotales.appendChild(tarjeta);
  });
}

function iniciarCaja() {
  llenarSelectFormasPago();

  document.getElementById("form-cerrar-cuenta").addEventListener("submit", cerrarCuenta);

  document.getElementById("btn-cerrar-ticket").addEventListener("click", cerrarTicket);
  document.getElementById("btn-imprimir-ticket").addEventListener("click", () => window.print());

  // Cerrar el ticket tocando el fondo oscuro o con la tecla Escape
  document.getElementById("ticket").addEventListener("click", (ev) => {
    if (ev.target.id === "ticket") cerrarTicket();
  });
  document.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape") cerrarTicket();
  });

  mostrarCaja();
}


/* ------------------------------------------------------------
   8. EXPORTAR E IMPORTAR
   ------------------------------------------------------------ */
let temporizadorMensajeDatos = null;

function mostrarMensajeDatos(texto, tipo) {
  const mensaje = document.getElementById("mensaje-datos");
  mensaje.textContent = texto;
  mensaje.dataset.tipo = tipo;
  mensaje.setAttribute("role", tipo === "error" ? "alert" : "status");
  mensaje.hidden = false;

  clearTimeout(temporizadorMensajeDatos);
  // Los errores quedan a la vista; los avisos de éxito se ocultan solos
  if (tipo !== "error") {
    temporizadorMensajeDatos = setTimeout(() => { mensaje.hidden = true; }, 6000);
  }
}

function exportarDatos() {
  const datos = { productos, mesas, pedidos, contactos, eventos };
  const blob = new Blob([JSON.stringify(datos, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = "bar.json";
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();

  // Se libera el enlace temporal una vez iniciada la descarga
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  mostrarMensajeDatos("Datos exportados en bar.json.", "ok");
}

// Devuelve un texto con el problema encontrado, o null si el archivo es válido
function validarDatos(datos) {
  if (!datos || typeof datos !== "object" || Array.isArray(datos)) {
    return "El archivo no tiene el formato esperado: tiene que ser un objeto con listas.";
  }

  const faltantes = ["productos", "mesas", "pedidos"].filter((nombre) => !Array.isArray(datos[nombre]));
  if (faltantes.length > 0) {
    return "Faltan listas obligatorias o no son listas: " + faltantes.join(", ") + ".";
  }

  for (const nombre of ["contactos", "eventos"]) {
    if (datos[nombre] !== undefined && !Array.isArray(datos[nombre])) {
      return "La lista «" + nombre + "» no es válida.";
    }
  }

  const tieneId = (x) => x && typeof x === "object" && !Array.isArray(x) && Number.isFinite(x.id);
  const reglas = {
    productos: (p) => tieneId(p) && typeof p.nombre === "string" && Number.isFinite(p.precio),
    mesas: (m) => tieneId(m) && Number.isFinite(m.numero) && (m.estado === "libre" || m.estado === "ocupada"),
    pedidos: (p) =>
      tieneId(p) &&
      Number.isFinite(p.mesaId) &&
      typeof p.apertura === "string" &&
      (p.estado === "abierto" || (p.estado === "cerrado" && typeof p.cierre === "string")) &&
      Array.isArray(p.items) &&
      p.items.every((i) => i && Number.isFinite(i.productoId) && Number.isFinite(i.precio) && Number.isFinite(i.cantidad)),
    contactos: tieneId,
    eventos: tieneId
  };

  for (const [nombre, regla] of Object.entries(reglas)) {
    const posicion = (datos[nombre] || []).findIndex((elemento) => !regla(elemento));
    if (posicion !== -1) {
      return "La lista «" + nombre + "» tiene un elemento inválido (posición " + (posicion + 1) + ").";
    }
  }

  return null;
}

function redibujarTodo() {
  mesaSeleccionadaId = null;
  cerrarTicket();
  mostrarMesas();
  mostrarPedido();
  mostrarContactos();
  mostrarEventos();
  llenarSelectContactos();
  mostrarProductos();
  llenarSelectProductos();
  mostrarCaja();
}

function importarDatos(texto) {
  let datos;
  try {
    datos = JSON.parse(texto);
  } catch (error) {
    mostrarMensajeDatos("No se pudo importar: el archivo no es un JSON válido. No se modificó nada.", "error");
    return;
  }

  const problema = validarDatos(datos);
  if (problema) {
    mostrarMensajeDatos("No se pudo importar: " + problema + " No se modificó nada.", "error");
    return;
  }

  const resumen =
    datos.productos.length + " productos, " +
    datos.mesas.length + " mesas, " +
    datos.pedidos.length + " pedidos, " +
    (datos.contactos || []).length + " contactos y " +
    (datos.eventos || []).length + " eventos";

  if (!confirm("Esto reemplaza todos los datos actuales por los del archivo (" + resumen + "). ¿Continuar?")) {
    mostrarMensajeDatos("Importación cancelada. No se modificó nada.", "ok");
    return;
  }

  // Copia de los datos actuales por si no se pueden guardar los nuevos
  const respaldo = { productos, mesas, pedidos, contactos, eventos };

  productos = datos.productos;
  mesas = datos.mesas;
  pedidos = datos.pedidos;
  contactos = datos.contactos || [];
  eventos = datos.eventos || [];

  if (!guardarDatos()) {
    ({ productos, mesas, pedidos, contactos, eventos } = respaldo);
    mostrarMensajeDatos("No se pudo guardar el archivo importado. Se mantuvieron los datos anteriores.", "error");
    return;
  }

  redibujarTodo();
  mostrarMensajeDatos("Datos importados correctamente.", "ok");
}

function iniciarExportarImportar() {
  const entrada = document.getElementById("input-importar");

  document.getElementById("btn-exportar").addEventListener("click", exportarDatos);
  document.getElementById("btn-importar").addEventListener("click", () => entrada.click());

  entrada.addEventListener("change", () => {
    const archivo = entrada.files[0];
    if (!archivo) return;

    const lector = new FileReader();
    lector.onload = () => {
      importarDatos(String(lector.result));
      entrada.value = "";
    };
    lector.onerror = () => {
      mostrarMensajeDatos("No se pudo leer el archivo. No se modificó nada.", "error");
      entrada.value = "";
    };
    lector.readAsText(archivo);
  });
}


/* ------------------------------------------------------------
   9. INICIO
   ------------------------------------------------------------ */
cargarDatos();
iniciarMenu();
iniciarFormularios();
iniciarSalon();
iniciarCarta();
iniciarCaja();
iniciarExportarImportar();


/* ------------------------------------------------------------
   10. APP INSTALABLE: registra el service worker (sw.js)
   ------------------------------------------------------------ */
// Solo funciona si la página se abre desde un servidor (http/https),
// no haciendo doble clic en el archivo.
if ("serviceWorker" in navigator && location.protocol !== "file:") {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch((error) => {
      console.error("No se pudo registrar el service worker:", error);
    });
  });
}
