# Jest Inline Snapshots

Jest came out with [Snapshot testing](https://jestjs.io/docs/en/snapshot-testing) a few years back, then a little bit later this was extended to include inline snapshots. I use inline snapshots a lot because I think they get all the advantages of snapshot testing but by having the results inline, you are forced to reckon with the things you test.

### Using inline snapshots in style

For a game I'm working on, I use Redux as a state management library [[games/phaser-redux]] and have an extensive Jest test suite around this code because it's all so self-contained. Games are particularly stateful apps, and relying on tests to handle all your logic usually saves a bunch of time because you don't have to get the game back into the same state as before. 

Here's an example of the state which is controlled by redux:

```ts
export interface GameState {
  game: "mygame"
  columns: Column[]
  cursor?: Position
  dragging?: {
    surroundingPositions?: Position[]
    rowsToRemove?: number[]
    characters: LetterLoc[]
    isWord?: true
    multiplier?: number
  }
  foundWords: string[]
  ui: UIChanges[]
}
```

This game's state powers a Phaser game engine in production, and has a prototype SVG renderer, but in tests, it also has a text representation. One state, three renderers. 

### Text rendering

The text rendering is considerably more information dense than the JSON object it represents, and so that is used for snapshots via a custom Jest [snapshot serializer](https://jestjs.io/docs/en/configuration#snapshotserializers-arraystring): here's the module which sets that up: 

```ts
expect.addSnapshotSerializer({
    // This is why there is the weird 'game' property on the interface
    // to verify that this object can be serialized using the text renderer
  test: val => "game" in val && val["game"] === "mygame",
  print: val => textRender(val as any),
})

import type { Direction as Direction, GameState, Position } from "../../"
import { letterAtPosition, positionSame } from "../positioning"

export const textRender = (state: GameState) => {
  const longestColumnLength = state.columns.reduce((prev, cur) => (prev > cur.letters.length ? prev : cur.letters.length), -Infinity)
  let render = "-  ".repeat(state.columns.length) + "\n"
  let dragStart: Position | undefined = undefined
  let dragEnd: Position | undefined = undefined

  if (state.dragging) {
    const chars = state.dragging.characters
    dragStart = { index: chars[0].index, col: chars[0].col }
    dragEnd = { index: chars[chars.length - 1].index, col: chars[chars.length - 1].col }
  }

  for (let i = longestColumnLength - 1; i > -1; i--) {
    for (let colI = 0; colI < state.columns.length; colI++) {
      const element = state.columns[colI].letters[i]

      render += element?.letter || " "
      const pos: Position = { col: colI, index: i }

      if (positionSame(state.cursor, pos)) {
        render += "x"
      } else if (positionSame(dragStart, pos)) {
        render += "#"
      } else if (positionSame(dragEnd, pos)) {
        render += "*"
      } else if (state.dragging?.characters.find(c => positionSame(c, pos))) {
        const char = state.dragging!.characters.find(c => positionSame(c, pos))!
        const index = state.dragging!.characters.indexOf(char)
        const next = state.dragging!.characters[index + 1]
        render += charForDraglineDir(next.dirToHere!)
      } else {
        render += " "
      }
      // Spacing
      render += " "
    }
    render += "\n"
  }

  if (state.dragging) {
    render += "\nSelection: " + state.dragging.characters.map(c => letterAtPosition(state, c).letter).join(" ")
    if (state.dragging.isWord) {
      render += "\nIs word: " + state.dragging.isWord
    }
  }

  return render.trim()
}
```

So, what does this look like in practice? Here's a test for the pressing the arrow buttons from the keyboard:  

```ts
import { colsFromStrings, createGameState } from "../util/tests/createTestGame"
import { createGameStore, down, downLeft, downRight, left, right, up, upLeft, upRight } from ".."
import { positionExists } from "../util/positioning"

it("handles selection", () => {
  const state = createGameState(colsFromStrings(["ABC", "DEF", "GHI"]))
  const store = createGameStore(state)

  store.dispatch(up())
  expect(store.getState()).toMatchInlineSnapshot(`
    -  -  -  
    C  F  I  
    B  E  H  
    Ax D  G
  `)

  store.dispatch(up())
  expect(store.getState()).toMatchInlineSnapshot(`
    -  -  -  
    C  F  I  
    Bx E  H  
    A  D  G
  `)

  store.dispatch(up())
  expect(store.getState()).toMatchInlineSnapshot(`
    -  -  -  
    Cx F  I  
    B  E  H  
    A  D  G
  `)

  store.dispatch(up())
  expect(store.getState()).toMatchInlineSnapshot(`
    -  -  -  
    C  F  I  
    B  E  H  
    Ax D  G
  `)

  store.dispatch(left())
  expect(store.getState()).toMatchInlineSnapshot(`
    -  -  -  
    C  F  I  
    B  E  H  
    A  D  Gx
  `)

  store.dispatch(upLeft())
  expect(store.getState()).toMatchInlineSnapshot(`
    -  -  -  
    C  F  I  
    B  Ex H  
    A  D  G
  `)

  store.dispatch(right())
  expect(store.getState()).toMatchInlineSnapshot(`
    -  -  -  
    C  F  I  
    B  E  Hx 
    A  D  G
  `)
})

it("wraps correctly", () => {
  const state = createGameState(colsFromStrings(["ABCEFG", "DEF", "GHIJ"]))
  const store = createGameStore(state)

  store.dispatch(left())
  expect(store.getState()).toMatchInlineSnapshot(`
    -  -  -  
    G        
    F        
    E     J  
    C  F  I  
    B  E  H  
    A  D  Gx
  `)

  store.dispatch(left())
  expect(store.getState()).toMatchInlineSnapshot(`
    -  -  -  
    G        
    F        
    E     J  
    C  F  I  
    B  E  H  
    A  Dx G
  `)

  store.dispatch(left())
  expect(store.getState()).toMatchInlineSnapshot(`
    -  -  -  
    G        
    F        
    E     J  
    C  F  I  
    B  E  H  
    Ax D  G
  `)

  store.dispatch(left())
  expect(store.getState()).toMatchInlineSnapshot(`
    -  -  -  
    G        
    F        
    E     J  
    C  F  I  
    B  E  H  
    A  D  Gx
  `)

  store.dispatch(down())
  expect(store.getState()).toMatchInlineSnapshot(`
    -  -  -  
    G        
    F        
    E     Jx 
    C  F  I  
    B  E  H  
    A  D  G
  `)

  store.dispatch(left())
  expect(store.getState()).toMatchInlineSnapshot(`
    -  -  -  
    G        
    F        
    E     J  
    C  Fx I  
    B  E  H  
    A  D  G
  `)

  store.dispatch(left())
  expect(store.getState()).toMatchInlineSnapshot(`
    -  -  -  
    G        
    F        
    E     J  
    Cx F  I  
    B  E  H  
    A  D  G
  `)
})
```

Don't think of these tests as a comprehensive test suite, but think of them as a communication pattern between me (as author) and you (or future me) as what should generally happen ([[js/testing-js]]). If this was a formal test suite, there would be `it("wraps left")`, `it("wraps right")` etc etc, but instead you see the actions which trigger the change in behavior and it tells an overall story. These are closer to integration tests than unit tests. 

Here's an example unit test which very specifically tests one behaviour:

```ts
describe(commitSelection.name, () => {
  it("when handles hard letters by removing the whole line", () => {
    const state = createGameState(colsFromStrings(["STAY", "SIZE", "STAY"]))
    const store = createGameStore(state)
    
    select(store, [
        [1, 0],
        [1, 1],
        [1, 2],
        [1, 3],
    ])
    
    expect(store.getState()).toMatchInlineSnapshot(`
        -  -  -  
        Y  E* Y  
        A  Z| A  
        T  I| T  
        S  S# S  
    
        Selection: S I Z E
        Is word: true
    `)
    
    // Drops the full center row, but also the "A" from the two
    // outer columns
    store.dispatch(commitSelection())
    expect(store.getState()).toMatchInlineSnapshot(`
        -  -  -  
        Y     Y  
        T     T  
        S     S
    `)
  })
})
```

The inline snapshots are used to help give you a much better idea of the before/after from the test. 