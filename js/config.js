// ============================================
// CONFIG - Configuración de Firebase Realtime Database
// Asistencia 3D - Logos Academy
// ============================================
//
// IMPORTANTE: Para activar la persistencia en la nube, reemplaza los
// valores de abajo con los de tu proyecto Firebase (Realtime Database).
// La config web es PÚBLICA por diseño (no es un secreto).
//
// Cómo obtenerla:
//   1. Ve a https://console.firebase.google.com
//   2. Crea o selecciona tu proyecto
//   3. Build > Realtime Database > Crear base de datos
//   4. Configuración del proyecto > Tus apps > App web (</>)
//   5. Copia el objeto firebaseConfig
//
// Mientras no configures Firebase, la app funciona en MODO LOCAL
// (guarda en localStorage del navegador) para que puedas probarla.

const FIREBASE_CONFIG = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROYECTO.firebaseapp.com",
  databaseURL: "https://TU_PROYECTO-default-rtdb.firebaseio.com",
  projectId: "TU_PROYECTO",
  storageBucket: "TU_PROYECTO.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID"
};

// Ruta raíz en la Realtime Database donde se guarda la asistencia
const FB_PATH = 'asistencia_3d';

// ¿Firebase está configurado? (true cuando el usuario puso sus credenciales)
const FIREBASE_CONFIGURED = FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.apiKey !== 'TU_API_KEY';

// Exportar para uso en el navegador
if (typeof window !== 'undefined') {
  window.FIREBASE_CONFIG = FIREBASE_CONFIG;
  window.FB_PATH = FB_PATH;
  window.FIREBASE_CONFIGURED = FIREBASE_CONFIGURED;
}
