---
layout: default
title: Home
---

# Welcome to My One Piece Inspired Blog

## About Me

Hello! I'm [Your Name], a passionate [Your Profession/Interest] with a love for learning and sharing knowledge. This blog is my personal journey through the Grand Line of technology and personal growth.

## My Skills and Interests

- Web Development (HTML, CSS, JavaScript)
- Data Science and Machine Learning
- Cloud Computing
- Open Source Contributions
- Anime and Manga (especially One Piece!)

## Recent Blog Posts

{% for post in site.posts limit:3 %}
  <h3><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h3>
  <p>{{ post.excerpt | strip_html | truncatewords: 50 }}</p>
{% endfor %}

[View all posts](/blog)