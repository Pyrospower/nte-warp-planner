import {
  characterDiceBudget,
  arcBoxBudget,
  characterSuccessChance,
  arcSuccessChance,
} from "$lib/warp-engine";

export const awakenings = ["A0", "A1", "A2", "A3", "A4", "A5", "A6"] as const;
export const mixings = ["T1", "T2", "T3", "T4", "T5"] as const;

export type Banner = "character" | "arc";

class PlannerState {
  annulith = $state(0);
  warpPieces = $state(0);
  solidDice = $state(0);
  triKeys = $state(0);

  banner = $state<Banner>("character");
  targetAwakening = $state<(typeof awakenings)[number]>("A0");
  targetMixing = $state<(typeof mixings)[number]>("T1");
  characterPity = $state(0);
  arcPity = $state(0);

  safe = $derived({
    annulith: Math.max(0, this.annulith || 0),
    solidDice: Math.max(0, this.solidDice || 0),
    triKeys: Math.max(0, this.triKeys || 0),
    warpPieces: Math.max(0, this.warpPieces || 0),
  });

  budget = $derived(
    this.banner === "character"
      ? characterDiceBudget(
          this.safe.annulith,
          this.safe.solidDice,
          this.safe.warpPieces,
        )
      : arcBoxBudget(this.safe.annulith, this.safe.triKeys, this.safe.warpPieces),
  );

  result = $derived.by(() => {
    if (this.banner === "character") {
      const pity = Math.min(89, Math.max(0, this.characterPity || 0));
      return characterSuccessChance(
        this.budget,
        pity,
        awakenings.indexOf(this.targetAwakening),
      );
    }
    const pity = Math.min(7, Math.max(0, this.arcPity || 0));
    return arcSuccessChance(this.budget, pity, mixings.indexOf(this.targetMixing) + 1);
  });

  isCharacter = $derived(this.banner === "character");
  goalLabel = $derived(this.isCharacter ? this.targetAwakening : this.targetMixing);
  unit = $derived(this.isCharacter ? "pulls" : "boxes");
  budgetIcon = $derived(
    this.isCharacter ? "/assets/solid_dice.webp" : "/assets/tri-key.webp",
  );
  bannerName = $derived(this.isCharacter ? "Character Banner" : "Arc Banner");
  avgHeader = $derived(this.isCharacter ? "Avg. pulls" : "Avg. boxes");
}

export const planner = new PlannerState();
