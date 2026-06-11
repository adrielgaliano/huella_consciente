// ==========================================
// 1. BANCO DE PREGUNTAS Y RESPUESTAS (JSON)
// ==========================================
const bancoHuellin = [
    // --- CATEGORÍA 1: DENUNCIAS ---
    {
        keywords: ["como", "hacer", "denuncia", "denunciar", "maltrato"],
        respuesta: "Podés realizar la denuncia penal de forma gratuita en la comisaría más cercana, en la oficina fiscal de tu zona o a través de las plataformas digitales del Ministerio Público Fiscal de tu provincia. El maltrato animal es un delito protegido por la Ley Nacional 14.346."
    },
    {
        keywords: ["datos", "necesito", "informacion", "evidencia", "pruebas", "denunciar"],
        respuesta: "Necesitás la dirección exacta del lugar, una descripción detallada del estado del animal y, si es posible, fotos o videos que sirvan como evidencia física."
    },
    {
        keywords: ["anonima", "anonimo", "identidad", "represalias"],
        respuesta: "Las denuncias penales formales requieren tus datos de identidad, pero se puede solicitar la reserva de identidad si temés represalias. Algunas ONG o aplicaciones municipales permiten reportes anónimos preliminares."
    },
    {
        keywords: ["considera", "legalmente", "ley", "ejemplos", "que es maltrato"],
        respuesta: "No alimentar adecuadamente a los animales, estimularlos con drogas sin fines terapéuticos, hacerlos trabajar jornadas excesivas, golpearlos, abandonarlos o tenerlos en espacios reducidos y sin higiene."
    },
    {
        keywords: ["auto", "sol", "encerrado", "calor"],
        respuesta: "Llamá de inmediato a emergencias (911) o a las autoridades policiales locales para que intervengan de urgencia, ya que la vida del animal está en riesgo inminente por golpe de calor."
    },
    {
        keywords: ["vecino", "atado", "sin agua", "patio"],
        respuesta: "Esto califica como crueldad por privación de necesidades básicas. Debés radicar la denuncia en la comisaría u oficina fiscal más cercana a tu domicilio."
    },
    {
        keywords: ["costo", "pagar", "dinero", "cobran", "gratis"],
        respuesta: "No, realizar una denuncia penal por infracción a la Ley 14.346 es un trámite completamente gratuito."
    },
    {
        keywords: ["14346", "14.346", "ley penal"],
        respuesta: "Es la ley nacional argentina que establece penas de prisión para las personas que cometan actos de maltrato o crueldad contra los animales."
    },
    {
        keywords: ["envenenaron", "veneno", "barrio", "muerto"],
        respuesta: "Sí, el envenenamiento es un acto cruento y peligroso también para la salud pública. Guardá cualquier elemento de prueba y realizá la denuncia penal urgente."
    },
    {
        keywords: ["policia", "no quiere", "tomar", "comisaria", "niegan"],
        respuesta: "Recordales que el maltrato animal es un delito de acción pública y tienen la obligación legal de tomarla. Si insisten en negarse, podés denunciar a los oficiales por incumplimiento de los deberes de funcionario público."
    },
    {
        keywords: ["caballo", "carro", "traccion a sangre"],
        respuesta: "Muchas localidades prohíben por ordenanza la tracción a sangre. Si ves un carro con un caballo en mal estado, notificá inmediatamente al 911 o al control de tránsito local."
    },
    {
        keywords: ["calle", "abandono", "abandonado", "dejar"],
        respuesta: "Sí, el abandono deliberado está encuadrado dentro de los actos de crueldad, ya que deja al animal desamparado y en riesgo de muerte."
    },
    {
        keywords: ["peleas", "clandestinas", "perros", "apuestas"],
        respuesta: "Denuncialo de inmediato en la fiscalía. Es una actividad ilegal considerada acto de crueldad extrema y suele estar vinculada a otros delitos."
    },
    {
        keywords: ["rescatar", "yo mismo", "propiedad privada", "entrar", "sacarlo"],
        respuesta: "Legalmente no podés ingresar a una propiedad privada sin autorización, ya que cometerías el delito de violación de domicilio. Debés esperar la orden de un fiscal o la intervención policial."
    },

    // --- CATEGORÍA 2: ADOPCIÓN ---
    {
        keywords: ["requisitos", "condiciones", "para adoptar", "piden"],
        respuesta: "Ser mayor de edad, que todos los miembros del hogar estén de acuerdo 👨‍👩‍👧‍👦, disponer de espacio seguro (patios cerrados) 🏡, contar con estabilidad económica para su veterinario 🩺 y firmar un contrato de adopción responsable 📝."
    },
    {
        keywords: ["ver", "animales", "listos", "catalogo", "fotos"],
        respuesta: "Podés ingresar a nuestra sección exclusiva de 'Adoptar' dentro de la página web de Huella Consciente para conocer las fichas de los rescatados 🐾💻."
    },
    {
        keywords: ["costo", "pagar", "adoptar", "precio"],
        respuesta: "No, la adopción es un acto completamente solidario y gratuito 🙌. Los refugios solo agradecen donaciones voluntarias para seguir rescatando a otros animales 🐾."
    },
    {
        keywords: ["cachorros", "bebes", "chiquitos"],
        respuesta: "Sí, frecuentemente ingresan camadas de cachorros 🐶🐱. Podés revisar las actualizaciones semanales de nuestra plataforma web 💻."
    },
    {
        keywords: ["adulto", "anciano", "viejito", "grande"],
        respuesta: "Los adultos ya tienen su tamaño definitivo, su personalidad definida, suelen ser mucho más tranquilos 🛋️, aprenden rápido dónde hacer sus necesidades y son sumamente agradecidos ✨."
    },
    {
        keywords: ["departamento", "chico", "espacio pequeño"],
        respuesta: "¡Por supuesto! 🏢 Hay muchos perros de tamaño pequeño o de temperamento tranquilo, al igual que gatos, que se adaptan perfectamente a la vida en espacios reducidos si se les garantizan sus paseos 🦮."
    },
    {
        keywords: ["otras provincias", "lejos", "envios", "viaje"],
        respuesta: "Por lo general se priorizan las adopciones locales en Mendoza 📍 para poder realizar las visitas de seguimiento obligatorias, salvo excepciones muy específicas 🏡."
    },
    {
        keywords: ["gato", "seguridad", "redes", "balcon"],
        respuesta: "Se solicita de manera obligatoria que las ventanas, balcones o accesos al exterior tengan redes o telas mosquiteras seguras para evitar caídas o fugas peligrosas 🪟🐈."
    },

    // --- CATEGORÍA 3: DONACIONES Y COLABORACIÓN ---
    {
        keywords: ["donar", "dinero", "mercado pago", "transferencia", "alias"],
        respuesta: "En nuestra sección 'Donaciones' encontrarás los links de Mercado Pago, alias bancarios y cuentas de las distintas fundaciones aliadas para aportar directamente 💳💸."
    },
    {
        keywords: ["alimento", "comida", "balanceado"],
        respuesta: "Sí, los refugios necesitan permanentemente alimento para perros y gatos (adultos y cachorros) 🍲🐾. Podés contactar a los refugios a través de nuestra web y coordinar la entrega."
    },
    {
        keywords: ["insumos", "materiales", "construccion", "mantas"],
        respuesta: "Mantas, colchones viejos, cuchas, lonas, chapas, postes de madera, tejidos romboidales para caniles, comederos de acero y productos de limpieza (lavandina, desinfectantes) 🧱🧹."
    },
    {
        keywords: ["ayudar", "sin dinero", "voluntario", "tiempo"],
        respuesta: "Podés sumarte compartiendo las publicaciones de los animales que buscan hogar 📢, donando mantas o ropa vieja en desuso, o donando un poco de tu tiempo como voluntario en los refugios 🙌."
    },

    // --- CATEGORÍA 4: REFUGIOS ---
    {
        keywords: ["que refugios", "cuales", "red", "nombres"],
        respuesta: "Colaboramos de forma estrecha con espacios como 'El Refugio de Diego', 'Fundación Hogar Rousi', 'Fundación Jupakki', 'La Casita de Lula', “Adopción Responsable Mendoza” y “Gatitos en adopción Mendoza” 🏥🤝."
    },
    {
        keywords: ["donde queda", "ubicado", "direccion", "ir al refugio"],
        respuesta: "Por estrictas razones de seguridad y para evitar abandonos anónimos en la puerta, las direcciones exactas de los predios no son públicas 🔒; se comparten únicamente al concretar visitas institucionales pautadas 🗺️."
    },
    {
        keywords: ["subsidios", "gobierno", "estado", "ayuda oficial"],
        respuesta: "No de manera fija. Se sostienen casi al 100% gracias al aporte voluntario de la comunidad, madrinas, padrinos y eventos solidarios organizados a pulmón 💪🎟️."
    },

    // --- CATEGORÍA 5: CUIDADOS Y GENERALES ---
    {
        keywords: ["castrar", "esterilizar", "operar", "edad", "celo"],
        respuesta: "Se recomienda realizar la castración a partir de los 5 o 6 meses de edad, tanto en machos como en hembras, antes del primer celo para prevenir tumores 🩺✅. Evita la sobrepoblación, previene tumores e infecciones 🚫🐕."
    },
    {
        keywords: ["vacunas", "obligatorias", "sextuple", "antirrabica"],
        respuesta: "Un perro requiere de forma obligatoria la vacuna Sextuple (o Quíntuple) anual y la Antirrábica 💉🐶. Un gato necesita la Triple Felina y la Antirrábica 💉🐈."
    },
    {
        keywords: ["alimentos", "toxicos", "veneno", "chocolate", "cebolla"],
        respuesta: "El chocolate, la cebolla, el ajo, las uvas, las pasas de uva, el alcohol, la palta y edulcorantes artificiales como el xilitol ⚠️🚫."
    },
    {
        keywords: ["pulga", "garrapata", "bichos", "pipeta"],
        respuesta: "Aplicale una pipeta adecuada para su peso o una pastilla masticable antipulgas autorizada. Revisá su entorno y desinfectá los espacios donde duerme habitualmente 🦠🧴."
    },
    {
        keywords: ["huesos", "pollo", "carne", "cocidos"],
        respuesta: "No, los huesos cocidos se astillan con extrema facilidad al ser mordidos, lo que puede causar perforaciones graves de esófago, estómago o intestinos con riesgo de muerte 🦴⚠️."
    },
    {
        keywords: ["ibuprofeno", "paracetamol", "remedios humanos", "pastilla"],
        respuesta: "No, el ibuprofeno y el paracetamol de humanos son altamente tóxicos y letales para los perros y gatos, causando fallas hepáticas y renales graves. Nunca los automediques 💊⚠️."
    },
    {
        keywords: ["que es", "huella consciente", "quienes son", "mision"],
        respuesta: "Somos una plataforma digital dedicada a conectar a la comunidad con refugios de animales de Mendoza, facilitando herramientas de gestión y promoviendo la adopción responsable y el cese del maltrato animal 🐾💙."
    }
];

