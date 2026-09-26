import type {
  EdgeLayout,
  IntelligenceClusterId,
  NodeLayout,
  SceneLayout,
} from './types'

type Topic = readonly [label: string, copy: string, concept?: string]

const researchTopics: Topic[] = [
  ['NLP', '语言理解、生成与文本建模。', 'Natural Language Processing，让机器处理人类语言的分支，覆盖分词、句法、语义到生成。'],
  ['CNN', '从视觉特征开始理解深度网络。', '卷积神经网络，用局部感受野与权重共享提取空间特征，是计算机视觉的经典骨架。'],
  ['Transformer', '注意力机制与现代基础模型。', '以自注意力为核心的网络结构，摆脱循环依赖，可并行处理长序列，是当代大模型的通用底座。'],
  ['扩散模型', '生成式建模与图像合成。', '通过逐步加噪再学会反向去噪来生成样本，是当前图像与视频生成的主流方法。'],
  ['强化学习', '通过反馈优化决策。', '让智能体在环境中试错，以累积回报最大化为目标学习策略，是决策类问题的框架。'],
  ['LLM', '大语言模型的训练与对齐。', 'Large Language Model，在海量文本上预训练的超大参数语言模型，具备通用语言与推理能力。'],
  ['多模态', '让文字、图像和声音共享表示。', '让模型在同一语义空间里处理多种模态信息，实现跨模态理解与生成。'],
  ['预训练', '从大规模数据获得通用能力。', '先在海量无标注数据上学习通用表示，再迁移到下游任务的两阶段范式。'],
  ['微调', '把基础模型适配具体任务。', '在预训练权重基础上用特定数据继续训练，使模型适应具体领域或任务。'],
  ['损失函数', '定义学习目标与优化方向。', '衡量预测与真实值差距的可微函数，是反向传播优化所依据的目标。'],
  ['反向传播', '让误差沿网络回流。', '利用链式法则从输出层向输入层逐层计算梯度的算法，是深度网络可训练的关键。'],
  ['优化器', 'SGD、Adam 与训练稳定性。', '根据梯度更新参数的算法，如 SGD、Adam，直接影响收敛速度与稳定性。'],
  ['PyTorch', '研究实验的常用工具链。', '主流深度学习框架，以动态计算图和易调试著称，是学术研究的事实标准之一。'],
  ['论文复现', '将想法变成可验证的实验。', '按论文描述重建实验并验证结论，是检验方法真实有效性的核心科研实践。'],
  ['评测基准', '用一致的标准比较模型能力。', '标准化的数据集与指标组合，让不同模型的能力可以被公平比较。'],
  ['模型架构', '探索网络结构与归纳偏置。', '网络的组织方式与其隐含假设，决定了模型擅长与不擅长的问题类型。'],
  ['数据工程', '构建可靠的数据集与数据管线。', '围绕数据采集、清洗、标注与版本管理的工作，通常决定模型效果上限。'],
  ['可解释性', '理解模型如何做出判断。', '研究模型决策依据的方法体系，如注意力可视化、特征归因，关乎可信与安全。'],
  ['模型压缩', '让模型更轻、更快地运行。', '通过剪枝、量化、蒸馏等手段降低模型体积与推理成本。'],
  ['AI for Science', '用模型推动科学发现。', '把深度学习方法应用于蛋白质、材料、气象等科学问题，形成新的研究范式。'],
]

