//window.onload = init;

const fs = require('fs');
const path = require('path');
const internal = require('stream');
var Mousetrap = require('mousetrap');
const { BrowserWindow, dialog } = require('electron');
const { remote } = require('electron');
const inc = remote.require('./index.js');
//const { dialog } = require('electron');

//path variables used when developing
const mainPath = path.join(__dirname, '..', '..', 'Stream Tool', 'Resources', 'Texts');
const charPath = path.join(__dirname, '..', '..', 'Stream Tool', 'Resources', 'Characters');

//change to these paths when building the executable
//Linux (appimage)
/* const textPath = path.resolve('.', 'Resources', 'Texts');
const charPath = path.resolve('.', 'Resources', 'Characters'); */
//Windows (if building a portable exe)
// const mainPath = path.resolve(process.env.PORTABLE_EXECUTABLE_DIR, 'Resources', 'Texts');
// const charPath = path.resolve(process.env.PORTABLE_EXECUTABLE_DIR, 'Resources', 'Characters');

//yes we all like global variables
const colorList = getJson(mainPath + "/InterfaceInfo");

const sbInfo = getJson(mainPath + "/ScoreboardInfo");

//let charP1 = "Random";
let charP1 = sbInfo.player[0].character;
let charP2 = sbInfo.player[1].character;
let charP3 = sbInfo.player[2].character;
let charP4 = sbInfo.player[3].character;
//let skinP1 = "";
let skinP1 = sbInfo.player[0].skin;
let skinP2 = sbInfo.player[1].skin;
let skinP3 = sbInfo.player[2].skin;
let skinP4 = sbInfo.player[3].skin;
let colorP1, colorP2;

let score = [];
score.push(sbInfo.score[0], sbInfo.score[1]);

let currentP1WL = sbInfo.wl[0];
let currentP2WL = sbInfo.wl[1];
let currentBestOf = "Bo3";

let gamemode = sbInfo.gamemode;

let movedSettings = false;
let charP1Active = false;
let charP2Active = false;
let charP3Active = false;

let inPF = false;
let currentFocus = -1;

const maxPlayers = 4;

const tNameInps = document.getElementsByClassName("teamName");

//we want the correct order, we cant use getClassName here
function pushArrayInOrder(array, string1, string2 = "") {
    for (let i = 0; i < maxPlayers; i++) {
        array.push(document.getElementById(string1+(i+1)+string2));
    }
}
const pNameInps = [], pTagInps = [], pFinders = [], charSelectors = [], skinSelectors = [];
pushArrayInOrder(pNameInps, "p", "Name");
pushArrayInOrder(pTagInps, "p", "Tag");
pushArrayInOrder(pFinders, "pFinder");
pushArrayInOrder(charSelectors, "p", "CharSelector");
pushArrayInOrder(skinSelectors, "skinSelectorP");

const charImgs = document.getElementsByClassName("charImg");

const viewport = document.getElementById('viewport');

const p1NameInp = document.getElementById('p1Name');
const p1TagInp = document.getElementById('p1Tag');
const p2NameInp = document.getElementById('p2Name');
const p2TagInp = document.getElementById('p2Tag');
const p3NameInp = document.getElementById('p3Name');
const p3TagInp = document.getElementById('p3Tag');
const p4NameInp = document.getElementById('p4Name');
const p4TagInp = document.getElementById('p4Tag');

for (let i = 0; i < 4; i++) {
    pNameInps[i].value = sbInfo.player[i].name;
    changeInputWidth(pNameInps[i]);
}

document.getElementById("cName1").value = sbInfo.caster[0].name;
document.getElementById("cTwitter1").value = sbInfo.caster[0].twitter;
document.getElementById("cTwitch1").value = sbInfo.caster[0].twitch;
document.getElementById("cName2").value = sbInfo.caster[1].name;
document.getElementById("cTwitter2").value = sbInfo.caster[1].twitter;
document.getElementById("cTwitch2").value = sbInfo.caster[1].twitch;

const charImgP1 = document.getElementById('p1CharImg');
const charImgP2 = document.getElementById('p2CharImg');
const charImgP3 = document.getElementById('p3CharImg');
const charImgP4 = document.getElementById('p4CharImg');

const p1Win1 = document.getElementById('winP1-1');
const p1Win2 = document.getElementById('winP1-2');
const p1Win3 = document.getElementById('winP1-3');
const p2Win1 = document.getElementById('winP2-1');
const p2Win2 = document.getElementById('winP2-2');
const p2Win3 = document.getElementById('winP2-3');

const wlButtons = document.getElementsByClassName("wlButtons");
const p1W = document.getElementById('p1W');
const p1L = document.getElementById('p1L');
const p2W = document.getElementById('p2W');
const p2L = document.getElementById('p2L');

const roundInp = document.getElementById('roundName');
roundInp.value = sbInfo.round;
const tournamentInp = document.getElementById('tournamentName');
tournamentInp.value = sbInfo.tournamentName;

const forceWL = document.getElementById('forceWLToggle');

