import { auth } from "./firebase-config.js";
import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import {
  getEvents,
  createNewEvent,
  getEventById,
  registerUserForEvent,
} from "./event-service.js";

// Elementos do DOM
const eventsGrid = document.getElementById("eventsGrid");
const eventsList = document.getElementById("eventsList");
const loadingEvents = document.getElementById("loadingEvents");
const noEventsMessage = document.getElementById("noEventsMessage");
const categoryFilter = document.getElementById("categoryFilter");
const searchInput = document.getElementById("searchInput");
const gridViewBtn = document.getElementById("gridViewBtn");
const listViewBtn = document.getElementById("listViewBtn");

// Modais
const eventModal = document.getElementById("eventModal");
const modalEventTitle = document.getElementById("modalEventTitle");
const modalEventDate = document.getElementById("modalEventDate");
const modalEventLocation = document.getElementById("modalEventLocation");
const modalEventCategory = document.getElementById("modalEventCategory");
const modalEventDescription = document.getElementById("modalEventDescription");
const modalEventParticipants = document.getElementById(
  "modalEventParticipants"
);
const modalEventMaxParticipants = document.getElementById(
  "modalEventMaxParticipants"
);
const modalEventImage = document.getElementById("modalEventImage");
const registerEventBtn = document.getElementById("registerEventBtn");

const createEventModal = document.getElementById("createEventModal");
const createEventForm = document.getElementById("createEventForm");

const loginLink = document.getElementById("loginLink");
const logoutLink = document.getElementById("logoutLink");
const myEventsLink = document.getElementById("myEventsLink");
const adminLink = document.getElementById("adminLink");
const createEventBtnHero = document.getElementById("createEventBtn"); // Botão "Criar Evento" na hero section

let currentEvents = []; // Armazena os eventos carregados para facilitar filtros
let currentView = "grid"; // Estado da visualização
let selectedEventId = null; // ID do evento atualmente visualizado no modal

// --- Funções de UI ---

/**
 * Exibe mensagens de alerta para o usuário.
 * @param {string} message - A mensagem a ser exibida.
 * @param {'success'|'error'|'info'} type - O tipo de alerta.
 */
function showAlert(message, type) {
  const alertContainer = document.getElementById("alertContainer");
  const alertDiv = document.createElement("div");
  alertDiv.classList.add("alert", `alert-${type}`);
  alertDiv.innerHTML = `<i class="fas ${
    type === "success"
      ? "fa-check-circle"
      : type === "error"
      ? "fa-times-circle"
      : "fa-info-circle"
  }"></i> ${message}`;
  alertContainer.prepend(alertDiv); // Adiciona no início para que os mais novos fiquem em cima

  // Remove o alerta após alguns segundos
  setTimeout(() => {
    alertDiv.style.opacity = "0";
    alertDiv.style.transform = "translateY(-10px)";
    alertDiv.addEventListener("transitionend", () => alertDiv.remove());
  }, 5000);
}

/**
 * Renderiza os eventos na grade ou lista.
 * @param {Array} events - Array de objetos de evento.
 */
function renderEvents(events) {
  eventsGrid.innerHTML = "";
  eventsList.innerHTML = "";
  currentEvents = events; // Atualiza a lista de eventos para filtros futuros

  if (events.length === 0) {
    noEventsMessage.style.display = "block";
    loadingEvents.style.display = "none";
    eventsGrid.style.display = "none";
    eventsList.style.display = "none";
    return;
  }

  noEventsMessage.style.display = "none";
  loadingEvents.style.display = "none";

  events.forEach((event) => {
    // Card para visualização em grade
    const gridCard = document.createElement("div");
    gridCard.classList.add("event-card");
    // Adiciona um data-id para facilitar a abertura do modal
    gridCard.setAttribute("data-id", event.id);
    gridCard.onclick = () => openEventModal(event.id); // Adiciona o evento de clique aqui
    gridCard.innerHTML = `
            <img src="${
              event.imageUrl ||
              "https://via.placeholder.com/400x200?text=AgilePop+Evento"
            }" alt="${event.title}" class="event-card-image">
            <div class="event-card-content">
                <h3 class="event-card-title">${event.title}</h3>
                <p class="event-card-date"><i class="fas fa-calendar-alt"></i> ${new Date(
                  event.date
                ).toLocaleDateString("pt-BR", {
                  dateStyle: "long",
                })} ${new Date(event.date).toLocaleTimeString("pt-BR", {
      timeStyle: "short",
    })}</p>
                <p class="event-card-location"><i class="fas fa-map-marker-alt"></i> ${
                  event.location
                }</p>
                <p class="event-card-category"><i class="fas fa-tag"></i> ${
                  event.category.charAt(0).toUpperCase() +
                  event.category.slice(1)
                }</p>
                <p class="event-card-description">${event.description}</p>
            </div>
            <div class="event-card-footer">
                <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); openEventModal('${
                  event.id
                }')">Ver Detalhes</button>
            </div>
        `;
    eventsGrid.appendChild(gridCard);

    // Item para visualização em lista
    const listItem = document.createElement("div");
    listItem.classList.add("event-list-item");
    listItem.setAttribute("data-id", event.id);
    listItem.onclick = () => openEventModal(event.id); // Adiciona o evento de clique aqui
    listItem.innerHTML = `
            <img src="${
              event.imageUrl ||
              "https://via.placeholder.com/150x100?text=AgilePop"
            }" alt="${event.title}" class="event-list-image">
            <div class="event-list-content">
                <h3 class="event-list-title">${event.title}</h3>
                <div class="event-list-meta">
                    <span><i class="fas fa-calendar-alt"></i> ${new Date(
                      event.date
                    ).toLocaleDateString("pt-BR", {
                      dateStyle: "medium",
                    })}</span>
                    <span><i class="fas fa-map-marker-alt"></i> ${
                      event.location
                    }</span>
                    <span><i class="fas fa-tag"></i> ${
                      event.category.charAt(0).toUpperCase() +
                      event.category.slice(1)
                    }</span>
                </div>
                <p class="event-list-description">${event.description}</p>
                <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); openEventModal('${
                  event.id
                }')">Ver Detalhes</button>
            </div>
        `;
    eventsList.appendChild(listItem);
  });

  toggleView(currentView); // Garante que a visualização correta seja exibida
}

