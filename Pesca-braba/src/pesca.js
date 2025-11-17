import Phaser from 'phaser';
// Define a cena principal do jogo que herda da classe Scene do Phaser
export class Play extends Phaser.Scene {
    constructor() {
        super('Play');  // Define o nome da cena como 'Play'
    }

    // Método create: executado uma vez quando a cena é criada
    create() {
        // Obtém as dimensões da tela
        const width = this.scale.width;  
        const height = this.scale.height; 

        // === Criação do fundo com gradiente animado ===
        // Cria uma textura dinâmica usando canvas
        this.bgTexture = this.textures.createCanvas('bgCanvas', width, height); 
        // Adiciona a imagem do canvas à cena na posição (0,0)
        this.bgSprite = this.add.image(0, 0, 'bgCanvas').setOrigin(0, 0).setDepth(-2); 
        this.waveOffset = 300;  // Valor inicial para animação das ondas
        
        // === Configuração de escalas relativas ao tamanho da tela ===
        this.playerScale = width / 600;  // Escala proporcional para o pescador
        this.baitScale = this.playerScale * 0.1;  // Escala proporcional para a isca
        
        // === Criação do pescador ===
        // Adiciona o sprite do pescador no meio superior da tela
        this.player = this.add.sprite(width / 2, 100, 'fisher').setScale(this.playerScale); 
        
        // === Criação da hitbox (área de colisão) da isca ===
        // Retângulo vermelho semitransparente para detectar colisões
        this.baitHitbox = this.add.rectangle(width / 2, height / 2, 15, 15, 0xff0000, 1); 
        this.baitHitbox.setOrigin(0.5, 0.5);  // Define a origem para o centro
        this.baitHitbox.setStrokeStyle(1, 0xffffff);  // Adiciona contorno branco
        this.baitHitbox.setVisible(true);  // Torna visível para debugging
        
        // === Criação da imagem da isca ===
        // A imagem da isca seguirá a posição da hitbox
        this.bait = this.add.image(this.baitHitbox.x, this.baitHitbox.y, 'bait').setScale(this.baitScale); 

        // === Criação da linha de pesca ===
        // Objeto Graphics permite desenhar formas primitivas
        this.line = this.add.graphics(); 

        // === Define os limites de movimento da isca ===
        this.bounds = {
            left: 10,                    // Limite esquerdo
            right: width - 10,           // Limite direito
            top: this.player.y + 40,     // Limite superior (abaixo do pescador)
            bottom: height - 10          // Limite inferior
        };

        // === Inicialização de variáveis de estado ===
        this.targetPos = { x: this.baitHitbox.x, y: this.baitHitbox.y };  // Posição alvo da isca
        this.lastPointerY = null;        // Última posição Y do cursor
        this.smoothDeltaY = 0;           // Suavização do movimento vertical
        this.smoothRod = { x: this.player.x, y: this.player.y };  // Posição suavizada da vara
        this.isCatching = false;         // Flag para verificar se está pescando

        // === Configuração de entrada do usuário ===
        // Evento disparado quando o mouse/toque se move
        this.input.on('pointermove', pointer => {
            // Atualiza a posição alvo com a posição do cursor
            this.targetPos.x = pointer.x;
            this.targetPos.y = pointer.y;
        });

        // === Criação das animações do pescador ===
        
        // Animação de idle (repouso)
        this.anims.create({
            key: 'idle',                 // Nome da animação
            frames: [{ key: 'fisher', frame: 28 }],  // Quadro único
            frameRate: 1,                // Velocidade (quadros por segundo)
            repeat: 0                   // Repetir infinitamente
        });

        // Animação de abaixar a vara
        this.anims.create({
            key: 'rod_down', 
            frames: this.anims.generateFrameNumbers('fisher', { start: 31, end: 34 }),
            frameRate: 15,
            repeat: 0                    // Não repetir (executa uma vez)
        });

        // Animação de levantar a vara
        this.anims.create({
            key: 'rod_up', 
            frames: this.anims.generateFrameNumbers('fisher', { start: 33, end: 36 }),
            frameRate: 15,
            repeat: 0
        });

        // Animação de pescar
        this.anims.create({
            key: 'catch', 
            frames: this.anims.generateFrameNumbers('fisher', { start: 29, end: 38 }),
            frameRate: 15,
            repeat: 0
        });

        // === Estado inicial do jogo ===
        this.player.play('idle');        // Inicia com animação de idle
        this.currentAnim = 'idle';       // Registra a animação atual

        // === Configuração de eventos de animação ===
        // Ouvinte disparado quando uma animação termina
        this.player.on('animationcomplete', anim => {
            if (anim.key === 'catch') { 
                this.isCatching = false;           // Finaliza o estado de pesca
                this.player.play('idle', true);    // Volta para animação de idle
                this.currentAnim = 'idle'; 
            } else if (['rod_down', 'rod_up'].includes(anim.key) && !this.isCatching) {
                this.player.play('idle', true);    // Volta para idle após mover a vara
                this.currentAnim = 'idle';
            }
        });

        // === Grupo de peixes ===
        // Cria um grupo para armazenar todos os peixes ativos
        this.fishGroup = this.add.group();

        // === Grupo de baleias ===
        // Cria um grupo para armazenar todas as baleias ativas
        this.whaleGroup = this.add.group();

        // Lista de tipos de peixes disponíveis
        this.fishTypes = ['Anchova', 'Corvina', 'Linguado', 'Pampos', 'Tainha'];

        // Lista de tipos de baleias disponíveis
        this.whaleTypes = ['Baleia'];

        // === Timer para spawn de peixes ===
        // Cria um evento que chama spawnFish em intervalos regulares
        this.time.addEvent({
            delay: 900,        // A cada 0.9 segundos
            callback: this.spawnFish,
            callbackScope: this,
            loop: true
        });

        // === Timer para spawn de baleias ===
        // Cria um evento que chama spawnWhale em intervalos mais longos (mais raro)
        this.time.addEvent({
            delay: 5000,       // A cada 5 segundos (mais raro que peixes)
            callback: this.spawnWhale,
            callbackScope: this,
            loop: true
        });
    }

