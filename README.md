# NessimBenA.github.io

Welcome to my personal website, hosted on GitHub Pages. This site serves as a platform to showcase my blog posts, projects, and personal information.

## Features

- Responsive design
- Blog post listing
- Dynamic projects showcase
- About page
- Search functionality
- SEO optimization

## Website Structure

- `index.md`: The home page of the website
- `about.md`: Information about me
- `projects.md`: Dynamic showcase of my projects
- `blog.html`: Listing of blog posts
- `_posts/`: Directory containing blog post files
- `_projects/`: Directory containing individual project files
- `assets/`: Directory containing CSS and JavaScript files
- `_includes/`: Directory containing reusable HTML components
- `_layouts/`: Directory containing page layout templates

## Adding Content

### New Blog Post

To add a new blog post, create a new file in the `_posts` directory with the naming convention `YYYY-MM-DD-title.md`. Include the necessary front matter at the top of the file:

```yaml
---
layout: post
title: "Your Post Title"
date: YYYY-MM-DD HH:MM:SS -0000
categories: [category1, category2]
---
```

Then, write your post content in Markdown below the front matter.

### New Project

To add a new project:

1. Create a new Markdown file in the `_projects` directory (e.g., `new-project-name.md`).
2. Use the following front matter template at the top of the file:

```yaml
---
layout: project
title: Your Project Title
description: A brief description of your project.
tech_stack: 
  - Technology 1
  - Technology 2
  - Technology 3
github_repo: https://github.com/yourusername/project-repo
status: Active Development
---
```

3. Below the front matter, add the detailed content of your project using Markdown.

The `projects.md` file will automatically list all projects from the `_projects` directory, displaying their title, description, tech stack, GitHub repository link, and status.

## Customization

- To modify the appearance of the projects list, edit the `projects.md` file.
- To change the layout of individual project pages, edit the `_layouts/project.html` file.

## Deployment

This website is automatically deployed to GitHub Pages when changes are pushed to the main branch of the repository.

## Local Development

To run the website locally:

1. Make sure you have Ruby and Bundler installed.
2. Run `bundle install` to install the necessary gems.
3. Run `bundle exec jekyll serve` to start the local server.
4. Visit `http://localhost:4000` in your web browser to view the site.

## License

This project is open source and available under the [MIT License](LICENSE).

For any questions or concerns, please open an issue on this repository.