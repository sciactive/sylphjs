<div
  style="min-height: calc(100vh - 64px); display: flex; flex-direction: column; justify-content: space-between;"
>
  <div
    style="flex-grow: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 1em;"
  >
    {@render children?.()}
  </div>

  <Paper square variant="unelevated" class="footer-container">
    <Content class="footer">
      <div class="footer-main">
        <div class="footer-intro">
          <div class="footer-title">
            <Logo style="width: 64px; height: 64px;" />
            <span
              class="sylphjs-logo"
              style="font-size: 48px; margin-left: 8px;"
            >
              Sylph.js
            </span>
          </div>

          <div>A SciActive Product.</div>
        </div>
        <div class="footer-content">
          <div class="footer-links">
            <div>
              <p>Sylph.js</p>
              <p>
                <a
                  href="https://sylphjs.com"
                  target="_blank"
                  rel="noopener noreferrer">Home Page</a
                >
              </p>
              <hr />
              <p>
                <a
                  href="https://github.com/sciactive/sylphjs"
                  target="_blank"
                  rel="noopener noreferrer">GitHub</a
                >
              </p>
              <hr />
              <p>
                <a
                  href="https://www.gnu.org/licenses/agpl-3.0.en.html"
                  target="_blank"
                  rel="noopener noreferrer">License</a
                >
              </p>
            </div>
            <div>
              <p>SciActive Inc</p>
              <p>
                <a
                  href="https://sciactive.com"
                  target="_blank"
                  rel="noopener noreferrer">Blog</a
                >
              </p>
              <hr />
              <p>
                <a
                  href="https://github.com/sciactive"
                  target="_blank"
                  rel="noopener noreferrer">GitHub</a
                >
              </p>
              <hr />
              <p>
                <a
                  href="https://port87.social/@hperrin"
                  target="_blank"
                  rel="noopener noreferrer">Mastodon</a
                >
              </p>
            </div>
            <div>
              <p>Our Open Source Projects</p>
              <p>
                <a
                  href="https://sveltematerialui.com"
                  target="_blank"
                  rel="noopener noreferrer">Svelte Material UI</a
                >
              </p>
              <hr />
              <p>
                <a
                  href="https://nymph.io"
                  target="_blank"
                  rel="noopener noreferrer">Nymph.js</a
                >
              </p>
              <hr />
              <p>
                <a
                  href="https://github.com/sciactive/nephele"
                  target="_blank"
                  rel="noopener noreferrer">Nephele</a
                >
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="footer-copyright mdc-typography--caption">
        Copyright &copy; 2025
        <a
          href="https://sciactive.com"
          target="_blank"
          rel="noopener noreferrer">SciActive Inc</a
        >. All rights reserved.
      </div>
    </Content>
  </Paper>
</div>

<script lang="ts">
  import type { Snippet } from 'svelte';
  import Paper, { Content } from '@smui/paper';
  import Logo from '$lib/components/Logo.svelte';

  let { children }: { children: Snippet } = $props();
</script>

<style>
  :global(html, body, #sylphjs-app) {
    height: 100%;
    position: static !important;
  }

  * :global(.footer-container) {
    box-sizing: border-box;
  }

  * :global(.footer) {
    display: flex;
    flex-direction: column;
    padding: 25px;
    box-sizing: border-box;
  }

  * :global(.footer a) {
    text-decoration: none;
  }

  * :global(.footer-main) {
    display: flex;
    flex-wrap: wrap;
  }

  * :global(.footer-title) {
    display: flex;
    align-items: center;
    align-self: flex-start;
    margin-bottom: 25px;
    margin-right: 48px;
  }

  * :global(.footer-content) {
    flex-grow: 1;
  }

  * :global(.footer-links) {
    display: flex;
    flex-wrap: wrap;
    gap: 1em;
  }

  * :global(.footer-links > *) {
    flex-grow: 1;
    flex-basis: 0;
    min-width: 240px;
  }

  * :global(.footer-links hr) {
    max-width: 240px;
    margin-left: 0;
  }

  * :global(.footer-copyright) {
    margin-top: 60px;
  }

  @media (max-width: 1023px) {
    * :global(h1) {
      font-size: 4rem;
    }

    * :global(h2) {
      font-size: 2rem;
    }
  }

  @media (max-width: 599px) {
    * :global(h1) {
      font-size: 2rem;
    }

    * :global(h2) {
      font-size: 1.5rem;
    }
  }
</style>