    // === Função para spawnar um peixe ===
    spawnFish() {
        const width = this.scale.width;
        const height = this.scale.height;

        // Escolhe um peixe aleatório da lista
        const fishKey = Phaser.Utils.Array.GetRandom(this.fishTypes);

        // Define posição inicial fora da tela (esquerda ou direita)
        const fromLeft = Phaser.Math.Between(0, 1) === 0;
        const x = fromLeft ? - 20 : width + 20;
        const y = Phaser.Math.Between(this.player.y + 80, height - 20);

        // Cria o sprite do peixe
        const fish = this.add.image(x, y, fishKey).setScale(1.0);

        // === Criação da hitbox do peixe ===
        // Cria um retângulo vermelho semitransparente para a hitbox do peixe
        const fishHitbox = this.add.rectangle(fish.x, fish.y, fish.width, fish.height, 0xff0000, 0.3); 
        fishHitbox.setOrigin(0.5, 0.5);  // Define a origem para o centro
        fishHitbox.setStrokeStyle(1, 0xffffff);  // Adiciona contorno branco
        fishHitbox.setVisible(true);  // Torna visível para debugging

        // Se vier da direita, inverte o sprite (espelhado)
        if (!fromLeft) {
            fish.setFlipX(true);
        }

        // Define velocidade aleatória para peixes (mais rápida)
        const speed = Phaser.Math.Between(50, 100);

        // Adiciona o peixe ao grupo com suas propriedades
        this.fishGroup.add(fish);
        fish.setData('speed', speed * (fromLeft ? 1 : -1));
        fish.setData('hitbox', fishHitbox);  // Armazena a hitbox associada a este peixe
    }

