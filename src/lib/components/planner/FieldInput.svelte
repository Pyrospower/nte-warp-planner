<script lang="ts">
  import { Input } from "$lib/components/ui/input/index.js";
  import { Label } from "$lib/components/ui/label/index.js";

  let {
    label,
    value = $bindable(),
    id,
    icon,
    min = 0,
    max,
    placeholder = "0",
  }: {
    label: string;
    value: number;
    id: string;
    icon?: string;
    min?: number;
    max?: number;
    placeholder?: string;
  } = $props();
</script>

<div class="space-y-1">
  <Label for={id} class="text-muted-foreground text-xs font-medium">
    {label}
  </Label>
  <div class="flex items-center gap-2">
    {#if icon}
      <img src={icon} alt={label} class="w-5 h-5 shrink-0" />
    {/if}
    <Input
      {id}
      type="number"
      {min}
      {max}
      {placeholder}
      bind:value
      class="bg-input border-border h-8 text-sm"
    />
  </div>
</div>