init();
function init() {

    //first, add listeners for the bottom bar buttons
    document.getElementById('updateRegion').addEventListener("click", writeScoreboard);
    document.getElementById('settingsRegion').addEventListener("click", moveViewport);
    // document.getElementById('nukeRegion').addEventListener("click", nuke);

    //if the viewport is moved, click anywhere on the center to go back
    document.getElementById('goBack').addEventListener("click", goBack);

    //move the viewport to the center (this is to avoid animation bugs)
    viewport.style.right = "100%";
    

    /* OVERLAY */

    //load color slot list
    loadColors(1);
    loadColors(2);

    //set initial values for the character selectors
    if (charP1 != "") {
        document.getElementById('p1CharSelector').setAttribute('src', charPath + '/CSS/' + charP1 + '.png');
    } else {
        document.getElementById('p1CharSelector').setAttribute('src', charPath + '/CSS/Random.png');
    }
    if (charP2 != "") {
        document.getElementById('p2CharSelector').setAttribute('src', charPath + '/CSS/' + charP2 + '.png');
    } else {
        document.getElementById('p2CharSelector').setAttribute('src', charPath + '/CSS/Random.png');
    }
    if(gamemode == 2) {
        if (charP3 != "") {
            document.getElementById('p3CharSelector').setAttribute('src', charPath + '/CSS/' + charP3 + '.png');
        } else {
            document.getElementById('p3CharSelector').setAttribute('src', charPath + '/CSS/Random.png');
        }
        if (charP4 != "") {
            document.getElementById('p4CharSelector').setAttribute('src', charPath + '/CSS/' + charP4 + '.png');
        } else {
            document.getElementById('p4CharSelector').setAttribute('src', charPath + '/CSS/Random.png');
        }
    }

    // document.getElementById('p2CharSelector').setAttribute('src', charPath + '/CSS/' + charP3 + '.png');
    // document.getElementById('p3CharSelector').setAttribute('src', charPath + '/CSS/Random.png');
    // document.getElementById('p4CharSelector').setAttribute('src', charPath + '/CSS/Random.png');
    //if clicking them, show the character roster
    document.getElementById('p1CharSelector').addEventListener("click", openChars);
    document.getElementById('p2CharSelector').addEventListener("click", openChars);
    document.getElementById('p3CharSelector').addEventListener("click", openChars);
    document.getElementById('p4CharSelector').addEventListener("click", openChars);

    //create the character roster
    createCharRoster();
    //if clicking the entirety of the char roster div, hide it
    document.getElementById('charRoster').addEventListener("click", hideChars);

    //update the character image (to random)
    
    // for (let i = 0; i < charImgs.length; i++) {
    //     charImgChange(charImgs[i], charP1, skinP1); //"Random");
    //     charImgs[i].addEventListener("error", () => {
    //         charImgs[i].setAttribute('src', charPath + '/Portraits/Random/' + colorP1 + '.png');
    //     });
    // }
    
    charImgChange(charImgP1, charP1, skinP1);
    addSkinIcons(1);
    charImgChange(charImgP2, charP2, skinP2);
    addSkinIcons(2);
    if(gamemode == 2) {
        charImgChange(charImgP3, charP3, skinP3);
        addSkinIcons(3);
        charImgChange(charImgP4, charP4, skinP4);
        addSkinIcons(4);
    }

    //check whenever an image isnt found so we replace it with a "?"
    document.getElementById('p1CharImg').addEventListener("error", () => {
        document.getElementById('p1CharImg').setAttribute('src', charPath + '/Portraits/Random.png');// '+colorP1+'.png');
    });
    document.getElementById('p2CharImg').addEventListener("error", () => {
        document.getElementById('p2CharImg').setAttribute('src', charPath + '/Portraits/Random.png');// '+colorP2+'.png');
    });
    if(gamemode == 2) {
        document.getElementById('p3CharImg').addEventListener("error", () => {
            document.getElementById('p3CharImg').setAttribute('src', charPath + '/Portraits/Random.png');// '+colorP1+'.png');
        });
        document.getElementById('p4CharImg').addEventListener("error", () => {
            document.getElementById('p4CharImg').setAttribute('src', charPath + '/Portraits/Random.png');// '+colorP2+'.png');
        });
    }

    //score checks
    p1Win1.addEventListener("click", changeScoreTicks1);
    p2Win1.addEventListener("click", changeScoreTicks1);
    p1Win2.addEventListener("click", changeScoreTicks2);
    p2Win2.addEventListener("click", changeScoreTicks2);
    p1Win3.addEventListener("click", changeScoreTicks3);
    p2Win3.addEventListener("click", changeScoreTicks3);

    for (let i = 0; i < 2; i++) {
        if (score[i] == 1) {
            //deactivate wins 2 and 3
            document.getElementById('winP'+(i+1)+'-1').checked = true;
            document.getElementById('winP'+(i+1)+'-2').checked = false;
            document.getElementById('winP'+(i+1)+'-3').checked = false;
        } else if (score[i] == 2) {
            //deactivate wins 2 and 3
            document.getElementById('winP'+(i+1)+'-1').checked = true;
            document.getElementById('winP'+(i+1)+'-2').checked = true;
            document.getElementById('winP'+(i+1)+'-3').checked = false;
        } else if (score[i] == 3) {
            //deactivate wins 2 and 3
            document.getElementById('winP'+(i+1)+'-1').checked = true;
            document.getElementById('winP'+(i+1)+'-2').checked = true;
            document.getElementById('winP'+(i+1)+'-3').checked = true;
        }
    }

    //set click listeners for the [W] and [L] buttons
    p1W.addEventListener("click", setWLP1);
    p1L.addEventListener("click", setWLP1);
    p2W.addEventListener("click", setWLP2);
    p2L.addEventListener("click", setWLP2);

    changeWLButtons();

    //for each player input field
    for (let i = 0; i < maxPlayers; i++) {

        //prepare the player finder (player presets)
        preparePF(i+1);

        //check if theres a player preset every time we type or click in the player box
        pNameInps[i].addEventListener("input", checkPlayerPreset);
        pNameInps[i].addEventListener("focusin", checkPlayerPreset);

        //resize the container if it overflows
        pNameInps[i].addEventListener("input", resizeInput);
        //also do it for tag inputs while we're at it
        pTagInps[i].addEventListener("input", resizeInput);
    }

    //check if the round is grand finals
    roundInp.addEventListener("input", checkRound);
    checkRound();

    //set click listeners to change the "best of" status
    document.getElementById("bo3Div").addEventListener("click", changeBestOf);
    document.getElementById("bo5Div").addEventListener("click", changeBestOf);
    //set initial value
    document.getElementById("bo5Div").style.color = "var(--text2)";
    document.getElementById("bo3Div").style.backgroundImage = "linear-gradient(to top, #575757, #00000000)";
    p1Win3.style.display = "none";
    p2Win3.style.display = "none";

    //gamemode button
    document.getElementById("gamemode").addEventListener("click", changeGamemode);

    //add a listener to the swap button
    document.getElementById('swapButton').addEventListener("click", swap);
    //add a listener to the clear button
    document.getElementById('clearButton').addEventListener("click", clearPlayers);

    document.getElementById('nuke').addEventListener("click", nuke);

    //Change overlay style if it was last on doubles
    if(gamemode == 2) {

        windowResize();

        //show singles icon
        gmIcon2.style.opacity = 0;
        gmIcon1.style.left = "11px"; 
        
        //hide the background character image to reduce clutter

        //add some margin to the color buttons, change border radius
        const lColor = document.getElementById("p1Color");
        lColor.style.marginLeft = "5px";
        lColor.style.borderTopLeftRadius = "3px";
        lColor.style.borderBottomLeftRadius = "3px";
        const rColor = document.getElementById("p2Color");
        rColor.style.marginLeft = "5px";
        rColor.style.borderTopLeftRadius = "3px";
        rColor.style.borderBottomLeftRadius = "3px";

        for (let i = 1; i < 3; i++) {
            document.getElementById("row1-"+i).insertAdjacentElement("afterbegin", wlButtons[i-1]);
            document.getElementById("row1-"+i).insertAdjacentElement("afterbegin", document.getElementById('scoreBox'+i));
            
            document.getElementById("scoreText"+i).style.display = "none";

            tNameInps[i-1].style.display = "block";

            document.getElementById("row1-"+i).insertAdjacentElement("afterbegin", tNameInps[i-1]);

            document.getElementById('row2-'+i).insertAdjacentElement("beforeend", document.getElementById('p' + i + 'Info'));

            charSelectors[i+1].style.display = "block";
            skinSelectors[i+1].style.display = "block";
            document.getElementById('p' + (i+2) + 'CharImg').style.display = "block";
                        
            document.getElementById('skinListP'+(i+2)).style.display = "block";
            document.getElementById('skinListP'+(i+2)+'Mythra').style.display = "block";

            document.getElementById('p' + (i+2) + 'Info').style.display = "block";
        }

        document.getElementById('p3CharSelector').setAttribute('src', charPath + '/CSS/'+charP3+'.png');
        charImgChange(charImgP3, charP3);
        addSkinIcons(3);

        document.getElementById('p4CharSelector').setAttribute('src', charPath + '/CSS/'+charP4+'.png');
        charImgChange(charImgP4, charP4);
        addSkinIcons(4);

        //add some left margin to the name/tag inputs, add border radius, change max width
        for (let i = 0; i < maxPlayers; i++) {
            pTagInps[i].style.marginLeft = "5px";

            pNameInps[i].style.borderTopRightRadius = "3px";
            pNameInps[i].style.borderBottomRightRadius = "3px";

            pTagInps[i].style.maxWidth = "45px"
            pNameInps[i].style.maxWidth = "94px"
        }


        //change the hover tooltip
        this.setAttribute('title', "Change the gamemode to Singles");

        //dropdown menus for the right side will now be positioned to the right
        for (let i = 1; i < 5; i+=2) {
            pFinders[i].style.right = "0px";
            pFinders[i].style.left = "";
        }
        document.getElementById("dropdownColorP2").style.right = "0px";
        document.getElementById("dropdownColorP2").style.left = "";

        document.getElementById('scoreBox1').style.marginLeft = "0px";
        document.getElementById('scoreBox2').style.marginLeft = "0px";
    }


    /* SETTINGS */

    //set a listener for the forceWL check
    forceWL.addEventListener("click", forceWLtoggles);

    //set listener for settings checkboxes
    document.getElementById("copyMatch").addEventListener("click", copyMatch)
    document.getElementById("makeP1Preset").addEventListener("click", makeP1Preset)
    document.getElementById("makeP2Preset").addEventListener("click", makeP2Preset)
    document.getElementById("makeP3Preset").addEventListener("click", makeP3Preset)
    document.getElementById("makeP4Preset").addEventListener("click", makeP4Preset)

    /* KEYBOARD SHORTCUTS */

    Mousetrap.bind('enter', () => { 
        
        if (isPresetOpen()) {
            for (let i = 0; i < pFinders.length; i++) {
                if (pFinders[i].style.display == "block" && currentFocus > -1) {
                    pFinders[i].getElementsByClassName("finderEntry")[currentFocus].click();
                }
            }
        } else {
            writeScoreboard();
            document.getElementById('botBar').style.backgroundColor = "var(--bg3)";
        
        }    
        
    }, 'keydown');
    Mousetrap.bind('enter', () => {
        document.getElementById('botBar').style.backgroundColor = "var(--bg5)";
    }, 'keyup');

    Mousetrap.bind('esc', () => {
        if (movedSettings) { //if settings are open, close them
            goBack();
        } else if (isPresetOpen()) { //if a player preset is open, close it
            for (let i = 0; i < pFinders.length; i++) {
                pFinders[i].style.display = "none";
            }
        } else if (document.getElementById('charRoster').style.opacity == 1) {
            hideChars(); //if charRoster is visible, hide it
        } else {
            clearPlayers();
        }
    });

    Mousetrap.bind('f1', () => { giveWinP1() });
    Mousetrap.bind('f2', () => { giveWinP2() });


    //up/down, to navigate the player presets menu (only when a menu is shown)
    Mousetrap.bind('down', () => {
        for (let i = 0; i < pFinders.length; i++) {
            if (pFinders[i].style.display == "block") {
                currentFocus++;
                addActive(pFinders[i].getElementsByClassName("finderEntry"));
            }
        }
    });
    Mousetrap.bind('up', () => {
        for (let i = 0; i < pFinders.length; i++) {
            if (pFinders[i].style.display == "block") {
                currentFocus--;
                addActive(pFinders[i].getElementsByClassName("finderEntry"));
            }
        }
    });
}

function isPresetOpen() {
    let theBool = false;
    for (let i = 0; i < pFinders.length; i++) {
        if (pFinders[i].style.display == "block") {
            theBool = true;
        }   
    }
    return theBool;
}

function moveViewport() {
    if (!movedSettings) {
        viewport.style.right = "140%";
        document.getElementById('overlay').style.opacity = "25%";
        document.getElementById('goBack').style.display = "block"
        movedSettings = true;
    }
}

function nuke() {

    let response = inc.popup();
    if(response == 0) {
        document.getElementById('roundName').value = "";
        checkRound();
        document.getElementById('tournamentName').value = "";
        if(gamemode == 2) {
            changeGamemode();
        }
        clearPlayers();
        writeScoreboard();
    }
}

