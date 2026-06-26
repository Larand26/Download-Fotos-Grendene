# 📸 Grendene Photo Downloader

![NodeJS](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Status](https://img.shields.io/badge/Status-Ativo-green)

Uma automação robusta desenvolvida em Node.js e TypeScript projetada para acelerar drasticamente o processo de download em massa de fotos de produtos diretamente do ecossistema da Grendene.

---

## 🎯 Objetivo

O projeto resolve o gargalo do download manual de catálogos e mídias de calçados. Ao ler um arquivo de texto com as referências ou links dos produtos, o script processa as requisições em paralelo, respeitando um limite configurável de posições de fotos por modelo, otimizando o tempo de catalogação e atualização de e-commerce.

---

## 🛠️ Tecnologias Utilizadas

- **Runtime:** [Node.js](https://nodejs.org/) (v18+)
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
- **Manipulação de Arquivos:** File System (`fs/promises`)
- **Download Streams:** Axios / Fetch API com streams para salvar imagens em alta definição sem estourar a memória.

---

## ✨ Funcionalidades

- [x] **Leitura de Lote Extensiva:** Processa listas de produtos estruturadas em arquivos `.txt`.
- [x] **Controle de Mídias por Modelo:** Limitação dinâmica de quantas fotos/ângulos baixar por produto através de configuração interna.
- [x] **Alta Performance:** Baixa arquivos de forma assíncrona, acelerando drasticamente o processo em comparação ao fluxo manual.
- [x] **Organização Automática:** Salva e nomeia os arquivos diretamente no diretório de destino configurado.

---

## 🛠️ Instalação e Execução

### Pré-requisitos

- Node.js instalado globalmente.
- Gerenciador de pacotes (NPM ou Yarn).

### Passo a Passo

```bash
# 1. Clone este repositório
$ git clone [https://github.com/Larand26/Download-Fotos-Grendene.git](https://github.com/Larand26/Download-Fotos-Grendene.git)

# 2. Acesse a pasta do projeto
$ cd Download-Fotos-Grendene

# 3. Instale as dependências
$ npm install

# 4. Configure suas variáveis de ambiente no arquivo .env

# 5. Execute o script de automação
$ npm run start
```
