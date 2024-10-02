---
layout: default
title: Home
---

# Welcome to The Hacker's Hideout

## About Me

Greetings, fellow cybernaut! I'm [Your Hacker Alias], a digital explorer navigating the vast realms of cyberspace. This terminal is my connection to the world, where I share my exploits in coding, security, and the digital underground.

## My Arsenal

- Network Infiltration
- Code Manipulation
- Data Encryption
- System Architecture
- AI and Machine Learning
- Cybersecurity

## Recent Transmissions

{% for post in site.posts limit:3 %}
  <h3><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h3>
  <p>{{ post.excerpt | strip_html | truncatewords: 50 }}</p>
{% endfor %}

[Access All Logs](/blog)

<script>
document.addEventListener('DOMContentLoaded', (event) => {
  const heading = document.querySelector('h1');
  if (heading) {
    heading.style.animation = 'glitch 1s linear infinite';
  }
  
  const arsenalItems = document.querySelectorAll('ul li');
  arsenalItems.forEach((item, index) => {
    item.style.animation = `fadeIn 0.5s ease-out ${index * 0.1}s forwards`;
    item.style.opacity = '0';
  });
});
</script>

<style>
@keyframes glitch{
  2%,64%{
    transform: translate(2px,0) skew(0deg);
  }
  4%,60%{
    transform: translate(-2px,0) skew(0deg);
  }
  62%{
    transform: translate(0,0) skew(5deg); 
  }
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>