/**
 * Carrega e exibe os eventos do Firebase.
 */
async function loadEvents() {
  loadingEvents.style.display = "block";
  eventsGrid.style.display = "none";
  eventsList.style.display = "none";
  noEventsMessage.style.display = "none";

  try {
    const selectedCategory = categoryFilter.value;
    const searchTerm = searchInput.value;
    const events = await getEvents(selectedCategory, searchTerm);
    renderEvents(events);
  } catch (error) {
    console.error("Erro ao carregar eventos:", error);
    showAlert("Erro ao carregar eventos. Tente novamente mais tarde.", "error");
    loadingEvents.style.display = "none";
    noEventsMessage.style.display = "block"; // Exibe mensagem de erro se falhar
  }
}

// --- Funções de Eventos da UI (chamadas pelos onclicks no HTML) ---

window.criarEvento = function () {
  createEventForm.reset(); // Limpa o formulário ao abrir
  createEventModal.classList.add("show");
};

window.closeCreateEventModal = function () {
  createEventModal.classList.remove("show");
};

window.scrollToEvents = function () {
  document
    .getElementById("eventsSection")
    .scrollIntoView({ behavior: "smooth" });
};

window.filterEvents = function () {
  loadEvents(); // Recarrega os eventos com os filtros aplicados
};

window.clearFilters = function () {
  categoryFilter.value = "";
  searchInput.value = "";
  loadEvents(); // Recarrega todos os eventos
  showAlert("Filtros limpos!", "info");
};

window.toggleView = function (view) {
  if (view === "grid") {
    eventsGrid.style.display = "grid";
    eventsList.style.display = "none";
    gridViewBtn.classList.add("btn-secondary");
    gridViewBtn.classList.remove("btn-outline");
    listViewBtn.classList.remove("btn-secondary");
    listViewBtn.classList.add("btn-outline");
  } else {
    // 'list'
    eventsGrid.style.display = "none";
    eventsList.style.display = "flex";
    listViewBtn.classList.add("btn-secondary");
    listViewBtn.classList.remove("btn-outline");
    gridViewBtn.classList.remove("btn-secondary");
    gridViewBtn.classList.add("btn-outline");
  }
  currentView = view;
};

window.openEventModal = async function (eventId) {
  selectedEventId = eventId;
  try {
    const event = await getEventById(eventId);
    if (event) {
      modalEventTitle.textContent = event.title;
      modalEventDate.textContent =
        new Date(event.date).toLocaleDateString("pt-BR", {
          dateStyle: "long",
        }) +
        " " +
        new Date(event.date).toLocaleTimeString("pt-BR", {
          timeStyle: "short",
        });
      modalEventLocation.textContent = event.location;
      modalEventCategory.textContent =
        event.category.charAt(0).toUpperCase() + event.category.slice(1);
      modalEventDescription.textContent = event.description;
      modalEventParticipants.textContent = event.currentParticipants || 0;
      modalEventMaxParticipants.textContent = event.maxParticipants;

      if (event.imageUrl) {
        modalEventImage.src = event.imageUrl;
        modalEventImage.style.display = "block";
      } else {
        modalEventImage.style.display = "none";
      }

      // A lógica de inscrição (botão "Inscrever-se") ainda pode depender de login
      if (auth.currentUser) {
        registerEventBtn.style.display = "inline-flex";
        if (event.currentParticipants >= event.maxParticipants) {
          registerEventBtn.disabled = true;
          registerEventBtn.textContent = "Lotado";
          registerEventBtn.classList.remove("btn-primary");
          registerEventBtn.classList.add("btn-secondary");
        } else {
          registerEventBtn.disabled = false;
          registerEventBtn.innerHTML =
            '<i class="fas fa-user-plus"></i> Inscrever-se';
          registerEventBtn.classList.add("btn-primary");
          registerEventBtn.classList.remove("btn-secondary");
        }
      } else {
        registerEventBtn.style.display = "none"; // Esconde o botão se não estiver logado
      }

      eventModal.classList.add("show");
    } else {
      showAlert("Evento não encontrado.", "error");
    }
  } catch (error) {
    console.error("Erro ao abrir modal do evento:", error);
    showAlert("Não foi possível carregar os detalhes do evento.", "error");
  }
};

