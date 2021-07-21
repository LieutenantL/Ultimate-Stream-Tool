@echo off
:starttt

set INPUT_file=input2.txt

for /F "tokens=*" %%A in (%INPUT_FILE%) do call :ParseLine %%A

:ParseLine
set "fighter=%1"

if /I "%fighter%" EQU "exit" goto :end

set fighterstring=%fighter%
@For /F "Tokens=2 Delims=:" %%A In ('"Find "" ":%fighterstring:~,1%" 2>&1"') do set fighterstring=%%A%fighterstring:~1%

if %fighter%==donkey set fighterstring="Donkey Kong"
if %fighter%==samusd set fighterstring="Dark Samus"
if %fighter%==captain set fighterstring="Captain Falcon"
if %fighter%==ice_climber set fighterstring="Ice Climbers"
if %fighter%==dolly set fighterstring="Terry"
if %fighter%==mariod set fighterstring="Dr Mario"
if %fighter%==younglink set fighterstring="Young Link"
if %fighter%==gamewatch set fighterstring="Mr Game and Watch"
if %fighter%==metaknight set fighterstring="Meta Knight"
if %fighter%==pitb set fighterstring="Dark Pit"
if %fighter%==szerosuit set fighterstring="Zero Suit Samus"
if %fighter%==ptrainer set fighterstring="Pokemon Trainer"
if %fighter%==diddy set fighterstring="Diddy Kong"
if %fighter%==dedede set fighterstring="King Dedede"
if %fighter%==toonlink set fighterstring="Toon Link"
if %fighter%==rockman set fighterstring="Mega Man"
if %fighter%==wiifit set fighterstring="Wii Fit Trainer"
if %fighter%==rosetta set fighterstring="Rosalina and Luma"
if %fighter%==littlemac set fighterstring="Little Mac"
if %fighter%==pacman set fighterstring="Pac-Man"
if %fighter%==koopajr set fighterstring="Bowser Jr"
if %fighter%==robot set fighterstring="ROB"
if %fighter%==duckhunt set fighterstring="Duck Hunt"
if %fighter%==krool set fighterstring="King K Rool"
if %fighter%==buddy set fighterstring="Banjo and Kazooie"
if %fighter%==edge set fighterstring="Sephiroth"
if %fighter%==eflame set fighterstring="Pyra"
if %fighter%==elight set fighterstring="Mythra"
if %fighter%==ganon set fighterstring="Ganondorf"
if %fighter%==gaogaen set fighterstring="Incineroar"
if %fighter%==gekkouga set fighterstring="Greninja"
if %fighter%==jack set fighterstring="Joker"
if %fighter%==kamui set fighterstring="Corrin"
if %fighter%==koopa set fighterstring="Bowser"
if %fighter%==master set fighterstring="Byleth"
if %fighter%==miifighter set fighterstring="Mii Brawler"
if %fighter%==miigunner set fighterstring="Mii Gunner"
if %fighter%==miiswordsman set fighterstring="Mii Swordfighter"
if %fighter%==murabito set fighterstring="Villager"
if %fighter%==packun set fighterstring="Piranha Plant"
if %fighter%==pickel set fighterstring="Steve"
if %fighter%==pikmin set fighterstring="Olimar"
if %fighter%==purin set fighterstring="Jigglypuff"
if %fighter%==reflet set fighterstring="Robin"
if %fighter%==shizue set fighterstring="Isabelle"
if %fighter%==tantan set fighterstring="Min Min"
if %fighter%==demon set fighterstring="Kazuya"
if %fighter%==brave set fighterstring="Hero"

if exist %fighterstring% (
	goto :starttt
)	else (
	mkdir %fighterstring%
)

set number1=0
set number2=1
copy "C:\Users\leevi\Downloads\Nintendo Switch - Super Smash Bros Ultimate - Stock Icons\Super Smash Bros Ultimate\Stock Icons\chara_2_%fighter%_0%number1%.png" "C:\Users\leevi\Desktop\Ultimate-Stream-Tool - Copy\Stream Tool\Resources\Characters\HQ Stock Icons\"%fighterstring%"\"%fighterstring%"%number2%.png"
set number1=1
set number2=2
copy "C:\Users\leevi\Downloads\Nintendo Switch - Super Smash Bros Ultimate - Stock Icons\Super Smash Bros Ultimate\Stock Icons\chara_2_%fighter%_0%number1%.png" "C:\Users\leevi\Desktop\Ultimate-Stream-Tool - Copy\Stream Tool\Resources\Characters\HQ Stock Icons\"%fighterstring%"\"%fighterstring%"%number2%.png"
set number1=2
set number2=3
copy "C:\Users\leevi\Downloads\Nintendo Switch - Super Smash Bros Ultimate - Stock Icons\Super Smash Bros Ultimate\Stock Icons\chara_2_%fighter%_0%number1%.png" "C:\Users\leevi\Desktop\Ultimate-Stream-Tool - Copy\Stream Tool\Resources\Characters\HQ Stock Icons\"%fighterstring%"\"%fighterstring%"%number2%.png"
set number1=3
set number2=4
copy "C:\Users\leevi\Downloads\Nintendo Switch - Super Smash Bros Ultimate - Stock Icons\Super Smash Bros Ultimate\Stock Icons\chara_2_%fighter%_0%number1%.png" "C:\Users\leevi\Desktop\Ultimate-Stream-Tool - Copy\Stream Tool\Resources\Characters\HQ Stock Icons\"%fighterstring%"\"%fighterstring%"%number2%.png"
set number1=4
set number2=5
copy "C:\Users\leevi\Downloads\Nintendo Switch - Super Smash Bros Ultimate - Stock Icons\Super Smash Bros Ultimate\Stock Icons\chara_2_%fighter%_0%number1%.png" "C:\Users\leevi\Desktop\Ultimate-Stream-Tool - Copy\Stream Tool\Resources\Characters\HQ Stock Icons\"%fighterstring%"\"%fighterstring%"%number2%.png"
set number1=5
set number2=6
copy "C:\Users\leevi\Downloads\Nintendo Switch - Super Smash Bros Ultimate - Stock Icons\Super Smash Bros Ultimate\Stock Icons\chara_2_%fighter%_0%number1%.png" "C:\Users\leevi\Desktop\Ultimate-Stream-Tool - Copy\Stream Tool\Resources\Characters\HQ Stock Icons\"%fighterstring%"\"%fighterstring%"%number2%.png"
set number1=6
set number2=7
copy "C:\Users\leevi\Downloads\Nintendo Switch - Super Smash Bros Ultimate - Stock Icons\Super Smash Bros Ultimate\Stock Icons\chara_2_%fighter%_0%number1%.png" "C:\Users\leevi\Desktop\Ultimate-Stream-Tool - Copy\Stream Tool\Resources\Characters\HQ Stock Icons\"%fighterstring%"\"%fighterstring%"%number2%.png"
set number1=7
set number2=8
copy "C:\Users\leevi\Downloads\Nintendo Switch - Super Smash Bros Ultimate - Stock Icons\Super Smash Bros Ultimate\Stock Icons\chara_2_%fighter%_0%number1%.png" "C:\Users\leevi\Desktop\Ultimate-Stream-Tool - Copy\Stream Tool\Resources\Characters\HQ Stock Icons\"%fighterstring%"\"%fighterstring%"%number2%.png"

:: goto :loop
:end