function goBack() {
    viewport.style.right = "100%";
    document.getElementById('overlay').style.opacity = "100%";
    document.getElementById('goBack').style.display = "none";
    movedSettings = false;
}

function getJson(jPath) {
    try {
        return JSON.parse(fs.readFileSync(jPath + ".json"));
    } catch (error) {
        return undefined;
    }
}


//will load the color list to a color slot combo box
function loadColors(pNum) {

    //for each color found, add them to the color list
    for (let i = 0; i < Object.keys(colorList.colorSlots).length; i++) {

        //create a new div that will have the color info
        let newDiv = document.createElement('div');
        newDiv.style.display = "flex"; //so everything is in 1 line
        newDiv.title = "Also known as " + colorList.colorSlots["color"+i].hex;
        newDiv.className = "colorEntry";

        //if the div gets clicked, update the colors
        newDiv.addEventListener("click", updateColor);

        //create the color's name
        let newText = document.createElement('div');
        newText.innerHTML = colorList.colorSlots["color"+i].name;
        
        //create the color's rectangle
        let newRect = document.createElement('div');
        newRect.style.width = "13px";
        newRect.style.height = "13px";
        newRect.style.margin = "5px";
        newRect.style.backgroundColor = colorList.colorSlots["color"+i].hex;

        //add them to the div we created before
        newDiv.appendChild(newRect);
        newDiv.appendChild(newText);

        //now add them to the actual interface
        document.getElementById("dropdownColorP"+pNum).appendChild(newDiv);
    }

    //set the initial colors for the interface (the first color for p1, and the second for p2)
    if (pNum == 1) {
        document.getElementById("player1").style.backgroundImage = "linear-gradient(to bottom left, "+colorList.colorSlots["color"+0].hex+"50, #00000000, #00000000)";
        document.getElementById("p1ColorRect").style.backgroundColor = colorList.colorSlots["color"+0].hex;
    } else {
        document.getElementById("player2").style.backgroundImage = "linear-gradient(to bottom left, "+colorList.colorSlots["color"+1].hex+"50, #00000000, #00000000)";
        document.getElementById("p2ColorRect").style.backgroundColor = colorList.colorSlots["color"+1].hex;
    }

    //finally, set initial values for the global color variables
    colorP1 = "Red";
    colorP2 = "Blue";
}

function updateColor() {

    let pNum; //you've seen this one enough already, right?
    if (this.parentElement.parentElement == document.getElementById("p1Color")) {
        pNum = 1;
    } else {
        pNum = 2;
    }

    let clickedColor = this.textContent;

    //search for the color we just clicked
    for (let i = 0; i < Object.keys(colorList.colorSlots).length; i++) {
        if (colorList.colorSlots["color"+i].name == clickedColor) {
            let colorRectangle, colorGrad;

            colorRectangle = document.getElementById("p"+pNum+"ColorRect");
            colorGrad = document.getElementById("player"+pNum);
            
            //change the variable that will be read when clicking the update button
            if (pNum == 1) {
                colorP1 = colorList.colorSlots["color"+i].name;
            } else {
                colorP2 = colorList.colorSlots["color"+i].name;
            }

            //then change both the color rectangle and the background gradient
            colorRectangle.style.backgroundColor = colorList.colorSlots["color"+i].hex;
            colorGrad.style.backgroundImage = "linear-gradient(to bottom left, "+colorList.colorSlots["color"+i].hex+"50, #00000000, #00000000)";
        
        }
    }

    //remove focus from the menu so it hides on click
    this.parentElement.parentElement.blur();
}


//change the image path depending on the character and skin
function charImgChange(charImg, charName, skinName = charName+"1") {
    if (charName == "Random" || charName == "") {
        charImg.setAttribute('src', charPath + '/Portraits/Random.png');
    } else {
        charImg.setAttribute('src', charPath + '/Portraits/' + charName + '/' + skinName + '.png');
    }
}


function createCharRoster() {
    //checks the character list which we use to order stuff
    const guiSettings = getJson(mainPath + "/InterfaceInfo");

    //first row
    for (let i = 0; i < 13; i++) {
        let newImg = document.createElement('img');
        newImg.className = "charInRoster";
        newImg.setAttribute('src', charPath + '/CSS/'+guiSettings.charactersBase[i]+'.png');

        newImg.id = guiSettings.charactersBase[i]; //we will read this value later
        newImg.addEventListener("click", changeCharacter);

        document.getElementById("rosterLine1").appendChild(newImg);
    }
    //second row
    for (let i = 13; i < 26; i++) {
        let newImg = document.createElement('img');
        newImg.className = "charInRoster";

        newImg.id = guiSettings.charactersBase[i];
        newImg.addEventListener("click", changeCharacter);

        newImg.setAttribute('src', charPath + '/CSS/'+guiSettings.charactersBase[i]+'.png');
        document.getElementById("rosterLine2").appendChild(newImg);
    }
    //third row
    for (let i = 26; i < 39; i++) {
        let newImg = document.createElement('img');
        newImg.className = "charInRoster";

        newImg.id = guiSettings.charactersBase[i];
        newImg.addEventListener("click", changeCharacter);

        newImg.setAttribute('src', charPath + '/CSS/'+guiSettings.charactersBase[i]+'.png');
        document.getElementById("rosterLine3").appendChild(newImg);
    }
    //fourth row
    for (let i = 39; i < 52; i++) {
        let newImg = document.createElement('img');
        newImg.className = "charInRoster";

        newImg.id = guiSettings.charactersBase[i];
        newImg.addEventListener("click", changeCharacter);

        newImg.setAttribute('src', charPath + '/CSS/'+guiSettings.charactersBase[i]+'.png');
        document.getElementById("rosterLine4").appendChild(newImg);
    }
    //fifth row
    for (let i = 52; i < 65; i++) {
        let newImg = document.createElement('img');
        newImg.className = "charInRoster";

        newImg.id = guiSettings.charactersBase[i];
        newImg.addEventListener("click", changeCharacter);

        newImg.setAttribute('src', charPath + '/CSS/'+guiSettings.charactersBase[i]+'.png');
        document.getElementById("rosterLine5").appendChild(newImg);
    }
    //sixth row
    for (let i = 65; i < 78; i++) {
        let newImg = document.createElement('img');
        newImg.className = "charInRoster";

        newImg.id = guiSettings.charactersBase[i];
        newImg.addEventListener("click", changeCharacter);

        newImg.setAttribute('src', charPath + '/CSS/'+guiSettings.charactersBase[i]+'.png');
        document.getElementById("rosterLine6").appendChild(newImg);
    }
    //seventh row
    for (let i = 78; i < 87; i++) {
        let newImg = document.createElement('img');
        newImg.className = "charInRoster";

        newImg.id = guiSettings.charactersBase[i];
        newImg.addEventListener("click", changeCharacter);

        newImg.setAttribute('src', charPath + '/CSS/'+guiSettings.charactersBase[i]+'.png');
        document.getElementById("rosterLine7").appendChild(newImg);
    }
}

//whenever we click on the character change button
function openChars() {
    charP1Active = false; //simple check to know if this is P1 or P2, used on other functions
    charP2Active = false;
    charP3Active = false;
    if (this == document.getElementById('p1CharSelector')) {
        charP1Active = true;
    } else if (this == document.getElementById('p2CharSelector')) {
        charP2Active = true;
    } else if (this == document.getElementById('p3CharSelector')) {
        charP3Active = true;
    }

    document.getElementById('charRoster').style.display = "flex"; //show the thing
    setTimeout( () => { //right after, change opacity and scale
        document.getElementById('charRoster').style.opacity = 1;
        document.getElementById('charRoster').style.transform = "scale(1)";
    }, 0);
}
//to hide the character grid
function hideChars() {
    document.getElementById('charRoster').style.opacity = 0;
    document.getElementById('charRoster').style.transform = "scale(1.2)";
    setTimeout(() => {
        document.getElementById('charRoster').style.display = "none";
    }, 200);
}

