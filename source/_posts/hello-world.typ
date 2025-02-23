#import "@preview/fletcher:0.5.5": *
#import "../post.typ": post
#show: post.with(title: [hello typst])

Welcome to #link("https://hexo.io/")[Hexo]! This is your very first post. Check #link("https://hexo.io/docs/")[documentation] for more info. If you get any problems when using Hexo, you can find the answer in #link("https://hexo.io/docs/troubleshooting.html")[troubleshooting] or you can ask me on #link("https://github.com/hexojs/hexo/issues")[GitHub].

= Quick Start

== Create a new post


```bash
$ hexo new "My New Post"
```

More info: #link("https://hexo.io/docs/writing.html")[Writing]

== Run server

```bash
$ hexo server
```

More info: #link("https://hexo.io/docs/server.html")[Server]

== Generate static files

```bash
$ hexo generate
```

More info: #link("https://hexo.io/docs/generating.html")[Generating]

== Deploy to remote sites

```bash
$ hexo deploy
```

More info: #link("https://hexo.io/docs/one-command-deployment.html")[Deployment]
