---
title: "{{ replace .Name "-" " " | title }}"
date: {{ .Date }}
draft: true
sharingLinks: ["facebook", "twitter", "pinterest", "reddit", "linkedin", "email"]
showAuthor: true
showDate: true
showDateUpdated: true
showReadingTime: true
showTaxonomies: true
showTableOfContents: true
showWordCount: true

tags:
  - "{{ .Name }}"
thumbnail: "img/logo/800x800_ffffff.png"
---
