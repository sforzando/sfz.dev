---
title: "Flipples（フリップルズ）"
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
  - "web"
  - "ai"
  - "react"
  - "python"
  - "gcp"
clients:
  - name: "吉本興業ホールディングス株式会社"
    url: "https://www.yoshimoto.co.jp"
  - name: "株式会社電通"
    url: "https://www.dentsu.co.jp"
  - name: "株式会社YDC"
    url: "https://ydcr.jp"
collaborators:
  - name: "株式会社EmbodyMe"
    url: "https://embodyme.com"
    credits:
      - "DigiSelf TTS API"
  - name: "合同会社ピコス"
    url: "https://picospec.co.jp"
    credits:
      - "F/E: 川田 知愼"
references:
  - name: "Flipples"
    url: "https://flipples.jp"
  - name: "ニュースリリース（株式会社電通・2026年8月12日）"
    url: "https://www.dentsu.co.jp/news/item-cms/2026074-0812.pdf"
thumbnail: "img/works/flipples/teaser-poster.png"
---

{{< videoPlayer src="img/works/flipples/teaser.mp4" poster="img/works/flipples/teaser-poster.png" caption="Flipples コンテンツ紹介" >}}

お笑いのネタなどでよく使われる「フリップ」。そこに描かれたキャラクターに声と人格を与え、いつでも会いに行ける場所をつくる。
この企画について、弊社は設計からインフラ構築、フロントエンド・バックエンドの実装、リリース後の運用・監視を担当しています。

2026年現在、3組の芸人コンビから6人のキャラクターが作成され、多くのユーザに利用されています。

## 楽屋裏のようなチャット

{{< deviceFrame src="img/works/flipples/chat.png" alt="チャット画面" safeAreaColor="#ffffff" notchColor="rgb(0 0 0 / 0.12)" caption="Flipples Chat" >}}

一つの部屋に6人のキャラクターがいる、まるで楽屋裏をのぞいているようなチャットルームを構築しました。

ユーザの発言内容に対して、和気藹々とした掛け合いが始まります。
AIとの1:1のチャットに慣れているユーザにとっても、新鮮な体験です。

過去の会話やキャラクターの個性を活かすために、LLMにはGeminiを利用しています。

## インタラクティブなポッドキャスト

{{< deviceFrames >}}
{{< deviceFrame src="img/works/flipples/podcast.png" alt="ポッドキャスト再生画面" safeAreaColor="#ff5a87" notchColor="rgb(0 0 0 / 0.18)" caption="Flipples Podcast" >}}
{{< deviceFrame src="img/works/flipples/podcast-letter.png" alt="お便り投稿画面" safeAreaColor="#d9a0b0" notchColor="rgb(0 0 0 / 0.15)" caption="お便りの送信" >}}
{{< /deviceFrames >}}

一般的なラジオ番組やPodcastでは"お便り"を送ることはできても、それを必ず読み上げてもらえるとは限りません。
FlipplesのPodcastはユーザからの"お便り"に対する"お返事"を必ず聴くことができます。
"お返事"は再生中のエピソードの内容や登場人物を加味して、動的に生成されます。

音声は[株式会社EmbodyMe](https://embodyme.com)のTTS APIを活用し、キャラクターの元になった芸人さんたちから音声をクローニングしました。
テンションが高い時の声、低い時の声など様々な音声モデルを用意することで、感情豊かに"お返事"を返します。

{{< videoPlayer src="img/works/flipples/podcast-archive.mp4" poster="img/works/flipples/podcast-program-poster.jpg" maxWidth="380px" caption="お返事の例" >}}

## インフラ構成

{{< figure src="../img/works/flipples/architecture.svg" alt="お便りが読み上げられるまでの流れ" >}}

クライアントのセキュリティ要件とスケーラビリティを担保するべく、Google Cloudを活用しました。
全体的にサーバレスな構成とし、TTS処理や動画生成などの時間がかかる処理が重なっても問題ありません。

また、リリース後も頻繁に更改できるよう、ステージング環境と本番環境を安全かつ迅速にプロモート、ロールバックできるように構築しました。
管理画面も設けることで、エピソードの追加やキャラクターの修正などの作業もクライアント側で自由に行えます。
