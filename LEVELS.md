# Amaze — Level Design (20 Levels)

## Difficulty Levers

| Parameter | Effect |
|-----------|--------|
| **Grid Size** | Maze cell count = `(grid - 1) / 2` per axis. Bigger = longer path, more dead ends |
| **Extra Passages** | % of internal walls removed after generation. Creates loops and multiple paths. More = more confusing routing decisions |
| **Viewport** | Visible cells around the player. Smaller = harder to plan ahead, more memorization needed |

---

## Levels

| Lvl | Grid | Cells | Extra % | Viewport | Seed | Description |
|-----|------|-------|---------|----------|------|-------------|
| 1 | 11×11 | 5×5 | 0% | 7 | 1001 | **Tutorial.** Tiny maze, wide view. Only ~3 dead ends. Learn the no-backtracking mechanic. |
| 2 | 13×13 | 6×6 | 0% | 7 | 2002 | **Warm-up.** Still small, perfect maze (one path). A few more wrong turns possible. |
| 3 | 15×15 | 7×7 | 0% | 7 | 3003 | **First real maze.** Wide viewport still helps. ~5-8 dead ends to memorize. |
| 4 | 17×17 | 8×8 | 5% | 7 | 4004 | **First loops.** A few extra passages create alternative routes. Decisions start mattering. |
| 5 | 19×19 | 9×9 | 5% | 5 | 5005 | **Viewport shrinks.** See less, remember more. Medium maze with some branching. |
| 6 | 21×21 | 10×10 | 8% | 5 | 6006 | **Getting serious.** Enough loops that route-finding requires real memory. |
| 7 | 25×25 | 12×12 | 10% | 5 | 7007 | **Long paths.** Maze is big enough that dead ends are far from junctions — costly mistakes. |
| 8 | 27×27 | 13×13 | 10% | 5 | 8008 | **Complex branching.** More junctions, more wrong turns, same limited view. |
| 9 | 31×31 | 15×15 | 12% | 5 | 9009 | **Memory test.** Large maze with moderate loops. Multiple attempts expected. |
| 10 | 35×35 | 17×17 | 12% | 5 | 10010 | **Milestone.** Significant maze. Loops create traps where you block your own path. |
| 11 | 37×37 | 18×18 | 15% | 5 | 11011 | **Dense loops.** More extra passages mean more ways to accidentally cut yourself off. |
| 12 | 41×41 | 20×20 | 15% | 5 | 12012 | **Marathon.** Long solution path. Even experienced players need several tries. |
| 13 | 43×43 | 21×21 | 18% | 5 | 13013 | **Confusing loops.** Many alternative routes, most of which trap you. |
| 14 | 47×47 | 23×23 | 18% | 5 | 14014 | **Advanced.** Large + loopy. Route planning is essential but hard with limited view. |
| 15 | 49×49 | 24×24 | 20% | 3 | 15015 | **Tiny viewport!** Can only see immediate neighbors. Navigation becomes pure memory. |
| 16 | 51×51 | 25×25 | 20% | 3 | 16016 | **Blind run.** Huge maze, tiny window. Must internalize the layout across many attempts. |
| 17 | 55×55 | 27×27 | 22% | 3 | 17017 | **Brutal.** Every junction is a gamble with 3-cell visibility. |
| 18 | 61×61 | 30×30 | 22% | 3 | 18018 | **Endurance.** Very long path, tons of dead ends, minimal visibility. |
| 19 | 71×71 | 35×35 | 25% | 3 | 19019 | **Extreme.** Massive maze. Even with the layout memorized, execution is hard. |
| 20 | 81×81 | 40×40 | 28% | 3 | 20020 | **Final boss.** ~800 path cells, 3-cell view, 28% loops. A real achievement to complete. |

---

## Difficulty Curve Visualization

```
Difficulty
    ▲
    │                                                    ████ 20
    │                                               ████
    │                                          ████ 18
    │                                     ████
    │                                ████ 16
    │                           ████
    │                      ████ 13
    │                 ████
    │            ████ 10
    │       ████
    │  ████ 5
    │██
    └──────────────────────────────────────────────────► Level
     1  2  3  4  5  6  7  8  9  10 11 12 13 14 15 16 17 18 19 20
```

**Key inflection points:**
- **Level 5** — Viewport shrinks from 7 to 5. First real difficulty jump.
- **Level 10** — Maze size crosses 17×17 cells. Solution path becomes hard to memorize in one attempt.
- **Level 15** — Viewport shrinks from 5 to 3. Navigation becomes pure memory recall.
- **Level 20** — Maximum everything. 40×40 cells, 28% loops, 3-cell view.

## Notes

- **Seed values** determine exact maze layout. Same seed = same maze for all players (fair leaderboard).
- **Extra passages at 0%** = "perfect maze" with exactly one path between any two points. Good for learning.
- **Extra passages at 20%+** = highly looped maze where visiting the wrong cell can block the only route to the exit.
- The **exit is always on the right edge**, **start on the left edge**. Player always moves generally left-to-right.
