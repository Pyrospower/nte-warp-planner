<script lang="ts">
  import { planner } from "$lib/planner.svelte";
  import { asset } from "$lib/utils";
</script>

<div
  class="mt-4 flex flex-wrap items-center justify-center gap-1 text-sm text-muted-foreground"
>
  <span class="font-semibold text-foreground">{planner.safe.annulith}</span>
  <img src={asset("annulith.webp")} alt="Annulith" class="w-5 h-5" />
  <span>+</span>
  {#if planner.isCharacter}
    <span class="font-semibold text-foreground">{planner.safe.solidDice}</span>
    <img src={asset("solid_dice.webp")} alt="Solid Dice" class="w-5 h-5" />
  {:else}
    <span class="font-semibold text-foreground">{planner.safe.triKeys}</span>
    <img src={asset("tri-key.webp")} alt="Tri-Key" class="w-5 h-5" />
  {/if}
  <span>+</span>
  <span class="font-semibold text-foreground">{planner.safe.warpPieces}</span>
  <img src={asset("warp_piece.webp")} alt="Warp Piece" class="w-5 h-5" />
  <span>=</span>
  <span class="font-semibold text-primary">{planner.budget}</span>
  <span>{planner.unit}</span>
</div>
