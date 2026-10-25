// Shared helpers for blog posts (compiled by src/lib/typst.ts through
// NodeCompiler.addSource). Imported from each post via
// `#import "lib.typ": prooftree`.

// Proof tree for sequent-style inference rules.
//
// All positional arguments except the last are premises (rendered as
// centered cells in one row); the last positional argument is the conclusion
// (a cell spanning all premise columns, with a top stroke for the inference
// line). The named `label` argument renders a small rule-label row beneath
// the conclusion.
//
// The exported HTML target is a `<div class="typst-prooftree"><table>…`
// (via html.elem), styled by public/mediawiki.css; the typst stroke is a
// print/PDF nicety only.
#let prooftree(..premises, label: none) = {
  let conclusion = premises.at(premises.len() - 1)
  let rest = ()
  for i in range(premises.len() - 1) {
    rest.push(premises.at(i))
  }
  let n = calc.max(rest.len(), 1)
  let cells = ()
  for p in rest {
    cells.push(table.cell(fill: none, align: center)[#p])
  }
  cells.push(
    table.cell(fill: none, align: center, colspan: n, stroke: (top: 0.5pt + black))[
      #conclusion
    ],
  )
  if label != none {
    cells.push(
      table.cell(fill: none, align: center, colspan: n)[
        #text(size: 0.85em, label)
      ],
    )
  }
  html.elem(
    "div",
    attrs: (class: "typst-prooftree"),
    table(columns: n, inset: 0pt, stroke: none, align: center, ..cells),
  )
}
