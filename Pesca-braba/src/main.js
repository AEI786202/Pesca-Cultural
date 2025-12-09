import Phaser from 'phaser';
import { Preloader } from './preloader.js';
import { Menu } from './menu.js';
import { Play } from './pesca.js';

// Configuração principal do jogo Phaser
const config = {
    title: 'Pesca-braba',           // Título do jogo
    type: Phaser.AUTO,              // Renderizador automático (WebGL ou Canvas)
    width: 550,                     // Largura da tela do jogo
    height: 480,                    // Altura da tela do jogo
    parent: 'game-container',       // Elemento HTML onde o jogo será inserido
    backgroundColor: '#192a56',     // Cor de fundo (azul escuro)
    pixelArt: true,                 // Otimizado para arte pixelada
    scale: {
        mode: Phaser.Scale.FIT,     // Modo de escala: ajusta ao container
        autoCenter: Phaser.Scale.CENTER_BOTH  // Centraliza horizontal e verticalmente
    },
    scene: [                        // Lista de cenas do jogo (em ordem de execução)
        Preloader,                  // Primeiro: carrega assets
        Menu,                       // Menu inicial com instruções e botão
        Play                        // Depois: cena principal do jogo
    ]
};

// Cria uma nova instância do jogo Phaser com a configuração fornecida

// new Phaser.Game(config);

export function iniciarJogo() {
    new Phaser.Game(config);
}

// Variável para guardar a instância
let game;

export function iniciarJogo() {
    if (game) {
        // Se já existe um jogo, destruímos para criar um novo (reset)
        game.destroy(true);
    }
    game = new Phaser.Game(config);
    return game; // <--- IMPORTANTE: Retornar a instância
}