    // === Função para spawnar uma baleia ===
    spawnWhale() {
    if( (Phaser.Math.Between(1, 100)) < 100 ){
        const width = this.scale.width;
        const height = this.scale.height;

        // Escolhe uma baleia aleatória da lista
        const whaleKey = Phaser.Utils.Array.GetRandom(this.whaleTypes);

        // Define posição inicial fora da tela (esquerda ou direita)
        const fromLeft = Phaser.Math.Between(0, 1) === 0;
        const x = fromLeft ? - 50 : width + 50;
        // Baleias nadam mais no fundo (mais perto do fundo da tela)
        const y = Phaser.Math.Between(height - 100, height - 30);

        // Cria o sprite da baleia com escala maior
        const whale = this.add.image(x, y, whaleKey).setScale(1.0);

        // === Criação da hitbox da baleia ===
        // Cria um retângulo azul semitransparente para a hitbox da baleia
        const whaleHitbox = this.add.rectangle(whale.x, whale.y, whale.width, whale.height, 0x0000ff, 0.3); 
        whaleHitbox.setOrigin(0.5, 0.5);  // Define a origem para o centro
        whaleHitbox.setStrokeStyle(1, 0xffffff);  // Adiciona contorno branco
        whaleHitbox.setVisible(true);  // Torna visível para debugging

        // Se vier da direita, inverte o sprite (espelhado)
        if (!fromLeft) {
            whale.setFlipX(true);
        }

        // Define velocidade para baleias (mais lenta que peixes)
        const speed = Phaser.Math.Between(20, 40);  // Velocidade menor que peixes

        // Adiciona a baleia ao grupo com suas propriedades
        this.whaleGroup.add(whale);
        whale.setData('speed', speed * (fromLeft ? 1 : -1));
        whale.setData('hitbox', whaleHitbox);  // Armazena a hitbox associada a esta baleia
    }else return;
}

    // === Atualização da linha de pesca ===
    updateFishingLine() {
        // Desenha a linha da vara até a isca
        this.line.beginPath(); 
        this.line.moveTo(this.smoothRod.x, this.smoothRod.y);  // Início na ponta da vara
        this.line.lineTo(this.baitHitbox.x, this.baitHitbox.y);  // Fim na isca
        this.line.strokePath();  // Aplica o traço
    }

    // === Atualização dos peixes ===
    updateFish() {
        const width = this.scale.width;
        // Move cada peixe e remove se sair da tela
        this.fishGroup.getChildren().forEach(fish => {
            // Obtém a velocidade armazenada nos dados do peixe
            const speed = fish.getData('speed');
            // Obtém a hitbox associada ao peixe
            const fishHitbox = fish.getData('hitbox');
            
            // Move o peixe baseado na velocidade e tempo delta
            fish.x += speed * (this.game.loop.delta / 1000);
            
            // Move a hitbox junto com o peixe
            if (fishHitbox) {
                fishHitbox.x = fish.x;
                fishHitbox.y = fish.y;
            }
            
            // Remove peixes que saíram da tela
            if ((speed > 0 && fish.x > width + 100) || (speed < 0 && fish.x < -100)) {
                // Destroi tanto o peixe quanto sua hitbox
                fish.destroy();
                if (fishHitbox) fishHitbox.destroy();                
            }
        });
    }

    // === Atualização das baleias ===
    updateWhales() {
        const width = this.scale.width;
        // Move cada baleia e remove se sair da tela
        this.whaleGroup.getChildren().forEach(whale => {
            // Obtém a velocidade armazenada nos dados da baleia
            const speed = whale.getData('speed');
            // Obtém a hitbox associada à baleia
            const whaleHitbox = whale.getData('hitbox');
            
            // Move a baleia baseado na velocidade e tempo delta
            whale.x += speed * (this.game.loop.delta / 1000);
            
            // Move a hitbox junto com a baleia
            if (whaleHitbox) {
                whaleHitbox.x = whale.x;
                whaleHitbox.y = whale.y;
            }
            
            // Remove baleias que saíram da tela
            if ((speed > 0 && whale.x > width + 150) || (speed < 0 && whale.x < -150)) {
                // Destroi tanto a baleia quanto sua hitbox
                whale.destroy();
                if (whaleHitbox) whaleHitbox.destroy();                
            }
        });
    }

    // === Atualização do fundo animado ===
    updateBackground(width, height) {
        this.waveOffset += 0.01;  // Incrementa o offset para animação
        const canvas = this.textures.get('bgCanvas').getSourceImage();
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, width, height);  // Limpa o canvas

