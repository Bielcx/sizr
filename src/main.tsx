import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { sizrConfig } from '../sizr.config';
import { aplicarTema } from './lib/tema';
import { lerEstadoUrl, lerOpcoesEmbed } from './lib/embed';
import App from './App';
import Embed from './Embed';
import './index.css';

// Duas páginas, um arquivo só: com ?embed na URL sobe o configurador puro
// para rodar dentro de um <iframe>; sem ele, a landing. Um roteador aqui
// seria uma dependência para decidir um if.
const busca = window.location.search;
const modoEmbed = new URLSearchParams(busca).has('embed');
const opcoes = lerOpcoesEmbed(busca, sizrConfig);
const estadoInicial = lerEstadoUrl(busca);

// Antes do primeiro render, para a página não piscar com as cores padrão.
aplicarTema(modoEmbed ? opcoes.config.marca : sizrConfig.marca);

const raiz = document.getElementById('root');
if (!raiz) throw new Error('Elemento #root não encontrado no index.html');

createRoot(raiz).render(
  <StrictMode>
    {modoEmbed ? <Embed {...opcoes} estadoInicial={estadoInicial} /> : <App />}
  </StrictMode>,
);
