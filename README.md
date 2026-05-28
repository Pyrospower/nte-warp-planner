# NTE Warp Planner

A pull-planning calculator for **[Neverness to Everness](https://nte.perfectworld.com/)** (NTE).

Tell it what you own (Annulith, Solid Dice, Tri-Keys, Warp Pieces) and what you're
aiming for, and it returns your **exact probability of reaching that goal** plus the
**average number of pulls** it takes.

Inspired by the [HSR Optimizer Warp Planner](https://github.com/fribbels/hsr-optimizer/#warp),
re-derived from scratch for NTE's gacha rules.

---

## Features

- **Character banner** (Scarborough Fair / Limited Board) — chance to reach any
  Awakening level (A0 → A6).
- **Arc banner** (Arc Research Program / Miracle Box) — chance to reach any Mixing
  Intensity level (T1 → T5).
- Resources entered as raw currency; conversions and **compounding refunds** are
  folded in automatically.
- Pity-aware: start the calculation from your current pity counter.
- Exact probabilities — same result every time, no simulation variance.
- Reactive UI: every number recomputes instantly as you type.

---

## How it works — the gacha rules modelled

All figures below come from NTE's in-game rule pages (Scarborough Fair → Board Details,
Arc Research Program → Miracle Box, Mall → Warp Exchange).

### Currencies

| Currency        | Role                        | Conversion                            |
| --------------- | --------------------------- | ------------------------------------- |
| **Annulith**    | Premium currency (flexible) | 160 Annulith = 1 pull                 |
| **Solid Dice**  | Character-banner pulls      | 1 die = 1 roll                        |
| **Tri-Keys**    | Arc-banner pulls            | 10 Tri-Keys = 1 box (1 Limited Issue) |
| **Warp Pieces** | Recycle currency (flexible) | 24 Warp Pieces = 1 die / Tri-Key      |

### Character banner (Limited Board)

- One roll = one Solid Die. The board-game layer (rolling 1–6, landing on tiles) is
  cosmetic for probability purposes — the game publishes a clean per-roll featured rate.
- **No 50/50.** The featured S-Class character is always guaranteed; there is no
  off-banner loss to model.
- Pity is a flat staircase, **shared across all Limited Boards**:

| Roll # (since last featured) | Featured rate | Board state                            |
| ---------------------------- | ------------- | -------------------------------------- |
| 1 – 70                       | 0.99 %        | Baseline                               |
| 71 – 89                      | 19.59 %       | Modified (after 70 consecutive misses) |
| 90                           | 100 %         | Hard pity                              |

- The blended effective rate is **1.87 %** per roll.
- Board tiles passively refund dice/Warp Pieces (Roll Again, Multiple Surprises, Hero
  Chest) — modelled as a **~5.1 %** compounding refund.

### Arc banner (Miracle Box)

- One **pull = one Limited Issue box = 10 Tri-Keys = 10 Arcs**. Pity is counted in
  **boxes**, shared across all Limited Issues.
- Per-Arc drop rates: S-Class 3 % base (4.19 % w/ pity), of which the featured Arc is
  **1.68 %**; A-Class 7 % (13.47 % w/ pity); B-Class 90 %.
- Pity guarantees: any S-Class within **6 boxes**, the **featured** Arc within **8 boxes**
  (hard pity).
- Unlike the character banner, an S-Class Arc _can_ be off-featured. The planner targets
  the featured Arc only, so off-featured S-Class pulls are ignored (they don't advance
  Mixing Intensity and don't reset the featured pity).
- Arc Warp-Piece bonuses (40 per S-Class, 4 per A-Class) are modelled as a **~9.2 %**
  compounding refund.

### Awakening & Mixing Intensity

| Concept                                          | HSR analogue    | Levels  | Copies needed      |
| ------------------------------------------------ | --------------- | ------- | ------------------ |
| **Awakening** (character dupes, via Mind Shards) | Eidolon         | A0 → A6 | A_n = n + 1 copies |
| **Mixing Intensity** (Arc dupes)                 | Superimposition | T1 → T5 | T_n = n copies     |

So A6 = 7 character copies; T5 = 5 Arc copies.

---

## The math

The engine ([`src/lib/warp-engine.ts`](src/lib/warp-engine.ts)) is pure and
side-effect-free:

1. **Per-pull distribution** — `buildDistribution(rateFn, cap)` produces the PMF
   `dist[i] = P(a single copy lands exactly on pull i+1)` for a fresh pity counter.
2. **Pity adjustment** — `pityAdjustedPmf(dist, pity)` slices off the pulls already spent
   and renormalises (the conditional cost given the current pity).
3. **Multiple copies** — `multiCopyCostPmf` convolves the per-copy PMFs (first copy from
   current pity, every later copy from a fresh pity, since pity resets on a success).
4. **Summarise** — `summarize(costPmf, budget)` returns
   `successChance = P(total cost ≤ budget)` and `average = Σ k·P(cost = k)`.
5. **Budget** — currencies are converted to pulls/boxes and inflated by the compounding
   refund as a geometric series (`raw / (1 − refundRate)`).

---

## Assumptions & limitations

- **`ARC_FEATURED_PER_ARC = 1.68 %`** is taken from the in-game rules and used to derive
  the per-box featured rate (~15.6 %). If real player data shows a different value, this
  is the single constant to retune.
- **Refund rates** (5.1 % character, 9.2 % Arc) are estimates of the average passive
  income from board tiles / Arc Warp-Piece bonuses, compounded geometrically.
- **One banner at a time.** Each calculation uses one currency pool. Annulith and Warp
  Pieces (flexible) are fully assigned to the targeted banner; Solid Dice feed only the
  character banner and Tri-Keys only the Arc banner.
- **Featured Arc only.** Off-featured S-Class Arcs are not counted toward Mixing Intensity.
- Action advances, energy, board minigames (Slumberland, etc.) and non-pull rewards are
  out of scope — this is a _pull_ planner.
