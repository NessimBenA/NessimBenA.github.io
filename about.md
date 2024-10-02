---
layout: page
title: About
permalink: /about/
---

# Dossier: Nessim Hideout

Hello Everyone, Welcome to my personl website where i share my thoughts, projects and everything that i find intersting and worth sharing.

## The Mission

I am interested in everything complicated and abstract frankly, the higher the abstraction the better, and the more beautiful the project is the better. I am trying to improve my math and computer science skills and see how far i can go. 

## Arsenal of Skills

- **Deep Learning**: NLP, Computer Vision, On-device Models 
- **Learning Theory**: From Spiking neural networks to reservoir computing.  
- **Computational Fluid Dynamics**: From heat diffusion to much more complicated stuff
- **Large data Manipultion**: Working and interested on data that is too large
- **Web development and deployment**: Learning the basics for now, HTML, CSS and Javascript

## The Theme

I always found Gabby from NCIS with her hacker scenes amazing when i was a kid (i know, i know) so that's the theme i am going for in this website.

## Achievements and Exploits
**Disclaimer**: I don't think i really have done any achievements or exploits, but here is a few fun things that i've worked on. 
- Discovered that interpolating the last layer in segmentation neural network gives you the ability to adjust the segmentation area.
- Worked on Medical Diagnosis algorithms for Giant-cell arteritis
- Found out a method to effectively generalize neural networks to cross domain in-device wifi sensing. 

## Connect on the Dark Channels

- Email: bbesnessim at gmail dot com. add an a at the beginning 
- GitHub: [GitHub Profile](https://github.com/NessimBenA)
- Twitter: @[DavHilbert]

Remember, Having fun when learning is the only goal.

<script>
document.addEventListener('DOMContentLoaded', (event) => {
  const skills = document.querySelectorAll('ul li');
  skills.forEach((skill, index) => {
    skill.style.animation = `fadeIn 0.5s ease-out ${index * 0.1}s forwards`;
    skill.style.opacity = '0';
  });
});
</script>

<style>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>