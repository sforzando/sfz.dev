---
title: "Flipples"
date: 2026-08-14T00:00:00+09:00
draft: true
sharingLinks: false
showAuthor: true
showDate: true
showDateUpdated: false
showReadingTime: false
showTaxonomies: true
showTableOfContents: false
showWordCount: false

tags:
  - "works"
  - "ai"
  - "gcp"
  - "llm"
  - "python"
  - "react"
  - "web"
# TODO: Confirm the official English names before publishing. Dentsu and
# Yoshimoto Kogyo Holdings follow their own English sites; YDC, EmbodyMe and
# Picos are best guesses, as is the romanisation of the credited name.
clients:
  - name: "Yoshimoto Kogyo Holdings Co., Ltd."
    url: "https://www.yoshimoto.co.jp"
  - name: "Dentsu Inc."
    url: "https://www.dentsu.co.jp"
  - name: "YDC Inc."
    url: "https://ydcr.jp"
collaborators:
  - name: "EmbodyMe, Inc."
    url: "https://embodyme.com"
    credits:
      - "DigiSelf TTS API"
  - name: "Picos LLC"
    url: "https://picospec.co.jp"
    credits:
      - "Frontend: Tomonori Kawata"
references:
  - name: "Flipples"
    url: "https://flipples.jp"
  - name: "News release (Dentsu Inc., 12 August 2026)"
    url: "https://www.dentsu.co.jp/news/item-cms/2026074-0812.pdf"
thumbnail: "img/works/flipples/teaser-poster.png"
---

{{< videoPlayer src="img/works/flipples/teaser.mp4" poster="img/works/flipples/teaser-poster.png" caption="Flipples content teaser" >}}

Japanese comedy routines often use flip cards: hand-drawn boards a comedian holds up mid-act. Give the characters drawn on them a voice and a personality, and build somewhere you can visit them any time.

For this project, "[Flipples](https://flipples.jp)", we handled architecture, infrastructure, frontend and backend implementation, and the operations and monitoring that continue after launch.

As of 2026, six characters born from three comedy duos are live, with a growing audience.

## A chat room like the green room

{{< deviceFrame src="img/works/flipples/chat.png" alt="Chat screen" safeAreaColor="#ffffff" notchColor="rgb(0 0 0 / 0.12)" caption="Flipples Chat" >}}

We built a chat room where all six characters share one space, as if you were peeking backstage.

Whatever a user posts, the characters start playing off one another.
Who reacts, and how, is not decided in advance.
The model works out the context that brings out each character best.
Mention someone by name and that character always answers.
We wanted to serve both the fun of not knowing who will turn up and the wish to talk to someone in particular.
Even for users used to one-on-one chat with an AI, it feels different.

Gemini drives the replies, drawing on the conversation so far and each character's personality.

## An interactive podcast

{{< deviceFrames >}}
{{< deviceFrame src="img/works/flipples/podcast.png" alt="Podcast playback screen" safeAreaColor="#ff5a87" notchColor="rgb(0 0 0 / 0.18)" caption="Flipples Podcast" >}}
{{< deviceFrame src="img/works/flipples/podcast-letter.png" alt="Letter submission screen" safeAreaColor="#d9a0b0" notchColor="rgb(0 0 0 / 0.15)" caption="Sending a letter" >}}
{{< /deviceFrames >}}

Radio shows and podcasts may invite listeners to send in letters, but rarely promise that any of them will be read.
On Flipples, every letter comes back as a reply you can listen to.
Replies are generated on the fly, taking into account the episode playing and the characters in it.
The model writes a script covering who speaks, in what order, how, and what they say, and each line is then turned into audio and stitched together.

The voices use the TTS API from [EmbodyMe, Inc.](https://embodyme.com), cloned from the comedians the characters are based on.
Separate models for high-energy and low-energy delivery let the replies carry real feeling.

From writing the script through speech synthesis to rendering the video, a reply takes tens of seconds to produce.
Rather than keep users waiting, generation runs asynchronously in the background.

{{< videoPlayer src="img/works/flipples/podcast-archive.mp4" poster="img/works/flipples/podcast-program-poster.jpg" maxWidth="380px" caption="An example reply" >}}

## Infrastructure

{{< figure src="../img/works/flipples/architecture.svg" alt="Flipples infrastructure and delivery pipeline" >}}

Google Cloud gives the service the security footing and scalability that being open to the general public demands.
The architecture is serverless throughout, so overlapping long-running jobs are never a concern.

Because the service keeps changing after launch, we built the delivery path so staging and production can be switched safely and quickly.
An admin console lets the team add episodes and adjust characters without depending on us.

## Built to keep running

A service built on LLMs cannot have everything verified in advance.
What a model produces can also shift without anyone touching the code.
Noticing those changes early calls for a mechanism of its own.

We run regular, quantitative evaluations covering both model performance and the output itself.
Does each character still sound like themselves? Is the Japanese natural? Does the reply actually answer the letter? Does anything inappropriate slip through?
The evaluation set includes cases that rarely surface in everyday use, such as prompt injection and abusive language.
We score not only the model in production but also the one we are considering next, and models from other families, against the same criteria.
Moving to a new model becomes a decision backed by scores rather than impressions.

As the first title on the IP growth platform "[CHARAMO](https://www.charamo.ai)", Flipples will keep evolving.
