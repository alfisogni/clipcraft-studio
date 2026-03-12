# Clip Flow Studio

Una herramienta para crear clips virales de videos largos, optimizados para redes sociales con IA.

![Clip Flow Studio](public/LogoClipFLow.png)

## 💰 100% GRATUITO

⚠️ **Este proyecto NO requiere pagar nada:**
- ✅ Supabase (Free Tier): 50,000 usuarios
- ✅ Vercel (Free Tier): Hosting ilimitado
- ✅ Google OAuth: Gratis
- ✅ IA para títulos: Mock data automático (sin necesidad de OpenAI)

**Total para empezar: $0** 🎉

## 🚀 Características

- ✨ Sube videos y genera clips automáticamente
- 🤖 Títulos y descripciones generados con IA
- 📱 Formatos optimizados para Reels, TikTok, Shorts y YouTube
- 🔐 Autenticación con Google OAuth y email/contraseña
- ☁️ Backend con Supabase

## 🛠️ Tecnologías

- **Frontend**: React + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (Auth + Database)
- **IA**: OpenAI (opcional, con fallback mock gratuito)
- **Deploy**: Vercel

## 📦 Instalación

```bash
# Clonar el repositorio
git clone https://github.com/alfisogni/clipcraft-studio.git
cd clipcraft-studio

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Edita .env con tus credenciales de Supabase
```

## ⚙️ Configuración

### Variables de Entorno

Tu archivo `.env` ya está configurado con las credenciales de Supabase.

### Deploy en Vercel

Para instrucciones paso a paso de deploy:
**👉 [DEPLOY.md](./DEPLOY.md)**

Este archivo incluye:
- ✅ Cómo conectar con Vercel
- ✅ Qué variables de entorno añadir
- ✅ Cómo actualizar URLs en Supabase
- ✅ Troubleshooting común

## 🚀 Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build

# Previsualizar build de producción
npm run preview

# Ejecutar tests
npm run test
```

## 📁 Estructura del Proyecto

```
clipcraft-studio/
├── public/              # Assets estáticos
├── src/
│   ├── components/      # Componentes React
│   ├── hooks/          # Custom hooks (useAuth, useProjects)
│   ├── integrations/   # Supabase client
│   ├── lib/            # Utilidades
│   ├── pages/          # Páginas principales (Auth, Index, NotFound)
│   └── types/          # TypeScript types
├── supabase/
│   ├── functions/      # Supabase Edge Functions
│   └── migrations/     # Database migrations
└── ...
```

## 🌐 Deploy en Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar
vercel --prod
```

O conecta tu repositorio de GitHub con Vercel para deploy automático.

## 🔐 Autenticación

El proyecto usa autenticación por **email/contraseña** con Supabase.

- ✅ **Registro**: Crea cuenta con email y contraseña
- ✅ **Login**: Inicia sesión con tus credenciales
- ✅ **100% funcional**: No requiere configuración adicional

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto es privado.

## 👤 Autor

**alfisogni**
- GitHub: [@alfisogni](https://github.com/alfisogni)

---

Hecho con ❤️ para creadores de contenido

