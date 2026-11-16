# Lu&Cia Viagens — Site público

Site expositor da **Lu&Cia Viagens**: próximas saídas, roteiros, galerias e contato via WhatsApp.  
Sem venda online — o conteúdo é publicado pelo **LC-Manager** (aba Web).

Desenvolvido pela [Axellion](https://axellion.com.br/).

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind CSS 4
- Export estático (`output: 'export'`) → pasta `out/`
- Hospedagem prevista: **Netlify** (rebuild a cada commit do LC-Manager)

## Conteúdo

| Arquivo | Uso |
|---------|-----|
| `content/site.json` | Empresa, sobre, contatos |
| `content/viagens.json` | Lista resumida |
| `content/viagens/<slug>.json` | Página completa |
| `public/web/...` | Fotos (o sistema só altera esta pasta + `content/`) |

## Desenvolvimento

```bash
npm install
npm run dev
```

Abra [http://localhost:3010](http://localhost:3010).

### Sincronizar viagens do LC Manager (local)

Com o app **Lu & Cia / LC Manager** aberto:

```bash
npm run sync:lc
```

Isso lê `http://127.0.0.1:3000/api/web` e atualiza `content/` com:
- viagens **CONCLUIDA** → `situacao: REALIZADA` (aparecem na Galeria)
- viagens **CONFIRMADA** → `situacao: CONFIRMADA` (aparecem na agenda, **sem preço**)
- fotos da **Galeria** operacional do LC Manager → espelho em `public/web/sync/<slug>/` (só a galeria; add/remove no Manager atualiza o site)
- viagens com página **Web publicada** → entram como ABERTA/ESGOTADA
- a lista do site é **substituída** pelo sync (demos/mocks são removidos)

Para importar tudo (inclui rascunhos mapeados como abertas):

```bash
SYNC_ALL=1 npm run sync:lc
```

### Publicação automática (LC Manager → site em até ~5 min)

`scripts/publicar-automatico.mjs` roda a cada 2 minutos pelo Agendador de Tarefas do Windows:
confere se o LC Manager está aberto, sincroniza, e se algo mudou faz commit e push de `content/` e
`public/web/` (o código nunca entra). O Netlify detecta o push e publica em 1–2 minutos.

```powershell
powershell -ExecutionPolicy Bypass -File scripts\instalar-publicador.ps1           # liga
powershell -ExecutionPolicy Bypass -File scripts\instalar-publicador.ps1 -Remover  # desliga
node scripts/publicar-automatico.mjs --dry-run                                     # teste sem enviar
```

Segurança: se o LC Manager devolver zero viagens ou menos da metade das que o site já tem, a
sincronização é descartada e o site continua como estava. Log em `scripts/publicador.log`.

Requisitos: PC ligado, LC Manager aberto, Node e Git no PATH e login do GitHub já salvo (o mesmo do `git push`).

## Build

```bash
npm run build
```

Gera o site estático em `out/`.

## Publicação com o LC-Manager

1. Crie um repositório GitHub e conecte à Netlify (build: `npm run build`, publish: `out`).
2. No LC-Manager → **Web** → configure `usuario/repositorio`, branch e token.
3. Publique viagens e clique em **Publicar no site**.

O sistema atualiza apenas `content/` e `public/web/`; o código do site permanece intacto.
