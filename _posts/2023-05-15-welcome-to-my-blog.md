---
layout: post
title: "Welcome to The Test"
date: 2023-05-15 12:00:00 -0000
categories: [introduction, hacking]
tags: [welcome, cybersecurity, coding]
---

# Welcome to The Hacker's Hideout!


<script>
document.addEventListener('DOMContentLoaded', (event) => {
  const codeBlock = document.querySelector('pre code');
  if (codeBlock) {
    codeBlock.style.animation = 'glow 1s ease-in-out infinite alternate';
  }
  
  const headings = document.querySelectorAll('h2');
  headings.forEach((heading, index) => {
    heading.style.animation = `glitchIn 1s ease-out ${index * 0.2}s forwards`;
    heading.style.opacity = '0';
  });
});
</script>

<style>
@keyframes glow {
  from {
    box-shadow: 0 0 5px var(--text-primary), 0 0 10px var(--text-primary), 0 0 15px var(--text-primary), 0 0 20px var(--text-primary);
  }
  to {
    box-shadow: 0 0 10px var(--text-primary), 0 0 20px var(--text-primary), 0 0 30px var(--text-primary), 0 0 40px var(--text-primary);
  }
}
@keyframes glitchIn {
  0% {
    opacity: 0;
    transform: translateX(-20px);
    text-shadow: none;
  }
  10% {
    opacity: 0.5;
    transform: translateX(20px);
    text-shadow: -2px 0 var(--text-secondary), 2px 0 var(--accent-primary);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
    text-shadow: none;
  }
}
</style>