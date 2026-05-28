<script lang="ts">
  import { Label } from "$lib/components/ui/label/index.js";
  import * as Tabs from "$lib/components/ui/tabs/index.js";
  import * as Select from "$lib/components/ui/select/index.js";
  import { planner, awakenings, mixings } from "$lib/planner.svelte";
  import FieldInput from "./FieldInput.svelte";
</script>

<div class="p-6 space-y-4">
  <h2 class="text-base font-semibold text-center">Target</h2>

  <div class="space-y-3">
    <div class="space-y-1">
      <Label class="text-muted-foreground text-xs font-medium">Banner</Label>
      <Tabs.Root bind:value={planner.banner} class="w-full">
        <Tabs.List class="grid grid-cols-2 w-full">
          <Tabs.Trigger value="character">Character</Tabs.Trigger>
          <Tabs.Trigger value="arc">Arc</Tabs.Trigger>
        </Tabs.List>
      </Tabs.Root>
    </div>

    {#if planner.isCharacter}
      <div class="space-y-1">
        <Label
          for="target-awakening"
          class="text-muted-foreground text-xs font-medium"
        >
          Target awakening
        </Label>
        <Select.Root type="single" bind:value={planner.targetAwakening}>
          <Select.Trigger
            id="target-awakening"
            class="w-full bg-input border-border h-8 text-sm"
          >
            {planner.targetAwakening}
          </Select.Trigger>
          <Select.Content>
            {#each awakenings as a (a)}
              <Select.Item value={a}>{a}</Select.Item>
            {/each}
          </Select.Content>
        </Select.Root>
      </div>

      <FieldInput
        id="character-pity"
        label="Pity counter"
        min={0}
        max={89}
        bind:value={planner.characterPity}
      />
    {:else}
      <div class="space-y-1">
        <Label
          for="target-mixing"
          class="text-muted-foreground text-xs font-medium"
        >
          Target mixing intensity
        </Label>
        <Select.Root type="single" bind:value={planner.targetMixing}>
          <Select.Trigger
            id="target-mixing"
            class="w-full bg-input border-border h-8 text-sm"
          >
            {planner.targetMixing}
          </Select.Trigger>
          <Select.Content>
            {#each mixings as t (t)}
              <Select.Item value={t}>{t}</Select.Item>
            {/each}
          </Select.Content>
        </Select.Root>
      </div>

      <FieldInput
        id="arc-pity"
        label="Pity counter"
        min={0}
        max={7}
        bind:value={planner.arcPity}
      />
    {/if}
  </div>
</div>
