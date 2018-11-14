/// <reference path="typings/globals/pixi.js/index.d.ts"/>

let width = 800;
let height = 800;

let app = new PIXI.Application({ width: width, height: height });
let space_ship;
let state;
let left, right, up, down;
let projectile_array = [];
//Vars for general speed and movements
let booster_on=false;
let projectile_speed_mul = 7;


document.body.appendChild(app.view);


function setup()
{

    //Draw the spaceship shape
    let triangle = new PIXI.Graphics(true);
    triangle.lineStyle(2, 0xFFFFFF);
    triangle.drawPolygon([
        0,0,
        0,32,
        40,16
    ]);


    
   

    //Convert the spaceship drawing to a sprite   
    space_ship = new PIXI.Sprite(triangle.generateCanvasTexture());
    space_ship.x = 200;
    space_ship.y = 200;
    space_ship.linear_friction = 0.04;
    //How much the linear speed will increment
    space_ship.linear_acc = 5;
    space_ship.vx = 0;
    space_ship.vy = 0;
    space_ship.anchor.x = 0.5;
    space_ship.anchor.y = 0.5;
    space_ship.rotation = 0;
    space_ship.av = 0;
    //How much the angular speed will increment 
    space_ship.angular_acc = 0.05;
    

    //Add the spaceship sprite to the stage    
    app.stage.addChild(space_ship);

    //Set the keyboard events
    left = keyboard("ArrowLeft");
    up = keyboard("ArrowUp");
    right = keyboard("ArrowRight");
    down = keyboard("ArrowDown");
    //CTRL for fire
    fire = keyboard("Control");


    //Manage the keyboard events    
    up.press = () => {
        booster_on = true;
    };
    up.release = () => {
        booster_on = false;
    };
    
    fire.press = () => {
        fireBullet();
    };
    
    left.press = () => {
        if(!right.isDown) space_ship.av = -1*space_ship.angular_acc;
    };
    left.release = () => {
        space_ship.av = 0;
    };

    right.press = () => {
        if(!left.isDown) space_ship.av = space_ship.angular_acc;
    };
    right.release = () => {
        space_ship.av = 0;
    };

    //I don't think a spaceship can go backward
  /*down.press = () => {
        space_ship.vy = space_ship.linear_acc;
    };
    down.release = () => {
        space_ship.vy = 0;
    };*/

    //Set the game state
    state = play;
    //Start the game loop
    app.ticker.add(delta => gameLoop(delta));
}


//Helper to refresh the speed every frame
function refreshVelocity()
{
    //console.log(space_ship.vx+" "+space_ship.vy);
    //If booster is on apply a constant acceleration to the ship
    if(booster_on)
    {
        space_ship.vy = Math.sin(space_ship.rotation)*space_ship.linear_acc;
        space_ship.vx = Math.cos(space_ship.rotation)*space_ship.linear_acc;
    }
    else
    {
        //The spaceship should decelerate and not stop immediatelty after releasing up key
        if(space_ship.vy != 0 || space_ship.vx != 0)
        {
            //I need the direction of the speed vector
            if(space_ship.vx != 0) x_dir = (space_ship.vx / Math.abs(space_ship.vx));
            else x_dir = 0;
            if(space_ship.vy != 0) y_dir = (space_ship.vy / Math.abs(space_ship.vy));
            else y_dir = 0;
            
            space_ship.vy += -1*y_dir*space_ship.linear_friction;
            space_ship.vx += -1*x_dir*space_ship.linear_friction;
        }
    }
}

function fireBullet()
{
    //Draw the projectile
    let projectile_draw = new PIXI.Graphics();
    projectile_draw.beginFill(0xFFFFFF);
    projectile_draw.drawCircle(space_ship.x, space_ship.y, 3);
    projectile_draw.endFill();
    //Make the circle a sprite
    projectile = new PIXI.Sprite(projectile_draw.generateCanvasTexture());
    projectile.x = Math.cos(space_ship.rotation)*20+space_ship.x;
    projectile.y = Math.sin(space_ship.rotation)*20+space_ship.y;
    projectile.vy = Math.sin(space_ship.rotation) * projectile_speed_mul ;
    projectile.vx = Math.cos(space_ship.rotation) * projectile_speed_mul;
    projectile.distance = 0;

    //Push the new projectile to the array of projectiles
    projectile_array.push(projectile);
    app.stage.addChild(projectile);

    
}

function spawnMeteorite()
{
    let meteorite_draw = new PIXI.Graphics();
    meteoride_draw.lineStyle(5, 0xFFFFFF);
    

    
}

function gameLoop(delta)
{
    state(delta);
}


function play(delta)
{
    //Refresh the speed vectory every frame
    refreshVelocity();
    space_ship.x += space_ship.vx;
    space_ship.y += space_ship.vy;
    infitifyCoord(space_ship);
    space_ship.rotation += space_ship.av;

    //Bullet speed management
    for(i=0;i<projectile_array.length; i++)
    {
        aux = projectile_array[i];
        aux.x += aux.vx;
        aux.y += aux.vy;
        aux.distance += Math.sqrt(aux.vx*aux.vx + aux.vy*aux.vy);
        //Bullet's lifetime is short. It's only alive for "width" space
        if(aux.distance > width)
        {
             app.stage.removeChild(aux);
             //If a bullet is dead we need to remove it from the array 
             projectile_array.splice(i,1);
        }
        else
            infitifyCoord(aux);

    }
}

//Videogame effect: no boundaries in the screen
//I made a function so everytime you need to move somethig
//you pass the latter as the argument
function infitifyCoord(obj)
{
    if(obj.x > width || obj.x < 0)
    {
        obj.x = width - obj.x;
        obj.y = height - obj.y;
    }
    if(obj.y > height || obj.y < 0)
    {
        obj.y = height - obj.y
        obj.x = width - obj.x;
    }
}

//Keyboard Helper
function keyboard(value) 
{
    let key = {};
    key.value = value;
    key.isDown = false;
    key.isUp = true;
    key.press = undefined;
    key.release = undefined;
    //The `downHandler`
    key.downHandler = event => {
      if (event.key === key.value) {
        if (key.isUp && key.press) key.press();
        key.isDown = true;
        key.isUp = false;
        event.preventDefault();
      }
    };
  
    //The `upHandler`
    key.upHandler = event => {
      if (event.key === key.value) {
        if (key.isDown && key.release) key.release();
        key.isDown = false;
        key.isUp = true;
        event.preventDefault();
      }
    };
  
    //Attach event listeners
    const downListener = key.downHandler.bind(key);
    const upListener = key.upHandler.bind(key);
    
    window.addEventListener(
      "keydown", downListener, false
    );
    window.addEventListener(
      "keyup", upListener, false
    );
    
    // Detach event listeners
    key.unsubscribe = () => {
      window.removeEventListener("keydown", downListener);
      window.removeEventListener("keyup", upListener);
    };
    
    return key;
  }


//Start the game
setup();