//called whenever clicking an image in the character roster
function changeCharacter() {
    if (charP1Active) {
        charP1 = this.id;
        skinP1 = charP1+"1"; //"Default";
        document.getElementById('p1CharSelector').setAttribute('src', charPath + '/CSS/'+charP1+'.png');
        charImgChange(charImgP1, charP1);
        addSkinIcons(1);
    } else if (charP2Active) {
        charP2 = this.id;
        skinP2 = charP2+"1"; //"Default";
        document.getElementById('p2CharSelector').setAttribute('src', charPath + '/CSS/'+charP2+'.png');
        charImgChange(charImgP2, charP2);
        addSkinIcons(2);
    } else if (charP3Active) {
        charP3 = this.id;
        skinP3 = charP3+"1"; //"Default";
        document.getElementById('p3CharSelector').setAttribute('src', charPath + '/CSS/'+charP3+'.png');
        charImgChange(charImgP3, charP3);
        addSkinIcons(3);
    } else {
        charP4 = this.id;
        skinP4 = charP4+"1"; //"Default";
        document.getElementById('p4CharSelector').setAttribute('src', charPath + '/CSS/'+charP4+'.png');
        charImgChange(charImgP4, charP4);
        addSkinIcons(4);
    }
}
//same as above but for the swap button
function changeCharacterManual(char, pNum) {
    document.getElementById('p'+pNum+'CharSelector').setAttribute('src', charPath + '/CSS/'+char+'.png');
    if (pNum == 1) {
        charP1 = char;
        skinP1 = charP1+"1"; //"Default";
        charImgChange(charImgP1, char);
        addSkinIcons(1);
    } else if (pNum == 2) {
        charP2 = char;
        skinP2 = charP2+"1"; //"Default";
        charImgChange(charImgP2, char);
        addSkinIcons(2);
    } else if (pNum == 3) {
        charP3 = char;
        skinP3 = charP3+"1"; //"Default";
        charImgChange(charImgP3, char);
        addSkinIcons(3);
    } else{
        charP4 = char;
        skinP4 = charP4+"1"; //"Default";
        charImgChange(charImgP4, char);
        addSkinIcons(4);
    }
}
//also called when we click those images
function addSkinIcons(pNum) {
    document.getElementById('skinListP'+pNum).innerHTML = ''; //clear everything before adding
    let charInfo;
    if (pNum == 1) { //ahh the classic 'which character am i' check
        charInfo = getJson(charPath + "/Portraits/" + charP1 + "/_Info"); 
       //charInfo = getJson("Character Info/" + charP1); 
    } else if (pNum == 2) {
        charInfo = getJson(charPath + "/Portraits/" + charP2 + "/_Info");
    } else if (pNum == 3) {
        charInfo = getJson(charPath + "/Portraits/" + charP3 + "/_Info");
    } else {
        charInfo = getJson(charPath + "/Portraits/" + charP4 + "/_Info");
    }

    if (charInfo != undefined) { //if character doesnt have a list (for example: Random), skip this

        //add an image for every skin on the list
            for (let i = 0; i < charInfo.skinList.length; i++) {
                if(charP1 == "Pyra" || charP2 == "Pyra" || charP3 == "Pyra" || charP4 == "Pyra"){
                    if(i > 7)
                        continue;
                }
                let newImg = document.createElement('img');
                newImg.className = "skinIcon";
                newImg.id = charInfo.skinList[i];
                newImg.title = charInfo.skinList[i];

                if (pNum == 1) {
                    newImg.setAttribute('src', charPath + '/Stock Icons/'+charP1+'/'+charInfo.skinList[i]+'.png');
                    newImg.addEventListener("click", changeSkinP1);
                } else if (pNum == 2) {
                    newImg.setAttribute('src', charPath + '/Stock Icons/'+charP2+'/'+charInfo.skinList[i]+'.png');
                    newImg.addEventListener("click", changeSkinP2);
                } else if (pNum == 3){
                    newImg.setAttribute('src', charPath + '/Stock Icons/'+charP3+'/'+charInfo.skinList[i]+'.png');
                    newImg.addEventListener("click", changeSkinP3);
                } else {
                    newImg.setAttribute('src', charPath + '/Stock Icons/'+charP4+'/'+charInfo.skinList[i]+'.png');
                    newImg.addEventListener("click", changeSkinP4);
                }

                document.getElementById('skinListP'+pNum).appendChild(newImg);
            }

        //if the character is Pyra(!!!), we also need to add Mythra(!!)
        if (charP1 == "Pyra") {
            if (!document.getElementById('skinListP1Mythra').children.length > 0) {
                for (let i = 8; i < charInfo.skinList.length; i++) {
                    let newImg = document.createElement('img');
                    newImg.className = "skinIcon";
                    newImg.id = /*"Mythra " + */charInfo.skinList[i];
                    newImg.title = /*"Mythra " + */charInfo.skinList[i];
        
                    newImg.setAttribute('src', charPath + '/Stock Icons/Pyra/'+charInfo.skinList[i]+'.png');
                    newImg.addEventListener("click", changeSkinP1);

                    //increase the height of the skins box
                    document.getElementById('skinSelectorP1').style.height = "60px";
        
                    document.getElementById('skinListP1Mythra').appendChild(newImg);
                }
            }
            document.getElementById('skinListP1').style.marginTop = "0px";
        } else {
            document.getElementById('skinSelectorP1').style.height = "30px";
            document.getElementById('skinListP1').style.marginTop = "-1px";
            document.getElementById('skinListP1Mythra').innerHTML = '';
        }
        if (charP2 == "Pyra") {
            if (!document.getElementById('skinListP2Mythra').children.length > 0) {
                for (let i = 8; i < charInfo.skinList.length; i++) {
                    let newImg = document.createElement('img');
                    newImg.className = "skinIcon";
                    newImg.id = /*"Mythra " + */charInfo.skinList[i];
                    newImg.title = /*"Mythra " + */charInfo.skinList[i];
        
                    newImg.setAttribute('src', charPath + '/Stock Icons/Pyra/'+charInfo.skinList[i]+'.png');
                    newImg.addEventListener("click", changeSkinP2);
                    document.getElementById('skinSelectorP2').style.height = "60px";
        
                    document.getElementById('skinListP2Mythra').appendChild(newImg);
                }
            }
            document.getElementById('skinListP2').style.marginTop = "0px";
        } else {
            document.getElementById('skinSelectorP2').style.height = "30px";
            document.getElementById('skinListP2').style.marginTop = "-1px";
            document.getElementById('skinListP2Mythra').innerHTML = '';
        }
        if (charP3 == "Pyra") {
            if (!document.getElementById('skinListP3Mythra').children.length > 0) {
                for (let i = 8; i < charInfo.skinList.length; i++) {
                    let newImg = document.createElement('img');
                    newImg.className = "skinIcon";
                    newImg.id = /*"Mythra " + */charInfo.skinList[i];
                    newImg.title = /*"Mythra " + */charInfo.skinList[i];
        
                    newImg.setAttribute('src', charPath + '/Stock Icons/Pyra/'+charInfo.skinList[i]+'.png');
                    newImg.addEventListener("click", changeSkinP3);
                    document.getElementById('skinSelectorP3').style.height = "60px";
        
                    document.getElementById('skinListP3Mythra').appendChild(newImg);
                }
            }
            document.getElementById('skinListP3').style.marginTop = "0px";
        } else {
            document.getElementById('skinSelectorP3').style.height = "30px";
            document.getElementById('skinListP3').style.marginTop = "-1px";
            document.getElementById('skinListP3Mythra').innerHTML = '';
        }
        if (charP4 == "Pyra") {
            if (!document.getElementById('skinListP4Mythra').children.length > 0) {
                for (let i = 8; i < charInfo.skinList.length; i++) {
                    let newImg = document.createElement('img');
                    newImg.className = "skinIcon";
                    newImg.id = /*"Mythra " + */charInfo.skinList[i];
                    newImg.title = /*"Mythra " + */charInfo.skinList[i];
        
                    newImg.setAttribute('src', charPath + '/Stock Icons/Pyra/'+charInfo.skinList[i]+'.png');
                    newImg.addEventListener("click", changeSkinP4);
                    document.getElementById('skinSelectorP4').style.height = "60px";
        
                    document.getElementById('skinListP4Mythra').appendChild(newImg);
                }
            }
            document.getElementById('skinListP4').style.marginTop = "0px";
        } else {
            document.getElementById('skinSelectorP4').style.height = "30px";
            document.getElementById('skinListP4').style.marginTop = "-1px";
            document.getElementById('skinListP4Mythra').innerHTML = '';
        }
    }

    //if the list only has 1 skin or none, hide the skin list
    if (document.getElementById('skinListP'+pNum).children.length <= 1) {
        document.getElementById('skinSelectorP'+pNum).style.display = 'none';
        document.getElementById('skinSelectorP'+pNum).style.opacity = 0;
    } else {
        document.getElementById('skinSelectorP'+pNum).style.display = 'flex';
        document.getElementById('skinSelectorP'+pNum).style.opacity = 1;
    }
}
//whenever clicking on the skin images
function changeSkinP1() {
    skinP1 = this.id;
    charImgChange(charImgP1, charP1, skinP1);
}
function changeSkinP2() {
    skinP2 = this.id;
    charImgChange(charImgP2, charP2, skinP2);
}
function changeSkinP3() {
    skinP3 = this.id;
    charImgChange(charImgP3, charP3, skinP3);
}
function changeSkinP4() {
    skinP4 = this.id;
    charImgChange(charImgP4, charP4, skinP4);
}


//whenever clicking on the first score tick
function changeScoreTicks1() {
    let pNum = 1;
    if (this == p2Win1) {
        pNum = 2;
    }

    //deactivate wins 2 and 3
    document.getElementById('winP'+pNum+'-2').checked = false;
    document.getElementById('winP'+pNum+'-3').checked = false;
}
//whenever clicking on the second score tick
function changeScoreTicks2() {
    let pNum = 1;
    if (this == p2Win2) {
        pNum = 2;
    }

    //deactivate wins 2 and 3
    document.getElementById('winP'+pNum+'-1').checked = true;
    document.getElementById('winP'+pNum+'-3').checked = false;
}
//something something the third score tick
function changeScoreTicks3() {
    let pNum = 1;
    if (this == p2Win3) {
        pNum = 2;
    }

    //deactivate wins 2 and 3
    document.getElementById('winP'+pNum+'-1').checked = true;
    document.getElementById('winP'+pNum+'-2').checked = true;
}

