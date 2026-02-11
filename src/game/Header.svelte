<script lang="ts">
    import { isMobile } from "../stores/isMobile";
    import { dailyPuzzle } from "../stores/dailyPuzzle";
</script>
<style>
  header{
    font-family: "Courier New", Courier, "Lucida Sans Typewriter", "Lucida Typewriter", monospace;
    height: 120px;
    font-size: var(--font-size-xxl);
    font-weight: 600;
    color: var(--primary-color);
    padding-bottom: var(--s-2);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
  }
  header.mobile{
    font-size: var(--font-size-xl);
    height: unset;
  }
  .daily-label {
    font-size: var(--font-size-small);
    font-weight: normal;
    color: var(--accent-game-color);
    position: absolute;
    bottom: var(--s-1);
    white-space: nowrap;
  }
</style>

<header class:mobile={$isMobile}>
  Octoarea
  {#if $dailyPuzzle.isDaily}
    <span class="daily-label">Головоломка дня: {$dailyPuzzle.date}</span>
  {/if}
</header>
