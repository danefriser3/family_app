# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

# Dashboard Gestionale - Family App

Una dashboard moderna per gestione aziendale costruita con React, Material-UI, Tailwind CSS e Vite.

## 🚀 Tecnologie Utilizzate

- **React 18** con TypeScript
- **Material-UI (MUI)** per i componenti UI
- **Tailwind CSS** per lo styling
- **Vite** come build tool
- **Emotion** per CSS-in-JS

## 🎨 Caratteristiche

- ✅ Design moderno e responsive
- ✅ Sidebar di navigazione
- ✅ Header con notifiche e menu utente
- ✅ Dashboard con statistiche e grafici
- ✅ Componenti riutilizzabili
- ✅ Tema personalizzato MUI + Tailwind
- ✅ TypeScript per type safety

## 📁 Struttura del Progetto

```
src/
├── components/
│   ├── dashboard/
│   │   ├── StatCard.tsx       # Card statistiche
│   │   └── DataTable.tsx      # Tabella dati
│   └── layout/
│       ├── Header.tsx         # Barra superiore
│       ├── Sidebar.tsx        # Menu laterale
│       └── Layout.tsx         # Layout principale
├── pages/
│   └── Dashboard.tsx          # Pagina dashboard
├── theme/
│   └── theme.ts              # Tema MUI personalizzato
├── App.tsx                   # Componente principale
└── index.css                # Stili globali + Tailwind
```

## 🛠️ Installazione e Avvio

1. **Installa le dipendenze:**
   ```bash
   npm install
   ```

2. **Avvia il server di sviluppo:**
   ```bash
   npm run dev
   ```

3. **Apri il browser:**
   Vai su `http://localhost:5173`

## 📊 Sezioni della Dashboard

- **Dashboard** - Overview con statistiche principali
- **Analytics** - Grafici e analisi (in sviluppo)
- **Utenti** - Gestione utenti (in sviluppo)
- **Inventario** - Gestione prodotti (in sviluppo)
- **Report** - Report e export (in sviluppo)
- **Profilo** - Gestione profilo utente (in sviluppo)
- **Impostazioni** - Configurazioni (in sviluppo)

## 🎯 Prossimi Sviluppi

- [ ] Implementazione sezioni mancanti
- [ ] Autenticazione e autorizzazione
- [ ] Grafici interattivi con Chart.js
- [ ] Export dati in Excel/PDF
- [ ] Modalità dark/light
- [ ] Notifiche real-time
- [ ] API integration

## 🤝 Contributi

Questo è un progetto base per una dashboard gestionale. Puoi espanderlo aggiungendo:

- Nuove pagine e componenti
- Integrazione con API backend
- Autenticazione
- Gestione stato con Redux/Zustand
- Testing con Jest/Vitest

## 📝 Licenza

MIT License

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
