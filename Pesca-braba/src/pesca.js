import Phaser from 'phaser';

export class Play extends Phaser.Scene {
    constructor() {
        super('Play');
    }

    create() {
        const width = this.scale.width;  
        const height = this.scale.height; 

        // === Sistema de Pontuação ===
        this.score = 0;
        this.scoreText = this.add.text(20, 20, 'Pontuação: 0', {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            stroke: '#000000',
            strokeThickness: 4
        }).setScrollFactor(0).setDepth(100);

        // === Criação do fundo com gradiente animado ===
        this.bgTexture = this.textures.createCanvas('bgCanvas', width, height); 
        this.bgSprite = this.add.image(0, 0, 'bgCanvas').setOrigin(0, 0).setDepth(-2); 
        this.waveOffset = 300;
        
        // === Configuração de escalas ===
        this.playerScale = width / 600;
        this.baitScale = this.playerScale * 0.1;
        
        // === Criação do pescador ===
        this.player = this.add.sprite(width / 2, 100, 'fisher').setScale(this.playerScale); 
        
        // === Criação da hitbox da isca ===
        this.baitHitbox = this.add.rectangle(width / 2, height / 2, 15, 15, 0xff0000, 0.5); 
        this.baitHitbox.setOrigin(0.5, 0.5);
        this.baitHitbox.setStrokeStyle(2, 0xffffff);
        this.baitHitbox.setVisible(true); // VISÍVEL PARA TESTES

        // === Imagem da isca ===
        this.bait = this.add.image(this.baitHitbox.x, this.baitHitbox.y, 'bait').setScale(this.baitScale); 

        // === Linha de pesca ===
        this.line = this.add.graphics(); 

        // === Limites de movimento ===
        this.bounds = {
            left: 10,
            right: width - 10,
            top: this.player.y + 40,
            bottom: height - 10
        };

        // === Variáveis de estado ===
        this.targetPos = { x: this.baitHitbox.x, y: this.baitHitbox.y };
        this.lastPointerY = null;
        this.smoothDeltaY = 0;
        this.smoothRod = { x: this.player.x, y: this.player.y };
        this.isCatching = false;
        this.caughtTreasure = null;
        this.catchTriggered = false;

        // === Configuração de entrada ===
        this.input.on('pointermove', pointer => {
            this.targetPos.x = pointer.x;
            this.targetPos.y = pointer.y;
        });

        // === Animações do pescador ===
        this.anims.create({
            key: 'idle',
            frames: [{ key: 'fisher', frame: 28 }],
            frameRate: 1,
            repeat: 0
        });

        this.anims.create({
            key: 'rod_down', 
            frames: this.anims.generateFrameNumbers('fisher', { start: 31, end: 34 }),
            frameRate: 15,
            repeat: 0
        });

        this.anims.create({
            key: 'rod_up', 
            frames: this.anims.generateFrameNumbers('fisher', { start: 33, end: 36 }),
            frameRate: 15,
            repeat: 0
        });

        this.anims.create({
            key: 'catch', 
            frames: this.anims.generateFrameNumbers('fisher', { start: 29, end: 36 }),
            frameRate: 15,
            repeat: 0
        });

        // === Estado inicial ===
        this.player.play('idle');
        this.currentAnim = 'idle';

        // === Eventos de animação ===
        this.player.on('animationcomplete', anim => {
    if (anim.key === 'catch') { 
        this.isCatching = false;
        this.player.play('idle', true);
        this.currentAnim = 'idle'; 
        // Não reseta catchTriggered aqui - só reseta quando a isca se afastar
    } else if (['rod_down', 'rod_up'].includes(anim.key) && !this.isCatching) {
        this.player.play('idle', true);
        this.currentAnim = 'idle';
    }
});

        // === Grupos ===
        this.fishGroup = this.add.group();
        this.whaleGroup = this.add.group();
        this.treasureGroup = this.add.group();

        // === Listas de tipos ===
        this.fishTypes = ['Anchova', 'Corvina', 'Linguado', 'Pampos', 'Tainha'];
        this.whaleTypes = ['Baleia'];
        this.treasureTypes = ['Caveira', 'Mascara', 'Relogio', 'Vaso', 'Vaso2', 'zarabatana'];

        // === Timers para spawn ===
        this.time.addEvent({
            delay: 900,
            callback: this.spawnFish,
            callbackScope: this,
            loop: true
        });

        this.time.addEvent({
            delay: 5000,
            callback: this.spawnWhale,
            callbackScope: this,
            loop: true
        });

        // === Timer para spawn de tesouros ===
        this.time.addEvent({
            delay: 8000,
            callback: this.spawnTreasure,
            callbackScope: this,
            loop: true
        });
    }

