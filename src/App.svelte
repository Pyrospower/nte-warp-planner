<script lang="ts">
  import { Root as Card } from "$lib/components/ui/card/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import * as Tabs from "$lib/components/ui/tabs/index.js";
  import * as Select from "$lib/components/ui/select/index.js";
  import {
    characterDiceBudget,
    arcBoxBudget,
    characterSuccessChance,
    arcSuccessChance,
  } from "$lib/warp-engine";
  import { ModeWatcher } from "mode-watcher";

  const awakenings = ["A0", "A1", "A2", "A3", "A4", "A5", "A6"] as const;
  const mixings = ["T1", "T2", "T3", "T4", "T5"] as const;

  let annulith = $state(0);
  let warpPieces = $state(0);
  let solidDice = $state(0);
  let triKeys = $state(0);

  let banner = $state<"character" | "arc">("character");
  let targetAwakening = $state<(typeof awakenings)[number]>("A0");
  let targetMixing = $state<(typeof mixings)[number]>("T1");
  let characterPity = $state(0);
  let arcPity = $state(0);

  const safe = $derived({
    annulith: Math.max(0, annulith || 0),
    solidDice: Math.max(0, solidDice || 0),
    triKeys: Math.max(0, triKeys || 0),
    warpPieces: Math.max(0, warpPieces || 0),
  });

  const budget = $derived(
    banner === "character"
      ? characterDiceBudget(safe.annulith, safe.solidDice, safe.warpPieces)
      : arcBoxBudget(safe.annulith, safe.triKeys, safe.warpPieces),
  );

  const result = $derived.by(() => {
    if (banner === "character") {
      const pity = Math.min(89, Math.max(0, characterPity || 0));
      return characterSuccessChance(
        budget,
        pity,
        awakenings.indexOf(targetAwakening),
      );
    }
    const pity = Math.min(7, Math.max(0, arcPity || 0));
    return arcSuccessChance(budget, pity, mixings.indexOf(targetMixing) + 1);
  });

  const isCharacter = $derived(banner === "character");
  const goalLabel = $derived(isCharacter ? targetAwakening : targetMixing);
  const unit = $derived(isCharacter ? "pulls" : "boxes");
  const budgetIcon = $derived(
    isCharacter ? "/assets/solid_dice.webp" : "/assets/tri-key.webp",
  );
  const bannerName = $derived(isCharacter ? "Character Banner" : "Arc Banner");
  const avgHeader = $derived(isCharacter ? "Avg. pulls" : "Avg. boxes");
  const avgValue = $derived(
    isCharacter ? result.average.toFixed(1) : result.average.toFixed(2),
  );

  const pct = $derived(result.successChance * 100);
  const pctText = $derived(
    pct >= 99.95 ? "100.0%" : pct < 0.05 ? "0.0%" : pct.toFixed(1) + "%",
  );

  function successColor(chance: number): string {
    if (chance >= 0.9) return "bg-emerald-500";
    if (chance >= 0.7) return "bg-green-500";
    if (chance >= 0.5) return "bg-yellow-500";
    if (chance >= 0.3) return "bg-orange-500";
    if (chance >= 0.1) return "bg-orange-600";
    return "bg-red-500";
  }
  const barWidth = $derived(`${Math.max(result.successChance * 100, 2)}%`);
</script>

