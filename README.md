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

Abra [http://localhost:3000](http://localhost:3000).

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
