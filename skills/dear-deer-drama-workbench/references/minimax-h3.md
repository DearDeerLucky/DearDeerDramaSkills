# MiniMax H3 提示词适配

仅在用户选择 MiniMax H3 或明确询问其格式时读取。先用 [通用提示词方法](video-prompting.md) 核查当前模型、模式与宿主；下列格式知识不代表已安装、可调用或已获生成授权。

## 官方规范与能力边界

文档核查日期：2026-10-23。官方文档可能更新，实际适配时核对当前版本和已暴露输入；保留来源链接，不复制整份官方技能。

- [H3 官方提示词入口](https://github.com/MiniMax-AI/MiniMax-H3/blob/main/skills/h3-prompt-writing/SKILL.md)：重写正文使用英文，原对白、歌词和画面文字保留原语言；先选模式。
- [基础模式指南](https://github.com/MiniMax-AI/MiniMax-H3/blob/main/skills/h3-prompt-writing/references/base-en.txt)：基础模式按三字段组织；I2VA 从首帧继续，关键帧说明置于正文前。下方完整示例只覆盖单首帧 I2VA。
- [Ref2VA 完整参考指南](https://github.com/MiniMax-AI/MiniMax-H3/blob/main/skills/h3-prompt-writing/references/ref-en.txt)：独立六字段，顺序为 `subject_definitions`、`summary`、`retention_analysis`、`detailed_description`、`overall_soundscape`、`non_diegetic_music`。不能将基础三字段直接当作完整参考格式。

T2VA、FL2VA、L2VA 和 Ref2VA 的完整稿按实际选定模式读取对应官方规则后编制；本参考不提供未经本任务核查的可执行参数模板。基础模型能力、参考版本、ComfyUI 工作流和宿主适配分别核实。一个只暴露单图槽位的适配不会因为画布多放了图片就变成多参考模式。Hailuo 云端产品的命令和限制不能推定适用于本地 H3。

### 本地多参考适配记录

2026-10-24 的 MiniMovie／Toonflow 适配已把三个本地 H3 选项接为单图 FL2VA 或 2—9 图 Ref2VA，具体模型、参考顺序、首帧 Guide 与验证范围见 [Toonflow 桥接的 H3 多图段](toonflowBridge.md#h3-多图参考的发现与绑定)。执行前仍先查询实时目录，不能沿用旧单图适配的限制。

该宿主会为单图追加首帧说明，为多图追加 `<Picture N>` 用途说明；不会自动把基础三字段改成官方 Ref2VA 六字段。编写新的 Ref2VA 完整稿时按上面的参考指南选择格式，同时保存宿主最终包装。已有三图音画实跑证明输入链路可执行，不证明历史三字段写法等同官方完整参考格式，也不保证生成质量。

## 适配前确认的事项

- 实际模型文件／版本与节点或工作流名称，参考图进入哪个真实槽位；不能只看面板显示“MiniMax”。
- 宿主接收完整三字段还是只接收动作正文；首帧指令、字段与声音描述是否已经自动添加，是否自动翻译或重写。未取得最终包装时只声明面板层验证。
- 用户要原生音画还是独立声音；模型支持声音不代表该适配输出音轨，无声也需真实参数和输出检查。
- 时长、比例与分辨率以当前适配为准，不能把官方家族能力、剪辑用时或提示词中的画质词当参数。

英文模型稿与中文导演稿并存，不翻译改写已确认对白或画面文字。英文格式符合官方规范不保证视觉效果优于已用中文稿；需在授权试片中比较。

## 完整匿名 I2VA 示例

这是原创文字演示，未附真实图片、未执行生成，不代表任何作品已采用。输入前提：用户已选首帧为 3D CG 风格，一位成年女信使，穿橙色短外套和深灰长裤，右手提一个闭合的金属箱，正沿有顶步道向画面右侧行走；侧前方中全景，傍晚光从画面左侧照入。若真实图不符合这些前提，应按实际图改稿，不能凭模板重设计人物。

示例需求为生成 5 秒，计划剪用其中约 4 秒，声音全部后期完成。5 秒仅在当前适配支持且用户选择时填写；无声和单镜也只是这个示例的选择。

### 中文导演稿

延续首帧正在行走的同一女信使、衣装、右手金属箱及步道布局。她沿原方向稳步前行，先把目光移向前方出口，随后略微加快脚步；不重复起步或换手。摄影机从侧前方与她同向移动，保持中全景和主体大小，接近的柱子比远处墙面后移更快，运动轴线不变。脚掌着地、承重再蹬离，箱子在右手中产生小幅自然摆动；外套下摆略有滞后。延续左侧夕光与既有阴影，箱面反光随角度缓慢移动。最后半秒保持步速，供剪辑选取衔接点。全段静音，无字幕、额外人物或新物件。

### 英文模型输入稿

仅当宿主需要完整稿时使用下方结构。首行是官方 I2VA 对齐指令，其后正文为本 Skill 的原创示例。若宿主已自动添加首行、三字段或 `[Shot 1]`，输入栏仅填适配所需部分，并另存最终组合内容，避免重复包装。

```text
For the target video, at 0.00 seconds into the target video, <Picture 1> (from [Shot 1]) is fully referenced.

integrated_multimodal_description: [Shot 1] Keep the 3D CG appearance and medium-wide composition of <Picture 1>. The same adult courier in an orange cropped jacket and dark gray trousers is already walking toward screen right under the covered walkway. Her right hand carries the same closed metal case. Preserve her face, clothing, grip, the walkway layout, and the existing light from screen left. Across this five-second shot, she shifts her gaze toward the exit ahead, then slightly quickens her walk without restarting her stride or changing hands. The camera tracks parallel from her front-left side, maintaining her size in the frame and the established axis. Nearby columns pass faster than the distant wall. Each step transfers weight through a planted foot before the next push-off; the case swings slightly below her gripping hand, and her jacket hem follows with a small delay. A soft highlight moves across the case as its angle changes. During the final half-second she continues at the same pace, leaving a usable edit handle. There is no cut, added person, new object, or on-screen text. The entire clip is silent.

overall_soundscape: N/A

non_diegetic_music: N/A
```

本例明确要求全程静音，因此两个声音字段为 `N/A`。用户需要声音时按当前能力和官方规则编写，不能把“无对白”当作“无环境声”。首帧只提供一张图，正文没有虚构第二张或尾帧，也没有把额外校对图标成模型输入。

## 检查与版本

先检查英文稿与导演稿含义一致，参考标签可解析、编号正确、总时长与实际参数相符；多镜任务按官方规则安排切点，不能照搬此例的单镜。保存后回读正文和参数，检查自动包装后的差异。只有实际执行记录才能证明最终送入了哪些内容；只有输出回看才能判断是否采用。

模型输入稿更新为 v2 时，旧 v1 视频仍保留原输入和版本；示例、格式核验、面板保存、真实生成和质量通过分别登记。本文更新期间没有新增生成或 A/B 试验，不宣称已验证效果提升。
