// create Phaser.Game object named "game"
let gameOptions = {
    platformStartSpeed: 350,
    spawnRange: [100, 350],
    platformSizeRange: [50, 250],
    playerGravity: 900,
    jumpForce: 400,
    playerStartPosition: 200,
    jumps: 2
}
 


var config = {
    type: Phaser.AUTO,
    width: 800,
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
var game = new Phaser.Game(config)

// declare global variables for game
var player
var arrowkey
var ground 
var platforms
var wall
var camera
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
    wall = this.add.tileSprite(400, 300, 1000, 600,'wall')

    //removes used platforms and add them back to pool
this.platformGroup = this.add.group({
    removeCallback: function(platform){
        platform.scene.platformPool.add(platform)
    }
})
    // takes platforms from the pool and adds them back to the scene
    this.platformPool = this.add.group({
        remveCallback: function(platform){
            platform.scene.platformGroup.add(platform)
        }
    })

    //count for players 

    //creating ground
    ground = this.physics.add.staticGroup();
    ground.create(400, 568, 'ground') .refreshBody()
    
    //ceate player and add physics
    player = this.physics.add.sprite(100 , 450,'player')
    player.setGravityY(gameOptions.playerGravity)
    player.setBounce(.3)
    player.setCollideWorldBounds(true)

    //allows camera to follow player throughout game
    // camera.startFollow(player)

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
}

// update gameplay - runs in continuous loop after "create" finished
function update() {
    //provides rules for how fast player moves and when animation changes
    if(arrowkey.right.isDown){
        player.setVelocityX(150)
        player.anims.play('right')
    
    }else if(arrowkey.left.isDown) {
        player.setVelocityX(-150)
        player.anims.play('left')

    } else if(arrowkey.up.isDown && player.body.touching.down){
        player.setVelocityY(-150)
        player.anims.play('turn')
    } else {
        player.setVelocityX(0)
        player.anims.play('turn')
    }
    wall.tilePositionX += 0.5
}

// add custom functions (for collisions, etc.)