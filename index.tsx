import React from 'react';
import ReactDOM from 'react-dom/client';

// Error boundary to catch React render errors
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: '' };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: `${error.name}: ${error.message}\n${error.stack}` };
  }
  render() {
    if (this.state.hasError) {
      return React.createElement('div', {
        style: { padding: 20, color: '#ff4444', background: '#111', fontFamily: 'monospace', fontSize: 12, whiteSpace: 'pre-wrap', height: '100vh', overflow: 'auto' }
      }, `APP CRASH:\n\n${this.state.error}`);
    }
    return this.props.children;
  }
}

// Catch uncaught errors globally and display them
window.onerror = (msg, src, line, col, err) => {
  const el = document.getElementById('root');
  if (el) {
    el.innerHTML = `<pre style="padding:20px;color:#ff4444;background:#111;font-size:12px;height:100vh;overflow:auto">
UNCAUGHT ERROR:
${msg}
Source: ${src}:${line}:${col}
${err?.stack || ''}
</pre>`;
  }
};

window.addEventListener('unhandledrejection', (e) => {
  const el = document.getElementById('root');
  if (el && !el.children.length) {
    el.innerHTML = `<pre style="padding:20px;color:#ff4444;background:#111;font-size:12px;height:100vh;overflow:auto">
UNHANDLED PROMISE REJECTION:
${e.reason?.message || e.reason}
${e.reason?.stack || ''}
</pre>`;
  }
});

async function bootstrap() {
  try {
    const { default: App } = await import('./App');
    
    const root = ReactDOM.createRoot(document.getElementById('root')!);
    root.render(
      React.createElement(ErrorBoundary, null,
        React.createElement(React.StrictMode, null,
          React.createElement(App)
        )
      )
    );
  } catch (err: any) {
    const el = document.getElementById('root');
    if (el) {
      el.innerHTML = `<pre style="padding:20px;color:#ff4444;background:#111;font-size:12px;height:100vh;overflow:auto">
BOOTSTRAP ERROR:
${err.name}: ${err.message}
${err.stack || ''}
</pre>`;
    }
  }
}

bootstrap();
