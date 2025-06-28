import { db } from "./firebase-config.js";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  getDoc,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const eventsCollectionRef = collection(db, "events");
const registrationsCollectionRef = collection(db, "registrations");

// Função para buscar todos os eventos (com filtros opcionais)
export async function getEvents(category = "", search = "") {
  try {
    let eventsQuery = eventsCollectionRef;

    // Adiciona filtros se existirem
    if (category) {
      eventsQuery = query(eventsQuery, where("category", "==", category));
    }
    if (search) {
      // Firestore não suporta busca "like" nativa para texto completo.
      // Para buscas mais complexas, você precisaria de uma solução como Algolia ou fazer o filtro no frontend.
      // Por simplicidade, faremos um filtro básico por "title" no frontend se search for usado.
      // Para backend, você precisaria de uma consulta mais avançada ou indexação de texto completo.
      console.warn(
        "A busca por texto no Firestore para 'search' requer uma implementação mais avançada (e.g., Algolia) ou filtro manual no frontend."
      );
    }

    const querySnapshot = await getDocs(eventsQuery);
    let events = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Se houver termo de busca, filtra no frontend (menos eficiente para grandes datasets)
    if (search) {
      const searchTermLower = search.toLowerCase();
      events = events.filter(
        (event) =>
          event.title.toLowerCase().includes(searchTermLower) ||
          event.description.toLowerCase().includes(searchTermLower) ||
          event.location.toLowerCase().includes(searchTermLower)
      );
    }

    return events;
  } catch (error) {
    console.error("Erro ao buscar eventos:", error);
    throw error;
  }
}

// Função para obter detalhes de um evento específico
export async function getEventById(id) {
  try {
    const eventDocRef = doc(db, "events", id);
    const eventDocSnap = await getDoc(eventDocRef);
    if (eventDocSnap.exists()) {
      return { id: eventDocSnap.id, ...eventDocSnap.data() };
    } else {
      console.log("Nenhum evento encontrado com este ID!");
      return null;
    }
  } catch (error) {
    console.error("Erro ao buscar evento por ID:", error);
    throw error;
  }
}

// Função para criar um novo evento
export async function createNewEvent(eventData) {
  try {
    // Adiciona o campo de participantes atuais (começa com 0)
    const eventWithParticipants = {
      ...eventData,
      currentParticipants: 0,
      createdAt: new Date(), // Adiciona um timestamp
    };
    const docRef = await addDoc(eventsCollectionRef, eventWithParticipants);
    console.log("Evento criado com ID: ", docRef.id);
    return { id: docRef.id, ...eventWithParticipants };
  } catch (error) {
    console.error("Erro ao criar evento:", error);
    throw error;
  }
}

// Função para registrar um usuário em um evento
export async function registerUserForEvent(
  eventId,
  userId,
  userName,
  userEmail
) {
  try {
    // TODO: Adicionar lógica para verificar se o evento não está lotado antes de registrar
    // Isso envolveria transações no Firestore para garantir a integridade dos dados de participantes.
    const registrationData = {
      eventId: eventId,
      userId: userId, // Pode ser o UID do Firebase Auth, ou um ID anônimo
      userName: userName,
      userEmail: userEmail,
      registrationDate: new Date(),
    };
    const docRef = await addDoc(registrationsCollectionRef, registrationData);
    console.log("Inscrição realizada com sucesso: ", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Erro ao registrar usuário para evento:", error);
    throw error;
  }
}

// TODO: Funções para editarEvent, deleteEvent, getRegistrationsByEvent
