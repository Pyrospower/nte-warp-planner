export interface PullResult {
  /** P(reaching the goal within the available budget). */
  successChance: number;
  /** Expected number of pulls needed to reach the goal. */
  average: number;
}

/** 160 Annulith buys 1 Solid Die / 1 Fabricated Die / 1 Tri-Key. */
const ANNULITH_PER_PULL = 160;
/** Opening one Limited Issue (an Arc "box") consumes 10 Tri-Keys. */
const TRI_KEYS_PER_BOX = 10;
/** Warp Pieces convert back to dice or Tri-Keys in the Warp Exchange. */
const WARP_PIECES_PER_PULL = 24;

const CHARACTER_PITY_CAP = 90;
const ARC_PITY_CAP = 8; // (1 box = 1 Limited Issue = 10 Arcs)

/**
 * Compounding refund rates (free pulls earned back per pull, as a fraction).
 * Folded in as a geometric series since refunds themselves earn refunds.
 *
 * Limited Board (~5.1%): Roll Again tile (1.57% -> +1 die) + Multiple Surprises
 *   tile (0.38% -> +5 dice) + Hero Chest guaranteed 2 Warp Pieces (20.07%/roll).
 * Arc banner (~9.2%): Warp Pieces from S-Class Arcs (40 each) and A-Class Arcs
 *   (4 each), at the with-pity drop rates, over the 10 Arcs in a box.
 */
const CHARACTER_REFUND_RATE = 0.051;
const ARC_REFUND_RATE = 0.092;

/**
 * Per-Arc chance of the featured S-Class Arc. Treated as a base-ish rate that
 * the box-level hard pity sits on top of.
 */
const ARC_FEATURED_PER_ARC = 0.0168;
/** Per-box chance of the featured Arc — at least one featured among 10 Arcs. */
const ARC_FEATURED_PER_BOX =
  1 - Math.pow(1 - ARC_FEATURED_PER_ARC, TRI_KEYS_PER_BOX);

/**
 * Per-roll chance of the featured S-Class Character.
 * @param n 0-indexed roll within the current pity cycle (0 = first roll).
 *
 * Baseline Board: 0.99% for the first 70 rolls. After 70 consecutive misses the
 * board upgrades to Modified (19.59%). The 90th roll is a guaranteed grant.
 */
function chanceCharacter(n: number): number {
  if (n < 70) return 0.0099; // rolls 1-70, Baseline Board
  if (n < 89) return 0.1959; // rolls 71-89, Modified Board
  return 1.0; // roll 90, hard pity
}

/**
 * Per-box chance of the featured S-Class Arc.
 * @param n 0-indexed box within the current pity cycle.
 *
 * Flat per-box rate for boxes 1-7; the 8th box guarantees the featured Arc.
 * The separate "any S-Class within 6 boxes" guarantee is intentionally ignored:
 * an off-featured S-Class Arc does not advance Mixing Intensity and does not
 * reset the featured pity, so it never affects the featured-target calculation.
 */
function chanceArcFeatured(n: number): number {
  if (n < 7) return ARC_FEATURED_PER_BOX; // boxes 1-7
  return 1.0; // box 8, hard pity
}

/**
 * PMF of which pull a single copy lands on.
 * dist[i] = P(copy obtained exactly on pull i+1), for a fresh pity counter.
 */
function buildDistribution(
  rateFn: (n: number) => number,
  cap: number,
): number[] {
  const dist: number[] = [];
  let survive = 1; // P(no success in the rolls so far)
  for (let i = 0; i < cap; i++) {
    const r = rateFn(i);
    dist[i] = survive * r;
    survive *= 1 - r;
  }
  return dist;
}

/** P(featured S-Class Character lands on roll i+1), 0-indexed, fresh pity. */
const characterDistribution = buildDistribution(
  chanceCharacter,
  CHARACTER_PITY_CAP,
);
/** P(featured S-Class Arc lands on box i+1), 0-indexed, fresh box-pity. */
const arcDistribution = buildDistribution(chanceArcFeatured, ARC_PITY_CAP);

/**
 * Conditional cost PMF given `pity` pulls already spent without a success.
 * Returns a 1-indexed array: result[k] = P(this copy costs exactly k pulls).
 */
