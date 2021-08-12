![preview](https://i.imgur.com/N4CCAiq.png)
# Ultimate Stream Tool

## Features
- Easy and fast setup using a browser source. Drag and drop!
- Handy [interface](https://i.imgur.com/xB2h476.png) to quickly change everything you need, like player names, characters, scores, round, casters...
- Customizable [Player Presets](https://imgur.com/a/oT8uh5a) to setup your match in no time!
- Now with [2v2](https://imgur.com/a/Ip3Ge3h) support!
- A "[VS Screen](https://imgur.com/OMIo4q3)" to display while in between matches or while the game loads!
- This is **not** a [Stream Control](http://farpnut.net/StreamControl) clone. It doesn't have anything to do with it, everything is custom made.

---

## How to setup
These are instructions for regular OBS Studio, but I imagine you can do the same with other streaming software:
- Get the [latest release](https://github.com/LieutenantL/Ultimate-Stream-Tool).
- Extract somewhere.
- Drag and drop `Ultimate Scoreboard.html` into OBS, or add a new browser source in OBS pointing at the local file.
- If the source looks weird, manually set the source's properties to 1920 width and 1080 height, or set your OBS canvas resolution to 1080p, or make the source fit the screen.
- In the source's properties, change *Use custom frame rate* -> `60` (if streaming at 60fps of course).
- **Also tick `Refresh browser when scene becomes active`**. Trust me, this one is important.
- Manage it all with the `Ultimate Stream Tool` executable.

Repeat from the 3rd step to add the `VS Screen.html`, though I recommend you to do so on another scene.

### Interface shortcuts!
- Press `Enter` to update.
- Press either `F1` or `F2` to increase P1's or P2's score.
- Press `ESC` to clear player info.

Note: The Scoreboard's intro will only play when refreshing the browser. If you tick the intro box while having the scoreboard's scene open, nothing will change until you go out and back to the scoreboard's scene.

---

## Advanced setup
Yes, the instructions above are enough, but we can do better. **All of this is optional** of course.
 
2 basic transitions are included in the `Resources/OBS Transitions` folder, intended to be used to change to the game scene and to the vs screen, if you don't have a transition yourself of course. To use them on OBS:
- Add a new stinger transition.
- Set the video file to `Game In.webm` if creating the game scene transition, and `Swoosh.webm` if creating a vs screen transition.
- Transition point -> `350 ms`.
- I recommend you to set the Audio Fade Style to crossfade, just in case.
- On the scene's right click menu, set it to Transition Override to the transition you just created.
- Also, you may want to set a hotkey to transition to the game scene so you can press enter ingame to start the replay and press the transition key at the same time. The transition is timed to do so.

---

### Closing notes
This project is a heavily modified off of [Readek's](https://twitter.com/Readeku) [RoA Stream Tool](https://github.com/Readek/RoA-Stream-Tool), so many thanks to them :)

2v2 is currently only supported on the non-animated base VS Screen and Scoreboard Overlay.

Regarding Kazuya's character select picture, I am waiting for the last character to be released to replace the image. It still works, just doesn't have a correct image!

If you are having trouble downloading/unzipping the project, I have the Stream tool hosted on [Google Drive](https://drive.google.com/drive/folders/1_6SgIsUcMQdlOSn2ObJpa2k2BJHLk1YI)

If you have any suggestions for me, you can contact me on Twitter [@Lieutenant_L5](https://twitter.com/lieutenant_l5)!

---

[French Translation](https://docs.google.com/document/d/1JURl3Muby7b8WUy0RRLge6-Bn0VXHrOo/edit?usp=sharing&ouid=105808034193998201742&rtpof=true&sd=true) by [Vicnin](https://twitter.com/VicninSSB)

Resources: Scene Assets by [Readek](https://twitter.com/Readeku), [The spriters resource](https://www.spriters-resource.com/nintendo_switch/supersmashbrosultimate/), Character Animations by [Shifter](https://twitter.com/WayShifter)
