---
title: "【MLG60発表報告】ランベック計算に循環証明を導入する試み"
author: "TANIGUCHI Masaya"
description: "MLG60での発表をもとに、言語学動機を持つランベック計算に循環証明(μ)を導入する試みと、その形式言語理論的含意について解説します。"
date: 2025-12-19
---

2025年12月19日、数理論理学の集会であるMLG60にて、「ランベック計算の循環証明体系 $L\mu$ の試み」というタイトルで発表を行いました。本記事では、言語学的な動機を持つランベック計算に循環証明を導入する意義と、形式言語理論における含意について解説します。

## 背景と動機：論理と形式言語の階層構造

通常の Lambek Calculus ($L$) は文脈自由文法 (CFG) と等価です。近年、論理側の制約（深さ制限など）を強めることで、正規言語や線形言語に対応する階層構造が整理されつつあります。本研究の目的は、この図式に「循環（サイクル）」、すなわち無限の証明構造を導入した $\mu$-Lambek calculus ($L\mu$) を加えることで、この階層がどう拡張されるのかを探ることにあります。

### 基礎：ランベック計算

1958年に提唱されたこの体系は、交換則・弱化則・縮約則を持ちません。つまり、語の「順番」と「個数」を厳密に管理します。

$$\phi := \phi / \phi \mid \phi \backslash \phi \mid \alpha$$

#### 解析例：Alice runs

Aliceを $np$、runsを $np \backslash s$ とすると、以下の証明により文の正当性が保証されます。

$$\begin{prooftree}
\AxiomC{$np \Rightarrow np$}
\AxiomC{$s \Rightarrow s$}
\BinaryInfC{$np, np \backslash s \Rightarrow s$}
\RightLabel{$(\backslash L)$}
\end{prooftree}$$

## 提案体系 $L\mu$ と循環証明の導入

提案体系 $L\mu$ では、再帰的な定義を扱うための最小不動点 ($\mu$) と、選択を行うための連言 ($\land$) を追加しました。

$$\phi := \phi / \phi \mid \phi \backslash \phi \mid \phi \land \phi \mid \mu X. \phi_X \mid \alpha$$

### 推論規則と大域的トレース条件 (GTC)

不動点を展開する規則を追加します。ただし、論理的整合性を保つため、「すべての無限パスにおいて、左辺の $\mu$ が無限回展開（unfold）される」という **大域的トレース条件 (GTC)** を課します。

**Left Rule ($\mu L$):**
$$\begin{prooftree}
\AxiomC{$\Gamma, \alpha[\mu X. \alpha / X], \Delta \Rightarrow \gamma$}
\UnaryInfC{$\Gamma, \mu X. \alpha, \Delta \Rightarrow \gamma$}
\RightLabel{$(\mu L)$}
\end{prooftree}$$

**Right Rule ($\mu R$):**
$$\begin{prooftree}
\AxiomC{$\Gamma \Rightarrow \alpha[\mu X. \alpha / X]$}
\UnaryInfC{$\Gamma \Rightarrow \mu X. \alpha$}
\RightLabel{$(\mu R)$}
\end{prooftree}$$

### 応用：一般化された等位接続

$L\mu$ では、"A, B, and C" のような可変長の接続をオートマトン的な挙動として記述できます。
型を $\chi \equiv (\mu Y. Y \land X)$ および $\tau_{and} \equiv (\mu Y. (X \backslash X) \land (X \backslash Y)) / X$ と定義した際の証明構造は以下の通りです。

$$\begin{prooftree}
\AxiomC{$\chi, \tau_{and}, X \Rightarrow X$ \textit{(Backlink)}}
\UnaryInfC{$\chi, \tau_{and}, X \Rightarrow X$}
\RightLabel{$(\mu L)$}
\AxiomC{$X \Rightarrow X$}
\AxiomC{$\chi, X, (X \backslash \tau_{and}), X \Rightarrow X$}
\BinaryInfC{$\chi, X, (X \backslash \tau_{and}), X \Rightarrow X$}
\RightLabel{$(\backslash L)$}
\BinaryInfC{$\chi \land X, (X \backslash \tau_{and}), X \Rightarrow X$}
\RightLabel{$(\land L_2)$}
\UnaryInfC{$\chi, (X \backslash X) \land (X \backslash \tau_{and}), X \Rightarrow X$}
\RightLabel{$(\mu L)$}
\UnaryInfC{$\chi, \tau_{and}, X \Rightarrow X$}
\RightLabel{$(\mu L)$}
\end{prooftree}$$

### 矛盾の定義

$L\mu$ では「終わらない再帰」として矛盾 $\bot \equiv \mu X. X$ を定義可能です。これは GTC を満たしつつ、爆発原理（任意の命題の導出）を許容します。

$$\begin{prooftree}
\AxiomC{$\bot \Rightarrow \phi$ \textit{(Backlink)}}
\UnaryInfC{$\bot \Rightarrow \phi$}
\RightLabel{$(\mu L)$}
\end{prooftree}$$

## 結びに代えて

私の予想 (Conjecture) は、 **「循環証明を入れても、言語クラスは文脈自由言語 (CFL) のまま変わらない」** というものです。交換則がないため交差依存を作れず、GTC により有限停止性が保証されるためです。今後は、無限ストリームを扱うための最大不動点 $\nu$ を含む $L\mu\nu$ の構築を目指します。