function pityAdjustedPmf(distribution: number[], pity: number): number[] {
  const slice = distribution.slice(pity);
  const total = slice.reduce((s, p) => s + p, 0);
  return [0, ...slice.map((p) => p / total)];
}

/** Discrete convolution: (a ⊗ b)[k] = Σᵢ a[i]·b[k-i]. */
function convolve(a: number[], b: number[]): number[] {
  const r = new Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++)
    for (let j = 0; j < b.length; j++) r[i + j] += a[i] * b[j];
  return r;
}

/**
 * Cost PMF for obtaining `copies` copies in a row. The first copy starts from
 * the current pity; every later copy starts fresh (pity resets on a success).
 */
function multiCopyCostPmf(
  dist: number[],
  pity: number,
  copies: number,
): number[] {
  if (copies <= 0) return [1]; // nothing to pull for: cost 0 with certainty
  let cumulative = pityAdjustedPmf(dist, pity);
  const fresh = pityAdjustedPmf(dist, 0);
  for (let c = 1; c < copies; c++) cumulative = convolve(cumulative, fresh);
  return cumulative;
}

/** Reduce a cost PMF + a budget into the planner's two headline numbers. */
function summarize(costPmf: number[], budget: number): PullResult {
  let success = 0;
  for (let k = 0; k <= budget && k < costPmf.length; k++) success += costPmf[k];
  const average = costPmf.reduce((s, p, k) => s + k * p, 0);
  return { successChance: success, average };
}

/** Effective dice/pulls after geometric compounding of refunds. */
function applyRefund(raw: number, rate: number): number {
  return raw / (1 - rate);
}

/**
 * Character banner (Scarborough Fair / Limited Board).
 *
 * @param dice             Solid Dice the player can spend (1 die = 1 roll).
 * @param pity             Rolls already spent on the current pity cycle (0-89).
 * @param targetAwakening  Goal as an Awakening level: 0 = A0 (own the
 *                         character), 1 = A1, ... 6 = A6 (max). A_n needs n+1
 *                         copies of the character.
 */
export function characterSuccessChance(
  dice: number,
  pity: number,
  targetAwakening: number,
): PullResult {
  return summarize(
    multiCopyCostPmf(characterDistribution, pity, targetAwakening + 1),
    dice,
  );
}

/**
 * Arc banner (Arc Research Program / Miracle Box).
 *
 * No `featuredGuaranteed` flag: unlike the HSR light cone banner, NTE's Arc
 * banner has no carried-over 50/50 state — the only featured guarantee is the
 * 8-box hard pity, fully captured by `boxPity`.
 *
 * @param boxes            Limited Issue boxes the player can open (1 box = 10
 *                         Tri-Keys = 10 Arcs).
 * @param boxPity          Boxes already opened on the current pity cycle (0-7).
 * @param targetIntensity  Goal as a Mixing Intensity level: 1 = T1 (own the
 *                         Arc), ... 5 = T5 (max). T_n needs n copies of the Arc.
 */
export function arcSuccessChance(
  boxes: number,
  boxPity: number,
  targetIntensity: number,
): PullResult {
  return summarize(
    multiCopyCostPmf(arcDistribution, boxPity, targetIntensity),
    boxes,
  );
}

/**
 * Convert raw resources into spendable rolls on the character banner.
 * Warp Pieces are converted at 24:1, then the board's free-dice/Warp-Piece
 * refunds are compounded in.
 */
export function characterDiceBudget(
  annulith: number,
  dice: number,
  warpPieces: number,
): number {
  const raw =
    dice +
    Math.floor(annulith / ANNULITH_PER_PULL) +
    Math.floor(warpPieces / WARP_PIECES_PER_PULL);
  return Math.floor(applyRefund(raw, CHARACTER_REFUND_RATE));
}

/**
 * Convert raw resources into spendable boxes on the Arc banner.
 * 1 box = 10 Tri-Keys; Arc Warp Piece refunds are compounded in.
 */
export function arcBoxBudget(
  annulith: number,
  triKeys: number,
  warpPieces: number,
): number {
  const raw =
    triKeys +
    Math.floor(annulith / ANNULITH_PER_PULL) +
    Math.floor(warpPieces / WARP_PIECES_PER_PULL);
  return Math.floor(applyRefund(raw, ARC_REFUND_RATE) / TRI_KEYS_PER_BOX);
}
