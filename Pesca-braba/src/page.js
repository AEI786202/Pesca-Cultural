        //const Phaser = window.Phaser;
        // Importa a função de iniciar o jogo (veja o Ponto 4 abaixo)
        import { iniciarJogo } from './main.js';

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