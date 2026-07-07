# ClipCraft Studio

Herramienta open source para crear clips virales a partir de videos largos, optimizados para redes sociales con ayuda de IA.

![ClipCraft Studio](public/LogoClipFLow.png)

## ✨ Características

- 🎬 Sube videos y genera clips automáticamente
- 🤖 Títulos y descripciones sugeridos por IA
- 📱 Formatos optimizados para Reels, TikTok, Shorts y YouTube
- 🔐 Autenticación por email/contraseña con Supabase Auth
- ☁️ Backend serverless con Supabase (DB + Edge Functions)
- 🎭 Modo demo sin necesidad de cuenta

## 🛠️ Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| UI | Tailwind CSS + shadcn/ui |
| Backend | Supabase (Auth + PostgreSQL + Edge Functions) |
| Tests | Vitest |
| Deploy | Vercel |

## 💰 Costo para empezar: $0

- ✅ Supabase Free Tier (50 000 usuarios activos/mes)
- ✅ Vercel Free Tier (hosting ilimitado)
- ✅ IA con datos mock incluidos (OpenAI es opcional)

## 📦 Instalación local

```bash
# 1. Clonar el repositorio
git clone https://github.com/alfisogni/clipcraft-studio.git
cd clipcraft-studio

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Edita .env con tus credenciales de Supabase (ver sección de configuración)

# 4. Iniciar servidor de desarrollo
npm run dev
```

## ⚙️ Configuración

### Variables de entorno

Copia `.env.example` a `.env` y completa los valores:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=tu_publishable_key
VITE_SUPABASE_ANON_KEY=tu_anon_key

# Opcional: para IA generativa avanzada (sin esto usa mock data)
# OPENAI_API_KEY=sk-...
```

Obtén tus keys en [supabase.com](https://supabase.com) → tu proyecto → **Settings → API**.

> ⚠️ **Nunca comitees el archivo `.env`**. Ya está en `.gitignore`.

### Base de datos

Aplica las migraciones incluidas desde el dashboard de Supabase o con la CLI:

```bash
supabase db push
```

## 🚀 Scripts disponibles

```bash
npm run dev       # Servidor de desarrollo
npm run build     # Compilar para producción
npm run preview   # Previsualizar el build
npm run test      # Ejecutar tests con Vitest
```

## 🌐 Deploy en Vercel

1. Importa el repositorio en [vercel.com](https://vercel.com)
2. Agrega las variables de entorno en **Settings → Environment Variables**
3. Vercel detecta Vite automáticamente — sin configuración extra

## 📁 Estructura del proyecto

```
clipcraft-studio/
├── public/                  # Assets estáticos
├── src/
│   ├── components/          # Componentes React (UI + domain)
│   │   └── ui/              # Componentes base de shadcn/ui
│   ├── contexts/            # React contexts (demo mode, etc.)
│   ├── hooks/               # Custom hooks (useAuth, useProjects)
│   ├── integrations/        # Clientes de servicios externos
│   │   └── supabase/        # Cliente y tipos de Supabase
│   ├── lib/                 # Utilidades y mock data
│   ├── pages/               # Páginas (Auth, Index, NotFound)
│   └── types/               # Tipos TypeScript globales
├── supabase/
│   ├── functions/           # Edge Functions de Supabase
│   └── migrations/          # Migraciones SQL
└── ...
```

## 🔐 Seguridad

- Las variables de entorno del frontend (`VITE_*`) son públicas por diseño de Vite/Supabase — están protegidas por las **Row Level Security (RLS)** policies de la base de datos.
- Los secretos del servidor (OpenAI, etc.) se manejan como **Supabase Secrets** en las Edge Functions y nunca se exponen al cliente.
- Revisa las policies de RLS en las migraciones antes de hacer deploy a producción.

## 🤝 Contribuir

Las contribuciones son bienvenidas.

1. Haz un fork del proyecto
2. Crea tu rama: `git checkout -b feature/mi-feature`
3. Commitea tus cambios: `git commit -m 'feat: descripción breve'`
4. Push: `git push origin feature/mi-feature`
5. Abre un Pull Request

## 📝 Licencia

MIT — ver [LICENSE](./LICENSE) para más detalles.

## 👤 Autor

**Luca Fisogni** ([@alfisogni](https://github.com/alfisogni))

---

Hecho con ❤️ para creadores de contenido

