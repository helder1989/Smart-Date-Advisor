Crie commits bem descritos em português, separados por tema/modificação.

## Instruções

1. Rode `git status` e `git diff --stat` para ver todas as alterações pendentes
2. Rode `git diff` (staged e unstaged) para entender o conteúdo de cada mudança
3. Rode `git log --oneline -5` para manter consistência com o histórico

4. **Agrupe as alterações por tema/propósito**. Exemplos de agrupamento:
   - Arquivos de configuração alterados juntos
   - Componentes de uma mesma feature
   - Correções de bug relacionadas
   - Refatorações no mesmo módulo
   - Testes de uma mesma área
   - Documentação

5. **Para cada grupo**, crie um commit separado:
   - Stage apenas os arquivos daquele grupo com `git add <arquivos>`
   - Use prefixos convencionais em português:
     - `feat:` — nova funcionalidade
     - `fix:` — correção de bug
     - `refactor:` — refatoração sem mudança de comportamento
     - `style:` — formatação, espaçamento, CSS
     - `docs:` — documentação
     - `test:` — adição ou alteração de testes
     - `chore:` — configuração, dependências, build
     - `perf:` — melhoria de performance
   - Título curto (max 72 chars) descrevendo O QUE mudou
   - Corpo do commit (após linha em branco) explicando O PORQUÊ, quando relevante

6. **Formato do commit**:
   ```
   prefixo: título curto descritivo

   Descrição mais detalhada do porquê dessa mudança,
   quando necessário. Não precisa repetir o que o diff já mostra.

   Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
   ```

7. **Antes de commitar**, apresente ao usuário o plano:
   - Mostre quais arquivos vão em cada commit
   - Mostre a mensagem proposta para cada um
   - Peça confirmação antes de executar

8. **Após todos os commits**, rode `git log --oneline -10` para mostrar o resultado

## Regras
- NUNCA use `git add .` ou `git add -A` — sempre adicione arquivos específicos
- NUNCA faça push automático — apenas commits locais
- Se houver arquivos sensíveis (.env, credenciais), avise e NÃO commite
- Se não houver alterações, informe que não há nada para commitar
- Sempre passe a mensagem via HEREDOC para preservar formatação
