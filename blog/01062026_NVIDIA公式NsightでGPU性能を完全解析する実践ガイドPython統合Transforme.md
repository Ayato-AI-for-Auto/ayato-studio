---
title: "NVIDIA公式NsightでGPU性能を完全解析する実践ガイド【Python統合・Transformer対応】"
date: "01/06/2026 08:00:00"
---

# NVIDIA公式NsightでGPU性能を完全解析する実践ガイド

本記事では、NVIDIA公式ツールである **Nsight Systems** と **Nsight Compute** を用い、Pythonアプリケーションに正規に組み込みつつ、 Transformer・FlashAttention・最新GPU世代まで含めて **GPU性能を科学的に解析する方法**を解説します。

---

## ＜序論＞Part 1: 直感的理解「GPUはトラック輸送である」

GPUのスペック表には「CUDAコア数」「VRAM容量」「メモリ帯域」など難解な用語が並びますが、これらはすべて「配送センター（GPU）でのトラック輸送」に例えると本質が見えてきます。

🚚 GPU工場とトラックの比喩

* **GPUの種類（例：RTX 3050/4090）：** トラックの「車種」。
* **VRAM容量：** トラックの「荷台の広さ」。
* **CUDAコア（馬力）：** エンジンの強さ。荷物を運ぶ（計算する）スピード。
* **メモリ帯域：** 倉庫から荷台へ荷物を積み込む「通路の広さ」。
* **Batch Size：** 一度にトラックに積む「荷物の量」。

### なぜ Batch Size を増やしても速くならないのか？

初心者が陥る最大の罠がこれです。「VRAM（荷台）が空いているから、Batch Size（荷物）を増やせば速くなるはずだ」という誤解です。

**ケースA：Compute Bound（エンジンの限界）**

トラックの荷台（VRAM）が半分空いていたとしても、エンジン（CUDAコア）が既に最高速度で回転していたらどうなるでしょうか？  
荷物をさらに積んでも、トラックの速度は上がりません。むしろ重くなって遅くなる可能性すらあります。  
これが**「VRAMは余っているが、計算能力が限界」**という状態です。

**ケースB：Memory Bound（通路の渋滞）**

エンジン（CUDAコア）は高性能なのに、荷物（データ）を積み込む通路（メモリ帯域）が狭い場合、運転手は「荷積み待ち」で待機することになります。  
この場合、計算速度を決めているのはCUDAコア数ではなく、**メモリ帯域（Bandwidth）**です。

**重要結論：**  
VRAMは「計算を行うための参加資格（そこにデータが置けるか）」に過ぎず、計算速度そのものを上げるエンジンではありません。

## ＜序論＞Part 2: 「CUDA使用率100%」の嘘

`nvidia-smi` で表示される「GPU Utilization 100%」を見て、「よし、GPUを使い切っている！」と安心していませんか？  
実は、これは**「GPUが忙しそうにしている（少なくとも1つのカーネルが動いている）」**という指標に過ぎず、**「効率よく計算している」ことを意味しません。**

**CUDA使用率100%でも遅い理由：**

* **メモリアクセス待ち：** データが届くのを待っている間も、GPUは「稼働中」とカウントされます（アイドリング状態）。
* **Tensor Core未使用：** 高速道路をローギアで走っているような状態。FP32演算のみで、Tensor Coreを使っていなければ、真の性能の数分の一しか出ません。
* **ストール（Stall）：** 分岐予測ミスや依存関係により、演算ユニットが止まっている状態。

## 1. なぜ「公式ツール」以外では不十分なのか

GPUの性能問題は、推定FLOPSやCUDA使用率では解決できません。 NVIDIAは一貫して次の立場を取っています。

**GPU内部の実効性能は、公式ハードウェアカウンタでのみ正確に観測できる。**

このカウンタにアクセスできるのが Nsight Systems / Nsight Compute です。

---

## 2. NVIDIA GPU内部構造の基礎（解析の前提知識）

