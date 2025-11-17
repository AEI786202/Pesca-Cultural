import Phaser from 'phaser';
// Define a cena de pré-carregamento que herda da classe Scene do Phaser
export class Preloader extends Phaser.Scene {
    constructor() {
        super('Preloader');  // Chama o construtor da classe pai com o nome da cena
    }

    // Método preload: carrega todos os assets (imagens, sons, etc.)
    preload() { 
        console.log("Carregando assets...");
        // Carrega o spritesheet do pescador (imagem com múltiplos quadros)
        this.load.spritesheet('fisher', '/assets/animations/tool_rod.png', {
            frameWidth: 128,   // Largura de cada quadro de animação
            frameHeight: 128   // Altura de cada quadro de animação
        });       
        
        // Carrega a imagem da isca
        this.load.image(
            'bait',  // Chave única para referenciar este asset
            './public/assets/fishing-rod-hook-icon-fish-hook-fish-catch-fishing-tip-victim-bait-trap-free-vector-2287970379.jpg'
        );
        
     // === Carregamento dos peixes ===
    this.load.image('Anchova', '/assets/peixes 16/anchova.png');
    this.load.image('Corvina', '/assets/peixes 16/corvina.png');
    this.load.image('Linguado', '/assets/peixes 16/linguado.png');
    this.load.image('Pampos', '/assets/peixes 16/pampos.png');
    this.load.image('Tainha', '/assets/peixes 16/tainha.png');
    
     // === Carregamento dos tesouros === 
    this.load.image('Caveira', '/assets/tesouros 16/caveira.png');
    this.load.image('Mascara', '/assets/tesouros 16/mascara.png');
    this.load.image('Relogio', '/assets/tesouros 16/relogio.png');
    this.load.image('Vaso', '/assets/tesouros 16/vaso.png');
    this.load.image('Vaso2', '/assets/tesouros 16/vaso2.png');
    this.load.image('zarabatana', '/assets/tesouros 16/zarabatana.png');

    // == Carregamento da baleia ===
    // === PLACEHOLDER ===
    this.load.image('Baleia','/assets/peixes 64/Baleia.png')
    }

    // Método create: executado após o carregamento dos assets
    create() {
        // Inicia a cena principal do jogo
        this.scene.start('Play');
        console.log("Iniciando o jogo...");
    }
}