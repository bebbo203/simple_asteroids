var width, height;


function stars() 
{
    width = document.body.clientWidth;
    height = document.body.clientHeight;
    console.log(""+width);
    console.log(""+height);

    canvas = document.getElementById("can");
    canvas.width = width;
    canvas.height = height;
    if (canvas.getContext) 
    {
        ctx = canvas.getContext("2d");
        ctx.fillStyle = "black";
        ctx.rect(0, 0, width, height);
        ctx.fill();
        starfield();
    }
}
  
  // Create random stars with random velocity.
var starList = []

function createStar(first=false)
{
	var star = {x:0, y:0, n:0};

	if(first)
	{		
		star.x = randomNumber(-1*width, width);
		star.y = randomNumber(-1*height, height);	
	}
	else
	{
		scelta = Math.floor(randomNumber(1,5));
		switch(scelta)
		{
			case 1: {
				star.x = -width/2;
				star.y = randomNumber(-1*height/2, height/2);
				break;
			}
			case 2: {
				star.x = width/2;
				star.y = randomNumber(-1*height/2, height/2);
				break;
			}
			case 3: {
				star.x = randomNumber(-1*width/2, width/2);
				star.y = -height/2;
				break;
			}
			case 4: {
				star.x = randomNumber(-1*width/2,width/2);
				star.y = height/2;
				break;
			}
		}

	}
	star.n = randomNumber(1.005,1.02);
	return star;
}

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
		star.x = (star.x/star.n);
		star.y = (star.y/star.n);
		star.n += 0.0001;
		if(i==0) console.log(star.x +" "+star.y);
		

		var radius = 60;
		
		if(star.x*star.x + star.y*star.y < radius*radius)
		{
			starList.splice(i,1);
			starList.push(createStar());
			/*ctx.fillStyle = "red";
			ctx.beginPath();
			ctx.arc(star.x+(width/2), star.y+(height/2), 3, 0, Math.PI*2, true);
			ctx.closePath();
			ctx.fill();*/
		}
		else
		{
			ctx.fillStyle = "white";
			ctx.beginPath();
			ctx.arc(star.x+(width/2), star.y+(height/2), 2/star.n, 0, Math.PI*2, true);
			ctx.closePath();
			ctx.fill();
		}
	}
}

stars();
run();