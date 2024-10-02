# The Hacker's Hideout

Welcome to The Hacker's Hideout, a Jekyll-based personal blog website with a 90s hacker theme. This digital sanctuary is designed to showcase blog posts, projects, and personal information with a cyberpunk aesthetic.

## Features

- Responsive design with a retro hacker feel
- Blog post listing with pagination
- Projects showcase
- About page
- Search functionality
- Syntax highlighting for code snippets
- SEO optimization
- Google Analytics integration
- Disqus comments
- Social media sharing buttons
- Matrix-style background animation

## Getting Started

### Prerequisites

- Ruby (version 2.5.0 or higher)
- RubyGems
- GCC and Make

### Installation

1. Clone this repository:
   ```
   git clone https://github.com/your-username/your-repo-name.git
   cd your-repo-name
   ```

2. Install Jekyll and Bundler:
   ```
   gem install jekyll bundler
   ```

3. Install dependencies:
   ```
   bundle install
   ```

4. Run the website locally:
   ```
   bundle exec jekyll serve
   ```

5. Access the site at `http://localhost:4000`

## Customization

### Adding a New Blog Post

1. Create a new file in the `_posts` directory: `YYYY-MM-DD-title.md`
2. Add front matter:
   ```yaml
   ---
   layout: post
   title: "Your Post Title"
   date: YYYY-MM-DD HH:MM:SS -0000
   categories: [category1, category2]
   tags: [tag1, tag2]
   ---
   ```
3. Write your post content in Markdown below the front matter.

### Adding a New Project

1. Create a new file in the `_projects` directory: `project-name.md`
2. Add front matter:
   ```yaml
   ---
   layout: project
   title: "Your Project Title"
   description: "Short project description"
   tech_stack: [tech1, tech2]
   github_link: "https://github.com/your-username/project-repo"
   live_demo: "https://your-project-demo.com"
   ---
   ```
3. Describe your project in Markdown below the front matter.

### Theme Customization

- Modify color scheme: Edit CSS variables in `assets/css/main.css`
- Adjust layouts: Edit HTML files in `_layouts` and `_includes` directories
- Update navigation: Edit `_data/navigation.yml`

## Deployment

To deploy to GitHub Pages:

1. Update `url` in `_config.yml` to match your GitHub Pages URL
2. Push changes to the `main` branch of your GitHub repository
3. GitHub Actions will automatically build and deploy your site

## Contributing

Contributions are welcome! Please fork the repository and create a pull request with your features or fixes.

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- Jekyll team for the static site generator
- The cyberpunk and hacker culture for inspiration
- All contributors and users of this theme

Happy hacking, and may your code always compile on the first try!