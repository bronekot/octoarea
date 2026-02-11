<script>
  import { config } from "../lib/config";
  import { isMobile } from "../stores/isMobile";
</script>
<style>
  footer{
    padding: var(--s-4) var(--s-3);
    display: flex; 
    justify-content: space-between;
    font-size: var(--font-size-small);
  }
  p{
    margin: 0;
  }
  a{
    display: inline-flex; 
    align-items: flex-start;
    font-weight: 500;
    color: var(--link-color);
    text-decoration: none;
  }
  a:hover{
    color: var(--link-hover-color);
  }
  .repository-content p{
    text-align: left;
  }
  .repository-content svg{
    margin: var(--s-1); 
    padding-right: var(--s-1);
  }
  .author-content{
    display: flex;
    align-items: center;
    justify-content: end;
    gap: var(--s-2);
  }
  .social-links{
    display: flex;
    list-style: none;
    padding: 0px;
    margin: 0px;
  }
  .social-links li{
    display: inline-block;
    margin-left: var(--s-1);
  }
  .mobile .author-content{
    flex-direction: column;
    gap: 0px;
  }
</style>
<footer class:mobile={$isMobile}>
</footer>