//returns how much score does a player have
function checkScore(tick1, tick2, tick3) {
    let totalScore = 0;

    if (tick1.checked) {
        totalScore++;
    }
    if (tick2.checked) {
        totalScore++;
    }
    if (tick3.checked) {
        totalScore++;
    }

    return totalScore;
}

//gives a victory to player 1 
function giveWinP1() {
    if (p1Win2.checked) {
        p1Win3.checked = true;
    } else if (p1Win1.checked) {
        p1Win2.checked = true;
    } else if (!p1Win1.checked) {
        p1Win1.checked = true;
    }
}
//same with P2
function giveWinP2() {
    if (p2Win2.checked) {
        p2Win3.checked = true;
    } else if (p2Win1.checked) {
        p2Win2.checked = true;
    } else if (!p2Win1.checked) {
        p2Win1.checked = true;
    }
}


function setWLP1() {
    if (this == p1W) {
        currentP1WL = "W";
        this.style.color = "var(--text1)";
        p1L.style.color = "var(--text2)";
        this.style.backgroundImage = "linear-gradient(to top, #575757, #00000000)";
        p1L.style.backgroundImage = "var(--bg4)";
    } else {
        currentP1WL = "L";
        this.style.color = "var(--text1)";
        p1W.style.color = "var(--text2)";
        this.style.backgroundImage = "linear-gradient(to top, #575757, #00000000)";
        p1W.style.backgroundImage = "var(--bg4)";
    }
}
function setWLP2() {
    if (this == p2W) {
        currentP2WL = "W";
        this.style.color = "var(--text1)";
        p2L.style.color = "var(--text2)";
        this.style.backgroundImage = "linear-gradient(to top, #575757, #00000000)";
        p2L.style.backgroundImage = "var(--bg4)";
    } else {
        currentP2WL = "L";
        this.style.color = "var(--text1)";
        p2W.style.color = "var(--text2)";
        this.style.backgroundImage = "linear-gradient(to top, #575757, #00000000)";
        p2W.style.backgroundImage = "var(--bg4)";
    }
}
function deactivateWL() {
    currentP1WL = "Nada";
    currentP2WL = "Nada";
    document.getElementById;

    pWLs = document.getElementsByClassName("wlBox");
    for (let i = 0; i < pWLs.length; i++) {
        pWLs[i].style.color = "var(--text2)";
        pWLs[i].style.backgroundImage = "var(--bg4)";
    }
}

// new player preset stuff!!!!

//player presets setup
function preparePF(pNum) {
    //let pFinderEL = p1Finder;
    const pFinderEL = pFinders[pNum-1];
    
    //if the mouse is hovering a player preset, let us know
    pFinderEL.addEventListener("mouseenter", () => { inPF = true });
    pFinderEL.addEventListener("mouseleave", () => { inPF = false });

    //hide the player presets menu if text input loses focus
    pNameInps[pNum-1].addEventListener("focusout", () => {
        if (!inPF) { //but not if the mouse is hovering a player preset
            pFinderEL.style.display = "none";
        }
    });
}

function checkPlayerPreset() {

    //remove the "focus" for the player presets list
    currentFocus = -1;

    //player check once again
    const pNum = this.id.substring(1, 2);
    const pFinderEL = pFinders[pNum-1];

    //clear the current list each time we type
    pFinderEL.innerHTML = "";

    //if we typed at least 2 letters
    if (this.value.length >= 2) {

        //check the files in that folder
        const files = fs.readdirSync(mainPath + "/Player Info/");
        files.forEach(file => {

            //removes ".json" from the file name
            file = file.substring(0, file.length - 5);

            //if the current text matches a file from that folder
            if (file.toLocaleLowerCase().includes(this.value.toLocaleLowerCase())) {

                //un-hides the player presets div
                pFinderEL.style.display = "block";

                //go inside that file to get the player info
                const playerInfo = getJson(mainPath + "/Player Info/" + file);

                //for each character that player plays
                playerInfo.characters.forEach(char => {
                    
                    //this will be the div to click
                    const newDiv = document.createElement('div');
                    newDiv.className = "finderEntry";
                    newDiv.addEventListener("click", playerPreset);
                    
                    //create the texts for the div, starting with the tag
                    const spanTag = document.createElement('span');
                    //if the tag is empty, dont do anything
                    if (playerInfo.tag != "") {
                        spanTag.innerHTML = playerInfo.tag;
                        spanTag.className = "pfTag";
                    }

                    //player name
                    const spanName = document.createElement('span');
                    spanName.innerHTML = playerInfo.name;
                    spanName.className = "pfName";

                    //player character
                    const spanChar = document.createElement('span');
                    spanChar.innerHTML = char.character;
                    spanChar.className = "pfChar";

                    //we will use css variables to store data to read when clicked
                    newDiv.style.setProperty("--tag", playerInfo.tag);
                    newDiv.style.setProperty("--name", playerInfo.name);
                    newDiv.style.setProperty("--char", char.character);
                    newDiv.style.setProperty("--skin", char.skin);

                    //add them to the div we created before
                    newDiv.appendChild(spanTag);
                    newDiv.appendChild(spanName);
                    newDiv.appendChild(spanChar);

                    //now for the character image, this is the mask/mirror div
                    const charImgBox = document.createElement("div");
                    charImgBox.className = "pfCharImgBox";

                    //actual image
                    const charImg = document.createElement('img');
                    charImg.className = "pfCharImg";
                    charImg.setAttribute('src', charPath+'/Portraits/'+char.character+'/'+char.skin+'.png');
                    
                    //we have to position it
                    positionChar(char.character, char.skin, charImg);

                    //and add it to the mask
                    charImgBox.appendChild(charImg);

                    //add it to the main div
                    newDiv.appendChild(charImgBox);

                    //and now add the div to the actual interface
                    pFinderEL.appendChild(newDiv);
                });
            }
        });
    }
}

async function positionChar(character, skin, charEL) {

    //get the character positions
    let charInfo;
    charInfo = getJson(charPath + "/Portraits/" + character + "/_Info");
	
	//             x, y, scale
	let charPos = [0, 0, 1];
	//now, check if the character and skin exist in the database down there
	if (charInfo != undefined) {
		if (charInfo.gui[skin]) { //if the skin has a specific position
			charPos[0] = charInfo.gui[skin].x;
			charPos[1] = charInfo.gui[skin].y;
			charPos[2] = charInfo.gui[skin].scale;
		} else { //if none of the above, use a default position 
			charPos[0] = charInfo.gui.neutral.x;
			charPos[1] = charInfo.gui.neutral.y;
			charPos[2] = charInfo.gui.neutral.scale;
		} 
	} else { //if the character isnt on the database, set positions for the "?" image
		charPos[0] = 0;
        charPos[1] = 0;
        charPos[2] = 1.2;
	}
    
    //to position the character
    charEL.style.left = charPos[0] + "px";
    charEL.style.top = charPos[1] + "px";
    charEL.style.transform = "scale(" + charPos[2] + ")";
    
    //if the image fails to load, we will put a placeholder
	charEL.addEventListener("error", () => {
        charEL.setAttribute('src', charPath + '/Random/P2.png');
        charEL.style.left = "0px";
        charEL.style.top = "-2px";
        charEL.style.transform = "scale(1.2)";
	});
}

function playerPreset() {

    //we all know what this is by now
    const pNum = this.parentElement.id.substring(this.parentElement.id.length - 1) - 1;

    pTagInps[pNum].value = this.style.getPropertyValue("--tag");
    changeInputWidth(pTagInps[pNum]);

    pNameInps[pNum].value = this.style.getPropertyValue("--name");
    changeInputWidth(pNameInps[pNum]);

    if(pNum == 0){
        charP1 = this.style.getPropertyValue("--char");
        skinP1 = this.style.getPropertyValue("--skin");
        charImgChange(charImgP1, charP1, skinP1);
        document.getElementById('p1CharSelector').setAttribute('src', charPath + '/CSS/'+charP1+'.png');
        addSkinIcons(1);
    } else if(pNum == 1) {
        charP2 = this.style.getPropertyValue("--char");
        skinP2 = this.style.getPropertyValue("--skin");
        charImgChange(charImgP2, charP2, skinP2);
        document.getElementById('p2CharSelector').setAttribute('src', charPath + '/CSS/'+charP2+'.png');
        addSkinIcons(2);
    } else if(pNum == 2) {
        charP3 = this.style.getPropertyValue("--char");
        skinP3 = this.style.getPropertyValue("--skin");
        charImgChange(charImgP3, charP3, skinP3);
        document.getElementById('p3CharSelector').setAttribute('src', charPath + '/CSS/'+charP3+'.png');
        addSkinIcons(3);
    } else {
        charP4 = this.style.getPropertyValue("--char");
        skinP4 = this.style.getPropertyValue("--skin");
        charImgChange(charImgP4, charP4, skinP4);
        document.getElementById('p4CharSelector').setAttribute('src', charPath + '/CSS/'+charP4+'.png');
        addSkinIcons(4);
    }

    pFinders[pNum].style.display = "none";
}

