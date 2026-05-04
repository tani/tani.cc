default: all

all: index profile publications blog

clean:
  rm -rf dist

index:
  node script/render.mjs website.toml template/index.mustache dist/index.html

profile:
  node script/render.mjs website.toml template/profile.mustache dist/profile.html

publications:
  node script/render.mjs website.toml template/publications.mustache dist/publications.html

blog: blog-index blog-posts

blog-index:
  node script/blog.mjs website.toml content template/blog.mustache dist/blog.html

blog-posts:
  node script/blogpost.mjs website.toml content/example.md template/blogpost.mustache dist/blog/example.html
