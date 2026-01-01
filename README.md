# Turtle Ki 🐢⚡ (Repo simple / Next.js PWA)

App gamificada estilo **Escuela de la Tortuga** (inspiración DBZ) para construir hábito:
- **KI total** = nivel / progreso permanente
- **Transformaciones** por KI (Normal → UI Dominado)
- **Misiones diarias** + **streak** con bonus semanal
- **Entrenamiento diario** generado por plantillas con desbloqueo por KI
- **Offline-first** (IndexedDB con Dexie)
- **PWA** (instalable en móvil / desktop)

> Nota: Este proyecto no usa material con copyright (logos/arte). Todo es original.

## Requisitos
- Node 18+ (recomendado 20)
- npm

## Correr en local
```bash
npm install
npm run dev
```

Luego abre http://localhost:3000

## Build
```bash
npm run build
npm run start
```

## Estructura
- `src/app/*` rutas (App Router)
- `src/lib/game/*` reglas (KI, transformaciones, quests, workouts)
- `src/lib/db/*` almacenamiento (Dexie)
- `src/lib/store/*` acciones + hooks para UI
- `public/` manifest, icons, offline page

## Seguridad / Salud
La app está pensada como guía general y gamificación.
**No es consejo médico**. Ajusta intensidades, cuida técnica, y consulta a un profesional si tienes dolor,
lesiones o condiciones médicas.

## Roadmap corto
- [ ] Sync multi-dispositivo (Supabase/Firebase)
- [ ] Notificaciones de recordatorio (PWA push/local)
- [ ] Modos avanzados (EMOM/Tabata)
- [ ] Export/Import mejorado