| 要素 | 役割 |
| --- | --- |
| SM | GPUの演算単位。Warpを並列実行 |
| Warp | 32スレッドのSIMT実行単位 |
| CUDA Core | スカラ演算 |
| Tensor Core | 行列演算（FP16/BF16/TF32） |
| Occupancy | SMに詰め込めるWarp数 |
| Memory Bandwidth | データ供給能力 |

Nsightの解析は、これらの「どこが飽和しているか」を特定する行為です。

---

## 3. Pythonへの公式な組み込み方法①：NVTX

### NVTXとは

NVTXは NVIDIA公式のアノテーションAPIで、 NsightがPythonコードの意味的区間を理解するための唯一の手段です。

### PyTorch × NVTX 実装例

```
import torch.cuda.nvtx as nvtx

def train_step(model, batch):
    nvtx.range_push("forward")
    out = model(batch)
    nvtx.range_pop()

    nvtx.range_push("backward")
    out.sum().backward()
    nvtx.range_pop()
```

Nsight Systems 上では forward / backward が色付きで表示され、 CPU・GPU・通信のどこで止まっているかが一目で分かります。

---

## 4. Pythonへの公式な組み込み方法②：Nsightを外部から起動

### subprocessによる統合（実務標準）

```
import subprocess
from pathlib import Path

def run_with_nsys(script):
    Path("nsys_report").mkdir(exist_ok=True)
    subprocess.run([
        "nsys", "profile",
        "--trace=cuda,nvtx,osrt",
        "--stats=true",
        "--output=nsys_report/run",
        "python", script
    ], check=True)
```

CI・検証・ベンチマーク環境ではこの方式が公式に推奨されています。

---

## 5. Transformer / Attention 専用の可視化戦略

Transformer解析では「層単位」での可視化が不可欠です。

```
nvtx.range_push("attention_qkv")
qkv = self.qkv(x)
nvtx.range_pop()

nvtx.range_push("attention_softmax")
attn = softmax(q @ k.transpose(-2, -1))
nvtx.range_pop()
```

これにより以下が判別可能になります。

* AttentionがMemory Boundか
* GEMMがTensor Coreを使っているか
* softmaxがボトルネックか

---

## 6. Nsight Compute：カーネル内部の公式解析

### 実行例

```
ncu --set full \
    --kernel-name "aten::matmul" \
    --target-processes all \
    python train.py
```

### 重要指標

| 指標 | 意味 |
| --- | --- |
| Achieved FLOPS | 実効演算性能 |
| Tensor Core Utilization | Tensor Core使用率 |
| DRAM Throughput | メモリ帯域使用率 |
| Warp Execution Efficiency | 分岐・再実行の影響 |

---

## 7. Nsight Compute 結果を自動収集・CSV化

```
ncu --csv --log-file result.csv \
    --kernel-name "aten::matmul" \
    python train.py
```

これにより、性能回帰テストや世代比較が可能になります。

---

## 8. FlashAttention / torch.compile の公式評価方法

FlashAttention や torch.compile の評価は **必ず Nsight Compute で行う必要があります**。

* Tensor Core Utilization が上がっているか
* DRAM Traffic が減っているか
* Kernel Fusion が成功しているか

---

## 9. GPU世代別（Ampere / Ada / Hopper）の見方

| 世代 | 注目点 |
| --- | --- |
| Ampere | TF32 / Tensor Core 活用 |
| Ada | L2増加によるMemory挙動 |
| Hopper | FP8 / TMA / Async |

---

## 10. やってはいけないGPU解析

* 推定FLOPSでの結論
* CUDA使用率100%＝速いという誤解
* Nsight無しの最適化

---

## まとめ

GPU性能解析は「感覚」ではなく「公式計測」で行う時代です。 Nsightは難しいツールではなく、 **正しく使えば最も信頼できる判断基準**になります。

---

## 補足解説：Roofline Model × Nsight Compute の対応関係

