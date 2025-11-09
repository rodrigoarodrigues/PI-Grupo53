# Alterações no Schema do Banco de Dados

Este documento descreve as alterações realizadas no schema do banco de dados.

## Data: 2024

## Alterações Realizadas

### 1. Tabela `users`

#### Removido:
- ❌ `age` (integer) - Campo de idade

#### Adicionado:
- ✅ `birthDate` (date) - Data de nascimento do usuário
- ✅ `expirationDate` (date) - Data de expiração da assinatura do usuário

**Motivo**: É mais adequado armazenar a data de nascimento ao invés da idade, pois a idade muda com o tempo. A data de expiração permite gerenciar assinaturas de usuários.

### 2. Tabela `games`

#### Adicionado:
- ✅ `imageUrl` (varchar(500)) - URL da imagem do jogo

**Motivo**: Permite associar uma imagem a cada jogo para exibição na interface.

### 3. Tabela `rents`

#### Modificado:
- 🔄 `rentalType` - Convertido de `varchar(50)` para **ENUM**
  - Valores permitidos: `'unitario'` | `'assinatura'`

**Motivo**: Usar ENUM garante integridade de dados e previne valores inválidos, além de melhorar a performance.

## Estrutura Atualizada

### Users Table
```typescript
{
  id: serial (PK)
  name: varchar(255) NOT NULL
  birthDate: date
  email: varchar(255) NOT NULL
  expirationDate: date
}
```

### Games Table
```typescript
{
  id: serial (PK)
  title: varchar(255) NOT NULL UNIQUE
  quantity: integer NOT NULL
  uuid: varchar(36) NOT NULL UNIQUE
  imageUrl: varchar(500)
}
```

### Rents Table
```typescript
{
  id: serial (PK)
  userId: integer (FK -> users.id)
  gameId: integer (FK -> games.id)
  rentalType: enum('unitario', 'assinatura') NOT NULL
  startDate: date NOT NULL
  endDate: date
  returned: boolean DEFAULT false
}
```

## Migration

Uma migration SQL foi criada em: `drizzle/0002_schema_updates.sql`

### Para aplicar as mudanças no banco de dados:

```bash
# Executar a migration manualmente
psql -d seu_banco -f drizzle/0002_schema_updates.sql

# OU usar o drizzle-kit push
npx drizzle-kit push
```

## Arquivos Atualizados

### Schema
- ✅ `src/db/schema.ts` - Definição do schema atualizada

### User Operations
- ✅ `src/users/createUser.ts` - Schema Zod atualizado (birthDate, expirationDate)
- ✅ `src/users/updateUsers.ts` - Tipos atualizados

### Game Operations
- ✅ `src/games/createGame.ts` - Tipo atualizado com imageUrl
- ✅ `src/games/updateGame.ts` - Tipo atualizado com imageUrl

### Rent Operations
- ✅ `src/rents/createRent.ts` - Tipo rentalType atualizado para enum

## Exemplo de Uso

### Criar Usuário
```typescript
await createUser({
  name: "João Silva",
  birthDate: "1990-05-15",
  email: "joao@example.com",
  expirationDate: "2024-12-31" // Opcional
});
```

### Criar Jogo
```typescript
await createGame({
  title: "The Legend of Zelda",
  quantity: 10,
  uuid: "550e8400-e29b-41d4-a716-446655440000",
  imageUrl: "https://example.com/zelda.jpg" // Opcional
});
```

### Criar Aluguel
```typescript
await createRent({
  userId: 1,
  gameId: 1,
  rentalType: "unitario", // ou "assinatura"
  startDate: "2024-01-15",
  endDate: "2024-01-22" // Opcional
});
```

## Notas Importantes

⚠️ **Atenção**: 
- A coluna `age` foi **removida**. Dados existentes serão perdidos durante a migration.
- Se houver dados importantes na coluna `age`, faça backup antes de executar a migration.
- O campo `rentalType` foi convertido para ENUM. Certifique-se de que todos os valores existentes são 'unitario' ou 'assinatura'.

## Validação Zod

O schema de validação foi atualizado:

```typescript
export const UserSchema = z.object({
  name: z.string("Nome inválido").min(3, "Precisa ter 3 no minimo caracteres"),
  birthDate: z.string("Data de nascimento inválida").optional(),
  email: z.string().email("Email inválido"),
  expirationDate: z.string("Data de expiração inválida").optional(),
});
```