const agentTopics: Topic[] = [
  ['Harness', '为 Agent 提供稳定的运行框架。', '承载 Agent 运行的外层框架，负责循环调度、工具接入、状态管理与错误恢复。'],
  ['上下文工程', '把正确的信息放进有限的上下文。', '在模型上下文窗口内组织指令、资料与历史的工程实践，直接决定输出质量。'],
  ['工具调用', '连接搜索、代码、数据库与业务系统。', '让模型以结构化方式调用外部函数或 API，从而突破纯文本生成的能力边界。'],
  ['RAG', '从外部知识中检索可靠事实。', 'Retrieval-Augmented Generation，先检索相关文档再交由模型生成，以降低幻觉并接入私有知识。'],
  ['工作流', '让多步任务可控、可观测。', '把复杂任务拆成有序的步骤与状态流转，使执行过程可追踪、可干预。'],
  ['评测', '衡量 Agent 是否真正完成任务。', '用任务成功率、轨迹质量等指标检验 Agent 的真实效能，而非仅看回答是否流畅。'],
  ['Prompt', '用清晰指令塑造行为边界。', '输入给模型的指令文本，其结构、约束与示例显著影响输出稳定性。'],
  ['Memory', '保存跨轮任务所需的经验。', '让 Agent 在会话之间保留关键信息与偏好的机制，分为短期与长期记忆。'],
  ['规划', '把复杂目标拆解为可执行步骤。', 'Agent 将高层目标分解为子任务并排序的能力，是自主性的核心。'],
  ['反思', '从执行结果中校正下一步。', '让 Agent 检查自身输出的错误并迭代修正，如 ReAct、Reflexion 等模式。'],
  ['多智能体', '让不同角色协作解决问题。', '由多个各司其职的 Agent 分工协作，通过消息传递完成单 Agent 难以胜任的任务。'],
  ['MCP', '以统一协议连接工具与上下文。', 'Model Context Protocol，标准化模型与外部工具、数据源之间的连接方式，避免重复适配。'],
  ['Sandbox', '在安全环境中执行高风险动作。', '隔离的执行环境，让 Agent 可以运行代码或命令而不影响宿主系统。'],
  ['Guardrails', '控制输出、权限与安全边界。', '对模型输入输出施加的约束与过滤机制，用于防止越权、有害内容与数据泄露。'],
  ['Observability', '追踪每一步决策和工具轨迹。', '记录并呈现 Agent 的思考步骤、工具调用与耗时，是调试与优化的前提。'],
  ['Human-in-the-loop', '在关键节点引入人工判断。', '在高风险或不确定节点交由人类确认，兼顾自动化效率与可控性。'],
  ['部署', '将原型转化为真实工作流。', '把 Agent 从演示环境推进到生产环境，涉及稳定性、延迟、成本与运维。'],
  ['权限系统', '让 Agent 在正确范围内行动。', '限定 Agent 可访问的资源与可执行的操作，遵循最小权限原则。'],
  ['成本优化', '在速度、效果与调用成本间平衡。', '通过缓存、模型分级、上下文裁剪等手段控制推理开销。'],
  ['产品设计', '围绕真实工作场景设计体验。', '决定 Agent 以何种交互形态嵌入用户的实际工作流程，而非堆砌能力。'],
]

function node(
  id: string,
  clusterId: IntelligenceClusterId,
  x: number,
  y: number,
  z: number,
  role: NodeLayout['role'],
  label: string,
  microcopy: string,
  scale: number,
  concept?: string,
  related?: string[],
): NodeLayout {
  return {
    id,
    clusterId,
    position: { x, y, z },
    role,
    label,
    microcopy,
    concept,
    related,
    hotspot: true,
    scale,
    opacity: role === 'primary' ? 1 : 0.75,
  }
}

/**
 * 自动生成关联节点：取同簇的前后邻居。
 *
 * 之所以自动派生而非逐条手写，是因为 40 个节点两两手写关联极易出现
 * 单向引用与死链；用 index 邻接保证关系一定合法且双向可达。
 *
 * 注意：这里【不】做跨簇关联。曾尝试按 index 跨簇互连，结果出现
 * 「Memory → 损失函数」这类语义无关的配对，反而误导读者。
 * 跨簇关系由两个核心节点（深度学习 ↔ AI Agent）之间的桥连线表达，
 * 语义上更准确。
 */
function relatedIds(prefix: string, index: number, total: number): string[] {
  const prev = (index - 1 + total) % total
  const next = (index + 1) % total
  return [`${prefix}${prev}`, `${prefix}${next}`]
}

// ── 诗云《行星分布》同款公式（positions.ts · poemOffset）：黄金角球面分布 ──
// yd 从 +1 → -1，星点有上有下；rxy 为该纬度圆半径；径向量化取自 hash（核心密、外晕疏），
// 叠加 jitter 让点云成团而不成壳。连线为「平面段 + 垂直段」的 L 形折线（电路板风格，非弧线）。
const GOLDEN = Math.PI * (3 - Math.sqrt(5))
const CLUSTER_RADIUS = 0.3

