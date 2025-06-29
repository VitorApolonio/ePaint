# ePaint: A drawing app
___
## What is this?

ePaint is a drawing application, similar to MS Paint and other such apps. The feature set is intentionally somewhat
limited, as I'm doing this mostly for learning purposes and to have an application where I can make random doodles if
I'm bored. If you're looking for a more complete program for drawing, with multiple layers and all that fancy jazz, I'd
recommend Photoshop, paint.net, or Gimp.

## What can it do?

As of now, you got the basic tools, which work as you'd expect:

- **The Paintbrush**: Allows you to draw points or paths by clicking with the mouse.
- **The Eraser**: Similar to the paintbrush, but deletes colored pixels in its path.
- **The Paint Bucket**: Allows you to fill closed regions or change the color of paths.
- **The Eyedropper**: Changes the selected color to that of the pixel you click on.

Depending on which mouse button you clicked when using a tool, either the primary or secondary color will be used.

You can also undo/redo "actions," those being any of the following:

- Clearing the canvas
- Drawing a point/line
- Erasing a point/line
- Filling a region/path

Anything else is not considered an action and hence cannot be undone.

More features may be added in future versions. Or not, depending on how quickly I get bored.

## How does it work?

The brush works by simply tracking the position of the mouse and connecting each one with a line of the selected color.
In the future I may opt for a custom way of drawing lines, as the currently used `lineTo()` method has a default
antialiasing that causes trouble with the paint bucket and can't be disabled.

The eraser is quite simple, it's just a brush with the color `#000000ff` (pitch-black plus alpha 255) and a different
setting for how colors are mixed that makes existing pixels get set to that same color.

The eyedropper is also rather simple; when you click a pixel, it looks at whatever color it is then sets the primary or
secondary color to be that, depending on the mouse button pressed.

And then there is the paint bucket...

### The Paint Bucket

The basis for how this tool works is something called a flood-fill algorithm, which works by running some checks on the
current pixel, and if it passes them, running the same checks on the neighboring pixels.

There are two main ways to implement this in code, a DFS (Depth-First Search) approach using a stack and a BFS (Breadth-First Search)
one using a queue. I opted for the latter as I found it simpler.

![queue-based implementation](https://upload.wikimedia.org/wikipedia/commons/b/b6/Wfm_floodfill_animation_queue.gif)

A queue is a data structure where the first items to be added are also the first to be removed (hence the name). In a
queue-based approach, pixels are added to one where they wait to be checked. If they pass the checks, they get painted
and their surrounding pixels (excluding diagonals) are added to the queue. This continues until the queue is emptied.

Outlining the algorithm:

1. Add initial pixel to queue
2. Remove next from queue then perform checks
3. If passed:
- Add neighboring pixels to queue
- Color pixel
4. If queue not empty:
- Go to 2

The checks we need to perform are whether the pixel is inside the canvas (as we don't want to try and edit invalid pixel data),
and whether it is the same color as the starting pixel (as a different color marks the border of a region).

Sounds simple enough, right? However, if you try and make an implementation of it, you'll likely come across one issue:
the process is very, very slow. As in, it takes several seconds to paint a relatively small region.

If you use built-in methods for popping a queue, such as `shift()` in JavaScript, all pixels will be repositioned whenever
one is processed, which is quite expensive computationally; even painting a 300x300 region already requires running
the checks tens of thousands of times, so it's important that they are done as efficiently as possible.

Several changes can be made to improve the run time of the algorithm, some of them being:

- Keeping track of visited pixels with an array
- Only applying the changes to the canvas once the algorithm finishes
- Using separate arrays for pixel x- and y-coordinates instead of one array with objects
- Avoiding using `shift()` for popping the queue
- Avoiding methods like `map()` and `forEach()`

To see this project's implementation, which includes these optimizations, look at the `floodFill()` method in the `brush.js` file.

### Undo / Redo

You can only undo/redo things that change the state of the canvas in some way, which I decided to call "actions."

Whenever you draw some path with the brush or eraser, the positions of your mouse pointer are recorded until you release the
button, at which point they are saved, along with the current color and size, as a new action.

A stack is kept with all actions and an index. When you undo an action, that index goes down by one, and everything up to
the new index is redrawn with the appropriate brush settings. Redo works similarly, but it increases the index instead.

When you perform an action after one or more undos, the more recent actions are lost and get replaced by the new action.

Clearing the canvas and the bucket are special cases. I decided to represent the action of clearing the canvas with an empty
action (no positions), as it made sense intuitively. For the bucket, as it would be quite slow redoing several fill
actions, I opted to simply save images of the canvas and redraw them, which has the same overall effect but is much faster.

## What's with the icon?

This app is a remake of an older project that didn't go very far called "JPaint" (you'll
never guess the language). As I'm still just as creative with names, I decided to call this one "ePaint," with the "e"
standing for Electron and being lowercase because it looks cool.

One thing I find kinda fun to do is draw mathematical equations and stuff, kinda like you see on channels
like The Organic Chemistry Tutor, so from the get-go the app was designed with this use in mind.

I wanted the icon to be something drawn onto a rainbow gradient, and while looking for stuff I could
use I came across the exponential function and just knew it was meant to be.
___
## To-do list

- fix issues with file naming on release, improve windows installer
- restructure the project to use React (would simplify making a new color picker)
- use custom method for drawing lines to get rid of antialiasing
- instead of quietly setting res to 100x100, inform user of this minimum when making a new canvas
- maybe allow resizing current drawing instead of having to make a new one
- Ctrl+Scroll or Ctrl+-\+ to zoom
- remove all debug messages (when finished)
- maybe replace the default HTML color picker
- fix painting dot when leaving color picker
- global menu items
- disable html shortcuts (reload, inspect, etc.)
- limit number of kept actions
- add app info menu entry (credits etc.)
- add shortcut to clear canvas
- add shortcuts for swapping between tools
- add shortcuts for remaining tools (maybe)
- show brush size on cursor
- use a linter to add semicolons to codebase
- refactor action into several classes (e.g., FillAction, ClearAction, PaintAction, etc.)
- create unit tests
