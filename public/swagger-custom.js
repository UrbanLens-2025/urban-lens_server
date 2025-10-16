// swagger-custom.js

window.addEventListener('load', () => {
  const interval = setInterval(() => {
    const topbar = document.querySelector('.schemes.wrapper');
    if (topbar && !document.getElementById('collapse-all-btn')) {
      // === Collapse button ===
      const btn = document.createElement('button');
      btn.id = 'collapse-all-btn';
      btn.innerText = 'Toggle Collapse';
      Object.assign(btn.style, {
        marginLeft: '10px',
        padding: '6px 12px',
        cursor: 'pointer',
        background: '#4990E2',
        color: '#fff',
        border: '1px solid #357ABD',
        borderRadius: '4px',
        fontSize: '13px',
        fontWeight: '500',
        transition: 'background 0.2s ease, transform 0.1s ease',
      });
      btn.onmouseenter = () => (btn.style.background = '#357ABD');
      btn.onmouseleave = () => (btn.style.background = '#4990E2');
      btn.onmousedown = () => (btn.style.transform = 'scale(0.97)');
      btn.onmouseup = () => (btn.style.transform = 'scale(1)');
      btn.onclick = () => {
        document.querySelectorAll('h3.opblock-tag').forEach((el) => el.click());
      };

      // === Dropdown ===
      const dropdown = document.createElement('select');
      dropdown.id = 'search-mode';
      Object.assign(dropdown.style, {
        marginLeft: '10px',
        padding: '6px 8px',
        borderRadius: '4px',
        border: '1px solid #d9d9d9',
        cursor: 'pointer',
        background: '#fff',
        color: '#333',
        fontSize: '13px',
        fontWeight: '500',
        outline: 'none',
        transition: 'border 0.2s ease',
      });
      dropdown.onfocus = () => (dropdown.style.border = '1px solid #4990E2');
      dropdown.onblur = () => (dropdown.style.border = '1px solid #d9d9d9');

      ['tag', 'endpoint', 'summary'].forEach((mode) => {
        const opt = document.createElement('option');
        opt.value = mode;
        opt.textContent = mode.charAt(0).toUpperCase() + mode.slice(1);
        dropdown.appendChild(opt);
      });

      // === Search bar ===
      const search = document.createElement('input');
      search.id = 'swagger-search';
      search.placeholder = 'Search...';
      Object.assign(search.style, {
        marginLeft: '10px',
        padding: '6px 12px',
        borderRadius: '4px',
        border: '1px solid #d9d9d9',
        outline: 'none',
        minWidth: '180px',
        fontSize: '13px',
        fontWeight: '500',
        transition: 'border 0.2s ease, box-shadow 0.2s ease',
      });
      search.onfocus = () => {
        search.style.border = '1px solid #4990E2';
        search.style.boxShadow = '0 0 4px rgba(73,144,226,0.3)';
      };
      search.onblur = () => {
        search.style.border = '1px solid #d9d9d9';
        search.style.boxShadow = 'none';
      };

      // === Filtering logic ===
      const filter = () => {
        const term = search.value.toLowerCase();
        const mode = dropdown.value;

        document.querySelectorAll('.opblock-tag-section').forEach((section) => {
          section.style.display = '';
          section.querySelectorAll('.opblock').forEach((op) => (op.style.display = ''));
        });

        if (!term) return;

        if (mode === 'tag') {
          document.querySelectorAll('.opblock-tag-section').forEach((section) => {
            const tag = section.querySelector('h3.opblock-tag');
            const visible = tag && tag.textContent.toLowerCase().includes(term);
            section.style.display = visible ? '' : 'none';
          });
        } else if (mode === 'endpoint') {
          document.querySelectorAll('.opblock').forEach((op) => {
            const pathEl =
              op.querySelector('.opblock-summary-path-description-wrapper')?.children?.[0]?.children?.[0]?.children?.[0];
            const visible = pathEl && pathEl.textContent.toLowerCase().includes(term);
            op.style.display = visible ? '' : 'none';
          });
        } else if (mode === 'summary') {
          document.querySelectorAll('.opblock').forEach((op) => {
            const summaryEl = op.querySelector('.opblock-summary-description');
            const visible = summaryEl && summaryEl.textContent.toLowerCase().includes(term);
            op.style.display = visible ? '' : 'none';
          });
        }
      };

      search.addEventListener('input', filter);
      dropdown.addEventListener('change', filter);

      // === Attach UI elements ===
      topbar.appendChild(btn);
      topbar.appendChild(dropdown);
      topbar.appendChild(search);

      // === Make scheme container sticky ===
      const style = document.createElement('style');
      style.textContent = `
        .scheme-container {
          position: sticky !important;
          top: 0;
          z-index: 999;
          background: #fff;
          padding: 10px 0;
          border-bottom: 1px solid #eee;
        }
      `;
      document.head.appendChild(style);

      clearInterval(interval);
    }
  }, 1000);
});
