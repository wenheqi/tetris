# Tetris

The classic arcade game is back, on desktop and mobile devices! Try if you can achieve 999,999 points with less than 207 completed lines🤪 (p.s.: that's the world record❗❗❗)

# Things Worth to Note

- Do not 100% trust developer tools in browsers. Sometimes the behaviors are different. Try a real device if it's possible.

- Strokes are aligned to the center of a path; in other words, half of the stroke is drawn on the inner side, and half on the outer side.

- There is no way to stop a `forEach` loop other than by trowing an exception.

# Known Issue(s)

- Level 14 and 15 has the same dropping rate as Level 13
   + A discussion at [StackExchange](https://gamedev.stackexchange.com/questions/159835/understanding-tetris-speed-curve)
      The proposed solution should be able to simulate the drop rate, but the user moves may not be possible, which is also mentioned in the accepted answer. So currently I'm carrying on with this issue.

- Modal cannot be closed in Firefox and Safari on iPad OS

- Settings modal window is still translucent.

- Only Safari can go full screen on iPad; All browsers on Android can go full screen. But there is a question mark icon near the checkbox and, after fullscreen, if I swip the screen from top to down, then the fullscreen check status becomes unsync with the real status.

# Issue History

- Chrome, Firefox and Safari on iPad Pro (13.7) don't fire `resize` event every time `innerWidth` or `innerHeight` changes.
   + **What's the Impact**

      When user switch the orientation of their mobile device, the game will not resize to give the user best play experience, as the canvas size is not as big as it should be.

      From the folloing testing results we can see all the Chrome, Firefox and Safari users on iPadOS are impacted.

      | Platform | Version | Browser | Version      | Operation             | Result |
      |----------|---------|---------|--------------|-----------------------|:------:|
      | iPad OS  | 13.7    | Chrome  | 86.0.4240.93 | landscape to portrait | ❌     |
      | iPad OS  | 13.7    | Chrome  | 86.0.4240.93 | portrait to landscape | ❌     |
      | iPad OS  | 13.7    | Firfox  | 29.0 (2860)  | landscape to portrait | ✅     |
      | iPad OS  | 13.7    | Firfox  | 29.0 (2860)  | portrait to landscape | ❌     |
      | iPad OS  | 13.7    | MS Edge | 45.9.5       | landscape to portrait | ✅     |
      | iPad OS  | 13.7    | MS Edge | 45.9.5       | portrait to landscape | ✅     |
      | iPad OS  | 13.7    | Safari  | 13.1.2       | landscape to portrait | ❌     |
      | iPad OS  | 13.7    | Safari  | 13.1.2       | portrait to landscape | ✅     |
      | Android  | 10      | Chrome  | 86.0.4240.99 | landscape to portrait | ✅     |
      | Android  | 10      | Chrome  | 86.0.4240.99 | portrait to landscape | ✅     |
      | Android  | 10      | Firfox  | 81.1.4       | landscape to portrait | ✅     |
      | Android  | 10      | Firfox  | 81.1.4       | portrait to landscape | ✅     |
      | Android  | 10      | MS Edge | 45.09.4.5079 | landscape to portrait | ✅     |
      | Android  | 10      | MS Edge | 45.09.4.5079 | portrait to landscape | ✅     |

   + **How to Reproduce**

      1. Use a mobile device (I only have iPad Pro and an Android phone at my hand), open a browser and go to the [helper](https://webtool.netlify.app/) I created (basically it reads the `Window.innerWidth` and `Window.innerHeight` whenever `resize` event is fired). 
      2. Rotate the device from landscape to portrait or the other way around.
      3. Read the `Window.innerWidth` and `Window.innerHeight`.
      4. Wait at least 500ms, manually update the read and check if they remain the same values.
      5. repeat above steps with different browsers.

   + **Why It Happens**

      From the test results it shows that some browsers only fire the `resize` event during the rotating, i.e. when the `innerHeight` and `innerWidth` are not finalized.

   + **How I Fixed It**
   
      I created a short delay on the resize event listener, so it can read the final, correct properties. In practice, I find `500ms` a good delay for Chrome. For Firefox, it can be a little shorter, e.g. `400ms`.
