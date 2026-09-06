# DataLens What-If — despliegue en Vercel

## Estructura requerida
```
/
├── index.html
└── api/
    └── ai-proxy.js
```

Subí AMBOS a Vercel (la carpeta `api/` completa, no solo el HTML). Vercel detecta
automáticamente cualquier archivo en `api/` como función serverless — no necesita
configuración adicional ni `package.json`.

## Por qué el proxy
Los proveedores de IA en la nube (Anthropic, NVIDIA NIM, Gemini, endpoints
OpenAI-compatible) bloquean llamadas `fetch` hechas directamente desde el
navegador por política CORS. `api/ai-proxy.js` hace esa llamada del lado del
servidor (Vercel Functions), donde no aplica esa restricción, y el navegador
solo llama a tu propio dominio (`/api/ai-proxy`).

Ollama es la excepción: corre en tu máquina local, así que el navegador lo
llama directo por red local (asegurate de correrlo con CORS habilitado).

## Redeploy
1. Reemplazá tu `index.html` actual por el de esta carpeta.
2. Agregá la carpeta `api/` en la raíz del proyecto (mismo nivel que `index.html`).
3. Redeploy en Vercel. La función quedará disponible en `https://tu-dominio.vercel.app/api/ai-proxy`.
4. Probá "Configurar IA" → elegí proveedor → "Probar conexión".
