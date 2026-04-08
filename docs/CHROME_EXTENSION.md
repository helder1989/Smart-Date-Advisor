# Chrome Extension — Estrutura e Build

## Manifest V3

```json
{
  "manifest_version": 3,
  "name": "Smart Date Advisor — Onfly",
  "version": "1.0.0",
  "description": "Encontre as datas mais baratas para sua viagem corporativa.",
  "permissions": [
    "cookies",
    "storage",
    "activeTab"
  ],
  "host_permissions": [
    "https://*.onfly.com.br/*",
    "https://api.onfly.com.br/*"
  ],
  "action": {
    "default_popup": "popup/index.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  "background": {
    "service_worker": "background.js"
  },
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  }
}
```

## Estrutura de arquivos

```
extension/
├── manifest.json
├── background.js              # Service worker (auth token)
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── popup/
    ├── index.html
    ├── main.tsx
    ├── App.tsx
    └── components/
        ├── SearchForm.tsx     # Formulário de input
        ├── ResultCard.tsx     # Card de sugestão
        ├── SavingsBadge.tsx   # Badge de economia em destaque
        └── InsightBox.tsx     # Explicação da IA
```

## background.js — Captura do token Onfly

```javascript
// Captura o token de autenticação da sessão ativa do portal Onfly
chrome.cookies.get(
  { url: 'https://app.onfly.com.br', name: 'onfly_token' },
  (cookie) => {
    if (cookie) {
      chrome.storage.session.set({ authToken: cookie.value });
    }
  }
);
```

## App.tsx — Estrutura principal do popup

```tsx
import { useState } from 'react'
import SearchForm from './components/SearchForm'
import ResultCard from './components/ResultCard'
import InsightBox from './components/InsightBox'

interface Sugestao {
  data_ida: string
  data_volta: string
  preco_unitario: number
  economia_vs_original: number
  economia_percentual: number
  motivo: string
}

interface ApiResponse {
  sugestoes: Sugestao[]
  insight: string
  preco_original_estimado: number
}

export default function App() {
  const [resultado, setResultado] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function buscar(params: object) {
    setLoading(true)
    setErro(null)

    try {
      const { authToken } = await chrome.storage.session.get('authToken')

      const res = await fetch('https://api.onfly.com.br/smart-date-advisor/suggest-dates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(params),
      })

      if (!res.ok) throw new Error('Sem dados históricos para este trecho.')

      const data = await res.json()
      setResultado(data)
    } catch (e: any) {
      setErro(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-[380px] p-4 font-sans">
      <header className="flex items-center gap-2 mb-4">
        <img src="/icons/icon48.png" className="w-8 h-8" alt="Onfly" />
        <div>
          <h1 className="text-sm font-bold text-gray-900">Smart Date Advisor</h1>
          <p className="text-xs text-gray-500">Encontre as datas mais baratas</p>
        </div>
      </header>

      <SearchForm onSubmit={buscar} loading={loading} />

      {erro && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700">
          {erro}
        </div>
      )}

      {resultado && (
        <div className="mt-4 space-y-2">
          <p className="text-xs text-gray-500">
            Top 3 combinações dentro da sua janela de datas:
          </p>

          {resultado.sugestoes.map((s, i) => (
            <ResultCard key={i} sugestao={s} destaque={i === 0} />
          ))}

          <InsightBox texto={resultado.insight} />
        </div>
      )}
    </div>
  )
}
```

## ResultCard.tsx

```tsx
interface Props {
  sugestao: {
    data_ida: string
    data_volta: string
    preco_unitario: number
    economia_vs_original: number
    economia_percentual: number
    motivo: string
  }
  destaque?: boolean
}

export default function ResultCard({ sugestao: s, destaque }: Props) {
  const formatDate = (d: string) =>
    new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', {
      weekday: 'short', day: '2-digit', month: '2-digit'
    })

  return (
    <div className={`rounded-lg border p-3 ${destaque
      ? 'border-green-400 bg-green-50'
      : 'border-gray-200 bg-white'
    }`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs text-gray-500">Ida</p>
          <p className="text-sm font-semibold">{formatDate(s.data_ida)}</p>
          <p className="text-xs text-gray-500 mt-1">Volta</p>
          <p className="text-sm font-semibold">{formatDate(s.data_volta)}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-gray-900">
            R$ {s.preco_unitario.toLocaleString('pt-BR')}
          </p>
          <span className="inline-block bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full">
            -{s.economia_percentual}% · economia R$ {s.economia_vs_original.toLocaleString('pt-BR')}
          </span>
        </div>
      </div>
      <p className="mt-2 text-xs text-gray-600 italic">{s.motivo}</p>
    </div>
  )
}
```

## Build e empacotamento

### Desenvolvimento

```bash
cd extension
npm run dev     # Vite em modo watch
```

Carregue `extension/dist` no Chrome em modo desenvolvedor.

### Produção (build para submissão)

```bash
npm run build
cd dist && zip -r ../smart-date-advisor-extension.zip .
```

O arquivo `.zip` pode ser submetido na Chrome Web Store.

## Tailwind — configuração do popup

Como o popup é uma página isolada, o Tailwind precisa de escopo explícito:

```css
/* popup/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  min-width: 380px;
  max-width: 380px;
}
```
