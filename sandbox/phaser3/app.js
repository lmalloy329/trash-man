// create Phaser.Game object named "game"
let gameOptions = {
    spawnRange: [80, 300],
    platformSizeRange: [75, 250],
    playerGravity: 900,
    playerStartPosition: 200,
    jumps: 2,
    platformVerticalLimit: [0.4, 0.8],
    platformHeightRange: [-10, 10],
    platformHeightScale: 10,
    platformSpeedRange: [200, 200],



}
 


var config = {
    type: Phaser.AUTO,
    width: 1334,
    height: 600,
    physics: {
        default: 'arcade',
    },
    scene: [{
        preload: preload,
        create: create,
        update: update
    }]
};
let game = new Phaser.Game(config)
// declare global variables for game
var player
var arrowkey
var ground 
var platforms
var wall
var camera
var platformGroup
var platformPool
var randomPlatform

// var grabKey

// preload game assets - runs once at start
function preload() {
    this.load.spritesheet('player', "assets/dude.png", {frameWidth: 32, frameheight: 48})
    this.load.image("wall", "assets/wallwrap.png")
    this.load.image("ground", "assets/floo1r.png")
}

// create game world - runs once after "preload" finished
function create() { 
    //creating a camera that follows the player
    // camera = this.cameras.main
    // camera.setBounds(0,0, 5000, 600)
    // this.physics.world.setBounds(0, 0, 5000, 600)

    //creating backgound
    wall = this.add.tileSprite(400, 300, 2000, 600,'wall')
    // intitalizes platform group
    platformGroup = this.add.group();
    platformGroup.enableBody = true;

    platformPool = this.add.group();
    platformGroup.enableBody = false;

    //count for players so they can only jump twice in a row
    this.playerJumps = 0

    // ground = this.physics.add.staticGroup();
    // ground.create(400, 568, 'ground') .refreshBody()
    
    //ceate player and add physics
    player = this.physics.add.sprite(gameOptions.playerStartPosition, game.config.height * 0.7, "player");
    player.setGravityY(gameOptions.playerGravity)
    player.setBounce(.3)


    //allows camera to follow player throughout game
    // camera.startFollow(player)
    //group of active platforms
    platforms = this.physics.add.group()
    this.platformGroup = this.add.group({
        removeCallback: function(platform){
            platform.scene.platformPool.add(platform)
        }
    });
    //group of incative platforms
    this.platformPool = this.add.group({
        removeCallback: function(platform){
            platform.scene.platformGroup.add(platform)
        }
    });
    //creates polatform physic and platform generator
    randomPlatform = (platformWidth, posX , posY) => {
        if(this.platformPool.getLength()>1){
            platform = this.platformPool.getFirst();
            platform.x = posX;
            platform.active = true;
            platform.visible = true;
            this.platformPool.remove(platform)
        }else{  
            console.log("entered else")
            platform = this.add.tileSprite(posX, posY, platformWidth, 32, "ground");
            this.physics.add.existing(platform);
            platform.body.setImmovable(true);
            platform.body.setVelocityX(Phaser.Math.Between(gameOptions.platformSpeedRange[0], gameOptions.platformSpeedRange[1]) * -1);
            platform.setDepth(2);
            this.platformGroup.add(platform);
        }
       platform.displayWidth = platformWidth;
    }
    
    randomPlatform(2000, 200, 500)



    //animates movement of player
    this.anims.create({
        key: 'left', 
        frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [ { key: 'player', frame: 4 } ],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('player', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    //inititates abillity to use keyboard cursors
    arrowkey = this.input.keyboard.createCursorKeys()

   
    //creates physics between objects in game
    this.physics.add.collider(player, ground);
    this.physics.add.collider(player, this.platformGroup)
     // recycling platforms

 
}

// update gameplay - runs in continuous loop after "create" finished
function update() {
    //provides rules for how fast player moves and when animation changes
    if(player.y > game.config.height){
        this.scene.start("PlayGame");
    }
    player.x = gameOptions.playerStartPosition;
    console.log(player)
    if(arrowkey.right.isDown){
        player.setVelocityX(300)
        player.anims.play('right')
    
    }else if(arrowkey.left.isDown) {
        player.setVelocityX(-150)
        player.anims.play('left')

    } else if(arrowkey.up.isDown){
        if(player.body.touching.down) {
            this.playerJumps = 0
        }
        if(this.playerJumps < 3){
            console.log(this.playerJumps)
        player.setVelocityY(-450)
        player.anims.play('turn')
        this.playerJumps+=1
        }

    } else {
        player.setVelocityX(0)
        player.anims.play('turn')
    }
    nextPlatformDistance = Phaser.Math.Between(gameOptions.spawnRange[0], gameOptions.spawnRange[1]);
       // recycling platforms
       let minDistance = game.config.width;
       let rightmostPlatformHeight = 0;
       this.platformGroup.getChildren().forEach(function(platform){
           let platformDistance = game.config.width - platform.x - platform.displayWidth / 2;
           if(platformDistance < minDistance){
               minDistance = platformDistance;
               rightmostPlatformHeight = platform.y;
           }
           if(platform.x < - platform.displayWidth / 2){
               this.platformGroup.killAndHide(platform);
               this.platformGroup.remove(platform);
           }
       }, this);

       // adding new platforms
       if(minDistance > nextPlatformDistance){
           let nextPlatformWidth = Phaser.Math.Between(gameOptions.platformSizeRange[0], gameOptions.platformSizeRange[1]);
           let platformRandomHeight = gameOptions.platformHeightScale * Phaser.Math.Between(gameOptions.platformHeightRange[0], gameOptions.platformHeightRange[1]);
           let nextPlatformGap = rightmostPlatformHeight + platformRandomHeight;
           let minPlatformHeight = game.config.height * gameOptions.platformVerticalLimit[0];
           let maxPlatformHeight = game.config.height * gameOptions.platformVerticalLimit[1];
           let nextPlatformHeight = Phaser.Math.Clamp(nextPlatformGap, minPlatformHeight, maxPlatformHeight);
           randomPlatform(nextPlatformWidth, game.config.width + nextPlatformWidth / 2, nextPlatformHeight);

       }
 wall.tilePositionX += 0.5
}

// add custom functions (for collisions, etc.)