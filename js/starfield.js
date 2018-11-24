var width, height;


//Just prepare the canvas
function stars() 
{
    width = document.body.clientWidth;
    height = document.body.clientHeight;

    canvas = document.getElementById("can");
    canvas.width = width;
    canvas.height = height;
    if (canvas.getContext) 
    {
		//Draw a black square as the background
        ctx = canvas.getContext("2d");
        ctx.fillStyle = "black";
        ctx.rect(0, 0, width, height);
        ctx.fill();
        starfield();
    }
}
  
  // Create random stars with random speed.
var starList = []

function createStar(first=false)
{
	var star = {x:0, y:0, n:0};
	var center = 100;

		
	//First stars have a bigger span that the others
	star.x = randomNumber(-1*center, center);
	star.y = randomNumber(-1*center, center);	
	

	
	star.n = randomNumber(1.005,1.02);
	return star;
}

//Firsts stars
function starfield() 
{
	for (i = 0; i < 150; i++) 
	{
		starList.push(createStar(true));
	}
}

function randomNumber(min, max){return Math.random() * (max - min) + min;}

function run() 
{
	// Register for the next frame
	window.requestAnimationFrame(run);

	// Reset the canvas
	ctx.fillStyle = "black";
	ctx.rect(0, 0, width, height);
	ctx.fill();
	
	// Update position and draw each star.
	var star;
	for(var i=0; i<starList.length; i++) 
	{
		star = starList[i];
		star.x = (star.x*star.n);
		star.y = (star.y*star.n);
		star.n += 0.0001;
		

		var radius = 60;
		
		//Delete stars in the central circle
		if(star.x > width/2 || star.x < -width/2 || star.y>height/2 || star.y<-height/2)
		{
			starList.splice(i,1);
			starList.push(createStar());
		
		}
		else
		{
			ctx.fillStyle = "white";
			ctx.beginPath();
			ctx.arc(star.x+(width/2), star.y+(height/2), 2, 0, Math.PI*2, true);
			ctx.closePath();
			ctx.fill();
		}
	}
}

stars();
run();