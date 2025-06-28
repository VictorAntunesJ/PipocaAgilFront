// Importar os módulos necessários do Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

// Suas credenciais de configuração do Firebase
// ATENÇÃO: Substitua os valores abaixo pelos do SEU projeto Firebase!
const firebaseConfig = {
    apiKey: "SUA_API_KEY",
    authDomain: "SEU_AUTH_DOMAIN",
    projectId: "SEU_PROJECT_ID",
    storageBucket: "SEU_STORAGE_BUCKET",
    messagingSenderId: "SEU_MESSAGING_SENDER_ID",
    appId: "SEU_APP_ID"
};

// Inicializar o Firebase
const app = initializeApp(firebaseConfig);

// Obter instâncias dos serviços que você vai usar
export const db = getFirestore(app);
export const auth = getAuth(app);

// Você pode adicionar um console.log para verificar se a inicialização ocorreu
console.log("Firebase inicializado!");