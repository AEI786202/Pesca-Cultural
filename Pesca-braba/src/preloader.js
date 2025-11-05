const Phaser = window.Phaser;
// Define a cena de pré-carregamento que herda da classe Scene do Phaser
export class Preloader extends Phaser.Scene {
    constructor() {
        super('Preloader');  // Chama o construtor da classe pai com o nome da cena
    }

    // Método preload: carrega todos os assets (imagens, sons, etc.)
    preload() {
        // Carrega o spritesheet do pescador (imagem com múltiplos quadros)
        this.load.spritesheet('fisher', './public/assets/animations/tool_rod.png', {
            frameWidth: 128,   // Largura de cada quadro de animação
            frameHeight: 128   // Altura de cada quadro de animação
        });
    
        // Carrega a imagem da isca
        this.load.image(
            'bait',  // Chave única para referenciar este asset
            './public/assets/fishing-rod-hook-icon-fish-hook-fish-catch-fishing-tip-victim-bait-trap-free-vector-2287970379.jpg'
        );
    
        
     // === Carregamento dos peixes ===
    this.load.image('Anchova', './public/assets/peixes 16/anchova.png');
    this.load.image('Corvina', './public/assets/peixes 16/corvina.png');
    this.load.image('Linguado', './public/assets/peixes 16/linguado.png');
    this.load.image('Pampos', './public/assets/peixes 16/pampos.png');
    this.load.image('Tainha', './public/assets/peixes 16/tainha.png');
    // == Carregamento da baleia ===
    // === PLACEHOLDER ===
    this.load.image('Whale','./public/assets/whale.png')
    }

    // Método create: executado após o carregamento dos assets
    create() {
        // Inicia a cena principal do jogo
        this.scene.start('Play');
    }
}