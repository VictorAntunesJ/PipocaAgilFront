// assets/script-mock.js

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

// NOVO: Container para o vídeo do YouTube no modal de detalhes
const modalEventVideoContainer = document.getElementById(
  "modalEventVideoContainer"
);

const createEventModal = document.getElementById("createEventModal");
const createEventForm = document.getElementById("createEventForm");

// Campos do formulário de criação/edição
const eventTitleInput = document.getElementById("eventTitle");
const eventDescriptionInput = document.getElementById("eventDescription");
const eventDateInput = document.getElementById("eventDate");
const eventCategoryInput = document.getElementById("eventCategory");
const eventLocationInput = document.getElementById("eventLocation");
const eventMaxParticipantsInput = document.getElementById(
  "eventMaxParticipants"
);
const eventImageUrlInput = document.getElementById("eventImageUrl"); // Agora também para URLs de vídeo

// Elementos de navegação (alguns não serão usados/exibidos, mas mantemos o ID no HTML)
const loginLink = document.getElementById("loginLink");
const logoutLink = document.getElementById("logoutLink");
const myEventsLink = document.getElementById("myEventsLink");
const adminLink = document.getElementById("adminLink");
const createEventBtnHero = document.getElementById("createEventBtn"); // Botão "Criar Evento" na hero section

let currentEvents = []; // **Armazenamento de eventos mockados (Array principal)**
let currentView = "grid"; // Estado da visualização
let selectedEventId = null; // ID do evento atualmente visualizado no modal
let editingEventId = null; // ID do evento que está sendo editado (null se for nova criação)

// --- Dados Iniciais FAKE para demonstração ---
const initialFakeEvents = [
  {
    id: "fake-event-1",
    title: "Workshop: Introdução ao React",
    description:
      "Aprenda os fundamentos do React.js e comece a construir interfaces de usuário modernas.",
    date: "2025-07-20T14:00",
    category: "tecnologia",
    location: "Online",
    maxParticipants: 50,
    currentParticipants: 15,
    imageUrl: "../img/1.png",
  },
  {
    id: "fake-event-2",
    title: "Agile Summit 2025",
    description:
      "Conferência anual sobre metodologias ágeis, com palestrantes renomados e estudos de caso.",
    date: "2025-08-05T09:30",
    category: "gestao",
    location: "Centro de Convenções Tech",
    maxParticipants: 200,
    currentParticipants: 120,
    imageUrl: "../img/2.png",
  },
  {
    id: "fake-event-3",
    title: "Design Thinking para Iniciantes",
    description:
      "Um workshop prático para aplicar o Design Thinking na resolução de problemas complexos.",
    date: "2025-09-10T18:00",
    category: "design",
    location: "Coworking Criativo",
    maxParticipants: 30,
    currentParticipants: 25,
    // Exemplo de URL de vídeo do YouTube
    imageUrl: "../img/3.png", // Exemplo: Rick Astley - Never Gonna Give You Up
  },
  {
    id: "fake-event-4",
    title: "Marketing Digital na Era da IA",
    description:
      "Descubra como a Inteligência Artificial está transformando as estratégias de marketing digital.",
    date: "2025-10-01T10:00",
    category: "marketing",
    location: "Online",
    maxParticipants: 100,
    currentParticipants: 80,
    imageUrl: "../img/4.png",
  },
];

// Carrega os eventos fake na inicialização (simula um banco de dados)
currentEvents = [...initialFakeEvents]; // Cria uma cópia para poder modificá-la

// --- Funções de UI (MOCKADAS) ---

/**
 * Exibe mensagens de alerta para o usuário.
 * @param {string} message - A mensagem a ser exibida.
 * @param {'success'|'error'|'info'} type - O tipo de alerta.
 */
