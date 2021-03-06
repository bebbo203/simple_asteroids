let width = document.body.clientWidth/2;
let height = document.body.clientHeight;
let background;

//I need a var for the virtual screen
//gameScreen dimensions
gameScreen_x = width;
gameScreen_y = height;
//gameScreen origin
gameScreen_ox = 0;
gameScreen_oy = 0;

let app = new PIXI.Application({ width: width, height: height });
let space_ship;
let state;
let left, right, up, down, fire, space;
let projectile_array = [];
let meteorite_array = [];
let lives_array = [];
//Vars for general speed and movements
let booster_on=false;
let projectile_speed_mul = 7;
let elapsed_time = 0;
let next_meteorite = 3;
let firstStart = true;
let max_lives = 1;
let endGame;
let points_str;

//I need it for the ticker
let RESTART = 0;
//GAME OVER label
let end_message;


document.body.appendChild(app.view);


function setup()
{

    //Reset the RESTART page
    console.log("ANCHE QUI")
    /*var restart_div = document.getElementById("restart_game");
    restart_div.style.visibility = "hidden";
    var restart_button = document.getElementById("restart_button");
    restart_button.style.pointerEvents = "none";
    var change_nickname_button = document.getElementById("change_nickname_button");
    change_nickname_button.style.pointerEvents = "none";
    app.stage.removeChild(end_message);*/
    document.getElementById("restart_game").style.visibility = "hidden";
    document.getElementById("restart_button").style.pointerEvents = "none";
    document.getElementById("change_nickname_button").style.pointerEvents = "none";
    document.getElementById("home_button").style.pointerEvents = "none";

    
    booster_on = false;

    console.log("PARTITO");

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
    space_ship.x = (gameScreen_x+gameScreen_ox)/2;
    space_ship.y = (gameScreen_y+gameScreen_oy)/2;
    space_ship.linear_friction = 0.04;
    //How much the linear speed will increment
    space_ship.linear_acc = 3;
    space_ship.vx = 0;
    space_ship.vy = 0;
    space_ship.anchor.x = 0.5;
    space_ship.anchor.y = 0.5;
    space_ship.rotation = 0;
    //Angular acceleration
    space_ship.av = 0;
    space_ship.points = 0;

    
    space_ship.lives = max_lives;
    //How much the angular speed will increment 
    space_ship.angular_acc = 0.05;

    app.stage.addChild(space_ship);
    
    //Create lives icon
    for(i=0; i<space_ship.lives; i++)
    {
        let live = new PIXI.Sprite(triangle.generateCanvasTexture());
        live.rotation = -Math.PI/2;
        live.scale.x = 0.7;
        live.scale.y = 0.7;
        live.x = gameScreen_ox + 20 + i*30;
        live.y = gameScreen_oy + 45;
        app.stage.addChild(live);
        lives_array.push(live);
    }

    //Set the keyboard events
    left = keyboard("ArrowLeft");
    up = keyboard("ArrowUp");
    right = keyboard("ArrowRight");
    down = keyboard("ArrowDown");
    //CTRL for fire
    fire = keyboard("Control");
    //Space for debug
    space = keyboard(" ");


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

    //Debug the meteorite generator
    space.press = () => {
        console.log("Should spawn");
        spawnMeteorite();
    }

    //Start the game with 5 meteorite in the canvas
    for(i=0;i<5;i++)
        spawnMeteorite();

    //Set the game state
    state = play;
    //Start the game loop
    if(!RESTART)
        app.ticker.add(delta => gameLoop(delta));
    else
    //I stopped it at the endGame
        app.ticker.start();

    
}


