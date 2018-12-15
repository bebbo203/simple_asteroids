
//Get the nickname, save it to LocalStorage and...
//Start the game!

var profilo;

function getNickname()
{
    nickname_input = document.getElementById("nickname_input");
    nickname = nickname_input.value.toUpperCase();
    if(nickname=="") 
        nickname = "ANONYMOUS";    
    
    //Profile handler
    profilo = localStorage.getItem(nickname);
    if(profilo === null)
    {
        profilo = {
            nickname:nickname,
            points:0,
            record:0,
            record_date:""
        }
        //Refresh immediately the profile so it will add the date as well
        updatePoints(0);
        localStorage.setItem(nickname, JSON.stringify(profilo));  
    }
    else
    {
        profilo = JSON.parse(localStorage.getItem(nickname));
    }


    //Show the game part
    $("canvas").css("opacity","1");  
    $("#game").css("opacity", "1");  
    //Hide the name selection div
    $("#name_selection").css("opacity", "0");
    $("#nickname_button").css("visibility", "hidden");
    
}

//After the endgame, update the points in the user's profile
function updatePoints(points)
{
    profilo.points = points;

    console.log(profilo.record);
    //Update record and date of record
    if(profilo.points > profilo.record || profilo.points == 0) 
    {
        profilo.record = profilo.points;
        var date = new Date();
        gg = date.getDate();
        //Months start from 0
        mm = date.getMonth()+1;
        //Full year is 4 digit. I want only the last four
        aa = date.getFullYear()%100;

        profilo.record_date = gg+"/"+mm+"/"+aa;
    }
    localStorage.setItem(profilo.nickname, JSON.stringify(profilo));
}

//Get ALL the record in the local storage
function getRecords()
{
    records = []
    keys = Object.keys(localStorage);
    i = keys.length;
    while(i--)
        records.push(localStorage.getItem(keys[i]));

    return records;
}


//Create and refresh the table
function createTable()
{
    entries = getRecords();
    var table = document.getElementById("scores_table");
    table.innerHTML ="";

    //Parse every entry 
    for(i=0;i<entries.length; i++)
        entries[i] = JSON.parse(entries[i]);

    //Sort the array (discendant)
    entries.sort(compareProfiles);
    
    //Dinamically create the table 
    for(i=0; i<entries.length; i++)
    {
        var entry = entries[i];

        var row = table.insertRow(i);
        var order_cell = row.insertCell(0)
        var name_cell = row.insertCell(1);
        var date_cell = row.insertCell(2);
        var space_cell = row.insertCell(3);
        var record_cell = row.insertCell(4);
        
        //Color settings
        if(profilo != null && entry.nickname == profilo.nickname)
            color = "#AAAAAA";
        else    
            color = "#FFFFFF";


        order_cell.style.color = color;
        name_cell.style.color = color;
        date_cell.style.color = color;
        record_cell.style.color = color;
        space_cell.style.color = color;

        //Colors of the podium
        if(i<3)
        {
            switch(i){
                case(0): order_cell.style.color = "#FFD700"; break;
                case(1): order_cell.style.color = "#C0C0C0"; break;
                case(2): order_cell.style.color = "#CD7F32"; break;
            }

        }
        
        order_cell.innerHTML = i+1+".";
        name_cell.innerHTML = entry.nickname;

        date_cell.innerHTML = entry.record_date;
        date_cell.style.fontSize ="2vh";

        //Add a cell that spaces the names from the points
        space_cell.style.width = "20vw";
        space_cell.style.maxWidth = "20vw";
        space_cell.style.overflow = "hidden";
        space_cell.style.fontSize="2vh";
        for(j=0;j<50;j++)space_cell.innerHTML+=".";
    
        
        record_cell.innerHTML = entry.record;
    }
}

//I need a comparator for the records of every entry
function compareProfiles(a, b)
{
    var A = parseInt(a.record);
    var B = parseInt(b.record);

    if(A < B) return 1;
    if(A > B) return -1;
    return 0;
}