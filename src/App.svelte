<script lang="ts">
  import { Root as Card } from "$lib/components/ui/card/index.js";
  import { ModeWatcher } from "mode-watcher";
  import Settings from "$lib/components/planner/Settings.svelte";
  import Target from "$lib/components/planner/Target.svelte";
  import BudgetSummary from "$lib/components/planner/BudgetSummary.svelte";
  import ResultCard from "$lib/components/planner/ResultCard.svelte";
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
        <Settings />
        <Target />
      </div>
    </Card>

    <BudgetSummary />
    <ResultCard />
  </section>
</main>
