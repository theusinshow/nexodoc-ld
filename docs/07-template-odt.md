# Template ODT

## Regra principal

A LD final deve ser gerada a partir de um template `.odt` oficial da empresa.

Não recriar o layout do zero.

O template preserva:

```text
- margens;
- fontes;
- estilos;
- tabela;
- cabeçalho;
- rodapé;
- campos automáticos;
- propriedades do LibreOffice Writer;
- quebras de página;
- texto de direitos autorais.
```

## Template padrão

O sistema deve ter um template padrão salvo internamente:

```text
templates/modelo_ld_empresa.odt
```

Na primeira versão, esse template não deve ser alterável pela interface.

## Template alternativo

O usuário pode anexar um template `.odt` alternativo apenas para uma geração específica.

Esse template alternativo:

```text
- não substitui o padrão interno;
- só vale para aquela geração;
- deve ser validado como arquivo .odt.
```

## Marcadores recomendados

O template deve conter marcadores como:

```text
{{TITULO_SECAO}}
{{NUMERO_FOLHA}}
{{ARQUIVO}}
{{DESCRICAO}}
```

O sistema deve duplicar a linha base da tabela para cada prancha.

Para múltiplos tomos, o sistema deve duplicar o bloco de seção/tabela e inserir quebra de página entre os tomos.

## Propriedades

O sistema deve editar propriedades internas do ODT, provavelmente no `meta.xml`, preenchendo:

```text
Info 1: órgão/cliente
Info 2: código formatado do projeto
Info 3: Lista de documentos
Info 4: LISTA DE DOCUMENTOS
Assunto: nome da obra
Anotações: fase do projeto
```

## Conversão para PDF

A conversão para PDF deve ser feita depois da geração do ODT.

Recomendação técnica futura:

```text
LibreOffice headless
```

Fluxo:

```text
ODT preenchido
↓
LibreOffice headless
↓
PDF final
```