    // === Função para spawnar um peixe ===
    spawnFish() {
        const width = this.scale.width;
        const height = this.scale.height;

        const fishKey = Phaser.Utils.Array.GetRandom(this.fishTypes);
        const fromLeft = Phaser.Math.Between(0, 1) === 0;
        const x = fromLeft ? -20 : width + 20;
        const y = Phaser.Math.Between(this.player.y + 80, height - 20);

        const fish = this.add.image(x, y, fishKey).setScale(1.0);

        // Hitbox do peixe - VISÍVEL PARA TESTES
        const fishHitbox = this.add.rectangle(fish.x, fish.y, fish.width, fish.height, 0xff0000, 0.4); 
        fishHitbox.setOrigin(0.5, 0.5);
        fishHitbox.setStrokeStyle(2, 0xff0000);
        fishHitbox.setVisible(true); // VISÍVEL

        if (!fromLeft) {
            fish.setFlipX(true);
        }

        const speed = Phaser.Math.Between(50, 100);
        this.fishGroup.add(fish);
        fish.setData('speed', speed * (fromLeft ? 1 : -1));
        fish.setData('hitbox', fishHitbox);
    }

    // === Função para spawnar uma baleia ===
    spawnWhale() {
        if (Phaser.Math.Between(1, 100) < 20) {
            const width = this.scale.width;
            const height = this.scale.height;

            const whaleKey = Phaser.Utils.Array.GetRandom(this.whaleTypes);
            const fromLeft = Phaser.Math.Between(0, 1) === 0;
            const x = fromLeft ? -50 : width + 50;
            const y = Phaser.Math.Between(height - 100, height - 30);

            const whale = this.add.image(x, y, whaleKey).setScale(1.0);

            // Hitbox da baleia - VISÍVEL PARA TESTES
            const whaleHitbox = this.add.rectangle(whale.x, whale.y, whale.width, whale.height, 0x0000ff, 0.4); 
            whaleHitbox.setOrigin(0.5, 0.5);
            whaleHitbox.setStrokeStyle(2, 0x0000ff);
            whaleHitbox.setVisible(true); // VISÍVEL

            if (!fromLeft) {
                whale.setFlipX(true);
            }

            const speed = Phaser.Math.Between(20, 40);
            this.whaleGroup.add(whale);
            whale.setData('speed', speed * (fromLeft ? 1 : -1));
            whale.setData('hitbox', whaleHitbox);
        }
    }

    // === Função para spawnar tesouros ===
    spawnTreasure() {
    const width = this.scale.width;
    const height = this.scale.height;

    const treasureKey = Phaser.Utils.Array.GetRandom(this.treasureTypes);
    const fromLeft = Phaser.Math.Between(0, 1) === 0; // ← Já escolhe lado aleatório
    const x = fromLeft ? -30 : width + 30; // ← Já spawna de ambos os lados
    const y = Phaser.Math.Between(this.player.y + 100, height - 50);

    const treasure = this.add.image(x, y, treasureKey).setScale(1.0);

    // Hitbox do tesouro - VISÍVEL PARA TESTES
    const treasureHitbox = this.add.rectangle(
        treasure.x, 
        treasure.y, 
        treasure.width * 0.8, 
        treasure.height * 0.8, 
        0x00ff00, 
        0.4
    ); 
    treasureHitbox.setOrigin(0.5, 0.5);
    treasureHitbox.setStrokeStyle(2, 0x00ff00);
    treasureHitbox.setVisible(true); // VISÍVEL

    if (!fromLeft) {
        treasure.setFlipX(true); // ← JÁ APLICA flipX
    }

    const speed = Phaser.Math.Between(30, 60);
    this.treasureGroup.add(treasure);
    treasure.setData('speed', speed * (fromLeft ? 1 : -1));
    treasure.setData('hitbox', treasureHitbox);
    treasure.setData('isCaught', false);
    treasure.setData('value', 50);
}

    // === Atualização da linha de pesca ===
    updateFishingLine() {
        this.line.clear();
        this.line.lineStyle(1.3, 0xffffff, 2);
        this.line.moveTo(this.smoothRod.x, this.smoothRod.y);
        this.line.lineTo(this.baitHitbox.x, this.baitHitbox.y);
        this.line.strokePath();
    }