window.showAlert = function (message, type) {
  const alertContainer = document.getElementById("alertContainer");
  if (!alertContainer) {
    console.error("Elemento #alertContainer não encontrado!");
    alert(`${type.toUpperCase()}: ${message}`);
    return;
  }
  const alertDiv = document.createElement("div");
  alertDiv.classList.add("alert", `alert-${type}`);
  alertDiv.innerHTML = `<i class="fas ${
    type === "success"
      ? "fa-check-circle"
      : type === "error"
      ? "fa-times-circle"
      : "fa-info-circle"
  }"></i> ${message}`;
  alertContainer.prepend(alertDiv);

  setTimeout(() => {
    alertDiv.style.opacity = "0";
    alertDiv.style.transform = "translateY(-10px)";
    alertDiv.addEventListener("transitionend", () => alertDiv.remove());
  }, 5000);
};

/**
 * Renderiza os eventos na grade ou lista.
 * @param {Array} events - Array de objetos de evento.
 */
function renderEvents(events) {
  eventsGrid.innerHTML = "";
  eventsList.innerHTML = "";

  const filteredEvents = filterAndSearchEvents(events);

  if (filteredEvents.length === 0) {
    noEventsMessage.style.display = "block";
    loadingEvents.style.display = "none";
    eventsGrid.style.display = "none";
    eventsList.style.display = "none";
    return;
  }

  noEventsMessage.style.display = "none";
  loadingEvents.style.display = "none";

  filteredEvents.forEach((event) => {
    // Card para visualização em grade
    const gridCard = document.createElement("div");
    gridCard.classList.add("event-card");
    gridCard.setAttribute("data-id", event.id);
    gridCard.innerHTML = `
                <img src="${
                  event.imageUrl && !getYouTubeVideoId(event.imageUrl) // Mostra imagem apenas se não for vídeo
                    ? event.imageUrl
                    : "https://via.placeholder.com/400x200?text=AgilePop+Evento"
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
                    <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); editEvent('${
                      event.id
                    }')">Editar</button>
                    <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); publishEvent('${
                      event.id
                    }')">Publicar</button>
                    <button class="btn btn-outline btn-sm" style="color: red; border-color: red;" onclick="event.stopPropagation(); deleteEvent('${
                      event.id
                    }')">Deletar</button>
                </div>
        `;
    eventsGrid.appendChild(gridCard);

    // Item para visualização em lista
    const listItem = document.createElement("div");
    listItem.classList.add("event-list-item");
    listItem.setAttribute("data-id", event.id);
    listItem.innerHTML = `
                <img src="${
                  event.imageUrl && !getYouTubeVideoId(event.imageUrl) // Mostra imagem apenas se não for vídeo
                    ? event.imageUrl
                    : "https://via.placeholder.com/150x100?text=AgilePop"
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
                    <div class="flex gap-2 mt-2">
                        <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); openEventModal('${
                          event.id
                        }')">Ver Detalhes</button>
                        <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); editEvent('${
                          event.id
                        }')">Editar</button>
                        <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); publishEvent('${
                          event.id
                        }')">Publicar</button>
                        <button class="btn btn-outline btn-sm" style="color: red; border-color: red;" onclick="event.stopPropagation(); deleteEvent('${
                          event.id
                        }')">Deletar</button>
                    </div>
                </div>
        `;
    eventsList.appendChild(listItem);
  });

  toggleView(currentView);
}

/**
 * Filtra e busca eventos do array global `currentEvents`.
 */
function filterAndSearchEvents(eventsToFilter) {
  const selectedCategory = categoryFilter.value;
  const searchTerm = searchInput.value.toLowerCase();

  return eventsToFilter.filter((event) => {
    const matchesCategory =
      selectedCategory === "" || event.category === selectedCategory;
    const matchesSearch =
      searchTerm === "" ||
      event.title.toLowerCase().includes(searchTerm) ||
      event.description.toLowerCase().includes(searchTerm) ||
      event.location.toLowerCase().includes(searchTerm);
    return matchesCategory && matchesSearch;
  });
}

/**
 * Carrega e exibe os eventos do array mockado.
 */
