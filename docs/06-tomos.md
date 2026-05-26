# Divisão de Tomos

## Regra geral

A divisão de tomos é feita pelo número de pranchas.

Geralmente cada tomo deve ter entre 10 e 15 pranchas.

O sistema deve tentar deixar a divisão o mais equilibrada possível.

## Tomos editáveis

A divisão deve ser:

```text
Automática, mas editável pelo usuário.
```

O usuário escolhe a quantidade de tomos e a quantidade de pranchas por tomo.

O sistema deve:

```text
- calcular automaticamente os intervalos de início e fim;
- redistribuir o saldo ao alterar a quantidade de um tomo;
- garantir que a soma dos tomos seja igual ao total de folhas de referência;
- impedir geração com lacunas, sobreposições ou soma divergente.
```

Exemplo inválido que não deve ser aceito para 30 folhas:

```text
10 + 12 + 9 = 31
```

O sistema sugere a divisão e o usuário pode ajustar antes da geração final.

## Exemplo

30 pranchas:

```text
TOMO 1: 01/30 até 10/30
TOMO 2: 11/30 até 20/30
TOMO 3: 21/30 até 30/30
```

46 pranchas:

```text
TOMO 1: 01/46 até 12/46
TOMO 2: 13/46 até 24/46
TOMO 3: 25/46 até 35/46
TOMO 4: 36/46 até 46/46
```

## Título da seção

O usuário informa manualmente o título base.

Exemplo:

```text
PROJETO ESTRUTURAL CONCRETO
```

Se houver apenas um tomo:

```text
PROJETO ESTRUTURAL CONCRETO
```

Não usar:

```text
PROJETO ESTRUTURAL CONCRETO (TOMO 1)
```

Se houver mais de um tomo:

```text
PROJETO ESTRUTURAL CONCRETO (TOMO 1)
PROJETO ESTRUTURAL CONCRETO (TOMO 2)
PROJETO ESTRUTURAL CONCRETO (TOMO 3)
```

## Paginação

Cada tomo começa obrigatoriamente em nova página.

A tabela de um mesmo tomo não deve quebrar em duas páginas.

Se houver risco de quebra:

```text
Mostrar alerta antes de gerar.
```
