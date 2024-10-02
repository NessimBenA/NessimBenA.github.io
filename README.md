# One Piece Inspired Personal Blog

This is a Jekyll-based personal blog website with a subtle One Piece theme. It's designed to showcase blog posts, projects, and personal information.

## Features

- Responsive design
- Blog post listing with pagination
- Projects showcase
- About page
- Search functionality
- Syntax highlighting for code snippets
- SEO optimization
- Google Analytics integration
- Disqus comments
- Social media sharing buttons

## Getting Started

### Prerequisites

- Ruby (version 2.5.0 or higher)
- RubyGems
- GCC and Make

### Installation

1. Install Jekyll and Bundler:
   ```
   gem install jekyll bundler
   ```

2. Clone this repository:
   ```
   git clone https://github.com/your-username/your-repo-name.git
   cd your-repo-name
   ```

3. Install dependencies:
   ```
   bundle install
   ```

4. Run the website locally:
   ```
   bundle exec jekyll serve
   ```

5. Open your browser and visit: `http://localhost:4000`

## Usage

### Adding a New Blog Post

1. Create a new file in the `_posts` directory with the format: `YYYY-MM-DD-title.md`
2. Add the following front matter to the top of the file:
   ```yaml
   ---
   layout: post
   title: "Your Post Title"
   date: YYYY-MM-DD HH:MM:SS -0000
   categories: [category1, category2]
   tags: [tag1, tag2]
   ---
   ```
3. Write your blog post content in Markdown format below the front matter.

### Adding a New Project

1. Create a new file in the `_projects` directory with the format: `project-name.md`
2. Add the following front matter to the top of the file:
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
3. Write your project description and details in Markdown format below the front matter.

### Customizing the Theme

- To modify the color scheme, edit the CSS variables in `assets/css/main.css`
- To change the layout, edit the HTML files in the `_layouts` and `_includes` directories
- To update the navigation menu, edit `_data/navigation.yml`

## Deployment

To deploy your website to GitHub Pages:

1. Update the `url` in `_config.yml` to match your GitHub Pages URL
2. Push your changes to the `main` branch of your GitHub repository
3. GitHub Actions will automatically build and deploy your site

## Contributing

If you'd like to contribute to this project, please fork the repository and create a pull request, or open an issue for discussion.

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- Jekyll team for the amazing static site generator
- One Piece creators for the inspiration
- All the contributors and users of this theme

Happy blogging, and may your journey be as exciting as the search for the One Piece!