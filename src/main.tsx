import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

const rootEl = document.getElementById('root')!

// App is imported dynamically so a startup configuration error (e.g. a bad
// VITE_API_BASE_URL, validated in lib/apiClient) is shown instead of a blank page.
import('./App.tsx')
  .then(({ default: App }) => {
    createRoot(rootEl).render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
  })
  .catch((err: unknown) => {
    const message = err instanceof Error ? err.message : 'Unknown startup error';
    const box = document.createElement('div');
    box.setAttribute('role', 'alert');
    box.style.cssText = 'font-family:system-ui,sans-serif;max-width:40rem;margin:4rem auto;padding:1rem';
    const h = document.createElement('h1');
    h.textContent = 'UroLens failed to start';
    const p = document.createElement('p');
    p.textContent = message;
    box.append(h, p);
    rootEl.replaceChildren(box);
  });