window.closeEventModal = function () {
  eventModal.classList.remove("show");
  selectedEventId = null;
};

// --- Funções de Lógica de Negócios (integração com event-service) ---

window.createEvent = async function () {
  const title = document.getElementById("eventTitle").value;
  const description = document.getElementById("eventDescription").value;
  // O valor do input datetime-local já vem no formato ISO string
  const date = document.getElementById("eventDate").value;
  const category = document.getElementById("eventCategory").value;
  const location = document.getElementById("eventLocation").value;
  const maxParticipants = parseInt(
    document.getElementById("eventMaxParticipants").value,
    10
  );
  const imageUrl = document.getElementById("eventImageUrl").value;

  if (
    !title ||
    !description ||
    !date ||
    !category ||
    !location ||
    !maxParticipants
  ) {
    showAlert("Por favor, preencha todos os campos obrigatórios.", "error");
    return;
  }
  if (isNaN(maxParticipants) || maxParticipants <= 0) {
    showAlert("Máximo de participantes deve ser um número positivo.", "error");
    return;
  }

  const eventData = {
    title,
    description,
    date, // Salva como string ISO para fácil manipulação no Firestore
    category,
    location,
    maxParticipants,
    imageUrl: imageUrl || null, // Se vazio, salva como null
    createdBy: auth.currentUser ? auth.currentUser.uid : "anonymous", // Associa ao usuário logado ou "anonymous"
  };

  try {
    await createNewEvent(eventData);
    showAlert("Evento criado com sucesso!", "success");
    closeCreateEventModal();
    loadEvents(); // Recarrega a lista de eventos para exibir o novo
  } catch (error) {
    console.error("Erro ao criar evento:", error);
    showAlert("Erro ao criar evento. Tente novamente.", "error");
  }
};

window.registerForEvent = async function () {
  if (!selectedEventId) {
    showAlert("Nenhum evento selecionado para inscrição.", "error");
    return;
  }

  if (!auth.currentUser) {
    // Redirecionar para o login ou mostrar mensagem
    showAlert(
      "Você precisa estar logado para se inscrever em um evento.",
      "info"
    );
    // Opcional: Redirecionar para a página de login
    // window.location.href = '/AgilePop.Web/login.html';
    return;
  }

  const userId = auth.currentUser.uid;
  const userName = auth.currentUser.displayName || auth.currentUser.email; // Ou pedir nome no formulário
  const userEmail = auth.currentUser.email;

  try {
    await registerUserForEvent(selectedEventId, userId, userName, userEmail);
    showAlert("Inscrição realizada com sucesso!", "success");
    closeEventModal();
    loadEvents(); // Recarrega eventos para atualizar contagem de participantes, se implementado
  } catch (error) {
    console.error("Erro ao se inscrever no evento:", error);
    showAlert(
      "Erro ao se inscrever no evento. Verifique se você já está inscrito ou se o evento está lotado.",
      "error"
    );
  }
};

// --- Lógica de Autenticação (Firebase Auth) ---

onAuthStateChanged(auth, (user) => {
  if (user) {
    // Usuário logado
    loginLink.style.display = "none";
    logoutLink.style.display = "block";
    myEventsLink.style.display = "block";
    // createEventBtnHero.style.display = 'inline-flex'; // Mantido visível por padrão
    // TODO: Verificar se é admin para mostrar o link "Admin"
    // Ex: if (user.email === 'admin@agilepop.com') { adminLink.style.display = 'block'; }
    showAlert(`Bem-vindo, ${user.displayName || user.email}!`, "success");
  } else {
    // Usuário deslogado
    loginLink.style.display = "block";
    logoutLink.style.display = "none";
    myEventsLink.style.display = "none";
    adminLink.style.display = "none";
    // createEventBtnHero.style.display = 'none'; // Mantido visível por padrão
  }
  // Garante que o botão "Criar Evento" esteja sempre visível
  createEventBtnHero.style.display = "inline-flex";
});

window.logout = async function () {
  try {
    await signOut(auth);
    showAlert("Você saiu da sua conta.", "info");
    // O onAuthStateChanged vai lidar com a atualização da UI
  } catch (error) {
    console.error("Erro ao fazer logout:", error);
    showAlert("Erro ao sair. Tente novamente.", "error");
  }
};

// --- Inicialização da Página ---
document.addEventListener("DOMContentLoaded", () => {
  loadEvents(); // Carrega os eventos ao iniciar a página
  toggleView("grid"); // Define a visualização inicial como grade
});

// Adicionar event listeners para os filtros
categoryFilter.addEventListener("change", filterEvents);
// Usa 'input' para filtrar em tempo real conforme o usuário digita
searchInput.addEventListener("input", filterEvents);

// Adiciona event listeners para os cliques nos cards/itens de evento
// A função renderEvents agora adiciona os onclicks diretamente
