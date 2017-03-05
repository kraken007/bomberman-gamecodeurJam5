var game = new Phaser.Game(1024, 768, Phaser.CANVAS, 'game');

var play = {
    preload: function () {
        console.log('preload');
        //taille des sprite
        this.taillePico = 32;
        // speed player
        this.speed = 4;
        //nextBombeTime
        this.nextBombe = 0;
        //temps de latence entre chaque pose de bombe en ms
        this.rateBombe = 1000;
        //import animation bombes
        game.load.spritesheet('bombe', './images/bombe-tileset.png', 40, 40, 10);
        //import image personage
        game.load.image('face', './images/perso-fix.png');
        game.load.image('dos', './images/perso-back.png');
        game.load.image('droite', './images/perso-right.png');
        game.load.image('gauche', './images/perso-left.png');
        game.load.spritesheet('player', './images/player.png',20,32,4,0,1);

        //import map image
        game.load.image('wall', './images/wall.png');
        game.load.image('wall2', './images/wall-2.png');
        game.load.image('destruct-wall', './images/destruct-wall.png');
        game.load.image('ground', './images/ground.png');
        console.log(' fin preload');
    },
    create: function () {
        console.log('create');
        //this.bombe = game.add.sprite(150, 150, 'bombe');
        //this.bombe.animations.add('explode', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 10, true);
        //this.bombe.animations.play('explode');

        this.mapSource = [
            [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
            [2, 3, 3, 3, 3, 3, 3, 3, 3, 2],
            [2, 3, 1, 1, 3, 3, 1, 1, 3, 2],
            [2, 3, 3, 0, 0, 0, 0, 3, 3, 2],
            [2, 3, 3, 0, 0, 0, 0, 1, 3, 2],
            [2, 3, 1, 1, 3, 3, 1, 1, 3, 2],
            [2, 3, 3, 3, 3, 3, 3, 3, 3, 2],
            [2, 3, 1, 3, 3, 3, 1, 3, 3, 2],
            [2, 3, 3, 3, 3, 3, 3, 3, 3, 2],
            [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],

        ];
        this.nbLignes = this.mapSource.length;
        this.nbColonnes = this.mapSource[0].length;
        console.log(this.nbLignes + ' ' + this.nbColonnes);
        //calcal coord de départ pour centré la map dans la fenetre de jeu
        this.startCoord();
        console.log(this.startX + ' ' + this.startY );
        this.map = [];
        for (var lignes = 0; lignes < this.nbLignes; lignes++) {
            this.map.push(new Array(this.nbColonnes));
            for (var colones = 0; colones < this.nbColonnes; colones++) {
                //calcul coord sprite
                var x = this.taillePico * colones + this.startX;
                var y = this.taillePico * lignes + this.startY;
                console.log(x + ' ' + y);
                //choix image
                var image = '';
                switch (this.mapSource[lignes][colones]) {
                    case 0: 
                        image = 'ground';
                        break;
                    case 1:
                        image = 'wall';
                        break;
                    case 2:
                        image = 'wall2';
                        break;
                    case 3:
                        image = 'destruct-wall';
                        break;
                    default:
                        image = 'ground';
                }
                var sol = game.add.sprite(x, y, 'ground');
                sol.setScaleMinMax(2, 2);
                this.map[lignes][colones] = game.add.sprite(x, y, image);
                this.map[lignes][colones].setScaleMinMax(2, 2);
            }
        }

        //création du perso
        this.player = game.add.sprite(4 * this.taillePico + this.startX, 4 * this.taillePico + this.startY, 'player');
        this.player.animations.add('down', [0], 1, false);
        this.player.animations.add('up', [1], 1, false);
        this.player.animations.add('left', [2], 1, false);
        this.player.animations.add('right', [3], 1, false);
        this.player.setScaleMinMax(1.4, 1, 1.4, 1);

        //gestion des bombes
        this.bombes = game.add.group();
        this.bombes.createMultiple(20, 'bombe', 0, false);
        this.bombes.callAll('animations.add', 'animations', 'explode', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 10, false);

        //interception des event clavier
        game.input.keyboard.addKeyCapture(
            [
                Phaser.Keyboard.LEFT,
                Phaser.Keyboard.RIGHT,
                Phaser.Keyboard.UP,
                Phaser.Keyboard.DOWN,
                Phaser.Keyboard.SPACEBAR,
            ]
        );

        console.log('fin create');
    },
    update: function () {
        //mouvement du player
        if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
            this.player.x -= this.speed;
            this.player.animations.play('left');            
        }
        else if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
            this.player.x += this.speed;
            this.player.animations.play('right');
        }
        else if (game.input.keyboard.isDown(Phaser.Keyboard.UP)){
            this.player.y -= this.speed;
            this.player.animations.play('up');
        } else if (game.input.keyboard.isDown(Phaser.Keyboard.DOWN)) {
            this.player.y += this.speed;
            this.player.animations.play('down');
        }

        if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR) && this.nextBombe < game.time.now) {
            console.log('bombe!');
            this.nextBombe = game.time.now + this.rateBombe;
            var bombe = this.bombes.getFirstExists(false);
            if (bombe) {
                bombe.x = Math.floor((this.player.x - this.startX) / this.taillePico) * this.taillePico + this.startX;
                bombe.y = Math.floor((this.player.y - this.startY) / this.taillePico) * this.taillePico + this.startY;
                bombe.exists = true
                bombe.lifespan = 1000;
                if (!bombe.animations.isFinished) {
                    bombe.animations.stop();
                }
                bombe.animations.play('explode');
            }
        }
    },
    render: function () {

    },
    test: function () {

    },
    startCoord: function () {
        this.startX = (game.world.width - (this.nbColonnes * this.taillePico)) / 2;
        this.startY = (game.world.height - (this.nbLignes * this.taillePico)) / 2;
    },
};

var toolBox = {
    
};

game.state.add('play', play);

game.state.start('play');