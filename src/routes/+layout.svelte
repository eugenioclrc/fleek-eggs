
<script>
    import "../app.css";
    
    import { dev } from '$app/environment';
    import { initWeb3, loadReady } from "../lib/store";
    
    import { onMount } from "svelte";
    
    onMount(() => { 
        initWeb3();
    });
    
    </script>
<svelte:head>
  {#if dev}
  <script>  
    if (!window.process) { window.process = { env: { NODE_ENV: 'development'} } }
  </script>
  {:else}
  <script>  
    if (!window.process) { window.process = { env: { NODE_ENV: 'production'} } }
  </script>
  {/if}
</svelte:head>
<div class="float-end m-5">
 <w3m-button />
</div>
<slot></slot>

