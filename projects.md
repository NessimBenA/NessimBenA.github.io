---
layout: page
title: Projects
permalink: /projects/
---

# Classified Operations

Welcome to the project vault, a repository of digital experiments and cyber operations. Each project is a foray into the unknown, pushing the boundaries of what's possible in the digital frontier.

{% for project in site.projects %}
## [{{ project.title }}]({{ site.baseurl }}{{ project.url }})

{{ project.description }}

- **Tech Stack**: {{ project.tech_stack | join: ", " }}
- **GitHub Repository**: [Link to repo]({{ project.github_repo }})
- **Status**: {{ project.status }}

{% endfor %}

---

These projects represent just a fraction of the operations conducted in the shadows of cyberspace. Each one is a step towards understanding the complex tapestry of the digital world we inhabit.

Remember: In the realm of code, imagination is the only limit. Keep pushing the boundaries, and never stop questioning the system.

"Innovation is the outcome of a habit, not a random act." - [Your Hacker Alias]

<script>
document.addEventListener('DOMContentLoaded', (event) => {
  const projects = document.querySelectorAll('h2');
  projects.forEach((project, index) => {
    project.style.animation = `glitchIn 1s ease-out ${index * 0.2}s forwards`;
    project.style.opacity = '0';
  });
});
</script>

<style>
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