import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register service worker for PWA with better user experience
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('ServiceWorker registered with scope: ', registration.scope);
        
        // Check for updates every 60 seconds
        setInterval(() => {
          registration.update();
        }, 60000);
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content available - show notification
              console.log('New content available - refresh to update');
              
              // Create a simple notification
              const updateBanner = document.createElement('div');
              updateBanner.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 16px 24px;
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                z-index: 10000;
                font-family: system-ui, -apple-system, sans-serif;
                display: flex;
                align-items: center;
                gap: 12px;
                animation: slideIn 0.3s ease-out;
              `;
              updateBanner.innerHTML = `
                <span>New version available!</span>
                <button style="
                  background: white;
                  color: #667eea;
                  border: none;
                  padding: 8px 16px;
                  border-radius: 6px;
                  font-weight: 600;
                  cursor: pointer;
                " onclick="window.location.reload()">Update</button>
                <button style="
                  background: transparent;
                  color: white;
                  border: 1px solid white;
                  padding: 8px 16px;
                  border-radius: 6px;
                  font-weight: 600;
                  cursor: pointer;
                " onclick="this.parentElement.remove()">Later</button>
              `;
              document.body.appendChild(updateBanner);
            }
          });
        });
      })
      .catch(error => {
        console.error('ServiceWorker registration failed: ', error);
      });
  });
}

// Add install prompt for PWA
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome 76+ from automatically showing the prompt
  e.preventDefault();
  // Stash the event so it can be triggered later
  deferredPrompt = e;
  // Show install button or notification if needed
  console.log('App can be installed, showing install button');
});

createRoot(document.getElementById("root")!).render(<App />);