<ModeWatcher />
<main class="bg-background text-primary min-h-screen py-8 space-y-4">
  <section class="w-full max-w-5xl mx-auto px-4">
    <h1 class="text-2xl sm:text-3xl font-bold text-center">Warp Planner</h1>
  </section>

  <section class="w-full max-w-5xl mx-auto px-4">
    <Card class="p-0 bg-card border-border">
      <div
        class="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border"
      >
        <div class="p-6 space-y-4">
          <h2 class="text-base font-semibold text-center">Settings</h2>

          <div class="grid grid-cols-2 gap-x-4 gap-y-3">
            <div class="space-y-1">
              <Label
                for="annulith"
                class="text-muted-foreground text-xs font-medium"
              >
                Annulith
              </Label>
              <div class="flex items-center gap-2">
                <img
                  src="/assets/annulith.webp"
                  alt="Annulith"
                  class="w-5 h-5 shrink-0"
                />
                <Input
                  id="annulith"
                  type="number"
                  min={0}
                  placeholder="0"
                  bind:value={annulith}
                  class="bg-input border-border h-8 text-sm"
                />
              </div>
            </div>

            <div class="space-y-1">
              <Label
                for="warp_piece"
                class="text-muted-foreground text-xs font-medium"
              >
                Warp Pieces
              </Label>
              <div class="flex items-center gap-2">
                <img
                  src="/assets/warp_piece.webp"
                  alt="Warp Piece"
                  class="w-5 h-5 shrink-0"
                />
                <Input
                  id="warp_piece"
                  type="number"
                  min={0}
                  placeholder="0"
                  bind:value={warpPieces}
                  class="bg-input border-border h-8 text-sm"
                />
              </div>
            </div>

            <div class="space-y-1">
              <Label
                for="dice"
                class="text-muted-foreground text-xs font-medium"
              >
                Solid Dice
              </Label>
              <div class="flex items-center gap-2">
                <img
                  src="/assets/solid_dice.webp"
                  alt="Solid Dice"
                  class="w-5 h-5 shrink-0"
                />
                <Input
                  id="dice"
                  type="number"
                  min={0}
                  placeholder="0"
                  bind:value={solidDice}
                  class="bg-input border-border h-8 text-sm"
                />
              </div>
            </div>

            <div class="space-y-1">
              <Label
                for="tri-key"
                class="text-muted-foreground text-xs font-medium"
              >
                Tri-Keys
              </Label>
              <div class="flex items-center gap-2">
                <img
                  src="/assets/tri-key.webp"
                  alt="Tri-Key"
                  class="w-5 h-5 shrink-0"
                />
                <Input
                  id="tri-key"
                  type="number"
                  min={0}
                  placeholder="0"
                  bind:value={triKeys}
                  class="bg-input border-border h-8 text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="p-6 space-y-4">
          <h2 class="text-base font-semibold text-center">Target</h2>

          <div class="space-y-3">
            <div class="space-y-1">
              <Label class="text-muted-foreground text-xs font-medium">
                Banner
              </Label>
              <Tabs.Root bind:value={banner} class="w-full">
                <Tabs.List class="grid grid-cols-2 w-full">
                  <Tabs.Trigger value="character">Character</Tabs.Trigger>
                  <Tabs.Trigger value="arc">Arc</Tabs.Trigger>
                </Tabs.List>
              </Tabs.Root>
            </div>

            {#if banner === "character"}
              <div class="space-y-1">
                <Label
                  for="target-awakening"
                  class="text-muted-foreground text-xs font-medium"
                >
                  Target awakening
                </Label>
                <Select.Root type="single" bind:value={targetAwakening}>
                  <Select.Trigger
                    id="target-awakening"
                    class="w-full bg-input border-border h-8 text-sm"
                  >
                    {targetAwakening}
                  </Select.Trigger>
                  <Select.Content>
                    {#each awakenings as a (a)}
                      <Select.Item value={a}>{a}</Select.Item>
                    {/each}
                  </Select.Content>
                </Select.Root>
              </div>

              <div class="space-y-1">
                <Label
                  for="character-pity"
                  class="text-muted-foreground text-xs font-medium"
                >
                  Pity counter
                </Label>
                <Input
                  id="character-pity"
                  type="number"
                  min={0}
                  max={89}
                  placeholder="0"
                  bind:value={characterPity}
                  class="bg-input border-border h-8 text-sm"
                />
              </div>
            {:else}
              <div class="space-y-1">
                <Label
                  for="target-mixing"
                  class="text-muted-foreground text-xs font-medium"
                >
                  Target mixing intensity
                </Label>
                <Select.Root type="single" bind:value={targetMixing}>
                  <Select.Trigger
                    id="target-mixing"
                    class="w-full bg-input border-border h-8 text-sm"
                  >
                    {targetMixing}
                  </Select.Trigger>
                  <Select.Content>
                    {#each mixings as t (t)}
                      <Select.Item value={t}>{t}</Select.Item>
                    {/each}
                  </Select.Content>
                </Select.Root>
              </div>

              <div class="space-y-1">
                <Label
                  for="arc-pity"
                  class="text-muted-foreground text-xs font-medium"
                >
                  Pity counter
                </Label>
                <Input
                  id="arc-pity"
                  type="number"
                  min={0}
                  max={7}
                  placeholder="0"
                  bind:value={arcPity}
                  class="bg-input border-border h-8 text-sm"
                />
              </div>
            {/if}
          </div>
        </div>
      </div>
    </Card>

    <div
      class="mt-4 flex flex-wrap items-center justify-center gap-1 text-sm text-muted-foreground"
    >
      <span class="font-semibold text-foreground">{safe.annulith}</span>
      <img src="/assets/annulith.webp" alt="Annulith" class="w-5 h-5" />
      <span>+</span>
      {#if isCharacter}
        <span class="font-semibold text-foreground">{safe.solidDice}</span>
        <img src="/assets/solid_dice.webp" alt="Solid Dice" class="w-5 h-5" />
      {:else}
        <span class="font-semibold text-foreground">{safe.triKeys}</span>
        <img src="/assets/tri-key.webp" alt="Tri-Key" class="w-5 h-5" />
      {/if}
      <span>+</span>
      <span class="font-semibold text-foreground">{safe.warpPieces}</span>
      <img src="/assets/warp_piece.webp" alt="Warp Piece" class="w-5 h-5" />
      <span>=</span>
      <span class="font-semibold text-primary">{budget}</span>
      <span>{unit}</span>
    </div>

    <Card class="mt-4 p-0 bg-card border-border overflow-hidden">
      <div class="p-3 bg-secondary/50 border-b border-border">
        <div class="flex items-center justify-between text-sm">
          <span class="font-medium text-foreground flex items-center gap-2">
            <img src={budgetIcon} alt="" class="w-5 h-5" />
            {bannerName}
          </span>
          <span class="text-muted-foreground">{budget} {unit}</span>
        </div>
      </div>

      <div
        class="grid grid-cols-[60px_1fr_80px] gap-2 px-3 py-2 bg-secondary/30 text-xs font-medium text-muted-foreground"
      >
        <div class="text-center">Goal</div>
        <div class="text-center">Success chance</div>
        <div class="text-center">{avgHeader}</div>
      </div>

      <div
        class="grid grid-cols-[60px_1fr_80px] gap-2 px-3 py-2 items-center text-sm"
      >
        <div class="flex justify-center">
          <span
            class="px-2 py-0.5 rounded bg-secondary text-foreground font-medium text-xs"
          >
            {goalLabel}
          </span>
        </div>
        <div class="flex items-center gap-2">
          <div class="flex-1 h-5 bg-secondary rounded overflow-hidden">
            <div
              class="h-full {successColor(
                result.successChance,
              )} transition-all duration-300"
              style="width: {barWidth}"
            ></div>
          </div>
          <span class="text-foreground font-medium w-12 text-right text-xs">
            {pctText}
          </span>
        </div>
        <div class="flex items-center justify-center gap-1 text-xs">
          <span class="text-foreground">{avgValue}</span>
          <img src={budgetIcon} alt="" class="w-3.5 h-3.5" />
        </div>
      </div>
    </Card>
  </section>
</main>
