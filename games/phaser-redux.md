### Phaser JS + Redux

I've built a few games now with Phaser, and I think I've found a generally good mental groove for writing easily tested TypeScript games. In rough, user inputs trigger redux actions, which updates state, and optionally  triggering UI Updates from the game renderer.

## Goals

Oddly enough, for some of the games I'm making I want to avoid tying _too closely_ to the game engine. There's a non-zero possibility that it will need to render the same game but in more than just a canvas ( e.g. a static svg) and so I want to keep as much logic in 'plain old JS' - this disconnect of 'game' from 'renderer' is not a foreign concept (openGL vs DirectX comes to mind) but this introduces a really important [seam](https://duckduckgo.com/?q=working+effectively+with+legacy+code) for testing.

You can see an example of how I use a text renderer for game state in [[tests/inline-snapshots]].

## Terminology

- **Game Props** - The parts of the game that if you closed the app, and re-opened you would expect to be set up. This ranges from game config (original version of the board, colour scheme, game mode, tiles)

- **Game State** - The parts of the game which change (moves made, words found, tiles removed, user selection states)

- **Renderer** - A way to display the current props + state, y'know, the game bit

- **Redux** - A state management library which constrains the set of places the games state can change into a single place. Renderers can subscribe to know when changes have been made.  

- **[Redux Store](https://redux.js.org/api/store/)** - A five euro name for a 10 cents idea, it's just the name of the db for the JSON and the API for subscriptions

- **[Redux Actions](https://redux.js.org/recipes/reducing-boilerplate#actions)** - It is the renderer's responsibility to tell the game engine that the state should change, this is done by sending redux actions into the games state. An action is basically a message sent to the store.


## Overview

![A flow diagram of the upcoming text](/notes/assets/img/game-loop.png)

### Setup

Let's take a game of [Typeshift](http://playtypeshift.com/) as an example. That link will let you play the game too BTW.

![pic of the game Typeshift](/notes/assets/img/typeshift.png)

We'd need to start by having Props which look something like:

```ts
interface GameProps {
    style: { tile: string, background: string, found: string },
    columns: Array<{ letters: string[] }>
}
```

Then, because we know as you go through the game finding words and selecting letters, we'll need some sort of way to describe the changes from the original baseline:

![pic of the game Typeshift with words found](/notes/assets/img/typeshift-2.png)

```ts
interface GameState {
    // Integer offset from center 
    columnOffsets: number[]
    // E.g. what should be highlighted for keyboard input
    selectedColumn?: number 
    // Tiles which have been found, goal is to get them all found
    foundLetters: Position[]
    // Words found in the process
    foundWords: string[]

    // More on this later
    uiUpdates: UIUpdate[]
}
```

So, to start up the game we'd need a way to grab or generate the props and state. Then this can be put into the [Redux store](https://redux.js.org/api/store). Once the store is ready, then you can create a renderer.


 As we're talking about Phaser, then that means making a [Phaser Scene](https://phaser.io/phaser3/contributing/part5) which subscribes to the Redux store.

```ts
  const props = await host.getProps()
  const state = await host.getState()  
  const store = createGameStore(props, state)

  const scene = new TypeshiftScene("main", { store })
  
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: "100%",
    height: "100%",
    backgroundColor: "#fac24f",
    parent: "game",
    scene: [scene],
  }

  const game = new Phaser.Game(config)
  // @ts-ignore
  window.game = game
```

This is pretty vanilla, all Phaser games would end up with something like this. The only specifics are that it delegates grabbing `props` and `state` to a host object which could be anything (e.g. maybe there's a Daily host which gives the same props every day and uses localstorage for state) 

Next let's look at the `TypeshiftScene`, it's a Phaser Scene subclass which encapsulates creating the UI, and keeps references to all those objects. Here they are encapsulated in `Column` objects. The key to think about is launching the game, setting up input and then subscribing to upcoming state changes.


```ts
import { animationsDone, SpellTowerState, SpellTowerStore } from "../index"
import type { PossibleUIChanges } from "./updates/types"

import { setupKeyboardInput } from "./input/keyboardInput"
import { setupMouseInput } from "./input/mouseInput"

import { Column } from "./objects/Column"

import { moveCursor } from "./updates/moveCursorUpdate"
import { resetSelection, selectionUpdated } from "./updates/selectionUpdate"
import { commitSelectionUpdated } from "./updates/commitSelectionUpdate"

type GameState = {
  store: TypeshiftStore
}

export let TypeshiftScene = class TypeshiftSceneClass extends extends Phaser.Scene {
  state: GameState
  columns: Column[]

  create() {
    // Interactions
    setupKeyboardInput(this)
    setupMouseInput(this)

    // Setup column UI and then "reset" to the current state
    const state = this.state.store.getState()
    this.columns = state.columns.map((c, i) => new Column(this, i))
    this.columns.forEach(c => this.add.existing(c))
    resetSelection(this, state)

    // Start listening for changes 
    this.state.store.subscribe(() => this.stateUpdated())
  }

  stateUpdated() {
    const newState = this.state.store.getState()
    // Do we need to make changes?
    if (!newState.ui.length) return

    // Trigger UIActions, then empty the actions array
    for (const action of newState.ui) {
      updates[action["type"]](this, newState, action)
    }

    this.state.store.dispatch(animationsDone())
  }
}

// A set of UI actions which handles the UI for state changes in Phaser
const updates: Record<PossibleUIChanges, (game: TypeshiftSceneGame, state: GameState, action: any) => Promise<void | unknown>> = {
  move_cursor: moveCursor,
  selection_changed: selectionUpdated,
  commit_selection: commitSelectionUpdated,
}

export type TypeshiftSceneGame = InstanceType<typeof TypeshiftScene>
```

So, from that original diagram, we're now at the "waiting for input phase". The game doesn't do anything at this point unless the user specifically does something. Let's look at `registerKeyboardInput` as that is the simplest input function. It uses the Phaser API for keyboards to listen to browser events and then will convert those into actions in the Redux store.


```ts
import { TypeshiftSceneGame, TypeshiftStore, down, left, right, up } from "../../index"

export const keycodes = {
  left: 37,
  a: 65,
  right: 39,
  d: 68,
  up: 38,
  w: 87,
  down: 40,
  s: 83,
}

export const registerKeyboardInput = (game: TypeshiftSceneGame) => {
  const store = game.state.store
  const kbd = game.input.keyboard
  kbd.addCapture("W,S,A,D,UP,DOWN,LEFT,RIGHT")
  
  kbd.on("keyup", (event: KeyboardEvent) => {
    if (event.keyCode === keycodes.left || event.keyCode === keycodes.a) {
      store.dispatch(left())
    } else if (event.keyCode === keycodes.right || event.keyCode === keycodes.d) {
      store.dispatch(right())
    } else if (event.keyCode === keycodes.down || event.keyCode === keycodes.s) {
      store.dispatch(down())
    } else if (event.keyCode === keycodes.up || event.keyCode === keycodes.w) {
      store.dispatch(up())
    }
  }
}
```

Lets follow what happens when `up` is called

## --- to be continued ---