
//Get the nickname, save it to LocalStorage and...
//Start the game!
function getNickname()
{
    nickname_input = document.getElementById("nickname_input");
    nickname = nickname_input.value;
    

    profilo = localStorage.getItem(nickname);
    if(profilo === null)
    {
        profilo = JSON.stringify({nickname: nickname, points: 0, record: 0});
        localStorage.setItem(nickname, profilo);
        profilo = JSON.parse(profilo);   
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
    //Start the game
    setup();
}