window.loadEvents = function () {
  loadingEvents.style.display = "block";
  eventsGrid.style.display = "none";
  eventsList.style.display = "none";
  noEventsMessage.style.display = "none";

  setTimeout(() => {
    renderEvents(currentEvents);
  }, 500);
};

// --- Funções de Eventos da UI (MOCKADAS) ---

window.criarEvento = function () {
  createEventForm.reset();
  editingEventId = null;
  document.querySelector("#createEventModal .modal-header h3").textContent =
    "Criar Novo Evento";
  document.querySelector(
    "#createEventModal .modal-footer .btn-primary"
  ).textContent = "Criar Evento";
  createEventModal.classList.add("show");
};

window.closeCreateEventModal = function () {
  createEventModal.classList.remove("show");
  editingEventId = null;
};

window.scrollToEvents = function () {
  document
    .getElementById("eventsSection")
    .scrollIntoView({ behavior: "smooth" });
};

window.filterEvents = function () {
  loadEvents();
};

window.clearFilters = function () {
  categoryFilter.value = "";
  searchInput.value = "";
  loadEvents();
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

/**
 * Função auxiliar para extrair o ID do vídeo do YouTube de uma URL.
 * Retorna o ID do vídeo ou null se a URL não for de um vídeo válido do YouTube.
 */
function getYouTubeVideoId(url) {
  if (!url) return null;
  const regExp =
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regExp);
  return match && match[1] ? match[1] : null;
}

window.openEventModal = function (eventId) {
  selectedEventId = eventId;
  const event = currentEvents.find((e) => e.id === eventId);
  if (event) {
    modalEventTitle.textContent = event.title;
    modalEventDate.textContent =
      new Date(event.date).toLocaleDateString("pt-BR", { dateStyle: "long" }) +
      " " +
      new Date(event.date).toLocaleTimeString("pt-BR", { timeStyle: "short" });
    modalEventLocation.textContent = event.location;
    modalEventCategory.textContent =
      event.category.charAt(0).toUpperCase() + event.category.slice(1);
    modalEventDescription.textContent = event.description;
    modalEventParticipants.textContent = event.currentParticipants || 0;
    modalEventMaxParticipants.textContent = event.maxParticipants;

    const videoId = getYouTubeVideoId(event.imageUrl || "");

    if (videoId) {
      modalEventVideoContainer.innerHTML = `
                <iframe
                    width="100%"
                    height="315"
                    src="https://www.youtube.com/embed/${videoId}"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen
                ></iframe>
            `;
      modalEventVideoContainer.style.display = "block";
      modalEventImage.style.display = "none";
      modalEventImage.src = ""; // Limpa a src da imagem
    } else if (event.imageUrl) {
      modalEventImage.src = event.imageUrl;
      modalEventImage.style.display = "block";
      modalEventVideoContainer.style.display = "none";
      modalEventVideoContainer.innerHTML = ""; // Limpa o iframe anterior
    } else {
      modalEventImage.style.display = "none";
      modalEventImage.src = "";
      modalEventVideoContainer.style.display = "none";
      modalEventVideoContainer.innerHTML = "";
    }

    if (registerEventBtn) {
      registerEventBtn.style.display = "none";
    }

    eventModal.classList.add("show");
  } else {
    showAlert("Evento não encontrado.", "error");
  }
};

window.closeEventModal = function () {
  eventModal.classList.remove("show");
  selectedEventId = null;
  // Parar o vídeo do YouTube quando o modal é fechado, se houver um
  if (modalEventVideoContainer) {
    modalEventVideoContainer.innerHTML = "";
  }
};

// --- Funções de Lógica de Negócios (MOCKADAS) ---

