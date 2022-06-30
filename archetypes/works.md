---
title: "{{ replace .Name "-" " " | title }}"
date: {{ .Date }}
draft: false
sharingLinks: false
showAuthor: false
showDate: true
showDateUpdated: false
showReadingTime: false
showTaxonomies: true
showTableOfContents: false
showWordCount: false

tags:
  - "works"
clients:
  - "sforzando LLC. and Inc."
collaborators:
  - "OMD"
thumbnail: "img/works/{{ .Name }}_key.jpg"
---

{{< figure src="img/works/{{ .Name }}_key.jpg" alt="{{ .Name }}" >}}

{{< figure src="img/works/{{ .Name }}_tech.jpg" alt="Tech Rider of {{ .Name }}" >}}