// //visual feedback to navigate the player presets menu
function addActive(x) {
    //clears active from all entries
    for (let i = 0; i < x.length; i++) {
        x[i].classList.remove("finderEntry-active");
    }

    //if end of list, cicle
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (x.length - 1);

    //add to the selected entry the active class
    x[currentFocus].classList.add("finderEntry-active");
}

//same code as above but just for the player tag
function resizeInput() {
    changeInputWidth(this);
}

//changes the width of an input box depending on the text
function changeInputWidth(input) {
    input.style.width = getTextWidth(input.value,
        window.getComputedStyle(input).fontSize + " " +
        window.getComputedStyle(input).fontFamily
        ) + 12 + "px";
}


//used to get the exact width of a text considering the font used
function getTextWidth(text, font) {
    let canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
    let context = canvas.getContext("2d");
    context.font = font;
    let metrics = context.measureText(text);
    return metrics.width;
}


//used when clicking on the "Best of" buttons
function changeBestOf() {
    let theOtherBestOf; //we always gotta know
    if (this == document.getElementById("bo5Div")) {
        currentBestOf = "Bo5";
        theOtherBestOf = document.getElementById("bo3Div");
        p1Win3.style.display = "block";
        p2Win3.style.display = "block";
        if(wlButtons[0].style.display == "inline") {
            tNameInps[0].style.width = "58.2%";
            tNameInps[1].style.width = "58.2%";
        } else {
            tNameInps[0].style.width = "100%";
            tNameInps[1].style.width = "100%";

        }
    } else {
        currentBestOf = "Bo3";
        theOtherBestOf = document.getElementById("bo5Div");
        p1Win3.style.display = "none";
        p2Win3.style.display = "none";
        if(wlButtons[0].style.display == "inline") {
            tNameInps[0].style.width = "63%";
            tNameInps[1].style.width = "63%";
        } else {
            tNameInps[0].style.width = "100%";
            tNameInps[1].style.width = "100%";
        }
    }

    //change the color and background of the buttons
    this.style.color = "var(--text1)";
    this.style.backgroundImage = "linear-gradient(to top, #575757, #00000000)";
    theOtherBestOf.style.color = "var(--text2)";
    theOtherBestOf.style.backgroundImage = "var(--bg4)";
}


function checkRound() {
    if (!forceWL.checked) {
        const wlButtons = document.getElementsByClassName("wlButtons");

        if (roundInp.value.toLocaleUpperCase().includes("Grand".toLocaleUpperCase())) {
            for (let i = 0; i < wlButtons.length; i++) {
                wlButtons[i].style.display = "inline";
                if(currentBestOf == "Bo3") {
                    tNameInps[0].style.width = "63%";
                    tNameInps[1].style.width = "63%";
                } else {
                    tNameInps[0].style.width = "58.2%";
                    tNameInps[1].style.width = "58.2%";
                }
            }
        } else {
            for (let i = 0; i < wlButtons.length; i++) {
                wlButtons[i].style.display = "none";
                tNameInps[0].style.width = "100%";
                tNameInps[1].style.width = "100%";
                deactivateWL();
            }
        }
    }
}

function windowResize() {
    
    if (gamemode == 2) {
        
        window.resizeTo(1000, 500);
        document.getElementById('playerRegion').style.height = "312px";
        document.getElementById('playerSep').style.height = "312px";
        document.getElementById('settings').style.height = "500px";
        document.getElementById('makeP1Preset').style.marginTop = "255px";
        //document.getElementById('copyMatch').style.marginTop = "330px";
        for(let i = 0; i < document.getElementsByClassName('sideEditor').length; i++) {
            document.getElementsByClassName('sideEditor')[i].style.height = "50%";
        }
        for(let i = 0; i < document.getElementsByClassName('charImgBox').length; i++) {
            document.getElementsByClassName('charImgBox')[i].style.paddingTop = "170px";
        }
        for(let i = 0; i < document.getElementsByClassName('charImg').length; i++) {
            document.getElementsByClassName('charImg')[i].style.height = "40%";
        }

        document.getElementById('p1CharImg').style.float = "left";
        document.getElementById('p2CharImg').style.float = "left";

        document.getElementById('charRoster').style.height = "500px";


    }
    else {
        window.resizeTo(1000, 300);
        document.getElementById('playerRegion').style.height = "150px";
        document.getElementById('playerSep').style.height = "100%";
        document.getElementById('settings').style.height = "300px";
        document.getElementById('makeP1Preset').style.marginTop = "95px";
        //document.getElementById('copyMatch').style.marginTop = "170px";
        for(let i = 0; i < document.getElementsByClassName('sideEditor').length; i++) {
            document.getElementsByClassName('sideEditor')[i].style.height = "100%";
        }
        for(let i = 0; i < document.getElementsByClassName('charImgBox').length; i++) {
            document.getElementsByClassName('charImgBox')[i].style.paddingTop = "0px";
        }
        for(let i = 0; i < document.getElementsByClassName('charImg').length; i++) {
            document.getElementsByClassName('charImg')[i].style.height = "100%";
        }

        document.getElementById('p1CharImg').style.float = "right";
        document.getElementById('p2CharImg').style.float = "right";

        document.getElementById('charRoster').style.height = "300px";

        //document.getElementById('p1ScoreInfo').style.paddingLeft = "10px";
        //document.getElementById('p2ScoreInfo').style.paddingLeft = "0px";
    }
}

//called when clicking on the gamemode icon, cycles through singles and doubles
function changeGamemode() {

    //things are about to get messy
    if (gamemode == 1) {
        
        gamemode = 2;

        windowResize();

        //show singles icon
        gmIcon2.style.opacity = 0;
        gmIcon1.style.left = "11px"; 
        
        //hide the background character image to reduce clutter

        //add some margin to the color buttons, change border radius
        const lColor = document.getElementById("p1Color");
        lColor.style.marginLeft = "5px";
        lColor.style.borderTopLeftRadius = "3px";
        lColor.style.borderBottomLeftRadius = "3px";
        const rColor = document.getElementById("p2Color");
        rColor.style.marginLeft = "5px";
        rColor.style.borderTopLeftRadius = "3px";
        rColor.style.borderBottomLeftRadius = "3px";

        for (let i = 1; i < 3; i++) {
            document.getElementById("row1-"+i).insertAdjacentElement("afterbegin", wlButtons[i-1]);
            document.getElementById("row1-"+i).insertAdjacentElement("afterbegin", document.getElementById('scoreBox'+i));
            
            document.getElementById("scoreText"+i).style.display = "none";

            tNameInps[i-1].style.display = "block";

            document.getElementById("row1-"+i).insertAdjacentElement("afterbegin", tNameInps[i-1]);

            document.getElementById('row2-'+i).insertAdjacentElement("beforeend", document.getElementById('p' + i + 'Info'));

            charSelectors[i+1].style.display = "block";
            skinSelectors[i+1].style.display = "block";
            document.getElementById('p' + (i+2) + 'CharImg').style.display = "block";
                        
            document.getElementById('skinListP'+(i+2)).style.display = "block";
            document.getElementById('skinListP'+(i+2)+'Mythra').style.display = "block";

            document.getElementById('p' + (i+2) + 'Info').style.display = "block";
        }

        document.getElementById('p3CharSelector').setAttribute('src', charPath + '/CSS/'+charP3+'.png');
        charImgChange(charImgP3, charP3);
        addSkinIcons(3);

        document.getElementById('p4CharSelector').setAttribute('src', charPath + '/CSS/'+charP4+'.png');
        charImgChange(charImgP4, charP4);
        addSkinIcons(4);

        //add some left margin to the name/tag inputs, add border radius, change max width
        for (let i = 0; i < maxPlayers; i++) {
            pTagInps[i].style.marginLeft = "5px";

            pNameInps[i].style.borderTopRightRadius = "3px";
            pNameInps[i].style.borderBottomRightRadius = "3px";

            pTagInps[i].style.maxWidth = "45px"
            pNameInps[i].style.maxWidth = "94px"
        }


        //change the hover tooltip
        this.setAttribute('title', "Change the gamemode to Singles");

        //dropdown menus for the right side will now be positioned to the right
        for (let i = 1; i < 5; i+=2) {
            pFinders[i].style.right = "0px";
            pFinders[i].style.left = "";
        }
        document.getElementById("dropdownColorP2").style.right = "0px";
        document.getElementById("dropdownColorP2").style.left = "";

        document.getElementById('scoreBox1').style.marginLeft = "0px";
        document.getElementById('scoreBox2').style.marginLeft = "0px";

    } else if (gamemode == 2) {

        gamemode = 1;

        windowResize();

        //show doubles icon
        gmIcon2.style.opacity = 1;
        gmIcon1.style.left = "4px";
        gmIcon2.style.left = "17px";

        //remove color button margin, change border radius
        const lColor = document.getElementById("p1Color");
        lColor.style.marginLeft = "0px";
        lColor.style.borderTopLeftRadius = "0px";
        lColor.style.borderBottomLeftRadius = "0px";
        const rColor = document.getElementById("p2Color");
        rColor.style.marginLeft = "0px";
        rColor.style.borderTopLeftRadius = "0px";
        rColor.style.borderBottomLeftRadius = "0px";        

        //move everything back to normal
        for (let i = 1; i < 3; i++) {
            //charImgs[i-1].style.opacity = 1;

            tNameInps[i-1].style.display = "none";
            charSelectors[i+1].style.display = "none";
            skinSelectors[i+1].style.display = "none";

            document.getElementById('p' + (i+2) + 'Info').style.display = "none";
            document.getElementById('p' + (i+2) + 'CharImg').style.display = "none";

            document.getElementById("row3-"+i).insertAdjacentElement("afterbegin", wlButtons[i-1]);
            document.getElementById("row3-"+i).insertAdjacentElement("afterbegin", document.getElementById('scoreBox'+i));
            document.getElementById("scoreText"+i).style.display = "block";
        
            document.getElementById('row1-'+i).insertAdjacentElement("afterbegin", document.getElementById('p' + i + 'Info'));
        }

        for (let i = 0; i < maxPlayers; i++) {
            pTagInps[i].style.marginLeft = "0px";

            pNameInps[i].style.borderTopRightRadius = "0px";
            pNameInps[i].style.borderBottomRightRadius = "0px";

            pTagInps[i].style.maxWidth = "70px"
            pNameInps[i].style.maxWidth = "173px"
        }

        document.getElementById("gamemode").setAttribute('title', "Change the gamemode to Doubles");

        //dropdown menus for the right side will now be positioned to the left
        for (let i = 1; i < 5; i+=2) {
            pFinders[i].style.left = "0px";
            pFinders[i].style.right = "";
        }

        document.getElementById('scoreBox1').style.marginLeft = "10px";
        document.getElementById('scoreBox2').style.marginLeft = "10px";
    }
}