        // Cria um gradiente linear com cores que variam com o tempo
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        const lightness = 50 + Math.sin(this.waveOffset) * 10; 
        const darkLightness = 20 + Math.sin(this.waveOffset + Math.PI / 2) * 10;
        gradient.addColorStop(0, `hsl(200, 80%, ${lightness}%)`);
        gradient.addColorStop(1, `hsl(220, 80%, ${darkLightness}%)`);

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        this.textures.get('bgCanvas').refresh();  // Atualiza a textura
    }

    // === Atualização da posição da isca ===
    updateBait() {
        // === Movimento da hitbox da isca ===
        if (!this.targetPos) return;
        
        // Limita a posição alvo aos limites definidos
        const clampedX = Phaser.Math.Clamp(this.targetPos.x, this.bounds.left, this.bounds.right);
        const clampedY = Phaser.Math.Clamp(this.targetPos.y, this.bounds.top, this.bounds.bottom);

        // Suaviza o movimento usando interpolação linear
        const smoothFactor = 0.10;
        this.baitHitbox.x = Phaser.Math.Linear(this.baitHitbox.x, clampedX, smoothFactor);
        this.baitHitbox.y = Phaser.Math.Linear(this.baitHitbox.y, clampedY, smoothFactor);

        // A imagem da isca segue a hitbox
        this.bait.x = this.baitHitbox.x;
        this.bait.y = this.baitHitbox.y;
    }

    // === Atualização das animações do pescador ===
    updateRodAnimation() {
        // === Detecção de movimento vertical para animações ===
        if (this.lastPointerY !== null && !this.isCatching) { 
            const deltaY = this.baitHitbox.y - this.lastPointerY;  // Diferença de posição Y
            const threshold = 2.5;  // Limite mínimo para considerar movimento
            // Suaviza a diferença para evitar animações tremulas
            this.smoothDeltaY = this.smoothDeltaY * 0.7 + deltaY * 0.3; 

            // Decide qual animação reproduzir baseada no movimento
            if (this.smoothDeltaY > threshold && this.currentAnim !== 'rod_down') {
                this.player.play('rod_down', true);  // Move vara para baixo
                this.currentAnim = 'rod_down'; 
            } else if (this.smoothDeltaY < -threshold && this.currentAnim !== 'rod_up') {
                this.player.play('rod_up', true);    // Move vara para cima
                this.currentAnim = 'rod_up'; 
            } else if (Math.abs(this.smoothDeltaY) <= threshold && this.currentAnim !== 'idle') {
                this.player.play('idle', true);      // Volta ao repouso
                this.currentAnim = 'idle'; 
            }
        }
        this.lastPointerY = this.baitHitbox.y;  // Armazena a posição atual para o próximo frame
    }

    // === Verificação de captura ===
    checkCatch() {
        // === Verificação de captura (quando a isca está perto do pescador) ===
        const dist = Phaser.Math.Distance.Between(
            this.baitHitbox.x, this.baitHitbox.y, 
            this.player.x, this.player.y
        );
        if (dist < 60 && !this.isCatching) { 
            this.isCatching = true;           // Ativa estado de pesca
            this.player.play('catch', true);  // Reproduz animação de pescar
            this.currentAnim = 'catch'; 
        }
    }

    // === Atualização da vara e da linha ===
    updateRodAndLine(width) {
        // === Atualização da linha de pesca ===
        this.line.clear();  // Limpa o desenho anterior
        this.line.lineStyle(1.3, 0xffffff, 2);  // Define estilo da linha (espessura, cor, alpha)
        
        // Fatores de escala para adaptar a diferentes tamanhos de tela
        const scaleFactor = this.player.scaleX; 
        const widthFactor = width / 800; 

        // Posição alvo da ponta da vara (depende da animação atual)
        let playerRodX = this.player.x; 
        let playerRodY = this.player.y; 

        // Ajusta a posição da ponta da vara baseado na animação
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

        // Suaviza o movimento da ponta da vara
        this.smoothRod.x = Phaser.Math.Linear(this.smoothRod.x, playerRodX, 0.90); 
        this.smoothRod.y = Phaser.Math.Linear(this.smoothRod.y, playerRodY, 0.90); 
        this.updateFishingLine();  // Atualiza a linha de pesca
    }

    // Método update: executado a cada frame (aproximadamente 60 vezes por segundo)
    update() {
        const width = this.scale.width; 
        const height = this.scale.height; 

        // === Atualização do fundo animado ===
        this.updateBackground(width, height);

        // === Movimento da hitbox da isca ===
        this.updateBait();

        // === Detecção de movimento vertical para animações ===
        this.updateRodAnimation();

        // === Verificação de captura (quando a isca está perto do pescador) ===
        this.checkCatch();

        // === Atualização da vara e da linha ===
        this.updateRodAndLine(width);

        // === Atualização dos peixes ===
        this.updateFish();

        // === Atualização das baleias ===
        this.updateWhales();
    }
}