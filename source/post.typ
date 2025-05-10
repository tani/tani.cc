#let target = dictionary(std).at("target", default: () => "paged")

#let target-conditional(..targets) = context {
  let target = targets.at(target(), default: targets.at("default", default: none))
  if target != none {
    target()
  }
}

#let post(title: none, doc) = {
    show math.equation.where(block: true): it => {
        target-conditional(
            paged: () => it,
            html: () => html.elem("figure", attrs: (role: "math"), html.frame(it))
        )
    }
    
    show math.equation.where(block: false): it => {
        target-conditional(
            paged: () => it,
            html: () => html.elem("span", attrs: (role: "math"), html.frame(it))
        )
    }
    
    set document(title: title)
    
    doc
}
