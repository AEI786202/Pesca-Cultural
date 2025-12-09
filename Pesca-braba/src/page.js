//const Phaser = window.Phaser;
// Importa a função de iniciar o jogo (veja o Ponto 4 abaixo)
import { iniciarJogo } from './main.js';

// Variável global para controlar a instância do jogo
let gameInstance = null;

// --- Lógica das Abas ---
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');
tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        tabButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        tabContents.forEach(content => content.classList.add('hidden'));
        const tabId = button.getAttribute('data-tab');
        document.getElementById(tabId).classList.remove('hidden');
    });
});

// --- Lógica do Teste de Fim de Jogo (tecla F) ---
const gameOverScreen = document.getElementById('game-over-screen');
window.addEventListener('keydown', (e) => {
    if (e.key === 'f') {
        // Usa a classe 'active' para mostrar/esconder
        gameOverScreen.classList.toggle('active');
    }
});

// 1. Lógica de Mute/Unmute
const muteButton = document.getElementById('mute-button');
const iconSoundOn = document.getElementById('icon-sound-on');
const iconSoundOff = document.getElementById('icon-sound-off');

muteButton.addEventListener('click', () => {
    if (!gameInstance) return;

    // Inverte o estado de mute global do Phaser
    gameInstance.sound.mute = !gameInstance.sound.mute;

    // Alterna os ícones
    if (gameInstance.sound.mute) {
        iconSoundOn.classList.add('hidden');
        iconSoundOff.classList.remove('hidden');
        muteButton.style.borderColor = '#ff0000'; // Feedback visual extra
    } else {
        iconSoundOn.classList.remove('hidden');
        iconSoundOff.classList.add('hidden');
        muteButton.style.borderColor = '#415a77';
    }

    // Tira o foco do botão para não atrapalhar teclas do teclado se houver
    muteButton.blur();
});

// 2. Lógica de Pause
const pauseButton = document.getElementById('pause-button');
const iconPause = document.getElementById('icon-pause');
const iconPlay = document.getElementById('icon-play');
let isPaused = false;

pauseButton.addEventListener('click', () => {
    if (!gameInstance) return;

    // Pega a cena atual (Play)
    // Nota: 'Play' é a chave que definimos no construtor da cena em pesca.js
    const playScene = gameInstance.scene.getScene('Play');

    if (!isPaused) {
        gameInstance.scene.pause('Play'); // Pausa a cena do jogo
        gameInstance.sound.pauseAll();    // Pausa sons
        isPaused = true;

        // Troca ícone para Play
        iconPause.classList.add('hidden');
        iconPlay.classList.remove('hidden');
        pauseButton.style.backgroundColor = '#ffc300';
        pauseButton.style.color = '#000';

    } else {
        gameInstance.scene.resume('Play'); // Retoma a cena
        gameInstance.sound.resumeAll();    // Retoma sons
        isPaused = false;

        // Troca ícone para Pause
        iconPause.classList.remove('hidden');
        iconPlay.classList.add('hidden');
        pauseButton.style.backgroundColor = ''; // Volta ao padrão
        pauseButton.style.color = '';
    }

    pauseButton.blur();
});

// --- PONTO 4: Lógica do Botão de Play ---
const playOverlay = document.getElementById('play-overlay');
const playButton = document.getElementById('play-button');
playButton.addEventListener('click', () => {
    playOverlay.classList.remove('active'); // Esconde o overlay
    iniciarJogo(); // Chama a função importada do main.js
});

// --- PONTO 5: Lógica do Botão de Tela Cheia ---
const fullscreenButton = document.getElementById('fullscreen-button');
const gameWrapper = document.getElementById('game-container-wrapper');
fullscreenButton.addEventListener('click', () => {
    if (!document.fullscreenElement) {
        // Entra em tela cheia no wrapper do jogo
        gameWrapper.requestFullscreen().catch(err => {
            alert(`Erro ao tentar entrar em tela cheia: ${err.message}`);
        });
    } else {
        // Sai da tela cheia
        document.exitFullscreen();
    }
});