GPU性能解析の理論的背景として、NVIDIA公式資料や大学講義で必ず登場するのが **Roofline Model** です。 本章では、このRoofline Modelが **Nsight Computeのどの指標に対応しているのか**を整理します。

---

### Roofline Modelとは何か（最小限の理解）

Roofline Modelは、ある計算がどの性能上限に支配されているかを、 **Arithmetic Intensity（演算密度）**という1つの指標で分類するモデルです。

* **縦軸：** 実効性能（FLOPS）
* **横軸：** Arithmetic Intensity（FLOP / Byte）

そしてGPU性能は、次の2つの「屋根（Roof）」のどちらかに必ず制限されます。

* **Compute Roof：** GPUの最大演算性能
* **Memory Roof：** メモリ帯域による上限

**重要：**  
Roofline Modelの本質は「理論図」ではなく、 **どちらの上限にぶつかっているかを判定するための思考フレーム**です。

---

### Roofline ModelはNsight Computeでどう見えるか

Nsight Computeは、Roofline Modelに必要な全ての情報を **公式ハードウェアカウンタ**として直接提供します。

| Roofline要素 | Nsight Compute 指標 | 意味 |
| --- | --- | --- |
| 実効FLOPS | Achieved FLOPS | 実際に出ている演算性能 |
| 理論最大FLOPS | Peak FLOPS | GPUスペック上の最大値 |
| メモリ帯域使用率 | DRAM Throughput | メモリ側の飽和度 |
| 演算密度 | Arithmetic Intensity | FLOP / Byte（Nsightが自動算出） |

つまり、Nsight Computeの結果を見るだけで、 **Roofline Modelを頭の中で再構築できる**ということです。

---

### Compute Bound / Memory Bound の公式判定方法

Roofline Modelに基づく公式な判定は、以下のように行います。

#### ① Compute Bound の典型パターン

* Achieved FLOPS が Peak FLOPS に近い
* DRAM Throughput は余裕がある
* Tensor Core Utilization が高い

これは、Rooflineの「Compute Roof」に張り付いている状態であり、 **これ以上速くするにはアルゴリズム自体を変える必要があります。**

#### ② Memory Bound の典型パターン

* Achieved FLOPS が低い
* DRAM Throughput がピーク付近
* Arithmetic Intensity が低い

これは、Rooflineの「Memory Roof」に制限されている状態であり、 **計算を減らすのではなく、メモリアクセスを減らす最適化**が必要です。

Roofline Modelは「どちらが悪いか」を責めるモデルではなく、 **どこに手を入れるべきかを示す羅針盤**です。

---

### Transformer / Attention をRooflineで考える

Transformerにおける代表的な処理をRoofline視点で分類すると、 以下のようになります。

| 処理 | Roofline分類 | 理由 |
| --- | --- | --- |
| QKV Linear | Compute Bound | GEMM + Tensor Core |
| Attention Softmax | Memory / Latency Bound | 演算密度が低い |
| FlashAttention | Compute寄り | メモリアクセス削減 |

FlashAttentionが「速い」のではなく、 **Roofline上の位置を意図的に右上へ動かしている** と理解すると、本質が見えてきます。

---

### なぜNsightが必須なのか（Roofline視点）

推定FLOPSや理論式だけでは、 **自分のコードがRooflineのどこにいるか**は分かりません。

* Arithmetic Intensity → Nsight Compute
* Achieved FLOPS → Nsight Compute
* Memory Roof → DRAM Throughput

これらを同時に、かつ正確に観測できるのが Nsight Computeだけであるため、 **Roofline ModelとNsightは不可分**なのです。

---

### まとめ：Rooflineは「Nsightの読み方」

Roofline Modelは、単独で使う理論ではありません。 Nsight Computeの結果を**どう解釈するか**を与えるフレームワークです。

Nsightを見て数値を眺めるだけの状態から、  
「なぜ遅いのか」「次に何を変えるべきか」を説明できる状態へ。  
それがRoofline Modelの役割です。