function changeWLButtons() {
    if (currentP1WL == "W") {
        p1W.style.color = "var(--text1)";
        p1L.style.color = "var(--text2)";
        p1W.style.backgroundImage = "linear-gradient(to top, #575757, #00000000)";
        p1L.style.backgroundImage = "var(--bg4)";
    } else if (currentP1WL == "L") {
        p1L.style.color = "var(--text1)";
        p1W.style.color = "var(--text2)";
        p1L.style.backgroundImage = "linear-gradient(to top, #575757, #00000000)";
        p1W.style.backgroundImage = "var(--bg4)";
    }
    if (currentP2WL == "W") {
        p2W.style.color = "var(--text1)";
        p2L.style.color = "var(--text2)";
        p2W.style.backgroundImage = "linear-gradient(to top, #575757, #00000000)";
        p2L.style.backgroundImage = "var(--bg4)";
    } else if (currentP2WL == "L") {
        p2L.style.color = "var(--text1)";
        p2W.style.color = "var(--text2)";
        p2L.style.backgroundImage = "linear-gradient(to top, #575757, #00000000)";
        p2W.style.backgroundImage = "var(--bg4)";
    }
}

function swap() {

    let tempP1Name = p1NameInp.value;
    let tempP1Team = p1TagInp.value;
    let tempP2Name = p2NameInp.value;
    let tempP2Team = p2TagInp.value;

    p1NameInp.value = tempP2Name;
    p1TagInp.value = tempP2Team;
    p2NameInp.value = tempP1Name;
    p2TagInp.value = tempP1Team;

    changeInputWidth(p1NameInp);
    changeInputWidth(p1TagInp);
    changeInputWidth(p2NameInp);
    changeInputWidth(p2TagInp);

    let tempP1Char = charP1;
    let tempP2Char = charP2;
    let tempP1Skin = skinP1;
    let tempP2Skin = skinP2;

    changeCharacterManual(tempP2Char, 1);
    changeCharacterManual(tempP1Char, 2);

    charImgChange(charImgP1, charP1, tempP2Skin);
    charImgChange(charImgP2, charP2, tempP1Skin);

    skinP1 = tempP2Skin;
    skinP2 = tempP1Skin;

    if(gamemode == 2) {
        //team name
        const teamStore = tNameInps[0].value;
        tNameInps[0].value = tNameInps[1].value;
        tNameInps[1].value = teamStore;

        let tempP3Name = p3NameInp.value;
        let tempP3Team = p3TagInp.value;
        let tempP4Name = p4NameInp.value;
        let tempP4Team = p4TagInp.value;

        p3NameInp.value = tempP4Name;
        p3TagInp.value = tempP4Team;
        p4NameInp.value = tempP3Name;
        p4TagInp.value = tempP3Team;
        
        changeInputWidth(p3NameInp);
        changeInputWidth(p3TagInp);
        changeInputWidth(p4NameInp);
        changeInputWidth(p4TagInp);
        
        let tempP3Char = charP3;
        let tempP4Char = charP4;
        let tempP3Skin = skinP3;
        let tempP4Skin = skinP4;
        
        changeCharacterManual(tempP4Char, 3);
        changeCharacterManual(tempP3Char, 4);

        skinP3 = tempP4Skin;
        skinP4 = tempP3Skin;
    }

    if( currentP1WL != "Nada" && currentP2WL != "Nada") {
        let tempWL = currentP1WL;
        currentP1WL = currentP2WL;
        currentP2WL = tempWL;
        changeWLButtons();
    }

    tempP1Score = checkScore(p1Win1, p1Win2, p1Win3);
    tempP2Score = checkScore(p2Win1, p2Win2, p2Win3);
    setScore(tempP2Score, p1Win1, p1Win2, p1Win3);
    setScore(tempP1Score, p2Win1, p2Win2, p2Win3);
}

function clearPlayers() {

    //clear the team names
    for (let i = 0; i < tNameInps.length; i++) {
        tNameInps[i].value = "";        
    }

    for (let i = 0; i < maxPlayers; i++) {

        //clear player texts and tags
        pNameInps[i].value = "";
        changeInputWidth(pNameInps[i]);
        pTagInps[i].value = "";
        changeInputWidth(pTagInps[i]);
    }

    //reset characters to random
    document.getElementById('p1CharSelector').setAttribute('src', charPath + '/CSS/Random.png');
    charP1 = "Random";
    skinP1 = "";
    charImgChange(charImgP1, charP1);
    document.getElementById('skinListP1').innerHTML = '';
    document.getElementById('skinListP1Mythra').innerHTML = '';
    document.getElementById('skinSelectorP1').style.opacity = 0;
    document.getElementById('skinSelectorP1').style.display = 'none';

    document.getElementById('p2CharSelector').setAttribute('src', charPath + '/CSS/Random.png');
    charP2 = "Random";
    skinP2 = "";
    charImgChange(charImgP2, charP2);
    document.getElementById('skinListP2').innerHTML = '';
    document.getElementById('skinListP2Mythra').innerHTML = '';
    document.getElementById('skinSelectorP2').style.opacity = 0;
    document.getElementById('skinSelectorP2').style.display = 'none';

    document.getElementById('p3CharSelector').setAttribute('src', charPath + '/CSS/Random.png');
    charP3 = "Random";
    skinP3 = "";
    charImgChange(charImgP3, charP3);
    document.getElementById('skinListP3').innerHTML = '';
    document.getElementById('skinListP3Mythra').innerHTML = '';
    document.getElementById('skinSelectorP3').style.opacity = 0;
    document.getElementById('skinSelectorP3').style.display = 'none';

    document.getElementById('p4CharSelector').setAttribute('src', charPath + '/CSS/Random.png');
    charP4 = "Random";
    skinP4 = "";
    charImgChange(charImgP4, charP4);
    document.getElementById('skinListP4').innerHTML = '';
    document.getElementById('skinListP4Mythra').innerHTML = '';
    document.getElementById('skinSelectorP4').style.opacity = 0;
    document.getElementById('skinSelectorP4').style.display = 'none';

    //clear player scores
    let checks = document.getElementsByClassName("scoreCheck");
    for (let i = 0; i < checks.length; i++) {
        checks[i].checked = false;
    }
}

function setScore(score, tick1, tick2, tick3) {
    tick1.checked = false;
    tick2.checked = false;
    tick3.checked = false;
    if (score > 0) {
        tick1.checked = true;
        if (score > 1) {
            tick2.checked = true;
            if (score > 2) {
                tick3.checked = true;
            }
        }
    }
}


function forceWLtoggles() {
    const wlButtons = document.getElementsByClassName("wlButtons");

        if (forceWL.checked) {
            for (let i = 0; i < wlButtons.length; i++) {
                wlButtons[i].style.display = "flex";
            }
        } else {
            for (let i = 0; i < wlButtons.length; i++) {
                wlButtons[i].style.display = "none";
                deactivateWL();
            }
        }
}

//will copy the current match info to the clipboard
// Format: "Player1(Character1) Vs Player2(Character2) - Round - Tournament Name"
function copyMatch() {

    //initialize the string
    // let copiedText = tournamentInp.value + " - " + roundInp.value + " - ";

    let copiedText = "";

    // if (gamemode == 1) { //for singles matches
        //check if the player has a tag to add
        if (pTagInps[0].value) {
            copiedText += pTagInps[0].value + " | ";
        }
        copiedText += pNameInps[0].value + "(" + charP1 +") Vs ";
        if (pTagInps[1].value) {
            copiedText += pTagInps[1].value + " | ";
        }
        copiedText += pNameInps[1].value + "(" + charP2 +")";
    // } else {
    //     if(tNameInps[0] == "" && tNameInps == ""){
    //         copiedText += 
    //     }
    //     copiedText += tNameInps[0].value + " Vs " + tNameInps[1].value;
    // }
    copiedText += " - " + roundInp.value + " - " + tournamentInp.value;

    //send the string to the user's clipboard
    navigator.clipboard.writeText(copiedText);
}

