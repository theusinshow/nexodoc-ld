# Validações

## Ordenação

A LD deve ser ordenada sempre pela numeração lida no campo `PRANCHA`.

Exemplo:

```text
Arquivos enviados fora de ordem:
05/30
01/30
03/30

LD ordenada:
01/30
03/30
05/30
```

## Comparação de disciplina

O usuário informa manualmente a sigla da disciplina.

O sistema compara a sigla informada com a sigla lida no campo `PRANCHA`.

A comparação ignora apenas maiúsculas/minúsculas.

Exemplos considerados iguais:

```text
est = EST
met = MET
arq = ARQ
```

Exemplos que geram alerta:

```text
est ≠ FND
est ≠ EST-FND
met ≠ EST
```

Divergência de disciplina gera alerta, mas não bloqueia geração.

## Folha duplicada

Folha duplicada bloqueia geração.

Exemplo:

```text
12/30 aparece duas vezes.
```

O usuário precisa corrigir/remover uma das linhas antes de gerar.

## Folha faltando

Folha faltando gera alerta, mas permite gerar com confirmação.

O sistema deve:

```text
- manter o buraco;
- não renumerar;
- não criar linha artificial;
- informar o usuário;
- registrar no relatório MD.
```

Exemplo:

```text
01/30
02/30
04/30
```

Alerta:

```text
Folha 03/30 não localizada.
```

## Total divergente

Se houver totais divergentes, o sistema deve perguntar ao usuário qual total deve ser considerado correto.

Exemplo:

```text
Algumas pranchas indicam 30 folhas.
Outras indicam 34 folhas.
```

O sistema pergunta:

```text
Qual total deve ser usado como referência?
[30] [34] [informar manualmente]
```

Depois disso:

```text
- comparar todas as pranchas contra o total de referência;
- alertar divergências;
- não corrigir automaticamente o campo Nº DA FOLHA;
- deixar o usuário corrigir manualmente.
```

## Bloqueios

Bloqueia geração:

```text
- folha duplicada;
- campo ARQUIVOS vazio;
- campo DESCRIÇÃO vazio.
```

## Alertas com confirmação

Permite gerar se o usuário revisar/confirmar:

```text
- folha faltando;
- disciplina divergente;
- total divergente;
- leitura com baixa confiança;
- risco de tomo não caber em uma página.
```

## Marcar como revisado

Toda linha com alerta deve permitir:

```text
Marcar como revisado
```

A geração só deve ser permitida quando:

```text
- não houver erro bloqueante;
- todos os alertas estiverem revisados;
- o usuário confirmar no resumo final.
```
