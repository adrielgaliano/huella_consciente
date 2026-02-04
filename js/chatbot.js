// Configuración de las respuestas de "Huellin"
const chatData = [
    {
        id: 1,
        question: "¿Cómo hago para adoptar? 🏠",
        answer: "¡Guau! ¡Qué emoción! 🎉 Moveré la cola de felicidad si adoptas. Es muy fácil: ve a la sección **'Adoptá'** (En celular ve al menu arriba a la derecha y clickea la opción **'Adoptá'**), enamórate de un peludito y dale clic al botón de consultar. ¡Te comunicarás directo con quienes lo cuidan! 🧡"
    },
    {
        id: 2,
        question: "¿Tienen refugio físico? 📍",
        answer: "¡Ups! No tenemos una cucha gigante física 🐕‍🦺. Huella Consciente es una red digital. Cada uno de mis amigos peludos está en un hogar de tránsito o en el refugio que lo rescató, esperando por ti."
    },
    {
        id: 3,
        question: "¿Cómo puedo donar? 🦴",
        answer: "¡Gracias humano generoso! 🙌 Tu ayuda nos llena la pancita. Entrá a la sección **'Donaciones'** (En celular ve al menu arriba a la derecha y clickea la opción **'Donaciones'**). Ahí verás los datos directos de cada refugio para enviarles tu granito de arena (o de alimento 🐾)."
    },
    {
        id: 4,
        question: "Quiero ser voluntario 🙋‍♂️",
        answer: "¡Choquemos esas patas! 🐾 Necesitamos más manos amigas. Escribinos por Instagram (**@huellaconsciente.oficial**) contándonos de dónde sos, y te guiaremos al refugio más cercano que necesite ayuda."
    },
    {
        id: 5,
        question: "Soy refugio, quiero sumarme 🏡",
        answer: "¡Bienvenidos a la manada! 🐺 Nos encantaría tenerlos. Envíen un correo a **huella.consciente.consultas@gmail.com** o contactenos por Instagram (@huellaconsciente.oficial) para darles de alta y que puedan mostrar a sus rescataditos."
    }
];

// Lógica del Chat (No cambia mucho, solo el saludo inicial)
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
    }
}

function initChat() {
    const chatBody = document.getElementById("chatBody");
    // Saludo inicial con personalidad de Huellin
    chatBody.innerHTML = `
        <div class="message bot-msg">
            ¡Guau! ¡Hola humano! 🐾 Soy <b>Huellin</b>, el guardián virtual de este refugio. ¿En qué puedo darte una patita hoy? 🐶
        </div>
        <div class="chat-options" id="chatOptions"></div>
    `;
    renderOptions();
}

function renderOptions() {
    const optionsContainer = document.getElementById("chatOptions");
    optionsContainer.innerHTML = ""; 

    chatData.forEach(item => {
        const btn = document.createElement("button");
        btn.className = "option-btn";
        btn.textContent = item.question;
        btn.onclick = () => handleOptionClick(item);
        optionsContainer.appendChild(btn);
    });
}

function handleOptionClick(item) {
    const chatBody = document.getElementById("chatBody");
    const optionsContainer = document.getElementById("chatOptions");

    // 1. Mostrar la pregunta del usuario
    const userMsg = document.createElement("div");
    userMsg.className = "message user-msg";
    userMsg.textContent = item.question.replace(/.$/,''); // Quitamos el emoji final para que quede más serio
    
    optionsContainer.remove(); 
    chatBody.appendChild(userMsg);
    scrollToBottom();

    // 2. Simular que Huellin piensa...
    setTimeout(() => {
        const botMsg = document.createElement("div");
        botMsg.className = "message bot-msg";
        // Usamos innerHTML para que el texto en negrita (**texto**) funcione
        botMsg.innerHTML = item.answer.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>'); 
        chatBody.appendChild(botMsg);
        scrollToBottom();

        // 3. Volver a mostrar las opciones
        setTimeout(() => {
            const newOptionsDiv = document.createElement("div");
            newOptionsDiv.className = "chat-options";
            newOptionsDiv.id = "chatOptions";
            chatBody.appendChild(newOptionsDiv);
            renderOptions();
            scrollToBottom();
        }, 800);

    }, 600);
}

function scrollToBottom() {
    const chatBody = document.getElementById("chatBody");
    chatBody.scrollTop = chatBody.scrollHeight;
}