//time to write it down
function writeScoreboard() {

    let scoreboardJson = {

        player: [
            {
                name: p1NameInp.value,
                tag: p1TagInp.value,
                character: charP1,
                skin: skinP1
            },
            {
                name: p2NameInp.value,
                tag: p2TagInp.value,
                character: charP2,
                skin: skinP2
            },
            {
                name: p3NameInp.value,
                tag: p3TagInp.value,
                character: charP3,
                skin: skinP3
            },
            {
                name: p4NameInp.value,
                tag: p4TagInp.value,
                character: charP4,
                skin: skinP4
            }
        ],
        teamName: [
            tNameInps[0].value,
            tNameInps[1].value
        ],
        color: [
            colorP1,
            colorP2
        ],
        score: [
            checkScore(p1Win1, p1Win2, p1Win3),
            checkScore(p2Win1, p2Win2, p2Win3)
        ],
        wl: [
            currentP1WL,
            currentP2WL,
        ],
        bestOf: currentBestOf,
        gamemode: gamemode,
        round: roundInp.value,
        tournamentName: document.getElementById('tournamentName').value,
        caster: [
            {
                name: document.getElementById('cName1').value,
                twitter: document.getElementById('cTwitter1').value,
                twitch: document.getElementById('cTwitch1').value
            },
            {
                name: document.getElementById('cName2').value,
                twitter: document.getElementById('cTwitter2').value,
                twitch: document.getElementById('cTwitch2').value,        
            }
        ],
        allowIntro: document.getElementById('allowIntro').checked,
        workshop: false,
        forceHD: false,
        noLoAHD: false,
        forceMM: false
    };

    let data = JSON.stringify(scoreboardJson, null, 2);
    fs.writeFileSync(mainPath + "/ScoreboardInfo.json", data);


    //simple .txt files
    fs.writeFileSync(mainPath + "/Simple Texts/Player 1.txt", p1NameInp.value);
    fs.writeFileSync(mainPath + "/Simple Texts/Player 2.txt", p2NameInp.value);
    fs.writeFileSync(mainPath + "/Simple Texts/Player 3.txt", p3NameInp.value);
    fs.writeFileSync(mainPath + "/Simple Texts/Player 4.txt", p4NameInp.value);

    fs.writeFileSync(mainPath + "/Simple Texts/Round.txt", roundInp.value);
    fs.writeFileSync(mainPath + "/Simple Texts/Tournament Name.txt", document.getElementById('tournamentName').value);

    fs.writeFileSync(mainPath + "/Simple Texts/Team 1.txt", tNameInps[0].value);
    fs.writeFileSync(mainPath + "/Simple Texts/Team 2.txt", tNameInps[1].value);

    fs.writeFileSync(textPath + "/Simple Texts/Score L.txt", checkScore(p1Win1, p1Win2, p1Win3));
    fs.writeFileSync(textPath + "/Simple Texts/Score R.txt", checkScore(p2Win1, p2Win2, p2Win3));

    fs.writeFileSync(mainPath + "/Simple Texts/Caster 1 Name.txt", document.getElementById('cName1').value);
    fs.writeFileSync(mainPath + "/Simple Texts/Caster 1 Twitter.txt", document.getElementById('cTwitter1').value);
    fs.writeFileSync(mainPath + "/Simple Texts/Caster 1 Twitch.txt", document.getElementById('cTwitch1').value);

    fs.writeFileSync(mainPath + "/Simple Texts/Caster 2 Name.txt", document.getElementById('cName2').value);
    fs.writeFileSync(mainPath + "/Simple Texts/Caster 2 Twitter.txt", document.getElementById('cTwitter2').value);
    fs.writeFileSync(mainPath + "/Simple Texts/Caster 2 Twitch.txt", document.getElementById('cTwitch2').value);

}

function makeP1Preset() {
    
    const playerInfo = getJson(mainPath + "/Player Info/" + p1NameInp.value);

    if (playerInfo != undefined) {

        const charArr = [];
        const skinArr = [];

        playerInfo.characters.forEach(char => {
            charArr.push(char.character);
            skinArr.push(char.skin);
        });

        if(!(charArr.includes(charP1) && skinArr.includes(skinP1)))
        {
            charArr.push(charP1);
            skinArr.push(skinP1)
        }

        let playerJson = {
            name: p1NameInp.value,
            tag: p1TagInp.value,
            characters: []
        }
    
        for (let i = 0; i < charArr.length; i++) {
            playerJson.characters.push({
                character: charArr[i],  skin: skinArr[i] 
            })
        }
        

        const data = JSON.stringify(playerJson, null, 2);
        fs.writeFileSync(mainPath + "/Player Info/" + p1NameInp.value + ".json", data);

    } else if (p1NameInp.value != ""){
        let playerJson = {
            name: p1NameInp.value,
            tag: p1TagInp.value,
            characters: [
                {
                    character: charP1,  skin: skinP1
                }
            ]
        }

        const data = JSON.stringify(playerJson, null, 2);
        fs.writeFileSync(mainPath + "/Player Info/" + p1NameInp.value + ".json", data);

    }


}

function makeP2Preset() {

    const playerInfo = getJson(mainPath + "/Player Info/" + p2NameInp.value);

    if (playerInfo != undefined) {

        const charArr = [];
        const skinArr = [];

        playerInfo.characters.forEach(char => {
            charArr.push(char.character);
            skinArr.push(char.skin);
        });

        if(!(charArr.includes(charP2) && skinArr.includes(skinP2)))
        {
            charArr.push(charP2);
            skinArr.push(skinP2)
        }

        let playerJson = {
            name: p2NameInp.value,
            tag: p2TagInp.value,
            characters: []
        }
    
        for (let i = 0; i < charArr.length; i++) {
            playerJson.characters.push({
                character: charArr[i],  skin: skinArr[i] 
            })
        }
        

        const data = JSON.stringify(playerJson, null, 2);
        fs.writeFileSync(mainPath + "/Player Info/" + p2NameInp.value + ".json", data);

    } else if (p2NameInp.value != ""){
        let playerJson = {
            name: p2NameInp.value,
            tag: p2TagInp.value,
            characters: [
                {
                    character: charP2,  skin: skinP2
                }
            ]
        }

        const data = JSON.stringify(playerJson, null, 2);
        fs.writeFileSync(mainPath + "/Player Info/" + p2NameInp.value + ".json", data);
        
    }


}

function makeP3Preset() {

    const playerInfo = getJson(mainPath + "/Player Info/" + p3NameInp.value);

    if (playerInfo != undefined) {

        const charArr = [];
        const skinArr = [];

        playerInfo.characters.forEach(char => {
            charArr.push(char.character);
            skinArr.push(char.skin);
        });

        if(!(charArr.includes(charP3) && skinArr.includes(skinP3)))
        {
            charArr.push(charP3);
            skinArr.push(skinP3)
        }

        let playerJson = {
            name: p3NameInp.value,
            tag: p3TagInp.value,
            characters: []
        }
    
        for (let i = 0; i < charArr.length; i++) {
            playerJson.characters.push({
                character: charArr[i],  skin: skinArr[i] 
            })
        }
        

        const data = JSON.stringify(playerJson, null, 2);
        fs.writeFileSync(mainPath + "/Player Info/" + p3NameInp.value + ".json", data);

    } else if (p3NameInp.value != ""){
        let playerJson = {
            name: p3NameInp.value,
            tag: p3TagInp.value,
            characters: [
                {
                    character: charP3,  skin: skinP3
                }
            ]
        }

        const data = JSON.stringify(playerJson, null, 2);
        fs.writeFileSync(mainPath + "/Player Info/" + p3NameInp.value + ".json", data);
        
    }


}

function makeP4Preset() {
    
    const playerInfo = getJson(mainPath + "/Player Info/" + p4NameInp.value);

    if (playerInfo != undefined) {

        const charArr = [];
        const skinArr = [];

        playerInfo.characters.forEach(char => {
            charArr.push(char.character);
            skinArr.push(char.skin);
        });

        if(!(charArr.includes(charP4) && skinArr.includes(skinP4)))
        {
            charArr.push(charP4);
            skinArr.push(skinP4)
        }

        let playerJson = {
            name: p4NameInp.value,
            tag: p4TagInp.value,
            characters: []
        }
    
        for (let i = 0; i < charArr.length; i++) {
            playerJson.characters.push({
                character: charArr[i],  skin: skinArr[i] 
            })
        }
        

        const data = JSON.stringify(playerJson, null, 2);
        fs.writeFileSync(mainPath + "/Player Info/" + p4NameInp.value + ".json", data);

    } else if (p4NameInp.value != ""){
        let playerJson = {
            name: p4NameInp.value,
            tag: p4TagInp.value,
            characters: [
                {
                    character: charP4,  skin: skinP4
                }
            ]
        }

        const data = JSON.stringify(playerJson, null, 2);
        fs.writeFileSync(mainPath + "/Player Info/" + p4NameInp.value + ".json", data);
        
    }


}