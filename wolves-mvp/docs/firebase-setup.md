# Configuración Firebase para WOLVES MVP

WOLVES ya incluye una capa de sincronización con Firestore. Si no configuras Firebase, la plataforma sigue funcionando en modo demo con localStorage.

## 1. Crear proyecto Firebase

1. Entra a https://console.firebase.google.com/
2. Crea un proyecto llamado `wolves-mvp` o similar.
3. Activa Firestore Database en modo producción.
4. Activa Authentication y habilita el proveedor Anonymous.
5. En Configuración del proyecto, crea una app Web y copia la configuración.

## 2. Conectar desde la página

En la página WOLVES aparecerá un botón flotante:

- `Configurar Firebase` cuando no esté conectado.
- `Firebase conectado` cuando Firestore esté activo.

Haz clic en `Configurar Firebase`, pega los campos de tu app web:

```js
apiKey
authDomain
projectId
storageBucket
messagingSenderId
appId
```

Luego recarga la página con `Ctrl + F5`.

## 3. Colección usada

La sincronización global usa:

```txt
wolvesMvpState/{correo_sanitizado}
```

Dentro se guarda el estado funcional del MVP:

```txt
usuarios
wallet
recargas
retos
alertas
citas
seguimientos
tienda
ordenes de retiro
blockchain conceptual
comunidad
auditoria
configuracion
```

Los retos también pueden usar:

```txt
users/{uid}/retos/{retoId}
```

## 4. Reglas Firestore para demo Hackathon

Estas reglas permiten que usuarios autenticados anónimos lean y escriban la demo. Úsalas solo para presentación o prototipo.

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /wolvesMvpState/{docId} {
      allow read, write: if request.auth != null;
    }

    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
      match /retos/{retoId} {
        allow read, write: if request.auth != null && request.auth.uid == uid;
      }
    }
  }
}
```

## 5. Reglas recomendadas para producción

Para una versión real institucional se debe reemplazar el acceso anónimo por cuentas reales de Firebase Auth y roles por claims o documentos protegidos.

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
      match /retos/{retoId} {
        allow read, write: if request.auth != null && request.auth.uid == uid;
      }
    }
  }
}
```

## 6. Estado actual

- Frontend funcional: sí.
- Firebase SDK integrado: sí.
- Sincronización Firestore: sí, cuando se configura Firebase.
- Modo demo sin Firebase: sí, con localStorage.
- Backend propio: no, por decisión del MVP actual.
