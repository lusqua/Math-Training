# Degrau

Treino diário de matemática no estilo "folha por dia": trilha em passos pequenos, tempo padrão por folha e só
sobe de nível quem domina o atual. Serve pra qualquer idade.

## Como funciona

- **Nivelamento**: poucas contas de cada etapa-chave; para no primeiro ponto difícil e começa no último em que
  foi bem.
- **Folhas** de 10 contas com tempo padrão. As erradas voltam no fim pra correção (fora do tempo).
- **Domínio**: no máximo 1 erro de primeira e dentro do tempo. 2 folhas dominadas seguidas sobem o nível.
- **Trilha** (23 níveis): adição → subtração → 2 dígitos → tabuada e divisão → inteiros e ordem das operações →
  equações de 1º grau.
- Vários perfis por aparelho; o progresso fica no `localStorage`.

A trilha mora em `src/curriculum.ts` e as regras de domínio em `src/mastery.ts`.

## Desenvolvimento

```sh
bun install
bun run dev     # http://127.0.0.1:5173
bun run test
bun run build
```

Push na `main` roda os testes, gera o build e publica na branch `gh-pages`.
