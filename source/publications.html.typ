#import "./post.typ": post
#show: post.with(title: [Publications])

#let pub-data = toml("publications.toml").publication

#let group-by = (items, key) => {
  let groups = (:)
  for item in items {
    let k = item.at(key)
    groups.insert(k, (..groups.at(k, default: ()), item))
  }
  groups
}

#for (cat, pubs) in group-by(pub-data, "category") [
  == #cat
  #for pub in pubs [
    + *#pub.title*.
      #pub.authors.map(author =>
          if author == "Masaya Taniguchi" {
            underline(author)
          } else {
            author
          }
        ).join(", ").
      #let render(key, prefix: none, suffix: none) = {
        if pub.at(key, default: none) != none [, #prefix#pub.at(key)#suffix]
      }
      #render("venue")
      #render("volume", prefix: "Vol.")
      #render("year")
      #render("pages")
      #render("location")
      #render("date")
      #render("url")
      #render("archive")
      #render("field")
      #render("note", prefix: "(", suffix: ")")
    ]
  ]
