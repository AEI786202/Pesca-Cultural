import Phaser from 'phaser';

// Menu inicial com imagem de 'Como Jogar' e botão para iniciar o jogo
export class Menu extends Phaser.Scene {
    constructor() {
        super('Menu');
    }

    create() {
        const width = this.scale.width;
        const height = this.scale.height;

        // Background: imagem 'Como Jogar'
        const bg = this.add.image(width / 2, height / 2, 'howToPlay');
        bg.setOrigin(0.5);
        // Ajusta para cobrir a área do jogo
        bg.setDisplaySize(width, height);

        // Botão de iniciar (retângulo + texto)
        const btnWidth = Math.min(260, width * 0.7);
        const btnHeight = 54;
        const btnX = width / 2;
        const btnY = Math.round(height * 0.88);

        const startBtn = this.add.rectangle(btnX, btnY, btnWidth, btnHeight, 0x8b5a2b)
            .setOrigin(0.5, 0)
            .setStrokeStyle(4, 0x000000)
            .setInteractive({ useHandCursor: true });

        const startText = this.add.text(btnX, btnY, 'Iniciar Jogo', {
            fontSize: '20px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5, -0.5);

        // Hover visual
        startBtn.on('pointerover', () => startBtn.setFillStyle(0xa66a39));
        startBtn.on('pointerout',  () => startBtn.setFillStyle(0x8b5a2b));

        // Ao clicar inicia a cena principal
        startBtn.on('pointerdown', () => {
            this.scene.start('Play');
        });
    }
}
