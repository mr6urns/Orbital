     const transition = document.createElement('div');
     transition.style.position = 'fixed';
     transition.style.inset = '0';
     transition.style.background = 'black';
     transition.style.zIndex = '9999';
     transition.style.opacity = '0';
     transition.style.transition = 'opacity 0.5s ease';
     document.body.appendChild(transition);

     const loadingText = document.createElement('div');
     loadingText.style.position = 'absolute';
     loadingText.style.top = '50%';
     loadingText.style.left = '50%';
     loadingText.style.transform = 'translate(-50%, -50%)';
     loadingText.style.color = '#38bdf8';
     loadingText.style.fontFamily = '"Share Tech Mono", monospace';
     loadingText.style.fontSize = isMobile ? '18px' : '24px';
     loadingText.textContent = 'INITIALIZING...';
     transition.appendChild(loadingText);

     requestAnimationFrame(() => {
       transition.style.opacity = '1';
       setTimeout(() => {
-        window.location.href = gameMode === 'single' ? '/game-single.html' : '/game-multi.html';
+        window.location.href = gameMode === 'single' ? 'game-single.html' : 'game-multi.html';
       }, 800);
     });
   };