// RENOMEADO DE 'createEvent' para 'salvarEvento' para evitar conflito com funções nativas do DOM
window.salvarEvento = function () {
  console.log("Função salvarEvento() chamada!"); // Para depuração

  const title = eventTitleInput.value;
  const description = eventDescriptionInput.value;
  const date = eventDateInput.value;
  const category = eventCategoryInput.value;
  const location = eventLocationInput.value;
  const maxParticipants = parseInt(eventMaxParticipantsInput.value, 10);
  const imageUrl = eventImageUrlInput.value;

  if (
    !title ||
    !description ||
    !date ||
    !category ||
    !location ||
    isNaN(maxParticipants) ||
    maxParticipants <= 0
  ) {
    showAlert(
      "Por favor, preencha todos os campos obrigatórios corretamente.",
      "error"
    );
    return;
  }

  if (editingEventId) {
    // Lógica de Edição de Evento
    const eventIndex = currentEvents.findIndex((e) => e.id === editingEventId);
    if (eventIndex !== -1) {
      currentEvents[eventIndex] = {
        ...currentEvents[eventIndex],
        title,
        description,
        date,
        category,
        location,
        maxParticipants,
        imageUrl: imageUrl || null,
      };
      showAlert("Evento alterado com sucesso!", "success");
    } else {
      showAlert("Erro ao editar evento: Evento não encontrado.", "error");
    }
  } else {
    // Lógica de Criação de Evento
    const newId = "fake-" + Date.now();
    const newEvent = {
      id: newId,
      title,
      description,
      date,
      category,
      location,
      maxParticipants,
      currentParticipants: 0,
      imageUrl: imageUrl || null,
    };
    currentEvents.push(newEvent);
    showAlert("Evento criado com sucesso!", "success");
  }

  closeCreateEventModal();
  loadEvents();
};

window.editEvent = function (eventId) {
  const eventToEdit = currentEvents.find((e) => e.id === eventId);
  if (eventToEdit) {
    editingEventId = eventId;
    eventTitleInput.value = eventToEdit.title;
    eventDescriptionInput.value = eventToEdit.description;
    eventDateInput.value = eventToEdit.date;
    eventCategoryInput.value = eventToEdit.category;
    eventLocationInput.value = eventToEdit.location;
    eventMaxParticipantsInput.value = eventToEdit.maxParticipants;
    eventImageUrlInput.value = eventToEdit.imageUrl || "";

    document.querySelector("#createEventModal .modal-header h3").textContent =
      "Editar Evento";
    document.querySelector(
      "#createEventModal .modal-footer .btn-primary"
    ).textContent = "Salvar Alterações";
    createEventModal.classList.add("show");
  } else {
    showAlert("Erro: Evento não encontrado para edição.", "error");
  }
};

window.publishEvent = function (eventId) {
  const event = currentEvents.find((e) => e.id === eventId);
  if (event) {
    showAlert(
      `O evento "${event.title}" foi publicado com sucesso! (Apenas simulação)`,
      "success"
    );
  } else {
    showAlert("Erro: Evento não encontrado para publicação.", "error");
  }
};

window.deleteEvent = function (eventId) {
  const eventIndex = currentEvents.findIndex((e) => e.id === eventId);
  if (eventIndex !== -1) {
    const eventTitle = currentEvents[eventIndex].title;
    currentEvents.splice(eventIndex, 1);
    loadEvents();
    showAlert(`O evento "${eventTitle}" foi excluído com sucesso!`, "success");
  } else {
    showAlert("Erro: Evento não encontrado para exclusão.", "error");
  }
};

// Não precisamos de registerForEvent nem logout nesta versão mockada
window.registerForEvent = function () {
  showAlert(
    "Inscrição simulada com sucesso! (Funcionalidade não completa)",
    "info"
  );
};

// --- Ajustes de UI para o mock ---
if (createEventBtnHero) {
  createEventBtnHero.style.display = "inline-flex";
}
if (loginLink) loginLink.style.display = "block";
if (logoutLink) logoutLink.style.display = "none";
if (myEventsLink) myEventsLink.style.display = "none";
if (adminLink) adminLink.style.display = "none";

// --- Inicialização da Página ---
document.addEventListener("DOMContentLoaded", () => {
  loadEvents();
  toggleView("grid");
});

// Adicionar event listeners para os filtros
categoryFilter.addEventListener("change", filterEvents);
searchInput.addEventListener("input", filterEvents);
