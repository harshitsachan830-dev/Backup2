import { ServerConnection } from '@jupyterlab/services';
import { requestAPI } from './request';
import { CodeVisualizationSpec, createCodeVisualization } from './code-visualization';

export type ChatProvider = 'ollama' | 'gemini';

export interface CodeTraceEvent {
  line: number;
  functionName: string;
  variables: Record<string, string>;
}

export type CodeTraceRunner = (code: string) => Promise<{
  events: CodeTraceEvent[];
  output: string;
  error?: string;
}>;

export interface DecisionTreeNode {
  id: number;
  depth: number;
  left: number | null;
  right: number | null;
  feature: string;
  threshold: number | null;
  samples: number;
  impurity: number;
  prediction: string;
}

export interface DecisionTreeView {
  modelName: string;
  task: 'classification' | 'regression';
  criterion: string;
  nodeCount: number;
  maxDepth: number;
  nodes: DecisionTreeNode[];
}

export type DecisionTreeLoader = () => Promise<DecisionTreeView[]>;

export interface NeuralNetworkNode {
  index: number;
  label: string;
}

export interface NeuralNetworkLayer {
  label: string;
  size: number;
  nodes: NeuralNetworkNode[];
}

export interface NeuralNetworkConnection {
  fromLayer: number;
  fromNode: number;
  toNode: number;
  weight: number;
}

export interface NeuralNetworkView {
  modelName: string;
  modelType: string;
  task: 'classification' | 'regression';
  activation: string;
  outputActivation: string;
  loss: string;
  epochs: number;
  layers: NeuralNetworkLayer[];
  connections: NeuralNetworkConnection[];
  classes: string[];
}

export type NeuralNetworkLoader = () => Promise<NeuralNetworkView[]>;

export interface TrainingSource {
  id: string;
  featuresName: string;
  targetName: string;
  testFeaturesName?: string;
  testTargetName?: string;
  rows: number;
  featureCount: number;
  task: 'classification' | 'regression';
}

export interface TrainingResult {
  modelName: string;
  modelType: string;
  task: 'classification' | 'regression';
  trainRows: number;
  testRows: number;
  featureCount: number;
  primaryMetric: string;
  primaryScore: number;
  secondaryMetrics: Array<{ label: string; value: number }>;
}

export type TrainingSourceLoader = () => Promise<TrainingSource[]>;
export type ModelTrainingRunner = (sourceId: string, modelType: string) => Promise<TrainingResult>;

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  provider?: ChatProvider;
  timestamp: Date;
  isError?: boolean;
  isStreaming?: boolean;
  codeBlocks?: string[];
  datasetProfile?: DatasetProfile;
  codeProfile?: Array<{ label: string; count: number }>;
  codeVisualization?: CodeVisualizationSpec;
  animationCode?: string;
  animationUsesActiveCell?: boolean;
  decisionTrees?: DecisionTreeView[];
  neuralNetworks?: NeuralNetworkView[];
  trainingSources?: TrainingSource[];
  trainingResult?: TrainingResult;
}

interface DatasetProfile {
  filename: string;
  rows: number;
  profiledRows: number;
  totalColumns: number;
  columns: Array<{
    name: string;
    type: 'numeric' | 'categorical';
    missing: number;
    unique: number;
    mean?: number;
    median?: number;
    std?: number;
    skewness?: number;
    min?: number;
    max?: number;
    outliers?: number;
    histogram?: number[];
    categories?: Array<{ label: string; count: number }>;
  }>;
  duplicateRows: number;
}

export interface ChatContext {
  activeCode?: string;
  errorContext?: {
    error_type: string;
    error_message: string;
    traceback: string;
  };
}

async function requestChatAPI(
  settings: ServerConnection.ISettings,
  payload: object
): Promise<{
  status: string;
  reply?: string;
  provider?: ChatProvider;
  model_id?: string;
  message?: string;
}> {
  return requestAPI<{
    status: string;
    reply?: string;
    provider?: ChatProvider;
    model_id?: string;
    message?: string;
  }>('api/ai/chat', settings, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}

function parseCodeBlocks(text: string): { segments: Array<{ type: 'text' | 'code'; content: string; lang?: string }> } {
  const segments: Array<{ type: 'text' | 'code'; content: string; lang?: string }> = [];
  const codeBlockRegex = /```(\w*)\n?([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', content: text.slice(lastIndex, match.index) });
    }
    segments.push({ type: 'code', lang: match[1] || 'python', content: match[2].trim() });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    segments.push({ type: 'text', content: text.slice(lastIndex) });
  }

  return { segments };
}

function escapeChatHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderInlineMarkdown(value: string): string {
  return escapeChatHtml(value)
    .replace(/`([^`]+)`/g, '<code class="mm-chat-inline-code">$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>');
}

function renderTextMarkdown(wrapper: HTMLElement, content: string): void {
  const lines = content.replace(/\r/g, '').split('\n');
  let paragraph: string[] = [];
  const flushParagraph = (): void => {
    if (!paragraph.length) return;
    const p = document.createElement('p');
    p.className = 'mm-chat-text-seg';
    p.innerHTML = paragraph.map(renderInlineMarkdown).join('<br>');
    wrapper.appendChild(p);
    paragraph = [];
  };

  for (let i = 0; i < lines.length;) {
    const line = lines[i];
    const heading = line.match(/^\s{0,3}(#{1,3})\s+(.+?)\s*#*\s*$/);
    if (heading) {
      flushParagraph();
      const title = document.createElement(heading[1].length === 1 ? 'h2' : 'h3');
      title.className = 'mm-chat-heading';
      title.innerHTML = renderInlineMarkdown(heading[2]);
      wrapper.appendChild(title);
      i++;
      continue;
    }

    const unordered = line.match(/^\s*[-*+]\s+(.+)$/);
    const ordered = line.match(/^\s*\d+[.)]\s+(.+)$/);
    if (unordered || ordered) {
      flushParagraph();
      const list = document.createElement(ordered ? 'ol' : 'ul');
      list.className = 'mm-chat-list';
      while (i < lines.length) {
        const item = lines[i].match(ordered ? /^\s*\d+[.)]\s+(.+)$/ : /^\s*[-*+]\s+(.+)$/);
        if (!item) break;
        const li = document.createElement('li');
        li.innerHTML = renderInlineMarkdown(item[1]);
        list.appendChild(li);
        i++;
      }
      wrapper.appendChild(list);
      continue;
    }

    if (!line.trim()) {
      flushParagraph();
      i++;
      continue;
    }
    paragraph.push(line);
    i++;
  }
  flushParagraph();
}

function renderMessageContent(text: string): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'mm-chat-msg-content';

  const { segments } = parseCodeBlocks(text);
  segments.forEach(seg => {
    if (seg.type === 'code') {
      const codeWrap = document.createElement('div');
      codeWrap.className = 'mm-chat-code-block';

      const codeLang = document.createElement('div');
      codeLang.className = 'mm-chat-code-lang';
      const langLabel = document.createElement('span');
      langLabel.textContent = seg.lang || 'code';
      const copyBtn = document.createElement('button');
      copyBtn.className = 'mm-chat-copy-btn';
      copyBtn.textContent = 'Copy';
      copyBtn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(seg.content);
          copyBtn.textContent = '✓ Copied';
          setTimeout(() => { copyBtn.textContent = 'Copy'; }, 1500);
        } catch {
          copyBtn.textContent = 'Failed';
        }
      });
      codeLang.append(langLabel, copyBtn);

      const pre = document.createElement('pre');
      const code = document.createElement('code');
      code.textContent = seg.content;
      pre.appendChild(code);
      codeWrap.append(codeLang, pre);
      wrapper.appendChild(codeWrap);
    } else renderTextMarkdown(wrapper, seg.content);
  });

  return wrapper;
}

