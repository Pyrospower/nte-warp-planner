<script lang="ts">
  import { planner } from "$lib/planner.svelte";
  import { asset } from "$lib/utils";
  import FieldInput from "./FieldInput.svelte";
</script>

<div class="p-6 space-y-4">
  <h2 class="text-base font-semibold text-center">Settings</h2>

  <div class="grid grid-cols-2 gap-x-4 gap-y-3">
    <FieldInput
      id="annulith"
      label="Annulith"
      icon={asset("annulith.webp")}
      bind:value={planner.annulith}
    />
    <FieldInput
      id="warp_piece"
      label="Warp Pieces"
      icon={asset("warp_piece.webp")}
      bind:value={planner.warpPieces}
    />
    <FieldInput
      id="dice"
      label="Solid Dice"
      icon={asset("solid_dice.webp")}
      bind:value={planner.solidDice}
    />
    <FieldInput
      id="tri-key"
      label="Tri-Keys"
      icon={asset("tri-key.webp")}
      bind:value={planner.triKeys}
    />
  </div>
</div>
