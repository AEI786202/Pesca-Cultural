import Phaser from 'phaser';

// Define a cena de pré-carregamento que herda da classe Scene do Phaser
export class Preloader extends Phaser.Scene {
    constructor() {
        super('Preloader');  // Chama o construtor da classe pai com o nome da cena
    }

    // Método preload: carrega todos os assets (imagens, sons, etc.)
    preload() {
        // Carrega o spritesheet do pescador (imagem com múltiplos quadros)
        this.load.spritesheet('fisher', 'assets/animations/tool_rod.png', {
            frameWidth: 128,   // Largura de cada quadro de animação
            frameHeight: 128   // Altura de cada quadro de animação
        });
    
        // Carrega a imagem da isca
        this.load.image(
            'bait',  // Chave única para referenciar este asset
            'assets/fishing-rod-hook-icon-fish-hook-fish-catch-fishing-tip-victim-bait-trap-free-vector-2287970379.jpg'
        );
    
        
     // === Carregamento dos peixes ===
    this.load.image('Anchovy', 'assets/Anchovy.png');
    this.load.image('Clownfish', 'assets/Clownfish.png');
    this.load.image('Crab', 'assets/Crab - Dungeness.png');
    this.load.image('Pufferfish', 'assets/Pufferfish.png');
    this.load.image('Surgeonfish', 'assets/Surgeonfish.png');
    // == Carregamento da baleia ===
    // === PLACEHOLDER ===
    this.load.image('Whale','assets/Clownfish.png')
    }

    // Método create: executado após o carregamento dos assets
    create() {
        // Inicia a cena principal do jogo
        this.scene.start('Play');
    }
}