async function streamAssistantReplyInPlace(
  messageElement: HTMLElement,
  reply: string,
  messagesArea: HTMLElement
): Promise<boolean> {
  const bubble = messageElement.querySelector('.mm-chat-bubble');
  if (!(bubble instanceof HTMLElement)) return false;
  const characters = Array.from(reply);
  if (!characters.length) return true;
  const steps = Math.min(220, Math.max(30, Math.ceil(characters.length / 10)));
  const chunkSize = Math.max(1, Math.ceil(characters.length / steps));
  const totalDuration = Math.min(8000, Math.max(900, characters.length * 2.5));
  const delay = totalDuration / Math.ceil(characters.length / chunkSize);
  bubble.classList.remove('mm-chat-bubble-streaming');

  for (let index = 0; index < characters.length; index += chunkSize) {
    if (!messageElement.isConnected) return false;
    const visibleText = characters.slice(0, index + chunkSize).join('');
    const openCodeFence = ((visibleText.match(/```/g) ?? []).length % 2) === 1;
    const displayText = openCodeFence ? `${visibleText}\n\`\`\`` : visibleText;
    const content = renderMessageContent(displayText);
    const cursor = document.createElement('span');
    cursor.className = 'mm-chat-stream-cursor';
    cursor.setAttribute('aria-hidden', 'true');
    bubble.replaceChildren(content, cursor);
    messagesArea.scrollTop = messagesArea.scrollHeight;
    await new Promise(resolve => window.setTimeout(resolve, delay));
  }
  return messageElement.isConnected;
}

function createMessageBubble(
  msg: ChatMessage,
  runCodeTrace?: CodeTraceRunner,
  getActiveCode?: () => string,
  loadDecisionTrees?: DecisionTreeLoader,
  loadNeuralNetworks?: NeuralNetworkLoader,
  trainModel?: ModelTrainingRunner
): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.className = `mm-chat-msg mm-chat-msg-${msg.role}`;

  const avatar = document.createElement('div');
  avatar.className = `mm-chat-avatar mm-chat-avatar-${msg.role}`;
  avatar.textContent = msg.role === 'user' ? '👤' : (msg.provider === 'gemini' ? '✨' : '🦙');

  const container = document.createElement('div');
  container.className = 'mm-chat-bubble-container';

  // Bubble meta header
  const metaHeader = document.createElement('div');
  metaHeader.className = `mm-chat-bubble-header mm-chat-bubble-header-${msg.role}`;

  const senderName = document.createElement('span');
  senderName.className = 'mm-chat-sender-name';
  senderName.textContent = msg.role === 'user' ? 'You' : 'ModelMind AI';

  metaHeader.appendChild(senderName);

  if (msg.role === 'assistant' && msg.provider) {
    const badge = document.createElement('span');
    badge.className = `mm-chat-provider-badge mm-chat-badge-${msg.provider}`;
    badge.textContent = msg.provider === 'gemini' ? 'Gemini Cloud' : 'Ollama Local';
    metaHeader.appendChild(badge);
  }

  const time = document.createElement('span');
  time.className = 'mm-chat-time';
  time.textContent = msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  metaHeader.appendChild(time);

  const bubble = document.createElement('div');
  bubble.className = `mm-chat-bubble mm-chat-bubble-${msg.role}`;

  if (msg.isError) {
    bubble.classList.add('mm-chat-bubble-error');
  }

  if (msg.isStreaming) {
    bubble.classList.add('mm-chat-bubble-streaming');
    const dots = document.createElement('div');
    dots.className = 'mm-chat-typing-dots';
    dots.innerHTML = '<span></span><span></span><span></span>';
    bubble.appendChild(dots);
  } else {
    const content = renderMessageContent(msg.content);
    bubble.appendChild(content);
    if (msg.datasetProfile) bubble.appendChild(renderDatasetProfile(msg.datasetProfile));
    if (msg.codeProfile) bubble.appendChild(renderCodeProfile(msg.codeProfile));
    if (msg.animationCode && runCodeTrace && getActiveCode) {
      bubble.appendChild(renderCodeAnimation(msg.animationCode, runCodeTrace, getActiveCode, msg.animationUsesActiveCell !== false));
    }
    if (msg.decisionTrees) bubble.appendChild(renderDecisionTrees(msg.decisionTrees));
    if (msg.neuralNetworks) bubble.appendChild(renderNeuralNetworks(msg.neuralNetworks));
    if (msg.trainingSources) bubble.appendChild(renderTrainingWorkflow(msg.trainingSources, trainModel));
  }
  if (msg.codeVisualization) bubble.appendChild(renderCodeVisualization(msg.codeVisualization));

  container.append(metaHeader, bubble);

  if (msg.role === 'user') {
    wrapper.append(container, avatar);
  } else {
    wrapper.append(avatar, container);
  }

  return wrapper;
}

function renderTrainingWorkflow(
  sources: TrainingSource[],
  trainModel?: ModelTrainingRunner
): HTMLElement {
  const card = document.createElement('section');
  card.style.cssText = 'margin-top:10px;padding:12px;border:1px solid #dbe3ef;border-radius:10px;background:#fff;color:#243247';
  const heading = document.createElement('strong');
  heading.textContent = '🏋 Train a model in this notebook';
  const note = document.createElement('div');
  note.style.cssText = 'font-size:11px;color:#64748b;margin:5px 0 9px';
  note.textContent = 'Training runs in the active local Python kernel. Use numeric or already encoded features.';
  card.append(heading, note);
  if (!sources.length) {
    const empty = document.createElement('div');
    empty.style.cssText = 'padding:10px;border-radius:7px;background:#f8fafc;color:#475569;font-size:12px';
    empty.textContent = 'I could not find a usable feature/target pair. Define X_train and y_train (optionally X_test and y_test), or X and y, then try again.';
    card.appendChild(empty);
    return card;
  }

  const controls = document.createElement('div');
  controls.style.cssText = 'display:flex;flex-wrap:wrap;align-items:center;gap:7px';
  const sourceSelect = document.createElement('select');
  sourceSelect.setAttribute('aria-label', 'Training data source');
  sourceSelect.style.cssText = 'max-width:260px;padding:6px;border:1px solid #cbd5e1;border-radius:6px;background:#fff;color:#243247';
  sources.forEach((source, index) => {
    const option = document.createElement('option');
    option.value = source.id;
    option.textContent = `${source.featuresName} + ${source.targetName} · ${source.rows} rows · ${source.featureCount} features`;
    if (index === 0) option.selected = true;
    sourceSelect.appendChild(option);
  });
  const modelSelect = document.createElement('select');
  modelSelect.setAttribute('aria-label', 'Model type to train');
  modelSelect.style.cssText = 'padding:6px;border:1px solid #cbd5e1;border-radius:6px;background:#fff;color:#243247';
  [
    ['decision_tree', 'Decision Tree'],
    ['random_forest', 'Random Forest'],
    ['neural_network', 'Neural Network (MLP)']
  ].forEach(([value, label]) => {
    const option = document.createElement('option'); option.value = value; option.textContent = label;
    modelSelect.appendChild(option);
  });
  const trainButton = document.createElement('button');
  trainButton.type = 'button'; trainButton.textContent = '▶ Train locally';
  trainButton.style.cssText = 'padding:6px 10px;border:1px solid #c7d2fe;border-radius:6px;background:#eef2ff;color:#3730a3;cursor:pointer;font-weight:600';
  controls.append(sourceSelect, modelSelect, trainButton);
  const status = document.createElement('div');
  status.style.cssText = 'font-size:11px;color:#475569;margin-top:8px';
  status.textContent = 'Task type is detected from the target. A holdout split is used when a test set is not already available.';
  card.append(controls, status);

  trainButton.addEventListener('click', async () => {
    if (!trainModel) return;
    trainButton.disabled = true;
    trainButton.textContent = '⏳ Training…';
    status.textContent = 'Training and evaluating the model in the notebook kernel…';
    try {
      const result = await trainModel(sourceSelect.value, modelSelect.value);
      const secondary = result.secondaryMetrics.map(metric => `${metric.label}: ${metric.value.toFixed(4)}`).join(' · ');
      status.textContent = `${result.modelType} ${result.task} trained locally as ${result.modelName}. ${result.primaryMetric}: ${result.primaryScore.toFixed(4)}${secondary ? ` · ${secondary}` : ''} · ${result.trainRows} train / ${result.testRows} test rows · ${result.featureCount} features. Use Visualize Tree or Visualize Neural Network to inspect supported fitted models.`;
      status.style.color = '#166534';
    } catch (error) {
      status.textContent = error instanceof Error ? error.message : 'Training failed in the notebook kernel.';
      status.style.color = '#b91c1c';
    } finally {
      trainButton.disabled = false;
      trainButton.textContent = '▶ Train locally';
    }
  });
  return card;
}

function renderNeuralNetworks(networks: NeuralNetworkView[]): HTMLElement {
  const card = document.createElement('section');
  card.style.cssText = 'margin-top:10px;padding:12px;border:1px solid #dbe3ef;border-radius:10px;background:#fff;color:#243247';
  if (!networks.length) {
    card.textContent = 'No fitted scikit-learn MLP neural network was found in the current notebook kernel. Fit an MLPClassifier or MLPRegressor, then try again.';
    return card;
  }

  const heading = document.createElement('strong');
  heading.textContent = '🧠 Fitted neural network';
  const controls = document.createElement('div');
  controls.style.cssText = 'display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:8px 0';
  const modelSelect = document.createElement('select');
  modelSelect.setAttribute('aria-label', 'Choose fitted neural network');
  modelSelect.style.cssText = 'max-width:240px;padding:5px;border:1px solid #cbd5e1;border-radius:6px;background:#fff;color:#243247';
  networks.forEach((network, index) => {
    const option = document.createElement('option');
    option.value = String(index);
    option.textContent = `${network.modelName} · ${network.task}`;
    modelSelect.appendChild(option);
  });
  const playButton = document.createElement('button');
  playButton.type = 'button';
  playButton.textContent = '▶ Play';
  playButton.setAttribute('aria-label', 'Play neural network flow animation');
  playButton.style.cssText = 'padding:5px 10px;border:1px solid #cbd5e1;border-radius:6px;background:#fff;color:#243247;cursor:pointer;font-weight:600';
  const speedSelect = document.createElement('select');
  speedSelect.setAttribute('aria-label', 'Neural network animation speed');
  speedSelect.style.cssText = 'padding:5px;border:1px solid #cbd5e1;border-radius:6px;background:#fff;color:#243247';
  [1, 2, 3, 4].forEach(speed => {
    const option = document.createElement('option');
    option.value = String(speed); option.textContent = `${speed}×`;
    speedSelect.appendChild(option);
  });
  const strengthLabel = document.createElement('label');
  strengthLabel.style.cssText = 'display:flex;align-items:center;gap:6px;font-size:11px;color:#475569';
  strengthLabel.append(document.createTextNode('Hide weak weights '));
  const strength = document.createElement('input');
  strength.type = 'range'; strength.min = '0'; strength.max = '100'; strength.value = '0';
  strength.setAttribute('aria-label', 'Hide weak neural network weights');
  const strengthText = document.createElement('span');
  strengthLabel.append(strength, strengthText);
  controls.append(modelSelect, playButton, speedSelect, strengthLabel);

  const summary = document.createElement('div');
  summary.style.cssText = 'font-size:11px;line-height:1.6;color:#475569;margin:6px 0';
  const diagram = document.createElement('div');
  diagram.style.cssText = 'max-height:470px;overflow:auto;border:1px solid #edf1f6;border-radius:8px;background:#f8fafc';
  const legend = document.createElement('div');
  legend.style.cssText = 'font-size:10px;color:#64748b;margin-top:6px';
  const animationStatus = document.createElement('div');
  animationStatus.style.cssText = 'font-size:10px;color:#64748b;min-height:14px;margin:3px 0';
  card.append(heading, controls, summary, animationStatus, diagram, legend);

  let animationTimer: number | null = null;
  let isPlaying = false;
  let activeLayer = -1;
  let renderedEdges: Array<{ element: SVGLineElement; layer: number; stroke: string; width: string; opacity: string }> = [];
  let renderedNodes: Array<{ element: SVGCircleElement; layer: number; fill: string; stroke: string }> = [];
  const paintAnimationFrame = (): void => {
    renderedEdges.forEach(edge => {
      const active = edge.layer === activeLayer;
      edge.element.setAttribute('stroke', active ? '#f59e0b' : edge.stroke);
      edge.element.setAttribute('stroke-width', active ? '3.5' : edge.width);
      edge.element.setAttribute('stroke-opacity', active ? '0.95' : edge.opacity);
    });
    renderedNodes.forEach(node => {
      const active = node.layer === activeLayer || node.layer === activeLayer + 1;
      node.element.setAttribute('fill', active ? '#fef3c7' : node.fill);
      node.element.setAttribute('stroke', active ? '#f59e0b' : node.stroke);
    });
    const network = networks[Number(modelSelect.value)] ?? networks[0];
    animationStatus.textContent = activeLayer >= 0
      ? `${isPlaying ? 'Playing' : 'Paused'} · ${network.layers[activeLayer]?.label ?? 'Layer'} → ${network.layers[activeLayer + 1]?.label ?? 'Output'} · illustrative, not a specific prediction`
      : 'Ready · animation highlights the layer-by-layer flow; it does not calculate a sample prediction.';
  };
  const stopAnimation = (reset = true): void => {
    if (animationTimer !== null) window.clearInterval(animationTimer);
    animationTimer = null;
    isPlaying = false;
    playButton.textContent = '▶ Play';
    playButton.setAttribute('aria-label', 'Play neural network flow animation');
    if (reset) activeLayer = -1;
    paintAnimationFrame();
  };
  const advanceAnimation = (): void => {
    const network = networks[Number(modelSelect.value)] ?? networks[0];
    const transitions = Math.max(1, network.layers.length - 1);
    activeLayer = (activeLayer + 1) % transitions;
    paintAnimationFrame();
  };
  const startAnimation = (): void => {
    if (animationTimer !== null) window.clearInterval(animationTimer);
    isPlaying = true;
    playButton.textContent = '⏸ Pause';
    playButton.setAttribute('aria-label', 'Pause neural network flow animation');
    advanceAnimation();
    const delay = 1200 / Number(speedSelect.value);
    animationTimer = window.setInterval(() => {
      if (!card.isConnected) { stopAnimation(); return; }
      advanceAnimation();
    }, delay);
  };
  playButton.addEventListener('click', () => isPlaying ? stopAnimation(false) : startAnimation());
  speedSelect.addEventListener('change', () => { if (isPlaying) startAnimation(); });
  modelSelect.addEventListener('change', () => { stopAnimation(); render(); });

  const render = (): void => {
    const network = networks[Number(modelSelect.value)] ?? networks[0];
    const maxWeight = Math.max(0, ...network.connections.map(connection => Math.abs(connection.weight)));
    const minWeight = maxWeight * Number(strength.value) / 100;
    const shownEdges = network.connections.filter(connection => Math.abs(connection.weight) >= minWeight);
    const layerGap = 132;
    const width = Math.max(720, 100 + (network.layers.length - 1) * layerGap);
    const height = 430;
    const xAt = (layerIndex: number): number => 48 + layerIndex * layerGap;
    const pointAt = new Map<string, { x: number; y: number }>();
    renderedEdges = [];
    renderedNodes = [];
    network.layers.forEach((layer, layerIndex) => {
      const count = Math.max(1, layer.nodes.length);
      layer.nodes.forEach((node, nodeIndex) => {
        pointAt.set(`${layerIndex}:${node.index}`, {
          x: xAt(layerIndex),
          y: 70 + ((nodeIndex + 1) * (height - 130)) / (count + 1)
        });
      });
    });
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('width', String(width)); svg.setAttribute('height', String(height));
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', `${network.modelType} neural network with layer sizes ${network.layers.map(layer => layer.size).join(', ')}`);

    shownEdges.forEach(connection => {
      const from = pointAt.get(`${connection.fromLayer}:${connection.fromNode}`);
      const to = pointAt.get(`${connection.fromLayer + 1}:${connection.toNode}`);
      if (!from || !to) return;
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line') as SVGLineElement;
      line.setAttribute('x1', String(from.x)); line.setAttribute('y1', String(from.y));
      line.setAttribute('x2', String(to.x)); line.setAttribute('y2', String(to.y));
      line.setAttribute('stroke', connection.weight >= 0 ? '#2563eb' : '#dc2626');
      line.setAttribute('stroke-width', String(0.7 + 1.8 * Math.abs(connection.weight) / (maxWeight || 1)));
      line.setAttribute('stroke-opacity', String(0.12 + 0.65 * Math.abs(connection.weight) / (maxWeight || 1)));
      renderedEdges.push({
        element: line,
        layer: connection.fromLayer,
        stroke: line.getAttribute('stroke') ?? '#2563eb',
        width: line.getAttribute('stroke-width') ?? '1',
        opacity: line.getAttribute('stroke-opacity') ?? '0.5'
      });
      const title = document.createElementNS(svg.namespaceURI, 'title');
      title.textContent = `Weight ${connection.weight.toFixed(4)}`;
      line.appendChild(title); svg.appendChild(line);
    });

    network.layers.forEach((layer, layerIndex) => {
      const title = document.createElementNS(svg.namespaceURI, 'text');
      title.setAttribute('x', String(xAt(layerIndex))); title.setAttribute('y', '24');
      title.setAttribute('text-anchor', 'middle'); title.setAttribute('font-size', '12');
      title.setAttribute('font-weight', '700'); title.setAttribute('fill', '#334155');
      title.textContent = layer.label; svg.appendChild(title);
      const countLabel = document.createElementNS(svg.namespaceURI, 'text');
      countLabel.setAttribute('x', String(xAt(layerIndex))); countLabel.setAttribute('y', '42');
      countLabel.setAttribute('text-anchor', 'middle'); countLabel.setAttribute('font-size', '10');
      countLabel.setAttribute('fill', '#64748b');
      countLabel.textContent = `${layer.size} units`;
      if (layer.nodes.length < layer.size) countLabel.textContent += ` · showing ${layer.nodes.length}`;
      svg.appendChild(countLabel);
      layer.nodes.forEach(node => {
        const point = pointAt.get(`${layerIndex}:${node.index}`); if (!point) return;
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle') as SVGCircleElement;
        circle.setAttribute('cx', String(point.x)); circle.setAttribute('cy', String(point.y));
        circle.setAttribute('r', '13');
        circle.setAttribute('fill', layerIndex === 0 ? '#dbeafe' : layerIndex === network.layers.length - 1 ? '#dcfce7' : '#ede9fe');
        circle.setAttribute('stroke', layerIndex === 0 ? '#3b82f6' : layerIndex === network.layers.length - 1 ? '#22c55e' : '#8b5cf6');
        circle.setAttribute('stroke-width', '2');
        renderedNodes.push({
          element: circle,
          layer: layerIndex,
          fill: circle.getAttribute('fill') ?? '#ede9fe',
          stroke: circle.getAttribute('stroke') ?? '#8b5cf6'
        });
        const nodeTitle = document.createElementNS(svg.namespaceURI, 'title');
        nodeTitle.textContent = node.label; circle.appendChild(nodeTitle); svg.appendChild(circle);
        const label = document.createElementNS(svg.namespaceURI, 'text');
        label.setAttribute('x', String(point.x)); label.setAttribute('y', String(point.y + 27));
        label.setAttribute('text-anchor', 'middle'); label.setAttribute('font-size', '9');
        label.setAttribute('fill', '#475569'); label.textContent = node.label.length > 15 ? `${node.label.slice(0, 13)}…` : node.label;
        svg.appendChild(label);
      });
    });
    diagram.replaceChildren(svg);
    strengthText.textContent = `${Number(strength.value)}% · ${shownEdges.length}/${network.connections.length} links`;
    summary.textContent = `${network.modelType} · ${network.task} · layers ${network.layers.map(layer => layer.size).join(' → ')} · hidden activation ${network.activation} · output ${network.outputActivation} · loss ${network.loss} · ${network.epochs} training iterations`;
    legend.textContent = `Blue links have positive weights; red links have negative weights. Line thickness shows absolute weight. Gold highlights the current animation step. Hover a link or neuron for its value. ${network.classes.length ? `Classes: ${network.classes.join(', ')}.` : ''} Showing a representative subset of neurons when a layer exceeds 12 units.`;
    paintAnimationFrame();
  };
  strength.addEventListener('input', render);
  render();
  return card;
}

function renderDecisionTrees(trees: DecisionTreeView[]): HTMLElement {
  const card = document.createElement('section');
  card.style.cssText = 'margin-top:10px;padding:12px;border:1px solid #dbe3ef;border-radius:10px;background:#fff;color:#243247';
  if (!trees.length) {
    card.textContent = 'No fitted scikit-learn decision tree was found in the current notebook kernel. Fit a DecisionTreeClassifier or DecisionTreeRegressor, then try again.';
    return card;
  }

  const heading = document.createElement('strong');
  heading.textContent = '🌳 Fitted decision tree';
  const controls = document.createElement('div');
  controls.style.cssText = 'display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:8px 0';
  const modelSelect = document.createElement('select');
  modelSelect.setAttribute('aria-label', 'Choose fitted decision tree');
  modelSelect.style.cssText = 'max-width:220px;padding:5px;border:1px solid #cbd5e1;border-radius:6px;background:#fff;color:#243247';
  trees.forEach((tree, index) => {
    const option = document.createElement('option'); option.value = String(index);
    option.textContent = `${tree.modelName} · ${tree.task}`; modelSelect.appendChild(option);
  });
  const depthWrap = document.createElement('label');
  depthWrap.style.cssText = 'display:flex;align-items:center;gap:6px;font-size:11px;color:#475569';
  const depthText = document.createElement('span');
  const depthInput = document.createElement('input'); depthInput.type = 'range'; depthInput.min = '1'; depthInput.max = '10'; depthInput.value = '3';
  depthInput.setAttribute('aria-label', 'Maximum tree depth shown');
  const diagram = document.createElement('div');
  diagram.style.cssText = 'max-height:440px;overflow:auto;border:1px solid #edf1f6;border-radius:8px;background:#f8fafc';
  const caption = document.createElement('div');
  caption.style.cssText = 'font-size:10px;color:#64748b;margin-top:6px';
  depthWrap.append(document.createTextNode('Visible depth '), depthInput, depthText);
  controls.append(modelSelect, depthWrap);

  const render = (): void => {
    const tree = trees[Number(modelSelect.value)] ?? trees[0];
    const maxVisibleDepth = Math.max(1, Math.min(10, tree.maxDepth));
    depthInput.max = String(maxVisibleDepth);
    depthInput.value = String(Math.max(1, Math.min(Number(depthInput.value), maxVisibleDepth)));
    const shownDepth = Math.min(Number(depthInput.value), tree.maxDepth);
    depthText.textContent = `${shownDepth} / ${tree.maxDepth}`;
    const visible = tree.nodes.filter(node => node.depth <= shownDepth);
    const levels: DecisionTreeNode[][] = [];
    visible.forEach(node => (levels[node.depth] ??= []).push(node));
    const widest = Math.max(1, ...levels.map(level => level?.length ?? 0));
    const nodeWidth = 184, nodeHeight = 76, gapX = 26, gapY = 42;
    const width = Math.max(680, widest * (nodeWidth + gapX) + gapX);
    const height = Math.max(150, (shownDepth + 1) * (nodeHeight + gapY) + gapY);
    const positions = new Map<number, { x: number; y: number }>();
    levels.forEach((level, depth) => level?.forEach((node, index) => {
      const x = ((index + 1) * width) / (level.length + 1);
      positions.set(node.id, { x, y: gapY / 2 + depth * (nodeHeight + gapY) });
    }));

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('width', String(width)); svg.setAttribute('height', String(height));
    svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', `${tree.task} tree with ${tree.nodeCount} nodes`);
    visible.forEach(node => {
      const parent = positions.get(node.id); if (!parent) return;
      ([['left', '≤'], ['right', '>']] as const).forEach(([side, label]) => {
        const childId = node[side]; const child = childId === null ? undefined : positions.get(childId);
        if (!child) return;
        const line = document.createElementNS(svg.namespaceURI, 'line');
        line.setAttribute('x1', String(parent.x)); line.setAttribute('y1', String(parent.y + nodeHeight));
        line.setAttribute('x2', String(child.x)); line.setAttribute('y2', String(child.y));
        line.setAttribute('stroke', '#94a3b8'); line.setAttribute('stroke-width', '2'); svg.appendChild(line);
        const branch = document.createElementNS(svg.namespaceURI, 'text');
        branch.setAttribute('x', String((parent.x + child.x) / 2)); branch.setAttribute('y', String((parent.y + nodeHeight + child.y) / 2));
        branch.setAttribute('text-anchor', 'middle'); branch.setAttribute('font-size', '11'); branch.setAttribute('fill', '#475569'); branch.textContent = label;
        svg.appendChild(branch);
      });
    });
    visible.forEach(node => {
      const point = positions.get(node.id); if (!point) return;
      const isLeaf = node.left === null && node.right === null;
      const group = document.createElementNS(svg.namespaceURI, 'g');
      const rect = document.createElementNS(svg.namespaceURI, 'rect');
      rect.setAttribute('x', String(point.x - nodeWidth / 2)); rect.setAttribute('y', String(point.y));
      rect.setAttribute('width', String(nodeWidth)); rect.setAttribute('height', String(nodeHeight));
      rect.setAttribute('rx', '9'); rect.setAttribute('fill', isLeaf ? '#ecfdf5' : '#eef2ff');
      rect.setAttribute('stroke', isLeaf ? '#86efac' : '#a5b4fc'); rect.setAttribute('stroke-width', '1.5'); group.appendChild(rect);
      const title = document.createElementNS(svg.namespaceURI, 'title');
      title.textContent = isLeaf ? `Leaf: ${node.prediction}` : `${node.feature} ≤ ${node.threshold}`; group.appendChild(title);
      const addText = (text: string, y: number, bold = false): void => {
        const label = document.createElementNS(svg.namespaceURI, 'text');
        label.setAttribute('x', String(point.x)); label.setAttribute('y', String(point.y + y));
        label.setAttribute('text-anchor', 'middle'); label.setAttribute('font-size', bold ? '12' : '10');
        label.setAttribute('font-weight', bold ? '700' : '400'); label.setAttribute('fill', '#1e293b'); label.textContent = text;
        group.appendChild(label);
      };
      const rule = isLeaf ? `Predict: ${node.prediction}` : `${node.feature} ≤ ${node.threshold}`;
      addText(rule.length > 27 ? `${rule.slice(0, 24)}…` : rule, 23, true);
      addText(`samples ${node.samples} · ${tree.task === 'classification' ? 'gini' : 'impurity'} ${node.impurity.toPrecision(3)}`, 43);
      addText(`node ${node.id}`, 62);
      svg.appendChild(group);
    });
    diagram.replaceChildren(svg);
    window.requestAnimationFrame(() => {
      if (diagram.isConnected) diagram.scrollLeft = Math.max(0, width / 2 - diagram.clientWidth / 2);
    });
    caption.textContent = `${tree.criterion} · ${tree.nodeCount} nodes · maximum depth ${tree.maxDepth}. Showing depth ${shownDepth}${tree.maxDepth > 10 ? ' (visualization capped at depth 10)' : ''}; scroll horizontally to inspect branches.`;
  };
  modelSelect.addEventListener('change', render);
  depthInput.addEventListener('input', render);
  card.append(heading, controls, diagram, caption);
  render();
  return card;
}

function renderCodeProfile(items: Array<{ label: string; count: number }>): HTMLElement {
  const card = document.createElement('section');
  card.style.cssText = 'margin-top:10px;padding:10px 12px;border:1px solid #dbe3ef;border-radius:9px;background:#fff;color:#243247;font-size:11px';
  const heading = document.createElement('strong'); heading.textContent = 'Code structure map'; card.appendChild(heading);
  const note = document.createElement('div'); note.style.cssText = 'color:#607086;margin:3px 0 8px'; note.textContent = 'Counts of common Python constructs in the active cell (a quick overview, not an execution trace).'; card.appendChild(note);
  const max = Math.max(1, ...items.map(x => x.count));
  items.forEach(({ label, count }) => {
    const row = document.createElement('div'); row.style.cssText = 'display:grid;grid-template-columns:86px 1fr 22px;gap:6px;align-items:center;margin:4px 0';
    const name = document.createElement('span'); name.textContent = label;
    const track = document.createElement('span'); track.style.cssText = 'height:8px;background:#eef0fa;border-radius:8px;overflow:hidden';
    const fill = document.createElement('span'); fill.style.cssText = `display:block;height:100%;width:${Math.round(count * 100 / max)}%;background:#7367f0`; track.appendChild(fill);
    const value = document.createElement('span'); value.textContent = String(count);
    row.append(name, track, value); card.appendChild(row);
  });
  return card;
}

function renderCodeVisualization(spec: CodeVisualizationSpec): HTMLElement {
  const card = document.createElement('section');
  card.setAttribute('aria-label', 'Source-derived code visualization');
  card.style.cssText = 'margin-top:10px;padding:13px;border:1px solid #d9d5ff;border-radius:12px;background:linear-gradient(145deg,#fbfaff,#f5f7ff);color:#25304a;box-shadow:0 5px 18px rgba(79,70,180,.08)';

  const headingRow = document.createElement('div');
  headingRow.style.cssText = 'display:flex;justify-content:space-between;align-items:flex-start;gap:8px';
  const heading = document.createElement('strong');
  heading.textContent = `🔎 ${spec.title}`;
  heading.style.cssText = 'font-size:13px;color:#24234b';
  const badge = document.createElement('span');
  badge.textContent = 'SOURCE-BASED · NOT RUN';
  badge.style.cssText = 'flex:none;padding:4px 7px;border-radius:999px;background:#ecebff;color:#5548c8;font-size:9px;font-weight:800;letter-spacing:.04em';
  headingRow.append(heading, badge);

  const summary = document.createElement('p');
  summary.textContent = spec.summary;
  summary.style.cssText = 'margin:7px 0 11px;color:#59657b;font-size:11px;line-height:1.55';
  card.append(headingRow, summary);

  if (spec.kind === 'neural-network' && spec.layers?.length) {
    const diagram = document.createElement('div');
    diagram.style.cssText = 'overflow-x:auto;border:1px solid #e5e7f7;border-radius:9px;background:#fff;padding:7px;margin-bottom:9px';
    const width = Math.max(500, 84 + (spec.layers.length - 1) * 145);
    const height = 205;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('width', String(width));
    svg.setAttribute('height', String(height));
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', 'Source-derived neural network layer architecture');
    const positions: Array<Array<{ x: number; y: number }>> = [];
    spec.layers.forEach((layer, layerIndex) => {
      const shown = layer.units === null ? 3 : Math.min(5, Math.max(1, layer.units));
      const x = 48 + layerIndex * 145;
      const points = Array.from({ length: shown }, (_, nodeIndex) => ({
        x,
        y: 64 + ((nodeIndex + 1) * 105) / (shown + 1)
      }));
      positions.push(points);
    });
    positions.slice(0, -1).forEach((points, layerIndex) => {
      points.forEach(from => positions[layerIndex + 1].forEach(to => {
        const edge = document.createElementNS(svg.namespaceURI, 'line');
        edge.setAttribute('x1', String(from.x + 8)); edge.setAttribute('y1', String(from.y));
        edge.setAttribute('x2', String(to.x - 8)); edge.setAttribute('y2', String(to.y));
        edge.setAttribute('stroke', '#c4c6e7'); edge.setAttribute('stroke-width', '1.2');
        svg.appendChild(edge);
      }));
    });
    spec.layers.forEach((layer, layerIndex) => {
      const x = 48 + layerIndex * 145;
      const label = document.createElementNS(svg.namespaceURI, 'text');
      label.setAttribute('x', String(x)); label.setAttribute('y', '18');
      label.setAttribute('text-anchor', 'middle'); label.setAttribute('font-size', '10');
      label.setAttribute('font-weight', '700'); label.setAttribute('fill', '#4b4d76');
      label.textContent = layer.label; svg.appendChild(label);
      positions[layerIndex].forEach(point => {
        const circle = document.createElementNS(svg.namespaceURI, 'circle');
        circle.setAttribute('cx', String(point.x)); circle.setAttribute('cy', String(point.y));
        circle.setAttribute('r', '7'); circle.setAttribute('fill', ['#7c6cf1', '#22a879', '#f3a53b'][layerIndex % 3]);
        circle.setAttribute('stroke', '#fff'); circle.setAttribute('stroke-width', '2');
        svg.appendChild(circle);
      });
      const units = document.createElementNS(svg.namespaceURI, 'text');
      units.setAttribute('x', String(x)); units.setAttribute('y', '190'); units.setAttribute('text-anchor', 'middle');
      units.setAttribute('font-size', '10'); units.setAttribute('fill', '#68738a');
      units.textContent = layer.units === null ? 'width unknown' : `${layer.units} unit${layer.units === 1 ? '' : 's'}`;
      svg.appendChild(units);
    });
    const legend = document.createElement('div');
    legend.textContent = 'Layer-to-layer connections are schematic; no learned weights or sample activations are displayed.';
    legend.style.cssText = 'font-size:10px;color:#68738a;margin:0 3px 3px';
    diagram.append(svg, legend);
    card.appendChild(diagram);
  } else if (spec.kind === 'decision-tree') {
    const diagram = document.createElement('div');
    diagram.style.cssText = 'overflow-x:auto;border:1px solid #e5e7f7;border-radius:9px;background:#fff;padding:7px;margin-bottom:9px';
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 560 190'); svg.setAttribute('width', '560'); svg.setAttribute('height', '190');
    svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', 'Conceptual decision-tree branches, not a fitted tree');
    const addLine = (x1: number, y1: number, x2: number, y2: number): void => {
      const edge = document.createElementNS(svg.namespaceURI, 'line');
      edge.setAttribute('x1', String(x1)); edge.setAttribute('y1', String(y1)); edge.setAttribute('x2', String(x2)); edge.setAttribute('y2', String(y2));
      edge.setAttribute('stroke', '#a5a8ca'); edge.setAttribute('stroke-width', '2'); svg.appendChild(edge);
    };
    addLine(280, 64, 145, 112); addLine(280, 64, 415, 112);
    const addNode = (x: number, y: number, title: string, detail: string, color: string): void => {
      const group = document.createElementNS(svg.namespaceURI, 'g');
      const rect = document.createElementNS(svg.namespaceURI, 'rect');
      rect.setAttribute('x', String(x - 88)); rect.setAttribute('y', String(y - 23)); rect.setAttribute('width', '176'); rect.setAttribute('height', '48');
      rect.setAttribute('rx', '10'); rect.setAttribute('fill', color); rect.setAttribute('stroke', '#d6d8ec'); group.appendChild(rect);
      [[title, y - 2, '11', '700'], [detail, y + 14, '9', '400']].forEach(([text, textY, size, weight]) => {
        const label = document.createElementNS(svg.namespaceURI, 'text');
        label.setAttribute('x', String(x)); label.setAttribute('y', String(textY)); label.setAttribute('text-anchor', 'middle');
        label.setAttribute('font-size', String(size)); label.setAttribute('font-weight', String(weight)); label.setAttribute('fill', '#34405a');
        label.textContent = String(text); group.appendChild(label);
      });
      svg.appendChild(group);
    };
    addNode(280, 45, 'Feature test', 'learned from fit data', '#f2efff');
    addNode(145, 135, 'True branch', 'continues to a leaf', '#effaf5');
    addNode(415, 135, 'False branch', 'continues to a leaf', '#fff7e9');
    const yes = document.createElementNS(svg.namespaceURI, 'text'); yes.setAttribute('x', '198'); yes.setAttribute('y', '91'); yes.setAttribute('font-size', '9'); yes.setAttribute('fill', '#626b81'); yes.textContent = 'yes'; svg.appendChild(yes);
    const no = document.createElementNS(svg.namespaceURI, 'text'); no.setAttribute('x', '355'); no.setAttribute('y', '91'); no.setAttribute('font-size', '9'); no.setAttribute('fill', '#626b81'); no.textContent = 'no'; svg.appendChild(no);
    diagram.appendChild(svg); card.appendChild(diagram);
  }

  const flow = document.createElement('ol');
  flow.style.cssText = 'list-style:none;padding:0;margin:0;display:grid;gap:6px';
  spec.steps.forEach((step, index) => {
    const item = document.createElement('li');
    item.style.cssText = 'display:grid;grid-template-columns:24px minmax(0,1fr) auto;gap:8px;align-items:start;padding:7px 8px;border:1px solid #e7e8f4;border-radius:8px;background:#fff';
    const number = document.createElement('span');
    number.textContent = String(index + 1);
    number.style.cssText = 'display:grid;place-items:center;width:21px;height:21px;border-radius:50%;background:#eeedff;color:#5548c8;font-size:10px;font-weight:800';
    const text = document.createElement('span');
    const title = document.createElement('strong'); title.textContent = step.title; title.style.cssText = 'display:block;color:#343657;font-size:11px';
    const detail = document.createElement('span'); detail.textContent = step.detail; detail.style.cssText = 'display:block;margin-top:2px;color:#68738a;font-size:10px;line-height:1.45';
    text.append(title, detail);
    item.append(number, text);
    if (step.line !== undefined) {
      const line = document.createElement('span'); line.textContent = `Line ${step.line}`;
      line.style.cssText = 'padding:3px 5px;border-radius:5px;background:#f2f3f9;color:#737990;font-size:9px;white-space:nowrap';
      item.appendChild(line);
    }
    flow.appendChild(item);
  });
  card.appendChild(flow);

  const renderFactList = (titleText: string, values: string[], color: string): void => {
    if (!values.length) return;
    const panel = document.createElement('div');
    panel.style.cssText = 'margin-top:8px;padding:9px 10px;border:1px solid #e5e7f3;border-radius:9px;background:#fff';
    const title = document.createElement('strong');
    title.textContent = titleText;
    title.style.cssText = `display:block;margin-bottom:5px;color:${color};font-size:10px`;
    const list = document.createElement('ul');
    list.style.cssText = 'margin:0;padding-left:17px;color:#59657b;font-size:10px;line-height:1.5';
    values.slice(0, 6).forEach(value => {
      const item = document.createElement('li');
      item.textContent = value;
      list.appendChild(item);
    });
    panel.append(title, list);
    card.appendChild(panel);
  };
  renderFactList('What we can read from this source', spec.sourceFacts, '#26764b');
  renderFactList('What this preview cannot establish', spec.limits, '#8a5b19');

  const note = document.createElement('p');
  note.textContent = `Grounding: ${spec.sourceNote}`;
  note.style.cssText = 'margin:9px 1px 0;padding-top:8px;border-top:1px solid #e6e7f3;color:#68738a;font-size:10px;line-height:1.5';
  card.appendChild(note);
  return card;
}

function summarizeCodeStructure(code: string): Array<{ label: string; count: number }> {
  const patterns: Array<[string, RegExp]> = [
    ['Imports', /^\s*(?:import\s+|from\s+\S+\s+import\s+)/gm],
    ['Functions', /^\s*(?:async\s+)?def\s+\w+/gm],
    ['Classes', /^\s*class\s+\w+/gm],
    ['Conditions', /^\s*(?:if|elif|else)\b/gm],
    ['Loops', /^\s*(?:for|while|async\s+for)\b/gm],
    ['Data operations', /\b(?:read_csv|groupby|merge|join|fit|predict|transform|plot|hist|bar)\s*\(/g],
    ['Outputs', /\b(?:print|display|savefig|to_csv)\s*\(/g],
  ];
  return patterns.map(([label, pattern]) => ({ label, count: (code.match(pattern) ?? []).length }));
}

function explainSourceLine(line: string): string {
  const trimmed = line.trim();
  if (!trimmed) return 'Blank line — visual spacing only.';
  if (trimmed.startsWith('#')) return 'Comment — Python skips this line when executing the cell.';
  if (/^(from\s+\S+\s+import|import)\b/.test(trimmed)) return 'Import — makes a module or selected names available to later lines.';
  if (/^(for|while)\b/.test(trimmed)) return 'Loop header — the indented body runs for each item or while its condition is true.';
  if (/^(if|elif|else|try|except|finally|with)\b/.test(trimmed)) return 'Control-flow line — which indented block runs depends on the runtime condition or outcome.';
  if (/^(def|class|async\s+def)\b/.test(trimmed)) return 'Definition — creates a function or class; its body runs later when called or instantiated.';
  if (/^return\b/.test(trimmed)) return 'Return — exits the current function and passes a value back to its caller.';
  if (/^(print|display)\s*\(/.test(trimmed)) return 'Output — sends a value to the notebook output when this line runs.';
  if (/^[\w.\[\]]+\s*([+\-*/]?=)/.test(trimmed)) return 'Assignment or update — evaluates the expression and stores its result in a name or location.';
  return 'Statement — Python evaluates this line in order; its exact effect depends on the current values and program state.';
}

function renderCodeAnimation(
  source: string,
  runCodeTrace: CodeTraceRunner,
  getActiveCode: () => string,
  usesActiveCell: boolean
): HTMLElement {
  let currentSource = source;
  let lines = currentSource.replace(/\r\n?/g, '\n').split('\n').slice(0, 250);
  const root = document.createElement('section');
  root.setAttribute('aria-label', 'Python execution trace');
  root.style.cssText = 'margin-top:10px;padding:10px;border:1px solid #dbe3ef;border-radius:9px;background:#fff;color:#243247;font-size:12px';

  const heading = document.createElement('strong');
  heading.textContent = '▶ Python execution trace';
  const note = document.createElement('div');
  note.style.cssText = 'font-size:11px;color:#607086;margin:4px 0 8px';
  note.textContent = usesActiveCell
    ? 'Run & trace reads the currently selected notebook cell each time, then replays its executed lines and variable values.'
    : 'Runs the uploaded code in the current kernel, then replays its executed lines and variable values.';

  const controls = document.createElement('div');
  controls.style.cssText = 'display:flex;align-items:center;gap:6px;margin-bottom:8px';
  const makeButton = (label: string, title: string): HTMLButtonElement => {
    const button = document.createElement('button');
    button.type = 'button'; button.textContent = label; button.title = title;
    button.style.cssText = 'border:1px solid #dbe3ef;border-radius:6px;background:#f8fafc;padding:4px 8px;color:#243247;cursor:pointer';
    return button;
  };
  const run = makeButton('▶ Run & trace', 'Run this code cell and capture its execution path');
  run.style.background = '#eef2ff';
  run.style.borderColor = '#c7d2fe';
  run.style.color = '#4338ca';
  const previous = makeButton('← Back', 'Previous executed line');
  const toggle = makeButton('▶ Play', 'Play execution trace');
  const next = makeButton('Next →', 'Next executed line');
  const counter = document.createElement('span');
  counter.style.cssText = 'margin-left:auto;font-size:11px;color:#607086';
  controls.append(run, previous, toggle, next, counter);

  const codePanel = document.createElement('div');
  codePanel.style.cssText = 'max-height:260px;overflow:auto;border:1px solid #edf1f6;border-radius:6px;background:#0f172a;padding:6px 0;font:11px/1.55 ui-monospace,SFMono-Regular,Menlo,monospace';
  let renderedLines: HTMLElement[] = [];
  const renderSourceLines = (): void => {
    lines = currentSource.replace(/\r\n?/g, '\n').split('\n').slice(0, 250);
    renderedLines = lines.map((line, index) => {
      const row = document.createElement('div');
      row.dataset.line = String(index);
      row.style.cssText = 'display:grid;grid-template-columns:36px minmax(0,1fr);padding:0 8px;color:#cbd5e1;white-space:pre;min-height:17px';
      const number = document.createElement('span'); number.textContent = String(index + 1); number.style.color = '#64748b';
      const text = document.createElement('span'); text.textContent = line || ' ';
      row.append(number, text); return row;
    });
    codePanel.replaceChildren(...renderedLines);
  };
  renderSourceLines();
  const explanation = document.createElement('div');
  explanation.setAttribute('aria-live', 'polite');
  explanation.style.cssText = 'font-size:11px;color:#475569;margin-top:7px;min-height:16px';
  explanation.textContent = 'Run & trace captures the real path; loops can visit a line multiple times and untaken branches are skipped.';
  const variablePanel = document.createElement('div');
  variablePanel.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:5px;margin-top:8px';
  const outputPanel = document.createElement('pre');
  outputPanel.style.cssText = 'display:none;max-height:120px;overflow:auto;white-space:pre-wrap;background:#f8fafc;border:1px solid #edf1f6;border-radius:6px;padding:7px;font:11px/1.4 ui-monospace,monospace;color:#334155';

  let events: CodeTraceEvent[] = [];
  let step = 0;
  let timer: ReturnType<typeof setInterval> | undefined;
  const paint = (): void => {
    if (events.length === 0) { counter.textContent = 'Run to capture execution'; return; }
    const active = events[step];
    renderedLines.forEach(row => {
      const selected = Number(row.dataset.line) === active.line - 1;
      row.style.background = selected ? 'rgba(109,124,255,.28)' : 'transparent';
      if (selected) row.scrollIntoView({ block: 'nearest' });
    });
    counter.textContent = `Executed step ${step + 1} of ${events.length} · line ${active.line}${active.functionName !== '<module>' ? ` · ${active.functionName}()` : ''}`;
    explanation.textContent = `At the start of this line: ${explainSourceLine(lines[active.line - 1] ?? '')}`;
    variablePanel.replaceChildren();
    const entries = Object.entries(active.variables);
    if (entries.length === 0) {
      const empty = document.createElement('span'); empty.textContent = 'No simple variable values at this step.'; empty.style.cssText = 'color:#64748b;font-size:11px'; variablePanel.appendChild(empty);
    } else entries.forEach(([name, value]) => {
      const chip = document.createElement('div');
      chip.style.cssText = 'padding:5px 7px;border:1px solid #e2e8f0;border-radius:6px;background:#f8fafc;min-width:0';
      const key = document.createElement('strong'); key.textContent = name; key.style.cssText = 'display:block;color:#475569;font-size:10px';
      const val = document.createElement('span'); val.textContent = value; val.title = value; val.style.cssText = 'display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font:11px ui-monospace,monospace;color:#0f172a';
      chip.append(key, val); variablePanel.appendChild(chip);
    });
  };
  const stop = (): void => { if (timer) clearInterval(timer); timer = undefined; toggle.textContent = '▶ Play'; toggle.title = 'Play execution trace'; };
  const advance = (): void => { step = Math.min(step + 1, events.length - 1); paint(); };
  previous.addEventListener('click', () => { stop(); step = Math.max(step - 1, 0); paint(); });
  next.addEventListener('click', () => { stop(); advance(); });
  toggle.addEventListener('click', () => {
    if (timer) { stop(); return; }
    if (events.length < 2 || step >= events.length - 1) return;
    toggle.textContent = '⏸ Pause'; toggle.title = 'Pause walkthrough';
    timer = setInterval(() => {
      if (!root.isConnected) { stop(); return; }
      if (step >= events.length - 1) { stop(); return; }
      step += 1; paint();
    }, 650);
  });
  run.addEventListener('click', async () => {
    const latestSource = usesActiveCell ? getActiveCode().trim() : currentSource;
    if (!latestSource) {
      explanation.textContent = 'Select a code cell in the notebook, then run the trace again.';
      return;
    }
    if (latestSource !== currentSource) {
      currentSource = latestSource;
      events = [];
      step = 0;
      renderSourceLines();
      variablePanel.replaceChildren();
      outputPanel.style.display = 'none';
      counter.textContent = 'Selected cell changed · tracing the new code';
    }
    if (/\b(?:input|getpass)\s*\(/.test(latestSource)) {
      explanation.textContent = 'This cell uses input(). Interactive prompts are not supported in trace mode yet; try a cell that does not ask for keyboard input.';
      return;
    }
    const accepted = window.confirm('Run the currently selected code cell in its Jupyter kernel to capture the real execution path? It can change variables, show output, and repeat any file or network actions in the code.');
    if (!accepted) return;
    run.disabled = true; run.textContent = 'Tracing…';
    explanation.textContent = 'Running the selected code and capturing executed lines…';
    try {
      const result = await runCodeTrace(latestSource);
      events = result.events.slice(0, 1000);
      step = 0;
      outputPanel.style.display = result.output || result.error ? 'block' : 'none';
      outputPanel.textContent = [result.output, result.error ? `Execution stopped: ${result.error}` : ''].filter(Boolean).join('\n');
      explanation.textContent = result.error
        ? `Captured ${events.length} executed steps before the cell stopped with an error.`
        : `Captured ${events.length} executed steps. Repeated lines show loops; lines Python skipped do not appear.`;
      if (events.length === 0) explanation.textContent += ' No Python line events were captured.';
      paint();
    } catch (error) {
      explanation.textContent = error instanceof Error ? error.message : 'Could not capture this execution.';
    } finally {
      run.disabled = false; run.textContent = '↻ Run again';
    }
  });
  root.append(heading, note, controls, codePanel, explanation, variablePanel, outputPanel);
  counter.textContent = 'Run to capture execution';
  if (lines.length >= 250) {
    const limitNote = document.createElement('div');
    limitNote.style.cssText = 'font-size:10px;color:#607086;margin-top:5px';
    limitNote.textContent = 'Showing the first 250 lines.';
    root.appendChild(limitNote);
  }
  return root;
}

function renderDatasetProfile(profile: DatasetProfile): HTMLElement {
  const card = document.createElement('section');
  card.style.cssText = 'margin-top:12px;padding:12px;border:1px solid #dbe3ef;border-radius:10px;background:#fff;color:#243247;font-size:12px';
  const title = document.createElement('strong');
  title.textContent = `${profile.filename} · ${profile.rows.toLocaleString()} rows × ${profile.totalColumns} columns`;
  card.appendChild(title);
  const meta = document.createElement('div');
  meta.style.cssText = 'margin:5px 0 10px;color:#607086';
  meta.textContent = `${profile.duplicateRows} duplicate rows in profiled rows · statistics use ${profile.profiledRows.toLocaleString()} of ${profile.rows.toLocaleString()} rows and ${profile.columns.length} of ${profile.totalColumns} columns`;
  card.appendChild(meta);
  profile.columns.forEach(col => {
    const section = document.createElement('div');
    section.style.cssText = 'padding:8px 0;border-top:1px solid #edf1f6';
    const heading = document.createElement('div');
    heading.style.cssText = 'font-weight:700;margin-bottom:3px';
    heading.textContent = `${col.name} · ${col.type} · ${col.missing} missing · ${col.unique} unique`;
    section.appendChild(heading);
    if (col.type === 'numeric' && col.histogram) {
      const summary = document.createElement('div');
      summary.style.color = '#607086';
      summary.textContent = `mean ${col.mean} · median ${col.median} · SD ${col.std} · skewness ${col.skewness} · range ${col.min}–${col.max} · IQR outliers ${col.outliers}`;
      section.appendChild(summary);
      const max = Math.max(1, ...col.histogram);
      const chart = document.createElement('div');
      chart.setAttribute('role', 'img');
      chart.setAttribute('aria-label', `Histogram of ${col.name}`);
      chart.style.cssText = 'height:68px;display:flex;align-items:flex-end;gap:3px;margin-top:8px;padding:0 2px';
      col.histogram.forEach((count, i) => {
        const bar = document.createElement('div');
        bar.title = `Bin ${i + 1}: ${count} rows`;
        bar.style.cssText = `flex:1;height:${Math.max(3, Math.round(58 * count / max))}px;background:#7367f0;border-radius:3px 3px 0 0`;
        chart.appendChild(bar);
      });
      section.appendChild(chart);
      const axis = document.createElement('div');
      axis.style.cssText = 'display:flex;justify-content:space-between;color:#607086;font-size:10px';
      axis.append(document.createTextNode(String(col.min)), document.createTextNode(String(col.max)));
      section.appendChild(axis);
    } else if (col.categories) {
      const chart = document.createElement('div');
      chart.style.cssText = 'display:grid;gap:4px;margin-top:7px';
      const max = Math.max(1, ...col.categories.map(x => x.count));
      col.categories.slice(0, 8).forEach(({ label, count }) => {
        const row = document.createElement('div');
        row.style.cssText = 'display:grid;grid-template-columns:minmax(50px,1fr) 3fr auto;gap:6px;align-items:center';
        const name = document.createElement('span'); name.textContent = label.slice(0, 30); name.title = label;
        const track = document.createElement('span'); track.style.cssText = 'height:7px;background:#eef0fa;border-radius:8px;overflow:hidden';
        const fill = document.createElement('span'); fill.style.cssText = `display:block;height:100%;width:${Math.round(100 * count / max)}%;background:#20a88a`; track.appendChild(fill);
        const value = document.createElement('span'); value.textContent = String(count);
        row.append(name, track, value); chart.appendChild(row);
      });
      section.appendChild(chart);
    }
    card.appendChild(section);
  });
  return card;
}

function parseCsvProfile(text: string, filename: string): DatasetProfile {
  const lines: string[][] = [];
  let row: string[] = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted && ch === '"' && text[i + 1] === '"') { field += '"'; i++; }
    else if (ch === '"') quoted = !quoted;
    else if (ch === ',' && !quoted) { row.push(field); field = ''; }
    else if ((ch === '\n' || ch === '\r') && !quoted) {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(field); if (row.some(v => v.trim())) lines.push(row);
      row = []; field = '';
    } else field += ch;
  }
  if (field || row.length) { row.push(field); lines.push(row); }
  if (lines.length < 2) throw new Error('This CSV needs a header and at least one data row.');
  const totalColumns = lines[0].length;
  const headers = lines[0].map((h, i) => h.trim() || `Column ${i + 1}`).slice(0, 40);
  const rows = lines.slice(1, 20001).map(values => headers.map((_, i) => (values[i] ?? '').trim()));
  const columns = headers.map((name, index) => {
    const values = rows.map(r => r[index]);
    const present = values.filter(v => v !== '' && !/^(na|n\/a|null|nan)$/i.test(v));
    const nums = present.map(Number);
    const numeric = present.length > 0 && nums.every(Number.isFinite);
    const counts = new Map<string, number>(); present.forEach(v => counts.set(v, (counts.get(v) ?? 0) + 1));
    const base = { name, type: numeric ? 'numeric' as const : 'categorical' as const, missing: values.length - present.length, unique: counts.size };
    if (!numeric) return { ...base, categories: [...counts].map(([label, count]) => ({ label: label.slice(0, 80), count })).sort((a, b) => b.count - a.count).slice(0, 8) };
    const sorted = [...nums].sort((a, b) => a - b), mean = nums.reduce((a, b) => a + b, 0) / nums.length;
    const variance = nums.reduce((a, b) => a + (b - mean) ** 2, 0) / nums.length;
    const sd = Math.sqrt(variance);
    const skew = sd ? nums.reduce((a, b) => a + ((b - mean) / sd) ** 3, 0) / nums.length : 0;
    const min = sorted[0], max = sorted[sorted.length - 1], bins = Array(12).fill(0) as number[];
    nums.forEach(v => bins[max === min ? 0 : Math.min(11, Math.floor((v - min) / (max - min) * 12))]++);
    const median = sorted.length % 2 ? sorted[(sorted.length - 1) / 2] : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2;
    const q1 = sorted[Math.floor((sorted.length - 1) * 0.25)], q3 = sorted[Math.floor((sorted.length - 1) * 0.75)];
    const lower = q1 - 1.5 * (q3 - q1), upper = q3 + 1.5 * (q3 - q1);
    const outliers = nums.filter(v => v < lower || v > upper).length;
    return { ...base, mean: +mean.toPrecision(5), median: +median.toPrecision(5), std: +sd.toPrecision(5), skewness: +skew.toPrecision(4), min, max, outliers, histogram: bins };
  });
  const signatures = new Set<string>(); let duplicateRows = 0;
  rows.forEach(r => { const key = JSON.stringify(r); if (signatures.has(key)) duplicateRows++; signatures.add(key); });
  return { filename, rows: lines.length - 1, profiledRows: rows.length, totalColumns, columns, duplicateRows };
}

function injectChatStyles(): void {
  if (document.getElementById('mm-chatbot-styles')) {
    const existing = document.getElementById('mm-chatbot-styles');
    if (existing) existing.remove();
  }
  const style = document.createElement('style');
  style.id = 'mm-chatbot-styles';
  style.textContent = `
    /* ═══════════════════════════════════════════════
       AI CHATBOT PANEL — AI Assistant Matching Theme
    ═══════════════════════════════════════════════ */
    .mm-chatbot-root {
      display: flex;
      flex-direction: column;
      height: 100%;
      min-width: 0;
      background: var(--ml-assistant-panel-bg, #f5f6f8);
      color: var(--ml-assistant-text, #253041);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      overflow: hidden;
      position: relative;
      border-left: 1px solid var(--ml-assistant-border, #dfe3ea);
      container-name: mm-chatbot;
      container-type: inline-size;
    }

    .mm-chatbot-drop-overlay {
      position: absolute;
      inset: 10px;
      z-index: 20;
      display: none;
      align-items: center;
      justify-content: center;
      border: 2px dashed var(--ml-assistant-accent, #6d7cff);
      border-radius: 14px;
      background: rgba(238, 242, 255, 0.94);
      color: #4338ca;
      font-size: 14px;
      font-weight: 700;
      pointer-events: none;
    }

    .mm-chatbot-root.mm-chatbot-dragging-files .mm-chatbot-drop-overlay { display: flex; }

    /* Header matching AI Assistant */
    .mm-chatbot-header {
      flex-shrink: 0;
      padding: 14px 14px 10px;
      background: var(--ml-assistant-card-bg, #ffffff);
      border-bottom: 1px solid var(--ml-assistant-border, #dfe3ea);
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .mm-chatbot-title-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      min-width: 0;
    }

    .mm-chatbot-title {
      min-width: 0;
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--ml-assistant-text, #253041);
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
    }

    .mm-chatbot-title-icon {
      font-size: 18px;
      line-height: 1;
    }

    /* Provider Switch styled like AI Assistant tabs / buttons */
    .mm-chatbot-provider-switch {
      display: flex;
      align-items: center;
      flex-shrink: 0;
      gap: 6px;
      background: var(--ml-assistant-panel-bg, #f5f6f8);
      padding: 3px;
      border-radius: 8px;
      border: 1px solid var(--ml-assistant-border, #dfe3ea);
    }

    .mm-chatbot-provider-btn {
      min-width: 0;
      padding: 4px 10px;
      border-radius: 6px;
      border: 1px solid transparent;
      background: transparent;
      color: var(--ml-assistant-muted, #5d6b80);
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .mm-chatbot-provider-btn:hover:not(.active-ollama):not(.active-gemini) {
      color: var(--ml-assistant-text, #253041);
      background: rgba(255, 255, 255, 0.7);
    }

    .mm-chatbot-provider-btn.active-ollama {
      background: var(--ml-assistant-card-bg, #ffffff);
      border-color: var(--ml-assistant-border, #dfe3ea);
      color: #6b21a8;
      box-shadow: 0 1px 3px var(--ml-assistant-shadow, rgba(31, 41, 55, 0.08));
    }

    .mm-chatbot-provider-btn.active-gemini {
      background: var(--ml-assistant-card-bg, #ffffff);
      border-color: var(--ml-assistant-border, #dfe3ea);
      color: #173ea5;
      box-shadow: 0 1px 3px var(--ml-assistant-shadow, rgba(31, 41, 55, 0.08));
    }

    /* Status row matching AI Assistant */
    .mm-chatbot-status-bar {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .mm-chatbot-status-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      border-radius: 999px;
      padding: 4px 10px;
      font-size: 11px;
      font-weight: 600;
      background: var(--ml-assistant-success-bg, #dff5eb);
      color: var(--ml-assistant-success-text, #1d7b54);
      border: 1px solid transparent;
    }

    .mm-chatbot-status-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #10b981;
    }

    .mm-chatbot-status-pill.offline {
      background: var(--ml-assistant-warn-bg, #fdf0d5);
      color: var(--ml-assistant-warn-text, #9c6b11);
    }

    .mm-chatbot-status-pill.offline .mm-chatbot-status-dot {
      background: #f59e0b;
    }

    /* Context row matching AI Assistant secondary controls */
    .mm-chatbot-context-bar {
      flex-shrink: 0;
      padding: 7px 14px;
      background: var(--ml-assistant-panel-bg, #f5f6f8);
      border-bottom: 1px solid var(--ml-assistant-border, #dfe3ea);
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 11px;
      color: var(--ml-assistant-muted, #5d6b80);
      font-weight: 600;
      flex-wrap: wrap;
    }

    .mm-chatbot-context-chip {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 3px 10px;
      border-radius: 999px;
      background: var(--ml-assistant-card-bg, #ffffff);
      border: 1px solid var(--ml-assistant-border, #dfe3ea);
      color: var(--ml-assistant-text, #253041);
      font-size: 11px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s ease;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
    }

    .mm-chatbot-context-chip:hover {
      background: var(--ml-assistant-accent-soft, #eef1ff);
      border-color: var(--ml-assistant-accent, #6d7cff);
      color: var(--ml-assistant-accent, #6d7cff);
    }

    /* Messages thread */
    .mm-chatbot-messages {
      flex: 1;
      overflow-y: auto;
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      background: var(--ml-assistant-panel-bg, #f5f6f8);
      scroll-behavior: smooth;
      min-width: 0;
    }

    .mm-chatbot-messages::-webkit-scrollbar {
      width: 5px;
    }
    .mm-chatbot-messages::-webkit-scrollbar-track {
      background: transparent;
    }
    .mm-chatbot-messages::-webkit-scrollbar-thumb {
      background: var(--ml-assistant-border, #dfe3ea);
      border-radius: 99px;
    }
    .mm-chatbot-messages::-webkit-scrollbar-thumb:hover {
      background: #cbd5e1;
    }

    /* Welcome / Empty State matching AI Assistant */
    .mm-chat-welcome {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 14px;
      padding: 24px 16px;
      text-align: center;
      background: var(--ml-assistant-card-bg, #ffffff);
      border: 1px solid var(--ml-assistant-border, #dfe3ea);
      border-radius: 12px;
      box-shadow: 0 1px 3px var(--ml-assistant-shadow, rgba(31, 41, 55, 0.05));
      margin: auto 0;
    }

    .mm-chat-welcome-icon {
      font-size: 36px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: var(--ml-assistant-accent-soft, #eef1ff);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--ml-assistant-accent, #6d7cff);
    }

    .mm-chat-welcome-title {
      font-size: 15px;
      font-weight: 700;
      color: var(--ml-assistant-text, #253041);
      margin: 0;
    }

    .mm-chat-welcome-sub {
      font-size: 12px;
      color: var(--ml-assistant-muted, #5d6b80);
      line-height: 1.5;
      max-width: 260px;
      margin: 0;
    }

    .mm-chat-suggestions {
      display: flex;
      flex-direction: column;
      gap: 6px;
      width: 100%;
      margin-top: 6px;
    }

    .mm-chat-suggestion-chip {
      padding: 9px 12px;
      border-radius: 8px;
      border: 1px solid var(--ml-assistant-border, #dfe3ea);
      background: var(--ml-assistant-panel-bg, #f8fafc);
      color: var(--ml-assistant-text, #253041);
      font-size: 11.5px;
      font-weight: 500;
      cursor: pointer;
      text-align: left;
      transition: all 0.15s ease;
      line-height: 1.4;
    }

    .mm-chat-suggestion-chip:hover {
      border-color: var(--ml-assistant-accent, #6d7cff);
      background: var(--ml-assistant-accent-soft, #eef1ff);
      color: #312e81;
      transform: translateX(2px);
    }

    /* Message Bubbles */
    .mm-chat-msg {
      display: flex;
      gap: 9px;
      max-width: 100%;
      min-width: 0;
    }

    .mm-chat-msg-user {
      flex-direction: row-reverse;
      align-self: flex-end;
    }

    .mm-chat-msg-assistant {
      align-self: flex-start;
    }

    .mm-chat-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      flex-shrink: 0;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }

    .mm-chat-avatar-user {
      background: #e0e7ff;
      border: 1px solid #c7d2fe;
      color: #4338ca;
    }

    .mm-chat-avatar-assistant {
      background: var(--ml-assistant-accent-soft, #eef1ff);
      border: 1px solid rgba(109, 124, 255, 0.3);
      color: var(--ml-assistant-accent, #6d7cff);
    }

    .mm-chat-bubble-container {
      display: flex;
      flex-direction: column;
      gap: 3px;
      max-width: calc(100% - 38px);
      min-width: 0;
    }

    .mm-chat-bubble-header {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 10.5px;
      color: var(--ml-assistant-muted, #5d6b80);
      padding: 0 3px;
    }

    .mm-chat-bubble-header-user {
      justify-content: flex-end;
    }

    .mm-chat-sender-name {
      font-weight: 700;
      color: var(--ml-assistant-text, #253041);
    }

    .mm-chat-provider-badge {
      display: inline-flex;
      align-items: center;
      padding: 1px 6px;
      border-radius: 999px;
      font-size: 9.5px;
      font-weight: 600;
    }

    .mm-chat-badge-gemini {
      background: #edf4ff;
      border: 1px solid #d3e3ff;
      color: #173ea5;
    }

    .mm-chat-badge-ollama {
      background: #f5f3ff;
      border: 1px solid #ddd6fe;
      color: #6b21a8;
    }

    .mm-chat-time {
      font-size: 10px;
      color: #94a3b8;
    }

    /* Bubble bodies matching AI Assistant Cards */
    .mm-chat-bubble {
      padding: 11px 13px;
      border-radius: 10px;
      font-size: 12px;
      line-height: 1.55;
      word-break: break-word;
    }

    .mm-chat-bubble-user {
      background: var(--ml-assistant-accent-soft, #eef1ff);
      border: 1px solid #d3e3ff;
      border-top-right-radius: 2px;
      color: #1e1b4b;
      box-shadow: 0 1px 2px rgba(109, 124, 255, 0.06);
    }

    .mm-chat-bubble-assistant {
      background: var(--ml-assistant-card-bg, #ffffff);
      border: 1px solid var(--ml-assistant-border, #dfe3ea);
      border-top-left-radius: 2px;
      color: var(--ml-assistant-text, #253041);
      box-shadow: 0 1px 3px var(--ml-assistant-shadow, rgba(31, 41, 55, 0.06));
    }

    .mm-chat-bubble-error {
      background: var(--ml-assistant-error-bg, #fff1f1) !important;
      border: 1px solid rgb(163 61 77 / 20%) !important;
      color: var(--ml-assistant-error-text, #a33d4d) !important;
    }

    /* Message content */
    .mm-chat-msg-content {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .mm-chat-text-seg {
      color: inherit;
      font-size: 12px;
      line-height: 1.6;
    }

    .mm-chat-text-seg strong {
      color: #0f172a;
      font-weight: 700;
    }

    .mm-chat-text-seg em {
      color: #4338ca;
    }

    .mm-chat-inline-code {
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      padding: 1px 5px;
      font-family: 'Fira Code', Menlo, Monaco, Consolas, monospace;
      font-size: 11px;
      color: #0f172a;
    }

    /* Code block matching AI Assistant style */
    .mm-chat-code-block {
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid #cbd5e1;
      background: #1e293b;
      margin: 4px 0;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .mm-chat-code-lang {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 5px 10px;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
    }

    .mm-chat-code-lang span {
      font-size: 10px;
      color: #475569;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }

    .mm-chat-copy-btn {
      font-size: 10px;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 4px;
      border: 1px solid #cbd5e1;
      background: #ffffff;
      color: #475569;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .mm-chat-copy-btn:hover {
      background: #f1f5f9;
      border-color: #94a3b8;
      color: #1e293b;
    }

    .mm-chat-code-block pre {
      margin: 0;
      padding: 11px 13px;
      overflow-x: auto;
      background: #1e293b;
    }

    .mm-chat-code-block code {
      font-family: 'Fira Code', Menlo, Monaco, Consolas, monospace;
      font-size: 11.5px;
      line-height: 1.55;
      color: #f8fafc;
      white-space: pre;
    }

    /* Typing animation */
    .mm-chat-bubble-streaming {
      padding: 12px 16px;
    }

    .mm-chat-typing-dots {
      display: flex;
      gap: 5px;
      align-items: center;
    }

    .mm-chat-typing-dots span {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--ml-assistant-accent, #6d7cff);
      animation: mm-typing 1.2s infinite;
    }

    .mm-chat-typing-dots span:nth-child(2) { animation-delay: 0.2s; }
    .mm-chat-typing-dots span:nth-child(3) { animation-delay: 0.4s; }

    .mm-chat-stream-cursor {
      display: inline-block;
      height: 1.1em;
      margin-left: 2px;
      border-left: 2px solid var(--ml-assistant-accent, #6d7cff);
      vertical-align: text-bottom;
      animation: mm-cursor-blink 0.8s steps(2, start) infinite;
    }

    @keyframes mm-cursor-blink {
      to { visibility: hidden; }
    }

    @keyframes mm-typing {
      0%, 60%, 100% { transform: translateY(0); opacity: 0.35; }
      30% { transform: translateY(-5px); opacity: 1; }
    }

    /* Input Area matching AI Assistant form inputs */
    .mm-chatbot-input-area {
      flex-shrink: 0;
      padding: 10px 14px 14px;
      border-top: 1px solid var(--ml-assistant-border, #dfe3ea);
      background: var(--ml-assistant-card-bg, #ffffff);
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .mm-chatbot-input-helpers {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      align-items: center;
    }

    .mm-chat-helper-btn {
      padding: 4px 9px;
      border-radius: 6px;
      border: 1px solid var(--ml-assistant-border, #dfe3ea);
      background: var(--ml-assistant-card-bg, #ffffff);
      color: var(--ml-assistant-muted, #5d6b80);
      font-size: 11px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s ease;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .mm-chat-helper-btn:hover {
      border-color: #cbd5e1;
      color: var(--ml-assistant-text, #253041);
      background: var(--ml-assistant-panel-bg, #f8fafc);
    }

    .mm-chatbot-clear-btn {
      padding: 4px 9px;
      border-radius: 6px;
      border: 1px solid rgba(163, 61, 77, 0.2);
      background: #ffffff;
      color: var(--ml-assistant-error-text, #a33d4d);
      font-size: 11px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s ease;
      margin-left: 4px;
      flex: 0 0 auto;
      white-space: nowrap;
      scroll-snap-align: end;
    }

    .mm-chatbot-clear-btn:hover {
      background: #fff1f1;
      border-color: rgba(163, 61, 77, 0.4);
    }

    .mm-chatbot-input-row {
      display: flex;
      gap: 8px;
      align-items: flex-end;
      min-width: 0;
    }

    .mm-chatbot-add-file-btn {
      width: 38px;
      height: 38px;
      flex: 0 0 38px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--ml-assistant-border, #dfe3ea);
      border-radius: 8px;
      background: #fff;
      color: #475569;
      font-size: 22px;
      line-height: 1;
      cursor: pointer;
    }

    .mm-chatbot-add-file-btn:hover,
    .mm-chatbot-add-file-btn:focus-visible {
      border-color: var(--ml-assistant-accent, #6d7cff);
      color: #4338ca;
      background: #f5f6ff;
    }

    .mm-chatbot-textarea {
      flex: 1;
      min-width: 0;
      background: #ffffff;
      border: 1px solid var(--ml-assistant-border, #dfe3ea);
      border-radius: 8px;
      color: var(--ml-assistant-text, #253041);
      font-size: 12px;
      padding: 9px 12px;
      resize: none;
      outline: none;
      font-family: inherit;
      line-height: 1.45;
      max-height: 120px;
      min-height: 38px;
      box-sizing: border-box;
      transition: border-color 0.15s, box-shadow 0.15s;
    }

    .mm-chatbot-textarea:focus {
      border-color: var(--ml-assistant-accent, #6d7cff);
      box-shadow: 0 0 0 3px rgba(109, 124, 255, 0.16);
    }

    .mm-chatbot-textarea::placeholder {
      color: #94a3b8;
    }

    /* Send button matching .ml-assistant-cta-button */
    .mm-chatbot-send-btn {
      width: 38px;
      height: 38px;
      border-radius: 8px;
      border: 1px solid var(--ml-assistant-accent, #6d7cff);
      background: var(--ml-assistant-accent, #6d7cff);
      color: #ffffff;
      font-size: 14px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease;
      flex-shrink: 0;
      box-shadow: 0 1px 2px rgba(109, 124, 255, 0.2);
    }

    .mm-chatbot-send-btn:hover:not(:disabled) {
      background: #5b6aff;
      border-color: #5b6aff;
      box-shadow: 0 2px 4px rgba(109, 124, 255, 0.3);
    }

    .mm-chatbot-send-btn:disabled {
      opacity: 0.45;
      cursor: not-allowed;
      box-shadow: none;
    }

    .mm-chatbot-send-btn.gemini-mode {
      background: #2563eb;
      border-color: #2563eb;
    }

    .mm-chatbot-send-btn.gemini-mode:hover:not(:disabled) {
      background: #1d4ed8;
      border-color: #1d4ed8;
    }

    /* Model Advisor inspired refinement: clearer hierarchy, spacing, and action affordances. */
    .mm-chatbot-root {
      background: #f4f6fb;
      color: #25324a;
    }

    .mm-chatbot-header {
      padding: 11px 16px 10px;
      gap: 7px;
      background: #fff;
      box-shadow: 0 2px 8px rgba(28, 39, 72, 0.035);
      z-index: 1;
    }

    .mm-chatbot-title {
      font-size: 16px;
      letter-spacing: -0.02em;
    }

    .mm-chatbot-title-icon {
      display: inline-flex;
      width: 30px;
      height: 30px;
      align-items: center;
      justify-content: center;
      border-radius: 9px;
      background: #eeedff;
      color: #5145cd;
      font-size: 16px;
    }

    .mm-chatbot-provider-switch {
      padding: 4px;
      border-radius: 10px;
      background: #f5f6fb;
    }

    .mm-chatbot-provider-btn {
      min-height: 32px;
      padding: 6px 11px;
      font-size: 12px;
      border-radius: 7px;
    }

    .mm-chatbot-status-pill {
      padding: 4px 9px;
      font-size: 11px;
      background: #e9f8f0;
      color: #17764d;
      border-color: #d4f0e1;
    }

    .mm-chatbot-context-bar {
      min-height: 0;
      margin-left: auto;
      padding: 0;
      background: transparent;
      font-size: 11px;
      white-space: nowrap;
    }

    .mm-chatbot-context-bar > span:first-child { color: #6a778d; }

    .mm-chatbot-status-bar {
      justify-content: flex-start;
      gap: 7px;
      min-height: 30px;
    }

    .mm-chatbot-context-chip {
      min-height: 28px;
      padding: 4px 10px;
      font-size: 11.5px;
      border-radius: 7px;
    }

    .mm-chatbot-messages {
      padding: 18px 20px;
      gap: 18px;
      background:
        radial-gradient(ellipse at 10% 0%, rgba(109, 91, 230, 0.035), transparent 38%),
        #f4f6fb;
    }

    .mm-chat-msg { gap: 10px; }
    .mm-chat-avatar { width: 32px; height: 32px; font-size: 15px; }
    .mm-chat-bubble-container { gap: 5px; }
    .mm-chat-bubble-header { font-size: 11px; padding-inline: 4px; }
    .mm-chat-sender-name { font-size: 12px; }
    .mm-chat-provider-badge { padding: 2px 7px; font-size: 10px; }

    .mm-chat-msg-user .mm-chat-bubble-container {
      max-width: min(86%, 720px);
    }

    .mm-chat-bubble {
      padding: 14px 16px;
      border-radius: 12px;
      font-size: 14px;
      line-height: 1.7;
    }

    .mm-chat-bubble-user {
      background: #eeedff;
      border-color: #dcd9ff;
      border-top-right-radius: 4px;
      color: #282451;
    }

    .mm-chat-bubble-assistant {
      border-color: #e1e6ef;
      border-left: 3px solid #7062e8;
      border-top-left-radius: 4px;
      box-shadow: 0 3px 12px rgba(26, 39, 73, 0.055);
    }

    .mm-chat-bubble-error {
      border-left-color: #d44f5d !important;
    }

    .mm-chat-msg-content { gap: 11px; }
    .mm-chat-text-seg {
      margin: 0;
      color: #35435a;
      font-size: 14px;
      line-height: 1.72;
    }

    .mm-chat-text-seg strong { color: #1b2940; }
    .mm-chat-text-seg em { color: #5145cd; }

    .mm-chat-heading {
      margin: 5px 0 0;
      color: #202d45;
      font-size: 15px;
      line-height: 1.4;
      font-weight: 750;
      letter-spacing: -0.01em;
    }

    .mm-chat-heading:first-child { margin-top: 0; }
    .mm-chat-heading + .mm-chat-text-seg { margin-top: -4px; }

    .mm-chat-list {
      margin: -2px 0 0;
      padding-left: 23px;
      color: #35435a;
      font-size: 14px;
      line-height: 1.7;
    }

    .mm-chat-list li { padding-left: 3px; margin: 5px 0; }
    .mm-chat-list li::marker { color: #6256d7; font-weight: 700; }

    .mm-chat-inline-code {
      padding: 2px 6px;
      border-radius: 5px;
      background: #f1f3f9;
      border-color: #e1e5ee;
      color: #352f7c;
      font-size: 0.9em;
    }

    .mm-chat-code-block {
      margin: 3px 0;
      border-radius: 10px;
      border-color: #d5dce8;
      box-shadow: 0 3px 10px rgba(16, 24, 40, 0.12);
    }

    .mm-chat-code-lang {
      min-height: 35px;
      padding: 5px 11px;
      background: #f7f8fc;
    }

    .mm-chat-code-lang span { font-size: 10.5px; letter-spacing: 0.7px; }

    .mm-chat-copy-btn {
      padding: 4px 9px;
      border-radius: 6px;
      font-size: 11px;
    }

    .mm-chat-code-block pre {
      max-height: 460px;
      padding: 14px 16px;
    }

    .mm-chat-code-block code {
      font-size: 12.5px;
      line-height: 1.62;
    }

    .mm-chat-welcome {
      gap: 13px;
      padding: 30px 24px;
      border-radius: 15px;
      border-color: #e1e6ef;
      box-shadow: 0 5px 20px rgba(26, 39, 73, 0.055);
    }

    .mm-chat-welcome-icon {
      width: 62px;
      height: 62px;
      background: linear-gradient(140deg, #eeedff, #e9f7f1);
    }

    .mm-chat-welcome-title { font-size: 18px; }
    .mm-chat-welcome-sub { max-width: 340px; font-size: 13px; line-height: 1.65; }
    .mm-chat-suggestions { gap: 8px; margin-top: 7px; }

    .mm-chat-suggestion-chip {
      padding: 10px 13px;
      border-radius: 9px;
      background: #f9faff;
      font-size: 12px;
    }

    .mm-chatbot-input-area {
      padding: 11px 16px 14px;
      gap: 10px;
      background: #fff;
      box-shadow: 0 -3px 12px rgba(28, 39, 72, 0.035);
    }

    .mm-chatbot-input-helpers {
      gap: 7px;
      flex-wrap: nowrap;
      overflow-x: auto;
      overflow-y: hidden;
      padding: 2px 2px 7px;
      cursor: grab;
      user-select: none;
      touch-action: pan-x;
      scrollbar-width: thin;
      scrollbar-color: #c8cde0 transparent;
      scroll-snap-type: x proximity;
      overscroll-behavior-x: contain;
    }

    .mm-chatbot-input-helpers::-webkit-scrollbar { height: 5px; }
    .mm-chatbot-input-helpers::-webkit-scrollbar-track { background: #f0f2f8; border-radius: 99px; }
    .mm-chatbot-input-helpers::-webkit-scrollbar-thumb { background: #c8cde0; border-radius: 99px; }
    .mm-chatbot-input-helpers::-webkit-scrollbar-thumb:hover { background: #aeb5cd; }
    .mm-chatbot-input-helpers.is-dragging { cursor: grabbing; scroll-snap-type: none; }

    .mm-chat-helper-btn {
      min-height: 32px;
      padding: 6px 10px;
      flex: 0 0 auto;
      border-radius: 7px;
      background: #fff;
      color: #4e5c72;
      font-size: 11.5px;
      font-weight: 600;
      white-space: nowrap;
      scroll-snap-align: start;
    }

    .mm-chat-helper-btn:hover {
      border-color: #c9c4ff;
      color: #4c42c2;
      background: #f4f3ff;
      transform: translateY(-1px);
    }

    .mm-chatbot-add-file-btn,
    .mm-chatbot-send-btn { width: 42px; height: 42px; flex-basis: 42px; border-radius: 10px; }
    .mm-chatbot-textarea {
      min-height: 42px;
      padding: 10px 13px;
      border-radius: 10px;
      font-size: 13px;
      line-height: 1.5;
    }

    .mm-chatbot-textarea:focus {
      box-shadow: 0 0 0 3px rgba(109, 91, 230, 0.13);
    }

    .mm-chatbot-send-btn {
      background: #594de0;
      border-color: #594de0;
      box-shadow: 0 2px 6px rgba(89, 77, 224, 0.2);
    }

    .mm-chatbot-send-btn:hover:not(:disabled) {
      background: #493fc5;
      border-color: #493fc5;
    }

    .mm-chatbot-root button:focus-visible,
    .mm-chatbot-root textarea:focus-visible {
      outline: 3px solid rgba(89, 77, 224, 0.22);
      outline-offset: 2px;
    }

    @media (prefers-reduced-motion: reduce) {
      .mm-chatbot-root *, .mm-chatbot-root *::before, .mm-chatbot-root *::after {
        scroll-behavior: auto !important;
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }

    @container mm-chatbot (max-width: 380px) {
      .mm-chatbot-header { padding-inline: 10px; }
      .mm-chatbot-title-row { align-items: flex-start; gap: 7px; }
      .mm-chatbot-title {
        flex: 0 1 92px;
        align-items: flex-start;
        line-height: 1.08;
      }
      .mm-chatbot-provider-switch { flex: 1 1 auto; gap: 3px; }
      .mm-chatbot-provider-btn {
        flex: 1 1 0;
        justify-content: center;
        padding: 5px 6px;
        white-space: nowrap;
      }
      .mm-chatbot-context-bar { margin-left: 0; padding: 0; }
      .mm-chatbot-messages { padding: 10px; }
      .mm-chatbot-input-area { padding-inline: 10px; }
      .mm-chatbot-input-helpers { gap: 5px; }
      .mm-chat-helper-btn { flex: 0 0 auto; padding-inline: 7px; }
      .mm-chatbot-clear-btn { margin-left: 4px; }
      .mm-chat-bubble { padding: 11px 12px; font-size: 13px; }
      .mm-chat-text-seg, .mm-chat-list { font-size: 13px; }
      .mm-chat-msg-user .mm-chat-bubble-container { max-width: 90%; }
      .mm-chatbot-add-file-btn, .mm-chatbot-send-btn { width: 38px; height: 38px; flex-basis: 38px; }
    }
  `;
  document.head.appendChild(style);
}

export function createAIChatbotPanel(
  settings: ServerConnection.ISettings,
  getActiveCode: () => string,
  getActiveError: () => { error_type: string; error_message: string; traceback: string; code: string } | null,
  runCodeTrace: CodeTraceRunner,
  loadDecisionTrees: DecisionTreeLoader,
  loadNeuralNetworks: NeuralNetworkLoader,
  loadTrainingSources: TrainingSourceLoader,
  trainModel: ModelTrainingRunner
): HTMLElement {
  injectChatStyles();

  const messages: ChatMessage[] = [];
  let currentProvider: ChatProvider = 'ollama';
  let isTyping = false;
  let attachedDataset: DatasetProfile | null = null;
  let attachedCode = '';
  const conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [];

  // Root
  const root = document.createElement('div');
  root.className = 'mm-chatbot-root';

  // Header
  const header = document.createElement('div');
  header.className = 'mm-chatbot-header';

  const titleRow = document.createElement('div');
  titleRow.className = 'mm-chatbot-title-row';

  const title = document.createElement('div');
  title.className = 'mm-chatbot-title';
  title.innerHTML = '<span class="mm-chatbot-title-icon">💬</span> AI Chatbot';

  const providerSwitch = document.createElement('div');
  providerSwitch.className = 'mm-chatbot-provider-switch';

  const ollamaBtn = document.createElement('button');
  ollamaBtn.className = 'mm-chatbot-provider-btn active-ollama';
  ollamaBtn.title = 'Use local Ollama (offline, private)';
  ollamaBtn.textContent = '🦙 Ollama';

  const geminiBtn = document.createElement('button');
  geminiBtn.className = 'mm-chatbot-provider-btn';
  geminiBtn.title = 'Switch to Google Gemini (cloud)';
  geminiBtn.textContent = '✨ Gemini';

  providerSwitch.append(ollamaBtn, geminiBtn);
  titleRow.append(title, providerSwitch);

  const statusBar = document.createElement('div');
  statusBar.className = 'mm-chatbot-status-bar';

  const localPill = document.createElement('span');
  localPill.className = 'mm-chatbot-status-pill';
  localPill.innerHTML = '<span class="mm-chatbot-status-dot"></span> Ollama (Local AI)';

  const cloudPill = document.createElement('span');
  cloudPill.className = 'mm-chatbot-status-pill';
  cloudPill.innerHTML = '<span class="mm-chatbot-status-dot"></span> Gemini (Cloud AI)';

  statusBar.append(localPill, cloudPill);
  header.append(titleRow, statusBar);

  // Context bar
  const contextBar = document.createElement('div');
  contextBar.className = 'mm-chatbot-context-bar';
  contextBar.innerHTML = '<span>Context:</span>';

  const codeChip = document.createElement('button');
  codeChip.className = 'mm-chatbot-context-chip';
  codeChip.title = 'Paste active cell code into your message';
  codeChip.innerHTML = '📋 Active Cell';

  const errorChip = document.createElement('button');
  errorChip.className = 'mm-chatbot-context-chip';
  errorChip.style.display = 'none';
  errorChip.title = 'Paste last error into your message';
  errorChip.innerHTML = '🐞 Last Error';

  contextBar.append(codeChip, errorChip);
  statusBar.appendChild(contextBar);

  // Messages area
  const messagesArea = document.createElement('div');
  messagesArea.className = 'mm-chatbot-messages';

  // Welcome screen
  const welcome = document.createElement('div');
  welcome.className = 'mm-chat-welcome';
  welcome.innerHTML = `
    <div class="mm-chat-welcome-icon">🤖</div>
    <div class="mm-chat-welcome-title">ModelMind AI Chatbot</div>
    <div class="mm-chat-welcome-sub">Ask me anything — code explanations, debugging help, ML concepts, or anything Python.</div>
  `;

  const suggestions = document.createElement('div');
  suggestions.className = 'mm-chat-suggestions';

  const SAMPLE_QUESTIONS = [
    '💡 Explain active cell code',
    '🐞 How to fix the latest error?',
    '📊 How to visualize data with matplotlib?',
    '⚡ Optimize my code performance',
    '🤖 Recommend best ML model for my data',
  ];

  SAMPLE_QUESTIONS.forEach(q => {
    const chip = document.createElement('button');
    chip.className = 'mm-chat-suggestion-chip';
    chip.textContent = q;
    chip.addEventListener('click', () => {
      let question = q.replace(/^[^\s]+\s/, ''); // remove emoji prefix
      if (q.includes('active cell')) {
        const code = attachedCode || getActiveCode();
        if (code) {
          question = `Explain this code:\n\`\`\`python\n${code}\n\`\`\``;
        }
      } else if (q.includes('latest error')) {
        const err = getActiveError();
        if (err) {
          question = `How do I fix this error?\n${err.error_type}: ${err.error_message}\n\`\`\`python\n${err.code || ''}\n\`\`\``;
        }
      }
      textarea.value = question;
      textarea.dispatchEvent(new Event('input'));
      sendMessage();
    });
    suggestions.appendChild(chip);
  });

  welcome.appendChild(suggestions);
  messagesArea.appendChild(welcome);

  // Input area
  const inputArea = document.createElement('div');
  inputArea.className = 'mm-chatbot-input-area';

  const helpers = document.createElement('div');
  helpers.className = 'mm-chatbot-input-helpers';
  helpers.tabIndex = 0;
  helpers.setAttribute('role', 'toolbar');
  helpers.setAttribute('aria-label', 'Chat tools. Scroll horizontally to see more actions.');

  let helperPointerStartX = 0;
  let helperScrollStart = 0;
  let helperPointerDown = false;
  let helperDidDrag = false;
  let suppressHelperClick = false;
  helpers.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    helperPointerStartX = event.clientX;
    helperScrollStart = helpers.scrollLeft;
    helperPointerDown = true;
    helperDidDrag = false;
  });
  helpers.addEventListener('pointermove', event => {
    if (!helperPointerDown) return;
    const distance = event.clientX - helperPointerStartX;
    if (Math.abs(distance) > 5) {
      helperDidDrag = true;
      if (!helpers.hasPointerCapture(event.pointerId)) helpers.setPointerCapture(event.pointerId);
      helpers.classList.add('is-dragging');
      helpers.scrollLeft = helperScrollStart - distance;
    }
  });
  const finishHelperDrag = (): void => {
    if (!helperPointerDown) return;
    helperPointerDown = false;
    helpers.classList.remove('is-dragging');
    if (helperDidDrag) {
      suppressHelperClick = true;
      window.setTimeout(() => { suppressHelperClick = false; }, 450);
    }
  };
  helpers.addEventListener('pointerup', finishHelperDrag);
  helpers.addEventListener('pointercancel', finishHelperDrag);
  helpers.addEventListener('click', event => {
    if (!suppressHelperClick) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    suppressHelperClick = false;
  }, true);
  helpers.addEventListener('wheel', event => {
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
    helpers.scrollLeft += event.deltaY;
    event.preventDefault();
  }, { passive: false });

  const csvInput = document.createElement('input');
  csvInput.type = 'file';
  csvInput.accept = '.csv,text/csv';
  csvInput.style.display = 'none';
  const codeInput = document.createElement('input');
  codeInput.type = 'file';
  codeInput.accept = '.py,.ipynb,.js,.ts,.jsx,.tsx,.java,.c,.cpp,.go,.rs,.txt,.json,text/plain,application/json';
  codeInput.style.display = 'none';

  function showUploadError(error: unknown, fallback: string): void {
    const msg: ChatMessage = {
      role: 'assistant', timestamp: new Date(), isError: true,
      content: error instanceof Error ? error.message : fallback
    };
    messages.push(msg);
    appendMessage(msg);
  }

  async function handleCsvFile(file: File): Promise<void> {
    try {
      if (file.size > 10 * 1024 * 1024) throw new Error('CSV is larger than 10 MB. Please use a smaller file for chat analysis.');
      const profile = parseCsvProfile(await file.text(), file.name);
      attachedDataset = profile;
      const summary = profile.columns.slice(0, 20).map(col =>
        col.type === 'numeric'
          ? `${col.name}: numeric, mean ${col.mean}, median ${col.median}, skewness ${col.skewness}, missing ${col.missing}`
          : `${col.name}: categorical, ${col.unique} unique values, missing ${col.missing}`
      ).join('\n');
      const msg: ChatMessage = {
        role: 'assistant', timestamp: new Date(), datasetProfile: profile,
        content: `I analyzed **${profile.filename}** locally. The profile includes numeric distributions, skewness, missing values, category frequencies, and duplicate rows.\n\n${summary}`
      };
      messages.push(msg);
      appendMessage(msg);
      if (currentProvider === 'ollama') {
        textarea.value = 'Explain the main patterns in this CSV profile, including distributions, skewness, missing data, category balance, duplicates, unusual values, and practical next steps. Cite the measured values and clearly identify any sample-based results.';
        sendMessage();
      } else {
        const notice: ChatMessage = {
          role: 'assistant', timestamp: new Date(),
          content: 'The CSV profile stays local. Switch the provider to Ollama and ask for an explanation to get a model interpretation of these measurements.'
        };
        messages.push(notice);
        appendMessage(notice);
      }
    } catch (error) {
      showUploadError(error, 'Could not analyze this CSV.');
    }
  }

  async function handleCodeFile(file: File): Promise<void> {
    try {
      if (file.size > 100 * 1024) throw new Error('Code file is larger than 100 KB. Please choose a smaller file.');
      let content = await file.text();
      if (file.name.toLowerCase().endsWith('.ipynb')) {
        const notebook = JSON.parse(content) as { cells?: Array<{ cell_type?: string; source?: string[] | string }> };
        content = (notebook.cells ?? []).filter(cell => cell.cell_type === 'code').map(cell =>
          Array.isArray(cell.source) ? cell.source.join('') : cell.source ?? ''
        ).join('\n\n');
      }
      attachedCode = content.slice(0, 3000);
      const msg: ChatMessage = {
        role: 'assistant', timestamp: new Date(),
        content: `Loaded **${file.name}** (${content.split(/\r?\n/).length} lines). Use **Explain Code** or ask a question. The file stays on this computer; the selected chat provider receives only the first 3,000 characters when you send a message.`
      };
      messages.push(msg);
      appendMessage(msg);
    } catch (error) {
      showUploadError(error, 'Could not read this code file.');
    }
  }

  const csvButton = document.createElement('button');
  csvButton.className = 'mm-chat-helper-btn';
  csvButton.textContent = '📊 Analyze CSV';
  csvButton.addEventListener('click', () => csvInput.click());
  csvInput.addEventListener('change', async () => {
    const file = csvInput.files?.[0];
    csvInput.value = '';
    if (file) await handleCsvFile(file);
  });
  helpers.append(csvButton, csvInput);
  const codeButton = document.createElement('button');
  codeButton.className = 'mm-chat-helper-btn';
  codeButton.textContent = '🧩 Upload Code';
  codeButton.addEventListener('click', () => codeInput.click());
  codeInput.addEventListener('change', async () => {
    const file = codeInput.files?.[0];
    codeInput.value = '';
    if (file) await handleCodeFile(file);
  });
  helpers.append(codeButton, codeInput);

  const helperBtns = [
    { icon: '🌳', label: 'Visualize Tree', action: async () => {
      const msg: ChatMessage = {
        role: 'assistant', timestamp: new Date(), provider: currentProvider,
        content: 'Reading fitted scikit-learn decision trees from the current notebook kernel…'
      };
      messages.push(msg);
      const pending = appendMessage(msg);
      try {
        const trees = await loadDecisionTrees();
        msg.decisionTrees = trees;
        msg.content = trees.length
          ? `Found ${trees.length} fitted decision tree${trees.length === 1 ? '' : 's'} in the current kernel. This view is built from the fitted model.`
          : 'No fitted scikit-learn decision tree was found in the current notebook kernel.';
      } catch (error) {
        msg.isError = true;
        msg.content = error instanceof Error ? error.message : 'Could not inspect fitted decision trees.';
      }
      pending.replaceWith(createMessageBubble(msg, runCodeTrace, getActiveCode, loadDecisionTrees, loadNeuralNetworks, trainModel));
      messagesArea.scrollTop = messagesArea.scrollHeight;
    }},
    { icon: '🧠', label: 'Visualize Neural Network', action: async () => {
      const msg: ChatMessage = {
        role: 'assistant', timestamp: new Date(), provider: currentProvider,
        content: 'Reading fitted scikit-learn MLP networks from the current notebook kernel…'
      };
      messages.push(msg);
      const pending = appendMessage(msg);
      try {
        const networks = await loadNeuralNetworks();
        msg.neuralNetworks = networks;
        msg.content = networks.length
          ? `Found ${networks.length} fitted neural network${networks.length === 1 ? '' : 's'} in the current kernel. The diagram shows the learned layer structure and weights.`
          : 'No fitted scikit-learn MLP neural network was found in the current notebook kernel.';
      } catch (error) {
        msg.isError = true;
        msg.content = error instanceof Error ? error.message : 'Could not inspect fitted neural networks.';
      }
      pending.replaceWith(createMessageBubble(msg, runCodeTrace, getActiveCode, loadDecisionTrees, loadNeuralNetworks, trainModel));
      messagesArea.scrollTop = messagesArea.scrollHeight;
    }},
    { icon: '🏋', label: 'Train ML Model', action: async () => {
      const msg: ChatMessage = {
        role: 'assistant', timestamp: new Date(), provider: currentProvider,
        content: 'Checking the active notebook for prepared training data…'
      };
      messages.push(msg);
      const pending = appendMessage(msg);
      try {
        msg.trainingSources = await loadTrainingSources();
        msg.content = msg.trainingSources.length
          ? `Found ${msg.trainingSources.length} prepared feature/target pair${msg.trainingSources.length === 1 ? '' : 's'}. Choose a model to train locally.`
          : 'No prepared feature/target pair was found in the active kernel.';
      } catch (error) {
        msg.isError = true;
        msg.content = error instanceof Error ? error.message : 'Could not inspect training data in the notebook kernel.';
      }
      pending.replaceWith(createMessageBubble(msg, runCodeTrace, getActiveCode, loadDecisionTrees, loadNeuralNetworks, trainModel));
      messagesArea.scrollTop = messagesArea.scrollHeight;
    }},
    { icon: '🔎', label: 'Visualize Code', action: () => {
      const selectedCell = getActiveCode().trim();
      const code = selectedCell || attachedCode.trim();
      if (!code) {
        showUploadError(new Error('Select a code cell or upload a code file first.'), 'Select a code cell or upload a code file first.');
        return;
      }
      const visualization = createCodeVisualization(code);
      textarea.value = 'Explain this selected Python cell to a beginner. Use exactly these three headings: “What the code shows”, “Why these steps are used”, and “What this does not establish”. Keep each section concise and tie claims to visible code. The source-based diagram is static: this request did not execute the cell. Distinguish calls written in source from results measured at runtime. Do not invent file contents, statistics, model scores, learned splits, weights, predictions, target variables, missingness, bugs, pitfalls, feature relevance, or model evaluation. Treat comments, filenames, and variable names as labels, not measurements. Explain stable library behavior accurately; for example, StandardScaler centers and scales using training-set statistics when fit, and does not remove skewness. Do not add generic workflow advice or suggestions unless I ask for them.';
      adjustTextareaHeight();
      void sendMessage({ activeCode: code, codeVisualization: visualization });
    }},
    { icon: '▶', label: 'Animate Code', action: () => {
      const code = (getActiveCode().trim() || attachedCode).trim();
      if (!code) {
        showUploadError(new Error('Select a code cell or upload a code file first.'), 'Select a code cell or upload a code file first.');
        return;
      }
      const msg: ChatMessage = {
        role: 'assistant', timestamp: new Date(), provider: currentProvider,
        content: 'Confirm Run & trace to capture the executed lines and variable values for this code.',
        animationCode: code,
        animationUsesActiveCell: Boolean(getActiveCode().trim())
      };
      messages.push(msg);
      appendMessage(msg);
    }},
    { icon: '📋', label: 'Paste Code', action: () => {
      const code = attachedCode || getActiveCode();
      if (code) {
        textarea.value += (textarea.value ? '\n' : '') + `\`\`\`python\n${code.slice(0, 3000)}\n\`\`\``;
        adjustTextareaHeight();
        textarea.focus();
      }
    }},
    { icon: '🐞', label: 'Paste Error', action: () => {
      const err = getActiveError();
      if (err) {
        textarea.value += (textarea.value ? '\n' : '') +
          `Error: ${err.error_type}: ${err.error_message}\n` +
          (err.traceback ? `Traceback:\n\`\`\`\n${err.traceback.slice(0, 1000)}\n\`\`\`` : '');
        adjustTextareaHeight();
        textarea.focus();
      }
    }},
    { icon: '📝', label: 'Explain Code', action: () => {
      const code = attachedCode || getActiveCode();
      if (code) {
        textarea.value = `Please explain this code in detail:\n\`\`\`python\n${code.slice(0, 3000)}\n\`\`\``;
        adjustTextareaHeight();
        textarea.focus();
      }
    }},
  ];

  helperBtns.forEach(({ icon, label, action }) => {
    const btn = document.createElement('button');
    btn.className = 'mm-chat-helper-btn';
    btn.textContent = `${icon} ${label}`;
    btn.addEventListener('click', action);
    helpers.appendChild(btn);
  });

  const clearBtn = document.createElement('button');
  clearBtn.className = 'mm-chatbot-clear-btn';
  clearBtn.textContent = '🗑 Clear';
  clearBtn.addEventListener('click', () => {
    messages.length = 0;
    conversationHistory.length = 0;
    messagesArea.replaceChildren(welcome);
  });
  helpers.appendChild(clearBtn);

  const inputRow = document.createElement('div');
  inputRow.className = 'mm-chatbot-input-row';

  const addFileInput = document.createElement('input');
  addFileInput.type = 'file';
  addFileInput.accept = `${csvInput.accept},${codeInput.accept}`;
  addFileInput.style.display = 'none';
  addFileInput.setAttribute('aria-label', 'Choose a CSV or code file');

  const addFileButton = document.createElement('button');
  addFileButton.type = 'button';
  addFileButton.className = 'mm-chatbot-add-file-btn';
  addFileButton.textContent = '+';
  addFileButton.title = 'Attach a CSV or code file';
  addFileButton.setAttribute('aria-label', 'Attach a CSV or code file');
  addFileButton.addEventListener('click', () => addFileInput.click());

  async function handleAttachedFiles(files: FileList | File[]): Promise<void> {
    const selectedFiles = Array.from(files);
    if (selectedFiles.length > 1) {
      showUploadError(new Error('Add one file at a time so I can keep each file’s analysis separate.'), 'Please add one file at a time.');
      return;
    }
    const file = selectedFiles[0];
    if (!file) return;
    const lowerName = file.name.toLowerCase();
    if (lowerName.endsWith('.csv') || file.type === 'text/csv') {
      await handleCsvFile(file);
      return;
    }
    const codeExtensions = /\.(py|ipynb|js|ts|jsx|tsx|java|c|cpp|go|rs|txt|json)$/i;
    if (codeExtensions.test(lowerName) || file.type === 'text/plain' || file.type === 'application/json') {
      await handleCodeFile(file);
      return;
    }
    showUploadError(new Error('Unsupported file type. Add a CSV or a code/text file such as .py, .ipynb, .js, .ts, or .txt.'), 'Unsupported file type.');
  }

  addFileInput.addEventListener('change', async () => {
    const files = addFileInput.files;
    addFileInput.value = '';
    if (files) await handleAttachedFiles(files);
  });

  const textarea = document.createElement('textarea');
  textarea.className = 'mm-chatbot-textarea';
  textarea.placeholder = 'Ask anything about code, ML, or Python... (Shift+Enter for newline)';
  textarea.rows = 1;

  const sendBtn = document.createElement('button');
  sendBtn.className = 'mm-chatbot-send-btn';
  sendBtn.title = 'Send message';
  sendBtn.innerHTML = '➤';

  inputRow.append(addFileButton, addFileInput, textarea, sendBtn);
  inputArea.append(helpers, inputRow);

  function adjustTextareaHeight(): void {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  }

  textarea.addEventListener('input', adjustTextareaHeight);

  // Provider switching
  function switchProvider(p: ChatProvider): void {
    currentProvider = p;
    if (p === 'ollama') {
      ollamaBtn.className = 'mm-chatbot-provider-btn active-ollama';
      geminiBtn.className = 'mm-chatbot-provider-btn';
      localPill.style.borderColor = 'rgba(107, 33, 168, 0.4)';
      localPill.style.background = '#f3e8ff';
      localPill.style.color = '#6b21a8';
      cloudPill.style.borderColor = 'transparent';
      cloudPill.style.background = 'var(--ml-assistant-success-bg, #dff5eb)';
      cloudPill.style.color = 'var(--ml-assistant-success-text, #1d7b54)';
      sendBtn.className = 'mm-chatbot-send-btn';
    } else {
      geminiBtn.className = 'mm-chatbot-provider-btn active-gemini';
      ollamaBtn.className = 'mm-chatbot-provider-btn';
      cloudPill.style.borderColor = 'rgba(30, 64, 175, 0.4)';
      cloudPill.style.background = '#eff6ff';
      cloudPill.style.color = '#1e40af';
      localPill.style.borderColor = 'transparent';
      localPill.style.background = 'var(--ml-assistant-success-bg, #dff5eb)';
      localPill.style.color = 'var(--ml-assistant-success-text, #1d7b54)';
      sendBtn.className = 'mm-chatbot-send-btn gemini-mode';
    }
  }

  // Refresh status from server
  async function refreshPlatformStatus(): Promise<void> {
    try {
      const keyStatus = await requestAPI<{
        configured: boolean;
        source: 'desktop' | 'environment' | null;
      }>('api/settings/gemini-key', settings);

      if (keyStatus.configured) {
        cloudPill.classList.remove('offline');
        cloudPill.innerHTML = '<span class="mm-chatbot-status-dot"></span> Gemini configured';
      } else {
        cloudPill.classList.add('offline');
        cloudPill.innerHTML = '<span class="mm-chatbot-status-dot"></span> Gemini unconfigured';
      }
    } catch {
      cloudPill.classList.add('offline');
      cloudPill.innerHTML = '<span class="mm-chatbot-status-dot"></span> Gemini unavailable';
    }

    try {
      const ollama = await requestAPI<{
        status: string;
        model_status: 'available' | 'missing' | 'unavailable' | 'not_checked';
      }>('api/local-ai/status', settings);

      if (ollama.status === 'connected' && ollama.model_status === 'available') {
        localPill.classList.remove('offline');
        localPill.innerHTML = '<span class="mm-chatbot-status-dot"></span> Ollama (Local AI)';
      } else {
        localPill.classList.add('offline');
        localPill.innerHTML = '<span class="mm-chatbot-status-dot"></span> Ollama offline';
      }
    } catch {
      localPill.classList.add('offline');
      localPill.innerHTML = '<span class="mm-chatbot-status-dot"></span> Ollama offline';
    }
    // Re-apply highlight to currently selected provider
    switchProvider(currentProvider);
  }

  void refreshPlatformStatus();
  window.addEventListener('modelmind:gemini-key-updated', () => {
    void refreshPlatformStatus();
  });

  ollamaBtn.addEventListener('click', () => switchProvider('ollama'));
  geminiBtn.addEventListener('click', () => switchProvider('gemini'));

  // Context chips
  codeChip.addEventListener('click', () => {
    const code = getActiveCode();
    if (code) {
      textarea.value += (textarea.value ? '\n' : '') + `\`\`\`python\n${code.slice(0, 3000)}\n\`\`\``;
      adjustTextareaHeight();
      textarea.focus();
    }
  });

  errorChip.addEventListener('click', () => {
    const err = getActiveError();
    if (err) {
      const errText = `Error: ${err.error_type}: ${err.error_message}\n\`\`\`\n${err.traceback.slice(0, 1000)}\n\`\`\``;
      textarea.value += (textarea.value ? '\n' : '') + errText;
      adjustTextareaHeight();
      textarea.focus();
    }
  });

  function appendMessage(msg: ChatMessage): HTMLElement {
    // Remove welcome screen on first message
    const welcomeEl = messagesArea.querySelector('.mm-chat-welcome');
    if (welcomeEl) {
      welcomeEl.remove();
    }

    const el = createMessageBubble(msg, runCodeTrace, getActiveCode, loadDecisionTrees, loadNeuralNetworks, trainModel);
    messagesArea.appendChild(el);
    messagesArea.scrollTop = messagesArea.scrollHeight;
    return el;
  }

  async function sendMessage(options: {
    activeCode?: string;
    codeVisualization?: CodeVisualizationSpec;
  } = {}): Promise<void> {
    const text = textarea.value.trim();
    if (!text || isTyping) return;

    isTyping = true;
    sendBtn.disabled = true;
    textarea.value = '';
    adjustTextareaHeight();

    // Add user message
    const userMsg: ChatMessage = { role: 'user', content: text, timestamp: new Date() };
    messages.push(userMsg);
    appendMessage(userMsg);

    // Update history
    conversationHistory.push({ role: 'user', content: text });

    // Show typing indicator
    const typingMsg: ChatMessage = { role: 'assistant', content: '', provider: currentProvider, timestamp: new Date(), isStreaming: true };
    const typingEl = appendMessage(typingMsg);
    const codeContext = options.activeCode ?? (attachedCode || getActiveCode());

    try {
      const result = await requestChatAPI(settings, {
        message: text,
        provider: currentProvider,
        history: conversationHistory.slice(-10), // last 5 exchanges
        context: {
          active_code: codeContext.slice(0, 3000),
          dataset_profile: attachedDataset,
          source_grounded_visualization: Boolean(options.codeVisualization),
          source_evidence: options.codeVisualization ? {
            facts: options.codeVisualization.sourceFacts,
            limits: options.codeVisualization.limits
          } : undefined,
        }
      });

      if (result.status === 'replied' && result.reply) {
        const replyMsg: ChatMessage = {
          role: 'assistant',
          content: result.reply,
          provider: result.provider || currentProvider,
          timestamp: new Date(),
          codeProfile: /explain|walk through|what does this code|how does this code/i.test(text) && codeContext
            ? summarizeCodeStructure(codeContext)
            : undefined,
          codeVisualization: options.codeVisualization
        };
        const streamed = await streamAssistantReplyInPlace(typingEl, result.reply, messagesArea);
        if (!streamed) return;
        typingEl.replaceWith(createMessageBubble(replyMsg, runCodeTrace, getActiveCode, loadDecisionTrees, loadNeuralNetworks, trainModel));
        messages.push(replyMsg);
        conversationHistory.push({ role: 'assistant', content: result.reply });
      } else {
        typingEl.remove();
        conversationHistory.pop(); // Remove un-replied user message on error
        let errText = 'I could not respond right now.';
        if (result.status === 'model_missing') {
          errText = '🦙 Ollama model not found. Please install it first via the AI Assistant.';
        } else if (result.status === 'ollama_unavailable') {
          errText = '🦙 Ollama is not running. Start Ollama, or switch to Gemini.';
        } else if (result.status === 'chat_unavailable') {
          errText = '🦙 Ollama is running, but it could not finish this reply. Try again; shorter prompts usually respond faster.';
        } else if (result.status === 'context_too_large') {
          errText = 'This file profile is too large to send to the local model. Try a smaller CSV or ask about fewer columns.';
        } else if (result.status === 'model_status_unavailable') {
          errText = '🦙 Ollama is responding, but the selected model is not ready. Check the AI Assistant model status and try again.';
        } else if (result.status === 'gemini_unconfigured') {
          errText =
            '✨ Open the 🔑 API Key tab in the right sidebar to save your Gemini key.';
        } else if (result.status === 'gemini_unavailable') {
          errText = result.message ? `✨ ${result.message}` : '✨ Gemini is temporarily unavailable. Try again or switch to Ollama.';
        } else if (result.message) {
          errText = result.message;
        }
        const errMsg: ChatMessage = {
          role: 'assistant',
          content: errText,
          timestamp: new Date(),
          isError: true,
          provider: currentProvider,
          codeVisualization: options.codeVisualization
        };
        messages.push(errMsg);
        appendMessage(errMsg);
      }
    } catch (e) {
      typingEl.remove();
      conversationHistory.pop(); // Remove un-replied user message on error
      const errMsg: ChatMessage = {
        role: 'assistant',
        content: '⚠️ Network error — could not reach the backend. Is the platform running?',
        timestamp: new Date(),
        isError: true,
        provider: currentProvider,
        codeVisualization: options.codeVisualization
      };
      messages.push(errMsg);
      appendMessage(errMsg);
    } finally {
      isTyping = false;
      sendBtn.disabled = false;
      textarea.focus();
    }
  }

  sendBtn.addEventListener('click', () => { void sendMessage(); });

  textarea.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  });

  // Update error chip visibility based on active error
  setInterval(() => {
    const err = getActiveError();
    errorChip.style.display = err ? 'inline-flex' : 'none';
  }, 2000);

  const dropOverlay = document.createElement('div');
  dropOverlay.className = 'mm-chatbot-drop-overlay';
  dropOverlay.textContent = '＋ Drop one CSV or code file to attach';
  root.append(header, messagesArea, inputArea, dropOverlay);

  let fileDragDepth = 0;
  root.addEventListener('dragenter', (event: DragEvent) => {
    if (!Array.from(event.dataTransfer?.types ?? []).includes('Files')) return;
    event.preventDefault();
    fileDragDepth += 1;
    root.classList.add('mm-chatbot-dragging-files');
  });
  root.addEventListener('dragover', (event: DragEvent) => {
    if (!Array.from(event.dataTransfer?.types ?? []).includes('Files')) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
  });
  root.addEventListener('dragleave', (event: DragEvent) => {
    if (!Array.from(event.dataTransfer?.types ?? []).includes('Files')) return;
    event.preventDefault();
    fileDragDepth = Math.max(0, fileDragDepth - 1);
    if (fileDragDepth === 0) root.classList.remove('mm-chatbot-dragging-files');
  });
  root.addEventListener('drop', event => {
    const files = (event as DragEvent).dataTransfer?.files;
    if (!files?.length) return;
    event.preventDefault();
    fileDragDepth = 0;
    root.classList.remove('mm-chatbot-dragging-files');
    void handleAttachedFiles(files);
  });
  return root;
}
