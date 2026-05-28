<script lang="ts">
  import { Root as Card } from "$lib/components/ui/card/index.js";
  import { planner } from "$lib/planner.svelte";

  function successColor(chance: number) {
    if (chance >= 0.9) return "bg-emerald-500";
    if (chance >= 0.7) return "bg-green-500";
    if (chance >= 0.5) return "bg-yellow-500";
    if (chance >= 0.3) return "bg-orange-500";
    if (chance >= 0.1) return "bg-orange-600";
    return "bg-red-500";
  }

  const avgValue = $derived(
    planner.isCharacter
      ? planner.result.average.toFixed(1)
      : planner.result.average.toFixed(2),
  );
  const pct = $derived(planner.result.successChance * 100);
  const pctText = $derived(
    pct >= 99.95 ? "100.0%" : pct < 0.05 ? "0.0%" : pct.toFixed(1) + "%",
  );
  const barWidth = $derived(
    `${Math.max(planner.result.successChance * 100, 2)}%`,
  );
</script>

<Card class="mt-4 p-0 bg-card border-border overflow-hidden">
  <div class="p-3 bg-secondary/50 border-b border-border">
    <div class="flex items-center justify-between text-sm">
      <span class="font-medium text-foreground flex items-center gap-2">
        <img src={planner.budgetIcon} alt="" class="w-5 h-5" />
        {planner.bannerName}
      </span>
      <span class="text-muted-foreground">{planner.budget} {planner.unit}</span>
    </div>
  </div>

  <div
    class="grid grid-cols-[60px_1fr_80px] gap-2 px-3 py-2 bg-secondary/30 text-xs font-medium text-muted-foreground"
  >
    <div class="text-center">Goal</div>
    <div class="text-center">Success chance</div>
    <div class="text-center">{planner.avgHeader}</div>
  </div>

  <div
    class="grid grid-cols-[60px_1fr_80px] gap-2 px-3 py-2 items-center text-sm"
  >
    <div class="flex justify-center">
      <span
        class="px-2 py-0.5 rounded bg-secondary text-foreground font-medium text-xs"
      >
        {planner.goalLabel}
      </span>
    </div>
    <div class="flex items-center gap-2">
      <div class="flex-1 h-5 bg-secondary rounded overflow-hidden">
        <div
          class="h-full {successColor(
            planner.result.successChance,
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
      <img src={planner.budgetIcon} alt="" class="w-3.5 h-3.5" />
    </div>
  </div>
</Card>
