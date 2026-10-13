/**
 * Calm, gentle fade-on-scroll logic
 * Minimalist, performant, unobtrusive
 */
document.addEventListener('DOMContentLoaded', () => {
  const fadeElements = document.querySelectorAll('.fade-in');

  if (!('IntersectionObserver' in window)) {
    fadeElements.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -40px 0px',
    threshold: 0.08
  };

  const observer = new IntersectionObserver((entries, observerInstance) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observerInstance.unobserve(entry.target);
      }
    });
  }, observerOptions);

  fadeElements.forEach(el => observer.observe(el));

  // Interactive HD Video Facade: Seamless click-to-play with 1080p stream
  const videoFrames = document.querySelectorAll('.video-poster-frame');
  videoFrames.forEach(frame => {
    const videoId = frame.getAttribute('data-video-id');
    const title = frame.getAttribute('data-title') || 'Video';
    if (!videoId) return;

    frame.addEventListener('click', () => {
      frame.innerHTML = `<iframe 
        src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&controls=1&vq=hd1080&hd=1" 
        title="${title}" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
        allowfullscreen>
      </iframe>`;
      frame.classList.remove('video-poster-frame');
    });
  });
});

