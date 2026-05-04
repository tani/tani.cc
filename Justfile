default: all

all: bootstrap index profile publications blog

clean:
  rm -rf dist

dist:
  mkdir -p dist

bootstrap: dist
  cp node_modules/bootswatch/dist/sketchy/bootstrap.min.css dist/bootstrap.min.css
  cp node_modules/bootstrap/dist/js/bootstrap.min.js dist/bootstrap.min.js

index: dist
  node script/render.mjs website.toml template/index.mustache dist/index.html

profile: dist
  node script/render.mjs website.toml template/profile.mustache dist/profile.html

publications: dist
  node script/render.mjs website.toml template/publications.mustache dist/publications.html

blog: blog-index blog-posts

blog-index: dist
  node script/blog.mjs website.toml content template/blog.mustache dist/blog.html

blog-posts: dist
  mkdir -p dist/blog
  for post in content/*.md; do \
    slug=${post##*/}; \
    slug=${slug%.md}; \
    node script/blogpost.mjs website.toml "$post" template/blogpost.mustache "dist/blog/$slug.html"; \
  done