    // === Atualização dos peixes ===
    updateFish() {
        const width = this.scale.width;
        this.fishGroup.getChildren().forEach(fish => {
            const speed = fish.getData('speed');
            const fishHitbox = fish.getData('hitbox');
            
            fish.x += speed * (this.game.loop.delta / 1000);
            
            if (fishHitbox) {
                fishHitbox.x = fish.x;
                fishHitbox.y = fish.y;
            }
            
            if ((speed > 0 && fish.x > width + 100) || (speed < 0 && fish.x < -100)) {
                fish.destroy();
                if (fishHitbox) fishHitbox.destroy();                
            }
        });
    }

    // === Atualização das baleias ===
    updateWhales() {
        const width = this.scale.width;
        this.whaleGroup.getChildren().forEach(whale => {
            const speed = whale.getData('speed');
            const whaleHitbox = whale.getData('hitbox');
            
            whale.x += speed * (this.game.loop.delta / 1000);
            
            if (whaleHitbox) {
                whaleHitbox.x = whale.x;
                whaleHitbox.y = whale.y;
            }
            
            if ((speed > 0 && whale.x > width + 150) || (speed < 0 && whale.x < -150)) {
                whale.destroy();
                if (whaleHitbox) whaleHitbox.destroy();                
            }
        });
    }

    // === Atualização dos tesouros ===
    updateTreasures() {
        const width = this.scale.width;
        
        this.treasureGroup.getChildren().forEach(treasure => {
            const speed = treasure.getData('speed');
            const treasureHitbox = treasure.getData('hitbox');
            const isCaught = treasure.getData('isCaught');
            
            if (!isCaught) {
                treasure.x += speed * (this.game.loop.delta / 1000);
                
                if (treasureHitbox) {
                    treasureHitbox.x = treasure.x;
                    treasureHitbox.y = treasure.y;
                }
                
                // Verifica colisão com a isca usando overlap de retângulos
                const baitBounds = this.baitHitbox.getBounds();
                const treasureBounds = treasureHitbox.getBounds();
                
                if (Phaser.Geom.Rectangle.Overlaps(baitBounds, treasureBounds)) {
                    treasure.setData('isCaught', true);
                    this.caughtTreasure = treasure;
                    
                    // Efeito visual de captura
                    treasure.setTint(0xffff00);
                    treasureHitbox.setFillStyle(0xffff00, 0.5);
                }
            } else {
                // Tesouro capturado segue a isca
                treasure.x = this.baitHitbox.x;
                treasure.y = this.baitHitbox.y + 20;
                
                if (treasureHitbox) {
                    treasureHitbox.x = treasure.x;
                    treasureHitbox.y = treasure.y;
                }
                
                // Verifica se chegou perto do pescador
                const distToPlayer = Phaser.Math.Distance.Between(
                    treasure.x, treasure.y, 
                    this.player.x, this.player.y
                );
                
                if (distToPlayer < 80) {
                    this.collectTreasure(treasure);
                }
            }
            
            // Remove tesouros que saíram da tela
            if (!isCaught && ((speed > 0 && treasure.x > width + 100) || (speed < 0 && treasure.x < -100))) {
                treasure.destroy();
                if (treasureHitbox) treasureHitbox.destroy();                
            }
        });
    }

    // === Função para coletar tesouro ===
    collectTreasure(treasure) {
        const treasureValue = treasure.getData('value');
        const treasureHitbox = treasure.getData('hitbox');
        
        // Adiciona pontuação
        this.score += treasureValue;
        this.scoreText.setText(`Pontuação: ${this.score}`);
        
        // Efeito visual de coleta
        const collectText = this.add.text(
            this.player.x, 
            this.player.y - 50, 
            `+${treasureValue}`, 
            {
                fontSize: '20px',
                fill: '#ffff00',
                fontFamily: 'Arial, sans-serif',
                stroke: '#000000',
                strokeThickness: 3
            }
        ).setDepth(100);
        
        // Animação do texto flutuante
        this.tweens.add({
            targets: collectText,
            y: collectText.y - 50,
            alpha: 0,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => {
                collectText.destroy();
            }
        });
        
        // Remove o tesouro
        treasure.destroy();
        if (treasureHitbox) treasureHitbox.destroy();
        
        // Limpa a referência do tesouro capturado
        if (this.caughtTreasure === treasure) {
            this.caughtTreasure = null;
        }
    }