// ==========================================
// 2. LÓGICA DEL CHATBOT
// ==========================================

// Abrir y cerrar ventana
function toggleChat() {
    const chatWindow = document.getElementById("chatWindow");
    const isOpen = chatWindow.style.display === "flex";
    
    if (isOpen) {
        chatWindow.style.display = "none";
    } else {
        chatWindow.style.display = "flex";
        // Si el chat está vacío, iniciamos el saludo
        if(document.getElementById("chatBody").children.length === 0) {
            initChat();
        }
        document.getElementById("chatInput").focus();
    }
}

// Saludo inicial
function initChat() {
    const chatBody = document.getElementById("chatBody");
    chatBody.innerHTML = `
        <div class="message bot-msg">
            ¡Guau! ¡Hola humano! 🐾 Soy <b>Huellín</b>. Podés preguntarme sobre cómo denunciar maltrato, requisitos para adoptar, cómo donar o cuidados de mascotas. ¿En qué te ayudo? 🐶
        </div>
    `;
}

// Detectar tecla ENTER
function handleKeyPress(event) {
    if (event.key === "Enter") {
        enviarMensaje();
    }
}

// Normalizar texto (quitar tildes, minúsculas y caracteres especiales)
function normalizarTexto(texto) {
    return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

// Procesar el mensaje enviado
function enviarMensaje() {
    const inputField = document.getElementById("chatInput");
    const mensajeUsuario = inputField.value.trim();

    if (mensajeUsuario === "") return;

    // 1. Mostrar mensaje del usuario
    mostrarMensaje(mensajeUsuario, "user-msg");
    inputField.value = ""; // Limpiar input

    // 2. Buscar respuesta en el JSON
    const respuesta = buscarRespuesta(mensajeUsuario);

    // 3. Simular un pequeño retraso para que parezca que "piensa"
    setTimeout(() => {
        mostrarMensaje(respuesta, "bot-msg");
    }, 600);
}

// Motor de búsqueda por palabras clave
function buscarRespuesta(mensaje) {
    const mensajeNormalizado = normalizarTexto(mensaje);
    
    let mejorCoincidencia = null;
    let maxPuntuacion = 0;

    bancoHuellin.forEach(item => {
        let puntuacion = 0;
        
        // Revisamos cuántas keywords coinciden con la frase del usuario
        item.keywords.forEach(keyword => {
            const keyNormalizada = normalizarTexto(keyword);
            // Si el mensaje del usuario incluye la palabra clave exacta
            if (mensajeNormalizado.includes(keyNormalizada)) {
                puntuacion++;
            }
        });

        if (puntuacion > maxPuntuacion) {
            maxPuntuacion = puntuacion;
            mejorCoincidencia = item.respuesta;
        }
    });

    // Si encontró al menos una palabra clave, devuelve la respuesta
    if (maxPuntuacion > 0) {
        return mejorCoincidencia;
    } else {
        // Respuesta por defecto si no reconoce el texto
        return "¡Guau! 🐶 No entendí bien tu consulta. Intentá usar palabras como 'adoptar', 'denunciar', 'castrar', 'vacunas' o 'donar'.";
    }
}

// Mostrar mensaje en la interfaz
function mostrarMensaje(texto, tipoClase) {
    const chatBody = document.getElementById("chatBody");
    
    const divMensaje = document.createElement("div");
    divMensaje.classList.add("message", tipoClase);
    
    // Si es el bot, permitimos formato HTML para negritas o emojis
    if(tipoClase === "bot-msg") {
        divMensaje.innerHTML = texto;
    } else {
        divMensaje.textContent = texto; // Por seguridad en el input del usuario
    }

    chatBody.appendChild(divMensaje);
    scrollToBottom();
}

// Bajar el scroll automáticamente
function scrollToBottom() {
    const chatBody = document.getElementById("chatBody");
    chatBody.scrollTop = chatBody.scrollHeight;
}