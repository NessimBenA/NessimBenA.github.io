---
layout: page
title: Projects
permalink: /projects/
---

# Classified Operations

Welcome to the project vault, a repository of digital experiments on learning theory and applications, dynamical systems (and who knows what else).

{% for project in site.projects %}
## [{{ project.title }}]({{ site.baseurl }}{{ project.url }})

{{ project.description }}

- **Tech Stack**: {{ project.tech_stack | join: ", " }}
- **GitHub Repository**: [Link to repo]({{ project.github_repo }})
- **Status**: {{ project.status }}

{% endfor %}

---

These projects represent some work that i do on my free time or with some friends when we find an interesting topic. if you have any question or comment, feel free to contact me on twitter.

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