function hashStr(input: string): number {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function makeCluster(
  prefix: string,
  clusterId: IntelligenceClusterId,
  centerX: number,
  topics: Topic[],
  shape: { ax: number; ay: number; az: number },
): { nodes: NodeLayout[]; edges: EdgeLayout[] } {
  const nodes: NodeLayout[] = []
  const edges: EdgeLayout[] = []
  const P = topics.length
  const phase = (hashStr(prefix) & 0xffff) * 0.001
  for (let index = 0; index < P; index++) {
    const [label, copy, concept] = topics[index]!
    const yd = 1 - (2 * (index + 0.5)) / P // +1..-1（纬度：星点有上有下）
    const rxy = Math.sqrt(Math.max(0, 1 - yd * yd))
    const th = index * GOLDEN + phase // 黄金角 → 均匀角向分布
    const h = hashStr(`${prefix}:${index}`)
    const jitter = 0.4 + 1.2 * (((h >>> 8) & 0xff) / 255) // 宽抖动 → 成团，不成壳
    const u = ((h >>> 16) & 0xffff) / 0xffff // 独立径向量化（与纬度解耦）
    const rho = CLUSTER_RADIUS * Math.pow(u, 0.62) * jitter // 核密外疏
    const id = `${prefix}${index}`
    nodes.push(
      node(
        id,
        clusterId,
        centerX + rxy * Math.cos(th) * rho * shape.ax,
        yd * rho * shape.ay,
        0.33 + rxy * Math.sin(th) * rho * shape.az,
        'secondary',
        label,
        copy,
        0.42 + (index % 4) * 0.055,
        concept,
        relatedIds(prefix, index, P),
      ),
    )
    edges.push({ id: `e-${id}`, from: prefix === 'r' ? 'research' : 'agent', to: id, opacity: 0.2 + (index % 3) * 0.04, curved: true, kind: 'attention', hierarchy: 'secondary', weight: 0.34 })
  }
  return { nodes, edges }
}

const research = makeCluster('r', 'research', -0.72, researchTopics, { ax: 0.92, ay: 0.88, az: 0.7 })
const agent = makeCluster('a', 'agent', 0.72, agentTopics, { ax: 0.88, ay: 0.94, az: 0.76 })
const cores = [
  node('research', 'research', -0.72, 0, 0.38, 'primary', '深度学习', '走向模型、论文与科研的深水区。', 1.5, '以多层神经网络从数据中学习表示的机器学习分支，强调对模型原理、训练机制与实验证据的理解。', ['r2', 'r5', 'r7', 'agent']),
  node('agent', 'agent', 0.72, 0, 0.38, 'primary', 'AI Agent', '把智能组织成能在工作中完成任务的系统。', 1.5, '以模型为决策核心、能自主调用工具并多步执行任务的系统，强调把能力落地到真实工作流。', ['a0', 'a2', 'a3', 'research']),
]
const bridge: EdgeLayout = { id: 'e-bridge', from: 'research', to: 'agent', opacity: 0.9, curved: true, kind: 'attention', hierarchy: 'primary', weight: 1 }

/** An explorable, dense dual constellation of research and applied-agent knowledge. */
export const buildLayout: SceneLayout = { nodes: [...cores, ...research.nodes, ...agent.nodes], edges: [bridge, ...research.edges, ...agent.edges] }
export const understandLayout = buildLayout
export const NODE_IDS = buildLayout.nodes.map((item) => item.id)

/** id → 节点静态信息的索引，供 tooltip 把 related id 解析成可读标签。 */
export const NODE_BY_ID: ReadonlyMap<string, NodeLayout> = new Map(
  buildLayout.nodes.map((item) => [item.id, item]),
)

const mobileNodes = buildLayout.nodes.map((item) => ({ ...item, position: { x: item.position.x * 0.8, y: item.position.y * 0.82, z: item.position.z } }))
export const buildLayoutMobile: SceneLayout = { nodes: mobileNodes, edges: buildLayout.edges }
export const understandLayoutMobile = buildLayoutMobile

export function resolvePerformanceCounts(tier: 'high' | 'balanced' | 'reduced') {
  switch (tier) {
    case 'high': return { ambient: 120, secondaryVisible: 40, curveSegments: 10, idleStrength: 0.85 }
    case 'balanced': return { ambient: 72, secondaryVisible: 40, curveSegments: 8, idleStrength: 0.6 }
    case 'reduced': return { ambient: 36, secondaryVisible: 40, curveSegments: 6, idleStrength: 0.3 }
  }
}

export function layoutsForViewport(width: number) {
  const compact = width < 720
  return { compact, build: compact ? buildLayoutMobile : buildLayout, understand: compact ? understandLayoutMobile : understandLayout }
}
