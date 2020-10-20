# Tetris

The classical game! Made by pure HTML5, CSS3 and JavaScript.

# Issue History

- Chrome, Firefox and Safari on iPad Pro (13.7) cannot update `innerWidth` & `innerHeight` timely.
   + What happens(what's the impact): Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
   + How to reproduce: 
   + Why it happens: 
   
     | Platform|Version|Browser|Version|Operation|Result|
     |--------|-------------|-------|------|-------------|:-----:|
     | iPad OS |13.7|Chrome| landscape to portrait | ❌ |
     | iPad OS |13.7|Chrome| portrait to landscape | ❌ |
     | iPad OS |13.7|Firfox| landscape to portrait |   ✅ |
     | iPad OS |13.7|Firfox| portrait to landscape  |  ❌ |

   + How I fixed it:
   