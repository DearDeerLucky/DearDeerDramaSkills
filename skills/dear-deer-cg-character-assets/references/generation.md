# 图像资产生成与提示词

## 先确定交付

支持选择参考示例、新设计直接 CG、已选二维图转 CG、已选 CG 扩多视图／表情／服装状态、已有图精确修复。依本次范围选择，不要求每次走完整流水线。

选择示例按 [selection-examples.md](selection-examples.md) 配当前文案生成或复用实际图像：R1 全身、R2 头肩、R3 保留脸发的全身。提示写明选项编号、比较用途、本轮可变项与全部保留项；示例检查与正式资产验收分开，不对每个候选扩完整包。

完整角色包默认按 [production-package.md](production-package.md) 交付11张独立原图及配套记录，再按 [ip-panel-delivery.md](ip-panel-delivery.md) 输出4K IP面板与单页PDF。这里的数量约束完整人类角色包；用户只要一张图就交付一张，带翼尾、多足或长躯干按拓扑安排所需视角并说明差异。中性身份近景可同时作为表情基准，正面全身可同时作为三向中的正面，不重复生图凑数。

直接 CG 不强制先做二维母版。二维转 CG 要附已选图，保留五官、发型、比例、服装剪裁、颜色位置、配件和左右，只改变光照、材质、体积表现；缺乏一致背面信息时标设计建议，不能凭空说已还原。

## 权威图与身份依据

一个角色／服装状态只有一个当前全身母版。近景补足其细微身份结构，不能是另一张新脸。生成母版后优先做可读的头肩近景；若本轮专注脸设计，可先选脸，再把选定脸绑定到全身。每一步用实际文件作参考，不只在提示里写 CHAR001。

多张参考有明确职责：面部近景管脸与头发；全身母版管体态、衣装和配件；细节图管局部构造。冲突先查用户选择和版本，不让工具自行平均两张不同脸。无当前选定图时用候选试做并标状态，不能声称身份已经锁定。

## 提示词结构

使用当前工具支持的语言和参数；英文可用来表达材质／生成指令，中文设计卡保留全部含义。不要跨模型复制 --niji 等后缀，不编造支持的参考权重或固定参数。

**固定层**：任务与图像用途；已选身份和参考职责；H/NH/X 拓扑模块；CG 材质与光线标准；画面和裁切约束。

**角色变量层**：完整脸与发、比例与姿态、逐层衣装、材质／色彩位置、功能配件、左右、状态与本次允许变化。

**本轮输出层**：正面／侧面／背面／表情／特写；景别、背景、画幅、是否标签、是否多图。已锁定变量不因景别改变。

**具体排除层**：只排与本角色和本轮问题相关的错误，例如右眉缺口换边、右肘补片丢失、长袖遮住手部交互。H 可排多余肢体；NH/X 按锁定数量排错误结构，不能使用会删除合理附肢的通用词。

可适配的英文骨架：

```text
Create a [deliverable/view] production-reference image of [character ID and role], in [selected CG realism/stylization]. Use [face reference] for facial identity and hair structure, [full-body reference] for proportions, costume construction and accessory placement. Preserve every locked trait; only change [allowed change].

Topology: [H/NH/X and exact agreed body plan]. Identity: [face planes, brow/eyes/nose/mouth/jaw, skin, hair part and fall direction]. Costume: [inner to outer construction, color/material positions, closures, pockets, seams, patches, footwear]. Accessories: [function, exact wearer-side location and attachment, interaction state].

Render volumetric form with coherent soft studio lighting, readable highlights and grounded contact shadows. Show distinct cloth weave and edge thickness, restrained skin texture and subsurface-like visual softness, groomed hair strands, and physically plausible visual differences between metal, leather and rubber. Match the selected degree of stylization; avoid waxy skin, uniformly glossy materials and excess weathering. This is a rendered-looking bitmap reference, not a claim of a real mesh or engine render.

Composition: [camera/view], [neutral pose/expression], [background], [frame]. Show [required visible details] without obstruction. Preserve character-relative left/right. Exclude [specific contradictions and observed failures].
```

每次生成保存实际工具、附图路径、完整最终提示、实际参数、输出路径、版本和检查结果。单词 PBR/UE5 只描述期待视觉质感，不证明使用该引擎或真实材质系统。

## 构图与多视图

全身：头顶、手、足／末端与已确认附肢完整，留合理边距；中性姿态让衣装结构可读，背景简单。强动作、重透视和遮脸特效留在镜头环节。

身份近景：头发、双耳或预期露出部分、完整肩部和领口均可见；避免广角变形，保留同一头部比例、年龄和纹理强度。

转面：默认正面／自身右侧面／背面，等比例全身、统一光照、相同站姿与地面高度。侧视不展示看不到的正面眉毛；无法看见的特征不记通过。给左侧面时明确改用自身左侧，禁止整图镜像作为身份换面。

只需“左身份特写＋右三方向”简版时，可用16:9横版：左侧完整头肩，右侧三方向完整全身，同尺度、留空白、无带圈数字。完整包使用IP面板规范，同时容纳表情、配色和衣装装备细节。两者均先交独立原图，再用确定性排版组合；标签后期加入准确文字，不能用排版修复错误外观或把缩略图当作独立原图。

表情图：取自角色所需情绪，改变表情肌与姿态，不改变骨相、眼距、鼻口、眉断口和发缝。配件／衣装细节图只放大当前结构，不能重新设计配件。服装、伤势、时代与剧情状态各有明确变体编号。

## 生成与定向修复

生成一张后立即检查其当前用途；先解决脸和基础全身问题，再扩派生图。用户已授权完整包时，视觉检查通过的部分按范围继续，不为例行步骤重复申请批准。

修复说明包括：错误位置／期望改变／必须保留的全部要点／实际参考。能局部修就局部修；原版保留，修复版检查通过后才更新引用。默认同一问题最多三次定向修复；连续无改善时报告现有候选和具体限制，提出更清楚参考或缩小任务，不自动无限重试、换更贵模型或扩批。

仅声明已真实检查的图像；看不到输出时保留“生成已返回，图像未检查”状态，先尝试合法读取或恢复图片再下结论。
