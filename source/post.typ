#let post(title: none, doc) = {
  import "@preview/droplet:0.2.0": dropcap
  let page-width = sys.inputs.at("x-page-width", default: 21cm)
  set page(width: page-width, height: auto, margin: 0pt)
  set text(18pt, font: "EB Garamond")
  show regex("[\p{scx:Han}\p{scx:Hira}\p{scx:Kana}]"): set text(font: "Zen Old Mincho")
  set par(justify: true)
  set document(title: title)
  dropcap(justify: true, doc)
}