//Helper to refresh the speed every frame
function refreshVelocity()
{
    //If booster is on, apply a constant acceleration to the ship
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

//Helper to update the points string on the screen
//We need to define the style
let point_style = new PIXI.TextStyle({
    fontFamily: "vectorb-webfont",
    fontWeight: 700,
    fontSize: 30,
    fill: "white",
    stroke: '#ffffff',
    padding: 20
  });
function refreshPoints()
{
    //Add the points to the screen
    app.stage.removeChild(points_str)
    points_str = new PIXI.Text(""+space_ship.points, point_style);
    points_str.position.set((gameScreen_ox+gameScreen_x)-100, gameScreen_oy+20);
    app.stage.addChild(points_str);
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

//Helper to spawn a meteorite in the game
function spawnMeteorite(dim = 40)
{
    let meteorite_draw = new PIXI.Graphics();
    meteorite_draw.lineStyle(3, 0xFFFFFF);
    //The randomic number is now corrected so it can fall between the little screen
    temp_x = randomNumber(gameScreen_ox+gameScreen_x, gameScreen_ox);
    temp_y = randomNumber(gameScreen_oy+gameScreen_y, gameScreen_oy);
    meteorite_draw.drawCircle(temp_x, temp_y, dim);

    meteorite = new PIXI.Sprite(meteorite_draw.generateCanvasTexture());
    meteorite.x = temp_x;
    meteorite.y = temp_y;
    //Initial speed is randomic
    meteorite.vx = randomNumber(randomNumber(1.5, -1.5));
    meteorite.vy = randomNumber(randomNumber(1.5,-1.5));
    //The meteorite is new so it need to splice if hitted
    meteorite.isFirst = true;
    //Helper for further utilities
    meteorite.colpito = false;


    meteorite_array.push(meteorite);
    app.stage.addChild(meteorite);
    
    return meteorite  
}

//Random number generator with max as upperbound
function randomNumber(max, min=0){return Math.random() * (max - min) + min;}

function gameLoop(delta)
{
    if(state != endGame_)
        state(delta);
    else
        endGame_();

}


function play(delta)
{
    //time counter
    elapsed_time+=delta;
   
    if(elapsed_time/60 > next_meteorite)
    {
        if(meteorite_array.length < 8)
            spawnMeteorite();
        //Reset the counter so it doesn't overflow 
        elapsed_time=0;
        next_meteorite = randomNumber(3,5);
        
    }

    //Refresh the speed vector every frame
    refreshVelocity();
    space_ship.x += space_ship.vx;
    space_ship.y += space_ship.vy;
    space_ship.rotation += space_ship.av;
    infinitifyCoord(space_ship);   

    //Bullet's speed management
    for(i=0;i<projectile_array.length; i++)
    {
        aux = projectile_array[i];
        aux.x += aux.vx;
        aux.y += aux.vy;
        aux.distance += Math.sqrt(aux.vx*aux.vx + aux.vy*aux.vy);
        //Bullet's lifetime is short. It's only alive for "width" space
        if(aux.distance > gameScreen_x)
        {
             app.stage.removeChild(aux);
             //If a bullet is dead we need to remove it from the array 
             projectile_array.splice(i,1);
             aux.destroy();
             break;
        }
        else
            infinitifyCoord(aux);
    }

    //Meteorite management
    for(i=0;i<meteorite_array.length; i++)
    {
        let aux = meteorite_array[i];

        //Collision Manager METEORITE vs SPACE_SHIP
        if(hitTestRectangle(aux, space_ship) && !aux.colpito)
        {
            //Delete one live's icon
            app.stage.removeChild(lives_array.pop());
            space_ship.lives -= 1;      
            //Spaceship to default position
            space_ship.x = (gameScreen_ox+gameScreen_x)/2;
            space_ship.y = (gameScreen_oy+gameScreen_y)/2;
            //Delete the asteroid 
            app.stage.removeChild(aux);
            meteorite_array.splice(i,1);
            aux.destroy();

            if(space_ship.lives == 0)
            {
                while(meteorite_array.length > 0) meteorite_array.pop().destroy();
                state = endGame_;
            }

            break;
        }
        
        //Collision Manager METEORITE vs BULLET
        for(j = 0; j<projectile_array.length; j++)
        {
            aux2 = projectile_array[j];
            if(hitTestRectangle(aux, aux2)) 
            {
                app.stage.removeChild(aux2);
                projectile_array.splice(j,1);
                aux2.destroy();
                //Auxiliar vars
                old_x = aux.x
                old_y = aux.y
                //Remove the meteorite
                app.stage.removeChild(aux);
                meteorite_array.splice(i,1);
                //A little meteorite gives 10 points
                space_ship.points += 10;
                //Spawn 2 new meteorites from the one destroyed
                if(aux.isFirst)
                {
                    //A big meteorite gives 5 points (10-5)
                    space_ship.points -= 5;
                    //One meteorite splits into two meteorites
                    met1 = spawnMeteorite(25);
                    met2 = spawnMeteorite(25);
                    //They start from the father's position
                    met1.x = old_x;
                    met1.y = old_y;
                    met2.x = old_x;
                    met2.y = old_y;
                    //One has the speed opposite to the other
                    met2.vx = -met1.vx;
                    met2.vy = -met1.vy;
                    met1.isFirst = false;
                    met2.isFirst = false;   
                }  

                refreshPoints();
                updatePoints(space_ship.points);
                createTable();
                
            }   
        }
        
        if(!aux.colpito)
        {
            //If no hit then proceed with the position update
            aux.x += aux.vx;
            aux.y += aux.vy;
            aux.vx += randomNumber(0.05, -0.05); 
            aux.vy += randomNumber(0.05, -0.05);
            infinitifyCoord(aux);
        }
        else aux.destroy();

        
        
        

        

    }
}

//GAME OVER. Do we need a restart button? YESSSSSS
function endGame_()
{
    updatePoints(space_ship.points);
    app.stage.removeChild(space_ship);
    space_ship.destroy();
    app.stage.removeChild(points_str);

    //Remove all the meteorites and bullets from the stage and from the array
    //Memory management
    for(i=0;i<meteorite_array.length;i++)
    {
        app.stage.removeChild(meteorite_array[i]);
        meteorite_array.pop().destroy;
    }
    for(i=0;i<projectile_array.length;i++)
    {
        app.stage.removeChild(projectile_array[i]);
        projectile_array.pop().destroy();
    }
    
    /*let style = new PIXI.TextStyle({
        fontFamily: "vectorb-webfont",
        fontSize: 50,
        fill: "white",
        stroke: '#ffffff',
        fontWeight: 900
      });
    end_message = new PIXI.Text("GAME OVER", style);
    end_message.position.set((gameScreen_ox+gameScreen_x)/2 - 180, (gameScreen_oy+gameScreen_y)/2 - 50);*/

   
    //Manage the html elements 
    document.getElementById("restart_game").style.visibility = "visible";
    document.getElementById("restart_button").style.pointerEvents = "auto";
    document.getElementById("change_nickname_button").style.pointerEvents = "auto";
    document.getElementById("home_button").style.pointerEvents = "auto";


    //We don't need anymore any listener
    left.unsubscribe();
    right.unsubscribe();
    up.unsubscribe();
    down.unsubscribe();
    space.unsubscribe();
    fire.unsubscribe();
    app.ticker.stop();
     
    RESTART = 1;
    

}

//Pacman effect: no boundaries in the screen
//I made a function so everytime you need to move something
//you pass the latter as the argument
function infinitifyCoord(obj)
{
    let W = gameScreen_x + gameScreen_ox
    let H = gameScreen_y + gameScreen_oy

    if(obj.x > W || obj.x < gameScreen_ox)
    {
        obj.x = W - obj.x + gameScreen_ox;
        obj.y = H - obj.y + gameScreen_oy;
    }
    if(obj.y > H || obj.y < gameScreen_oy)
    {
        obj.y = H - obj.y + gameScreen_oy;
        obj.x = W - obj.x + gameScreen_ox;
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

//Collision detection
function hitTestRectangle(r1, r2) 
  {

    //Define the variables we'll need to calculate
    let hit, combinedHalfWidths, combinedHalfHeights, vx, vy;
  
    //hit will determine whether there's a collision
    hit = false;
  
    //Find the center points of each sprite
    r1.centerX = r1.x + r1.width / 2;
    r1.centerY = r1.y + r1.height / 2;
    r2.centerX = r2.x + r2.width / 2;
    r2.centerY = r2.y + r2.height / 2;
  
    //Find the half-widths and half-heights of each sprite
    r1.halfWidth = r1.width / 2;
    r1.halfHeight = r1.height / 2;
    r2.halfWidth = r2.width / 2;
    r2.halfHeight = r2.height / 2;
  
    //Calculate the distance vector between the sprites
    vx = r1.centerX - r2.centerX;
    vy = r1.centerY - r2.centerY;
  
    //Figure out the combined half-widths and half-heights
    combinedHalfWidths = r1.halfWidth + r2.halfWidth;
    combinedHalfHeights = r1.halfHeight + r2.halfHeight;
  
    //Check for a collision on the x axis
    if (Math.abs(vx) < combinedHalfWidths) 
    {
  
      //A collision might be occurring. Check for a collision on the y axis
      if (Math.abs(vy) < combinedHalfHeights) 
      {
  
        //There's definitely a collision happening
        hit = true;
      } 
      else 
      {
  
        //There's no collision on the y axis
        hit = false;
      }
    } 
    else 
    {
  
      //There's no collision on the x axis
      hit = false;
    }
  
    //`hit` will be either `true` or `false`
    return hit;
  }


//Start the game
//setup();