    // === Atualização do fundo animado ===
    updateBackground(width, height) {
        this.waveOffset += 0.01;
        const canvas = this.textures.get('bgCanvas').getSourceImage();
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, width, height);

        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        const lightness = 50 + Math.sin(this.waveOffset) * 10; 
        const darkLightness = 20 + Math.sin(this.waveOffset + Math.PI / 2) * 10;
        gradient.addColorStop(0, `hsl(200, 80%, ${lightness}%)`);
        gradient.addColorStop(1, `hsl(220, 80%, ${darkLightness}%)`);

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        this.textures.get('bgCanvas').refresh();
    }

    // === Atualização da posição da isca ===
    updateBait() {
        if (!this.targetPos) return;
        
        const clampedX = Phaser.Math.Clamp(this.targetPos.x, this.bounds.left, this.bounds.right);
        const clampedY = Phaser.Math.Clamp(this.targetPos.y, this.bounds.top, this.bounds.bottom);

        const smoothFactor = 0.10;
        this.baitHitbox.x = Phaser.Math.Linear(this.baitHitbox.x, clampedX, smoothFactor);
        this.baitHitbox.y = Phaser.Math.Linear(this.baitHitbox.y, clampedY, smoothFactor);

        this.bait.x = this.baitHitbox.x;
        this.bait.y = this.baitHitbox.y;
    }

    // === Atualização das animações do pescador ===
    updateRodAnimation() {
        if (this.lastPointerY !== null && !this.isCatching) { 
            const deltaY = this.baitHitbox.y - this.lastPointerY;
            const threshold = 2.5;
            this.smoothDeltaY = this.smoothDeltaY * 0.7 + deltaY * 0.3; 

            if (this.smoothDeltaY > threshold && this.currentAnim !== 'rod_down') {
                this.player.play('rod_down', true);
                this.currentAnim = 'rod_down'; 
            } else if (this.smoothDeltaY < -threshold && this.currentAnim !== 'rod_up') {
                this.player.play('rod_up', true);
                this.currentAnim = 'rod_up'; 
            } else if (Math.abs(this.smoothDeltaY) <= threshold && this.currentAnim !== 'idle') {
                this.player.play('idle', true);
                this.currentAnim = 'idle'; 
            }
        }
        this.lastPointerY = this.baitHitbox.y;
    }

    // === Verificação de captura ===
  checkCatch() {
    const dist = Phaser.Math.Distance.Between(
        this.baitHitbox.x, this.baitHitbox.y, 
        this.player.x, this.player.y
    );
    
    // Só ativa a animação se estiver perto, não tiver sido triggerada ainda, e não estiver em catch
    if (dist < 60 && !this.catchTriggered && !this.isCatching && this.currentAnim !== 'catch') { 
        this.isCatching = true;
        this.catchTriggered = true; // Marca que já foi ativada
        this.player.play('catch', true);
        this.currentAnim = 'catch'; 
    }
    
    // Reseta o trigger quando a isca se afastar
    if (dist >= 60 && this.catchTriggered && !this.isCatching) {
        this.catchTriggered = false;
    }
}


    // === Atualização da vara e da linha ===
    updateRodAndLine(width) {
        this.line.clear();
        this.line.lineStyle(1.3, 0xffffff, 2);
        
        const scaleFactor = this.player.scaleX; 
        const widthFactor = width / 800; 

        let playerRodX = this.player.x; 
        let playerRodY = this.player.y; 

        switch (this.currentAnim) {
            case 'idle':
                playerRodX += 7 * scaleFactor * widthFactor;
                playerRodY -= 47 * scaleFactor * widthFactor;
                break;
            case 'rod_down':
            case 'rod_up':
            case 'catch':
                playerRodX += 40 * scaleFactor * widthFactor;
                playerRodY += 5 * scaleFactor * widthFactor;
                break;
        }

        this.smoothRod.x = Phaser.Math.Linear(this.smoothRod.x, playerRodX, 0.90); 
        this.smoothRod.y = Phaser.Math.Linear(this.smoothRod.y, playerRodY, 0.90); 
        this.updateFishingLine();
    }

    // === Método update principal ===
    update() {
        const width = this.scale.width; 
        const height = this.scale.height; 

        this.updateBackground(width, height);
        this.updateBait();
        this.updateRodAnimation();
        this.checkCatch();
        this.updateRodAndLine(width);
        this.updateFish();
        this.updateWhales();
        this.updateTreasures();
    }
}