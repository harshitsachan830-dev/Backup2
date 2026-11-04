"use strict";
(self["rspackChunk_ml_platform_error_assistant"] = self["rspackChunk_ml_platform_error_assistant"] || []).push([["lib_index_js"], {
"./lib/ai-chatbot.js"(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  createAIChatbotPanel: () => (createAIChatbotPanel)
});
/* import */ var _request__rspack_import_0 = __webpack_require__("./lib/request.js");
/* import */ var _code_visualization__rspack_import_3 = __webpack_require__("./lib/code-visualization.js");
/* import */ var _trace_visualization__rspack_import_2 = __webpack_require__("./lib/trace-visualization.js");
/* import */ var _visualization_registry__rspack_import_1 = __webpack_require__("./lib/visualization-registry.js");




async function requestChatAPI(settings, payload) {
    return (0,_request__rspack_import_0.requestAPI)('api/ai/chat', settings, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
}
function parseCodeBlocks(text) {
    const segments = [];
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
function escapeChatHtml(value) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
function renderInlineMarkdown(value) {
    return escapeChatHtml(value)
        .replace(/`([^`]+)`/g, '<code class="mm-chat-inline-code">$1</code>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>');
}
function renderTextMarkdown(wrapper, content) {
    const lines = content.replace(/\r/g, '').split('\n');
    let paragraph = [];
    const flushParagraph = () => {
        if (!paragraph.length)
            return;
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
                if (!item)
                    break;
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
function renderMessageContent(text) {
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
                }
                catch (_a) {
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
        }
        else
            renderTextMarkdown(wrapper, seg.content);
    });
    return wrapper;
}
async function streamAssistantReplyInPlace(messageElement, reply, messagesArea) {
    var _a;
    const bubble = messageElement.querySelector('.mm-chat-bubble');
    if (!(bubble instanceof HTMLElement))
        return false;
    const characters = Array.from(reply);
    if (!characters.length)
        return true;
    const steps = Math.min(220, Math.max(30, Math.ceil(characters.length / 10)));
    const chunkSize = Math.max(1, Math.ceil(characters.length / steps));
    const totalDuration = Math.min(8000, Math.max(900, characters.length * 2.5));
    const delay = totalDuration / Math.ceil(characters.length / chunkSize);
    bubble.classList.remove('mm-chat-bubble-streaming');
    for (let index = 0; index < characters.length; index += chunkSize) {
        if (!messageElement.isConnected)
            return false;
        const visibleText = characters.slice(0, index + chunkSize).join('');
        const openCodeFence = (((_a = visibleText.match(/```/g)) !== null && _a !== void 0 ? _a : []).length % 2) === 1;
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
function createMessageBubble(msg, runCodeTrace, getActiveCode, loadDecisionTrees, loadNeuralNetworks, trainModel) {
    var _a;
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
    }
    else {
        const content = renderMessageContent(msg.content);
        bubble.appendChild(content);
        if (msg.datasetProfile)
            bubble.appendChild(renderDatasetProfile(msg.datasetProfile));
        if (msg.codeProfile)
            bubble.appendChild(renderCodeProfile(msg.codeProfile));
        if (msg.animationCode && runCodeTrace && getActiveCode) {
            bubble.appendChild(renderCodeAnimation(msg.animationCode, runCodeTrace, getActiveCode, msg.animationUsesActiveCell !== false));
        }
        if (msg.decisionTrees)
            bubble.appendChild(renderDecisionTrees(msg.decisionTrees));
        if (msg.neuralNetworks)
            bubble.appendChild(renderNeuralNetworks(msg.neuralNetworks));
        if (msg.trainingSources)
            bubble.appendChild(renderTrainingWorkflow(msg.trainingSources, trainModel));
    }
    if (msg.codeVisualization)
        bubble.appendChild(renderCodeVisualization(msg.codeVisualization));
    if ((_a = msg.visualizationIds) === null || _a === void 0 ? void 0 : _a.length)
        bubble.appendChild(renderVisualizationRecommendations(msg.visualizationIds));
    container.append(metaHeader, bubble);
    if (msg.role === 'user') {
        wrapper.append(container, avatar);
    }
    else {
        wrapper.append(avatar, container);
    }
    return wrapper;
}
function renderTrainingWorkflow(sources, trainModel) {
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
        if (index === 0)
            option.selected = true;
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
        const option = document.createElement('option');
        option.value = value;
        option.textContent = label;
        modelSelect.appendChild(option);
    });
    const trainButton = document.createElement('button');
    trainButton.type = 'button';
    trainButton.textContent = '▶ Train locally';
    trainButton.style.cssText = 'padding:6px 10px;border:1px solid #c7d2fe;border-radius:6px;background:#eef2ff;color:#3730a3;cursor:pointer;font-weight:600';
    controls.append(sourceSelect, modelSelect, trainButton);
    const status = document.createElement('div');
    status.style.cssText = 'font-size:11px;color:#475569;margin-top:8px';
    status.textContent = 'Task type is detected from the target. A holdout split is used when a test set is not already available.';
    card.append(controls, status);
    trainButton.addEventListener('click', async () => {
        if (!trainModel)
            return;
        trainButton.disabled = true;
        trainButton.textContent = '⏳ Training…';
        status.textContent = 'Training and evaluating the model in the notebook kernel…';
        try {
            const result = await trainModel(sourceSelect.value, modelSelect.value);
            const secondary = result.secondaryMetrics.map(metric => `${metric.label}: ${metric.value.toFixed(4)}`).join(' · ');
            status.textContent = `${result.modelType} ${result.task} trained locally as ${result.modelName}. ${result.primaryMetric}: ${result.primaryScore.toFixed(4)}${secondary ? ` · ${secondary}` : ''} · ${result.trainRows} train / ${result.testRows} test rows · ${result.featureCount} features. Use Visualize Tree or Visualize Neural Network to inspect supported fitted models.`;
            status.style.color = '#166534';
        }
        catch (error) {
            status.textContent = error instanceof Error ? error.message : 'Training failed in the notebook kernel.';
            status.style.color = '#b91c1c';
        }
        finally {
            trainButton.disabled = false;
            trainButton.textContent = '▶ Train locally';
        }
    });
    return card;
}
function renderNeuralNetworks(networks) {
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
        option.value = String(speed);
        option.textContent = `${speed}×`;
        speedSelect.appendChild(option);
    });
    const strengthLabel = document.createElement('label');
    strengthLabel.style.cssText = 'display:flex;align-items:center;gap:6px;font-size:11px;color:#475569';
    strengthLabel.append(document.createTextNode('Hide weak weights '));
    const strength = document.createElement('input');
    strength.type = 'range';
    strength.min = '0';
    strength.max = '100';
    strength.value = '0';
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
    let animationTimer = null;
    let isPlaying = false;
    let activeLayer = -1;
    let renderedEdges = [];
    let renderedNodes = [];
    const paintAnimationFrame = () => {
        var _a, _b, _c, _d, _e;
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
        const network = (_a = networks[Number(modelSelect.value)]) !== null && _a !== void 0 ? _a : networks[0];
        animationStatus.textContent = activeLayer >= 0
            ? `${isPlaying ? 'Playing' : 'Paused'} · ${(_c = (_b = network.layers[activeLayer]) === null || _b === void 0 ? void 0 : _b.label) !== null && _c !== void 0 ? _c : 'Layer'} → ${(_e = (_d = network.layers[activeLayer + 1]) === null || _d === void 0 ? void 0 : _d.label) !== null && _e !== void 0 ? _e : 'Output'} · illustrative, not a specific prediction`
            : 'Ready · animation highlights the layer-by-layer flow; it does not calculate a sample prediction.';
    };
    const stopAnimation = (reset = true) => {
        if (animationTimer !== null)
            window.clearInterval(animationTimer);
        animationTimer = null;
        isPlaying = false;
        playButton.textContent = '▶ Play';
        playButton.setAttribute('aria-label', 'Play neural network flow animation');
        if (reset)
            activeLayer = -1;
        paintAnimationFrame();
    };
    const advanceAnimation = () => {
        var _a;
        const network = (_a = networks[Number(modelSelect.value)]) !== null && _a !== void 0 ? _a : networks[0];
        const transitions = Math.max(1, network.layers.length - 1);
        activeLayer = (activeLayer + 1) % transitions;
        paintAnimationFrame();
    };
    const startAnimation = () => {
        if (animationTimer !== null)
            window.clearInterval(animationTimer);
        isPlaying = true;
        playButton.textContent = '⏸ Pause';
        playButton.setAttribute('aria-label', 'Pause neural network flow animation');
        advanceAnimation();
        const delay = 1200 / Number(speedSelect.value);
        animationTimer = window.setInterval(() => {
            if (!card.isConnected) {
                stopAnimation();
                return;
            }
            advanceAnimation();
        }, delay);
    };
    playButton.addEventListener('click', () => isPlaying ? stopAnimation(false) : startAnimation());
    speedSelect.addEventListener('change', () => { if (isPlaying)
        startAnimation(); });
    modelSelect.addEventListener('change', () => { stopAnimation(); render(); });
    const render = () => {
        var _a;
        const network = (_a = networks[Number(modelSelect.value)]) !== null && _a !== void 0 ? _a : networks[0];
        const maxWeight = Math.max(0, ...network.connections.map(connection => Math.abs(connection.weight)));
        const minWeight = maxWeight * Number(strength.value) / 100;
        const shownEdges = network.connections.filter(connection => Math.abs(connection.weight) >= minWeight);
        const layerGap = 132;
        const width = Math.max(720, 100 + (network.layers.length - 1) * layerGap);
        const height = 430;
        const xAt = (layerIndex) => 48 + layerIndex * layerGap;
        const pointAt = new Map();
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
        svg.setAttribute('width', String(width));
        svg.setAttribute('height', String(height));
        svg.setAttribute('role', 'img');
        svg.setAttribute('aria-label', `${network.modelType} neural network with layer sizes ${network.layers.map(layer => layer.size).join(', ')}`);
        shownEdges.forEach(connection => {
            var _a, _b, _c;
            const from = pointAt.get(`${connection.fromLayer}:${connection.fromNode}`);
            const to = pointAt.get(`${connection.fromLayer + 1}:${connection.toNode}`);
            if (!from || !to)
                return;
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', String(from.x));
            line.setAttribute('y1', String(from.y));
            line.setAttribute('x2', String(to.x));
            line.setAttribute('y2', String(to.y));
            line.setAttribute('stroke', connection.weight >= 0 ? '#2563eb' : '#dc2626');
            line.setAttribute('stroke-width', String(0.7 + 1.8 * Math.abs(connection.weight) / (maxWeight || 1)));
            line.setAttribute('stroke-opacity', String(0.12 + 0.65 * Math.abs(connection.weight) / (maxWeight || 1)));
            renderedEdges.push({
                element: line,
                layer: connection.fromLayer,
                stroke: (_a = line.getAttribute('stroke')) !== null && _a !== void 0 ? _a : '#2563eb',
                width: (_b = line.getAttribute('stroke-width')) !== null && _b !== void 0 ? _b : '1',
                opacity: (_c = line.getAttribute('stroke-opacity')) !== null && _c !== void 0 ? _c : '0.5'
            });
            const title = document.createElementNS(svg.namespaceURI, 'title');
            title.textContent = `Weight ${connection.weight.toFixed(4)}`;
            line.appendChild(title);
            svg.appendChild(line);
        });
        network.layers.forEach((layer, layerIndex) => {
            const title = document.createElementNS(svg.namespaceURI, 'text');
            title.setAttribute('x', String(xAt(layerIndex)));
            title.setAttribute('y', '24');
            title.setAttribute('text-anchor', 'middle');
            title.setAttribute('font-size', '12');
            title.setAttribute('font-weight', '700');
            title.setAttribute('fill', '#334155');
            title.textContent = layer.label;
            svg.appendChild(title);
            const countLabel = document.createElementNS(svg.namespaceURI, 'text');
            countLabel.setAttribute('x', String(xAt(layerIndex)));
            countLabel.setAttribute('y', '42');
            countLabel.setAttribute('text-anchor', 'middle');
            countLabel.setAttribute('font-size', '10');
            countLabel.setAttribute('fill', '#64748b');
            countLabel.textContent = `${layer.size} units`;
            if (layer.nodes.length < layer.size)
                countLabel.textContent += ` · showing ${layer.nodes.length}`;
            svg.appendChild(countLabel);
            layer.nodes.forEach(node => {
                var _a, _b;
                const point = pointAt.get(`${layerIndex}:${node.index}`);
                if (!point)
                    return;
                const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                circle.setAttribute('cx', String(point.x));
                circle.setAttribute('cy', String(point.y));
                circle.setAttribute('r', '13');
                circle.setAttribute('fill', layerIndex === 0 ? '#dbeafe' : layerIndex === network.layers.length - 1 ? '#dcfce7' : '#ede9fe');
                circle.setAttribute('stroke', layerIndex === 0 ? '#3b82f6' : layerIndex === network.layers.length - 1 ? '#22c55e' : '#8b5cf6');
                circle.setAttribute('stroke-width', '2');
                renderedNodes.push({
                    element: circle,
                    layer: layerIndex,
                    fill: (_a = circle.getAttribute('fill')) !== null && _a !== void 0 ? _a : '#ede9fe',
                    stroke: (_b = circle.getAttribute('stroke')) !== null && _b !== void 0 ? _b : '#8b5cf6'
                });
                const nodeTitle = document.createElementNS(svg.namespaceURI, 'title');
                nodeTitle.textContent = node.label;
                circle.appendChild(nodeTitle);
                svg.appendChild(circle);
                const label = document.createElementNS(svg.namespaceURI, 'text');
                label.setAttribute('x', String(point.x));
                label.setAttribute('y', String(point.y + 27));
                label.setAttribute('text-anchor', 'middle');
                label.setAttribute('font-size', '9');
                label.setAttribute('fill', '#475569');
                label.textContent = node.label.length > 15 ? `${node.label.slice(0, 13)}…` : node.label;
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
function renderDecisionTrees(trees) {
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
        const option = document.createElement('option');
        option.value = String(index);
        option.textContent = `${tree.modelName} · ${tree.task}`;
        modelSelect.appendChild(option);
    });
    const depthWrap = document.createElement('label');
    depthWrap.style.cssText = 'display:flex;align-items:center;gap:6px;font-size:11px;color:#475569';
    const depthText = document.createElement('span');
    const depthInput = document.createElement('input');
    depthInput.type = 'range';
    depthInput.min = '1';
    depthInput.max = '10';
    depthInput.value = '3';
    depthInput.setAttribute('aria-label', 'Maximum tree depth shown');
    const diagram = document.createElement('div');
    diagram.style.cssText = 'max-height:440px;overflow:auto;border:1px solid #edf1f6;border-radius:8px;background:#f8fafc';
    const caption = document.createElement('div');
    caption.style.cssText = 'font-size:10px;color:#64748b;margin-top:6px';
    depthWrap.append(document.createTextNode('Visible depth '), depthInput, depthText);
    controls.append(modelSelect, depthWrap);
    const render = () => {
        var _a;
        const tree = (_a = trees[Number(modelSelect.value)]) !== null && _a !== void 0 ? _a : trees[0];
        const maxVisibleDepth = Math.max(1, Math.min(10, tree.maxDepth));
        depthInput.max = String(maxVisibleDepth);
        depthInput.value = String(Math.max(1, Math.min(Number(depthInput.value), maxVisibleDepth)));
        const shownDepth = Math.min(Number(depthInput.value), tree.maxDepth);
        depthText.textContent = `${shownDepth} / ${tree.maxDepth}`;
        const visible = tree.nodes.filter(node => node.depth <= shownDepth);
        const levels = [];
        visible.forEach(node => { var _a; var _b; return ((_a = levels[_b = node.depth]) !== null && _a !== void 0 ? _a : (levels[_b] = [])).push(node); });
        const widest = Math.max(1, ...levels.map(level => { var _a; return (_a = level === null || level === void 0 ? void 0 : level.length) !== null && _a !== void 0 ? _a : 0; }));
        const nodeWidth = 184, nodeHeight = 76, gapX = 26, gapY = 42;
        const width = Math.max(680, widest * (nodeWidth + gapX) + gapX);
        const height = Math.max(150, (shownDepth + 1) * (nodeHeight + gapY) + gapY);
        const positions = new Map();
        levels.forEach((level, depth) => level === null || level === void 0 ? void 0 : level.forEach((node, index) => {
            const x = ((index + 1) * width) / (level.length + 1);
            positions.set(node.id, { x, y: gapY / 2 + depth * (nodeHeight + gapY) });
        }));
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        svg.setAttribute('width', String(width));
        svg.setAttribute('height', String(height));
        svg.setAttribute('role', 'img');
        svg.setAttribute('aria-label', `${tree.task} tree with ${tree.nodeCount} nodes`);
        visible.forEach(node => {
            const parent = positions.get(node.id);
            if (!parent)
                return;
            [['left', '≤'], ['right', '>']].forEach(([side, label]) => {
                const childId = node[side];
                const child = childId === null ? undefined : positions.get(childId);
                if (!child)
                    return;
                const line = document.createElementNS(svg.namespaceURI, 'line');
                line.setAttribute('x1', String(parent.x));
                line.setAttribute('y1', String(parent.y + nodeHeight));
                line.setAttribute('x2', String(child.x));
                line.setAttribute('y2', String(child.y));
                line.setAttribute('stroke', '#94a3b8');
                line.setAttribute('stroke-width', '2');
                svg.appendChild(line);
                const branch = document.createElementNS(svg.namespaceURI, 'text');
                branch.setAttribute('x', String((parent.x + child.x) / 2));
                branch.setAttribute('y', String((parent.y + nodeHeight + child.y) / 2));
                branch.setAttribute('text-anchor', 'middle');
                branch.setAttribute('font-size', '11');
                branch.setAttribute('fill', '#475569');
                branch.textContent = label;
                svg.appendChild(branch);
            });
        });
        visible.forEach(node => {
            const point = positions.get(node.id);
            if (!point)
                return;
            const isLeaf = node.left === null && node.right === null;
            const group = document.createElementNS(svg.namespaceURI, 'g');
            const rect = document.createElementNS(svg.namespaceURI, 'rect');
            rect.setAttribute('x', String(point.x - nodeWidth / 2));
            rect.setAttribute('y', String(point.y));
            rect.setAttribute('width', String(nodeWidth));
            rect.setAttribute('height', String(nodeHeight));
            rect.setAttribute('rx', '9');
            rect.setAttribute('fill', isLeaf ? '#ecfdf5' : '#eef2ff');
            rect.setAttribute('stroke', isLeaf ? '#86efac' : '#a5b4fc');
            rect.setAttribute('stroke-width', '1.5');
            group.appendChild(rect);
            const title = document.createElementNS(svg.namespaceURI, 'title');
            title.textContent = isLeaf ? `Leaf: ${node.prediction}` : `${node.feature} ≤ ${node.threshold}`;
            group.appendChild(title);
            const addText = (text, y, bold = false) => {
                const label = document.createElementNS(svg.namespaceURI, 'text');
                label.setAttribute('x', String(point.x));
                label.setAttribute('y', String(point.y + y));
                label.setAttribute('text-anchor', 'middle');
                label.setAttribute('font-size', bold ? '12' : '10');
                label.setAttribute('font-weight', bold ? '700' : '400');
                label.setAttribute('fill', '#1e293b');
                label.textContent = text;
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
            if (diagram.isConnected)
                diagram.scrollLeft = Math.max(0, width / 2 - diagram.clientWidth / 2);
        });
        caption.textContent = `${tree.criterion} · ${tree.nodeCount} nodes · maximum depth ${tree.maxDepth}. Showing depth ${shownDepth}${tree.maxDepth > 10 ? ' (visualization capped at depth 10)' : ''}; scroll horizontally to inspect branches.`;
    };
    modelSelect.addEventListener('change', render);
    depthInput.addEventListener('input', render);
    card.append(heading, controls, diagram, caption);
    render();
    return card;
}
function renderCodeProfile(items) {
    const card = document.createElement('section');
    card.style.cssText = 'margin-top:10px;padding:10px 12px;border:1px solid #dbe3ef;border-radius:9px;background:#fff;color:#243247;font-size:11px';
    const heading = document.createElement('strong');
    heading.textContent = 'Code structure map';
    card.appendChild(heading);
    const note = document.createElement('div');
    note.style.cssText = 'color:#607086;margin:3px 0 8px';
    note.textContent = 'Counts of common Python constructs in the active cell (a quick overview, not an execution trace).';
    card.appendChild(note);
    const max = Math.max(1, ...items.map(x => x.count));
    items.forEach(({ label, count }) => {
        const row = document.createElement('div');
        row.style.cssText = 'display:grid;grid-template-columns:86px 1fr 22px;gap:6px;align-items:center;margin:4px 0';
        const name = document.createElement('span');
        name.textContent = label;
        const track = document.createElement('span');
        track.style.cssText = 'height:8px;background:#eef0fa;border-radius:8px;overflow:hidden';
        const fill = document.createElement('span');
        fill.style.cssText = `display:block;height:100%;width:${Math.round(count * 100 / max)}%;background:#7367f0`;
        track.appendChild(fill);
        const value = document.createElement('span');
        value.textContent = String(count);
        row.append(name, track, value);
        card.appendChild(row);
    });
    return card;
}
function renderCodeVisualization(spec) {
    var _a, _b;
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
    if (spec.category) {
        const category = document.createElement('span');
        category.textContent = spec.category;
        category.style.cssText = 'display:inline-block;margin:-3px 0 9px;padding:3px 7px;border-radius:999px;background:#eeeaff;color:#5b4fd0;font-size:9px;font-weight:700';
        card.appendChild(category);
    }
    (_a = spec.sourceOverlays) === null || _a === void 0 ? void 0 : _a.forEach(overlay => {
        const panel = document.createElement('section');
        panel.style.cssText = 'margin:7px 0;padding:9px 10px;border:1px solid #e2e5f2;border-radius:9px;background:rgba(255,255,255,.8)';
        const titleRow = document.createElement('div');
        titleRow.style.cssText = 'display:flex;justify-content:space-between;align-items:center;gap:8px';
        const title = document.createElement('strong');
        title.textContent = `${overlay.id} · ${overlay.title}`;
        title.style.cssText = 'font-size:11px;color:#343657';
        const sourceTag = document.createElement('span');
        sourceTag.textContent = 'SOURCE CUE';
        sourceTag.style.cssText = 'flex:none;padding:3px 6px;border-radius:999px;background:#f0efff;color:#5b4fd0;font-size:8px;font-weight:800;letter-spacing:.04em';
        titleRow.append(title, sourceTag);
        const description = document.createElement('p');
        description.textContent = overlay.summary;
        description.style.cssText = 'margin:5px 0 7px;color:#68738a;font-size:10px;line-height:1.45';
        const list = document.createElement('ol');
        list.style.cssText = 'list-style:none;padding:0;margin:0;display:grid;gap:4px';
        overlay.steps.forEach((step, index) => {
            var _a;
            const row = document.createElement('li');
            row.style.cssText = `display:grid;grid-template-columns:22px minmax(0,1fr) auto;gap:7px;align-items:start;padding:6px 7px;margin-left:${((_a = step.indent) !== null && _a !== void 0 ? _a : 0) * 12}px;border:1px solid #eceef7;border-radius:7px;background:#fff`;
            const marker = document.createElement('span');
            marker.textContent = String(index + 1);
            marker.style.cssText = 'display:grid;place-items:center;width:19px;height:19px;border-radius:50%;background:#eeedff;color:#5548c8;font-size:9px;font-weight:800';
            const body = document.createElement('span');
            const stepTitle = document.createElement('strong');
            stepTitle.textContent = step.title;
            stepTitle.style.cssText = 'display:block;color:#343657;font-size:10px';
            const detail = document.createElement('span');
            detail.textContent = step.detail;
            detail.style.cssText = 'display:block;margin-top:2px;color:#68738a;font-size:9px;line-height:1.4;overflow-wrap:anywhere';
            body.append(stepTitle, detail);
            row.append(marker, body);
            if (step.line !== undefined) {
                const line = document.createElement('span');
                line.textContent = `L${step.line}`;
                line.style.cssText = 'padding:3px 5px;border-radius:5px;background:#f2f3f9;color:#737990;font-size:8px;white-space:nowrap';
                row.appendChild(line);
            }
            list.appendChild(row);
        });
        panel.append(titleRow, description, list);
        card.appendChild(panel);
    });
    if (spec.kind === 'neural-network' && ((_b = spec.layers) === null || _b === void 0 ? void 0 : _b.length)) {
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
        const positions = [];
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
                edge.setAttribute('x1', String(from.x + 8));
                edge.setAttribute('y1', String(from.y));
                edge.setAttribute('x2', String(to.x - 8));
                edge.setAttribute('y2', String(to.y));
                edge.setAttribute('stroke', '#c4c6e7');
                edge.setAttribute('stroke-width', '1.2');
                svg.appendChild(edge);
            }));
        });
        spec.layers.forEach((layer, layerIndex) => {
            const x = 48 + layerIndex * 145;
            const label = document.createElementNS(svg.namespaceURI, 'text');
            label.setAttribute('x', String(x));
            label.setAttribute('y', '18');
            label.setAttribute('text-anchor', 'middle');
            label.setAttribute('font-size', '10');
            label.setAttribute('font-weight', '700');
            label.setAttribute('fill', '#4b4d76');
            label.textContent = layer.label;
            svg.appendChild(label);
            positions[layerIndex].forEach(point => {
                const circle = document.createElementNS(svg.namespaceURI, 'circle');
                circle.setAttribute('cx', String(point.x));
                circle.setAttribute('cy', String(point.y));
                circle.setAttribute('r', '7');
                circle.setAttribute('fill', ['#7c6cf1', '#22a879', '#f3a53b'][layerIndex % 3]);
                circle.setAttribute('stroke', '#fff');
                circle.setAttribute('stroke-width', '2');
                svg.appendChild(circle);
            });
            const units = document.createElementNS(svg.namespaceURI, 'text');
            units.setAttribute('x', String(x));
            units.setAttribute('y', '190');
            units.setAttribute('text-anchor', 'middle');
            units.setAttribute('font-size', '10');
            units.setAttribute('fill', '#68738a');
            units.textContent = layer.units === null ? 'width unknown' : `${layer.units} unit${layer.units === 1 ? '' : 's'}`;
            svg.appendChild(units);
        });
        const legend = document.createElement('div');
        legend.textContent = 'Layer-to-layer connections are schematic; no learned weights or sample activations are displayed.';
        legend.style.cssText = 'font-size:10px;color:#68738a;margin:0 3px 3px';
        diagram.append(svg, legend);
        card.appendChild(diagram);
    }
    else if (spec.kind === 'decision-tree') {
        const diagram = document.createElement('div');
        diagram.style.cssText = 'overflow-x:auto;border:1px solid #e5e7f7;border-radius:9px;background:#fff;padding:7px;margin-bottom:9px';
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 560 190');
        svg.setAttribute('width', '560');
        svg.setAttribute('height', '190');
        svg.setAttribute('role', 'img');
        svg.setAttribute('aria-label', 'Conceptual decision-tree branches, not a fitted tree');
        const addLine = (x1, y1, x2, y2) => {
            const edge = document.createElementNS(svg.namespaceURI, 'line');
            edge.setAttribute('x1', String(x1));
            edge.setAttribute('y1', String(y1));
            edge.setAttribute('x2', String(x2));
            edge.setAttribute('y2', String(y2));
            edge.setAttribute('stroke', '#a5a8ca');
            edge.setAttribute('stroke-width', '2');
            svg.appendChild(edge);
        };
        addLine(280, 64, 145, 112);
        addLine(280, 64, 415, 112);
        const addNode = (x, y, title, detail, color) => {
            const group = document.createElementNS(svg.namespaceURI, 'g');
            const rect = document.createElementNS(svg.namespaceURI, 'rect');
            rect.setAttribute('x', String(x - 88));
            rect.setAttribute('y', String(y - 23));
            rect.setAttribute('width', '176');
            rect.setAttribute('height', '48');
            rect.setAttribute('rx', '10');
            rect.setAttribute('fill', color);
            rect.setAttribute('stroke', '#d6d8ec');
            group.appendChild(rect);
            [[title, y - 2, '11', '700'], [detail, y + 14, '9', '400']].forEach(([text, textY, size, weight]) => {
                const label = document.createElementNS(svg.namespaceURI, 'text');
                label.setAttribute('x', String(x));
                label.setAttribute('y', String(textY));
                label.setAttribute('text-anchor', 'middle');
                label.setAttribute('font-size', String(size));
                label.setAttribute('font-weight', String(weight));
                label.setAttribute('fill', '#34405a');
                label.textContent = String(text);
                group.appendChild(label);
            });
            svg.appendChild(group);
        };
        addNode(280, 45, 'Feature test', 'learned from fit data', '#f2efff');
        addNode(145, 135, 'True branch', 'continues to a leaf', '#effaf5');
        addNode(415, 135, 'False branch', 'continues to a leaf', '#fff7e9');
        const yes = document.createElementNS(svg.namespaceURI, 'text');
        yes.setAttribute('x', '198');
        yes.setAttribute('y', '91');
        yes.setAttribute('font-size', '9');
        yes.setAttribute('fill', '#626b81');
        yes.textContent = 'yes';
        svg.appendChild(yes);
        const no = document.createElementNS(svg.namespaceURI, 'text');
        no.setAttribute('x', '355');
        no.setAttribute('y', '91');
        no.setAttribute('font-size', '9');
        no.setAttribute('fill', '#626b81');
        no.textContent = 'no';
        svg.appendChild(no);
        diagram.appendChild(svg);
        card.appendChild(diagram);
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
        const title = document.createElement('strong');
        title.textContent = step.title;
        title.style.cssText = 'display:block;color:#343657;font-size:11px';
        const detail = document.createElement('span');
        detail.textContent = step.detail;
        detail.style.cssText = 'display:block;margin-top:2px;color:#68738a;font-size:10px;line-height:1.45';
        text.append(title, detail);
        item.append(number, text);
        if (step.line !== undefined) {
            const line = document.createElement('span');
            line.textContent = `Line ${step.line}`;
            line.style.cssText = 'padding:3px 5px;border-radius:5px;background:#f2f3f9;color:#737990;font-size:9px;white-space:nowrap';
            item.appendChild(line);
        }
        flow.appendChild(item);
    });
    card.appendChild(flow);
    const renderFactList = (titleText, values, color) => {
        if (!values.length)
            return;
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
function renderVisualizationRecommendations(ids) {
    const recommendations = [...new Set(ids)]
        .map(id => ({ id, label: (0,_visualization_registry__rspack_import_1.getVisualizationLabel)(id) }))
        .filter((item) => Boolean(item.label))
        .slice(0, 5);
    const panel = document.createElement('section');
    panel.setAttribute('aria-label', 'Related visualization catalog suggestions');
    panel.style.cssText = 'margin-top:8px;padding:9px 11px;border:1px solid #e3defe;border-radius:9px;background:#fbfaff';
    const heading = document.createElement('strong');
    heading.textContent = 'Related visualization topics';
    heading.style.cssText = 'display:block;color:#343657;font-size:10px;margin-bottom:5px';
    const note = document.createElement('div');
    note.textContent = 'AI suggestions checked against the ModelMind catalog; these labels do not claim runtime results or create another visualization.';
    note.style.cssText = 'color:#68738a;font-size:9px;line-height:1.4;margin-bottom:6px';
    const chips = document.createElement('div');
    chips.style.cssText = 'display:flex;flex-wrap:wrap;gap:5px';
    recommendations.forEach(({ id, label }) => {
        const chip = document.createElement('span');
        chip.textContent = `${label} · ${id}`;
        chip.style.cssText = 'padding:4px 7px;border:1px solid #e3defe;border-radius:999px;background:#fff;color:#5145cd;font-size:9px';
        chips.appendChild(chip);
    });
    panel.append(heading, note, chips);
    return panel;
}
function summarizeCodeStructure(code) {
    const patterns = [
        ['Imports', /^\s*(?:import\s+|from\s+\S+\s+import\s+)/gm],
        ['Functions', /^\s*(?:async\s+)?def\s+\w+/gm],
        ['Classes', /^\s*class\s+\w+/gm],
        ['Conditions', /^\s*(?:if|elif|else)\b/gm],
        ['Loops', /^\s*(?:for|while|async\s+for)\b/gm],
        ['Data operations', /\b(?:read_csv|groupby|merge|join|fit|predict|transform|plot|hist|bar)\s*\(/g],
        ['Outputs', /\b(?:print|display|savefig|to_csv)\s*\(/g],
    ];
    return patterns.map(([label, pattern]) => { var _a; return ({ label, count: ((_a = code.match(pattern)) !== null && _a !== void 0 ? _a : []).length }); });
}
function explainSourceLine(line) {
    const trimmed = line.trim();
    if (!trimmed)
        return 'Blank line — visual spacing only.';
    if (trimmed.startsWith('#'))
        return 'Comment — Python skips this line when executing the cell.';
    if (/^(from\s+\S+\s+import|import)\b/.test(trimmed))
        return 'Import — makes a module or selected names available to later lines.';
    if (/^(for|while)\b/.test(trimmed))
        return 'Loop header — the indented body runs for each item or while its condition is true.';
    if (/^(if|elif|else|try|except|finally|with)\b/.test(trimmed))
        return 'Control-flow line — which indented block runs depends on the runtime condition or outcome.';
    if (/^(def|class|async\s+def)\b/.test(trimmed))
        return 'Definition — creates a function or class; its body runs later when called or instantiated.';
    if (/^return\b/.test(trimmed))
        return 'Return — exits the current function and passes a value back to its caller.';
    if (/^(print|display)\s*\(/.test(trimmed))
        return 'Output — sends a value to the notebook output when this line runs.';
    if (/^[\w.\[\]]+\s*([+\-*/]?=)/.test(trimmed))
        return 'Assignment or update — evaluates the expression and stores its result in a name or location.';
    return 'Statement — Python evaluates this line in order; its exact effect depends on the current values and program state.';
}
function renderCodeAnimation(source, runCodeTrace, getActiveCode, usesActiveCell) {
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
    const makeButton = (label, title) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = label;
        button.title = title;
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
    let renderedLines = [];
    const renderSourceLines = () => {
        lines = currentSource.replace(/\r\n?/g, '\n').split('\n').slice(0, 250);
        renderedLines = lines.map((line, index) => {
            const row = document.createElement('div');
            row.dataset.line = String(index);
            row.style.cssText = 'display:grid;grid-template-columns:36px minmax(0,1fr);padding:0 8px;color:#cbd5e1;white-space:pre;min-height:17px';
            const number = document.createElement('span');
            number.textContent = String(index + 1);
            number.style.color = '#64748b';
            const text = document.createElement('span');
            text.textContent = line || ' ';
            row.append(number, text);
            return row;
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
    const stackPanel = document.createElement('div');
    stackPanel.style.cssText = 'display:flex;flex-wrap:wrap;align-items:center;gap:5px;margin-top:7px;font-size:10px;color:#475569';
    const callTreePanel = document.createElement('section');
    callTreePanel.style.cssText = 'display:none;margin-top:8px;padding:8px 9px;border:1px solid #e2e8f0;border-radius:7px;background:#f8fafc';
    const arrayPanel = document.createElement('section');
    arrayPanel.style.cssText = 'display:none;margin-top:8px;padding:8px 9px;border:1px solid #e2e8f0;border-radius:7px;background:#f8fafc';
    const loopPanel = document.createElement('section');
    loopPanel.style.cssText = 'display:none;margin-top:8px;padding:8px 9px;border:1px solid #ddd6fe;border-radius:7px;background:#faf9ff';
    const stateDelta = document.createElement('div');
    stateDelta.style.cssText = 'font-size:10px;line-height:1.5;color:#475569;margin-top:6px';
    const outputPanel = document.createElement('pre');
    outputPanel.style.cssText = 'display:none;max-height:120px;overflow:auto;white-space:pre-wrap;background:#f8fafc;border:1px solid #edf1f6;border-radius:6px;padding:7px;font:11px/1.4 ui-monospace,monospace;color:#334155';
    let events = [];
    let errorLine;
    let step = 0;
    let timer;
    const renderObservedCallTree = () => {
        const rootNode = { name: 'Notebook cell', children: new Map() };
        let hasCalls = false;
        events.forEach(event => {
            var _a;
            const stack = ((_a = event.callStack) !== null && _a !== void 0 ? _a : [event.functionName]).filter(name => name !== '<module>');
            if (!stack.length)
                return;
            hasCalls = true;
            let parent = rootNode;
            stack.forEach(name => {
                let child = parent.children.get(name);
                if (!child) {
                    child = { name, children: new Map() };
                    parent.children.set(name, child);
                }
                parent = child;
            });
        });
        callTreePanel.replaceChildren();
        if (!hasCalls) {
            callTreePanel.style.display = 'none';
            return;
        }
        callTreePanel.style.display = 'block';
        const heading = document.createElement('strong');
        heading.textContent = 'Observed call / recursion tree';
        heading.style.cssText = 'display:block;color:#34405a;font-size:10px;margin-bottom:4px';
        const noteText = document.createElement('div');
        noteText.textContent = 'Unique stack paths seen during this run. Repeated names indicate observed recursion depth; this is not a count of total function calls.';
        noteText.style.cssText = 'color:#64748b;font-size:9px;line-height:1.4;margin-bottom:5px';
        const renderChildren = (node, ancestors) => {
            const list = document.createElement('ol');
            list.style.cssText = 'margin:2px 0 2px 14px;padding-left:12px;color:#475569;font-size:10px';
            node.children.forEach(child => {
                const item = document.createElement('li');
                const repeated = ancestors.indexOf(child.name) >= 0;
                const label = document.createElement('span');
                label.textContent = `${child.name === '<module>' ? 'cell' : `${child.name}()`}${repeated ? ' · recursive frame' : ''}`;
                label.style.cssText = repeated ? 'color:#7c3aed;font-weight:700' : 'color:#475569';
                item.appendChild(label);
                if (child.children.size)
                    item.appendChild(renderChildren(child, [...ancestors, child.name]));
                list.appendChild(item);
            });
            return list;
        };
        callTreePanel.append(heading, noteText, renderChildren(rootNode, []));
    };
    const parseNumericArray = (value) => {
        if (!value || !/^\[\s*-?\d/.test(value) || !/^\[.*\]$/.test(value))
            return null;
        const values = value.slice(1, -1).split(',').map(item => item.trim());
        if (values.length < 2 || values.length > 16 || values.some(item => !/^-?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/.test(item)))
            return null;
        const numbers = values.map(Number);
        return numbers.every(Number.isFinite) ? numbers : null;
    };
    const renderArraySnapshot = () => {
        var _a;
        const active = events[step];
        const arrays = Object.entries((_a = active === null || active === void 0 ? void 0 : active.variables) !== null && _a !== void 0 ? _a : {}).map(([name, value]) => ({ name, values: parseNumericArray(value) })).filter((item) => item.values !== null);
        arrayPanel.replaceChildren();
        if (!arrays.length) {
            arrayPanel.style.display = 'none';
            return;
        }
        arrayPanel.style.display = 'block';
        const sorting = /\bsorted\s*\(|\.sort\s*\(/.test(currentSource);
        const heading = document.createElement('strong');
        heading.textContent = sorting ? 'Sorting / array state at this trace step' : 'Captured small numeric arrays';
        heading.style.cssText = 'display:block;color:#34405a;font-size:10px;margin-bottom:4px';
        const noteText = document.createElement('div');
        noteText.textContent = 'Values are captured from the explicitly executed trace; move through steps to compare snapshots.';
        noteText.style.cssText = 'color:#64748b;font-size:9px;margin-bottom:6px';
        arrayPanel.append(heading, noteText);
        const previousValues = step > 0 ? events[step - 1].variables : {};
        arrays.forEach(({ name, values }) => {
            const row = document.createElement('div');
            row.style.cssText = 'margin-top:6px;padding:6px;border:1px solid #e2e8f0;border-radius:6px;background:#fff';
            const label = document.createElement('div');
            label.textContent = name;
            label.style.cssText = 'font:10px ui-monospace,monospace;color:#475569;margin-bottom:3px';
            const previous = parseNumericArray(previousValues[name]);
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('viewBox', '0 0 360 86');
            svg.setAttribute('width', '100%');
            svg.setAttribute('height', '86');
            svg.setAttribute('role', 'img');
            svg.setAttribute('aria-label', `${name} values captured at trace step ${step + 1}`);
            const minValue = Math.min(0, ...values);
            const maxValue = Math.max(0, ...values);
            const range = maxValue - minValue || 1;
            const baseline = 8 + (maxValue / range) * 58;
            const cellWidth = 340 / values.length;
            const baseLine = document.createElementNS(svg.namespaceURI, 'line');
            baseLine.setAttribute('x1', '10');
            baseLine.setAttribute('x2', '350');
            baseLine.setAttribute('y1', String(baseline));
            baseLine.setAttribute('y2', String(baseline));
            baseLine.setAttribute('stroke', '#94a3b8');
            svg.appendChild(baseLine);
            values.forEach((value, index) => {
                const yValue = 8 + ((maxValue - value) / range) * 58;
                const rect = document.createElementNS(svg.namespaceURI, 'rect');
                rect.setAttribute('x', String(10 + index * cellWidth + 2));
                rect.setAttribute('y', String(Math.min(baseline, yValue)));
                rect.setAttribute('width', String(Math.max(3, cellWidth - 4)));
                rect.setAttribute('height', String(Math.max(2, Math.abs(baseline - yValue))));
                const changed = previous && (previous.length !== values.length || previous[index] !== value);
                rect.setAttribute('fill', changed ? '#f59e0b' : '#7567e8');
                rect.setAttribute('rx', '2');
                const text = document.createElementNS(svg.namespaceURI, 'text');
                text.setAttribute('x', String(10 + index * cellWidth + cellWidth / 2));
                text.setAttribute('y', '82');
                text.setAttribute('text-anchor', 'middle');
                text.setAttribute('font-size', String(Math.min(9, cellWidth * 0.55)));
                text.setAttribute('fill', '#475569');
                text.textContent = String(value);
                svg.append(rect, text);
            });
            row.append(label, svg);
            arrayPanel.appendChild(row);
        });
    };
    const renderLoopTrace = () => {
        loopPanel.replaceChildren();
        if (!events.length) {
            loopPanel.style.display = 'none';
            return;
        }
        const summary = (0,_trace_visualization__rspack_import_2.summarizeLoopTrace)(currentSource, events, step);
        if (!summary) {
            loopPanel.style.display = 'none';
            return;
        }
        loopPanel.style.display = 'block';
        const heading = document.createElement('strong');
        heading.textContent = 'Observed loop trace';
        heading.style.cssText = 'display:block;color:#4338ca;font-size:10px;margin-bottom:3px';
        const source = document.createElement('code');
        source.textContent = summary.header;
        source.style.cssText = 'display:block;overflow-wrap:anywhere;color:#334155;font:10px ui-monospace,monospace;margin-bottom:4px';
        const note = document.createElement('div');
        note.textContent = `Captured ${summary.visits.length} trace visit(s) at this loop header. These are observed line events; the panel does not infer condition outcomes or claim an iteration total.`;
        note.style.cssText = 'color:#64748b;font-size:9px;line-height:1.4;margin-bottom:6px';
        loopPanel.append(heading, source, note);
        if (summary.capturedVariables.length) {
            const values = document.createElement('div');
            values.textContent = `Captured loop variable: ${summary.capturedVariables.join(', ')}`;
            values.style.cssText = 'color:#475569;font:9px ui-monospace,monospace;margin-bottom:6px';
            loopPanel.appendChild(values);
        }
        const timeline = document.createElement('div');
        timeline.style.cssText = 'display:flex;flex-wrap:wrap;gap:4px';
        summary.visits.forEach(({ eventIndex, visitNumber }) => {
            const jump = document.createElement('button');
            jump.type = 'button';
            jump.textContent = `Visit ${visitNumber}`;
            jump.title = `Jump to captured trace step ${eventIndex + 1}`;
            jump.setAttribute('aria-label', `Jump to loop header visit ${visitNumber}, trace step ${eventIndex + 1}`);
            jump.style.cssText = `padding:3px 6px;border:1px solid ${eventIndex === step ? '#7567e8' : '#ddd6fe'};border-radius:999px;background:${eventIndex === step ? '#ede9fe' : '#fff'};color:#5145cd;font-size:9px;cursor:pointer`;
            jump.addEventListener('click', () => { stop(); step = eventIndex; paint(); });
            timeline.appendChild(jump);
        });
        loopPanel.appendChild(timeline);
    };
    const paint = () => {
        var _a, _b;
        renderedLines.forEach(row => {
            const lineNumber = Number(row.dataset.line) + 1;
            row.style.background = lineNumber === errorLine ? 'rgba(239,68,68,.24)' : 'transparent';
        });
        if (events.length === 0) {
            counter.textContent = errorLine ? `Error at line ${errorLine}` : 'Run to capture execution';
            return;
        }
        const active = events[step];
        const visits = events.slice(0, step + 1).filter(event => event.line === active.line).length;
        renderedLines.forEach(row => {
            const lineNumber = Number(row.dataset.line) + 1;
            const selected = lineNumber === active.line;
            row.style.background = selected ? 'rgba(109,124,255,.28)' : lineNumber === errorLine ? 'rgba(239,68,68,.24)' : 'transparent';
            if (selected)
                row.scrollIntoView({ block: 'nearest' });
        });
        counter.textContent = `Executed step ${step + 1} of ${events.length} · line ${active.line} · visited ${visits}×${active.functionName !== '<module>' ? ` · ${active.functionName}()` : ''}`;
        explanation.textContent = `At the start of this line: ${explainSourceLine((_a = lines[active.line - 1]) !== null && _a !== void 0 ? _a : '')}`;
        variablePanel.replaceChildren();
        const entries = Object.entries(active.variables);
        if (entries.length === 0) {
            const empty = document.createElement('span');
            empty.textContent = 'No simple variable values at this step.';
            empty.style.cssText = 'color:#64748b;font-size:11px';
            variablePanel.appendChild(empty);
        }
        else
            entries.forEach(([name, value]) => {
                const chip = document.createElement('div');
                chip.style.cssText = 'padding:5px 7px;border:1px solid #e2e8f0;border-radius:6px;background:#f8fafc;min-width:0';
                const key = document.createElement('strong');
                key.textContent = name;
                key.style.cssText = 'display:block;color:#475569;font-size:10px';
                const val = document.createElement('span');
                val.textContent = value;
                val.title = value;
                val.style.cssText = 'display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font:11px ui-monospace,monospace;color:#0f172a';
                chip.append(key, val);
                variablePanel.appendChild(chip);
            });
        stackPanel.replaceChildren();
        const stackHeading = document.createElement('strong');
        stackHeading.textContent = 'Call stack:';
        stackPanel.appendChild(stackHeading);
        (((_b = active.callStack) === null || _b === void 0 ? void 0 : _b.length) ? active.callStack : [active.functionName]).forEach((frameName, index) => {
            if (index) {
                const arrow = document.createElement('span');
                arrow.textContent = '›';
                stackPanel.appendChild(arrow);
            }
            const frame = document.createElement('span');
            frame.textContent = frameName === '<module>' ? 'cell' : `${frameName}()`;
            frame.style.cssText = 'padding:3px 6px;border:1px solid #e2e8f0;border-radius:999px;background:#f8fafc';
            stackPanel.appendChild(frame);
        });
        const before = step > 0 ? events[step - 1].variables : {};
        const changed = Object.entries(active.variables).filter(([name, value]) => before[name] !== value)
            .map(([name, value]) => `${name}: ${before[name] === undefined ? 'created' : `${before[name]} →`} ${value}`);
        const removed = Object.keys(before).filter(name => !(name in active.variables)).map(name => `${name}: no longer captured`);
        stateDelta.textContent = `Variable changes since previous captured step: ${[...changed, ...removed].join(' · ') || 'none among the simple values captured'}`;
        renderArraySnapshot();
        renderLoopTrace();
    };
    const stop = () => { if (timer)
        clearInterval(timer); timer = undefined; toggle.textContent = '▶ Play'; toggle.title = 'Play execution trace'; };
    const advance = () => { step = Math.min(step + 1, events.length - 1); paint(); };
    previous.addEventListener('click', () => { stop(); step = Math.max(step - 1, 0); paint(); });
    next.addEventListener('click', () => { stop(); advance(); });
    toggle.addEventListener('click', () => {
        if (timer) {
            stop();
            return;
        }
        if (events.length < 2 || step >= events.length - 1)
            return;
        toggle.textContent = '⏸ Pause';
        toggle.title = 'Pause walkthrough';
        timer = setInterval(() => {
            if (!root.isConnected) {
                stop();
                return;
            }
            if (step >= events.length - 1) {
                stop();
                return;
            }
            step += 1;
            paint();
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
            errorLine = undefined;
            step = 0;
            renderSourceLines();
            variablePanel.replaceChildren();
            stackPanel.replaceChildren();
            callTreePanel.replaceChildren();
            callTreePanel.style.display = 'none';
            arrayPanel.replaceChildren();
            arrayPanel.style.display = 'none';
            loopPanel.replaceChildren();
            loopPanel.style.display = 'none';
            stateDelta.textContent = '';
            outputPanel.style.display = 'none';
            counter.textContent = 'Selected cell changed · tracing the new code';
        }
        if (/\b(?:input|getpass)\s*\(/.test(latestSource)) {
            explanation.textContent = 'This cell uses input(). Interactive prompts are not supported in trace mode yet; try a cell that does not ask for keyboard input.';
            return;
        }
        const accepted = window.confirm('Run the currently selected code cell in its Jupyter kernel to capture the real execution path? It can change variables, show output, and repeat any file or network actions in the code.');
        if (!accepted)
            return;
        run.disabled = true;
        run.textContent = 'Tracing…';
        explanation.textContent = 'Running the selected code and capturing executed lines…';
        try {
            const result = await runCodeTrace(latestSource);
            events = result.events.slice(0, 1000);
            errorLine = result.errorLine;
            step = 0;
            renderObservedCallTree();
            outputPanel.style.display = result.output || result.error ? 'block' : 'none';
            outputPanel.textContent = [result.output, result.error ? `Execution stopped: ${result.error}` : ''].filter(Boolean).join('\n');
            explanation.textContent = result.error
                ? `Captured ${events.length} executed steps before the cell stopped with an error${errorLine ? ` at selected-cell line ${errorLine}` : ''}. The exact source line is highlighted.`
                : `Captured ${events.length} executed steps. Repeated lines show loops; lines Python skipped do not appear.`;
            if (events.length === 0)
                explanation.textContent += ' No Python line events were captured.';
            paint();
        }
        catch (error) {
            explanation.textContent = error instanceof Error ? error.message : 'Could not capture this execution.';
        }
        finally {
            run.disabled = false;
            run.textContent = '↻ Run again';
        }
    });
    root.append(heading, note, controls, codePanel, explanation, stackPanel, callTreePanel, variablePanel, stateDelta, loopPanel, arrayPanel, outputPanel);
    counter.textContent = 'Run to capture execution';
    if (lines.length >= 250) {
        const limitNote = document.createElement('div');
        limitNote.style.cssText = 'font-size:10px;color:#607086;margin-top:5px';
        limitNote.textContent = 'Showing the first 250 lines.';
        root.appendChild(limitNote);
    }
    return root;
}
function renderDatasetProfile(profile) {
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
        }
        else if (col.categories) {
            const chart = document.createElement('div');
            chart.style.cssText = 'display:grid;gap:4px;margin-top:7px';
            const max = Math.max(1, ...col.categories.map(x => x.count));
            col.categories.slice(0, 8).forEach(({ label, count }) => {
                const row = document.createElement('div');
                row.style.cssText = 'display:grid;grid-template-columns:minmax(50px,1fr) 3fr auto;gap:6px;align-items:center';
                const name = document.createElement('span');
                name.textContent = label.slice(0, 30);
                name.title = label;
                const track = document.createElement('span');
                track.style.cssText = 'height:7px;background:#eef0fa;border-radius:8px;overflow:hidden';
                const fill = document.createElement('span');
                fill.style.cssText = `display:block;height:100%;width:${Math.round(100 * count / max)}%;background:#20a88a`;
                track.appendChild(fill);
                const value = document.createElement('span');
                value.textContent = String(count);
                row.append(name, track, value);
                chart.appendChild(row);
            });
            section.appendChild(chart);
        }
        card.appendChild(section);
    });
    return card;
}
function parseCsvProfile(text, filename) {
    const lines = [];
    let row = [], field = '', quoted = false;
    for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (quoted && ch === '"' && text[i + 1] === '"') {
            field += '"';
            i++;
        }
        else if (ch === '"')
            quoted = !quoted;
        else if (ch === ',' && !quoted) {
            row.push(field);
            field = '';
        }
        else if ((ch === '\n' || ch === '\r') && !quoted) {
            if (ch === '\r' && text[i + 1] === '\n')
                i++;
            row.push(field);
            if (row.some(v => v.trim()))
                lines.push(row);
            row = [];
            field = '';
        }
        else
            field += ch;
    }
    if (field || row.length) {
        row.push(field);
        lines.push(row);
    }
    if (lines.length < 2)
        throw new Error('This CSV needs a header and at least one data row.');
    const totalColumns = lines[0].length;
    const headers = lines[0].map((h, i) => h.trim() || `Column ${i + 1}`).slice(0, 40);
    const rows = lines.slice(1, 20001).map(values => headers.map((_, i) => { var _a; return ((_a = values[i]) !== null && _a !== void 0 ? _a : '').trim(); }));
    const columns = headers.map((name, index) => {
        const values = rows.map(r => r[index]);
        const present = values.filter(v => v !== '' && !/^(na|n\/a|null|nan)$/i.test(v));
        const nums = present.map(Number);
        const numeric = present.length > 0 && nums.every(Number.isFinite);
        const counts = new Map();
        present.forEach(v => { var _a; return counts.set(v, ((_a = counts.get(v)) !== null && _a !== void 0 ? _a : 0) + 1); });
        const base = { name, type: numeric ? 'numeric' : 'categorical', missing: values.length - present.length, unique: counts.size };
        if (!numeric)
            return { ...base, categories: [...counts].map(([label, count]) => ({ label: label.slice(0, 80), count })).sort((a, b) => b.count - a.count).slice(0, 8) };
        const sorted = [...nums].sort((a, b) => a - b), mean = nums.reduce((a, b) => a + b, 0) / nums.length;
        const variance = nums.reduce((a, b) => a + (b - mean) ** 2, 0) / nums.length;
        const sd = Math.sqrt(variance);
        const skew = sd ? nums.reduce((a, b) => a + ((b - mean) / sd) ** 3, 0) / nums.length : 0;
        const min = sorted[0], max = sorted[sorted.length - 1], bins = Array(12).fill(0);
        nums.forEach(v => bins[max === min ? 0 : Math.min(11, Math.floor((v - min) / (max - min) * 12))]++);
        const median = sorted.length % 2 ? sorted[(sorted.length - 1) / 2] : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2;
        const q1 = sorted[Math.floor((sorted.length - 1) * 0.25)], q3 = sorted[Math.floor((sorted.length - 1) * 0.75)];
        const lower = q1 - 1.5 * (q3 - q1), upper = q3 + 1.5 * (q3 - q1);
        const outliers = nums.filter(v => v < lower || v > upper).length;
        return { ...base, mean: +mean.toPrecision(5), median: +median.toPrecision(5), std: +sd.toPrecision(5), skewness: +skew.toPrecision(4), min, max, outliers, histogram: bins };
    });
    const signatures = new Set();
    let duplicateRows = 0;
    rows.forEach(r => { const key = JSON.stringify(r); if (signatures.has(key))
        duplicateRows++; signatures.add(key); });
    return { filename, rows: lines.length - 1, profiledRows: rows.length, totalColumns, columns, duplicateRows };
}
function injectChatStyles() {
    if (document.getElementById('mm-chatbot-styles')) {
        const existing = document.getElementById('mm-chatbot-styles');
        if (existing)
            existing.remove();
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
function createAIChatbotPanel(settings, getActiveCode, getActiveError, runCodeTrace, loadDecisionTrees, loadNeuralNetworks, loadTrainingSources, trainModel) {
    injectChatStyles();
    const messages = [];
    let currentProvider = 'ollama';
    let isTyping = false;
    let attachedDataset = null;
    let attachedCode = '';
    const conversationHistory = [];
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
            }
            else if (q.includes('latest error')) {
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
        if (event.button !== 0)
            return;
        helperPointerStartX = event.clientX;
        helperScrollStart = helpers.scrollLeft;
        helperPointerDown = true;
        helperDidDrag = false;
    });
    helpers.addEventListener('pointermove', event => {
        if (!helperPointerDown)
            return;
        const distance = event.clientX - helperPointerStartX;
        if (Math.abs(distance) > 5) {
            helperDidDrag = true;
            if (!helpers.hasPointerCapture(event.pointerId))
                helpers.setPointerCapture(event.pointerId);
            helpers.classList.add('is-dragging');
            helpers.scrollLeft = helperScrollStart - distance;
        }
    });
    const finishHelperDrag = () => {
        if (!helperPointerDown)
            return;
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
        if (!suppressHelperClick)
            return;
        event.preventDefault();
        event.stopImmediatePropagation();
        suppressHelperClick = false;
    }, true);
    helpers.addEventListener('wheel', event => {
        if (Math.abs(event.deltaY) <= Math.abs(event.deltaX))
            return;
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
    function showUploadError(error, fallback) {
        const msg = {
            role: 'assistant', timestamp: new Date(), isError: true,
            content: error instanceof Error ? error.message : fallback
        };
        messages.push(msg);
        appendMessage(msg);
    }
    async function handleCsvFile(file) {
        try {
            if (file.size > 10 * 1024 * 1024)
                throw new Error('CSV is larger than 10 MB. Please use a smaller file for chat analysis.');
            const profile = parseCsvProfile(await file.text(), file.name);
            attachedDataset = profile;
            const summary = profile.columns.slice(0, 20).map(col => col.type === 'numeric'
                ? `${col.name}: numeric, mean ${col.mean}, median ${col.median}, skewness ${col.skewness}, missing ${col.missing}`
                : `${col.name}: categorical, ${col.unique} unique values, missing ${col.missing}`).join('\n');
            const msg = {
                role: 'assistant', timestamp: new Date(), datasetProfile: profile,
                content: `I analyzed **${profile.filename}** locally. The profile includes numeric distributions, skewness, missing values, category frequencies, and duplicate rows.\n\n${summary}`
            };
            messages.push(msg);
            appendMessage(msg);
            if (currentProvider === 'ollama') {
                textarea.value = 'Explain the main patterns in this CSV profile, including distributions, skewness, missing data, category balance, duplicates, unusual values, and practical next steps. Cite the measured values and clearly identify any sample-based results.';
                sendMessage();
            }
            else {
                const notice = {
                    role: 'assistant', timestamp: new Date(),
                    content: 'The CSV profile stays local. Switch the provider to Ollama and ask for an explanation to get a model interpretation of these measurements.'
                };
                messages.push(notice);
                appendMessage(notice);
            }
        }
        catch (error) {
            showUploadError(error, 'Could not analyze this CSV.');
        }
    }
    async function handleCodeFile(file) {
        var _a;
        try {
            if (file.size > 100 * 1024)
                throw new Error('Code file is larger than 100 KB. Please choose a smaller file.');
            let content = await file.text();
            if (file.name.toLowerCase().endsWith('.ipynb')) {
                const notebook = JSON.parse(content);
                content = ((_a = notebook.cells) !== null && _a !== void 0 ? _a : []).filter(cell => cell.cell_type === 'code').map(cell => { var _a; return Array.isArray(cell.source) ? cell.source.join('') : (_a = cell.source) !== null && _a !== void 0 ? _a : ''; }).join('\n\n');
            }
            attachedCode = content.slice(0, 3000);
            const msg = {
                role: 'assistant', timestamp: new Date(),
                content: `Loaded **${file.name}** (${content.split(/\r?\n/).length} lines). Use **Explain Code** or ask a question. The file stays on this computer; the selected chat provider receives only the first 3,000 characters when you send a message.`
            };
            messages.push(msg);
            appendMessage(msg);
        }
        catch (error) {
            showUploadError(error, 'Could not read this code file.');
        }
    }
    const csvButton = document.createElement('button');
    csvButton.className = 'mm-chat-helper-btn';
    csvButton.textContent = '📊 Analyze CSV';
    csvButton.addEventListener('click', () => csvInput.click());
    csvInput.addEventListener('change', async () => {
        var _a;
        const file = (_a = csvInput.files) === null || _a === void 0 ? void 0 : _a[0];
        csvInput.value = '';
        if (file)
            await handleCsvFile(file);
    });
    helpers.append(csvButton, csvInput);
    const codeButton = document.createElement('button');
    codeButton.className = 'mm-chat-helper-btn';
    codeButton.textContent = '🧩 Upload Code';
    codeButton.addEventListener('click', () => codeInput.click());
    codeInput.addEventListener('change', async () => {
        var _a;
        const file = (_a = codeInput.files) === null || _a === void 0 ? void 0 : _a[0];
        codeInput.value = '';
        if (file)
            await handleCodeFile(file);
    });
    helpers.append(codeButton, codeInput);
    const helperBtns = [
        { icon: '🌳', label: 'Visualize Tree', action: async () => {
                const msg = {
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
                }
                catch (error) {
                    msg.isError = true;
                    msg.content = error instanceof Error ? error.message : 'Could not inspect fitted decision trees.';
                }
                pending.replaceWith(createMessageBubble(msg, runCodeTrace, getActiveCode, loadDecisionTrees, loadNeuralNetworks, trainModel));
                messagesArea.scrollTop = messagesArea.scrollHeight;
            } },
        { icon: '🧠', label: 'Visualize Neural Network', action: async () => {
                const msg = {
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
                }
                catch (error) {
                    msg.isError = true;
                    msg.content = error instanceof Error ? error.message : 'Could not inspect fitted neural networks.';
                }
                pending.replaceWith(createMessageBubble(msg, runCodeTrace, getActiveCode, loadDecisionTrees, loadNeuralNetworks, trainModel));
                messagesArea.scrollTop = messagesArea.scrollHeight;
            } },
        { icon: '🏋', label: 'Train ML Model', action: async () => {
                const msg = {
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
                }
                catch (error) {
                    msg.isError = true;
                    msg.content = error instanceof Error ? error.message : 'Could not inspect training data in the notebook kernel.';
                }
                pending.replaceWith(createMessageBubble(msg, runCodeTrace, getActiveCode, loadDecisionTrees, loadNeuralNetworks, trainModel));
                messagesArea.scrollTop = messagesArea.scrollHeight;
            } },
        { icon: '🔎', label: 'Visualize Code', action: () => {
                const selectedCell = getActiveCode().trim();
                const code = selectedCell || attachedCode.trim();
                if (!code) {
                    showUploadError(new Error('Select a code cell or upload a code file first.'), 'Select a code cell or upload a code file first.');
                    return;
                }
                const visualization = (0,_code_visualization__rspack_import_3.createCodeVisualization)(code);
                textarea.value = 'Explain this selected Python cell to a beginner. Use exactly these three headings: “What the code shows”, “Why these steps are used”, and “What this does not establish”. Keep each section concise and tie claims to visible code. The source-based diagram is static: this request did not execute the cell. Distinguish calls written in source from results measured at runtime. Do not invent file contents, statistics, model scores, learned splits, weights, predictions, target variables, missingness, bugs, pitfalls, feature relevance, or model evaluation. Treat comments, filenames, and variable names as labels, not measurements. Explain stable library behavior accurately; for example, StandardScaler centers and scales using training-set statistics when fit, and does not remove skewness. Do not add generic workflow advice or suggestions unless I ask for them.';
                adjustTextareaHeight();
                void sendMessage({ activeCode: code, codeVisualization: visualization });
            } },
        { icon: '▶', label: 'Animate Code', action: () => {
                const code = (getActiveCode().trim() || attachedCode).trim();
                if (!code) {
                    showUploadError(new Error('Select a code cell or upload a code file first.'), 'Select a code cell or upload a code file first.');
                    return;
                }
                const msg = {
                    role: 'assistant', timestamp: new Date(), provider: currentProvider,
                    content: 'Confirm Run & trace to capture the executed lines and variable values for this code.',
                    animationCode: code,
                    animationUsesActiveCell: Boolean(getActiveCode().trim())
                };
                messages.push(msg);
                appendMessage(msg);
            } },
        { icon: '📋', label: 'Paste Code', action: () => {
                const code = attachedCode || getActiveCode();
                if (code) {
                    textarea.value += (textarea.value ? '\n' : '') + `\`\`\`python\n${code.slice(0, 3000)}\n\`\`\``;
                    adjustTextareaHeight();
                    textarea.focus();
                }
            } },
        { icon: '🐞', label: 'Paste Error', action: () => {
                const err = getActiveError();
                if (err) {
                    textarea.value += (textarea.value ? '\n' : '') +
                        `Error: ${err.error_type}: ${err.error_message}\n` +
                        (err.traceback ? `Traceback:\n\`\`\`\n${err.traceback.slice(0, 1000)}\n\`\`\`` : '');
                    adjustTextareaHeight();
                    textarea.focus();
                }
            } },
        { icon: '📝', label: 'Explain Code', action: () => {
                const code = attachedCode || getActiveCode();
                if (code) {
                    textarea.value = `Please explain this code in detail:\n\`\`\`python\n${code.slice(0, 3000)}\n\`\`\``;
                    adjustTextareaHeight();
                    textarea.focus();
                }
            } },
    ];
    helperBtns.forEach(({ icon, label, action }) => {
        const btn = document.createElement('button');
        btn.className = 'mm-chat-helper-btn';
        btn.textContent = `${icon} ${label}`;
        btn.addEventListener('click', action);
        helpers.appendChild(btn);
    });
    // The practice notebook chooses a question in its left rail. This button
    // keeps answer checking inside the familiar Ollama/Gemini chat panel rather
    // than adding a second, confusing checker elsewhere in the UI.
    let selectedPracticeQuestionId = '';
    let selectedPracticeQuestionTitle = '';
    const practiceReviewButton = document.createElement('button');
    practiceReviewButton.className = 'mm-chat-helper-btn';
    practiceReviewButton.textContent = '✅ Check this answer';
    practiceReviewButton.disabled = true;
    practiceReviewButton.title = 'Choose a practice question first';
    practiceReviewButton.addEventListener('click', () => {
        void checkPracticeAnswer();
    });
    helpers.appendChild(practiceReviewButton);
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
    async function handleAttachedFiles(files) {
        const selectedFiles = Array.from(files);
        if (selectedFiles.length > 1) {
            showUploadError(new Error('Add one file at a time so I can keep each file’s analysis separate.'), 'Please add one file at a time.');
            return;
        }
        const file = selectedFiles[0];
        if (!file)
            return;
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
        if (files)
            await handleAttachedFiles(files);
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
    function adjustTextareaHeight() {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
    textarea.addEventListener('input', adjustTextareaHeight);
    // Provider switching
    function switchProvider(p) {
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
        }
        else {
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
    async function refreshPlatformStatus() {
        try {
            const keyStatus = await (0,_request__rspack_import_0.requestAPI)('api/settings/gemini-key', settings);
            if (keyStatus.configured) {
                cloudPill.classList.remove('offline');
                cloudPill.innerHTML = '<span class="mm-chatbot-status-dot"></span> Gemini configured';
            }
            else {
                cloudPill.classList.add('offline');
                cloudPill.innerHTML = '<span class="mm-chatbot-status-dot"></span> Gemini unconfigured';
            }
        }
        catch (_a) {
            cloudPill.classList.add('offline');
            cloudPill.innerHTML = '<span class="mm-chatbot-status-dot"></span> Gemini unavailable';
        }
        try {
            const ollama = await (0,_request__rspack_import_0.requestAPI)('api/local-ai/status', settings);
            if (ollama.status === 'connected' && ollama.model_status === 'available') {
                localPill.classList.remove('offline');
                localPill.innerHTML = '<span class="mm-chatbot-status-dot"></span> Ollama (Local AI)';
            }
            else {
                localPill.classList.add('offline');
                localPill.innerHTML = '<span class="mm-chatbot-status-dot"></span> Ollama offline';
            }
        }
        catch (_b) {
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
    function appendMessage(msg) {
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
    async function sendMessage(options = {}) {
        var _a;
        const text = textarea.value.trim();
        if (!text || isTyping)
            return;
        isTyping = true;
        sendBtn.disabled = true;
        textarea.value = '';
        adjustTextareaHeight();
        // Add user message
        const userMsg = { role: 'user', content: text, timestamp: new Date() };
        messages.push(userMsg);
        appendMessage(userMsg);
        // Update history
        conversationHistory.push({ role: 'user', content: text });
        // Show typing indicator
        const typingMsg = { role: 'assistant', content: '', provider: currentProvider, timestamp: new Date(), isStreaming: true };
        const typingEl = appendMessage(typingMsg);
        const codeContext = (_a = options.activeCode) !== null && _a !== void 0 ? _a : (attachedCode || getActiveCode());
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
                const replyMsg = {
                    role: 'assistant',
                    content: result.reply,
                    provider: result.provider || currentProvider,
                    timestamp: new Date(),
                    codeProfile: /explain|walk through|what does this code|how does this code/i.test(text) && codeContext
                        ? summarizeCodeStructure(codeContext)
                        : undefined,
                    codeVisualization: options.codeVisualization,
                    visualizationIds: Array.isArray(result.visualization_ids) ? result.visualization_ids : undefined
                };
                const streamed = await streamAssistantReplyInPlace(typingEl, result.reply, messagesArea);
                if (!streamed)
                    return;
                typingEl.replaceWith(createMessageBubble(replyMsg, runCodeTrace, getActiveCode, loadDecisionTrees, loadNeuralNetworks, trainModel));
                messages.push(replyMsg);
                conversationHistory.push({ role: 'assistant', content: result.reply });
            }
            else {
                typingEl.remove();
                conversationHistory.pop(); // Remove un-replied user message on error
                let errText = 'I could not respond right now.';
                if (result.status === 'model_missing') {
                    errText = '🦙 Ollama model not found. Please install it first via the AI Assistant.';
                }
                else if (result.status === 'ollama_unavailable') {
                    errText = '🦙 Ollama is not running. Start Ollama, or switch to Gemini.';
                }
                else if (result.status === 'chat_unavailable') {
                    errText = '🦙 Ollama is running, but it could not finish this reply. Try again; shorter prompts usually respond faster.';
                }
                else if (result.status === 'context_too_large') {
                    errText = 'This file profile is too large to send to the local model. Try a smaller CSV or ask about fewer columns.';
                }
                else if (result.status === 'model_status_unavailable') {
                    errText = '🦙 Ollama is responding, but the selected model is not ready. Check the AI Assistant model status and try again.';
                }
                else if (result.status === 'gemini_unconfigured') {
                    errText =
                        '✨ Open the 🔑 API Key tab in the right sidebar to save your Gemini key.';
                }
                else if (result.status === 'gemini_unavailable') {
                    errText = result.message ? `✨ ${result.message}` : '✨ Gemini is temporarily unavailable. Try again or switch to Ollama.';
                }
                else if (result.message) {
                    errText = result.message;
                }
                const errMsg = {
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
        }
        catch (e) {
            typingEl.remove();
            conversationHistory.pop(); // Remove un-replied user message on error
            const errMsg = {
                role: 'assistant',
                content: '⚠️ Network error — could not reach the backend. Is the platform running?',
                timestamp: new Date(),
                isError: true,
                provider: currentProvider,
                codeVisualization: options.codeVisualization
            };
            messages.push(errMsg);
            appendMessage(errMsg);
        }
        finally {
            isTyping = false;
            sendBtn.disabled = false;
            textarea.focus();
        }
    }
    async function checkPracticeAnswer() {
        const answer = (attachedCode || getActiveCode()).trim();
        if (!selectedPracticeQuestionId) {
            return;
        }
        if (!answer) {
            const errMsg = {
                role: 'assistant',
                content: 'Write your answer or code in the active answer cell before checking it.',
                timestamp: new Date(),
                isError: true,
                provider: currentProvider
            };
            messages.push(errMsg);
            appendMessage(errMsg);
            return;
        }
        if (isTyping)
            return;
        isTyping = true;
        sendBtn.disabled = true;
        practiceReviewButton.disabled = true;
        const userMsg = {
            role: 'user',
            content: `Check my answer: ${selectedPracticeQuestionTitle || 'practice question'}`,
            timestamp: new Date(),
            provider: currentProvider
        };
        messages.push(userMsg);
        appendMessage(userMsg);
        const typingMsg = {
            role: 'assistant',
            content: '',
            provider: currentProvider,
            timestamp: new Date(),
            isStreaming: true
        };
        const typingEl = appendMessage(typingMsg);
        try {
            const result = await (0,_request__rspack_import_0.requestAPI)('api/practice/review', settings, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question_id: selectedPracticeQuestionId,
                    answer,
                    provider: currentProvider
                })
            });
            if (result.status === 'replied' && result.reply) {
                const replyMsg = {
                    role: 'assistant',
                    content: result.reply,
                    provider: result.provider === 'gemini' ? 'gemini' : currentProvider,
                    timestamp: new Date()
                };
                const streamed = await streamAssistantReplyInPlace(typingEl, result.reply, messagesArea);
                if (streamed) {
                    typingEl.replaceWith(createMessageBubble(replyMsg, runCodeTrace, getActiveCode, loadDecisionTrees, loadNeuralNetworks, trainModel));
                    messages.push(replyMsg);
                }
            }
            else {
                typingEl.remove();
                const message = result.status === 'gemini_unconfigured'
                    ? 'Gemini must be configured before opening Practice Questions. Switch to Ollama or configure Gemini in a regular ModelMind notebook.'
                    : result.message || 'The practice review could not be completed.';
                const errMsg = {
                    role: 'assistant',
                    content: `⚠️ ${message}`,
                    timestamp: new Date(),
                    isError: true,
                    provider: currentProvider
                };
                messages.push(errMsg);
                appendMessage(errMsg);
            }
        }
        catch (error) {
            typingEl.remove();
            const errMsg = {
                role: 'assistant',
                content: `⚠️ ${error instanceof Error ? error.message : 'Could not reach the practice review service.'}`,
                timestamp: new Date(),
                isError: true,
                provider: currentProvider
            };
            messages.push(errMsg);
            appendMessage(errMsg);
        }
        finally {
            isTyping = false;
            sendBtn.disabled = false;
            practiceReviewButton.disabled = !selectedPracticeQuestionId;
            textarea.focus();
        }
    }
    sendBtn.addEventListener('click', () => { void sendMessage(); });
    window.addEventListener('modelmind:practice-question-selected', event => {
        const detail = event.detail;
        const question = detail === null || detail === void 0 ? void 0 : detail.question;
        if (!(question === null || question === void 0 ? void 0 : question.question) || !question.id)
            return;
        selectedPracticeQuestionId = question.id;
        selectedPracticeQuestionTitle = question.title || 'selected practice question';
        practiceReviewButton.disabled = false;
        practiceReviewButton.title = `Check: ${question.title || 'selected practice question'}`;
    });
    textarea.addEventListener('keydown', (e) => {
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
    root.addEventListener('dragenter', (event) => {
        var _a, _b;
        if (!Array.from((_b = (_a = event.dataTransfer) === null || _a === void 0 ? void 0 : _a.types) !== null && _b !== void 0 ? _b : []).includes('Files'))
            return;
        event.preventDefault();
        fileDragDepth += 1;
        root.classList.add('mm-chatbot-dragging-files');
    });
    root.addEventListener('dragover', (event) => {
        var _a, _b;
        if (!Array.from((_b = (_a = event.dataTransfer) === null || _a === void 0 ? void 0 : _a.types) !== null && _b !== void 0 ? _b : []).includes('Files'))
            return;
        event.preventDefault();
        if (event.dataTransfer)
            event.dataTransfer.dropEffect = 'copy';
    });
    root.addEventListener('dragleave', (event) => {
        var _a, _b;
        if (!Array.from((_b = (_a = event.dataTransfer) === null || _a === void 0 ? void 0 : _a.types) !== null && _b !== void 0 ? _b : []).includes('Files'))
            return;
        event.preventDefault();
        fileDragDepth = Math.max(0, fileDragDepth - 1);
        if (fileDragDepth === 0)
            root.classList.remove('mm-chatbot-dragging-files');
    });
    root.addEventListener('drop', event => {
        var _a;
        const files = (_a = event.dataTransfer) === null || _a === void 0 ? void 0 : _a.files;
        if (!(files === null || files === void 0 ? void 0 : files.length))
            return;
        event.preventDefault();
        fileDragDepth = 0;
        root.classList.remove('mm-chatbot-dragging-files');
        void handleAttachedFiles(files);
    });
    return root;
}


},
"./lib/api-key-settings.js"(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  createAPIKeySettingsWidget: () => (createAPIKeySettingsWidget)
});
/* import */ var _lumino_widgets__rspack_import_0 = __webpack_require__("webpack/sharing/consume/default/@lumino/widgets");
/* import */ var _lumino_widgets__rspack_import_0_default = /*#__PURE__*/__webpack_require__.n(_lumino_widgets__rspack_import_0);
/* import */ var _request__rspack_import_1 = __webpack_require__("./lib/request.js");


function createAPIKeySettingsWidget(settings, trans) {
    const widget = new _lumino_widgets__rspack_import_0.Widget();
    widget.id = 'mm-api-key-settings';
    widget.title.label = trans.__('API Key');
    widget.title.caption = trans.__('Manage Gemini credentials stored on this computer');
    widget.addClass('mm-api-key-settings-widget');
    const root = document.createElement('section');
    root.className = 'mm-key-settings';
    const header = document.createElement('header');
    header.className = 'mm-key-settings-header';
    const title = document.createElement('h2');
    title.textContent = 'API Key';
    const subtitle = document.createElement('p');
    subtitle.textContent =
        "Gemini credentials stay in your computer's credential store.";
    header.append(title, subtitle);
    const status = document.createElement('div');
    status.className = 'mm-key-settings-status';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    status.textContent = 'Checking saved credentials...';
    const setStatus = (message, state = 'info') => {
        status.textContent = message;
        status.dataset.state = state;
    };
    const form = document.createElement('form');
    form.className = 'mm-key-settings-form';
    const label = document.createElement('label');
    label.htmlFor = 'mm-gemini-api-key';
    label.textContent = 'Google Gemini API key';
    const input = document.createElement('input');
    input.id = 'mm-gemini-api-key';
    input.type = 'password';
    input.name = 'api_key';
    input.autocomplete = 'new-password';
    input.maxLength = 512;
    input.placeholder = 'Paste your Gemini API key';
    input.required = true;
    input.setAttribute('aria-describedby', 'mm-key-settings-note');
    const actions = document.createElement('div');
    actions.className = 'mm-key-settings-actions';
    const saveButton = document.createElement('button');
    saveButton.type = 'submit';
    saveButton.textContent = 'Save key';
    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.textContent = 'Remove key';
    removeButton.disabled = true;
    actions.append(saveButton, removeButton);
    const note = document.createElement('p');
    note.id = 'mm-key-settings-note';
    note.className = 'mm-key-settings-note';
    note.textContent =
        'The key is never shown again after saving and is not written to a notebook or browser storage. It is stored on the machine running Jupyter Server, so only save it from a server you trust. Gemini requests send the selected code and error context to Google. Ollama stays local.';
    form.append(label, input, actions, note);
    root.append(header, status, form);
    widget.node.appendChild(root);
    const setBusy = (busy) => {
        input.disabled = busy;
        saveButton.disabled = busy;
        removeButton.disabled =
            busy || removeButton.dataset.source !== 'desktop';
    };
    const refreshStatus = async () => {
        try {
            const result = await (0,_request__rspack_import_1.requestAPI)('api/settings/gemini-key', settings);
            removeButton.dataset.source = result.source || '';
            removeButton.disabled = result.source !== 'desktop';
            input.disabled = false;
            saveButton.disabled = false;
            if (result.source === 'desktop') {
                setStatus('Your personal Gemini key is saved in this computer’s credential store.', 'success');
            }
            else if (result.source === 'environment') {
                setStatus('A server Gemini key is configured. Saving here will use your personal key instead.', 'info');
            }
            else {
                setStatus('No Gemini key saved on this computer.', 'warning');
            }
        }
        catch (_a) {
            setStatus('Could not read the system credential store. Check the Jupyter server log.', 'error');
            input.disabled = true;
            saveButton.disabled = true;
            removeButton.disabled = true;
        }
    };
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const apiKey = input.value.trim();
        if (!apiKey) {
            setStatus('Enter a Gemini API key before saving.', 'warning');
            input.focus();
            return;
        }
        setBusy(true);
        setStatus('Saving to the system credential store...');
        try {
            await (0,_request__rspack_import_1.requestAPI)('api/settings/gemini-key', settings, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ api_key: apiKey })
            });
            input.value = '';
            setStatus("Gemini key saved in this computer's credential store.", 'success');
            window.dispatchEvent(new Event('modelmind:gemini-key-updated'));
            await refreshStatus();
        }
        catch (_a) {
            setStatus('Could not save the key. Check that the system credential store is available.', 'error');
        }
        finally {
            setBusy(false);
        }
    });
    removeButton.addEventListener('click', async () => {
        setBusy(true);
        setStatus('Removing saved Gemini key...');
        try {
            await (0,_request__rspack_import_1.requestAPI)('api/settings/gemini-key', settings, {
                method: 'DELETE'
            });
            input.value = '';
            setStatus('Saved Gemini key removed.', 'success');
            window.dispatchEvent(new Event('modelmind:gemini-key-updated'));
            await refreshStatus();
        }
        catch (_a) {
            setStatus('Could not remove the key. Check that the system credential store is available.', 'error');
        }
        finally {
            setBusy(false);
        }
    });
    if (!document.getElementById('mm-key-settings-styles')) {
        const style = document.createElement('style');
        style.id = 'mm-key-settings-styles';
        style.textContent = `
      .mm-key-settings {
        box-sizing: border-box;
        width: 100%; min-width: 0; height: 100%;
        overflow-y: auto; padding: 18px 14px;
        color: #e2e8f0; background: #0f172a;
        font-family: 'Segoe UI', system-ui, sans-serif;
      }
      .mm-key-settings-header {
        margin: -18px -14px 16px; padding: 18px 14px 16px;
        background: linear-gradient(135deg, #1e1b4b, #0f172a);
        border-bottom: 1px solid rgba(167,139,250,.2);
      }
      .mm-key-settings-header h2 { margin: 0; color: #f1f5f9; font-size: 16px; }
      .mm-key-settings-header p, .mm-key-settings-note {
        color: #aab5c8; font-size: 11px; line-height: 1.6;
      }
      .mm-key-settings-header p { margin: 6px 0 0; }
      .mm-key-settings-status {
        box-sizing: border-box; width: 100%; padding: 10px;
        border: 1px solid rgba(167,139,250,.3);
        border-radius: 10px; color: #c4b5fd; background: rgba(30,27,75,.4);
        font-size: 12px; line-height: 1.5;
      }
      .mm-key-settings-status[data-state="success"] {
        border-color: rgba(167,139,250,.38); color: #c4b5fd;
        background: rgba(30,27,75,.48);
      }
      .mm-key-settings-status[data-state="warning"] {
        border-color: rgba(245,158,11,.35); color: #fcd34d;
        background: rgba(120,80,10,.16);
      }
      .mm-key-settings-status[data-state="error"] {
        border-color: rgba(248,113,113,.38); color: #fca5a5;
        background: rgba(127,29,29,.2);
      }
      .mm-key-settings-form { display: flex; flex-direction: column; gap: 9px; margin-top: 18px; }
      .mm-key-settings-form label { color: #dbe4f0; font-size: 11px; font-weight: 600; }
      .mm-key-settings-form input {
        box-sizing: border-box; width: 100%; min-width: 0; padding: 10px;
        border: 1px solid #334155; border-radius: 8px;
        outline: none; color: #f8fafc; background: #1e293b;
        font: inherit; font-size: 13px;
      }
      .mm-key-settings-form input:focus { border-color: #a78bfa; }
      .mm-key-settings-form input::placeholder { color: #aab5c8; opacity: 1; }
      .mm-key-settings-actions { display: flex; gap: 8px; }
      .mm-key-settings-actions button {
        box-sizing: border-box; min-width: 0; min-height: 38px; flex: 1;
        padding: 8px; border: 1px solid #5546a5; border-radius: 8px;
        color: #fff; background: #43358a; font: inherit; font-size: 12px;
        font-weight: 600; cursor: pointer;
      }
      .mm-key-settings-actions button:last-child {
        border-color: #475569; color: #cbd5e1; background: #1e293b;
      }
      .mm-key-settings-actions button:hover:not(:disabled) { filter: brightness(1.12); }
      .mm-key-settings-actions button:disabled { cursor: not-allowed; opacity: .5; }
      .mm-key-settings-note { margin: 2px 0 0; }
    `;
        document.head.appendChild(style);
    }
    void refreshStatus();
    return widget;
}


},
"./lib/cell-error-highlighter.js"(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  clearCellError: () => (clearCellError),
  createErrorBannerElement: () => (createErrorBannerElement),
  ensureErrorHighlightStyles: () => (ensureErrorHighlightStyles),
  highlightCellError: () => (highlightCellError),
  initCellErrorHighlighter: () => (initCellErrorHighlighter),
  parseErrorExplanation: () => (parseErrorExplanation),
  parseErrorLine: () => (parseErrorLine)
});
/**
 * ModelMind — Inline Cell Error Highlighter & Diagnostic Banner
 *
 * When a cell fails execution:
 * 1. Highlights the exact failing line in the code editor with a red background,
 *    red text, and a gutter marker with an error badge.
 * 2. Renders a clean diagnostic banner immediately beneath the code editor:
 *    - Error Type & Line Number (e.g., "ZeroDivisionError — Line 6")
 *    - Friendly human-readable explanation (e.g., "Cannot divide a number by zero.")
 *    - Actionable fix tip (e.g., "Check the denominator before performing division.")
 * 3. Automatically clears the highlight and banner as soon as the student edits
 *    the cell or the cell executes successfully.
 */
/**
 * Injects CSS styles for line highlighting, gutter icons, and the below-editor error banner.
 */
function ensureErrorHighlightStyles() {
    if (typeof document === 'undefined')
        return;
    if (document.getElementById('mm-error-highlight-styles'))
        return;
    const style = document.createElement('style');
    style.id = 'mm-error-highlight-styles';
    style.textContent = `
    /* ── Code Line Error Highlight ── */
    .mm-code-error-line {
      background: rgba(239, 68, 68, 0.16) !important;
      border-left: 3px solid #ef4444 !important;
      padding-left: 4px !important;
      border-radius: 2px !important;
      box-shadow: inset 0 0 0 1px rgba(239, 68, 68, 0.22) !important;
    }
    .mm-code-error-line,
    .mm-code-error-line span {
      color: #ef4444 !important;
    }

    body[data-jp-theme-light="false"] .mm-code-error-line,
    body.jp-theme-dark .mm-code-error-line {
      background: rgba(239, 68, 68, 0.22) !important;
      box-shadow: inset 0 0 0 1px rgba(239, 68, 68, 0.35) !important;
    }
    body[data-jp-theme-light="false"] .mm-code-error-line,
    body[data-jp-theme-light="false"] .mm-code-error-line span,
    body.jp-theme-dark .mm-code-error-line,
    body.jp-theme-dark .mm-code-error-line span {
      color: #f87171 !important;
    }

    /* ── Gutter Error Marker ── */
    .mm-code-error-gutter {
      color: #ef4444 !important;
      font-weight: 750 !important;
      background: rgba(239, 68, 68, 0.14) !important;
      position: relative !important;
      border-radius: 2px 0 0 2px !important;
    }
    .mm-code-error-gutter::before {
      content: "⊗ ";
      color: #ef4444;
      font-weight: 900;
      font-size: 11px;
      display: inline-block;
      margin-right: 2px;
    }

    /* ── Below-Editor Diagnostic Card ── */
    .mm-cell-error-row {
      margin: 6px 0 8px 0 !important;
      width: 100% !important;
      display: flex !important;
      flex-direction: row !important;
      overflow: visible !important;
    }

    .mm-cell-error-card {
      margin: 0 !important;
      padding: 10px 14px;
      border-radius: 6px;
      background: #fff5f5;
      border: 1px solid #fca5a5;
      border-left: 4px solid #ef4444 !important;
      box-shadow: 0 1px 4px rgba(239, 68, 68, 0.08);
      display: flex;
      align-items: flex-start;
      gap: 12px;
      width: 100% !important;
      box-sizing: border-box !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      animation: mm-error-slide-in 0.18s ease-out;
      position: relative;
      z-index: 2;
    }

    @keyframes mm-error-slide-in {
      from { opacity: 0; transform: translateY(-3px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .mm-cell-error-card .mm-card-icon {
      flex-shrink: 0;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: rgba(239, 68, 68, 0.12);
      border: 1.5px solid #ef4444;
      color: #ef4444;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 900;
      margin-top: 1px;
    }

    .mm-cell-error-card .mm-card-body {
      flex: 1;
      min-width: 0;
    }

    .mm-cell-error-card .mm-card-title {
      font-size: 13px;
      font-weight: 750;
      color: #991b1b;
      margin-bottom: 3px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .mm-cell-error-card .mm-card-desc {
      font-size: 12px;
      font-weight: 500;
      color: #1f2937;
      margin-bottom: 3px;
      line-height: 1.45;
    }

    .mm-cell-error-card .mm-card-tip {
      font-size: 11.5px;
      color: #64748b;
      line-height: 1.4;
    }

    .mm-cell-error-card .mm-card-dismiss {
      background: transparent;
      border: none;
      color: #9ca3af;
      font-size: 14px;
      line-height: 1;
      cursor: pointer;
      padding: 2px 4px;
      border-radius: 4px;
      transition: color 0.15s ease;
    }
    .mm-cell-error-card .mm-card-dismiss:hover {
      color: #ef4444;
    }

    /* ── Dark Theme Overrides ── */
    body[data-jp-theme-light="false"] .mm-cell-error-card,
    body.jp-theme-dark .mm-cell-error-card {
      background: #1c1917 !important;
      border: 1px solid rgba(239, 68, 68, 0.35) !important;
      border-left: 4px solid #ef4444 !important;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.45) !important;
    }
    body[data-jp-theme-light="false"] .mm-cell-error-card .mm-card-title,
    body.jp-theme-dark .mm-cell-error-card .mm-card-title {
      color: #ffffff !important;
    }
    body[data-jp-theme-light="false"] .mm-cell-error-card .mm-card-desc,
    body.jp-theme-dark .mm-cell-error-card .mm-card-desc {
      color: #f1f5f9 !important;
    }
    body[data-jp-theme-light="false"] .mm-cell-error-card .mm-card-tip,
    body.jp-theme-dark .mm-cell-error-card .mm-card-tip {
      color: #94a3b8 !important;
    }
  `;
    document.head.appendChild(style);
}
/**
 * Parses the failing line number from a Python execution traceback.
 */
function parseErrorLine(traceback, code) {
    if (!traceback)
        return null;
    const lines = code ? code.split('\n') : [];
    const maxLine = lines.length > 0 ? lines.length : 10000;
    // 1. Check for IPython 8+ / Jupyter "Cell In[N], line X"
    const cellInRegex = /Cell In\[\d+\],\s*line\s*(\d+)/gi;
    let cellMatches = [];
    let m;
    while ((m = cellInRegex.exec(traceback)) !== null) {
        const val = parseInt(m[1], 10);
        if (!isNaN(val) && val > 0) {
            cellMatches.push(val);
        }
    }
    if (cellMatches.length > 0) {
        const candidate = cellMatches[cellMatches.length - 1];
        if (candidate <= maxLine)
            return candidate;
    }
    // 2. Check for "<ipython-input-...", line X
    const ipyRegex = /<ipython-input-[^>]+>.*?line\s*(\d+)/gi;
    let ipyMatches = [];
    while ((m = ipyRegex.exec(traceback)) !== null) {
        const val = parseInt(m[1], 10);
        if (!isNaN(val) && val > 0) {
            ipyMatches.push(val);
        }
    }
    if (ipyMatches.length > 0) {
        const candidate = ipyMatches[ipyMatches.length - 1];
        if (candidate <= maxLine)
            return candidate;
    }
    // 3. Check for execution pointer arrows: "----> 6" or "---> 6"
    const arrowRegex = /-{2,4}>\s*(\d+)/g;
    let arrowMatches = [];
    while ((m = arrowRegex.exec(traceback)) !== null) {
        const val = parseInt(m[1], 10);
        if (!isNaN(val) && val > 0) {
            arrowMatches.push(val);
        }
    }
    if (arrowMatches.length > 0) {
        const candidate = arrowMatches[arrowMatches.length - 1];
        if (candidate <= maxLine)
            return candidate;
    }
    // 4. Fallback: generic "line X"
    const genericRegex = /\bline\s*(\d+)/gi;
    let genericMatches = [];
    while ((m = genericRegex.exec(traceback)) !== null) {
        const val = parseInt(m[1], 10);
        if (!isNaN(val) && val > 0) {
            genericMatches.push(val);
        }
    }
    if (genericMatches.length > 0) {
        for (let i = genericMatches.length - 1; i >= 0; i--) {
            if (genericMatches[i] <= maxLine) {
                return genericMatches[i];
            }
        }
        return genericMatches[genericMatches.length - 1];
    }
    return null;
}
/**
 * Returns a human-friendly explanation and actionable fix tip for common Python & ML errors.
 */
function parseErrorExplanation(errorType, errorMessage, errorLine) {
    const normType = (errorType || '').trim();
    const msg = (errorMessage || '').trim();
    const lineStr = errorLine ? `Line ${errorLine}` : 'this line';
    switch (normType) {
        case 'ZeroDivisionError':
            return {
                explanation: 'Cannot divide a number by zero.',
                tip: 'Check the denominator before performing division, or guard with an if-condition.'
            };
        case 'SyntaxError': {
            if (msg.includes("')' was never closed") || msg.includes("'(' was never closed")) {
                return {
                    explanation: "Unclosed parenthesis: '(' was never closed.",
                    tip: "Add the closing parenthesis ')' to complete the function call or expression."
                };
            }
            if (msg.includes("']' was never closed") || msg.includes("'[' was never closed")) {
                return {
                    explanation: "Unclosed bracket: '[' was never closed.",
                    tip: "Add the closing bracket ']' to close the list or index slice."
                };
            }
            if (msg.includes("'}' was never closed") || msg.includes("'{' was never closed")) {
                return {
                    explanation: "Unclosed brace: '{' was never closed.",
                    tip: "Add the closing brace '}' to close the dictionary or set."
                };
            }
            if (msg.includes('invalid syntax') || msg.includes("expected ':'")) {
                return {
                    explanation: 'Invalid syntax on or near this line.',
                    tip: "Check for a missing colon ':' at the end of an if/for/def statement, or typos in keywords."
                };
            }
            if (msg.includes('unterminated string literal')) {
                return {
                    explanation: 'Unterminated string literal: missing matching quote.',
                    tip: "Ensure opening quotes (' or \") have a corresponding closing quote on the same line."
                };
            }
            return {
                explanation: msg ? `Python syntax error: ${msg}.` : 'Python could not parse this line of code.',
                tip: 'Check for unmatched parentheses, brackets, quotes, or a missing colon.'
            };
        }
        case 'NameError': {
            const match = msg.match(/name '([^']+)' is not defined/);
            const varName = match ? `'${match[1]}'` : 'Variable or name';
            return {
                explanation: `${varName} is not defined in this notebook session.`,
                tip: `Check for spelling typos, or execute the cell where ${varName} is defined or imported first.`
            };
        }
        case 'TypeError': {
            if (msg.includes('unsupported operand type')) {
                return {
                    explanation: 'Unsupported operand type: incompatible types cannot be combined.',
                    tip: 'Convert data types explicitly using int(), float(), or str(), or check types with type().'
                };
            }
            if (msg.includes('takes') && msg.includes('positional argument')) {
                return {
                    explanation: 'Function called with an incorrect number of arguments.',
                    tip: 'Check the function signature or documentation for required parameters.'
                };
            }
            if (msg.includes("'NoneType' object")) {
                return {
                    explanation: 'Variable is None instead of an expected object or function.',
                    tip: 'Check if a preceding function returned None or if an assignment was missed.'
                };
            }
            if (msg.includes('not callable')) {
                return {
                    explanation: 'Object is not callable: attempting to call a non-function as a function.',
                    tip: 'Check if a function name was overwritten by a variable assignment (e.g. str = "abc").'
                };
            }
            return {
                explanation: msg ? `Type error: ${msg}.` : 'Incompatible data type passed to operation.',
                tip: 'Verify variable data types before performing this operation.'
            };
        }
        case 'ValueError':
            return {
                explanation: msg ? `Value error: ${msg}.` : 'Inappropriate value passed to an operation or function.',
                tip: 'Check input values, array dimensions, or valid parameter ranges.'
            };
        case 'KeyError': {
            const keyMatch = msg.match(/['"]([^'"]+)['"]/);
            const keyName = keyMatch ? `'${keyMatch[1]}'` : 'Key';
            return {
                explanation: `Key or DataFrame column ${keyName} was not found.`,
                tip: 'Check df.columns or dict.keys() to confirm the exact name and capitalization.'
            };
        }
        case 'IndexError':
            return {
                explanation: 'List or sequence index is out of range.',
                tip: 'Check the length using len() to ensure the index is between 0 and len - 1.'
            };
        case 'AttributeError': {
            const attrMatch = msg.match(/'([^']+)' object has no attribute '([^']+)'/);
            if (attrMatch) {
                return {
                    explanation: `'${attrMatch[1]}' object has no attribute or method '${attrMatch[2]}'.`,
                    tip: `Check spelling or use dir(${attrMatch[1]}) to list all available methods and attributes.`
                };
            }
            return {
                explanation: msg ? `Attribute error: ${msg}.` : 'The object does not have the specified attribute.',
                tip: 'Check the object type and verify available attributes and methods.'
            };
        }
        case 'ModuleNotFoundError':
        case 'ImportError': {
            const modMatch = msg.match(/No module named '([^']+)'/);
            const modName = modMatch ? modMatch[1] : 'package';
            return {
                explanation: `Module '${modName}' is not installed or cannot be imported.`,
                tip: `Install it by running !pip install ${modName} in a new cell, then re-run this cell.`
            };
        }
        case 'FileNotFoundError':
            return {
                explanation: 'The specified file or directory path does not exist.',
                tip: 'Check the file path spelling, or use os.path.exists() and os.getcwd() to locate it.'
            };
        case 'IndentationError':
            return {
                explanation: 'Indentation is misaligned or unexpected.',
                tip: "Use consistent 4-space indentation for every code block after a line ending in ':'."
            };
        default:
            return {
                explanation: msg || `An error occurred during execution on ${lineStr}.`,
                tip: `Inspect line ${errorLine !== null && errorLine !== void 0 ? errorLine : ''} in the active cell and verify preceding variable values.`
            };
    }
}
/**
 * Creates the clean diagnostic banner element matching the user's design.
 */
function createErrorBannerElement(details) {
    const card = document.createElement('div');
    card.className = 'mm-cell-error-card';
    const icon = document.createElement('div');
    icon.className = 'mm-card-icon';
    icon.textContent = '!';
    const body = document.createElement('div');
    body.className = 'mm-card-body';
    const title = document.createElement('div');
    title.className = 'mm-card-title';
    const lineLabel = details.errorLine ? ` — Line ${details.errorLine}` : '';
    title.textContent = `${details.errorType}${lineLabel}`;
    const desc = document.createElement('div');
    desc.className = 'mm-card-desc';
    desc.textContent = details.explanation;
    const tip = document.createElement('div');
    tip.className = 'mm-card-tip';
    tip.textContent = details.tip;
    body.append(title, desc, tip);
    const dismiss = document.createElement('button');
    dismiss.type = 'button';
    dismiss.className = 'mm-card-dismiss';
    dismiss.textContent = '✕';
    dismiss.title = 'Dismiss error banner';
    dismiss.addEventListener('click', () => {
        var _a;
        (_a = details.onDismiss) === null || _a === void 0 ? void 0 : _a.call(details);
        card.remove();
    });
    card.append(icon, body, dismiss);
    return card;
}
// Map to track active mutation observers and cleanup callbacks per cell node
const _activeCellObservers = new WeakMap();
const _activeCellCleanups = new WeakMap();
/**
 * Applies error line styling and the diagnostic banner to a notebook cell.
 */
function highlightCellError(cell, error) {
    if (!cell || !cell.node)
        return;
    ensureErrorHighlightStyles();
    // Clear any existing error state on this cell first
    clearCellError(cell);
    const errorLine = parseErrorLine(error.traceback, error.code);
    const { explanation, tip } = parseErrorExplanation(error.error_type, error.error_message, errorLine);
    const cellNode = cell.node;
    // ── 1. Apply code line highlighting in CodeMirror ──
    const applyHighlights = (shouldScroll = false) => {
        var _a, _b;
        if (!errorLine || errorLine <= 0)
            return;
        const content = cellNode.querySelector('.cm-content');
        if (!content)
            return;
        const lines = Array.from(content.querySelectorAll(':scope > .cm-line'));
        if (lines.length === 0)
            return;
        const targetIndex = errorLine - 1;
        let targetLine = null;
        if (targetIndex >= 0 && targetIndex < lines.length) {
            targetLine = lines[targetIndex];
        }
        else {
            // Fallback matching by line text
            const codeLines = (error.code || '').split('\n');
            const targetText = ((_a = codeLines[targetIndex]) !== null && _a !== void 0 ? _a : '').trim();
            if (targetText) {
                targetLine =
                    (_b = lines.find(l => (l.textContent || '').trim() === targetText)) !== null && _b !== void 0 ? _b : null;
            }
        }
        if (targetLine) {
            if (!targetLine.classList.contains('mm-code-error-line')) {
                cellNode.querySelectorAll('.mm-code-error-line').forEach(el => {
                    if (el !== targetLine)
                        el.classList.remove('mm-code-error-line');
                });
                targetLine.classList.add('mm-code-error-line');
            }
            // ONLY scroll on initial error notification, NEVER during user scrolling
            if (shouldScroll) {
                try {
                    targetLine.scrollIntoView({ behavior: 'auto', block: 'nearest' });
                }
                catch (_c) {
                    // ignore scroll error
                }
            }
        }
        // Update gutter element only if not already active
        const gutterContainer = cellNode.querySelector('.cm-gutter.cm-lineNumbers');
        if (gutterContainer) {
            const activeGutter = gutterContainer.querySelector('.mm-code-error-gutter');
            if (!activeGutter ||
                (activeGutter.textContent || '').trim() !== String(errorLine)) {
                if (activeGutter) {
                    activeGutter.classList.remove('mm-code-error-gutter');
                }
                const gutterElements = Array.from(gutterContainer.querySelectorAll('.cm-gutterElement'));
                for (const gutterEl of gutterElements) {
                    if ((gutterEl.textContent || '').trim() === String(errorLine)) {
                        gutterEl.classList.add('mm-code-error-gutter');
                        break;
                    }
                }
            }
        }
    };
    // Run once immediately on execution error (with instant one-time scrollIntoView)
    applyHighlights(true);
    // Throttled observer that only runs when CodeMirror adds/removes elements, NEVER scrolls
    const content = cellNode.querySelector('.cm-content');
    if (content) {
        let rafPending = false;
        const observer = new MutationObserver(() => {
            if (rafPending)
                return;
            rafPending = true;
            requestAnimationFrame(() => {
                rafPending = false;
                applyHighlights(false);
            });
        });
        observer.observe(content, { childList: true });
        _activeCellObservers.set(cellNode, observer);
    }
    // ── 2. Render diagnostic banner aligned properly with editor borders ──
    const banner = createErrorBannerElement({
        errorType: error.error_type,
        errorLine,
        explanation,
        tip,
        onDismiss: () => {
            clearCellError(cell);
        }
    });
    const outputArea = cellNode.querySelector('.jp-Cell-outputArea') ||
        cellNode.querySelector('.jp-OutputArea');
    const inputWrapper = cellNode.querySelector('.jp-Cell-inputWrapper');
    if (outputArea) {
        const row = document.createElement('div');
        row.className = 'jp-OutputArea-child mm-cell-error-row';
        row.style.cssText =
            'margin: 6px 0 8px 0; width: 100%; display: flex; flex-direction: row;';
        const prompt = document.createElement('div');
        prompt.className = 'jp-OutputPrompt';
        prompt.style.cssText = 'visibility: hidden;';
        const outputBody = document.createElement('div');
        outputBody.className = 'jp-OutputArea-output';
        outputBody.style.cssText =
            'flex: 1 1 auto; padding: 0; min-width: 0; overflow: visible;';
        outputBody.appendChild(banner);
        row.append(prompt, outputBody);
        outputArea.insertBefore(row, outputArea.firstChild);
    }
    else if (inputWrapper && inputWrapper.parentNode) {
        const row = document.createElement('div');
        row.className = 'jp-Cell-inputWrapper mm-cell-error-row';
        row.style.cssText =
            'margin: 6px 0 8px 0; width: 100%; display: flex; flex-direction: row;';
        const prompt = document.createElement('div');
        prompt.className = 'jp-InputPrompt';
        prompt.style.cssText = 'visibility: hidden;';
        const body = document.createElement('div');
        body.style.cssText = 'flex: 1 1 auto; padding: 0; min-width: 0;';
        body.appendChild(banner);
        row.append(prompt, body);
        inputWrapper.parentNode.insertBefore(row, inputWrapper.nextSibling);
    }
    // ── 3. Register auto-cleanup when the student modifies the cell content ──
    if (cell.model && cell.model.contentChanged) {
        const onContentChanged = () => {
            clearCellError(cell);
        };
        cell.model.contentChanged.connect(onContentChanged);
        _activeCellCleanups.set(cell, () => {
            try {
                cell.model.contentChanged.disconnect(onContentChanged);
            }
            catch (_a) {
                // disconnected
            }
        });
    }
}
/**
 * Removes all error highlights, gutter badges, and diagnostic banners from a cell.
 */
function clearCellError(cell) {
    if (!cell || !cell.node)
        return;
    const cellNode = cell.node;
    // Disconnect MutationObserver
    const observer = _activeCellObservers.get(cellNode);
    if (observer) {
        observer.disconnect();
        _activeCellObservers.delete(cellNode);
    }
    // Disconnect contentChanged signal listener
    const cleanup = _activeCellCleanups.get(cell);
    if (cleanup) {
        cleanup();
        _activeCellCleanups.delete(cell);
    }
    // Remove line and gutter classes
    cellNode.querySelectorAll('.mm-code-error-line').forEach(el => {
        el.classList.remove('mm-code-error-line');
    });
    cellNode.querySelectorAll('.mm-code-error-gutter').forEach(el => {
        el.classList.remove('mm-code-error-gutter');
    });
    // Remove error row and card
    cellNode
        .querySelectorAll('.mm-cell-error-row, .mm-cell-error-card')
        .forEach(el => {
        el.remove();
    });
}
/**
 * Initializes error line highlighting across all notebook cells in ModelMind Notebook.
 */
function initCellErrorHighlighter(notebooks, notebookActions) {
    ensureErrorHighlightStyles();
    if (notebookActions && notebookActions.executed) {
        notebookActions.executed.connect((_, args) => {
            const { cell, success } = args;
            if (!cell)
                return;
            if (success) {
                clearCellError(cell);
                return;
            }
            // Execution failed: extract error and highlight
            setTimeout(() => {
                const model = cell.model;
                if (!model || !model.outputs)
                    return;
                let errorOutput = null;
                const outputs = model.outputs.toJSON();
                for (let i = outputs.length - 1; i >= 0; i--) {
                    if (outputs[i].output_type === 'error') {
                        errorOutput = outputs[i];
                        break;
                    }
                }
                if (errorOutput) {
                    const source = model.toJSON().source;
                    const code = Array.isArray(source) ? source.join('') : String(source || '');
                    highlightCellError(cell, {
                        error_type: String(errorOutput.ename || 'RuntimeError'),
                        error_message: String(errorOutput.evalue || ''),
                        traceback: Array.isArray(errorOutput.traceback)
                            ? errorOutput.traceback.join('\n')
                            : String(errorOutput.traceback || ''),
                        code
                    });
                }
            }, 40);
        });
    }
}


},
"./lib/code-visualization.js"(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  createCodeVisualization: () => (createCodeVisualization)
});
/* import */ var _visualization_registry__rspack_import_0 = __webpack_require__("./lib/visualization-registry.js");
/** Source-only visual summaries for the AI chatbot. This module never runs code. */

function lineFor(code, pattern) {
    const lines = code.split(/\r?\n/);
    const index = lines.findIndex(line => pattern.test(line));
    return index < 0 ? undefined : index + 1;
}
function sourceValue(code, name) {
    var _a;
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const match = code.match(new RegExp(`\\b${escaped}\\s*=\\s*(\\([^)]*\\)|[^,\\n)]+)`));
    return (_a = match === null || match === void 0 ? void 0 : match[1]) === null || _a === void 0 ? void 0 : _a.trim();
}
function literalInteger(value) {
    if (!value)
        return null;
    const match = value.match(/^\(?\s*(\d+)\s*\)?$/);
    if (!match)
        return null;
    const parsed = Number(match[1]);
    return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}
function literalIntegerList(value) {
    var _a, _b;
    if (!value)
        return [];
    const numbers = (_b = (_a = value.match(/\d+/g)) === null || _a === void 0 ? void 0 : _a.map(Number)) !== null && _b !== void 0 ? _b : [];
    return numbers.length && numbers.every(number => Number.isSafeInteger(number) && number > 0)
        ? numbers.slice(0, 5)
        : [];
}
function namedPipelineSteps(code) {
    const tupleNames = (block) => {
        const names = [];
        const pattern = /\(\s*['"]([^'"]+)['"]\s*,/g;
        let item;
        while ((item = pattern.exec(block)) && names.length < 7)
            names.push(item[1]);
        return names;
    };
    const branches = code.match(/transformers\s*=\s*\[([\s\S]*?)\]/);
    const outerBranches = branches ? tupleNames(branches[1]) : [];
    const innerSteps = [];
    const pipelineStepBlocks = /steps\s*=\s*\[([\s\S]*?)\]/g;
    let item;
    while ((item = pipelineStepBlocks.exec(code)) && innerSteps.length < 7) {
        innerSteps.push(...tupleNames(item[1]).slice(0, 7 - innerSteps.length));
    }
    const stages = [...outerBranches, ...innerSteps];
    return stages.length ? stages.slice(0, 7) : tupleNames(code).slice(0, 7);
}
function sourceLineForStage(code, name) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return lineFor(code, new RegExp(`[\\"']${escaped}[\\"']\\s*,`));
}
function genericFlow(code) {
    const rows = code.split(/\r?\n/);
    const steps = [];
    rows.forEach((raw, index) => {
        const line = raw.trim();
        if (!line || line.startsWith('#'))
            return;
        let title = 'Python statement';
        let detail = 'The expression is evaluated in the current program state.';
        if (/^(?:from\s+\S+\s+import|import)\b/.test(line)) {
            title = 'Load dependency';
            detail = 'Makes a module or selected names available to later code.';
        }
        else if (/^(?:async\s+)?def\s+/.test(line)) {
            title = 'Define function';
            detail = 'Creates a reusable function; its body runs when the function is called.';
        }
        else if (/^class\s+/.test(line)) {
            title = 'Define class';
            detail = 'Declares a type and its behavior; instances are created separately.';
        }
        else if (/^(?:if|elif|else|try|except|finally)\b/.test(line)) {
            title = 'Choose a path';
            detail = 'The runtime condition or outcome determines which indented block runs.';
        }
        else if (/^(?:for|while|async\s+for)\b/.test(line)) {
            title = 'Repeat a block';
            detail = 'The indented body may run repeatedly; the actual number of passes depends on runtime values.';
        }
        else if (/\.(?:read_csv|read_parquet|read_excel)\s*\(/.test(line) || /\bread_csv\s*\(/.test(line)) {
            title = 'Load data';
            detail = 'Reads a table from the source named in this call; the file contents are not inspected here.';
        }
        else if (/\.(?:fit|fit_transform)\s*\(/.test(line)) {
            title = 'Fit / learn';
            detail = 'Requests that the estimator or transformer learn from the supplied data.';
        }
        else if (/\.(?:predict|predict_proba)\s*\(/.test(line)) {
            title = 'Predict';
            detail = 'Requests predictions from the estimator; no prediction is computed by this preview.';
        }
        else if (/\.(?:transform|impute|scale|encode)\s*\(/.test(line)) {
            title = 'Transform features';
            detail = 'Applies a data-preparation step to its input.';
        }
        else if (/\.(?:plot|hist|bar|scatter|show|savefig)\s*\(/.test(line)) {
            title = 'Create visualization';
            detail = 'Builds or displays a chart when the line is executed.';
        }
        else if (/^return\b/.test(line)) {
            title = 'Return value';
            detail = 'Exits the current function and passes a value to its caller.';
        }
        else if (/^print\s*\(|^display\s*\(/.test(line)) {
            title = 'Show output';
            detail = 'Writes a value to notebook output when the line runs.';
        }
        else if (/^[\w.\[\]]+\s*(?:[+\-*/]?=)/.test(line)) {
            title = 'Set or update value';
            detail = 'Evaluates the right-hand expression and stores it in a name or location.';
        }
        steps.push({ title, detail, line: index + 1 });
    });
    const visible = steps.slice(0, 7);
    if (steps.length > visible.length) {
        visible.push({ title: 'More source code', detail: `${steps.length - 7} additional nonblank statement(s) are omitted from this compact overview.` });
    }
    if (!visible.length) {
        visible.push({ title: 'Selected source', detail: 'This cell has no recognizable executable statements to arrange into a flow.' });
    }
    return {
        kind: 'code-flow',
        title: 'Selected-cell code flow',
        summary: 'A static, line-ordered overview of recognizable Python statements.',
        steps: visible,
        sourceFacts: steps.slice(0, 5).map(step => `Line ${step.line}: ${step.title.toLowerCase()} — ${step.detail}`),
        limits: ['This preview does not execute the cell, read local files, or compute runtime values.'],
        sourceNote: 'This is a source-code reading aid. Conditions, loop counts, values, and outputs depend on execution and are not inferred.'
    };
}
function buildSourceOverlays(source) {
    const lines = source.split(/\r?\n/);
    const overlays = [];
    const indentOf = (line) => { var _a, _b; return (_b = (_a = line.match(/^\s*/)) === null || _a === void 0 ? void 0 : _a[0].replace(/\t/g, '    ').length) !== null && _b !== void 0 ? _b : 0; };
    const structure = [];
    lines.forEach((raw, index) => {
        var _a;
        const text = raw.trim();
        if (!text || text.startsWith('#'))
            return;
        const match = text.match(/^(if|elif|else|for|while|try|except|finally|with|def|async\s+def|return|break|continue)\b(.*)/);
        if (!match)
            return;
        const keyword = match[1].replace(/\s+/g, ' ');
        const depth = Math.min(8, Math.floor(indentOf(raw) / 4));
        const roles = {
            if: 'Condition', elif: 'Alternative condition', else: 'Alternate branch', for: 'Loop', while: 'Loop',
            try: 'Protected block', except: 'Error branch', finally: 'Cleanup branch', with: 'Context block',
            def: 'Function', 'async def': 'Async function', return: 'Return', break: 'Loop exit', continue: 'Next iteration'
        };
        structure.push({ title: `${(_a = roles[keyword]) !== null && _a !== void 0 ? _a : 'Statement'}${match[2] ? ` · ${match[2].trim().replace(/:$/, '')}` : ''}`, detail: 'Read from the source line; this map does not evaluate conditions or choose a runtime path.', line: index + 1, indent: depth });
    });
    if (structure.length) {
        overlays.push({
            id: 'C01',
            title: 'Control-flow outline',
            summary: 'Branch, loop, function, and exit statements in source order, nested by indentation. This is a structural outline, not an executed path.',
            steps: structure.slice(0, 24)
        });
    }
    const functionDefs = [];
    const definitionPattern = /^[ \t]*(?:async[ \t]+)?def[ \t]+(\w+)[ \t]*\(/gm;
    let definition;
    while ((definition = definitionPattern.exec(source)) !== null) {
        functionDefs.push({ name: definition[1], start: definition.index });
    }
    const recursive = [];
    functionDefs.forEach(({ name, start }) => {
        var _a;
        const startLine = source.slice(0, start).split(/\r?\n/).length;
        const defIndent = indentOf((_a = lines[startLine - 1]) !== null && _a !== void 0 ? _a : '');
        let endLine = lines.length;
        for (let index = startLine; index < lines.length; index += 1) {
            if (lines[index].trim() && indentOf(lines[index]) <= defIndent) {
                endLine = index;
                break;
            }
        }
        const body = lines.slice(startLine, endLine).join('\n').replace(/^\s*#.*$/gm, '');
        const callPattern = new RegExp(`\\b${name}\\s*\\(`);
        const callLine = body.split(/\r?\n/).findIndex(line => callPattern.test(line));
        if (callLine >= 0)
            recursive.push({ title: `${name}() calls itself`, detail: 'A recursive call is present in the function body. Recursion depth, termination, and returned values depend on runtime input.', line: startLine + callLine + 1 });
    });
    if (recursive.length) {
        overlays.push({ id: 'C05', title: 'Recursive-call structure', summary: 'Self-calls found by matching function names in their source bodies; no call tree is executed or inferred.', steps: recursive.slice(0, 8) });
    }
    const arraySteps = [];
    lines.forEach((raw, index) => {
        if (/\b(?:reshape|transpose|ravel|flatten|stack|concatenate|vstack|hstack|array|asarray)\s*\(|\.shape\b/.test(raw) && !raw.trim().startsWith('#')) {
            arraySteps.push({ title: 'Array or shape operation', detail: raw.trim().slice(0, 150), line: index + 1 });
        }
    });
    if (arraySteps.length) {
        overlays.push({ id: 'C07', title: 'Array and shape operations', summary: 'Source operations that create, reshape, combine, or inspect array dimensions. Actual dimensions appear only when values are inspected at runtime.', steps: arraySteps.slice(0, 12) });
    }
    const sortSteps = [];
    lines.forEach((raw, index) => {
        if (/\bsorted\s*\(|\.sort\s*\(/.test(raw) && !raw.trim().startsWith('#')) {
            sortSteps.push({ title: 'Sorting operation', detail: 'A built-in sorted() call or in-place .sort() call appears in the source; no values are sorted by this preview.', line: index + 1 });
        }
    });
    if (sortSteps.length) {
        overlays.push({ id: 'C10', title: 'Sorting source map', summary: 'Sorting call sites are identified. A before/after animation requires actual input values and an explicit run.', steps: sortSteps.slice(0, 8) });
    }
    const binarySearch = [];
    lines.forEach((raw, index) => {
        if (/\bbisect_(?:left|right)\s*\(|\bbinary_search\s*\(/.test(raw) && !raw.trim().startsWith('#')) {
            binarySearch.push({ title: 'Binary-search operation', detail: 'A bisect or explicitly named binary_search call appears in the source; the searched values and result are not evaluated here.', line: index + 1 });
        }
    });
    if (binarySearch.length) {
        overlays.push({ id: 'C11', title: 'Binary-search source map', summary: 'Recognized search calls are shown with their source locations; no sortedness or search result is assumed.', steps: binarySearch.slice(0, 8) });
    }
    const loopLines = [];
    lines.forEach((raw, index) => {
        if (/^(?:\s*)(?:for|while)\b/.test(raw))
            loopLines.push({ line: index + 1, depth: indentOf(raw) });
    });
    if (loopLines.length) {
        const maxDepth = Math.max(...loopLines.map(item => item.depth));
        overlays.push({
            id: 'C12',
            title: 'Complexity cues',
            summary: 'Static hints only. Input sizes, early exits, called functions, and runtime values are not known, so this view does not assign a Big-O bound.',
            steps: [
                { title: `${loopLines.length} loop header(s)`, detail: maxDepth >= 4 ? 'At least one loop is nested inside another loop by source indentation; this can increase work as input grows, but does not establish a bound.' : 'A loop is present; its iteration count depends on its iterable or stopping condition.', line: loopLines[0].line },
                ...(recursive.length ? [{ title: 'Recursive call(s) also present', detail: 'Recurrence cost cannot be established without input-size progress and a termination condition.' }] : []),
                ...(sortSteps.length ? [{ title: 'Sorting call(s) also present', detail: 'Sorting cost depends on the number of elements and the selected implementation.' }] : [])
            ]
        });
    }
    return overlays;
}
/** Build a conservative visualization from source text; never imports, evaluates, or executes it. */
function buildCodeVisualization(code) {
    var _a, _b, _c;
    const source = code.slice(0, 3000);
    const mlp = source.match(/\bMLP(?:Classifier|Regressor)\b/);
    if (mlp) {
        const hiddenSizes = literalIntegerList(sourceValue(source, 'hidden_layer_sizes'));
        const layers = [
            { label: 'Input features', units: null },
            ...(hiddenSizes.length
                ? hiddenSizes.map((units, index) => ({ label: `Hidden ${index + 1}`, units }))
                : [{ label: 'Hidden layer(s)', units: null }]),
            { label: 'Output', units: null }
        ];
        return {
            kind: 'neural-network',
            title: 'Neural-network architecture in source',
            summary: `${mlp[0]} is declared in this cell. The diagram shows layer flow; the input/output widths are unknown unless the fitted model is inspected.`,
            layers,
            steps: [{ title: 'Source declaration', detail: `${mlp[0]} appears in the selected code.`, line: lineFor(source, /\bMLP(?:Classifier|Regressor)\b/) }],
            sourceFacts: [
                `${mlp[0]} is named in the selected source.`,
                ...(hiddenSizes.length ? [`The literal hidden_layer_sizes setting is (${hiddenSizes.join(', ')}).`] : [])
            ],
            limits: ['This source preview does not show fitted weights, activations, predictions, or measured accuracy.'],
            sourceNote: hiddenSizes.length
                ? `Hidden-layer sizes ${hiddenSizes.join(' → ')} were read from the literal hidden_layer_sizes setting. No weights, learned activations, or predictions are shown.`
                : 'No literal hidden_layer_sizes value was found. Layer widths, learned weights, activations, and predictions are not shown.'
        };
    }
    if (/\bDecisionTree(?:Classifier|Regressor)\b/.test(source)) {
        const isRegression = /\bDecisionTreeRegressor\b/.test(source);
        return {
            kind: 'decision-tree',
            title: 'Decision-tree concept in source',
            summary: `The code declares a ${isRegression ? 'regression' : 'classification'} decision tree.`,
            steps: [
                { title: 'Input features', detail: 'The estimator receives feature rows when fit or predict is called.' },
                { title: 'Feature test', detail: 'A fitted tree learns a feature and threshold for each split; this source preview does not invent either.' },
                { title: isRegression ? 'Numeric estimate' : 'Class decision', detail: 'A leaf returns the learned value or class after the fitted path is followed.' }
            ],
            sourceFacts: [`The selected source names a ${isRegression ? 'DecisionTreeRegressor' : 'DecisionTreeClassifier'}.`],
            limits: ['The diagram is conceptual; learned feature tests, thresholds, branches, and leaf values require a fitted-model inspection.'],
            sourceNote: 'Branch structure is conceptual. For real split names, thresholds, samples, and leaf outputs, use Visualize Tree after fitting the model in the notebook kernel.'
        };
    }
    if (/\bKMeans\b/.test(source)) {
        const clusters = literalInteger(sourceValue(source, 'n_clusters'));
        return {
            kind: 'clustering',
            title: 'K-means workflow in source',
            summary: clusters === null
                ? 'The code references KMeans; the number of clusters is not a visible positive integer literal.'
                : `The source sets n_clusters=${clusters}. This is a configured value, not a measured cluster result.`,
            steps: [
                { title: 'Feature rows', detail: 'KMeans receives numeric observations as input.' },
                { title: clusters === null ? 'Choose k' : `Initialize ${clusters} centroids`, detail: 'Centroid positions depend on the data and initialization at fit time.' },
                { title: 'Assign points', detail: 'Each row is assigned to its nearest current centroid.' },
                { title: 'Update and repeat', detail: 'Centroids are recomputed until the stopping rule is met.' }
            ],
            sourceFacts: [
                'The selected source references KMeans.',
                ...(clusters === null ? [] : [`The source sets n_clusters=${clusters}; this is configuration, not a measured result.`])
            ],
            limits: ['No centroids, assignments, cluster sizes, or inertia are calculated by this preview.'],
            sourceNote: 'No points, centroid positions, labels, or inertia are computed by this static preview.'
        };
    }
    if (/\bPCA\b/.test(source) && !/\b(?:Pipeline|ColumnTransformer)\s*\(/.test(source)) {
        const components = sourceValue(source, 'n_components');
        const scaler = /\b(?:StandardScaler|RobustScaler|MinMaxScaler)\b/.test(source);
        return {
            kind: 'dimensionality-reduction',
            title: 'PCA workflow in source',
            summary: 'The selected code references principal-component analysis.',
            steps: [
                { title: 'Feature matrix', detail: 'PCA operates on numeric feature columns.' },
                ...(scaler ? [{ title: 'Scale features', detail: 'A scaler is also referenced in the selected source; whether it runs before PCA depends on the code path.' }] : []),
                { title: 'Find components', detail: components ? `The source sets n_components=${components}; inspect the fitted object for the realized component count.` : 'Principal directions are learned from the fitted input data.' },
                { title: 'Project rows', detail: 'Rows are represented in the selected component space when transform is called.' }
            ],
            sourceFacts: [
                'The selected source references PCA.',
                ...(components ? [`The source sets n_components=${components}.`] : [])
            ],
            limits: ['No fitted components, explained variance, loadings, or projected rows are calculated by this preview.'],
            sourceNote: 'No explained-variance values, component loadings, or transformed rows are fabricated; those require fitting and inspecting the estimator.'
        };
    }
    if (/\b(?:Pipeline|ColumnTransformer)\s*\(/.test(source)) {
        const names = namedPipelineSteps(source);
        const sourceFacts = [];
        const limits = [];
        if (names.length) {
            sourceFacts.push(`Named source stages, in branch-to-step order: ${names.join(' → ')}.`);
        }
        const branch = /\bColumnTransformer\s*\(/.test(source)
            ? source.match(/\(\s*['"]([^'"]+)['"]\s*,\s*([A-Za-z_]\w*)\s*,\s*\[([^\]]*)\]\s*\)/)
            : null;
        if (branch) {
            const columns = [];
            const columnPattern = /['"]([^'"]+)['"]/g;
            let columnMatch;
            while ((columnMatch = columnPattern.exec(branch[3])) !== null) {
                columns.push(columnMatch[1]);
            }
            if (columns.length) {
                sourceFacts.push(`ColumnTransformer branch "${branch[1]}" routes ${columns.map(column => `"${column}"`).join(', ')} through "${branch[2]}".`);
            }
        }
        if (/\bPCA\s*\(/.test(source)) {
            sourceFacts.push('PCA is configured as a source stage; the named stage list preserves the order visible in the pipeline declaration.');
        }
        const splitCall = source.match(/\btrain_test_split\s*\(([^\n)]*)\)/);
        if (splitCall) {
            const splitLine = lineFor(source, /\btrain_test_split\s*\(/);
            sourceFacts.push(`${splitLine ? `Line ${splitLine}: ` : ''}train_test_split(${splitCall[1].trim()}) partitions inputs; it does not itself evaluate a model.`);
        }
        if (/\.fit_transform\s*\(\s*X_train\s*\)/.test(source)) {
            sourceFacts.push('The source calls preprocessor.fit_transform(X_train), which fits the preprocessing steps on the training input and transforms it when executed.');
        }
        if (/\.transform\s*\(\s*X_test\s*\)/.test(source)) {
            sourceFacts.push('The source calls preprocessor.transform(X_test), applying the already-fitted preprocessing steps to the test input when executed.');
        }
        if (/\bStandardScaler\s*\(/.test(source)) {
            sourceFacts.push('StandardScaler is configured; when fit, it centers and scales using statistics learned from its fit input. It does not remove skewness.');
        }
        if (/\bPowerTransformer\b/.test(source) && !/\bPowerTransformer\s*\(/.test(source)) {
            sourceFacts.push('PowerTransformer appears in an import but is not configured as a pipeline step in this source.');
        }
        if (!/\b(?:cross_val_score|accuracy_score|balanced_accuracy_score|mean_squared_error|classification_report)\s*\(|\.predict(?:_proba)?\s*\(|\.score\s*\(/.test(source)) {
            limits.push('No prediction or model-evaluation metric is computed in this cell.');
        }
        if (/missing|null|isna/i.test(source) && !/\.(?:isna|isnull)\s*\(/.test(source)) {
            limits.push('A missing-value comment or label is not a measured missing-value check in this source.');
        }
        limits.push('This preview does not read the CSV or calculate transformed values.');
        const steps = names.length
            ? names.map(name => ({ title: name, detail: 'Stage label read from a source tuple; outer column-transformer branches appear before nested pipeline steps.', line: sourceLineForStage(source, name) }))
            : [
                { title: 'Input columns', detail: 'The transformer receives the selected feature columns.' },
                { title: 'Transform stages', detail: 'Configured transformers run in the order defined by the source.' },
                { title: 'Estimator', detail: 'A final estimator consumes the transformed feature matrix when the pipeline is fit or called.' }
            ];
        return {
            kind: 'pipeline',
            title: 'Preprocessing pipeline in source',
            summary: names.length ? `Found ${names.length} named stage label(s) in the pipeline/transformer source. Pipeline steps follow source order; ColumnTransformer branches are shown as routing branches.` : 'The cell declares a scikit-learn pipeline or column transformer.',
            steps,
            sourceFacts: sourceFacts.length ? sourceFacts : ['A scikit-learn Pipeline or ColumnTransformer is declared in the selected source.'],
            limits,
            sourceNote: 'Pipeline step labels follow their source order. ColumnTransformer labels describe parallel column-routing branches, not a sequential order. This preview does not fit transformers, expose learned statistics, or prove that the pipeline is leakage-free.'
        };
    }
    const algorithm = [..._visualization_registry__rspack_import_0.MODEL_VISUALIZATION_CATALOG]
        .sort((left, right) => right.patterns.length - left.patterns.length)
        .find(definition => definition.requireAllPatterns
        ? definition.patterns.every(pattern => pattern.test(source))
        : definition.patterns.some(pattern => pattern.test(source)));
    if (algorithm) {
        const pattern = algorithm.patterns.find(candidate => candidate.test(source));
        const name = pattern ? (_c = (_b = (_a = source.match(pattern)) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.replace(/\s*\($/, '')) !== null && _c !== void 0 ? _c : algorithm.name : algorithm.name;
        return {
            kind: 'algorithm',
            title: `${algorithm.name} concept in source`,
            summary: `The selected source references ${name}. The steps below describe the algorithm at a high level; they are not a record of this cell's execution.`,
            category: algorithm.category,
            steps: algorithm.process.map((detail, index) => {
                var _a;
                return ({
                    title: (_a = ['Input or configuration', 'Fit or transform', 'Prediction or result'][index]) !== null && _a !== void 0 ? _a : `Algorithm step ${index + 1}`,
                    detail,
                    line: pattern ? lineFor(source, pattern) : undefined
                });
            }),
            sourceFacts: [`The selected source references ${name}.`, `ModelMind categorizes this visualization as ${algorithm.category}.`],
            limits: algorithm.limits,
            sourceNote: 'This conceptual view is based on estimator or algorithm names in the selected source. It does not show fitted parameters, dataset-specific behavior, or measured performance.'
        };
    }
    return genericFlow(source);
}
/** Add source-only overlays after building the primary view; this function never executes Python. */
function createCodeVisualization(code) {
    const source = code.slice(0, 3000);
    return { ...buildCodeVisualization(source), sourceOverlays: buildSourceOverlays(source) };
}


},
"./lib/debugger-tutor.js"(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  closePanel: () => (closePanel),
  createFAB: () => (createFAB),
  createPanel: () => (createPanel),
  ensureStyles: () => (ensureStyles),
  loadTutorExplanation: () => (loadTutorExplanation),
  openPanel: () => (openPanel),
  renderResultInto: () => (renderResultInto),
  renderTutorInElement: () => (renderTutorInElement),
  setTutorEnabled: () => (setTutorEnabled),
  showFABAlert: () => (showFABAlert),
  togglePanel: () => (togglePanel)
});
/* import */ var _request__rspack_import_0 = __webpack_require__("./lib/request.js");
/**
 * ModelMind — AI Debugger Tutor (Offline, Rule-based ML Error Assistant)
 * UI and UX match the ModelMind AI Assistant panel design system.
 */

let _panel = null;
let _overlay = null;
let _isOpen = false;
let _currentLevel = 'basic';
let _lastInput = null;
let _serverSettings = null;
let _tutorEnabled = true;
function ensureStyles() {
    if (document.getElementById('mm-tutor-styles'))
        return;
    const style = document.createElement('style');
    style.id = 'mm-tutor-styles';
    style.textContent = `
    /* ── Overlay ── */
    #mm-tutor-overlay {
      position: fixed; inset: 0;
      background: rgba(15, 23, 42, 0.45);
      backdrop-filter: blur(2px);
      z-index: 9998;
      opacity: 0; transition: opacity .25s ease;
      pointer-events: none; display: none;
    }
    #mm-tutor-overlay.open { opacity: 1; pointer-events: auto; display: block; }

    /* ── Panel — Unified with ModelMind AI Assistant ── */
    #mm-tutor-panel {
      position: fixed; right: 0; bottom: 0; top: 0; width: 420px; max-width: 96vw;
      background: var(--ml-assistant-panel-bg, #f5f6f8);
      border-left: 1px solid var(--ml-assistant-border, #dfe3ea);
      z-index: 9999; overflow-y: auto; transform: translateX(100%);
      transition: transform .28s cubic-bezier(.4, 0, .2, 1);
      display: flex; flex-direction: column;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: var(--ml-assistant-text, #253041);
      box-shadow: -6px 0 24px var(--ml-assistant-shadow, rgba(31, 41, 55, 0.12));
    }
    #mm-tutor-panel.open { transform: translateX(0); }

    /* ── Header ── */
    #mm-tutor-header {
      padding: 14px 16px 12px;
      border-bottom: 1px solid var(--ml-assistant-border, #dfe3ea);
      background: #ffffff;
      position: sticky; top: 0; z-index: 2;
      display: flex; flex-direction: column; gap: 4px;
    }
    .mm-tutor-header-top {
      display: flex; align-items: center; justify-content: space-between;
    }
    #mm-tutor-header h2 {
      margin: 0; font-size: 15px; font-weight: 700;
      color: var(--ml-assistant-text, #253041);
      display: flex; align-items: center; gap: 8px;
    }
    #mm-tutor-header .sub {
      font-size: 11px;
      color: var(--ml-assistant-muted, #5d6b80);
      font-weight: 500;
    }
    #mm-tutor-close {
      background: transparent;
      border: 1px solid var(--ml-assistant-border, #dfe3ea);
      color: var(--ml-assistant-muted, #5d6b80);
      cursor: pointer; font-size: 16px; line-height: 1;
      padding: 4px 8px; border-radius: 6px;
      transition: all .15s ease;
    }
    #mm-tutor-close:hover {
      background: #f1f5f9;
      color: var(--ml-assistant-text, #253041);
      border-color: #cbd5e1;
    }

    /* ── Body ── */
    #mm-tutor-body, .mm-tutor-embedded-body {
      padding: 14px 16px; flex: 1;
      display: flex; flex-direction: column; gap: 10px;
    }

    /* ── Level Switcher Tabs (Basic / Medium / Advanced) ── */
    .mm-tutor-level-row {
      display: flex; gap: 6px;
      padding: 3px; background: #eaecf1;
      border-radius: 8px; margin-bottom: 6px;
    }
    .mm-tutor-level-btn {
      flex: 1; font-size: 12px; font-weight: 600; padding: 6px 10px;
      border-radius: 6px; cursor: pointer; text-align: center;
      border: none; background: transparent;
      color: var(--ml-assistant-muted, #5d6b80);
      transition: all .15s ease;
    }
    .mm-tutor-level-btn:hover {
      color: var(--ml-assistant-text, #253041);
    }
    .mm-tutor-level-btn.active {
      background: #ffffff;
      color: var(--ml-assistant-accent, #6d7cff);
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      font-weight: 700;
    }

    /* ── Error Banner ── */
    .mm-tutor-error-banner {
      background: var(--ml-assistant-error-bg, #f7dfe3);
      border: 1px solid rgba(163, 61, 77, 0.25);
      border-radius: 8px;
      padding: 12px 14px;
    }
    .mm-tutor-error-banner .banner-title {
      display: flex; align-items: center; gap: 8px;
      font-size: 13px; font-weight: 700;
      color: var(--ml-assistant-error-text, #a33d4d);
      margin-bottom: 3px;
    }
    .mm-tutor-error-banner .banner-type {
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 11px; font-weight: 700;
      color: #991b1b;
    }
    .mm-tutor-error-banner .banner-msg {
      font-size: 12px; color: #7f1d1d; margin-top: 4px; line-height: 1.4;
      word-break: break-word;
    }
    .mm-tutor-error-banner .banner-line {
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 11px; color: #b91c1c; margin-top: 6px;
      padding: 4px 8px; background: rgba(255,255,255,0.6);
      border-radius: 4px; overflow-x: auto;
    }

    /* ── Local Engine / Coverage Pill ── */
    .mm-tutor-coverage {
      display: inline-flex; align-items: center; gap: 6px;
      background: var(--ml-assistant-success-bg, #dff5eb);
      color: var(--ml-assistant-success-text, #1d7b54);
      border: 1px solid rgba(29, 123, 84, 0.2);
      border-radius: 6px; padding: 6px 10px;
      font-size: 11px; font-weight: 600;
    }
    .mm-tutor-coverage.mm-tutor-low-conf {
      background: #fef3c7;
      color: #92400e;
      border: 1px solid rgba(180, 83, 9, 0.3);
    }
    .mm-tutor-withheld-box {
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-radius: 8px; padding: 12px 14px;
      margin: 2px 0 6px;
    }
    .mm-tutor-withheld-box .withheld-title {
      font-size: 12px; font-weight: 700; color: #92400e;
      margin-bottom: 4px; display: flex; align-items: center; gap: 6px;
    }
    .mm-tutor-withheld-box .withheld-desc {
      font-size: 11.5px; color: #78350f; line-height: 1.5;
    }
    .mm-tutor-ask-ai-btn {
      display: flex; align-items: center; justify-content: center; gap: 8px;
      width: 100%; margin-top: 10px; padding: 9px 14px;
      background: var(--ml-assistant-accent, #6d7cff);
      color: #ffffff; border: none; border-radius: 6px;
      font-size: 12px; font-weight: 700; cursor: pointer;
      transition: all .15s ease;
      box-shadow: 0 2px 8px rgba(109, 124, 255, 0.35);
    }
    .mm-tutor-ask-ai-btn:hover {
      background: #5865f2;
      box-shadow: 0 4px 14px rgba(109, 124, 255, 0.5);
      transform: translateY(-1px);
    }

    /* ── Contextual Smart Hints ── */
    .mm-tutor-hint {
      background: var(--ml-assistant-accent-soft, #eef1ff);
      border: 1px solid rgba(109, 124, 255, 0.3);
      border-radius: 8px; padding: 10px 12px;
      font-size: 12px; color: #3730a3; line-height: 1.45;
    }

    /* ── Content Card (What / Why / How to fix) ── */
    .mm-tutor-section {
      background: var(--ml-assistant-card-bg, #ffffff);
      border: 1px solid var(--ml-assistant-border, #dfe3ea);
      border-radius: 8px; padding: 12px 14px;
      box-shadow: 0 1px 3px var(--ml-assistant-shadow, rgba(31, 41, 55, 0.04));
    }
    .mm-tutor-section-label {
      font-size: 10px; font-weight: 700; letter-spacing: 0.6px;
      color: var(--ml-assistant-muted, #5d6b80);
      margin-bottom: 6px; text-transform: uppercase;
    }
    .mm-tutor-section-content {
      font-size: 12.5px; color: var(--ml-assistant-text, #253041);
      line-height: 1.55;
    }

    /* ── Numbered Steps ── */
    .mm-tutor-step {
      display: flex; gap: 8px; margin-bottom: 6px;
      font-size: 12px; line-height: 1.5;
      color: var(--ml-assistant-text, #253041);
    }
    .mm-tutor-step-num {
      width: 18px; height: 18px; border-radius: 50%;
      background: var(--ml-assistant-accent-soft, #eef1ff);
      color: var(--ml-assistant-accent, #6d7cff);
      font-size: 10px; font-weight: 700;
      display: flex; align-items: center; justify-content: center;
      margin-top: 1px; flex-shrink: 0;
    }

    /* ── Code Tip Block ── */
    .mm-tutor-code-wrap {
      position: relative; margin-top: 6px;
    }
    .mm-tutor-code-tip {
      background: #0f172a; border: 1px solid #1e293b;
      border-radius: 8px; padding: 12px;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 11.5px; line-height: 1.6; color: #e2e8f0;
      overflow-x: auto; white-space: pre;
    }
    .mm-tutor-copy-btn {
      position: absolute; top: 8px; right: 8px;
      font-size: 10px; font-weight: 600; padding: 4px 9px;
      border-radius: 5px; cursor: pointer;
      background: #334155; border: 1px solid #475569; color: #f8fafc;
      transition: all .12s ease;
    }
    .mm-tutor-copy-btn:hover { background: #475569; }

    /* ── Empty State & Quick Presets ── */
    .mm-tutor-empty {
      background: #ffffff;
      border: 1px solid var(--ml-assistant-border, #dfe3ea);
      border-radius: 8px; padding: 20px 16px; text-align: center;
    }
    .mm-tutor-empty h3 {
      margin: 8px 0 4px; font-size: 14px; font-weight: 700;
      color: var(--ml-assistant-text, #253041);
    }
    .mm-tutor-empty p {
      margin: 0 0 14px; font-size: 12px;
      color: var(--ml-assistant-muted, #5d6b80);
      line-height: 1.5;
    }
    .mm-tutor-preset-list {
      display: flex; flex-direction: column; gap: 6px;
      text-align: left; margin-top: 12px;
    }
    .mm-tutor-preset-btn {
      display: flex; align-items: center; justify-content: space-between;
      background: var(--ml-assistant-panel-bg, #f5f6f8);
      border: 1px solid var(--ml-assistant-border, #dfe3ea);
      border-radius: 6px; padding: 8px 10px;
      font-size: 11.5px; font-weight: 600;
      color: var(--ml-assistant-text, #253041);
      cursor: pointer; transition: all .15s ease;
    }
    .mm-tutor-preset-btn:hover {
      background: var(--ml-assistant-accent-soft, #eef1ff);
      border-color: rgba(109, 124, 255, 0.35);
      color: var(--ml-assistant-accent, #6d7cff);
    }

    /* ── FAB button ── */
    #mm-tutor-fab {
      position: fixed; right: 20px; bottom: 20px; z-index: 9997;
      width: 48px; height: 48px; border-radius: 50%; border: none; cursor: pointer;
      background: linear-gradient(135deg, #6d7cff 0%, #4f46e5 100%);
      color: #fff; font-size: 20px;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 16px rgba(109, 124, 255, 0.4);
      transition: transform .15s, box-shadow .15s;
    }
    #mm-tutor-fab:hover { transform: scale(1.08); box-shadow: 0 6px 22px rgba(109, 124, 255, 0.6); }
    #mm-tutor-fab .badge {
      position: absolute; top: -2px; right: -2px; width: 15px; height: 15px;
      border-radius: 50%; background: #ef4444; font-size: 9px; font-weight: 800;
      display: none; align-items: center; justify-content: center; color: #fff;
    }
    #mm-tutor-fab .badge.show { display: flex; }
  `;
    document.head.appendChild(style);
}
function createPanel() {
    var _a;
    ensureStyles();
    if (!_overlay) {
        _overlay = document.createElement('div');
        _overlay.id = 'mm-tutor-overlay';
        _overlay.addEventListener('click', closePanel);
        document.body.appendChild(_overlay);
    }
    if (!_panel) {
        _panel = document.createElement('div');
        _panel.id = 'mm-tutor-panel';
        _panel.setAttribute('role', 'dialog');
        _panel.setAttribute('aria-label', 'AI Debugger Tutor');
        const hdr = document.createElement('div');
        hdr.id = 'mm-tutor-header';
        hdr.innerHTML = `
      <div class="mm-tutor-header-top">
        <h2>🎓 AI Debugger Tutor</h2>
        <button id="mm-tutor-close" aria-label="Close tutor panel">✕</button>
      </div>
      <div class="sub">100% Offline · No AI required · ~80% ML Error Coverage</div>
    `;
        (_a = hdr.querySelector('#mm-tutor-close')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', closePanel);
        _panel.appendChild(hdr);
        const body = document.createElement('div');
        body.id = 'mm-tutor-body';
        renderEmptyState(body);
        _panel.appendChild(body);
        document.body.appendChild(_panel);
    }
}
function openPanel() {
    if (!_panel)
        createPanel();
    _panel.classList.add('open');
    _overlay === null || _overlay === void 0 ? void 0 : _overlay.classList.add('open');
    _isOpen = true;
}
function closePanel() {
    _panel === null || _panel === void 0 ? void 0 : _panel.classList.remove('open');
    _overlay === null || _overlay === void 0 ? void 0 : _overlay.classList.remove('open');
    _isOpen = false;
}
function togglePanel() {
    if (_isOpen)
        closePanel();
    else
        openPanel();
}
function createFAB(serverSettings) {
    _serverSettings = serverSettings;
    ensureStyles();
    if (!_panel)
        createPanel();
    if (document.getElementById('mm-tutor-fab'))
        return;
    const fab = document.createElement('button');
    fab.id = 'mm-tutor-fab';
    fab.title = 'AI Debugger Tutor (Offline ML Guidance)';
    fab.setAttribute('aria-label', 'Open AI Debugger Tutor');
    const badge = document.createElement('div');
    badge.className = 'badge';
    badge.textContent = '!';
    fab.innerHTML = `<span>🎓</span>`;
    fab.appendChild(badge);
    fab.addEventListener('click', togglePanel);
    document.body.appendChild(fab);
}
function setTutorEnabled(enabled) {
    _tutorEnabled = enabled;
    if (!enabled) {
        closePanel();
    }
    const visibility = enabled ? '' : 'none';
    for (const id of ['mm-tutor-fab', 'mm-tutor-panel', 'mm-tutor-overlay']) {
        const element = document.getElementById(id);
        if (element) {
            element.style.display = visibility;
        }
    }
}
function showFABAlert() {
    var _a;
    const badge = (_a = document.getElementById('mm-tutor-fab')) === null || _a === void 0 ? void 0 : _a.querySelector('.badge');
    badge === null || badge === void 0 ? void 0 : badge.classList.add('show');
}
/**
 * Render empty state with 1-click test scenarios for user testing
 */
function renderEmptyState(container) {
    container.replaceChildren();
    const card = document.createElement('div');
    card.className = 'mm-tutor-empty';
    card.innerHTML = `
    <div style="font-size:32px">🎓</div>
    <h3>AI Debugger Tutor Ready</h3>
    <p>Run any failing notebook cell, and the Tutor will instantly explain what happened with <strong>Basic</strong>, <strong>Medium</strong>, and <strong>Advanced</strong> fixes — 100% offline.</p>
    <div class="mm-tutor-coverage">🔒 Local Engine · Zero API Latency · ~80% ML Coverage</div>
    <div class="mm-tutor-preset-list">
      <div style="font-size:11px;font-weight:700;color:#5d6b80;text-transform:uppercase;margin-bottom:2px">Try Example Scenarios:</div>
      <button type="button" class="mm-tutor-preset-btn" data-type="ValueError" data-msg="Input X contains NaN.">
        <span>⚡ NaN in Model Fit (ValueError)</span>
        <span style="color:#6d7cff">Inspect →</span>
      </button>
      <button type="button" class="mm-tutor-preset-btn" data-type="KeyError" data-msg="KeyError: 'target'">
        <span>⚡ Missing Column 'target' (KeyError)</span>
        <span style="color:#6d7cff">Inspect →</span>
      </button>
      <button type="button" class="mm-tutor-preset-btn" data-type="NameError" data-msg="name 'X_train' is not defined">
        <span>⚡ Undefined 'X_train' (NameError)</span>
        <span style="color:#6d7cff">Inspect →</span>
      </button>
      <button type="button" class="mm-tutor-preset-btn" data-type="ValueError" data-msg="Found input variables with inconsistent numbers of samples: [100, 80]">
        <span>⚡ Shape Mismatch [100, 80] (ValueError)</span>
        <span style="color:#6d7cff">Inspect →</span>
      </button>
    </div>
  `;
    card.querySelectorAll('.mm-tutor-preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const error_type = btn.getAttribute('data-type') || 'ValueError';
            const error_message = btn.getAttribute('data-msg') || 'Error';
            if (_serverSettings) {
                void loadTutorExplanation({
                    error_type,
                    error_message,
                    traceback: `${error_type}: ${error_message}`,
                    code: 'model.fit(X_train, y_train)'
                }, _serverSettings, true);
            }
        });
    });
    container.appendChild(card);
}
/**
 * Render Tutor results into any container element (slide-out panel or AI Assistant tab)
 */
function renderResultInto(container, result, onLevelSwitch) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    container.replaceChildren();
    if (!result.handled) {
        const msg = document.createElement('div');
        msg.className = 'mm-tutor-empty';
        msg.innerHTML = `
      <div style="font-size:28px">🤔</div>
      <h3>Error Not Diagnosed</h3>
      <p>${(_a = result.error_message) !== null && _a !== void 0 ? _a : 'Could not automatically analyse this error offline.'}</p>
    `;
        container.appendChild(msg);
        return;
    }
    // 1. Level switcher (Basic / Medium / Advanced)
    const levelRow = document.createElement('div');
    levelRow.className = 'mm-tutor-level-row';
    ['basic', 'medium', 'advanced'].forEach(lvl => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `mm-tutor-level-btn${lvl === _currentLevel ? ' active' : ''}`;
        const levelLabels = {
            basic: '🐣 Basic Fix',
            medium: '⚡ Medium (M02)',
            advanced: '🚀 Pipeline (Adv)'
        };
        btn.textContent = levelLabels[lvl];
        btn.addEventListener('click', () => {
            _currentLevel = lvl;
            if (onLevelSwitch) {
                onLevelSwitch(lvl);
            }
            else if (_lastInput && _serverSettings) {
                void loadTutorExplanation(_lastInput, _serverSettings, true);
            }
        });
        levelRow.appendChild(btn);
    });
    container.appendChild(levelRow);
    // 2. Error banner
    const banner = document.createElement('div');
    banner.className = 'mm-tutor-error-banner';
    banner.innerHTML = `
    <div class="banner-title">
      <span style="font-size:16px">${(_b = result.icon) !== null && _b !== void 0 ? _b : '🐛'}</span>
      <span>${(_c = result.title) !== null && _c !== void 0 ? _c : 'Runtime Error'}</span>
    </div>
    <div class="banner-type">${(_d = result.error_type) !== null && _d !== void 0 ? _d : ''}</div>
    ${result.error_message ? `<div class="banner-msg">${result.error_message}</div>` : ''}
    ${result.failing_line ? `<div class="banner-line">→ ${result.failing_line}</div>` : ''}
  `;
    container.appendChild(banner);
    // 3. Local engine status & confidence pill (70% bound restriction)
    const isHighConf = result.can_suggest_code === true && ((_e = result.confidence) !== null && _e !== void 0 ? _e : 0) >= 70;
    const pill = document.createElement('div');
    pill.className = isHighConf ? 'mm-tutor-coverage' : 'mm-tutor-coverage mm-tutor-low-conf';
    pill.innerHTML = isHighConf
        ? `🟢 <strong>Confidence: ${(_f = result.confidence) !== null && _f !== void 0 ? _f : 85}%</strong> (≥70% High) · Level: <strong>${_currentLevel.toUpperCase()}</strong>`
        : `⚠️ <strong>Confidence: ${(_g = result.confidence) !== null && _g !== void 0 ? _g : 45}%</strong> (<70% Threshold) · Fix Code Withheld`;
    container.appendChild(pill);
    // If confidence is below 70%, show the reason why code suggestions are withheld and offer direct redirect to AI Assistant
    if (!isHighConf) {
        const withheldEl = document.createElement('div');
        withheldEl.className = 'mm-tutor-withheld-box';
        withheldEl.innerHTML = `
      <div class="withheld-title">🛡️ Code Fix Withheld (Confidence &lt; 70%)</div>
      <div class="withheld-desc">
        ${(_h = result.confidence_reason) !== null && _h !== void 0 ? _h : 'The exact root cause cannot be verified with ≥70% confidence. Automatic code generation is disabled to prevent recommending incorrect code. Follow the diagnostic steps below or ask the AI Assistant.'}
      </div>
      <button type="button" class="mm-tutor-ask-ai-btn">
        <span>🤖</span>
        <span>Ask AI Assistant for Full Diagnosis</span>
        <span>→</span>
      </button>
    `;
        const askBtn = withheldEl.querySelector('.mm-tutor-ask-ai-btn');
        askBtn === null || askBtn === void 0 ? void 0 : askBtn.addEventListener('click', () => {
            closePanel();
            window.dispatchEvent(new CustomEvent('modelmind:open-ai-assistant', {
                detail: { mode: 'explain', error: _lastInput }
            }));
        });
        container.appendChild(withheldEl);
    }
    // 4. Smart contextual ML hints
    if (result.smart_hints && result.smart_hints.length > 0) {
        result.smart_hints.forEach(h => {
            const hint = document.createElement('div');
            hint.className = 'mm-tutor-hint';
            hint.textContent = h;
            container.appendChild(hint);
        });
    }
    // 5. What happened
    if (result.what) {
        const sec = document.createElement('div');
        sec.className = 'mm-tutor-section';
        sec.innerHTML = `
      <div class="mm-tutor-section-label">What Happened</div>
      <div class="mm-tutor-section-content">${result.what}</div>
    `;
        container.appendChild(sec);
    }
    // 6. Why this happened
    if (result.why) {
        const sec = document.createElement('div');
        sec.className = 'mm-tutor-section';
        sec.innerHTML = `
      <div class="mm-tutor-section-label">Why This Happened</div>
      <div class="mm-tutor-section-content">${result.why}</div>
    `;
        container.appendChild(sec);
    }
    // 7. How to fix it (Numbered steps)
    if (result.steps && result.steps.length > 0) {
        const stepsEl = document.createElement('div');
        stepsEl.className = 'mm-tutor-section';
        stepsEl.innerHTML = `<div class="mm-tutor-section-label">${isHighConf ? `How To Fix It (${_currentLevel.toUpperCase()})` : 'Diagnostic Steps'}</div>`;
        result.steps.forEach((step, i) => {
            const row = document.createElement('div');
            row.className = 'mm-tutor-step';
            row.innerHTML = `<div class="mm-tutor-step-num">${i + 1}</div><div>${step}</div>`;
            stepsEl.appendChild(row);
        });
        container.appendChild(stepsEl);
    }
    // 8. Try this in a new cell (Code Tip) — ONLY when confidence >= 70%
    if (isHighConf && result.code_tip) {
        const tipSec = document.createElement('div');
        tipSec.className = 'mm-tutor-section';
        tipSec.innerHTML = `<div class="mm-tutor-section-label">Recommended Code Fix (${_currentLevel.toUpperCase()})</div>`;
        const wrap = document.createElement('div');
        wrap.className = 'mm-tutor-code-wrap';
        const pre = document.createElement('div');
        pre.className = 'mm-tutor-code-tip';
        pre.textContent = result.code_tip;
        const copyBtn = document.createElement('button');
        copyBtn.type = 'button';
        copyBtn.className = 'mm-tutor-copy-btn';
        copyBtn.textContent = 'Copy Code';
        copyBtn.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(result.code_tip);
                copyBtn.textContent = 'Copied!';
            }
            catch (_a) {
                copyBtn.textContent = 'Copied!';
            }
            setTimeout(() => { copyBtn.textContent = 'Copy Code'; }, 1800);
        });
        wrap.append(pre, copyBtn);
        tipSec.appendChild(wrap);
        container.appendChild(tipSec);
    }
    // 9. Note
    if (result.note) {
        const noteEl = document.createElement('div');
        noteEl.style.fontSize = '11px';
        noteEl.style.color = '#94a3b8';
        noteEl.style.padding = '4px 2px';
        noteEl.textContent = result.note;
        container.appendChild(noteEl);
    }
}
/**
 * Fetch tutor analysis from backend and render into the slide-out panel
 */
async function loadTutorExplanation(input, serverSettings, openWhenDone = false) {
    if (!_tutorEnabled) {
        return;
    }
    _lastInput = input;
    _serverSettings = serverSettings;
    ensureStyles();
    if (!_panel)
        createPanel();
    if (openWhenDone) {
        openPanel();
    }
    const body = _panel.querySelector('#mm-tutor-body');
    if (body) {
        body.replaceChildren();
        const loading = document.createElement('div');
        loading.style.textAlign = 'center';
        loading.style.padding = '30px 16px';
        loading.style.color = '#5d6b80';
        loading.innerHTML = `<div style="font-size:28px;margin-bottom:8px">⏳</div>Analysing with Local ML Engine…`;
        body.appendChild(loading);
    }
    try {
        const result = await (0,_request__rspack_import_0.requestAPI)('api/ai/tutor', serverSettings, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                error_type: input.error_type,
                error_message: input.error_message,
                traceback: input.traceback,
                code: input.code,
                level: _currentLevel,
            })
        });
        if (!_tutorEnabled) {
            return;
        }
        if (body) {
            renderResultInto(body, result);
        }
        showFABAlert();
    }
    catch (err) {
        if (!_tutorEnabled) {
            return;
        }
        if (body) {
            body.replaceChildren();
            const errEl = document.createElement('div');
            errEl.className = 'mm-tutor-empty';
            errEl.innerHTML = `<div style="font-size:24px;margin-bottom:8px">⚠️</div><div style="color:#ef4444">${err instanceof Error ? err.message : 'Tutor unavailable.'}</div>`;
            body.appendChild(errEl);
        }
    }
}
/**
 * Render Tutor explanation directly into an embedded container (e.g., inside the AI Assistant tab)
 */
async function renderTutorInElement(container, input, serverSettings) {
    if (!_tutorEnabled) {
        return;
    }
    _serverSettings = serverSettings;
    ensureStyles();
    if (!input) {
        renderEmptyState(container);
        return;
    }
    _lastInput = input;
    container.replaceChildren();
    const loading = document.createElement('div');
    loading.style.textAlign = 'center';
    loading.style.padding = '30px 16px';
    loading.style.color = '#5d6b80';
    loading.innerHTML = `<div style="font-size:28px;margin-bottom:8px">⏳</div>Analysing with Local ML Engine…`;
    container.appendChild(loading);
    try {
        const result = await (0,_request__rspack_import_0.requestAPI)('api/ai/tutor', serverSettings, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                error_type: input.error_type,
                error_message: input.error_message,
                traceback: input.traceback,
                code: input.code,
                level: _currentLevel,
            })
        });
        if (!_tutorEnabled) {
            return;
        }
        renderResultInto(container, result, (lvl) => {
            _currentLevel = lvl;
            void renderTutorInElement(container, input, serverSettings);
        });
    }
    catch (err) {
        if (!_tutorEnabled) {
            return;
        }
        container.replaceChildren();
        const errEl = document.createElement('div');
        errEl.className = 'mm-tutor-empty';
        errEl.innerHTML = `<div style="font-size:24px;margin-bottom:8px">⚠️</div><div style="color:#ef4444">${err instanceof Error ? err.message : 'Tutor unavailable.'}</div>`;
        container.appendChild(errEl);
    }
}


},
"./lib/fix-utils.js"(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  applyFixToCellModel: () => (applyFixToCellModel)
});
function applyFixToCellModel(model, fixText) {
    const sharedModel = model === null || model === void 0 ? void 0 : model.sharedModel;
    const source = fixText.trim();
    if (!sharedModel || typeof sharedModel.setSource !== 'function' || !source) {
        return false;
    }
    sharedModel.setSource(source);
    return true;
}


},
"./lib/index.js"(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  "default": () => (__rspack_default_export)
});
/* import */ var _jupyterlab_cells__rspack_import_0 = __webpack_require__("webpack/sharing/consume/default/@jupyterlab/cells");
/* import */ var _jupyterlab_cells__rspack_import_0_default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_cells__rspack_import_0);
/* import */ var _jupyterlab_docmanager__rspack_import_1 = __webpack_require__("webpack/sharing/consume/default/@jupyterlab/docmanager");
/* import */ var _jupyterlab_docmanager__rspack_import_1_default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_docmanager__rspack_import_1);
/* import */ var _jupyterlab_mainmenu__rspack_import_2 = __webpack_require__("webpack/sharing/consume/default/@jupyterlab/mainmenu");
/* import */ var _jupyterlab_mainmenu__rspack_import_2_default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_mainmenu__rspack_import_2);
/* import */ var _jupyterlab_notebook__rspack_import_3 = __webpack_require__("webpack/sharing/consume/default/@jupyterlab/notebook");
/* import */ var _jupyterlab_notebook__rspack_import_3_default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_notebook__rspack_import_3);
/* import */ var _jupyterlab_translation__rspack_import_4 = __webpack_require__("webpack/sharing/consume/default/@jupyterlab/translation");
/* import */ var _jupyterlab_translation__rspack_import_4_default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_translation__rspack_import_4);
/* import */ var _lumino_widgets__rspack_import_5 = __webpack_require__("webpack/sharing/consume/default/@lumino/widgets");
/* import */ var _lumino_widgets__rspack_import_5_default = /*#__PURE__*/__webpack_require__.n(_lumino_widgets__rspack_import_5);
/* import */ var _style_modelmind_logo_png__rspack_import_6 = __webpack_require__("./style/modelmind-logo.png");
/* import */ var _fix_utils__rspack_import_10 = __webpack_require__("./lib/fix-utils.js");
/* import */ var _request__rspack_import_9 = __webpack_require__("./lib/request.js");
/* import */ var _modelmind_studio__rspack_import_13 = __webpack_require__("./lib/modelmind-studio.js");
/* import */ var _debugger_tutor__rspack_import_8 = __webpack_require__("./lib/debugger-tutor.js");
/* import */ var _ai_chatbot__rspack_import_11 = __webpack_require__("./lib/ai-chatbot.js");
/* import */ var _api_key_settings__rspack_import_15 = __webpack_require__("./lib/api-key-settings.js");
/* import */ var _practice_questions__rspack_import_14 = __webpack_require__("./lib/practice-questions.js");
/* import */ var _notebook_mode__rspack_import_7 = __webpack_require__("./lib/notebook-mode.js");
/* import */ var _cell_error_highlighter__rspack_import_12 = __webpack_require__("./lib/cell-error-highlighter.js");
















const COMMAND_ID = '@ml-platform/error-assistant:open';
const MAX_CODE_LENGTH = 20000;
const MAX_TRACEBACK_LENGTH = 12000;
function setModelMindFavicon() {
    document.querySelectorAll('link[rel~="icon"]').forEach(link => {
        link.remove();
    });
    const favicon = document.createElement('link');
    favicon.rel = 'icon';
    favicon.type = 'image/png';
    favicon.setAttribute('sizes', '256x256');
    favicon.href = _style_modelmind_logo_png__rspack_import_6;
    document.head.appendChild(favicon);
}
function removeJupyterSplashOrbitAnimation() {
    const style = document.createElement('style');
    style.id = 'modelmind-splash-branding';
    style.textContent = `
    #jupyterlab-splash #moon1,
    #jupyterlab-splash #moon2,
    #jupyterlab-splash #moon3 {
      display: none !important;
      animation: none !important;
    }
  `;
    document.head.appendChild(style);
}
// Apply while the splash is visible, before JupyterLab activates plugins.
setModelMindFavicon();
removeJupyterSplashOrbitAnimation();
function getTargetCell(notebooks) {
    var _a, _b, _c;
    const active = (_c = (_a = notebooks.activeCell) !== null && _a !== void 0 ? _a : (_b = notebooks.currentWidget) === null || _b === void 0 ? void 0 : _b.content.activeCell) !== null && _c !== void 0 ? _c : null;
    if (active && captureActiveError(active)) {
        return active;
    }
    const currentWidget = notebooks.currentWidget;
    if (currentWidget) {
        const cells = currentWidget.content.widgets;
        for (let i = cells.length - 1; i >= 0; i--) {
            const cell = cells[i];
            if (cell && captureActiveError(cell)) {
                return cell;
            }
        }
    }
    return active;
}
function captureActiveError(cell) {
    if (!cell || !(0,_jupyterlab_cells__rspack_import_0.isCodeCellModel)(cell.model)) {
        return null;
    }
    let errorOutput;
    for (const output of cell.model.outputs.toJSON().reverse()) {
        if (isErrorOutput(output)) {
            errorOutput = output;
            break;
        }
    }
    if (!errorOutput) {
        return null;
    }
    const source = cell.model.toJSON().source;
    const code = Array.isArray(source) ? source.join('') : source;
    return {
        cell_id: cell.model.id.slice(0, 256),
        code: code.slice(0, MAX_CODE_LENGTH),
        error_type: errorOutput.ename.slice(0, 200),
        error_message: errorOutput.evalue.slice(0, 2000),
        traceback: errorOutput.traceback.join('\n').slice(0, MAX_TRACEBACK_LENGTH)
    };
}
function getAdjacentNotebookCode(notebook, targetCell) {
    const cells = notebook.content.widgets;
    const targetIndex = cells.indexOf(targetCell);
    if (targetIndex < 0) {
        return '';
    }
    return cells
        .slice(Math.max(0, targetIndex - 1), targetIndex + 2)
        .filter(cell => cell !== targetCell && (0,_jupyterlab_cells__rspack_import_0.isCodeCellModel)(cell.model))
        .map(cell => {
        const source = cell.model.toJSON().source;
        return Array.isArray(source) ? source.join('') : source;
    })
        .join('\n')
        .slice(0, 12000);
}
function isErrorOutput(output) {
    return (output.output_type === 'error' &&
        'ename' in output &&
        typeof output.ename === 'string' &&
        'evalue' in output &&
        typeof output.evalue === 'string' &&
        'traceback' in output &&
        Array.isArray(output.traceback) &&
        output.traceback.every((line) => typeof line === 'string'));
}
function createStatusPill(label, tone) {
    const pill = document.createElement('div');
    pill.className = `ml-assistant-status-pill ml-assistant-status-${tone}`;
    pill.textContent = label;
    return pill;
}
function renderAssistantResult(container, payload, fixActions, suggestImmediately = false) {
    container.replaceChildren();
    const header = document.createElement('div');
    header.className = 'ml-assistant-result-header';
    const banner = document.createElement('div');
    banner.className = 'ml-assistant-error-banner';
    const errorIcon = document.createElement('span');
    errorIcon.className = 'ml-assistant-error-icon';
    errorIcon.setAttribute('aria-hidden', 'true');
    errorIcon.textContent = '!';
    const errorText = document.createElement('div');
    errorText.className = 'ml-assistant-error-copy';
    const errorTitle = document.createElement('div');
    errorTitle.className = 'ml-assistant-error-title';
    errorTitle.textContent = payload.errorType;
    const errorMessage = document.createElement('div');
    errorMessage.className = 'ml-assistant-error-message';
    errorMessage.textContent = payload.errorMessage;
    errorText.append(errorTitle, errorMessage);
    banner.append(errorIcon, errorText);
    const traceback = document.createElement('div');
    traceback.className = 'ml-assistant-traceback';
    const tracebackDetails = document.createElement('details');
    const tracebackSummary = document.createElement('summary');
    tracebackSummary.textContent = 'View traceback';
    const tracebackContent = document.createElement('pre');
    tracebackContent.textContent = payload.traceback;
    tracebackDetails.append(tracebackSummary, tracebackContent);
    traceback.append(tracebackDetails);
    const explanation = document.createElement('div');
    explanation.className = 'ml-assistant-card ml-assistant-card-blue';
    const explanationTitle = document.createElement('div');
    explanationTitle.className = 'ml-assistant-card-title';
    explanationTitle.textContent = 'Explanation';
    const explanationSummary = document.createElement('p');
    explanationSummary.textContent = payload.summary;
    const explanationDetails = document.createElement('ul');
    payload.details.forEach(detail => {
        const item = document.createElement('li');
        item.textContent = detail;
        explanationDetails.appendChild(item);
    });
    explanation.append(explanationTitle, explanationSummary, explanationDetails);
    const fixCard = document.createElement('div');
    fixCard.className = 'ml-assistant-card ml-assistant-card-green';
    const fixTitle = document.createElement('div');
    fixTitle.className = 'ml-assistant-card-title';
    fixTitle.textContent = 'Possible solution';
    const fixSummary = document.createElement('p');
    fixSummary.textContent = payload.fix;
    const fixCode = document.createElement('div');
    fixCode.className = 'ml-assistant-code-block';
    fixCode.textContent = 'Generate a suggestion to see corrected code here.';
    let currentFix = null;
    fixCard.append(fixTitle, fixSummary, fixCode);
    const actions = document.createElement('div');
    actions.className = 'ml-assistant-actions';
    const suggestButton = document.createElement('button');
    suggestButton.type = 'button';
    suggestButton.textContent = 'Suggest Fix';
    suggestButton.disabled = !fixActions;
    const applyButton = document.createElement('button');
    applyButton.type = 'button';
    applyButton.textContent = 'Apply Fix';
    applyButton.disabled = !fixActions;
    const copyButton = document.createElement('button');
    copyButton.type = 'button';
    copyButton.textContent = 'Copy Code';
    copyButton.className = 'ml-assistant-secondary-button';
    const generateFix = async () => {
        if (!fixActions) {
            throw new Error('No fix action is available');
        }
        if (currentFix) {
            return currentFix;
        }
        suggestButton.disabled = true;
        applyButton.disabled = true;
        suggestButton.textContent = 'Generating...';
        try {
            currentFix = await fixActions.suggestFix();
            fixSummary.textContent =
                currentFix.provider === 'gemini'
                    ? `Gemini suggestion: ${currentFix.summary}`
                    : currentFix.summary;
            fixCode.textContent = currentFix.candidate_code;
            copyButton.disabled = false;
            return currentFix;
        }
        finally {
            suggestButton.textContent = 'Suggest Fix';
            suggestButton.disabled = false;
            applyButton.disabled = false;
        }
    };
    suggestButton.addEventListener('click', async () => {
        suggestButton.disabled = true;
        suggestButton.textContent = 'Generating...';
        try {
            await generateFix();
        }
        catch (error) {
            fixSummary.textContent =
                error instanceof Error ? error.message : 'Could not generate a fix';
        }
        finally {
            suggestButton.disabled = false;
            suggestButton.textContent = 'Suggest Fix';
        }
    });
    applyButton.addEventListener('click', async () => {
        if (!fixActions) {
            return;
        }
        applyButton.disabled = true;
        suggestButton.disabled = true;
        applyButton.textContent = currentFix ? 'Applying...' : 'Generating...';
        try {
            const fix = await generateFix();
            await fixActions.applyFix(fix);
            applyButton.textContent = 'Fixed and ran';
        }
        catch (error) {
            applyButton.textContent =
                error instanceof Error ? error.message : 'Could not apply fix';
        }
        finally {
            suggestButton.disabled = false;
        }
        window.setTimeout(() => {
            applyButton.textContent = 'Apply Fix';
            applyButton.disabled = false;
        }, 2500);
    });
    copyButton.addEventListener('click', async () => {
        if (!currentFix) {
            return;
        }
        try {
            await navigator.clipboard.writeText(currentFix.candidate_code);
            copyButton.textContent = 'Copied';
        }
        catch (_a) {
            copyButton.textContent = 'Copy failed';
        }
        window.setTimeout(() => {
            copyButton.textContent = 'Copy Code';
        }, 1200);
    });
    copyButton.disabled = true;
    suggestButton.classList.add('ml-assistant-action-wide');
    actions.append(suggestButton, applyButton, copyButton);
    header.append(banner, traceback);
    container.append(header, explanation, fixCard, actions);
    if (suggestImmediately && fixActions) {
        suggestButton.click();
    }
}
const plugin = {
    id: '@ml-platform/error-assistant:plugin',
    description: 'JupyterLab error assistant frontend and server extension',
    autoStart: true,
    requires: [_jupyterlab_mainmenu__rspack_import_2.IMainMenu, _jupyterlab_notebook__rspack_import_3.INotebookTracker, _jupyterlab_translation__rspack_import_4.ITranslator, _jupyterlab_docmanager__rspack_import_1.IDocumentManager],
    activate: (app, mainMenu, notebooks, translator, documentManager) => {
        var _a;
        const trans = translator.load('@ml-platform/error-assistant');
        const panel = new _lumino_widgets__rspack_import_5.Widget();
        panel.id = 'ml-platform-error-assistant-panel';
        panel.title.label = 'Error Assistant';
        panel.title.caption = 'Error Assistant — analyze & fix notebook errors';
        panel.addClass('ml-platform-error-assistant-panel');
        // These are ModelMind Studio-only tools. Practice notebooks intentionally
        // keep the normal Jupyter editor and the AI Chatbot, but not Studio,
        // debugging, or API-key panels.
        const modeAwareWidgets = [panel];
        const chatbotWidgets = [];
        const practiceOnlyWidgets = [];
        let practiceQuestionsWidget = null;
        const shellLayout = app.shell;
        let workspaceRestored = !shellLayout.restored;
        let previousSidebarState = null;
        if (!document.getElementById('mm-plain-notebook-styles')) {
            const plainNotebookStyles = document.createElement('style');
            plainNotebookStyles.id = 'mm-plain-notebook-styles';
            plainNotebookStyles.textContent = `
        body.mm-plain-modelmind-notebook
          #jp-main-content-panel > .jp-SideArea[data-side="right"] {
          display: none !important;
        }
        body.mm-plain-modelmind-notebook
          .jp-SideBar.jp-mod-left
          .lm-TabBar-tab[data-id="modelmind-studio-sidebar"],
        body.mm-plain-modelmind-notebook #modelmind-studio-sidebar,
        body.mm-plain-modelmind-notebook #mm-tutor-fab,
        body.mm-plain-modelmind-notebook #mm-tutor-panel,
        body.mm-plain-modelmind-notebook #mm-tutor-overlay {
          display: none !important;
        }
      `;
            document.head.appendChild(plainNotebookStyles);
        }
        const getActiveSidebarId = (side) => {
            var _a, _b;
            return (_b = (_a = document
                .querySelector(`.jp-SideBar.jp-mod-${side} .lm-TabBar-tab.lm-mod-current`)) === null || _a === void 0 ? void 0 : _a.dataset.id) !== null && _b !== void 0 ? _b : null;
        };
        let connectedNotebookModel = null;
        const refreshNotebookPresentation = () => {
            var _a, _b, _c, _d, _e;
            const role = (0,_notebook_mode__rspack_import_7.getModelMindNotebookRole)((_a = notebooks.currentWidget) === null || _a === void 0 ? void 0 : _a.context.model);
            const plainNotebook = role === 'plain';
            const practiceNotebook = role === 'practice';
            const hideStudioTools = plainNotebook || practiceNotebook;
            for (const widget of modeAwareWidgets) {
                if (hideStudioTools)
                    widget.hide();
                else
                    widget.show();
            }
            for (const widget of chatbotWidgets) {
                if (plainNotebook)
                    widget.hide();
                else
                    widget.show();
            }
            for (const widget of practiceOnlyWidgets) {
                if (practiceNotebook)
                    widget.show();
                else
                    widget.hide();
            }
            if (plainNotebook) {
                // Workspace restoration can reselect a saved sidebar after notebook
                // metadata is read. Capture the user's normal layout only after that
                // restore completes so switching back to a regular notebook is exact.
                if (!previousSidebarState && workspaceRestored) {
                    previousSidebarState = {
                        leftCollapsed: (_b = shellLayout.leftCollapsed) !== null && _b !== void 0 ? _b : false,
                        rightCollapsed: (_c = shellLayout.rightCollapsed) !== null && _c !== void 0 ? _c : false,
                        leftActiveId: getActiveSidebarId('left'),
                        rightActiveId: getActiveSidebarId('right')
                    };
                }
                document.body.classList.add('mm-plain-modelmind-notebook');
                document.body.classList.remove('mm-practice-modelmind-notebook');
                if (!shellLayout.leftCollapsed &&
                    getActiveSidebarId('left') === 'modelmind-studio-sidebar') {
                    app.shell.activateById('filebrowser');
                }
            }
            else if (practiceNotebook) {
                document.body.classList.remove('mm-plain-modelmind-notebook');
                document.body.classList.add('mm-practice-modelmind-notebook');
                if (practiceQuestionsWidget && !shellLayout.leftCollapsed) {
                    app.shell.activateById(practiceQuestionsWidget.id);
                }
                if (!shellLayout.rightCollapsed && chatbotWidgets[0]) {
                    app.shell.activateById(chatbotWidgets[0].id);
                }
            }
            else if (previousSidebarState) {
                document.body.classList.remove('mm-plain-modelmind-notebook');
                document.body.classList.remove('mm-practice-modelmind-notebook');
                if (previousSidebarState.leftCollapsed) {
                    (_d = shellLayout.collapseLeft) === null || _d === void 0 ? void 0 : _d.call(shellLayout);
                }
                else if (previousSidebarState.leftActiveId) {
                    // Only restore if the user hasn't manually switched to a different tab.
                    // Don't override a tab the user has explicitly clicked (e.g. Upload/Files).
                    const currentLeftId = getActiveSidebarId('left');
                    const isStillOnModelmindStudio = currentLeftId === null ||
                        currentLeftId === 'modelmind-studio-sidebar';
                    if (isStillOnModelmindStudio) {
                        app.shell.activateById(previousSidebarState.leftActiveId);
                    }
                }
                if (previousSidebarState.rightCollapsed) {
                    (_e = shellLayout.collapseRight) === null || _e === void 0 ? void 0 : _e.call(shellLayout);
                }
                else if (previousSidebarState.rightActiveId) {
                    app.shell.activateById(previousSidebarState.rightActiveId);
                }
                previousSidebarState = null;
            }
            else {
                document.body.classList.remove('mm-plain-modelmind-notebook');
                document.body.classList.remove('mm-practice-modelmind-notebook');
            }
            (0,_debugger_tutor__rspack_import_8.setTutorEnabled)(!hideStudioTools);
        };
        void ((_a = shellLayout.restored) === null || _a === void 0 ? void 0 : _a.then(() => {
            workspaceRestored = true;
            refreshNotebookPresentation();
            // ── Set default sidebar widths ──
            // Only applies if the panel is currently narrower than our target.
            // This means: on first open → our default. After user drags → their saved size.
            setTimeout(() => {
                const leftStack = document.querySelector('#jp-left-stack');
                if (leftStack && leftStack.offsetWidth < 300) {
                    leftStack.style.width = '340px';
                }
                const rightStack = document.querySelector('#jp-right-stack');
                if (rightStack && rightStack.offsetWidth < 300) {
                    rightStack.style.width = '350px';
                }
            }, 400);
        }));
        let applyNotebookPresentation = refreshNotebookPresentation;
        const refreshOnMetadataChange = () => applyNotebookPresentation();
        const watchNotebookModel = (model) => {
            if (connectedNotebookModel) {
                connectedNotebookModel.metadataChanged.disconnect(refreshOnMetadataChange);
            }
            connectedNotebookModel = model;
            if (connectedNotebookModel) {
                connectedNotebookModel.metadataChanged.connect(refreshOnMetadataChange);
            }
            refreshNotebookPresentation();
        };
        notebooks.currentChanged.connect((_, notebook) => {
            if (!notebook) {
                watchNotebookModel(null);
                return;
            }
            void notebook.context.ready.then(() => {
                if (notebooks.currentWidget === notebook) {
                    watchNotebookModel(notebook.context.model);
                }
            });
        });
        const shell = document.createElement('div');
        shell.className = 'ml-assistant-shell';
        const header = document.createElement('div');
        header.className = 'ml-assistant-header';
        const heading = document.createElement('h2');
        heading.textContent = 'AI Assistant';
        const controls = document.createElement('div');
        controls.className = 'ml-assistant-header-controls';
        const installButton = document.createElement('button');
        installButton.type = 'button';
        installButton.className = 'ml-assistant-primary-button';
        installButton.textContent = 'Install Ollama';
        installButton.disabled = true;
        const cloudOption = document.createElement('label');
        cloudOption.className = 'ml-assistant-cloud-option';
        cloudOption.title =
            'When enabled, the failed cell, traceback, and nearby code may be sent to Google Gemini, either directly or as a fallback.';
        const geminiFallbackToggle = document.createElement('input');
        geminiFallbackToggle.type = 'checkbox';
        geminiFallbackToggle.disabled = true;
        const cloudOptionText = document.createElement('span');
        cloudOptionText.textContent = 'Allow Gemini use';
        cloudOption.append(geminiFallbackToggle, cloudOptionText);
        const statusRow = document.createElement('div');
        statusRow.className = 'ml-assistant-status-row';
        const localStatus = createStatusPill('Ollama (Local AI)', 'success');
        const cloudStatus = createStatusPill('Cloud disabled', 'default');
        const providerRow = document.createElement('label');
        providerRow.className = 'ml-assistant-provider-row';
        providerRow.textContent = 'Fix provider';
        const providerSelect = document.createElement('select');
        providerSelect.className = 'ml-assistant-provider-select';
        const ollamaOption = document.createElement('option');
        ollamaOption.value = 'ollama';
        ollamaOption.textContent = 'Ollama (local)';
        const geminiOption = document.createElement('option');
        geminiOption.value = 'gemini';
        geminiOption.textContent = 'Gemini (cloud)';
        providerSelect.append(ollamaOption, geminiOption);
        providerRow.appendChild(providerSelect);
        const tabRow = document.createElement('div');
        tabRow.className = 'ml-assistant-tab-row';
        const tabs = ['Explain Error', 'Suggest Fix', 'Code Help', 'Ask AI'];
        const tabButtons = new Map();
        tabs.forEach((tabText, index) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `ml-assistant-tab ${index === 0 ? 'active' : ''}`;
            btn.textContent = tabText;
            tabRow.appendChild(btn);
            tabButtons.set(tabText, btn);
        });
        // Error tracking
        let _lastCapturedError = null;
        const ctaWrap = document.createElement('div');
        ctaWrap.className = 'ml-assistant-cta-row';
        const captureButton = document.createElement('button');
        captureButton.type = 'button';
        captureButton.className = 'ml-assistant-cta-button';
        captureButton.textContent = 'Analyze Error';
        ctaWrap.appendChild(captureButton);
        const content = document.createElement('div');
        content.className = 'ml-assistant-content';
        const makePlaceholder = () => {
            const empty = document.createElement('div');
            empty.className = 'ml-assistant-empty';
            empty.textContent = 'Select a failed code cell to capture its error.';
            return empty;
        };
        let analysisMode = 'explain';
        let ollamaConnected = false;
        content.appendChild(makePlaceholder());
        header.append(heading, controls);
        controls.append(installButton, cloudOption);
        statusRow.append(localStatus, cloudStatus);
        shell.append(header, statusRow, providerRow, tabRow, ctaWrap, content);
        panel.node.append(shell);
        const setStatus = async () => {
            try {
                const health = await (0,_request__rspack_import_9.requestAPI)('api/health', app.serviceManager.serverSettings);
                localStatus.textContent =
                    health.status === 'ok' ? 'Ollama (Local AI)' : 'Platform unavailable';
                localStatus.className =
                    health.status === 'ok'
                        ? 'ml-assistant-status-pill ml-assistant-status-success'
                        : 'ml-assistant-status-pill ml-assistant-status-warn';
                geminiFallbackToggle.disabled = !health.gemini_fallback_available;
                geminiOption.disabled = !health.gemini_fallback_available;
                if (geminiOption.disabled && providerSelect.value === 'gemini') {
                    providerSelect.value = 'ollama';
                }
                cloudStatus.textContent = health.gemini_fallback_available
                    ? 'Gemini available (opt-in)'
                    : health.cloud_fallback === 'enabled'
                        ? 'Gemini API key missing'
                        : 'Cloud disabled by server';
                cloudStatus.className = health.gemini_fallback_available
                    ? 'ml-assistant-status-pill ml-assistant-status-success'
                    : 'ml-assistant-status-pill ml-assistant-status-default';
            }
            catch (_a) {
                localStatus.textContent = 'Platform unavailable';
                localStatus.className =
                    'ml-assistant-status-pill ml-assistant-status-warn';
                geminiFallbackToggle.disabled = true;
                cloudStatus.textContent = 'Cloud status unavailable';
                cloudStatus.className =
                    'ml-assistant-status-pill ml-assistant-status-warn';
            }
            try {
                const ollama = await (0,_request__rspack_import_9.requestAPI)('api/local-ai/status', app.serviceManager.serverSettings);
                if (ollama.status === 'connected' &&
                    ollama.model_status === 'available') {
                    ollamaConnected = true;
                    localStatus.textContent = 'Ollama (Local AI)';
                    localStatus.className =
                        'ml-assistant-status-pill ml-assistant-status-success';
                    installButton.textContent = 'Model ready';
                    installButton.disabled = true;
                }
                else if (ollama.status === 'connected') {
                    ollamaConnected = true;
                    localStatus.textContent = 'Model missing';
                    localStatus.className =
                        'ml-assistant-status-pill ml-assistant-status-warn';
                    installButton.textContent = 'Install recommended model';
                    installButton.disabled = false;
                }
                else {
                    ollamaConnected = false;
                    localStatus.textContent = 'Ollama not detected';
                    localStatus.className =
                        'ml-assistant-status-pill ml-assistant-status-warn';
                    installButton.textContent = 'Get Ollama';
                    installButton.disabled = false;
                }
            }
            catch (_b) {
                ollamaConnected = false;
                localStatus.textContent = 'Local AI unavailable';
                localStatus.className =
                    'ml-assistant-status-pill ml-assistant-status-warn';
                installButton.textContent = 'Get Ollama';
                installButton.disabled = false;
            }
        };
        captureButton.addEventListener('click', async () => {
            const targetCell = getTargetCell(notebooks);
            const notebookPanel = notebooks.currentWidget;
            const error = captureActiveError(targetCell);
            if (!error) {
                renderAssistantResult(content, {
                    errorType: 'No error detected',
                    errorMessage: 'The active code cell has no error output.',
                    traceback: 'No traceback available.',
                    summary: 'Select a cell that produced an actual runtime error.',
                    details: ['The selected cell is not currently failing.'],
                    fix: 'print("Select a failing cell and retry.")'
                });
                return;
            }
            content.innerHTML = '';
            captureButton.disabled = true;
            const loading = document.createElement('div');
            loading.className = 'ml-assistant-empty';
            loading.textContent = 'Capturing error...';
            content.appendChild(loading);
            // ── Also auto-trigger the Tutor for every error ──
            if (error) {
                _lastCapturedError = error;
                void (0,_debugger_tutor__rspack_import_8.loadTutorExplanation)({
                    error_type: error.error_type,
                    error_message: error.error_message,
                    traceback: error.traceback,
                    code: error.code,
                }, app.serviceManager.serverSettings);
            }
            try {
                const result = await (0,_request__rspack_import_9.requestAPI)('api/error/analyze', app.serviceManager.serverSettings, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(error)
                });
                if (result.status !== 'analyzed') {
                    throw new Error('analysis unavailable');
                }
                let explanationSummary = result.analysis.summary;
                let explanationDetails = result.analysis.details;
                const suggestFix = async () => {
                    if (!targetCell || !notebookPanel) {
                        throw new Error('Select a notebook cell first');
                    }
                    const suggestion = await (0,_request__rspack_import_9.requestAPI)('api/ai/fix', app.serviceManager.serverSettings, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            error,
                            notebook_context: getAdjacentNotebookCode(notebookPanel, targetCell),
                            provider: providerSelect.value,
                            allow_gemini_fallback: geminiFallbackToggle.checked
                        })
                    });
                    if (suggestion.status !== 'suggested' || !suggestion.candidate_code) {
                        throw new Error(suggestion.message ||
                            (suggestion.status === 'gemini_disabled'
                                ? 'Gemini fallback is disabled by server policy'
                                : suggestion.status === 'gemini_opt_in_required'
                                    ? 'Check Allow Gemini use before selecting Gemini'
                                    : suggestion.status === 'gemini_unconfigured'
                                        ? 'Save a Gemini API key in JupyterLab using the API Key tab in the right sidebar'
                                        : suggestion.status === 'gemini_unavailable'
                                            ? 'Gemini is temporarily unavailable; try again later'
                                            : suggestion.status === 'model_missing'
                                                ? `Install ${suggestion.model_id || 'the local Ollama model'} first`
                                                : suggestion.status === 'incomplete_model_response' ||
                                                    suggestion.status === 'incomplete_gemini_response'
                                                    ? 'The AI returned only part of the cell. Nothing was applied; try again or enable Gemini fallback.'
                                                    : 'Neither local Ollama nor the enabled Gemini fallback produced a valid fix'));
                    }
                    return {
                        summary: suggestion.summary || 'A fix candidate is ready.',
                        candidate_code: suggestion.candidate_code,
                        provider: suggestion.provider || 'ollama'
                    };
                };
                const applyFix = async (suggestion) => {
                    if (!targetCell || !notebookPanel) {
                        throw new Error('Select a notebook cell first');
                    }
                    if (!(0,_fix_utils__rspack_import_10.applyFixToCellModel)(targetCell.model, suggestion.candidate_code)) {
                        throw new Error('Could not update the failed cell');
                    }
                    const executed = await _jupyterlab_notebook__rspack_import_3.NotebookActions.runCells(notebookPanel.content, [targetCell], notebookPanel.sessionContext);
                    if (!executed) {
                        throw new Error('Fix applied; cell could not be run');
                    }
                    if (!(0,_jupyterlab_cells__rspack_import_0.isCodeCellModel)(targetCell.model) ||
                        targetCell.model.outputs.toJSON().some(isErrorOutput)) {
                        throw new Error('Fix applied, but the cell still reports an error');
                    }
                };
                const fixActions = { suggestFix, applyFix };
                if (result.analysis.is_sufficient) {
                    renderAssistantResult(content, {
                        errorType: error.error_type,
                        errorMessage: error.error_message,
                        traceback: error.traceback,
                        summary: explanationSummary,
                        details: explanationDetails,
                        fix: 'A corrected cell will be generated locally when you apply the fix.'
                    }, fixActions, analysisMode === 'suggest');
                    return;
                }
                const explanation = await (0,_request__rspack_import_9.requestAPI)('api/ai/explain', app.serviceManager.serverSettings, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(error)
                });
                if (explanation.status === 'explained' && explanation.explanation) {
                    explanationSummary = explanation.explanation.summary;
                    explanationDetails = explanation.explanation.details;
                }
                renderAssistantResult(content, {
                    errorType: error.error_type,
                    errorMessage: error.error_message,
                    traceback: error.traceback,
                    summary: explanationSummary,
                    details: explanationDetails,
                    fix: 'A corrected cell will be generated locally when you apply the fix.'
                }, fixActions, analysisMode === 'suggest');
            }
            catch (_a) {
                renderAssistantResult(content, {
                    errorType: 'Error analysis unavailable',
                    errorMessage: 'The platform could not diagnose this error.',
                    traceback: 'The backend returned no valid analysis.',
                    summary: 'The local platform could not validate the notebook error.',
                    details: ['Check the notebook output and retry the analysis.'],
                    fix: 'print("Review the failing cell and confirm the variable or column exists.")'
                });
            }
            finally {
                captureButton.disabled = false;
            }
        });
        const showCodeHelp = () => {
            const targetCell = getTargetCell(notebooks);
            if (!targetCell || !(0,_jupyterlab_cells__rspack_import_0.isCodeCellModel)(targetCell.model)) {
                const message = document.createElement('div');
                message.className = 'ml-assistant-empty';
                message.textContent =
                    'Select a code cell to ask local Ollama about it.';
                content.replaceChildren(message);
                return;
            }
            const source = targetCell.model.toJSON().source;
            const code = (Array.isArray(source) ? source.join('') : source).slice(0, MAX_CODE_LENGTH);
            const notebookPanel = notebooks.currentWidget;
            const questionInput = document.createElement('textarea');
            questionInput.className = 'ml-assistant-question-input';
            questionInput.maxLength = 1000;
            questionInput.value = 'Explain this cell and point out potential issues.';
            const questionLabel = document.createElement('label');
            questionLabel.className = 'ml-assistant-question-label';
            questionLabel.textContent = 'Ask a question about this cell';
            questionLabel.appendChild(questionInput);
            const askButton = document.createElement('button');
            askButton.type = 'button';
            askButton.className = 'ml-assistant-cta-button';
            askButton.textContent = 'Ask Local Ollama';
            const answer = document.createElement('div');
            answer.className = 'ml-assistant-code-help-answer';
            content.replaceChildren(questionLabel, askButton, answer);
            askButton.addEventListener('click', async () => {
                const question = questionInput.value.trim();
                if (!question) {
                    answer.textContent = 'Enter a question about this code first.';
                    return;
                }
                askButton.disabled = true;
                answer.textContent = 'Asking local Ollama...';
                try {
                    const result = await (0,_request__rspack_import_9.requestAPI)('api/ai/code-help', app.serviceManager.serverSettings, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            code,
                            question,
                            notebook_context: notebookPanel && targetCell
                                ? getAdjacentNotebookCode(notebookPanel, targetCell)
                                : ''
                        })
                    });
                    answer.replaceChildren();
                    if (result.status !== 'explained' || !result.explanation) {
                        answer.textContent =
                            result.status === 'model_missing'
                                ? `Install ${result.model_id || 'the local Ollama model'} first.`
                                : 'Local Ollama could not answer this code question.';
                        return;
                    }
                    const summary = document.createElement('p');
                    summary.textContent = result.explanation.summary;
                    const details = document.createElement('ul');
                    result.explanation.details.forEach(detail => {
                        const item = document.createElement('li');
                        item.textContent = detail;
                        details.appendChild(item);
                    });
                    answer.append(summary, details);
                }
                catch (_a) {
                    answer.textContent = 'Local code help is unavailable right now.';
                }
                finally {
                    askButton.disabled = false;
                }
            });
        };
        tabButtons.forEach((tabButton, tabText) => {
            tabButton.addEventListener('click', () => {
                tabButtons.forEach(button => button.classList.remove('active'));
                tabButton.classList.add('active');
                if (tabText === 'Code Help' || tabText === 'Ask AI') {
                    analysisMode = 'explain';
                    showCodeHelp();
                    return;
                }
                analysisMode = tabText === 'Suggest Fix' ? 'suggest' : 'explain';
                void captureButton.click();
            });
        });
        installButton.addEventListener('click', async () => {
            if (!ollamaConnected) {
                window.open('https://ollama.com/download', '_blank', 'noopener,noreferrer');
                return;
            }
            installButton.disabled = true;
            try {
                const result = await (0,_request__rspack_import_9.requestAPI)('api/local-ai/install', app.serviceManager.serverSettings, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ allow_download: true })
                });
                if (result.status === 'installed') {
                    await setStatus();
                    renderAssistantResult(content, {
                        errorType: 'Model installed',
                        errorMessage: result.message || 'Local model ready',
                        traceback: 'Installation completed successfully.',
                        summary: 'The recommended local model is available for notebook error explanations.',
                        details: ['The local Ollama path is now active.'],
                        fix: 'print("Model ready. Re-run the failing cell to explain the error.")'
                    });
                    return;
                }
                renderAssistantResult(content, {
                    errorType: 'Local model installation failed',
                    errorMessage: result.message || 'The recommended Ollama model could not be installed.',
                    traceback: 'No notebook code was sent to a cloud service.',
                    summary: 'ModelMind could not finish downloading the local model.',
                    details: [
                        'Check that Ollama is running and that this computer has an internet connection.',
                        'Retry after resolving the issue; the model is not installed until Ollama confirms it.'
                    ],
                    fix: 'Restart Ollama and retry the model installation.'
                });
            }
            catch (error) {
                renderAssistantResult(content, {
                    errorType: 'Local model installation failed',
                    errorMessage: error instanceof Error ? error.message : 'The local model request failed.',
                    traceback: 'No notebook code was sent to a cloud service.',
                    summary: 'ModelMind could not finish downloading the local model.',
                    details: ['Check the local Jupyter server and Ollama status, then retry.'],
                    fix: 'Restart the local ModelMind services and retry.'
                });
            }
            finally {
                await setStatus();
            }
        });
        app.shell.add(panel, 'right', { rank: 900 });
        // ── Redirect listener: switch to AI Assistant when requested by Tutor (<70% confidence) ──
        window.addEventListener('modelmind:open-ai-assistant', (e) => {
            var _a, _b;
            const role = (0,_notebook_mode__rspack_import_7.getModelMindNotebookRole)((_a = notebooks.currentWidget) === null || _a === void 0 ? void 0 : _a.context.model);
            if (role === 'plain' || role === 'practice') {
                return;
            }
            app.shell.activateById(panel.id);
            const mode = ((_b = e === null || e === void 0 ? void 0 : e.detail) === null || _b === void 0 ? void 0 : _b.mode) === 'suggest' ? 'Suggest Fix' : 'Explain Error';
            const targetTab = tabButtons.get(mode) || tabButtons.get('Explain Error');
            if (targetTab) {
                targetTab.click();
            }
            else {
                void captureButton.click();
            }
        });
        // ── Initialise the AI Debugger Tutor FAB (bottom-right slide panel) ──
        (0,_debugger_tutor__rspack_import_8.createFAB)(app.serviceManager.serverSettings);
        // ═══════════════════════════════════════════════════════════
        // RIGHT SIDEBAR — AI Chatbot Panel
        // ═══════════════════════════════════════════════════════════
        const chatbotWidget = new _lumino_widgets__rspack_import_5.Widget();
        chatbotWidget.id = 'mm-ai-chatbot-panel';
        chatbotWidget.title.label = 'AI Chat';
        chatbotWidget.title.caption = 'AI Chatbot — powered by Ollama & Gemini';
        chatbotWidget.addClass('mm-chatbot-widget');
        // Context getters: provide live notebook context to chatbot
        const getActiveCodeForChat = () => {
            const cell = getTargetCell(notebooks);
            if (!cell || !(0,_jupyterlab_cells__rspack_import_0.isCodeCellModel)(cell.model))
                return '';
            const src = cell.model.toJSON().source;
            return (Array.isArray(src) ? src.join('') : src).slice(0, MAX_CODE_LENGTH);
        };
        const getActiveErrorForChat = () => {
            const cell = getTargetCell(notebooks);
            return captureActiveError(cell) || _lastCapturedError;
        };
        const runCodeTraceForChat = async (source) => {
            var _a, _b;
            const kernel = (_b = (_a = notebooks.currentWidget) === null || _a === void 0 ? void 0 : _a.sessionContext.session) === null || _b === void 0 ? void 0 : _b.kernel;
            if (!kernel || kernel.isDisposed) {
                throw new Error('Start a notebook kernel before capturing an execution trace.');
            }
            const marker = `__MODELMIND_TRACE_${Date.now()}__:`;
            const wrappedCode = `
import json as _mm_json
def _mm_trace_runner(_mm_source):
    import sys as _mm_sys
    import ast as _mm_ast
    _mm_tracked_names = {node.id for node in _mm_ast.walk(_mm_ast.parse(_mm_source)) if isinstance(node, _mm_ast.Name)}
    _mm_events = []
    _mm_filename = '<modelmind-execution-trace>'
    def _mm_trace(frame, event, arg):
        if frame.f_code.co_filename != _mm_filename:
            return None
        if event == 'line':
            if len(_mm_events) >= 1000:
                raise RuntimeError('Trace stopped after 1,000 Python line events.')
            _mm_variables = {}
            for _mm_name, _mm_value in frame.f_locals.items():
                if _mm_name not in _mm_tracked_names:
                    continue
                if isinstance(_mm_value, (str, int, float, bool, type(None))):
                    _mm_value_text = repr(_mm_value)
                elif isinstance(_mm_value, (list, tuple, dict)) and len(_mm_value) <= 16:
                    if all(isinstance(_mm_item, (str, int, float, bool, type(None))) for _mm_item in (_mm_value.values() if isinstance(_mm_value, dict) else _mm_value)):
                        _mm_value_text = repr(_mm_value)
                    else:
                        continue
                elif type(_mm_value).__module__.startswith('pandas') and hasattr(_mm_value, 'shape'):
                    _mm_value_text = '<' + type(_mm_value).__name__ + ' shape=' + str(_mm_value.shape) + '>'
                elif type(_mm_value).__module__.startswith('numpy') and hasattr(_mm_value, 'shape'):
                    _mm_value_text = '<' + type(_mm_value).__name__ + ' shape=' + str(_mm_value.shape) + ' dtype=' + str(getattr(_mm_value, 'dtype', 'unknown')) + '>'
                elif type(_mm_value).__module__.startswith('numpy') and hasattr(_mm_value, 'item'):
                    try:
                        _mm_value_text = repr(_mm_value.item())
                    except Exception:
                        continue
                else:
                    continue
                _mm_variables[_mm_name] = _mm_value_text[:240]
                if len(_mm_variables) >= 12:
                    break
            _mm_stack = []
            _mm_cursor = frame
            while _mm_cursor is not None and _mm_cursor.f_code.co_filename == _mm_filename:
                _mm_stack.append(_mm_cursor.f_code.co_name)
                _mm_cursor = _mm_cursor.f_back
            _mm_stack.reverse()
            _mm_events.append({'line': frame.f_lineno, 'functionName': frame.f_code.co_name, 'variables': _mm_variables, 'callStack': _mm_stack})
        return _mm_trace

    _mm_previous_trace = _mm_sys.gettrace()
    try:
        _mm_sys.settrace(_mm_trace)
        try:
            exec(compile(_mm_source, _mm_filename, 'exec'), get_ipython().user_ns, get_ipython().user_ns)
            return _mm_events, None, None
        except BaseException as _mm_exc:
            import traceback as _mm_traceback
            _mm_error_line = next((item.lineno for item in reversed(_mm_traceback.extract_tb(_mm_exc.__traceback__)) if item.filename == _mm_filename), None)
            return _mm_events, type(_mm_exc).__name__ + ': ' + str(_mm_exc), _mm_error_line
    finally:
        _mm_sys.settrace(_mm_previous_trace)

_mm_events, _mm_error, _mm_error_line = _mm_trace_runner(${JSON.stringify(source)})
print(${JSON.stringify(marker)} + _mm_json.dumps({'events': _mm_events, 'error': _mm_error, 'errorLine': _mm_error_line}))
del _mm_events, _mm_error, _mm_error_line, _mm_trace_runner, _mm_json
`;
            let capturedOutput = '';
            const future = kernel.requestExecute({
                code: wrappedCode,
                silent: false,
                store_history: false,
                allow_stdin: false,
                stop_on_error: true
            });
            future.onIOPub = message => {
                var _a;
                if (message.header.msg_type === 'stream') {
                    capturedOutput += (_a = message.content.text) !== null && _a !== void 0 ? _a : '';
                }
            };
            await future.done;
            const markerIndex = capturedOutput.lastIndexOf(marker);
            if (markerIndex < 0) {
                throw new Error('The kernel did not return a trace. Check that it is responsive, then try again.');
            }
            const output = capturedOutput.slice(0, markerIndex).trim();
            const payload = JSON.parse(capturedOutput.slice(markerIndex + marker.length).trim());
            return {
                events: Array.isArray(payload.events) ? payload.events : [],
                output,
                error: payload.error || undefined,
                errorLine: typeof payload.errorLine === 'number' ? payload.errorLine : undefined
            };
        };
        const loadDecisionTreesForChat = async () => {
            var _a, _b;
            const kernel = (_b = (_a = notebooks.currentWidget) === null || _a === void 0 ? void 0 : _a.sessionContext.session) === null || _b === void 0 ? void 0 : _b.kernel;
            if (!kernel || kernel.isDisposed) {
                throw new Error('Start a notebook kernel and fit a decision tree before opening this view.');
            }
            const marker = `__MODELMIND_TREES_${Date.now()}__:`;
            const code = `
import json as _mm_json
def _mm_describe_tree(_mm_name, _mm_estimator, _mm_namespace):
    _mm_tree = _mm_estimator.tree_
    _mm_task = 'classification' if hasattr(_mm_estimator, 'classes_') else 'regression'
    _mm_class_values = getattr(_mm_estimator, 'classes_', [])
    if hasattr(_mm_class_values, 'tolist'):
        _mm_class_values = _mm_class_values.tolist()
    _mm_feature_names = getattr(_mm_estimator, 'feature_names_in_', [])
    if hasattr(_mm_feature_names, 'tolist'):
        _mm_feature_names = _mm_feature_names.tolist()
    if not _mm_feature_names:
        for _mm_data_name in ('X_train', 'X', 'features'):
            _mm_data = _mm_namespace.get(_mm_data_name)
            if hasattr(_mm_data, 'columns'):
                _mm_feature_names = [str(_mm_column) for _mm_column in _mm_data.columns]
                break
    _mm_depths = [0] * _mm_tree.node_count
    _mm_stack = [(0, 0)]
    while _mm_stack:
        _mm_index, _mm_depth = _mm_stack.pop()
        if _mm_index >= _mm_tree.node_count:
            continue
        _mm_depths[_mm_index] = _mm_depth
        _mm_left = int(_mm_tree.children_left[_mm_index])
        _mm_right = int(_mm_tree.children_right[_mm_index])
        if _mm_left != _mm_right:
            _mm_stack.append((_mm_right, _mm_depth + 1))
            _mm_stack.append((_mm_left, _mm_depth + 1))
    _mm_nodes = []
    for _mm_index in range(int(_mm_tree.node_count)):
        if _mm_depths[_mm_index] > 10:
            continue
        _mm_left = int(_mm_tree.children_left[_mm_index])
        _mm_right = int(_mm_tree.children_right[_mm_index])
        _mm_leaf = _mm_left == _mm_right
        _mm_feature_index = int(_mm_tree.feature[_mm_index])
        _mm_feature = str(_mm_feature_names[_mm_feature_index]) if 0 <= _mm_feature_index < len(_mm_feature_names) else 'feature_' + str(_mm_feature_index)
        _mm_values = _mm_tree.value[_mm_index][0].tolist()
        if _mm_task == 'classification' and _mm_values:
            _mm_prediction_index = max(range(len(_mm_values)), key=lambda _mm_i: _mm_values[_mm_i])
            _mm_prediction = str(_mm_class_values[_mm_prediction_index]) if _mm_prediction_index < len(_mm_class_values) else 'class ' + str(_mm_prediction_index)
        else:
            _mm_prediction = str(_mm_values[0]) if _mm_values else 'unknown'
        _mm_nodes.append({
            'id': _mm_index,
            'depth': _mm_depths[_mm_index],
            'left': None if _mm_leaf else _mm_left,
            'right': None if _mm_leaf else _mm_right,
            'feature': _mm_feature,
            'threshold': None if _mm_leaf else float(_mm_tree.threshold[_mm_index]),
            'samples': int(_mm_tree.n_node_samples[_mm_index]),
            'impurity': float(_mm_tree.impurity[_mm_index]),
            'prediction': _mm_prediction
        })
    return {
        'modelName': _mm_name,
        'task': _mm_task,
        'criterion': str(getattr(_mm_estimator, 'criterion', 'tree split')),
        'nodeCount': int(_mm_tree.node_count),
        'maxDepth': int(_mm_tree.max_depth),
        'nodes': _mm_nodes
    }

_mm_namespace = get_ipython().user_ns
_mm_trees = []
_mm_seen = set()
for _mm_name, _mm_object in list(_mm_namespace.items()):
    # IPython stores the previous cell result under _, __, and ___. These can
    # point at an older fitted tree and should not appear as named user models.
    if _mm_name.startswith('_') or _mm_name in ('In', 'Out'):
        continue
    _mm_candidates = [(_mm_name, _mm_object)]
    for _mm_step_name, _mm_step in getattr(_mm_object, 'steps', []) or []:
        _mm_candidates.append((_mm_name + '.' + str(_mm_step_name), _mm_step))
    for _mm_candidate_name, _mm_candidate in _mm_candidates:
        try:
            _mm_tree_id = id(_mm_candidate)
            if _mm_tree_id in _mm_seen or not hasattr(_mm_candidate, 'tree_'):
                continue
            _mm_seen.add(_mm_tree_id)
            _mm_trees.append(_mm_describe_tree(_mm_candidate_name, _mm_candidate, _mm_namespace))
        except Exception:
            continue
    if len(_mm_trees) >= 10:
        break
print(${JSON.stringify(marker)} + _mm_json.dumps(_mm_trees))
for _mm_cleanup_name in ('_mm_describe_tree', '_mm_namespace', '_mm_trees', '_mm_seen', '_mm_name', '_mm_object', '_mm_candidates', '_mm_candidate_name', '_mm_candidate', '_mm_step_name', '_mm_step', '_mm_tree_id', '_mm_json'):
    get_ipython().user_ns.pop(_mm_cleanup_name, None)
`;
            let capturedOutput = '';
            const future = kernel.requestExecute({ code, silent: false, store_history: false, allow_stdin: false, stop_on_error: true });
            future.onIOPub = message => {
                var _a;
                if (message.header.msg_type === 'stream') {
                    capturedOutput += (_a = message.content.text) !== null && _a !== void 0 ? _a : '';
                }
            };
            await future.done;
            const markerIndex = capturedOutput.lastIndexOf(marker);
            if (markerIndex < 0) {
                throw new Error('Could not read a fitted tree from the current kernel. Confirm the model was fitted with scikit-learn.');
            }
            return JSON.parse(capturedOutput.slice(markerIndex + marker.length).trim());
        };
        const loadNeuralNetworksForChat = async () => {
            var _a, _b;
            const kernel = (_b = (_a = notebooks.currentWidget) === null || _a === void 0 ? void 0 : _a.sessionContext.session) === null || _b === void 0 ? void 0 : _b.kernel;
            if (!kernel || kernel.isDisposed) {
                throw new Error('Start a notebook kernel and fit a neural network before opening this view.');
            }
            const marker = `__MODELMIND_NEURAL_NETWORKS_${Date.now()}__:`;
            const code = `
import json as _mm_json
def _mm_even_samples(_mm_size, _mm_limit=12):
    if _mm_size <= _mm_limit:
        return list(range(_mm_size))
    return sorted(set(round(_mm_i * (_mm_size - 1) / (_mm_limit - 1)) for _mm_i in range(_mm_limit)))
_mm_namespace = get_ipython().user_ns
_mm_networks = []
_mm_seen = set()
for _mm_name, _mm_object in list(_mm_namespace.items()):
    if _mm_name.startswith('_') or _mm_name in ('In', 'Out'):
        continue
    _mm_parent_features = getattr(_mm_object, 'feature_names_in_', [])
    if hasattr(_mm_parent_features, 'tolist'):
        _mm_parent_features = _mm_parent_features.tolist()
    _mm_candidates = [(_mm_name, _mm_object, _mm_parent_features)]
    for _mm_step_name, _mm_step in getattr(_mm_object, 'steps', []) or []:
        _mm_candidates.append((_mm_name + '.' + str(_mm_step_name), _mm_step, _mm_parent_features))
    for _mm_candidate_name, _mm_model, _mm_parent_feature_names in _mm_candidates:
        try:
            _mm_kind = type(_mm_model).__name__
            if _mm_kind not in ('MLPClassifier', 'MLPRegressor') or not hasattr(_mm_model, 'coefs_'):
                continue
            if id(_mm_model) in _mm_seen:
                continue
            _mm_seen.add(id(_mm_model))
            _mm_coefs = _mm_model.coefs_
            _mm_sizes = [int(_mm_coefs[0].shape[0])] + [int(_mm_matrix.shape[1]) for _mm_matrix in _mm_coefs]
            _mm_indices = [_mm_even_samples(_mm_size) for _mm_size in _mm_sizes]
            _mm_features = getattr(_mm_model, 'feature_names_in_', [])
            if hasattr(_mm_features, 'tolist'):
                _mm_features = _mm_features.tolist()
            if len(_mm_features) != _mm_sizes[0]:
                _mm_features = _mm_parent_feature_names
            if len(_mm_features) != _mm_sizes[0]:
                _mm_features = []
                for _mm_data_name in ('X_train_scaled', 'X_train', 'X', 'features'):
                    _mm_data = _mm_namespace.get(_mm_data_name)
                    if hasattr(_mm_data, 'columns') and len(_mm_data.columns) == _mm_sizes[0]:
                        _mm_features = [str(_mm_column) for _mm_column in _mm_data.columns]
                        break
            _mm_classes = getattr(_mm_model, 'classes_', [])
            if hasattr(_mm_classes, 'tolist'):
                _mm_classes = _mm_classes.tolist()
            _mm_layers = []
            for _mm_layer_index, _mm_size in enumerate(_mm_sizes):
                if _mm_layer_index == 0:
                    _mm_label = 'Input'
                elif _mm_layer_index == len(_mm_sizes) - 1:
                    _mm_label = 'Output'
                else:
                    _mm_label = 'Hidden ' + str(_mm_layer_index)
                _mm_nodes = []
                for _mm_node_index in _mm_indices[_mm_layer_index]:
                    _mm_node_label = 'unit ' + str(_mm_node_index)
                    if _mm_layer_index == 0 and len(_mm_features) == _mm_size:
                        _mm_node_label = str(_mm_features[_mm_node_index])
                    elif _mm_layer_index == len(_mm_sizes) - 1 and len(_mm_classes) == _mm_size:
                        _mm_node_label = str(_mm_classes[_mm_node_index])
                    _mm_nodes.append({'index': int(_mm_node_index), 'label': _mm_node_label})
                _mm_layers.append({'label': _mm_label, 'size': _mm_size, 'nodes': _mm_nodes})
            _mm_connections = []
            for _mm_layer_index, _mm_matrix in enumerate(_mm_coefs):
                for _mm_from_index in _mm_indices[_mm_layer_index]:
                    for _mm_to_index in _mm_indices[_mm_layer_index + 1]:
                        _mm_connections.append({
                            'fromLayer': _mm_layer_index,
                            'fromNode': int(_mm_from_index),
                            'toNode': int(_mm_to_index),
                            'weight': float(_mm_matrix[_mm_from_index, _mm_to_index])
                        })
            _mm_networks.append({
                'modelName': _mm_candidate_name,
                'modelType': _mm_kind,
                'task': 'classification' if _mm_kind == 'MLPClassifier' else 'regression',
                'activation': str(getattr(_mm_model, 'activation', 'unknown')),
                'outputActivation': str(getattr(_mm_model, 'out_activation_', 'unknown')),
                'loss': str(getattr(_mm_model, 'loss_', 'unknown')),
                'epochs': int(getattr(_mm_model, 'n_iter_', 0)),
                'layers': _mm_layers,
                'connections': _mm_connections,
                'classes': [str(_mm_class) for _mm_class in _mm_classes]
            })
        except Exception:
            continue
    if len(_mm_networks) >= 10:
        break
print(${JSON.stringify(marker)} + _mm_json.dumps(_mm_networks))
for _mm_cleanup_name in ('_mm_even_samples', '_mm_namespace', '_mm_networks', '_mm_seen', '_mm_name', '_mm_object', '_mm_parent_features', '_mm_candidates', '_mm_step_name', '_mm_step', '_mm_candidate_name', '_mm_model', '_mm_parent_feature_names', '_mm_kind', '_mm_coefs', '_mm_sizes', '_mm_indices', '_mm_features', '_mm_data_name', '_mm_data', '_mm_column', '_mm_classes', '_mm_layers', '_mm_layer_index', '_mm_size', '_mm_label', '_mm_nodes', '_mm_node_index', '_mm_node_label', '_mm_connections', '_mm_matrix', '_mm_from_index', '_mm_to_index', '_mm_json'):
    get_ipython().user_ns.pop(_mm_cleanup_name, None)
`;
            let capturedOutput = '';
            const future = kernel.requestExecute({ code, silent: false, store_history: false, allow_stdin: false, stop_on_error: true });
            future.onIOPub = message => {
                var _a;
                if (message.header.msg_type === 'stream') {
                    capturedOutput += (_a = message.content.text) !== null && _a !== void 0 ? _a : '';
                }
            };
            await future.done;
            const markerIndex = capturedOutput.lastIndexOf(marker);
            if (markerIndex < 0) {
                throw new Error('Could not inspect fitted neural networks. Fit a scikit-learn MLPClassifier or MLPRegressor first.');
            }
            return JSON.parse(capturedOutput.slice(markerIndex + marker.length).trim());
        };
        const loadTrainingSourcesForChat = async () => {
            var _a, _b;
            const kernel = (_b = (_a = notebooks.currentWidget) === null || _a === void 0 ? void 0 : _a.sessionContext.session) === null || _b === void 0 ? void 0 : _b.kernel;
            if (!kernel || kernel.isDisposed) {
                throw new Error('Start a notebook kernel and define feature and target variables before training.');
            }
            const marker = `__MODELMIND_TRAINING_SOURCES_${Date.now()}__:`;
            const code = `
import json as _mm_json
from sklearn.utils.multiclass import type_of_target as _mm_type_of_target
_mm_ns = get_ipython().user_ns
_mm_pairs = [
    ('X_train', 'y_train', 'X_test', 'y_test'),
    ('X_train_scaled', 'y_train', 'X_test_scaled', 'y_test'),
    ('X', 'y', None, None),
    ('features', 'target', None, None)
]
_mm_sources = []
_mm_seen = set()
for _mm_x_name, _mm_y_name, _mm_x_test_name, _mm_y_test_name in _mm_pairs:
    _mm_key = (_mm_x_name, _mm_y_name)
    if _mm_key in _mm_seen:
        continue
    _mm_seen.add(_mm_key)
    _mm_x = _mm_ns.get(_mm_x_name)
    _mm_y = _mm_ns.get(_mm_y_name)
    if _mm_x is None or _mm_y is None:
        continue
    try:
        _mm_rows = len(_mm_x)
        _mm_features = int(_mm_x.shape[1])
        if _mm_rows < 5 or _mm_features < 1 or len(_mm_y) != _mm_rows:
            continue
        _mm_target_kind = _mm_type_of_target(_mm_y)
        if _mm_target_kind in ('binary', 'multiclass'):
            _mm_task = 'classification'
        elif _mm_target_kind in ('continuous', 'continuous-multioutput'):
            _mm_task = 'regression'
        else:
            continue
        _mm_has_test = bool(_mm_x_test_name and _mm_y_test_name and _mm_ns.get(_mm_x_test_name) is not None and _mm_ns.get(_mm_y_test_name) is not None)
        _mm_sources.append({
            'id': _mm_x_name + '|' + _mm_y_name,
            'featuresName': _mm_x_name,
            'targetName': _mm_y_name,
            'testFeaturesName': _mm_x_test_name if _mm_has_test else None,
            'testTargetName': _mm_y_test_name if _mm_has_test else None,
            'rows': _mm_rows,
            'featureCount': _mm_features,
            'task': _mm_task
        })
    except Exception:
        continue
print(${JSON.stringify(marker)} + _mm_json.dumps(_mm_sources))
for _mm_cleanup in ('_mm_type_of_target', '_mm_ns', '_mm_pairs', '_mm_sources', '_mm_seen', '_mm_x_name', '_mm_y_name', '_mm_x_test_name', '_mm_y_test_name', '_mm_key', '_mm_x', '_mm_y', '_mm_rows', '_mm_features', '_mm_target_kind', '_mm_task', '_mm_has_test', '_mm_json'):
    get_ipython().user_ns.pop(_mm_cleanup, None)
`;
            let capturedOutput = '';
            const future = kernel.requestExecute({ code, silent: false, store_history: false, allow_stdin: false, stop_on_error: true });
            future.onIOPub = message => {
                var _a;
                if (message.header.msg_type === 'stream')
                    capturedOutput += (_a = message.content.text) !== null && _a !== void 0 ? _a : '';
            };
            await future.done;
            const markerIndex = capturedOutput.lastIndexOf(marker);
            if (markerIndex < 0)
                throw new Error('Could not inspect feature/target variables in the current kernel.');
            return JSON.parse(capturedOutput.slice(markerIndex + marker.length).trim());
        };
        const trainModelInNotebook = async (sourceId, modelType) => {
            var _a, _b;
            const kernel = (_b = (_a = notebooks.currentWidget) === null || _a === void 0 ? void 0 : _a.sessionContext.session) === null || _b === void 0 ? void 0 : _b.kernel;
            if (!kernel || kernel.isDisposed)
                throw new Error('Start a notebook kernel before training a model.');
            const [featuresName, targetName] = sourceId.split('|');
            if (!featuresName || !targetName)
                throw new Error('Choose a valid feature and target pair.');
            if (!['decision_tree', 'random_forest', 'neural_network'].includes(modelType))
                throw new Error('Choose a supported model type.');
            const marker = `__MODELMIND_TRAINED_MODEL_${Date.now()}__:`;
            const params = JSON.stringify({ featuresName, targetName, modelType });
            const code = `
import json as _mm_json
import numpy as _mm_np
from sklearn.model_selection import train_test_split as _mm_train_test_split
from sklearn.utils.multiclass import type_of_target as _mm_type_of_target
from sklearn.metrics import accuracy_score as _mm_accuracy, f1_score as _mm_f1, mean_absolute_error as _mm_mae, mean_squared_error as _mm_mse, r2_score as _mm_r2
from sklearn.tree import DecisionTreeClassifier as _mm_DTC, DecisionTreeRegressor as _mm_DTR
from sklearn.ensemble import RandomForestClassifier as _mm_RFC, RandomForestRegressor as _mm_RFR
from sklearn.neural_network import MLPClassifier as _mm_MLPC, MLPRegressor as _mm_MLPR
from sklearn.pipeline import make_pipeline as _mm_make_pipeline
from sklearn.preprocessing import StandardScaler as _mm_StandardScaler
_mm_args = _mm_json.loads(${JSON.stringify(params)})
_mm_ns = get_ipython().user_ns
_mm_X = _mm_ns.get(_mm_args['featuresName'])
_mm_y = _mm_ns.get(_mm_args['targetName'])
if _mm_X is None or _mm_y is None:
    raise ValueError('The selected feature/target variables are no longer available. Run their notebook cells again.')
if len(_mm_X) != len(_mm_y):
    raise ValueError('Features and target have different row counts.')
if hasattr(_mm_X, 'select_dtypes'):
    _mm_bad = list(_mm_X.select_dtypes(include=['object', 'string', 'category']).columns)
    if _mm_bad:
        raise ValueError('Encode categorical feature columns first (for example, with pd.get_dummies(X)).')
elif getattr(_mm_X, 'dtype', None) is not None and _mm_X.dtype.kind not in 'biufc':
    raise ValueError('Encode categorical feature columns first (for example, with pd.get_dummies(X)).')
_mm_target_kind = _mm_type_of_target(_mm_y)
if _mm_target_kind in ('binary', 'multiclass'):
    _mm_task = 'classification'
elif _mm_target_kind in ('continuous', 'continuous-multioutput'):
    _mm_task = 'regression'
else:
    raise ValueError('This target type is not supported. Use a one-dimensional classification or regression target.')
_mm_X_test = None
_mm_y_test = None
_mm_test_x_name = _mm_args['featuresName'].replace('X_train_scaled', 'X_test_scaled').replace('X_train', 'X_test')
_mm_test_y_name = _mm_args['targetName'].replace('y_train', 'y_test')
if _mm_args['featuresName'] in ('X_train', 'X_train_scaled') and _mm_test_x_name != _mm_args['featuresName']:
    _mm_X_test = _mm_ns.get(_mm_test_x_name)
    _mm_y_test = _mm_ns.get(_mm_test_y_name)
if _mm_X_test is not None and _mm_y_test is not None:
    _mm_X_train, _mm_y_train = _mm_X, _mm_y
    if len(_mm_X_test) != len(_mm_y_test):
        raise ValueError('The existing test features and target have different row counts.')
else:
    _mm_stratify = None
    if _mm_task == 'classification':
        _mm_values, _mm_counts = _mm_np.unique(_mm_y, return_counts=True)
        if len(_mm_counts) > 1 and _mm_counts.min() >= 2:
            _mm_stratify = _mm_y
    _mm_X_train, _mm_X_test, _mm_y_train, _mm_y_test = _mm_train_test_split(
        _mm_X, _mm_y, test_size=0.2, random_state=42, stratify=_mm_stratify
    )
_mm_type = _mm_args['modelType']
if _mm_task == 'classification':
    if _mm_type == 'decision_tree': _mm_estimator = _mm_DTC(max_depth=6, random_state=42)
    elif _mm_type == 'random_forest': _mm_estimator = _mm_RFC(n_estimators=150, random_state=42, n_jobs=-1)
    else: _mm_estimator = _mm_make_pipeline(_mm_StandardScaler(with_mean=False), _mm_MLPC(hidden_layer_sizes=(32, 16), max_iter=500, random_state=42))
else:
    if _mm_type == 'decision_tree': _mm_estimator = _mm_DTR(max_depth=6, random_state=42)
    elif _mm_type == 'random_forest': _mm_estimator = _mm_RFR(n_estimators=150, random_state=42, n_jobs=-1)
    else: _mm_estimator = _mm_make_pipeline(_mm_StandardScaler(with_mean=False), _mm_MLPR(hidden_layer_sizes=(32, 16), max_iter=500, random_state=42))
_mm_estimator.fit(_mm_X_train, _mm_y_train)
_mm_prediction = _mm_estimator.predict(_mm_X_test)
if _mm_task == 'classification':
    _mm_primary = float(_mm_accuracy(_mm_y_test, _mm_prediction))
    _mm_metric = 'Accuracy'
    _mm_secondary = [{'label': 'Macro F1', 'value': float(_mm_f1(_mm_y_test, _mm_prediction, average='macro', zero_division=0))}]
else:
    _mm_primary = float(_mm_r2(_mm_y_test, _mm_prediction))
    _mm_metric = 'R²'
    _mm_secondary = [
        {'label': 'MAE', 'value': float(_mm_mae(_mm_y_test, _mm_prediction))},
        {'label': 'RMSE', 'value': float(_mm_np.sqrt(_mm_mse(_mm_y_test, _mm_prediction)))}
    ]
_mm_ns['modelmind_trained_model'] = _mm_estimator
_mm_result = {
    'modelName': 'modelmind_trained_model',
    'modelType': _mm_type.replace('_', ' ').title(),
    'task': _mm_task,
    'trainRows': int(len(_mm_X_train)),
    'testRows': int(len(_mm_X_test)),
    'featureCount': int(_mm_X.shape[1]),
    'primaryMetric': _mm_metric,
    'primaryScore': _mm_primary,
    'secondaryMetrics': _mm_secondary
}
print(${JSON.stringify(marker)} + _mm_json.dumps(_mm_result))
for _mm_cleanup in ('_mm_args', '_mm_ns', '_mm_X', '_mm_y', '_mm_bad', '_mm_target_kind', '_mm_task', '_mm_X_test', '_mm_y_test', '_mm_test_x_name', '_mm_test_y_name', '_mm_stratify', '_mm_values', '_mm_counts', '_mm_X_train', '_mm_y_train', '_mm_type', '_mm_estimator', '_mm_prediction', '_mm_primary', '_mm_metric', '_mm_secondary', '_mm_result', '_mm_json', '_mm_np', '_mm_train_test_split', '_mm_type_of_target', '_mm_accuracy', '_mm_f1', '_mm_mae', '_mm_mse', '_mm_r2', '_mm_DTC', '_mm_DTR', '_mm_RFC', '_mm_RFR', '_mm_MLPC', '_mm_MLPR', '_mm_make_pipeline', '_mm_StandardScaler'):
    get_ipython().user_ns.pop(_mm_cleanup, None)
`;
            let capturedOutput = '';
            let executionError = '';
            const future = kernel.requestExecute({ code, silent: false, store_history: false, allow_stdin: false, stop_on_error: true });
            future.onIOPub = message => {
                var _a, _b;
                if (message.header.msg_type === 'stream')
                    capturedOutput += (_a = message.content.text) !== null && _a !== void 0 ? _a : '';
                if (message.header.msg_type === 'error')
                    executionError = (_b = message.content.evalue) !== null && _b !== void 0 ? _b : 'Python training failed.';
            };
            await future.done;
            const markerIndex = capturedOutput.lastIndexOf(marker);
            if (markerIndex < 0)
                throw new Error(executionError || 'Python training did not return evaluation results.');
            // The kernel can emit a warning or other stream text after our result marker.
            // The trainer serializes its payload as one compact JSON line, so parse that line only.
            const payloadLine = capturedOutput.slice(markerIndex + marker.length).replace(/^\s+/, '').split(/\r?\n/, 1)[0];
            return JSON.parse(payloadLine);
        };
        const chatbotRoot = (0,_ai_chatbot__rspack_import_11.createAIChatbotPanel)(app.serviceManager.serverSettings, getActiveCodeForChat, getActiveErrorForChat, runCodeTraceForChat, loadDecisionTreesForChat, loadNeuralNetworksForChat, loadTrainingSourcesForChat, trainModelInNotebook);
        chatbotWidget.node.style.cssText = 'height:100%;overflow:hidden;';
        chatbotWidget.node.appendChild(chatbotRoot);
        app.shell.add(chatbotWidget, 'right', { rank: 800 });
        chatbotWidgets.push(chatbotWidget);
        // ═══════════════════════════════════════════════════════════
        // INLINE CELL ERROR HIGHLIGHTER & DIAGNOSTIC CARD
        // Highlights the exact failing line and displays the clean
        // error card below the editor across all notebooks.
        // ═══════════════════════════════════════════════════════════
        (0,_cell_error_highlighter__rspack_import_12.initCellErrorHighlighter)(notebooks, _jupyterlab_notebook__rspack_import_3.NotebookActions);
        // ═══════════════════════════════════════════════════════════
        // AUTO-TRIGGER: Fire the Tutor immediately when any cell fails
        // No click required — the moment a cell produces an error,
        // the Tutor panel opens and explains it automatically.
        // ═══════════════════════════════════════════════════════════
        _jupyterlab_notebook__rspack_import_3.NotebookActions.executed.connect((_, args) => {
            var _a;
            const { cell, success } = args;
            if (success)
                return; // only handle failures
            if (['plain', 'practice'].includes((0,_notebook_mode__rspack_import_7.getModelMindNotebookRole)((_a = notebooks.currentWidget) === null || _a === void 0 ? void 0 : _a.context.model))) {
                return;
            }
            setTimeout(() => {
                const error = captureActiveError(cell);
                if (error) {
                    _lastCapturedError = error;
                    void (0,_debugger_tutor__rspack_import_8.loadTutorExplanation)({
                        error_type: error.error_type,
                        error_message: error.error_message,
                        traceback: error.traceback,
                        code: error.code,
                    }, app.serviceManager.serverSettings);
                }
            }, 75);
        });
        // ═══════════════════════════════════════════════════════════
        // LEFT SIDEBAR — Unified ModelMind Studio Panel (Single Slide Bar)
        // ═══════════════════════════════════════════════════════════
        const studioWidget = (0,_modelmind_studio__rspack_import_13.createModelMindStudioWidget)(app, notebooks);
        app.shell.add(studioWidget, 'left', { rank: 300 });
        modeAwareWidgets.push(studioWidget);
        practiceQuestionsWidget = (0,_practice_questions__rspack_import_14.createPracticeQuestionsWidget)(app, notebooks, app.serviceManager.serverSettings);
        app.shell.add(practiceQuestionsWidget, 'left', { rank: 290 });
        practiceOnlyWidgets.push(practiceQuestionsWidget);
        const apiKeyWidget = (0,_api_key_settings__rspack_import_15.createAPIKeySettingsWidget)(app.serviceManager.serverSettings, trans);
        apiKeyWidget.title.label = '🔑 API Key';
        apiKeyWidget.title.caption = trans.__('Save Gemini credentials in this computer’s credential store');
        app.shell.add(apiKeyWidget, 'right', { rank: 700 });
        modeAwareWidgets.push(apiKeyWidget);
        // Plain notebooks suppress ModelMind tools. Practice notebooks retain the
        // editor and chatbot, while replacing ML Studio with the question rail.
        applyNotebookPresentation = () => {
            refreshNotebookPresentation();
        };
        notebooks.currentChanged.connect((_, notebook) => {
            if (!notebook) {
                applyNotebookPresentation();
                return;
            }
            // Snapshot which left sidebar tab the user currently has open BEFORE
            // we hide widgets (which can cause layout shifts that reset the tab).
            // This prevents the studio sidebar from re-activating over a tab the
            // user manually chose (e.g. Upload / Files, Outline, Running, etc.).
            const userChosenLeftTab = getActiveSidebarId('left');
            for (const widget of modeAwareWidgets)
                widget.hide();
            (0,_debugger_tutor__rspack_import_8.setTutorEnabled)(false);
            void notebook.context.ready.then(() => {
                if (notebooks.currentWidget === notebook) {
                    watchNotebookModel(notebook.context.model);
                    // After presentation refresh, restore the tab the user had open —
                    // but only if a non-studio tab was active (i.e. the user picked it).
                    if (userChosenLeftTab &&
                        userChosenLeftTab !== 'modelmind-studio-sidebar') {
                        // Give the DOM one tick to settle before restoring user's tab.
                        requestAnimationFrame(() => {
                            const stillActive = getActiveSidebarId('left');
                            if (stillActive !== userChosenLeftTab) {
                                app.shell.activateById(userChosenLeftTab);
                            }
                        });
                    }
                }
            });
        });
        if (notebooks.currentWidget) {
            void notebooks.currentWidget.context.ready.then(applyNotebookPresentation);
        }
        const STUDIO_COMMAND = 'modelmind:open-studio';
        app.commands.addCommand(STUDIO_COMMAND, {
            label: 'Open ModelMind Studio',
            caption: 'Open the unified ModelMind ML Studio slide bar in the left panel',
            execute: () => {
                var _a;
                const role = (0,_notebook_mode__rspack_import_7.getModelMindNotebookRole)((_a = notebooks.currentWidget) === null || _a === void 0 ? void 0 : _a.context.model);
                if (role === 'plain' || role === 'practice') {
                    return;
                }
                app.shell.activateById(studioWidget.id);
            }
        });
        mainMenu.viewMenu.addGroup([{ command: STUDIO_COMMAND }], 899);
        const createNotebook = async (role) => {
            const notebook = await documentManager.newUntitled({
                type: 'notebook'
            });
            const widget = documentManager.open(notebook.path);
            if (!widget) {
                throw new Error(`Could not open the new ${role} notebook.`);
            }
            if (!(widget instanceof _jupyterlab_notebook__rspack_import_3.NotebookPanel)) {
                throw new Error(`The new ${role} document is not a notebook.`);
            }
            await widget.context.ready;
            widget.context.model.setMetadata(_notebook_mode__rspack_import_7.MODEL_MIND_NOTEBOOK_TYPE, role);
            studioWidget.refreshNotebookMode();
            applyNotebookPresentation();
        };
        const MODEL_MIND_NOTEBOOK_COMMAND = 'modelmind:create-modelmind-notebook';
        app.commands.addCommand(MODEL_MIND_NOTEBOOK_COMMAND, {
            label: 'ModelMind Notebook',
            execute: () => createNotebook('modelmind')
        });
        const TRAINER_NOTEBOOK_COMMAND = 'modelmind:create-trainer-notebook';
        app.commands.addCommand(TRAINER_NOTEBOOK_COMMAND, {
            label: 'Trainer Notebook',
            execute: () => createNotebook('trainer')
        });
        const PLAIN_NOTEBOOK_COMMAND = 'modelmind:create-plain-practice-notebook';
        app.commands.addCommand(PLAIN_NOTEBOOK_COMMAND, {
            label: 'Plain ModelMind Notebook',
            caption: 'Create a clean Jupyter notebook without ModelMind AI or Studio panels',
            execute: () => createNotebook('plain')
        });
        const PRACTICE_NOTEBOOK_COMMAND = 'modelmind:create-practice-notebook';
        app.commands.addCommand(PRACTICE_NOTEBOOK_COMMAND, {
            label: 'Open Practice Questions',
            caption: 'Open the ModelMind practice notebook with question navigation and AI review',
            execute: () => createNotebook('practice')
        });
        mainMenu.fileMenu.newMenu.addGroup([
            { command: MODEL_MIND_NOTEBOOK_COMMAND },
            { command: TRAINER_NOTEBOOK_COMMAND },
            { command: PLAIN_NOTEBOOK_COMMAND },
            { command: PRACTICE_NOTEBOOK_COMMAND }
        ], 899);
        // ─── Inject CSS for all left panels ───
        if (!document.getElementById('mm-left-panel-styles')) {
            const s = document.createElement('style');
            s.id = 'mm-left-panel-styles';
            s.textContent = `
        /* Sidebar icon SVG stubs */
        .mm-sidebar-icon { background-size: 16px; background-repeat: no-repeat; background-position: center; }
        .mm-icon-xray::before  { content: '🔬'; font-size:16px; }
        .mm-icon-prep::before  { content: '🧠'; font-size:16px; }
        .mm-icon-lab::before   { content: '⚗️'; font-size:16px; }
        .mm-icon-practice {
          display: inline-grid;
          width: 22px;
          height: 22px;
          place-items: center;
        }
        .mm-icon-practice::before {
          content: '✎';
          display: grid;
          width: 17px;
          height: 17px;
          place-items: center;
          border: 2px solid #8b5cf6;
          border-radius: 5px;
          background: #f5f3ff;
          color: #6d3df2;
          font-family: ui-rounded, system-ui, sans-serif;
          font-size: 15px;
          font-weight: 800;
          line-height: 1;
          transform: rotate(-5deg);
        }

        .mm-left-panel { overflow: hidden; }
        .mm-left-panel-root {
          height: 100%; overflow-y: auto; padding: 0;
          background: #0f172a; color: #e2e8f0;
          font-family: 'Segoe UI', system-ui, sans-serif;
          display: flex; flex-direction: column;
        }

        .mm-left-panel-header {
          padding: 14px 14px 10px;
          background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%);
          border-bottom: 1px solid rgba(167,139,250,.2);
          flex-shrink: 0;
        }
        .mm-left-panel-title {
          font-size: 13px; font-weight: 800; display: flex; align-items: center; gap: 6px;
          background: linear-gradient(90deg, #a78bfa, #818cf8);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .mm-left-panel-sub { font-size: 10px; opacity: .5; margin-top: 3px; }

        .mm-left-panel-input-wrap {
          padding: 10px 12px 6px; display: flex; flex-direction: column; gap: 6px; flex-shrink: 0;
        }
        .mm-left-panel-input {
          background: #1e293b; border: 1px solid rgba(255,255,255,.12);
          color: #e2e8f0; padding: 7px 10px; border-radius: 7px; font-size: 11px;
          outline: none; width: 100%;
        }
        .mm-left-panel-input:focus { border-color: #a78bfa; }
        .mm-left-panel-note {
          padding: 0 12px 6px; font-size: 10px; opacity: .4; flex-shrink: 0;
        }
        .mm-left-panel-btn {
          padding: 8px 14px; border-radius: 7px; border: none; cursor: pointer;
          font-size: 12px; font-weight: 700; width: 100%; transition: all .15s;
        }
        .mm-btn-primary { background: linear-gradient(135deg,#7c3aed,#4f46e5); color:#fff; }
        .mm-btn-primary:hover { opacity:.85; transform:translateY(-1px); }

        .mm-left-level-row {
          display: flex; gap: 5px; padding: 4px 12px 8px; flex-shrink: 0;
        }
        .mm-level-btn {
          flex: 1; padding: 4px 6px; border-radius: 6px; border: 1px solid rgba(255,255,255,.12);
          background: transparent; color: #94a3b8; font-size: 10px; cursor: pointer;
          transition: all .15s;
        }
        .mm-level-btn.active {
          border-color: #a78bfa; background: rgba(167,139,250,.18); color: #a78bfa; font-weight: 700;
        }

        .mm-left-panel-content {
          flex: 1; overflow-y: auto; padding: 8px 10px;
        }
        .mm-left-empty {
          text-align: center; opacity: .45; font-size: 12px; padding: 20px 0;
        }

        /* Model Lab cards */
        .mm-model-card {
          margin: 8px 10px; border: 1px solid rgba(255,255,255,.08);
          border-radius: 10px; padding: 12px;
          background: rgba(255,255,255,.03); transition: all .2s;
        }
        .mm-model-card:not(.mm-model-soon):hover {
          border-color: rgba(167,139,250,.4); background: rgba(167,139,250,.07);
        }
        .mm-model-soon { opacity: .45; }
        .mm-model-card-top {
          display: flex; align-items: flex-start; gap: 8px; margin-bottom: 6px;
        }
        .mm-model-icon { font-size: 18px; }
        .mm-model-name { font-size: 12px; font-weight: 700; }
        .mm-model-cat { font-size: 9px; opacity: .5; letter-spacing:.5px; margin-top: 2px; }
        .mm-model-desc { font-size: 11px; opacity: .65; line-height: 1.4; }
        .mm-soon-tag {
          display: inline-block; font-size: 8px; padding: 1px 5px; border-radius: 99px;
          background: rgba(100,116,139,.2); color: #94a3b8; vertical-align: middle; margin-left: 4px;
        }
      `;
            document.head.appendChild(s);
        }
        app.commands.addCommand(COMMAND_ID, {
            label: 'Open Error Assistant',
            execute: () => {
                var _a;
                const role = (0,_notebook_mode__rspack_import_7.getModelMindNotebookRole)((_a = notebooks.currentWidget) === null || _a === void 0 ? void 0 : _a.context.model);
                if (role === 'plain' || role === 'practice') {
                    return;
                }
                app.shell.activateById(panel.id);
                void setStatus();
            }
        });
        const helpMenu = mainMenu.helpMenu;
        mainMenu.viewMenu.addGroup([{ command: COMMAND_ID }], 900);
        helpMenu.hide();
        void setStatus();
        // ── Setup Left Sidebar Section Names for the 5 tabs ──
        setupLeftSidebarSectionLabels();
        // ── Setup Right Sidebar Section Names ──
        setupRightSidebarSectionLabels();
    }
};
/**
 * Enhances the JupyterLab left activity bar tabs with clear, readable section names
 * so new users immediately know where to upload datasets, find ML Studio, etc.
 */
function setupLeftSidebarSectionLabels() {
    const SECTIONS = [
        {
            match: (id, title) => id === 'filebrowser' || title.toLowerCase().includes('file browser'),
            shortName: 'Upload / Files',
            fullName: 'Upload Dataset & Files',
            description: 'Upload CSV, Excel datasets & manage notebook files'
        },
        {
            match: (id, title) => id === 'jp-running-sessions' || title.toLowerCase().includes('running'),
            shortName: 'Running',
            fullName: 'Active Kernels & Sessions',
            description: 'Monitor active kernels, terminals & running sessions'
        },
        {
            match: (id, title) => id === 'modelmind-practice-questions' || title.toLowerCase().includes('practice questions'),
            shortName: 'Practice',
            fullName: 'Practice Questions',
            description: 'Choose a question for the current practice notebook'
        },
        {
            match: (id, title) => id.includes('modelmind') || title.toLowerCase().includes('modelmind'),
            shortName: 'ML Studio',
            fullName: 'ModelMind ML Studio & Preprocessing',
            description: 'Dataset Intelligence, Preprocessing Advisor & Model Selection'
        },
        {
            match: (id, title) => id.includes('api-key') || title.toLowerCase().includes('api key'),
            shortName: 'API Key',
            fullName: 'ModelMind API Key Settings',
            description: 'Store Gemini credentials in the computer’s credential store'
        },
        {
            match: (id, title) => id === 'table-of-contents' || title.toLowerCase().includes('table of contents') || title.toLowerCase().includes('outline'),
            shortName: 'Outline',
            fullName: 'Notebook Outline',
            description: 'Table of contents, markdown headers & notebook outline'
        },
        {
            match: (id, title) => id.includes('extension') || title.toLowerCase().includes('extension'),
            shortName: 'Extensions',
            fullName: 'Extensions & Tools',
            description: 'Manage JupyterLab extensions and platform plugins'
        }
    ];
    let isUpdating = false;
    const updateTabs = () => {
        if (isUpdating)
            return;
        isUpdating = true;
        try {
            const tabs = document.querySelectorAll('.jp-SideBar.jp-mod-left .lm-TabBar-tab');
            if (!tabs || tabs.length === 0)
                return;
            tabs.forEach(tab => {
                const dataId = tab.getAttribute('data-id') || '';
                const tabTitle = tab.getAttribute('title') || '';
                const matched = SECTIONS.find(s => s.match(dataId, tabTitle));
                if (!matched)
                    return;
                // Set informative title attribute only once
                const expectedTitle = `${matched.fullName} — ${matched.description}`;
                if (tab.title !== expectedTitle) {
                    tab.title = expectedTitle;
                }
                // Check or create our custom label element
                let labelEl = tab.querySelector('.mm-sidebar-tab-label');
                if (!labelEl) {
                    labelEl = document.createElement('div');
                    labelEl.className = 'mm-sidebar-tab-label';
                    tab.appendChild(labelEl);
                }
                if (labelEl.textContent !== matched.shortName) {
                    labelEl.textContent = matched.shortName;
                }
                // Hide default rotated label if present
                const luminoLabel = tab.querySelector('.lm-TabBar-tabLabel');
                if (luminoLabel && luminoLabel.style.display !== 'none') {
                    luminoLabel.style.display = 'none';
                }
            });
        }
        finally {
            isUpdating = false;
        }
    };
    // Run on startup and staggered intervals
    updateTabs();
    const intervals = [100, 300, 700, 1500, 3000, 5000];
    intervals.forEach(ms => setTimeout(updateTabs, ms));
    // Observe ONLY direct child additions on the tab bar content list (NO attributes, NO subtree)
    const tabContentList = document.querySelector('.jp-SideBar.jp-mod-left .lm-TabBar-content');
    if (tabContentList) {
        const observer = new MutationObserver(() => updateTabs());
        observer.observe(tabContentList, { childList: true });
    }
    else {
        setTimeout(() => {
            const lateList = document.querySelector('.jp-SideBar.jp-mod-left .lm-TabBar-content');
            if (lateList) {
                const observer = new MutationObserver(() => updateTabs());
                observer.observe(lateList, { childList: true });
            }
        }, 1000);
    }
}
/**
 * Cleans up right sidebar tab labels so they read as short, friendly names
 * instead of the default truncated or emoji-broken JupyterLab labels.
 */
function setupRightSidebarSectionLabels() {
    const RIGHT_SECTIONS = [
        {
            match: (id, title) => id === 'ml-platform-error-assistant-panel' ||
                title.toLowerCase().includes('error'),
            shortName: 'Error Assistant'
        },
        {
            match: (id, title) => id === 'mm-ai-chatbot-panel' ||
                title.toLowerCase().includes('chat') ||
                title.toLowerCase().includes('ollama'),
            shortName: 'AI Chat'
        },
        {
            match: (id, title) => id.includes('api-key') || title.toLowerCase().includes('api key'),
            shortName: 'API Key'
        }
    ];
    // Inject CSS for right sidebar labels — hide rotated default labels, show ours
    if (!document.getElementById('mm-right-sidebar-label-styles')) {
        const s = document.createElement('style');
        s.id = 'mm-right-sidebar-label-styles';
        s.textContent = `
      .jp-SideBar.jp-mod-right .lm-TabBar-tab .lm-TabBar-tabLabel {
        display: none !important;
      }
      .jp-SideBar.jp-mod-right .lm-TabBar-tab .mm-sidebar-tab-label {
        display: block;
        font-size: 12.5px;
        font-weight: 700;
        writing-mode: vertical-rl;
        text-orientation: mixed;
        transform: rotate(180deg);
        letter-spacing: 0.6px;
        white-space: nowrap;
        color: inherit;
        margin: 0 auto;
        padding: 6px 0;
        font-family: system-ui, -apple-system, sans-serif;
      }
    `;
        document.head.appendChild(s);
    }
    let isUpdatingRight = false;
    const updateRightTabs = () => {
        if (isUpdatingRight)
            return;
        isUpdatingRight = true;
        try {
            const tabs = document.querySelectorAll('.jp-SideBar.jp-mod-right .lm-TabBar-tab');
            if (!tabs || tabs.length === 0)
                return;
            tabs.forEach(tab => {
                const dataId = tab.getAttribute('data-id') || '';
                const tabTitle = tab.getAttribute('title') || '';
                const matched = RIGHT_SECTIONS.find(s => s.match(dataId, tabTitle));
                if (!matched)
                    return;
                // Update tooltip
                if (tab.title !== matched.shortName) {
                    tab.title = matched.shortName;
                }
                // Create or update our custom label
                let labelEl = tab.querySelector('.mm-sidebar-tab-label');
                if (!labelEl) {
                    labelEl = document.createElement('div');
                    labelEl.className = 'mm-sidebar-tab-label';
                    tab.appendChild(labelEl);
                }
                if (labelEl.textContent !== matched.shortName) {
                    labelEl.textContent = matched.shortName;
                }
                // Hide icon if it's showing a broken emoji
                const iconEl = tab.querySelector('.lm-TabBar-tabIcon');
                if (iconEl && iconEl.style.display !== 'none') {
                    iconEl.style.display = 'none';
                }
            });
        }
        finally {
            isUpdatingRight = false;
        }
    };
    // Run on startup + staggered intervals
    updateRightTabs();
    [100, 300, 700, 1500, 3000, 5000].forEach(ms => setTimeout(updateRightTabs, ms));
    // Observe right tab bar for new tabs
    const tryObserve = () => {
        const rightList = document.querySelector('.jp-SideBar.jp-mod-right .lm-TabBar-content');
        if (rightList) {
            const observer = new MutationObserver(() => updateRightTabs());
            observer.observe(rightList, { childList: true });
        }
        else {
            setTimeout(() => {
                const late = document.querySelector('.jp-SideBar.jp-mod-right .lm-TabBar-content');
                if (late) {
                    const observer = new MutationObserver(() => updateRightTabs());
                    observer.observe(late, { childList: true });
                }
            }, 1000);
        }
    };
    tryObserve();
}
/* export default */ const __rspack_default_export = (plugin);


},
"./lib/model-advisor-explanations.js"(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  buildMeasuredModelExplanation: () => (buildMeasuredModelExplanation),
  getModelSelectionReasons: () => (getModelSelectionReasons)
});
const MODEL_PROFILES = {
    'linear regression': {
        classification: 'Fits a linear combination of features to predict a numeric target.',
        regression: 'Fits a linear relationship between the input features and numeric target, providing a clear baseline.',
        strengths: [
            'Simple, fast baseline',
            'Coefficients are straightforward to inspect'
        ],
        weaknesses: [
            'Cannot model nonlinear patterns without feature engineering',
            'Sensitive to outliers and correlated features'
        ],
        bestFor: 'Numeric targets with approximately linear feature relationships.',
        trainingSpeed: 'Fast',
        complexity: 'Low',
        interpretability: 'High'
    },
    'ridge regression': {
        classification: 'Uses L2-regularized linear scores to separate classes.',
        regression: 'Adds L2 regularization to linear regression, shrinking coefficients to stabilize correlated or numerous features.',
        strengths: [
            'Regularization can stabilize correlated features',
            'Fast linear baseline'
        ],
        weaknesses: [
            'Still assumes a linear relationship',
            'Does not usually remove features entirely'
        ],
        bestFor: 'Numeric targets with mostly linear structure and correlated features.',
        trainingSpeed: 'Fast',
        complexity: 'Low',
        interpretability: 'High'
    },
    'lasso regression': {
        classification: 'Uses L1-regularized linear scores to separate classes.',
        regression: 'Uses L1 regularization, which can shrink weak linear coefficients to zero and produce a sparse model.',
        strengths: ['Can create sparse feature sets', 'Fast linear model'],
        weaknesses: [
            'May be unstable with strongly correlated features',
            'Cannot learn nonlinear relationships by itself'
        ],
        bestFor: 'Approximately linear numeric targets where a compact set of predictors is useful.',
        trainingSpeed: 'Fast',
        complexity: 'Low',
        interpretability: 'High'
    },
    'elastic net': {
        classification: 'Combines L1 and L2 regularization for a linear classification boundary.',
        regression: 'Combines L1 and L2 regularization to balance sparse coefficients with stability across correlated predictors.',
        strengths: [
            'Balances sparsity and coefficient stability',
            'Useful when predictors are correlated'
        ],
        weaknesses: [
            'Requires tuning regularization strength and mix',
            'Assumes a linear relationship'
        ],
        bestFor: 'Linear numeric problems with many or correlated features.',
        trainingSpeed: 'Fast',
        complexity: 'Low–Medium',
        interpretability: 'High'
    },
    'logistic regression': {
        classification: 'Estimates class probabilities from a regularized linear decision boundary, making it a strong, efficient classification baseline.',
        regression: 'Uses a linear score for numeric predictions.',
        strengths: [
            'Fast probability-based classification baseline',
            'Coefficients are inspectable'
        ],
        weaknesses: [
            'Linear boundary can miss nonlinear class structure',
            'May need feature scaling and feature engineering'
        ],
        bestFor: 'Classification with a roughly linear class boundary or when probability estimates are useful.',
        trainingSpeed: 'Fast',
        complexity: 'Low',
        interpretability: 'High'
    },
    'ridge classifier': {
        classification: 'Applies L2 regularization to a linear decision function, discouraging overly large coefficients while keeping the model fast and relatively simple.',
        regression: 'Uses regularized linear scores for numeric prediction.',
        strengths: [
            'Regularization helps with many or correlated features',
            'Efficient linear classifier'
        ],
        weaknesses: [
            'Decision boundary is linear',
            'Does not provide calibrated probabilities by default'
        ],
        bestFor: 'A fast linear classification baseline when a simpler decision rule is useful.',
        trainingSpeed: 'Fast',
        complexity: 'Low',
        interpretability: 'High'
    },
    'decision tree': {
        classification: 'Builds threshold-based if/then splits that can represent nonlinear boundaries and feature interactions without requiring feature scaling.',
        regression: 'Builds threshold-based if/then splits that can represent nonlinear target patterns without requiring feature scaling.',
        strengths: [
            'Captures nonlinear patterns and interactions',
            'Rules are relatively easy to visualize'
        ],
        weaknesses: [
            'A single tree can vary substantially with small data changes',
            'Deep trees can overfit'
        ],
        bestFor: 'Nonlinear tabular data when rule-like decisions and little preprocessing are valuable.',
        trainingSpeed: 'Fast',
        complexity: 'Low–Medium',
        interpretability: 'High'
    },
    'random forest': {
        classification: 'Averages many bootstrapped decision trees, reducing the instability of a single tree while learning nonlinear interactions.',
        regression: 'Averages many bootstrapped decision trees, reducing the variance of a single tree for nonlinear numeric patterns.',
        strengths: [
            'Captures nonlinear patterns with reduced single-tree variance',
            'Usually works without feature scaling'
        ],
        weaknesses: [
            'Less transparent than one tree',
            'Model size and training time grow with the forest'
        ],
        bestFor: 'General-purpose nonlinear tabular prediction where robustness is more important than a single compact rule set.',
        trainingSpeed: 'Moderate',
        complexity: 'Medium',
        interpretability: 'Low–Medium'
    },
    'extra trees': {
        classification: 'Averages trees built with extra-randomized split thresholds; this decorrelation can reduce variance while retaining nonlinear decision boundaries.',
        regression: 'Averages trees built with extra-randomized split thresholds; the additional randomness can reduce variance in nonlinear regression.',
        strengths: [
            'Randomized trees capture nonlinear patterns',
            'Ensembling can make predictions less sensitive to one tree'
        ],
        weaknesses: [
            'Individual decisions are difficult to explain',
            'Randomized splits can trade some fit for lower variance'
        ],
        bestFor: 'Nonlinear tabular data where a fast, randomized tree ensemble is worth testing.',
        trainingSpeed: 'Moderate–Fast',
        complexity: 'Medium',
        interpretability: 'Low'
    },
    'gradient boosting': {
        classification: 'Adds shallow trees sequentially, with later trees correcting errors from earlier ones; this can capture structured nonlinearities.',
        regression: 'Adds trees sequentially to reduce prior prediction errors, fitting nonlinear numeric patterns through a series of small corrections.',
        strengths: [
            'Learns nonlinear patterns through sequential corrections',
            'Can perform well on structured tabular data'
        ],
        weaknesses: [
            'Learning rate and tree count need care',
            'Can overfit and is usually slower than simple baselines'
        ],
        bestFor: 'Tabular data with nonlinear structure when a carefully regularized boosted-tree model is useful.',
        trainingSpeed: 'Moderate',
        complexity: 'Medium–High',
        interpretability: 'Low'
    },
    'hist gradient boosting': {
        classification: 'Uses histogram-binned gradient-boosted trees to model nonlinear patterns efficiently on larger tabular datasets.',
        regression: 'Uses histogram-binned gradient-boosted trees to model nonlinear numeric patterns efficiently on larger tabular datasets.',
        strengths: [
            'Histogram binning can speed up boosted-tree training',
            'Learns nonlinear feature interactions'
        ],
        weaknesses: [
            'Less transparent than linear models or a shallow tree',
            'Performance depends on depth, leaves, and regularization'
        ],
        bestFor: 'Medium-to-large tabular datasets with nonlinear relationships where efficient boosting is useful.',
        trainingSpeed: 'Moderate–Fast',
        complexity: 'Medium–High',
        interpretability: 'Low'
    },
    'k nearest neighbors': {
        classification: 'Predicts from nearby training examples, so it can capture local patterns without fitting a global decision formula.',
        regression: 'Predicts from nearby training examples, so it can represent local rather than global numeric patterns.',
        strengths: [
            'Simple, flexible local decision rule',
            'Few assumptions about the global shape of the data'
        ],
        weaknesses: [
            'Requires feature scaling',
            'Prediction can be slow and sensitive to irrelevant features'
        ],
        bestFor: 'Smaller datasets where similarity in a well-scaled feature space is meaningful.',
        trainingSpeed: 'Fast fit; slower predict',
        complexity: 'Low',
        interpretability: 'Medium'
    },
    'linear svm': {
        classification: 'Finds a linear class boundary with a wide margin; it is a useful comparison when a simple linear separator may fit the task.',
        regression: 'Uses a linear support-vector boundary for numeric prediction.',
        strengths: [
            'Can provide a compact linear decision boundary',
            'Margin regularization controls model flexibility'
        ],
        weaknesses: [
            'Cannot learn nonlinear boundaries without feature transformations',
            'Requires feature scaling and careful regularization'
        ],
        bestFor: 'Classification where a scaled, linear decision boundary is a reasonable baseline.',
        trainingSpeed: 'Moderate',
        complexity: 'Medium',
        interpretability: 'Low–Medium'
    },
    'rbf svm': {
        classification: 'Uses a radial-basis kernel to form nonlinear class boundaries when a linear separator is too restrictive.',
        regression: 'Uses an RBF kernel to fit smooth nonlinear numeric relationships.',
        strengths: [
            'Can model nonlinear boundaries',
            'Effective on small-to-medium datasets with scaled features'
        ],
        weaknesses: [
            'Requires feature scaling and tuning of C/gamma',
            'Training can become costly as row count grows'
        ],
        bestFor: 'Small-to-medium datasets with nonlinear structure and meaningful scaled distances.',
        trainingSpeed: 'Moderate–Slow',
        complexity: 'Medium–High',
        interpretability: 'Low'
    },
    'support vector regression': {
        classification: 'Uses a support-vector margin for classification.',
        regression: 'Fits an RBF support-vector function with an epsilon-insensitive loss, allowing nonlinear regression while controlling margin complexity.',
        strengths: [
            'Can model smooth nonlinear numeric patterns',
            'Epsilon loss ignores small residuals'
        ],
        weaknesses: [
            'Requires feature scaling and C/epsilon tuning',
            'Training can be slow on large datasets'
        ],
        bestFor: 'Small-to-medium numeric datasets with smooth nonlinear relationships.',
        trainingSpeed: 'Moderate–Slow',
        complexity: 'Medium–High',
        interpretability: 'Low'
    },
    'gaussian naive bayes': {
        classification: 'Estimates class likelihoods under a conditional-independence and per-feature Gaussian assumption, making it a fast probabilistic baseline.',
        regression: 'Uses a Gaussian likelihood model for classification-style prediction.',
        strengths: [
            'Very fast and works with small datasets',
            'Provides class probabilities'
        ],
        weaknesses: [
            'Conditional-independence and Gaussian assumptions may be inaccurate',
            'Correlated features can reduce effectiveness'
        ],
        bestFor: 'Fast classification baselines, especially when feature likelihood assumptions are reasonable.',
        trainingSpeed: 'Very fast',
        complexity: 'Low',
        interpretability: 'Medium'
    },
    'xgboost classifier': {
        classification: 'Uses regularized gradient-boosted trees with efficient histogram training to learn nonlinear class boundaries and feature interactions.',
        regression: 'Uses regularized gradient-boosted trees for numeric prediction.',
        strengths: [
            'Flexible nonlinear tabular model',
            'Regularization and subsampling offer overfit controls'
        ],
        weaknesses: [
            'More parameters to tune and less transparent than simple models',
            'Requires the optional XGBoost package'
        ],
        bestFor: 'Structured classification data where a regularized boosted-tree model is worth comparing against simpler baselines.',
        trainingSpeed: 'Moderate–Fast',
        complexity: 'High',
        interpretability: 'Low'
    },
    'xgboost regressor': {
        classification: 'Uses regularized gradient-boosted trees for classification.',
        regression: 'Uses regularized gradient-boosted trees to learn nonlinear numeric patterns, with depth, learning rate, and regularization controlling model complexity.',
        strengths: [
            'Flexible nonlinear tabular model',
            'Regularization and subsampling offer overfit controls'
        ],
        weaknesses: [
            'More parameters to tune and less transparent than simple models',
            'Requires the optional XGBoost package'
        ],
        bestFor: 'Structured numeric prediction where a regularized boosted-tree model is worth comparing against simpler baselines.',
        trainingSpeed: 'Moderate–Fast',
        complexity: 'High',
        interpretability: 'Low'
    }
};
const SHORT_MODEL_REASONS = {
    'linear regression': 'Fits a simple linear relationship to the target.',
    'ridge regression': 'Fits a linear relationship with extra protection against unstable weights.',
    'lasso regression': 'Fits a linear relationship and can remove weak predictors.',
    'elastic net': 'Balances feature selection and stable linear predictions.',
    'logistic regression': 'Predicts class probabilities with a linear decision boundary.',
    'ridge classifier': 'Uses a regularized linear boundary to separate classes.',
    'decision tree': 'Learns readable if/then rules and nonlinear patterns.',
    'random forest': 'Combines many trees to learn nonlinear patterns more reliably.',
    'extra trees': 'Combines randomized trees to learn nonlinear patterns.',
    'gradient boosting': 'Adds small trees that correct earlier prediction errors.',
    'hist gradient boosting': 'Uses efficient boosted trees to learn nonlinear patterns.',
    'k nearest neighbors': 'Predicts from the most similar training examples.',
    'linear svm': 'Finds a strong linear boundary between classes.',
    'rbf svm': 'Uses a kernel to model nonlinear class boundaries.',
    'support vector regression': 'Fits a smooth function for numeric predictions.',
    'gaussian naive bayes': 'Estimates class probabilities from feature distributions.',
    'xgboost classifier': 'Uses regularized boosted trees to learn class patterns and interactions.',
    'xgboost regressor': 'Uses regularized boosted trees to learn numeric patterns and interactions.'
};
function formatCompactScore(context, score) {
    const isPercent = context.task === 'classification' &&
        /accuracy|precision|recall|f1|auc/i.test(context.metric);
    return isPercent ? `${(score * 100).toFixed(2)}%` : score.toFixed(4);
}
function canonicalModelKey(rawName) {
    const norm = rawName.trim().toLowerCase().replace(/[-_]/g, ' ');
    if (norm.includes('extra tree') || norm.includes('extratrees'))
        return 'extra trees';
    if (norm.includes('random forest') || norm.includes('randomforest'))
        return 'random forest';
    if (norm.includes('xgboost classifier') || norm.includes('xgbclassifier'))
        return 'xgboost classifier';
    if (norm.includes('xgboost regressor') || norm.includes('xgbregressor'))
        return 'xgboost regressor';
    if (norm.includes('xgboost') || norm.includes('xgb'))
        return 'xgboost';
    if (norm.includes('hist gradient') || norm.includes('histgradient'))
        return 'hist gradient boosting';
    if (norm.includes('gradient boost') || norm.includes('gradientboost'))
        return 'gradient boosting';
    if (norm.includes('decision tree') || norm.includes('decisiontree'))
        return 'decision tree';
    if (norm.includes('logistic'))
        return 'logistic regression';
    if (norm.includes('ridge classifier'))
        return 'ridge classifier';
    if (norm.includes('ridge'))
        return 'ridge regression';
    if (norm.includes('lasso'))
        return 'lasso regression';
    if (norm.includes('elastic net') || norm.includes('elasticnet'))
        return 'elastic net';
    if (norm.includes('linear regression'))
        return 'linear regression';
    if (norm.includes('linear svm') || norm.includes('linear svc') || norm.includes('linearsvc'))
        return 'linear svm';
    if (norm.includes('rbf svm') || norm.includes('rbf svc') || norm.includes('svc'))
        return 'rbf svm';
    if (norm.includes('svr') || norm.includes('support vector regression'))
        return 'support vector regression';
    if (norm.includes('naive bayes') || norm.includes('gaussiannb'))
        return 'gaussian naive bayes';
    if (norm.includes('knn') || norm.includes('neighbors') || norm.includes('k nearest'))
        return 'k nearest neighbors';
    return norm;
}
function formatTargetName(targetColumn) {
    if (!targetColumn) {
        return 'the target';
    }
    const clean = targetColumn.replace(/[_-]+/g, ' ').trim();
    return `“${clean}”`;
}
function getModelSelectionReasons(modelName, context) {
    const key = canonicalModelKey(modelName);
    const isRegression = context.task === 'regression';
    const targetLabel = formatTargetName(context.targetColumn);
    switch (key) {
        case 'linear regression':
            return [
                `Learns direct linear relationships between input features and ${targetLabel}.`,
                'High interpretability: regression coefficients clearly reveal the direction and magnitude of each feature’s effect.',
                'Exceptionally fast training and inference with minimal computational footprint.',
                'Low model complexity minimizes the risk of overfitting when data is limited or linear patterns dominate.',
                'Serves as a transparent benchmark against which more complex nonlinear models can be evaluated.'
            ];
        case 'ridge regression':
            return [
                `Applies L2 weight penalty to stabilize linear coefficients and prevent overfitting on ${targetLabel}.`,
                'Effectively handles multicollinearity (correlated features) without inflating prediction variance.',
                'Retains linear interpretability while improving out-of-fold generalization on noisy data.',
                'Fast closed-form computation making it ideal for quick iterations on tabular datasets.',
                'Provides a more resilient linear baseline than standard OLS when many features are present.'
            ];
        case 'lasso regression':
            return [
                'Utilizes L1 regularization to automatically drive uninformative feature coefficients to zero.',
                'Performs built-in feature selection, creating a simpler, sparser, and more explainable model.',
                'Constrains total weight magnitude to buffer against overfitting on small or noisy datasets.',
                `High interpretability: zeroes out weak predictors to highlight key drivers of ${targetLabel}.`,
                'Fast linear baseline well-suited when you expect only a subset of features to be predictive.'
            ];
        case 'elastic net':
            return [
                'Combines L1 and L2 regularization to simultaneously perform feature selection and stabilize correlated predictors.',
                'Overcomes Lasso’s limitations by selecting groups of correlated features together.',
                'Balances model sparsity with generalization stability on multi-feature tabular data.',
                'Controls model complexity to guard against overfitting on small-to-medium datasets.'
            ];
        case 'logistic regression':
            return [
                'Directly estimates calibrated class probabilities using a regularized linear decision boundary.',
                'High interpretability: odds ratios and coefficients clearly explain each feature’s contribution to class outcomes.',
                'Fast to train and evaluate with low memory overhead and no risk of complex tree memorization.',
                'Built-in regularization (L2/L1) guards against overfitting on tabular classification tasks.',
                'Serves as the gold-standard linear baseline for binary and multiclass classification.'
            ];
        case 'ridge classifier':
            return [
                'Uses L2-regularized linear decision functions to classify examples rapidly and stably.',
                'Highly resilient against multicollinear features and high dimensionality without exploding weights.',
                'Significantly faster than iterative logistic solvers on large tabular splits.',
                'Low complexity prevents overfitting on small or moderately sized training sets.',
                'Provides a clear linear benchmark to evaluate if complex tree ensembles are truly needed.'
            ];
        case 'decision tree':
            if (isRegression) {
                return [
                    `Partitions feature space into piecewise constant regions to capture complex nonlinear trends in ${targetLabel}.`,
                    'Highly visual and interpretability: every prediction can be verified step-by-step from root to leaf.',
                    'Requires no feature scaling and remains invariant to monotonic feature transformations.',
                    'Naturally models multi-feature interaction effects without requiring interaction terms.',
                    'Serves as an intuitive nonlinear baseline for tabular regression.'
                ];
            }
            return [
                'Learns human-readable if/then decision rules that make predictions transparent and easy to trace.',
                'Naturally captures nonlinear decision boundaries and hierarchical feature interactions without manual transformations.',
                'Requires zero feature scaling, normalization, or centering of numeric columns.',
                'Handles mixed numeric and categorical inputs with intuitive hierarchical splits.',
                'Provides clear feature importance rankings based on split impurity reduction.'
            ];
        case 'random forest':
            if (isRegression) {
                return [
                    `Captures nonlinear relationships between input features and ${targetLabel}.`,
                    'Handles complex interactions between multiple features without manual transformations.',
                    'Requires relatively little feature scaling or normalization.',
                    'Is a strong baseline for structured tabular datasets.',
                    'Aggregates diverse decision trees via bagging to reduce variance and provide feature importance estimates.'
                ];
            }
            return [
                'Captures nonlinear decision boundaries and feature interactions without manual transformation.',
                'Ensembles hundreds of decision trees via bagging to suppress variance and avoid single-tree overfitting.',
                'Requires minimal feature scaling and handles numeric and encoded categorical features smoothly.',
                'Robust against noise, outliers, and varying class distributions in tabular data.',
                'Provides reliable class probabilities and interpretable feature importance rankings.'
            ];
        case 'extra trees':
            if (isRegression) {
                return [
                    'Ensembles deeply randomized decision trees, creating smoother response surfaces than standard bagging.',
                    'Reduces model variance and combats overfitting through randomized split thresholds.',
                    'Trains faster than standard Random Forest because optimal split thresholds are drawn at random.',
                    'Requires no feature scaling and is highly robust against extreme numeric outliers.',
                    'Captures intricate nonlinear feature interactions across tabular columns.'
                ];
            }
            return [
                'Combines randomized decision trees to learn complex nonlinear class boundaries.',
                'Randomized split thresholds further suppress variance and reduce the risk of overfitting.',
                'Trains faster than standard bagging while maintaining competitive classification accuracy.',
                'Requires minimal feature scaling and is robust against noisy features.',
                'Computes robust out-of-fold predictions and feature importance estimates.'
            ];
        case 'gradient boosting':
            if (isRegression) {
                return [
                    'Sequentially builds trees that directly correct the residual prediction errors of previous trees.',
                    `Excels at capturing subtle nonlinear relationships and continuous response curves for ${targetLabel}.`,
                    'Employs shrinkage (learning rate) and subsampling to achieve strong generalization accuracy.',
                    'Learns complex multi-way feature interactions automatically.',
                    'Proven, high-accuracy benchmark for structured tabular regression.'
                ];
            }
            return [
                'Iteratively corrects misclassified samples and residual errors with targeted sequential trees.',
                'Learns intricate nonlinear decision boundaries and high-order feature interactions.',
                'Learning rate shrinkage and tree depth limits help guard against overfitting.',
                'Consistently delivers superior predictive performance on tabular classification problems.',
                'Generates fine-grained class probabilities and feature importance metrics.'
            ];
        case 'hist gradient boosting':
            if (isRegression) {
                return [
                    'Discretizes continuous features into 256 histogram bins, accelerating training speed by 10x–50x.',
                    'Native out-of-the-box handling of missing values without requiring manual imputation pipelines.',
                    `Captures complex nonlinear curves and multi-feature interaction effects with high accuracy for ${targetLabel}.`,
                    'Low memory footprint and early stopping make it highly scalable for larger tabular datasets.'
                ];
            }
            return [
                'Uses histogram-based feature binning for dramatically faster training on tabular data.',
                'Built-in native support for missing values in features during both training and inference.',
                'Learns complex nonlinear interactions while maintaining state-of-the-art boosted tree accuracy.',
                'Highly memory-efficient and scalable for medium to large-scale classification tasks.'
            ];
        case 'xgboost classifier':
        case 'xgboost':
            if (isRegression) {
                return [
                    'Industry-standard boosted tree framework utilizing second-order gradients for precise split finding.',
                    'Employs L1 and L2 tree-leaf regularization to penalize model complexity and prevent overfitting.',
                    `Captures complex nonlinear patterns and multi-feature interactions in ${targetLabel}.`,
                    'Robust to missing values and requires zero monotonic feature scaling.',
                    'Consistently achieves top-tier accuracy and generalization on tabular regression benchmarks.'
                ];
            }
            return [
                'State-of-the-art gradient boosting framework with second-order Taylor expansions for optimal splits.',
                'Advanced L1 and L2 regularization across tree leaves actively suppresses overfitting.',
                'Handles complex nonlinear decision boundaries and multi-feature interactions seamlessly.',
                'Native missing value handling and column subsampling enhance resilience against noisy features.',
                'Consistently top-ranking performer for tabular classification in real-world applications.'
            ];
        case 'xgboost regressor':
            return [
                'Industry-standard boosted tree framework utilizing second-order gradients for precise split finding.',
                'Employs L1 and L2 tree-leaf regularization to penalize model complexity and prevent overfitting.',
                `Captures complex nonlinear patterns and multi-feature interactions in ${targetLabel}.`,
                'Robust to missing values and requires zero monotonic feature scaling.',
                'Consistently achieves top-tier accuracy and generalization on tabular regression benchmarks.'
            ];
        case 'k nearest neighbors':
            if (isRegression) {
                return [
                    'Predicts continuous values by averaging the target values of the k nearest feature neighbors.',
                    'Adapts locally to arbitrary continuous functions without imposing a global functional form.',
                    'Zero training phase (lazy learner), making model updates instantaneous when new data arrives.',
                    'Effective when similar input profiles reliably correspond to similar target values.'
                ];
            }
            return [
                'Instance-based classification: predicts class labels based on proximity to the k closest training examples.',
                'Makes zero assumptions about the underlying distribution or linearity of the data.',
                'Naturally handles multi-class targets and complex, irregular decision clusters.',
                'Transparent reasoning: predictions can be directly explained by inspecting nearest neighbor samples.'
            ];
        case 'linear svm':
            return [
                'Maximizes the geometric margin between classes, optimizing for best worst-case boundary generalization.',
                'Highly effective in high-dimensional feature spaces with many predictors.',
                'Memory-efficient: decision boundary depends strictly on a small subset of critical support vectors.',
                'Regularization parameter (C) provides explicit control over margin width and outlier tolerance.'
            ];
        case 'rbf svm':
            return [
                'Uses the Radial Basis Function kernel to separate classes with intricate, nonlinear boundaries.',
                'Excels when decision boundaries are curved or form complex geometric clusters in feature space.',
                'Robust against moderate noise when kernel bandwidth and regularization are tuned.',
                'Powerful modeling capability for small to medium-sized structured tabular datasets.'
            ];
        case 'support vector regression':
            return [
                'Uses an epsilon-insensitive loss function: errors within the epsilon tube are ignored, reducing sensitivity to noise.',
                'Effective at modeling smooth nonlinear trends using kernel transformations.',
                'Memory-efficient model defined strictly by key support vectors rather than the entire dataset.',
                'Robust against outliers compared to standard least-squares regression.'
            ];
        case 'gaussian naive bayes':
            return [
                'Extremely fast probabilistic classifier based on Bayes’ theorem with feature independence assumptions.',
                'Requires very small amounts of training data to estimate mean and variance parameters.',
                'Highly immune to the curse of dimensionality with negligible memory and CPU consumption.',
                'Serves as a rapid, lightweight baseline for continuous numeric features.'
            ];
        default:
            return [
                'Evaluated with cross-validation on the selected dataset and evaluation metric.',
                `Learns representative patterns from the input features to predict ${targetLabel}.`,
                'Provides a competitive alternative benchmark among the evaluated model finalists.'
            ];
    }
}
function buildMeasuredModelExplanation(context) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    const normalizedName = context.name.trim().toLowerCase();
    const profile = MODEL_PROFILES[normalizedName];
    const compactModelReason = (_a = SHORT_MODEL_REASONS[normalizedName]) !== null && _a !== void 0 ? _a : 'Its measured validation result, rather than its name, determines its rank.';
    const reasons = getModelSelectionReasons(context.name, context);
    const evidence = [];
    const formattedScore = typeof context.score === 'number' && Number.isFinite(context.score)
        ? context.task === 'classification'
            ? `${(context.score * 100).toFixed(2)}% ${context.metric.toLowerCase()}`
            : `${context.metric} ${context.score.toFixed(4)}`
        : '';
    if (formattedScore) {
        evidence.push(`${formattedScore} mean across ${context.cvFolds ? `${context.cvFolds}-fold` : ''}` +
            `${context.task === 'classification' ? ' stratified' : ''} cross-validation` +
            `${context.cvFolds ? ` (${context.cvFolds} train/test rotations)` : ''}; ` +
            (context.task === 'classification'
                ? 'class proportions are kept similar in each split, and higher balanced accuracy is better.'
                : 'lower RMSE is better; RMSE measures prediction error in the target’s units and penalizes larger errors more.'));
    }
    if (context.task === 'classification' &&
        Array.isArray(context.classDistribution) &&
        context.classDistribution.length > 0) {
        const distribution = context.classDistribution
            .filter(item => Number.isFinite(item.count) && Number.isFinite(item.share))
            .map(item => `${item.label}: ${item.count.toLocaleString()} ` +
            `(${(item.share * 100).toFixed(1)}%)`)
            .join('; ');
        if (distribution) {
            evidence.push(`Target ${context.targetColumn ? `“${context.targetColumn}” ` : ''}class balance: ${distribution}. ` +
                'Balanced accuracy checks each class equally, so performance on the larger class cannot hide weak results on the smaller class.');
            if (typeof context.score === 'number' && Number.isFinite(context.score)) {
                const reference = 1 / context.classDistribution.length;
                const difference = (context.score - reference) * 100;
                const relation = difference >= 0 ? 'above' : 'below';
                evidence.push(`A constant predictor has a ${context.classDistribution.length}-class balanced-accuracy reference of ` +
                    `${(reference * 100).toFixed(2)}%; a predictor that always guesses one class gets this reference. ` +
                    `This result is ${Math.abs(difference).toFixed(2)} percentage points ${relation} it.`);
            }
        }
    }
    if (typeof context.rowsEvaluated === 'number' &&
        typeof context.rowsAvailable === 'number') {
        evidence.push(context.rowsEvaluated < context.rowsAvailable
            ? `The final comparison used a reproducible ${context.rowsEvaluated.toLocaleString()}-row sample ` +
                `from ${context.rowsAvailable.toLocaleString()} rows with target values; it did not evaluate every row.`
            : `Final cross-validation used all ${context.rowsAvailable.toLocaleString()} rows with a target value.`);
    }
    if (typeof context.rowsTotal === 'number' &&
        typeof context.rowsExcludedMissingTarget === 'number' &&
        context.rowsExcludedMissingTarget > 0) {
        evidence.push(`${context.rowsExcludedMissingTarget.toLocaleString()} of ${context.rowsTotal.toLocaleString()} ` +
            'rows were excluded because the selected target was missing.');
    }
    if (typeof context.candidateCount === 'number' &&
        typeof context.finalistCount === 'number' &&
        context.candidateCount > context.finalistCount) {
        const screeningSize = typeof context.screeningRows === 'number'
            ? ` on ${context.screeningRows.toLocaleString()} rows`
            : '';
        evidence.push(`A first-pass screen compared ${context.candidateCount} candidates` +
            `${context.screeningFolds ? ` with ${context.screeningFolds}-fold CV` : ''}${screeningSize}; ` +
            `${context.finalistCount} finalists then received the full comparison. ` +
            'Models left out by the first pass were not fully evaluated, so they are not proven worse.');
    }
    if (typeof context.numericFeatureCount === 'number' &&
        typeof context.categoricalFeatureCount === 'number') {
        evidence.push(`The inputs contain ${context.numericFeatureCount} numeric and ` +
            `${context.categoricalFeatureCount} category-based features. ` +
            `When values are missing, numeric gaps are filled with the median and categories with the most common value; categories are then one-hot encoded. ` +
            `These preprocessing steps are learned only from the training part of each CV split` +
            `${context.scaler && context.scaler !== 'none' ? `; this model also used ${context.scaler} scaling` : ''}.`);
    }
    if (typeof context.featureMissingCount === 'number') {
        evidence.push(context.featureMissingCount === 0
            ? 'The selected input features have no missing values, so the fill steps did not change any cells.'
            : `${context.featureMissingCount.toLocaleString()} missing input values were filled using values learned from each training split.`);
    }
    for (const warning of (_b = context.warnings) !== null && _b !== void 0 ? _b : []) {
        if (warning.toLowerCase().includes('optional python package')) {
            evidence.push(warning);
        }
    }
    let comparison = '';
    if (typeof context.score === 'number' &&
        Number.isFinite(context.score) &&
        typeof context.comparisonScore === 'number' &&
        Number.isFinite(context.comparisonScore) &&
        context.comparisonName) {
        const gap = Math.abs(context.score - context.comparisonScore);
        const gapLabel = context.task === 'classification'
            ? `${(gap * 100).toFixed(2)} percentage points`
            : `${gap.toFixed(4)} RMSE units`;
        const directionText = context.rank === 1 ? 'ahead of' : 'behind';
        comparison = `It is ${gapLabel} ${directionText} ${context.comparisonName}`;
        const deviations = [
            typeof context.scoreStd === 'number' && Number.isFinite(context.scoreStd)
                ? {
                    name: 'this model',
                    value: context.scoreStd
                }
                : null,
            typeof context.comparisonStd === 'number' &&
                Number.isFinite(context.comparisonStd)
                ? {
                    name: (_c = context.comparisonName) !== null && _c !== void 0 ? _c : 'comparison model',
                    value: context.comparisonStd
                }
                : null
        ].filter((item) => item !== null);
        if (deviations.length > 0) {
            const deviationText = deviations
                .map(item => {
                const value = context.task === 'classification'
                    ? `${(item.value * 100).toFixed(2)} percentage points`
                    : item.value.toFixed(4);
                return `${item.name}: ${value}`;
            })
                .join('; ');
            const noLargerThanAll = deviations.every(item => gap <= item.value);
            const variationRelation = noLargerThanAll
                ? deviations.length === 2
                    ? ', both larger than this gap'
                    : ', larger than this gap'
                : '';
            comparison +=
                `; the score varied across folds (standard deviations: ${deviationText}` +
                    `${variationRelation}). This describes fold-to-fold variation; it is not a confidence interval or significance test.`;
        }
        else {
            comparison += '.';
        }
        evidence.push(comparison);
    }
    const confidence = 'Treat this as a shortlist based on the tested finalists, not a guarantee of future performance. ' +
        'The top model was chosen using these same scores, so its score may be optimistic; check it on a separate holdout set before relying on it. ' +
        'If rows repeat people or sites, or represent time periods, use splits that keep those groups or dates separate.';
    const resultLine = typeof context.score === 'number' && Number.isFinite(context.score)
        ? `Result: #${context.rank}/${context.finalistCount} · ${context.metric} ${formatCompactScore(context, context.score)}${context.cvFolds ? ` · ${context.cvFolds}-fold CV` : ' · cross-validation'}.`
        : `Result: #${context.rank}/${context.finalistCount} finalists · cross-validation.`;
    const datasetParts = [];
    const rows = (_d = context.rowsEvaluated) !== null && _d !== void 0 ? _d : context.rowsAvailable;
    if (typeof rows === 'number' && Number.isFinite(rows)) {
        datasetParts.push(`${rows.toLocaleString()} rows`);
    }
    if (typeof context.numericFeatureCount === 'number' &&
        typeof context.categoricalFeatureCount === 'number') {
        datasetParts.push(`${context.numericFeatureCount} numeric, ${context.categoricalFeatureCount} categorical features`);
    }
    if (typeof context.featureMissingCount === 'number') {
        datasetParts.push(context.featureMissingCount === 0
            ? 'no missing inputs'
            : `${context.featureMissingCount.toLocaleString()} missing inputs handled`);
    }
    const validationParts = [];
    if (typeof context.scoreStd === 'number' &&
        Number.isFinite(context.scoreStd)) {
        const isPercent = context.task === 'classification' &&
            /accuracy|precision|recall|f1|auc/i.test(context.metric);
        validationParts.push(`fold SD ${isPercent ? `${(context.scoreStd * 100).toFixed(2)} pp` : context.scoreStd.toFixed(4)}`);
    }
    if (typeof context.score === 'number' &&
        Number.isFinite(context.score) &&
        typeof context.comparisonScore === 'number' &&
        Number.isFinite(context.comparisonScore) &&
        context.comparisonName) {
        const gap = Math.abs(context.score - context.comparisonScore);
        const isPercent = context.task === 'classification' &&
            /accuracy|precision|recall|f1|auc/i.test(context.metric);
        const gapText = isPercent
            ? `${(gap * 100).toFixed(2)} pp`
            : `${gap.toFixed(4)} RMSE`;
        const comparisonStd = Math.max((_e = context.scoreStd) !== null && _e !== void 0 ? _e : 0, (_f = context.comparisonStd) !== null && _f !== void 0 ? _f : 0);
        const withinFoldVariation = comparisonStd > 0 && gap <= comparisonStd;
        const relativeToComparator = context.rank === 1 ? 'ahead of' : 'behind';
        validationParts.push(`${gapText} ${relativeToComparator} ${context.comparisonName}${withinFoldVariation ? ' (within fold variation)' : ''}`);
    }
    const decisionLine = context.rank === 1
        ? 'Decision: Top-scoring tested finalist; confirm on a separate holdout.'
        : 'Decision: #1 scored higher; use this as a comparison alternative.';
    return {
        why: [
            resultLine,
            `Model fit: ${compactModelReason}`,
            ...(datasetParts.length > 0
                ? [`Data: ${datasetParts.join(' · ')}.`]
                : []),
            ...(validationParts.length > 0
                ? [`Comparison: ${validationParts.join(' · ')}.`]
                : ['Comparison: Cross-validation estimates can vary across splits.']),
            decisionLine
        ].join('\n'),
        reasons,
        evidence,
        confidence,
        strengths: (_g = profile === null || profile === void 0 ? void 0 : profile.strengths) !== null && _g !== void 0 ? _g : [
            'Evaluated with the selected dataset and metric',
            'Preprocessing was fitted within CV folds'
        ],
        weaknesses: (_h = profile === null || profile === void 0 ? void 0 : profile.weaknesses) !== null && _h !== void 0 ? _h : [
            'Performance may change on new data',
            'The final holdout score can differ from cross-validation'
        ],
        bestFor: (_j = profile === null || profile === void 0 ? void 0 : profile.bestFor) !== null && _j !== void 0 ? _j : 'Compare this model when its inductive bias fits the data and evaluation goal.',
        trainingSpeed: (_k = profile === null || profile === void 0 ? void 0 : profile.trainingSpeed) !== null && _k !== void 0 ? _k : 'Dataset dependent',
        complexity: (_l = profile === null || profile === void 0 ? void 0 : profile.complexity) !== null && _l !== void 0 ? _l : 'Model dependent',
        interpretability: (_m = profile === null || profile === void 0 ? void 0 : profile.interpretability) !== null && _m !== void 0 ? _m : 'Model dependent'
    };
}


},
"./lib/model-code-utils.js"(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  applyTunedModelCode: () => (applyTunedModelCode),
  normalizeModelName: () => (normalizeModelName),
  removeModelAdvisorRaiseGuards: () => (removeModelAdvisorRaiseGuards),
  resetTunedModelCode: () => (resetTunedModelCode)
});
function parenthesisDelta(line) {
    let depth = 0;
    let quote = null;
    let escaped = false;
    for (const character of line) {
        if (quote) {
            if (escaped) {
                escaped = false;
            }
            else if (character === '\\') {
                escaped = true;
            }
            else if (character === quote) {
                quote = null;
            }
            continue;
        }
        if (character === '"' || character === "'") {
            quote = character;
        }
        else if (character === '(') {
            depth += 1;
        }
        else if (character === ')') {
            depth -= 1;
        }
    }
    return depth;
}
function getRaiseStatementEnd(lines, start) {
    let depth = 0;
    for (let index = start; index < lines.length; index += 1) {
        depth += parenthesisDelta(lines[index]);
        if (depth <= 0) {
            return index;
        }
    }
    return lines.length - 1;
}
function removeModelAdvisorRaiseGuards(code) {
    var _a;
    const lines = code.split('\n');
    const result = [];
    for (let index = 0; index < lines.length; index += 1) {
        const line = lines[index];
        const conditional = line.match(/^(\s*)if\b.*:\s*$/);
        const raiseIndex = index + 1;
        const raiseLine = lines[raiseIndex];
        const raiseIndent = raiseLine === null || raiseLine === void 0 ? void 0 : raiseLine.match(/^(\s*)raise\b/);
        if (conditional &&
            raiseIndent &&
            raiseIndent[1].length > conditional[1].length) {
            index = getRaiseStatementEnd(lines, raiseIndex);
            continue;
        }
        if (raiseIndent) {
            let previousLine = result.length - 1;
            while (previousLine >= 0 && !result[previousLine].trim()) {
                previousLine -= 1;
            }
            const previousConditional = (_a = result[previousLine]) === null || _a === void 0 ? void 0 : _a.match(/^(\s*)if\b.*:\s*$/);
            if (previousConditional &&
                previousConditional[1].length < raiseIndent[1].length) {
                result.splice(previousLine);
            }
            index = getRaiseStatementEnd(lines, index);
            continue;
        }
        result.push(line);
    }
    return result.join('\n').replace(/\n{3,}/g, '\n\n');
}
function normalizeModelName(name) {
    return name
        .toLowerCase()
        .replace(/\s*\([^)]*\)/g, '')
        .replace(/[^a-z0-9]/g, '')
        .replace(/regressor$/, 'regression')
        .replace(/classifier$/, 'classification');
}
function resetTunedModelCode(models) {
    models.forEach(model => {
        var _a;
        model.code = model.defaultCode;
        delete model.tuned_code;
        model.code_available = Boolean(model.defaultCode);
        model.tuned_configuration_applied = false;
        delete model.tuned_params;
        delete model.tuned_changes;
        delete model.tuned_score;
        delete model.tuned_recommendation_status;
        delete model.tuned_code_error;
        (_a = model.refreshCode) === null || _a === void 0 ? void 0 : _a.call(model);
    });
}
function applyTunedModelCode(models, results) {
    if (!Array.isArray(results)) {
        return { updated: 0, errors: [] };
    }
    let updated = 0;
    const errors = [];
    results.forEach(result => {
        var _a, _b, _c;
        if (!result || typeof result !== 'object') {
            return;
        }
        const item = result;
        if (typeof item.model !== 'string') {
            return;
        }
        const itemModelName = item.model.trim();
        const itemNorm = normalizeModelName(itemModelName);
        // Exact match first, then normalized and abbreviation matching
        const model = models.find(candidate => {
            if (candidate.name === itemModelName)
                return true;
            const candidateNorm = normalizeModelName(candidate.name);
            if (candidateNorm === itemNorm)
                return true;
            // SVM / SVR matching
            if ((itemNorm.includes('svr') || itemNorm.includes('supportvectorreg')) &&
                (candidateNorm.includes('svr') || candidateNorm.includes('supportvectorreg'))) {
                return true;
            }
            if ((itemNorm.includes('svm') || itemNorm.includes('supportvector')) &&
                (candidateNorm.includes('svm') || candidateNorm.includes('supportvector'))) {
                return true;
            }
            return false;
        });
        if (!model) {
            return;
        }
        if (typeof item.code === 'string' && item.code.trim()) {
            // IMPORTANT: Do NOT overwrite model.code — it is the baseline used by the
            // "Insert into Notebook" button. Only store tuned code in model.tuned_code.
            model.tuned_code = item.code;
            model.code_available = true;
            model.tuned_configuration_applied = true;
            model.tuned_params =
                item.best_params && typeof item.best_params === 'object' && !Array.isArray(item.best_params)
                    ? item.best_params
                    : undefined;
            model.tuned_changes = Array.isArray(item.recommended_changes)
                ? item.recommended_changes
                : undefined;
            const scoreVal = (_b = (_a = item.best_score) !== null && _a !== void 0 ? _a : item.mean_score) !== null && _b !== void 0 ? _b : item.score;
            model.tuned_score = typeof scoreVal === 'number' ? scoreVal : undefined;
            model.tuned_recommendation_status =
                typeof item.recommendation_status === 'string'
                    ? item.recommendation_status
                    : undefined;
            delete model.tuned_code_error;
            (_c = model.refreshCode) === null || _c === void 0 ? void 0 : _c.call(model);
            updated += 1;
        }
        else if (typeof item.code_error === 'string') {
            model.tuned_code_error = item.code_error;
            errors.push(`${model.name}: ${item.code_error}`);
        }
    });
    return { updated, errors };
}


},
"./lib/modelmind-studio.js"(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  ModelMindStudioWidget: () => (ModelMindStudioWidget),
  createModelMindStudioWidget: () => (createModelMindStudioWidget)
});
/* import */ var _lumino_widgets__rspack_import_0 = __webpack_require__("webpack/sharing/consume/default/@lumino/widgets");
/* import */ var _lumino_widgets__rspack_import_0_default = /*#__PURE__*/__webpack_require__.n(_lumino_widgets__rspack_import_0);
/* import */ var _jupyterlab_cells__rspack_import_1 = __webpack_require__("webpack/sharing/consume/default/@jupyterlab/cells");
/* import */ var _jupyterlab_cells__rspack_import_1_default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_cells__rspack_import_1);
/* import */ var _request__rspack_import_3 = __webpack_require__("./lib/request.js");
/* import */ var _notebook_mode__rspack_import_2 = __webpack_require__("./lib/notebook-mode.js");
/* import */ var _model_code_utils__rspack_import_7 = __webpack_require__("./lib/model-code-utils.js");
/* import */ var _preprocessing_code_utils__rspack_import_4 = __webpack_require__("./lib/preprocessing-code-utils.js");
/* import */ var _model_advisor_explanations__rspack_import_5 = __webpack_require__("./lib/model-advisor-explanations.js");
/* import */ var _tuning_explanations__rspack_import_6 = __webpack_require__("./lib/tuning-explanations.js");
/**
 * ModelMind Studio — Unified Left Sidebar Panel
 *
 * Combines all ModelMind ML Intelligence features into a single slide bar:
 *  1. 🔬 Dataset X-Ray (Overview, Health, Preview, Column Stats)
 *  2. 🎯 Target Analyzer (ML Task Detection, Class Balance, Regression Stats)
 *  3. 📊 Feature Analyzer (Distribution Plots, Cardinality, Stats)
 *  4. 🧠 Smart Preprocessing Adviser 2.0 (Recommendations, Live Preview, Apply & Undo, Code Gen)
 *  5. ⚗️ Model Visualization Lab (Interactive Gradient Descent, Decision Tree, KNN, K-Means, PCA)
 *  6. 📖 Preprocessing & ML Guide (Educational Best Practices)
 */








class ModelMindStudioWidget extends _lumino_widgets__rspack_import_0.Widget {
    constructor(app, notebooks) {
        var _a;
        super();
        this._activeTab = 'xray';
        this._currentPath = '50_Startups.csv';
        this._resolvedDatasetPath = '';
        this._dataset = null;
        this._prepLevel = 'basic';
        this._trainerMode = false;
        this._notebookRole = 'modelmind';
        this._preprocessingRequestId = 0;
        this._targetCol = '';
        this._featureCol = '';
        this._tabButtons = new Map();
        this._app = app;
        this._notebooks = notebooks;
        this._notebookRole = (0,_notebook_mode__rspack_import_2.getModelMindNotebookRole)((_a = notebooks.currentWidget) === null || _a === void 0 ? void 0 : _a.context.model);
        this._trainerMode = this._notebookRole === 'trainer';
        this.id = 'modelmind-studio-sidebar';
        this.title.caption = 'ModelMind Studio';
        this.title.iconClass = 'mm-sidebar-icon mm-icon-modelmind';
        this.addClass('mm-modelmind-panel');
        this._root = document.createElement('div');
        this._root.className = 'mm-studio-root';
        this.node.appendChild(this._root);
        this._buildHeader();
        this._buildTabs();
        this._buildContentArea();
        this._bindNotebookTracker();
        void this._refreshNotebookModeWhenReady();
        // Auto-load initial dataset if present
        setTimeout(() => {
            if (this._canUseCodeAction('preview')) {
                void this._loadDataset(this._currentPath);
            }
        }, 100);
    }
    // ═════════════════════════════════════════════════════════════════
    // HEADER & DATASET SELECTOR
    // ═════════════════════════════════════════════════════════════════
    _buildHeader() {
        var _a;
        const hdr = document.createElement('div');
        hdr.className = 'mm-studio-header';
        const brand = document.createElement('div');
        brand.className = 'mm-studio-brand';
        brand.innerHTML = `
      <div class="mm-studio-logo">◈</div>
      <div class="mm-studio-title-box">
        <div class="mm-studio-title">ModelMind Studio</div>
        <div class="mm-studio-sub">AI ML Intelligence & Laboratory</div>
      </div>
    `;
        this._notebookModeLabel = document.createElement('div');
        this._notebookModeLabel.className = 'mm-studio-sub';
        this._notebookModeLabel.textContent = this._trainerMode
            ? 'Trainer Notebook · Preview only'
            : 'ModelMind Notebook';
        (_a = brand.querySelector('.mm-studio-title-box')) === null || _a === void 0 ? void 0 : _a.appendChild(this._notebookModeLabel);
        // Dataset Path Row
        const pathWrap = document.createElement('div');
        pathWrap.className = 'mm-studio-path-wrap';
        const inputRow = document.createElement('div');
        inputRow.className = 'mm-studio-input-row';
        this._pathInput = document.createElement('input');
        this._pathInput.type = 'text';
        this._pathInput.className = 'mm-studio-input';
        this._pathInput.placeholder = 'e.g. 50_Startups.csv';
        this._pathInput.value = this._currentPath;
        const loadBtn = document.createElement('button');
        loadBtn.type = 'button';
        loadBtn.className = 'mm-studio-btn mm-btn-primary';
        loadBtn.innerHTML = '🔍 Analyze';
        loadBtn.title = 'Analyze Dataset';
        loadBtn.addEventListener('click', () => {
            const p = this._pathInput.value.trim();
            if (p)
                void this._loadDataset(p);
        });
        inputRow.append(this._pathInput, loadBtn);
        // Quick Select Samples / Auto-detect helper
        const quickRow = document.createElement('div');
        quickRow.className = 'mm-studio-quick-row';
        const autoBtn = document.createElement('button');
        autoBtn.type = 'button';
        autoBtn.className = 'mm-studio-quick-pill';
        autoBtn.innerHTML = '⚡ Auto-Detect';
        autoBtn.title = 'Detect dataset from open notebook cell';
        autoBtn.addEventListener('click', () => this._autoDetectDataset());
        const s1 = document.createElement('button');
        s1.type = 'button';
        s1.className = 'mm-studio-quick-pill';
        s1.textContent = '50_Startups.csv';
        s1.addEventListener('click', () => {
            this._pathInput.value = '50_Startups.csv';
            void this._loadDataset('50_Startups.csv');
        });
        const s2 = document.createElement('button');
        s2.type = 'button';
        s2.className = 'mm-studio-quick-pill';
        s2.textContent = 'test_dataset.csv';
        s2.addEventListener('click', () => {
            this._pathInput.value = 'test_dataset.csv';
            void this._loadDataset('test_dataset.csv');
        });
        quickRow.append(autoBtn, s1, s2);
        this._statusPill = document.createElement('div');
        this._statusPill.className = 'mm-studio-status-pill';
        this._statusPill.textContent = 'Ready to analyze';
        pathWrap.append(inputRow, quickRow, this._statusPill);
        hdr.append(brand, pathWrap);
        this._root.appendChild(hdr);
    }
    // ═════════════════════════════════════════════════════════════════
    // SLIDE BAR TABS
    // ═════════════════════════════════════════════════════════════════
    _buildTabs() {
        this._tabRow = document.createElement('div');
        this._tabRow.className = 'mm-studio-tab-bar';
        const tabsConfig = [
            { id: 'xray', label: '🔬 X-Ray' },
            { id: 'target', label: '🎯 Target' },
            { id: 'feature', label: '📊 Feature' },
            { id: 'prep', label: '🧠 Preprocessing' },
            { id: 'model-advisor', label: '🤖 Model Advisor' },
            { id: 'lab', label: '⚗️ Model Lab' },
            { id: 'guide', label: '📖 Guide' },
        ];
        tabsConfig.forEach(t => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `mm-studio-tab ${t.id === this._activeTab ? 'active' : ''}`;
            btn.textContent = t.label;
            btn.addEventListener('click', () => {
                this._activeTab = t.id;
                this._tabButtons.forEach((b, k) => {
                    b.classList.toggle('active', k === t.id);
                });
                this._renderCurrentTab();
            });
            this._tabRow.appendChild(btn);
            this._tabButtons.set(t.id, btn);
        });
        this._root.appendChild(this._tabRow);
    }
    _buildContentArea() {
        this._contentArea = document.createElement('div');
        this._contentArea.className = 'mm-studio-content';
        this._root.appendChild(this._contentArea);
    }
    _bindNotebookTracker() {
        this._notebooks.currentChanged.connect(() => {
            void this._refreshNotebookModeWhenReady();
        });
        this._notebooks.activeCellChanged.connect(() => {
            const cell = this._notebooks.activeCell;
            if (!cell || !(0,_jupyterlab_cells__rspack_import_1.isCodeCellModel)(cell.model))
                return;
            const src = cell.model.toJSON().source;
            const code = Array.isArray(src) ? src.join('') : src;
            const match = code.match(/['"]((?:[^'"]+)\.(?:csv|xlsx|xls|json))['"]/);
            if (match) {
                const found = match[1];
                if (found && found !== this._currentPath) {
                    this._pathInput.value = found;
                }
            }
        });
    }
    async _refreshNotebookModeWhenReady() {
        const notebook = this._notebooks.currentWidget;
        if (notebook) {
            await notebook.context.ready;
            if (notebook !== this._notebooks.currentWidget) {
                return;
            }
        }
        this.refreshNotebookMode();
    }
    refreshNotebookMode() {
        var _a, _b;
        const notebookRole = (0,_notebook_mode__rspack_import_2.getModelMindNotebookRole)((_a = this._notebooks.currentWidget) === null || _a === void 0 ? void 0 : _a.context.model);
        const trainerMode = notebookRole === 'trainer';
        if (notebookRole === this._notebookRole) {
            return;
        }
        this._notebookRole = notebookRole;
        this._trainerMode = trainerMode;
        this._notebookModeLabel.textContent =
            notebookRole === 'trainer'
                ? 'Trainer Notebook · Preview only'
                : notebookRole === 'plain'
                    ? 'Plain ModelMind Notebook'
                    : 'ModelMind Notebook';
        (_b = document.getElementById('mm-code-preview-modal')) === null || _b === void 0 ? void 0 : _b.remove();
        this._renderCurrentTab();
    }
    _canUseCodeAction(action) {
        return (0,_notebook_mode__rspack_import_2.canUseNotebookCodeAction)(this._notebookRole, action);
    }
    _autoDetectDataset() {
        if (!this._canUseCodeAction('preview')) {
            return;
        }
        const cell = this._notebooks.activeCell;
        if (!cell || !(0,_jupyterlab_cells__rspack_import_1.isCodeCellModel)(cell.model)) {
            this._showToast('Select a notebook cell containing dataset path.');
            return;
        }
        const src = cell.model.toJSON().source;
        const code = Array.isArray(src) ? src.join('') : src;
        const match = code.match(/['"]((?:[^'"]+)\.(?:csv|xlsx|xls|json))['"]/);
        if (match) {
            this._pathInput.value = match[1];
            void this._loadDataset(match[1]);
            this._showToast(`Auto-detected: ${match[1]}`);
        }
        else {
            this._showToast('No .csv/.xlsx/.json found in active cell.');
        }
    }
    // ═════════════════════════════════════════════════════════════════
    // DATA LOAD & API CALLS
    // ═════════════════════════════════════════════════════════════════
    async _loadDataset(path) {
        var _a, _b, _c;
        if (!this._canUseCodeAction('preview')) {
            return;
        }
        this._currentPath = path;
        this._statusPill.textContent = '⏳ Analyzing dataset...';
        this._statusPill.className = 'mm-studio-status-pill loading';
        try {
            const res = await (0,_request__rspack_import_3.requestAPI)('api/dataset/xray', this._app.serviceManager.serverSettings, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ file_path: path })
            });
            this._dataset = res;
            if (!res.supported) {
                this._statusPill.textContent = `❌ ${res.message || 'Dataset not supported'}`;
                this._statusPill.className = 'mm-studio-status-pill error';
                this._renderError(res.message || 'Dataset format not supported.');
                return;
            }
            const rows = (_a = res.rows) !== null && _a !== void 0 ? _a : 0;
            const cols = (_b = res.columns) !== null && _b !== void 0 ? _b : 0;
            const miss = (_c = res.total_missing_values) !== null && _c !== void 0 ? _c : 0;
            this._statusPill.textContent = `✓ ${res.filename || path}: ${rows} rows × ${cols} cols • ${miss} missing`;
            this._statusPill.className = 'mm-studio-status-pill success';
            // Set default target & feature column
            if (res.column_names && res.column_names.length > 0) {
                if (!this._targetCol || !res.column_names.includes(this._targetCol)) {
                    this._targetCol = res.column_names[res.column_names.length - 1];
                }
                if (!this._featureCol || !res.column_names.includes(this._featureCol)) {
                    this._featureCol = res.column_names[0];
                }
            }
            this._renderCurrentTab();
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : 'Failed to load dataset';
            this._statusPill.textContent = `❌ Error: ${msg}`;
            this._statusPill.className = 'mm-studio-status-pill error';
            this._renderError(msg);
        }
    }
    _renderError(msg) {
        this._contentArea.replaceChildren();
        const errBox = document.createElement('div');
        errBox.className = 'mm-studio-card mm-card-error';
        errBox.innerHTML = `
      <div style="font-weight:700; font-size:13px; margin-bottom:6px;">⚠️ Dataset Error</div>
      <div style="font-size:11px; opacity:.9;">${msg}</div>
      <div style="font-size:10px; opacity:.6; margin-top:8px;">Ensure the file exists in the workspace. Supported: .csv, .xlsx, .json</div>
    `;
        this._contentArea.appendChild(errBox);
    }
    _renderCurrentTab() {
        this._contentArea.replaceChildren();
        switch (this._activeTab) {
            case 'xray':
                this._renderXRayTab();
                break;
            case 'target':
                this._renderTargetTab();
                break;
            case 'feature':
                this._renderFeatureTab();
                break;
            case 'prep':
                this._renderPreprocessingTab();
                break;
            case 'model-advisor':
                this._renderModelAdvisorTab();
                break;
            case 'lab':
                this._renderModelLabTab();
                break;
            case 'guide':
                this._renderGuideTab();
                break;
        }
    }
    // ═════════════════════════════════════════════════════════════════
    // VIEW 1: 🔬 DATASET X-RAY
    // ═════════════════════════════════════════════════════════════════
    _renderXRayTab() {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        if (!this._dataset || !this._dataset.supported) {
            this._contentArea.innerHTML = '<div class="mm-studio-empty">Enter a dataset file path above and click 🔍 Analyze.</div>';
            return;
        }
        const d = this._dataset;
        const frag = document.createDocumentFragment();
        // 1. Health Grid
        const healthSec = document.createElement('div');
        healthSec.className = 'mm-studio-section';
        healthSec.innerHTML = `<div class="mm-studio-sec-title"><span>🔬</span> Dataset Health Profile</div>`;
        const grid = document.createElement('div');
        grid.className = 'mm-studio-stats-grid';
        const numCols = (_b = (_a = d.numeric_columns) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0;
        const catCols = (_d = (_c = d.categorical_columns) === null || _c === void 0 ? void 0 : _c.length) !== null && _d !== void 0 ? _d : 0;
        const miss = (_e = d.total_missing_values) !== null && _e !== void 0 ? _e : 0;
        const dups = (_f = d.duplicate_rows) !== null && _f !== void 0 ? _f : 0;
        grid.appendChild(this._createStatCard('Rows', (_g = d.rows) !== null && _g !== void 0 ? _g : 0));
        grid.appendChild(this._createStatCard('Columns', `${(_h = d.columns) !== null && _h !== void 0 ? _h : 0} (${numCols}N / ${catCols}C)`));
        grid.appendChild(this._createStatCard('Missing', miss, miss > 0 ? 'warn' : 'ok'));
        grid.appendChild(this._createStatCard('Duplicates', dups, dups > 0 ? 'warn' : 'ok'));
        healthSec.appendChild(grid);
        // Likely ID columns warning
        if (d.likely_id_columns && d.likely_id_columns.length > 0) {
            const idWarn = document.createElement('div');
            idWarn.className = 'mm-studio-alert mm-alert-warning';
            idWarn.innerHTML = `⚠️ <b>Likely ID Column(s):</b> ${d.likely_id_columns.join(', ')} — These should not be used as training features.`;
            healthSec.appendChild(idWarn);
        }
        frag.appendChild(healthSec);
        // 2. Missing Values Breakdown
        if (d.missing_values && Object.keys(d.missing_values).length > 0) {
            const missEntries = Object.entries(d.missing_values).filter(([, c]) => c > 0);
            if (missEntries.length > 0) {
                const missSec = document.createElement('div');
                missSec.className = 'mm-studio-section';
                missSec.innerHTML = `<div class="mm-studio-sec-title"><span>⚠️</span> Missing Values Breakdown</div>`;
                missEntries.forEach(([col, count]) => {
                    const pct = d.rows ? Math.round((count / d.rows) * 100) : 0;
                    const barRow = document.createElement('div');
                    barRow.className = 'mm-studio-bar-row';
                    barRow.innerHTML = `
            <div class="mm-studio-bar-label">
              <span>${col}</span>
              <span class="mm-studio-bar-val">${count} (${pct}%)</span>
            </div>
            <div class="mm-studio-bar-track">
              <div class="mm-studio-bar-fill" style="width:${pct}%; background:#f87171;"></div>
            </div>
          `;
                    missSec.appendChild(barRow);
                });
                frag.appendChild(missSec);
            }
        }
        // 3. Data Preview Table
        if (d.preview && d.preview.length > 0) {
            const prevSec = document.createElement('div');
            prevSec.className = 'mm-studio-section';
            prevSec.innerHTML = `<div class="mm-studio-sec-title"><span>👁️</span> Data Preview (First 5 Rows)</div>`;
            const tableWrap = document.createElement('div');
            tableWrap.className = 'mm-studio-table-wrap';
            const table = document.createElement('table');
            table.className = 'mm-studio-table';
            const cols = d.column_names || Object.keys(d.preview[0] || {});
            const thead = document.createElement('thead');
            const trh = document.createElement('tr');
            cols.forEach(col => {
                var _a;
                const th = document.createElement('th');
                const dt = ((_a = d.dtypes) === null || _a === void 0 ? void 0 : _a[col]) || '';
                th.innerHTML = `<div>${col}</div><span class="mm-th-dtype">${dt}</span>`;
                trh.appendChild(th);
            });
            thead.appendChild(trh);
            table.appendChild(thead);
            const tbody = document.createElement('tbody');
            d.preview.slice(0, 5).forEach((row, i) => {
                const tr = document.createElement('tr');
                cols.forEach(col => {
                    const td = document.createElement('td');
                    const val = row[col];
                    td.textContent = val !== null && val !== undefined ? String(val) : '—';
                    if (val === null || val === undefined)
                        td.style.color = '#ef4444';
                    tr.appendChild(td);
                });
                tbody.appendChild(tr);
            });
            table.appendChild(tbody);
            tableWrap.appendChild(table);
            prevSec.appendChild(tableWrap);
            frag.appendChild(prevSec);
        }
        // 4. Column Statistics
        if (d.column_stats && d.column_stats.length > 0) {
            const statsSec = document.createElement('div');
            statsSec.className = 'mm-studio-section';
            statsSec.innerHTML = `<div class="mm-studio-sec-title"><span>📋</span> Column Statistics</div>`;
            d.column_stats.forEach(cs => {
                var _a;
                const row = document.createElement('div');
                row.className = 'mm-studio-col-card';
                row.innerHTML = `
          <div class="mm-studio-col-hdr">
            <span class="mm-studio-col-name">${cs.name}</span>
            <span class="mm-studio-badge ${cs.is_numeric ? 'badge-num' : 'badge-cat'}">${cs.dtype}</span>
          </div>
          <div class="mm-studio-col-meta">
            <span>Missing: <b>${cs.missing_count} (${cs.missing_pct}%)</b></span>
            <span>Unique: <b>${cs.unique_count}</b></span>
            ${cs.is_numeric && cs.mean !== undefined ? `<span>Mean: <b>${cs.mean.toFixed(2)}</b></span>` : ''}
            ${cs.is_numeric && cs.min !== undefined ? `<span>Min/Max: <b>${cs.min.toFixed(1)} / ${(_a = cs.max) === null || _a === void 0 ? void 0 : _a.toFixed(1)}</b></span>` : ''}
          </div>
        `;
                statsSec.appendChild(row);
            });
            frag.appendChild(statsSec);
        }
        this._contentArea.appendChild(frag);
    }
    // ═════════════════════════════════════════════════════════════════
    // VIEW 2: 🎯 TARGET ANALYZER & TARGET HEALTH
    // ═════════════════════════════════════════════════════════════════
    _renderTargetTab() {
        if (!this._dataset || !this._dataset.supported) {
            this._contentArea.innerHTML = '<div class="mm-studio-empty">Analyze a dataset to use Target Intelligence.</div>';
            return;
        }
        const frag = document.createDocumentFragment();
        const pickerSec = document.createElement('div');
        pickerSec.className = 'mm-studio-section';
        pickerSec.innerHTML = `
      <div class="mm-studio-sec-title"><span>🎯</span> Target Variable Analyzer</div>
      <div class="mm-studio-sec-sub">Select the dependent variable you want your ML model to predict.</div>
    `;
        const selectRow = document.createElement('div');
        selectRow.className = 'mm-studio-select-row';
        const select = document.createElement('select');
        select.className = 'mm-studio-select';
        (this._dataset.column_names || []).forEach(col => {
            const opt = document.createElement('option');
            opt.value = col;
            opt.textContent = col;
            if (col === this._targetCol)
                opt.selected = true;
            select.appendChild(opt);
        });
        const analyzeBtn = document.createElement('button');
        analyzeBtn.type = 'button';
        analyzeBtn.className = 'mm-studio-btn mm-btn-primary';
        analyzeBtn.textContent = '🎯 Inspect Target';
        selectRow.append(select, analyzeBtn);
        pickerSec.appendChild(selectRow);
        frag.appendChild(pickerSec);
        const targetResultDiv = document.createElement('div');
        targetResultDiv.className = 'mm-studio-target-result';
        frag.appendChild(targetResultDiv);
        const runTargetAnalysis = async (col) => {
            this._targetCol = col;
            targetResultDiv.innerHTML = '<div class="mm-studio-loading">Analyzing target health...</div>';
            try {
                const res = await (0,_request__rspack_import_3.requestAPI)('api/dataset/target', this._app.serviceManager.serverSettings, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ file_path: this._currentPath, target_column: col })
                });
                this._displayTargetResult(targetResultDiv, res);
            }
            catch (err) {
                targetResultDiv.innerHTML = `<div class="mm-studio-alert mm-alert-error">${err instanceof Error ? err.message : 'Target analysis failed.'}</div>`;
            }
        };
        analyzeBtn.addEventListener('click', () => runTargetAnalysis(select.value));
        select.addEventListener('change', () => runTargetAnalysis(select.value));
        this._contentArea.appendChild(frag);
        if (this._targetCol) {
            void runTargetAnalysis(this._targetCol);
        }
    }
    _displayTargetResult(container, res) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        container.replaceChildren();
        // 1. Task Badge & Health summary
        const card = document.createElement('div');
        card.className = 'mm-studio-card';
        const taskColor = res.task === 'classification' ? '#4f46e5' : '#059669';
        card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <span style="font-weight:700; font-size:14px;">${res.target_column || res.target || this._targetCol || 'Target'}</span>
        <span class="mm-studio-badge" style="background:${res.task === 'classification' ? '#eef2ff' : '#ecfdf5'}; color:${taskColor}; border:1px solid ${res.task === 'classification' ? '#c7d2fe' : '#a7f3d0'}; font-size:11px; font-weight:700;">
          ${(res.task_type || res.task || 'ML').toUpperCase()} TASK
        </span>
      </div>
      <div class="mm-studio-stats-grid">
        <div class="mm-stat-box"><div class="mm-stat-val">${res.unique_count}</div><div class="mm-stat-lbl">Unique Values</div></div>
        <div class="mm-stat-box"><div class="mm-stat-val" style="color:${((_a = res.missing_count) !== null && _a !== void 0 ? _a : 0) > 0 ? '#dc2626' : '#059669'}">${(_b = res.missing_count) !== null && _b !== void 0 ? _b : 0}</div><div class="mm-stat-lbl">Missing</div></div>
        <div class="mm-stat-box"><div class="mm-stat-val">${res.dtype}</div><div class="mm-stat-lbl">Data Type</div></div>
        <div class="mm-stat-box"><div class="mm-stat-val">${res.is_imbalanced ? 'Imbalanced' : 'Healthy'}</div><div class="mm-stat-lbl">Target Health</div></div>
      </div>
    `;
        // Missing target warning
        if (((_c = res.missing_count) !== null && _c !== void 0 ? _c : 0) > 0) {
            const missWarn = document.createElement('div');
            missWarn.className = 'mm-studio-alert mm-alert-error';
            missWarn.style.marginTop = '10px';
            missWarn.innerHTML = `❌ <b>Critical:</b> Target variable has ${res.missing_count} missing values. Supervised models cannot train on missing targets. Drop these rows before fitting.`;
            card.appendChild(missWarn);
        }
        container.appendChild(card);
        // 2. Classification Health (Class Distribution & Imbalance)
        if (res.task === 'classification') {
            const classSec = document.createElement('div');
            classSec.className = 'mm-studio-section';
            classSec.innerHTML = `<div class="mm-studio-sec-title"><span>⚖️</span> Class Distribution & Imbalance</div>`;
            const encodingNotice = document.createElement('div');
            encodingNotice.className = 'mm-studio-alert mm-alert-info';
            encodingNotice.textContent = res.is_numeric
                ? 'This numeric classification target is already encoded. This inspection does not change your data.'
                : 'This is a categorical target. This inspection does not encode or change your data. When you run generated classification code from Model Advisor, LabelEncoder is applied for training, its mapping is shown, and predictions are converted back to the original labels. Encoding does not improve model accuracy; clean inconsistent labels before training.';
            classSec.appendChild(encodingNotice);
            if (res.class_percentages) {
                if (res.imbalance_ratio !== undefined) {
                    const imbPill = document.createElement('div');
                    imbPill.className = `mm-studio-alert ${res.is_imbalanced ? 'mm-alert-warning' : 'mm-alert-info'}`;
                    imbPill.innerHTML = `Imbalance Ratio: <b>${res.imbalance_ratio.toFixed(2)} : 1</b> — ${res.is_imbalanced ? '⚠️ Significant class imbalance detected.' : '✓ Well balanced target.'}`;
                    classSec.appendChild(imbPill);
                }
                Object.entries(res.class_percentages).forEach(([cls, pct]) => {
                    var _a, _b;
                    const count = (_b = (_a = res.class_counts) === null || _a === void 0 ? void 0 : _a[cls]) !== null && _b !== void 0 ? _b : '';
                    const barRow = document.createElement('div');
                    barRow.className = 'mm-studio-bar-row';
                    barRow.innerHTML = `
            <div class="mm-studio-bar-label">
              <span>Class <b>"${cls}"</b></span>
              <span class="mm-studio-bar-val">${count} (${pct}%)</span>
            </div>
            <div class="mm-studio-bar-track">
              <div class="mm-studio-bar-fill" style="width:${pct}%; background:#818cf8;"></div>
            </div>
          `;
                    classSec.appendChild(barRow);
                });
            }
            container.appendChild(classSec);
        }
        // 3. Regression Health (Distribution & Outliers)
        if (res.task === 'regression') {
            const regSec = document.createElement('div');
            regSec.className = 'mm-studio-section';
            regSec.innerHTML = `<div class="mm-studio-sec-title"><span>📈</span> Continuous Target Stats</div>`;
            const statsGrid = document.createElement('div');
            statsGrid.className = 'mm-studio-stats-grid';
            statsGrid.innerHTML = `
        <div class="mm-stat-box"><div class="mm-stat-val">${(_e = (_d = res.mean) === null || _d === void 0 ? void 0 : _d.toFixed(2)) !== null && _e !== void 0 ? _e : '—'}</div><div class="mm-stat-lbl">Mean</div></div>
        <div class="mm-stat-box"><div class="mm-stat-val">${(_g = (_f = res.median) === null || _f === void 0 ? void 0 : _f.toFixed(2)) !== null && _g !== void 0 ? _g : '—'}</div><div class="mm-stat-lbl">Median</div></div>
        <div class="mm-stat-box"><div class="mm-stat-val">${(_j = (_h = res.std) === null || _h === void 0 ? void 0 : _h.toFixed(2)) !== null && _j !== void 0 ? _j : '—'}</div><div class="mm-stat-lbl">Std Dev</div></div>
        <div class="mm-stat-box"><div class="mm-stat-val">${(_l = (_k = res.skewness) === null || _k === void 0 ? void 0 : _k.toFixed(2)) !== null && _l !== void 0 ? _l : '—'}</div><div class="mm-stat-lbl">Skewness</div></div>
      `;
            regSec.appendChild(statsGrid);
            if (res.skewness && Math.abs(res.skewness) > 1.0) {
                const skewAlert = document.createElement('div');
                skewAlert.className = 'mm-studio-alert mm-alert-warning';
                skewAlert.innerHTML = `⚠️ <b>High Skewness (${res.skewness.toFixed(2)}):</b> Target is heavily skewed. Consider applying <code>np.log1p()</code> or Box-Cox transformation.`;
                regSec.appendChild(skewAlert);
            }
            if (res.outlier_count && res.outlier_count > 0) {
                const outAlert = document.createElement('div');
                outAlert.className = 'mm-studio-alert mm-alert-warning';
                outAlert.innerHTML = `⚠️ <b>Outliers (${res.outlier_count}):</b> Target contains ${res.outlier_count} potential outliers (1.5 × IQR rule).`;
                regSec.appendChild(outAlert);
            }
            container.appendChild(regSec);
        }
        // 4. Action Recommendations
        if (res.recommendations && res.recommendations.length > 0) {
            const recSec = document.createElement('div');
            recSec.className = 'mm-studio-section';
            recSec.innerHTML = `<div class="mm-studio-sec-title"><span>💡</span> Target Engineering Advice</div>`;
            const list = document.createElement('ul');
            list.className = 'mm-studio-list';
            res.recommendations.forEach(r => {
                const li = document.createElement('li');
                li.textContent = r;
                list.appendChild(li);
            });
            recSec.appendChild(list);
            container.appendChild(recSec);
        }
    }
    // ═════════════════════════════════════════════════════════════════
    // VIEW 3: 📊 FEATURE ANALYZER & DISTRIBUTION
    // ═════════════════════════════════════════════════════════════════
    _renderFeatureTab() {
        if (!this._dataset || !this._dataset.supported) {
            this._contentArea.innerHTML = '<div class="mm-studio-empty">Analyze a dataset to use Feature Deep-Dive.</div>';
            return;
        }
        const frag = document.createDocumentFragment();
        const pickerSec = document.createElement('div');
        pickerSec.className = 'mm-studio-section';
        pickerSec.innerHTML = `
      <div class="mm-studio-sec-title"><span>📊</span> Feature Deep-Dive & Distribution</div>
      <div class="mm-studio-sec-sub">Examine individual feature distribution, outliers, and correlations.</div>
    `;
        const selectRow = document.createElement('div');
        selectRow.className = 'mm-studio-select-row';
        const select = document.createElement('select');
        select.className = 'mm-studio-select';
        (this._dataset.column_names || []).forEach(col => {
            const opt = document.createElement('option');
            opt.value = col;
            opt.textContent = col;
            if (col === this._featureCol)
                opt.selected = true;
            select.appendChild(opt);
        });
        const inspectBtn = document.createElement('button');
        inspectBtn.type = 'button';
        inspectBtn.className = 'mm-studio-btn mm-btn-primary';
        inspectBtn.textContent = '📊 Inspect Feature';
        selectRow.append(select, inspectBtn);
        pickerSec.appendChild(selectRow);
        frag.appendChild(pickerSec);
        const featResultDiv = document.createElement('div');
        featResultDiv.className = 'mm-studio-feat-result';
        frag.appendChild(featResultDiv);
        const runFeatureAnalysis = async (col) => {
            this._featureCol = col;
            featResultDiv.innerHTML = '<div class="mm-studio-loading">Analyzing feature distribution...</div>';
            try {
                const res = await (0,_request__rspack_import_3.requestAPI)('api/dataset/feature', this._app.serviceManager.serverSettings, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ file_path: this._currentPath, feature_column: col })
                });
                this._displayFeatureResult(featResultDiv, res);
            }
            catch (err) {
                featResultDiv.innerHTML = `<div class="mm-studio-alert mm-alert-error">${err instanceof Error ? err.message : 'Feature analysis failed.'}</div>`;
            }
        };
        inspectBtn.addEventListener('click', () => runFeatureAnalysis(select.value));
        select.addEventListener('change', () => runFeatureAnalysis(select.value));
        this._contentArea.appendChild(frag);
        if (this._featureCol) {
            void runFeatureAnalysis(this._featureCol);
        }
    }
    _displayFeatureResult(container, res) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        container.replaceChildren();
        // Stats Grid
        const card = document.createElement('div');
        card.className = 'mm-studio-card';
        card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <span style="font-weight:700; font-size:14px;">${(_b = (_a = res.feature_column) !== null && _a !== void 0 ? _a : res.feature) !== null && _b !== void 0 ? _b : '—'}</span>
        <span class="mm-studio-badge ${((_c = res.type) !== null && _c !== void 0 ? _c : res.feature_type) === 'numerical' ? 'badge-num' : 'badge-cat'}">${((_e = (_d = res.type) !== null && _d !== void 0 ? _d : res.feature_type) !== null && _e !== void 0 ? _e : 'unknown').toUpperCase()}</span>
      </div>
      <div class="mm-studio-stats-grid">
        <div class="mm-stat-box"><div class="mm-stat-val">${(_f = res.missing_count) !== null && _f !== void 0 ? _f : 0} (${((_g = res.missing_percentage) !== null && _g !== void 0 ? _g : 0).toFixed(1)}%)</div><div class="mm-stat-lbl">Missing</div></div>
        <div class="mm-stat-box"><div class="mm-stat-val">${(_h = res.unique_count) !== null && _h !== void 0 ? _h : 0}</div><div class="mm-stat-lbl">Unique</div></div>
        ${res.mean !== undefined ? `<div class="mm-stat-box"><div class="mm-stat-val">${res.mean.toFixed(2)}</div><div class="mm-stat-lbl">Mean</div></div>` : ''}
        ${res.median !== undefined ? `<div class="mm-stat-box"><div class="mm-stat-val">${res.median.toFixed(2)}</div><div class="mm-stat-lbl">Median</div></div>` : ''}
        ${((_j = res.std) !== null && _j !== void 0 ? _j : res.standard_deviation) !== undefined ? `<div class="mm-stat-box"><div class="mm-stat-val">${((_k = res.std) !== null && _k !== void 0 ? _k : res.standard_deviation).toFixed(2)}</div><div class="mm-stat-lbl">Std Dev</div></div>` : ''}
        ${res.skewness !== undefined ? `<div class="mm-stat-box"><div class="mm-stat-val">${res.skewness.toFixed(2)}</div><div class="mm-stat-lbl">Skewness</div></div>` : ''}
        ${res.outlier_count !== undefined ? `<div class="mm-stat-box"><div class="mm-stat-val" style="color:${res.outlier_count > 0 ? '#f87171' : 'inherit'}">${res.outlier_count}</div><div class="mm-stat-lbl">Outliers</div></div>` : ''}
      </div>
    `;
        container.appendChild(card);
        // Distribution Histogram / Value counts
        const distSec = document.createElement('div');
        distSec.className = 'mm-studio-section';
        distSec.innerHTML = `<div class="mm-studio-sec-title"><span>📊</span> Distribution</div>`;
        // Backend returns histogram_counts + histogram_edges arrays (numerical)
        // or category_distribution array (categorical), or legacy value_counts dict
        if (res.histogram_counts && res.histogram_edges && res.histogram_counts.length > 0) {
            const counts = res.histogram_counts;
            const edges = res.histogram_edges;
            const maxCount = Math.max(...counts, 1);
            const histDiv = document.createElement('div');
            histDiv.className = 'mm-studio-hist-container';
            counts.forEach((count, i) => {
                var _a, _b;
                const hPct = Math.round((count / maxCount) * 100);
                const colEl = document.createElement('div');
                colEl.className = 'mm-hist-col';
                const lo = ((_a = edges[i]) !== null && _a !== void 0 ? _a : 0).toFixed(0);
                const hi = ((_b = edges[i + 1]) !== null && _b !== void 0 ? _b : 0).toFixed(0);
                colEl.title = `[${lo} – ${hi}]: ${count}`;
                colEl.innerHTML = `
          <div class="mm-hist-bar" style="height:${Math.max(hPct, 4)}%;"></div>
          <div class="mm-hist-label">${lo}</div>
        `;
                histDiv.appendChild(colEl);
            });
            distSec.appendChild(histDiv);
        }
        else if (res.histogram && res.histogram.length > 0) {
            // Legacy: histogram as array of {bin_start, bin_end, count}
            const maxCount = Math.max(...res.histogram.map(b => b.count), 1);
            const histDiv = document.createElement('div');
            histDiv.className = 'mm-studio-hist-container';
            res.histogram.forEach(b => {
                const hPct = Math.round((b.count / maxCount) * 100);
                const colEl = document.createElement('div');
                colEl.className = 'mm-hist-col';
                colEl.title = `[${b.bin_start.toFixed(1)} – ${b.bin_end.toFixed(1)}]: ${b.count}`;
                colEl.innerHTML = `
          <div class="mm-hist-bar" style="height:${Math.max(hPct, 4)}%;"></div>
          <div class="mm-hist-label">${b.bin_start.toFixed(0)}</div>
        `;
                histDiv.appendChild(colEl);
            });
            distSec.appendChild(histDiv);
        }
        else if (res.category_distribution && res.category_distribution.length > 0) {
            // Backend categorical response: array of {value, count, percentage}
            res.category_distribution.slice(0, 10).forEach(item => {
                const pct = Math.round(item.percentage);
                const barRow = document.createElement('div');
                barRow.className = 'mm-studio-bar-row';
                barRow.innerHTML = `
          <div class="mm-studio-bar-label">
            <span>"${item.value}"</span>
            <span class="mm-studio-bar-val">${item.count} (${pct}%)</span>
          </div>
          <div class="mm-studio-bar-track">
            <div class="mm-studio-bar-fill" style="width:${pct}%; background:#38bdf8;"></div>
          </div>
        `;
                distSec.appendChild(barRow);
            });
        }
        else if (res.value_counts) {
            // Legacy: value_counts dict
            const entries = Object.entries(res.value_counts).slice(0, 8);
            const total = res.total_rows || 1;
            entries.forEach(([cat, cnt]) => {
                const pct = Math.round((cnt / total) * 100);
                const barRow = document.createElement('div');
                barRow.className = 'mm-studio-bar-row';
                barRow.innerHTML = `
          <div class="mm-studio-bar-label">
            <span>"${cat}"</span>
            <span class="mm-studio-bar-val">${cnt} (${pct}%)</span>
          </div>
          <div class="mm-studio-bar-track">
            <div class="mm-studio-bar-fill" style="width:${pct}%; background:#38bdf8;"></div>
          </div>
        `;
                distSec.appendChild(barRow);
            });
        }
        container.appendChild(distSec);
        // Correlations
        if (res.correlations && Object.keys(res.correlations).length > 0) {
            const corrSec = document.createElement('div');
            corrSec.className = 'mm-studio-section';
            corrSec.innerHTML = `<div class="mm-studio-sec-title"><span>🔗</span> Correlations with Other Features</div>`;
            const selfName = (_l = res.feature_column) !== null && _l !== void 0 ? _l : res.feature;
            Object.entries(res.correlations).forEach(([other, r]) => {
                if (other === selfName)
                    return;
                const absR = Math.abs(r);
                const color = r > 0 ? '#059669' : '#dc2626';
                const row = document.createElement('div');
                row.className = 'mm-studio-bar-row';
                row.innerHTML = `
          <div class="mm-studio-bar-label">
            <span>${other}</span>
            <span class="mm-studio-bar-val" style="color:${color}; font-weight:700;">r = ${r.toFixed(3)}</span>
          </div>
          <div class="mm-studio-bar-track">
            <div class="mm-studio-bar-fill" style="width:${Math.round(absR * 100)}%; background:${color};"></div>
          </div>
        `;
                corrSec.appendChild(row);
            });
            container.appendChild(corrSec);
        }
    }
    // ═════════════════════════════════════════════════════════════════
    // VIEW 4: 🧠 SMART PREPROCESSING ADVISER 2.0
    // ═════════════════════════════════════════════════════════════════
    _renderPreprocessingTab() {
        if (!this._dataset || !this._dataset.supported) {
            this._contentArea.innerHTML = '<div class="mm-studio-empty">Analyze a dataset to get Smart Preprocessing recommendations.</div>';
            return;
        }
        this._contentArea.replaceChildren();
        const frag = document.createDocumentFragment();
        // ── Level Selector Header ──
        const topBar = document.createElement('div');
        topBar.className = 'mm-studio-section';
        // Level description banner
        const levelDescriptions = {
            basic: '🟢 Basic — Learn how simple mean, median, or mode filling works, and why the observed values support it.',
            medium: '🟡 Medium — Impute and inspect distribution / IQR flags; cap only after checking that flagged values are errors.',
            advanced: '🔴 Advanced — Use leakage-safe sklearn Pipelines and ColumnTransformers fitted on training rows only.',
        };
        const lvlRow = document.createElement('div');
        lvlRow.className = 'mm-studio-level-row';
        lvlRow.id = 'mm-prep-level-row';
        const lbl = document.createElement('span');
        lbl.style.cssText = 'font-size:12px; opacity:.8; margin-right:8px; font-weight:700;';
        lbl.textContent = 'Skill Level:';
        lvlRow.appendChild(lbl);
        const levelDescBanner = document.createElement('div');
        levelDescBanner.className = `mm-prep-level-banner mm-prep-level-${this._prepLevel}`;
        levelDescBanner.textContent = levelDescriptions[this._prepLevel];
        const updateLevelUI = () => {
            // Update pill active states
            lvlRow.querySelectorAll('.mm-level-pill').forEach((el) => {
                const btn = el;
                const isActive = btn.dataset['level'] === this._prepLevel;
                btn.className = `mm-level-pill${isActive ? ' active' : ''}`;
            });
            levelDescBanner.className = `mm-prep-level-banner mm-prep-level-${this._prepLevel}`;
            levelDescBanner.textContent = levelDescriptions[this._prepLevel];
        };
        ['basic', 'medium', 'advanced'].forEach(lvl => {
            const b = document.createElement('button');
            b.type = 'button';
            b.dataset['level'] = lvl;
            b.className = `mm-level-pill ${this._prepLevel === lvl ? 'active' : ''}`;
            b.textContent = lvl.charAt(0).toUpperCase() + lvl.slice(1);
            b.addEventListener('click', () => {
                this._prepLevel = lvl;
                updateLevelUI();
                void this._loadPreprocessingAdvice(prepCardsContainer);
            });
            lvlRow.appendChild(b);
        });
        topBar.appendChild(lvlRow);
        topBar.appendChild(levelDescBanner);
        frag.appendChild(topBar);
        // Container for cards
        const prepCardsContainer = document.createElement('div');
        prepCardsContainer.className = 'mm-studio-prep-cards';
        frag.appendChild(prepCardsContainer);
        this._contentArea.appendChild(frag);
        void this._loadPreprocessingAdvice(prepCardsContainer);
    }
    async _loadPreprocessingAdvice(container) {
        const requestId = ++this._preprocessingRequestId;
        const level = this._prepLevel;
        const datasetPath = this._pathInput.value.trim() || this._currentPath;
        container.innerHTML = '<div class="mm-studio-loading">Generating smart preprocessing recommendations...</div>';
        try {
            const res = await (0,_request__rspack_import_3.requestAPI)('api/dataset/preprocessing', this._app.serviceManager.serverSettings, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ file_path: datasetPath, level })
            });
            if (requestId !== this._preprocessingRequestId || !container.isConnected) {
                return;
            }
            this._resolvedDatasetPath = res.resolved_path || datasetPath;
            container.replaceChildren();
            // Warnings banner
            if (res.dataset_warnings && res.dataset_warnings.length > 0) {
                const warnCard = document.createElement('div');
                warnCard.className = 'mm-studio-alert mm-alert-warning';
                warnCard.innerHTML = `<b>Dataset Observations:</b><br/>${res.dataset_warnings.map(w => `• ${w}`).join('<br/>')}`;
                container.appendChild(warnCard);
            }
            if (!res.recommendations || res.recommendations.length === 0) {
                container.innerHTML = '<div class="mm-studio-empty">No preprocessing needed! Dataset is clean.</div>';
                return;
            }
            res.recommendations.forEach(rec => {
                const card = this._createRecommendationCard(rec, res.recommendations);
                container.appendChild(card);
            });
            // ── Advanced: Show full pipeline suggestion banner ──
            if (level === 'advanced' && res.pipeline_code) {
                const fullPipelineCode = [
                    (0,_preprocessing_code_utils__rspack_import_4.buildDatasetLoadingCode)(this._resolvedDatasetPath),
                    '',
                    res.pipeline_code
                ].join('\n');
                const pipelineSection = document.createElement('div');
                pipelineSection.style.cssText = `
          margin-top:18px; padding:16px; border-radius:12px;
          background:#f0fdf4; border:1px solid #bbf7d0;
        `;
                const pipelineTitle = document.createElement('div');
                pipelineTitle.style.cssText = 'font-size:14px; font-weight:750; margin-bottom:6px; color:#15803d;';
                pipelineTitle.innerHTML = '🚀 Suggested Full ColumnTransformer Pipeline';
                const pipelineSub = document.createElement('div');
                pipelineSub.style.cssText = 'font-size:13px; line-height:1.55; color:#475569; margin-bottom:12px;';
                pipelineSub.textContent = 'This pipeline combines all numerical and categorical columns with proper imputation, scaling, and encoding.';
                const pipelineCode = document.createElement('pre');
                pipelineCode.style.cssText = `
          background:#ffffff; border:1px solid #dfe3ea; border-radius:8px;
          padding:14px 16px; font-size:12px; overflow-x:auto; margin:0;
          font-family:ui-monospace,SFMono-Regular,monospace; line-height:1.65; color:#1e293b;
        `;
                pipelineCode.textContent = fullPipelineCode;
                const pipelineBtnRow = document.createElement('div');
                pipelineBtnRow.style.cssText = 'display:flex; gap:8px; margin-top:10px;';
                const pipelineCopyBtn = document.createElement('button');
                pipelineCopyBtn.type = 'button';
                pipelineCopyBtn.className = 'mm-studio-btn mm-btn-sm';
                pipelineCopyBtn.innerHTML = '📋 Copy Pipeline';
                pipelineCopyBtn.addEventListener('click', async () => {
                    await navigator.clipboard.writeText(fullPipelineCode);
                    pipelineCopyBtn.textContent = 'Copied!';
                    setTimeout(() => { pipelineCopyBtn.innerHTML = '📋 Copy Pipeline'; }, 1500);
                });
                const pipelineInsertBtn = document.createElement('button');
                pipelineInsertBtn.type = 'button';
                pipelineInsertBtn.className = 'mm-studio-btn mm-btn-sm mm-btn-primary';
                pipelineInsertBtn.innerHTML = '📥 Insert Pipeline';
                pipelineInsertBtn.addEventListener('click', () => {
                    const ok = this._insertPreprocessingCode(fullPipelineCode);
                    this._showToast(ok ? '✓ Pipeline code inserted!' : 'Open a notebook first.');
                });
                if (!this._canUseCodeAction('insert')) {
                    const pipelinePreviewBtn = document.createElement('button');
                    pipelinePreviewBtn.type = 'button';
                    pipelinePreviewBtn.className = 'mm-studio-btn mm-btn-sm';
                    pipelinePreviewBtn.textContent = '🔍 Preview Code';
                    pipelinePreviewBtn.addEventListener('click', () => {
                        this._showCodePreviewModal('Full preprocessing pipeline', fullPipelineCode, 'advanced');
                    });
                    pipelineBtnRow.append(pipelinePreviewBtn);
                }
                else {
                    pipelineBtnRow.append(pipelineCopyBtn, pipelineInsertBtn);
                }
                pipelineSection.append(pipelineTitle, pipelineSub, pipelineCode, pipelineBtnRow);
                container.appendChild(pipelineSection);
            }
        }
        catch (err) {
            if (requestId !== this._preprocessingRequestId || !container.isConnected) {
                return;
            }
            container.innerHTML = `<div class="mm-studio-alert mm-alert-error">${err instanceof Error ? err.message : 'Failed to generate recommendations.'}</div>`;
        }
    }
    _createRecommendationCard(rec, recommendations) {
        var _a;
        const card = document.createElement('div');
        card.className = 'mm-studio-card mm-prep-card';
        const sevColor = {
            none: '#059669',
            low: '#d97706',
            moderate: '#ea580c',
            high: '#dc2626',
            very_high: '#991b1b',
        }[rec.missing_severity] || '#64748b';
        // Header
        const hdr = document.createElement('div');
        hdr.className = 'mm-prep-hdr';
        hdr.innerHTML = `
      <div style="display:flex; align-items:center; gap:8px;">
        <span style="font-weight:700; font-size:13px;">${rec.feature}</span>
        <span class="mm-studio-badge ${rec.feature_type === 'numerical' ? 'badge-num' : 'badge-cat'}">${rec.feature_type.toUpperCase()}</span>
      </div>
      <span class="mm-studio-badge" style="background:${sevColor}22; color:${sevColor}; border:1px solid ${sevColor}44;">
        ${rec.numeric_conversion_required && (rec.parse_failure_count || 0) > 0
            ? `${rec.actual_missing_count || 0} BLANK + ${rec.parse_failure_count} UNPARSEABLE (${rec.missing_pct}%)`
            : `${rec.missing_count} MISSING (${rec.missing_pct}%)`}
      </span>
    `;
        // Action summary
        const act = document.createElement('div');
        act.className = 'mm-prep-action';
        act.innerHTML = `<b>Recommended:</b> ${rec.recommended_action || rec.imputation_strategy}`;
        if (rec.feature_type === 'numerical') {
            const profile = document.createElement('div');
            profile.className = 'mm-prep-profile';
            const kind = rec.numeric_kind === 'discrete'
                ? 'Discrete / count-like'
                : rec.numeric_kind === 'continuous'
                    ? 'Continuous-like'
                    : 'Numeric type unknown';
            const shape = (rec.distribution_shape || 'unknown')
                .replace(/_/g, ' ');
            const skew = typeof rec.skewness === 'number'
                ? rec.skewness.toFixed(2)
                : 'unavailable';
            const outlierPct = typeof rec.outlier_percentage === 'number'
                ? rec.outlier_percentage
                : rec.outlier_pct;
            profile.textContent =
                `📊 Profile: ${kind} · ${shape} · skewness ${skew} · ` +
                    `IQR outliers ${(_a = rec.outlier_count) !== null && _a !== void 0 ? _a : 0} (${outlierPct !== null && outlierPct !== void 0 ? outlierPct : 0}%)`;
            if (rec.transformation_strategy &&
                rec.transformation_strategy !== 'none') {
                const transformNote = document.createElement('div');
                transformNote.style.marginTop = '4px';
                const transformName = rec.transformation_strategy === 'log1p_candidate'
                    ? 'Log1p candidate'
                    : rec.transformation_strategy === 'power_transform_candidate'
                        ? 'Yeo-Johnson candidate'
                        : rec.transformation_strategy.replace(/_/g, ' ');
                transformNote.textContent =
                    `Distribution option: ${transformName}. ` +
                        (rec.transformation_reason || 'Validate the transformed shape before using it.');
                profile.appendChild(transformNote);
            }
            card.appendChild(profile);
        }
        // Why & Risks
        const whyEl = document.createElement('div');
        whyEl.className = 'mm-prep-why';
        const whyLabel = document.createElement('b');
        whyLabel.textContent = '✅ Why this choice: ';
        whyEl.append(whyLabel, rec.why || rec.explanation);
        if (rec.feature_type === 'numerical' && rec.imputation_reason) {
            const reason = document.createElement('div');
            reason.style.marginTop = '4px';
            reason.textContent = `Imputation rationale: ${rec.imputation_reason}`;
            whyEl.appendChild(reason);
        }
        const cautions = [
            ...(Array.isArray(rec.warnings) ? rec.warnings : []),
            ...(rec.risks ? [rec.risks] : [])
        ].filter((item, index, all) => item && !/^no risks?\b/i.test(item.trim()) && all.indexOf(item) === index);
        const riskEl = cautions.length > 0 ? document.createElement('div') : null;
        if (riskEl) {
            riskEl.className = 'mm-prep-risk-box';
            const riskHeading = document.createElement('strong');
            riskHeading.textContent = '⚠️ Considerations';
            const riskList = document.createElement('ul');
            riskList.style.cssText = 'margin:6px 0 0;padding-left:20px;';
            cautions.forEach(caution => {
                const item = document.createElement('li');
                item.textContent = caution;
                riskList.appendChild(item);
            });
            riskEl.append(riskHeading, riskList);
        }
        // Strategy selector
        const stratWrap = document.createElement('div');
        stratWrap.className = 'mm-prep-strategy-row';
        const stratSelect = document.createElement('select');
        stratSelect.className = 'mm-studio-select mm-select-sm';
        const strategies = rec.feature_type === 'numerical'
            ? ['mean', 'median', 'most_frequent', 'constant', 'standard_scaler', 'minmax_scaler', 'robust_scaler', 'cap_outliers_iqr', 'drop_column']
            : ['most_frequent', 'unknown', 'one_hot_encode', 'ordinal_encode', 'frequency_encode', 'drop_column'];
        const defaultStrategy = strategies.includes(rec.imputation_strategy)
            ? rec.imputation_strategy
            : rec.feature_type === 'numerical'
                ? 'median'
                : strategies[0];
        strategies.forEach(s => {
            const opt = document.createElement('option');
            opt.value = s;
            opt.textContent = s.replace(/_/g, ' ').toUpperCase();
            if (s === defaultStrategy)
                opt.selected = true;
            stratSelect.appendChild(opt);
        });
        let strategyCustomized = false;
        stratSelect.addEventListener('change', () => {
            strategyCustomized = true;
        });
        const getCode = () => this._buildFullPreprocessingCode(rec, stratSelect.value, strategyCustomized ? undefined : rec.example_code);
        stratWrap.innerHTML = '<span style="font-size:10px; opacity:.7;">Strategy:</span>';
        stratWrap.appendChild(stratSelect);
        // Live preview container
        const previewContainer = document.createElement('div');
        previewContainer.className = 'mm-prep-preview-box';
        previewContainer.style.display = 'none';
        // Toolbar Buttons
        const toolRow = document.createElement('div');
        toolRow.className = 'mm-prep-btn-row';
        // 1. Live Preview Button
        const prevBtn = document.createElement('button');
        prevBtn.type = 'button';
        prevBtn.className = 'mm-studio-btn mm-btn-sm';
        prevBtn.innerHTML = '👁️ Preview';
        prevBtn.title = 'Preview before and after';
        prevBtn.addEventListener('click', async () => {
            prevBtn.disabled = true;
            prevBtn.textContent = '⏳ Loading...';
            try {
                const preview = await (0,_request__rspack_import_3.requestAPI)('api/dataset/preprocessing/preview', this._app.serviceManager.serverSettings, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        file_path: this._currentPath,
                        feature: rec.feature,
                        strategy: stratSelect.value
                    })
                });
                this._renderLivePreview(previewContainer, preview, rec, this._prepLevel);
                previewContainer.style.display = 'block';
            }
            catch (err) {
                previewContainer.innerHTML = `<div class="mm-studio-alert mm-alert-error">${err instanceof Error ? err.message : 'Preview failed.'}</div>`;
                previewContainer.style.display = 'block';
            }
            finally {
                prevBtn.disabled = false;
                prevBtn.innerHTML = '👁️ Preview';
            }
        });
        // 2. Apply to Dataset
        const applyBtn = document.createElement('button');
        applyBtn.type = 'button';
        applyBtn.className = 'mm-studio-btn mm-btn-sm mm-btn-accent';
        applyBtn.innerHTML = '⚡ Apply to File';
        applyBtn.title = 'Apply transformation directly to dataset with backup';
        applyBtn.addEventListener('click', async () => {
            if (!confirm(`Apply '${stratSelect.value}' to column '${rec.feature}' in ${this._currentPath}?\nA .bak backup will be created.`))
                return;
            applyBtn.disabled = true;
            applyBtn.textContent = 'Applying...';
            try {
                const applied = await (0,_request__rspack_import_3.requestAPI)('api/dataset/preprocessing/apply', this._app.serviceManager.serverSettings, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        file_path: this._currentPath,
                        feature: rec.feature,
                        strategy: stratSelect.value
                    })
                });
                this._showToast(`✓ Applied ${stratSelect.value} to ${rec.feature}! Backup created.`);
                if (applied.dataset)
                    this._dataset = applied.dataset;
                void this._loadDataset(this._currentPath);
            }
            catch (err) {
                this._showToast(`❌ Apply failed: ${err instanceof Error ? err.message : 'Error'}`);
            }
            finally {
                applyBtn.disabled = false;
                applyBtn.innerHTML = '⚡ Apply to File';
            }
        });
        // 3. Undo
        const undoBtn = document.createElement('button');
        undoBtn.type = 'button';
        undoBtn.className = 'mm-studio-btn mm-btn-sm';
        undoBtn.innerHTML = '↩️ Undo';
        undoBtn.title = 'Restore original dataset from backup';
        undoBtn.addEventListener('click', async () => {
            if (!confirm(`Undo changes and restore ${this._currentPath} from backup?`))
                return;
            try {
                const undone = await (0,_request__rspack_import_3.requestAPI)('api/dataset/preprocessing/undo', this._app.serviceManager.serverSettings, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ file_path: this._currentPath })
                });
                this._showToast('✓ Restored dataset from backup!');
                if (undone.dataset)
                    this._dataset = undone.dataset;
                void this._loadDataset(this._currentPath);
            }
            catch (err) {
                this._showToast(`❌ Undo failed: ${err instanceof Error ? err.message : 'Error'}`);
            }
        });
        // 4. Insert Code
        const insertBtn = document.createElement('button');
        insertBtn.type = 'button';
        insertBtn.className = 'mm-studio-btn mm-btn-sm mm-btn-primary';
        insertBtn.innerHTML = '📥 Insert Code';
        insertBtn.title = 'Insert complete runnable preprocessing code, including loading the selected dataset';
        insertBtn.addEventListener('click', () => {
            const code = getCode();
            const ok = this._insertPreprocessingCode(code);
            if (ok) {
                this._showToast('✓ Full preprocessing code inserted below active cell!');
            }
            else {
                this._showToast('Please open a notebook first.');
            }
        });
        // 5. Copy Code
        const copyBtn = document.createElement('button');
        copyBtn.type = 'button';
        copyBtn.className = 'mm-studio-btn mm-btn-sm';
        copyBtn.innerHTML = '📋 Copy';
        copyBtn.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(getCode());
                copyBtn.textContent = 'Copied!';
                setTimeout(() => { copyBtn.innerHTML = '📋 Copy'; }, 1500);
            }
            catch (_a) {
                copyBtn.textContent = 'Error';
            }
        });
        // 6. Preview Code — show syntax-highlighted code in a modal
        const previewCodeBtn = document.createElement('button');
        previewCodeBtn.type = 'button';
        previewCodeBtn.className = 'mm-studio-btn mm-btn-sm';
        previewCodeBtn.innerHTML = '🔍 Preview Code';
        previewCodeBtn.title = 'View the generated code in a readable panel';
        previewCodeBtn.addEventListener('click', () => {
            this._showCodePreviewModal(rec.feature, getCode(), this._prepLevel);
        });
        toolRow.append(prevBtn, applyBtn, undoBtn);
        if (this._canUseCodeAction('insert')) {
            toolRow.append(insertBtn, copyBtn);
        }
        toolRow.append(previewCodeBtn);
        card.append(hdr, act);
        const profileEl = card.querySelector('.mm-prep-profile');
        if (profileEl)
            card.appendChild(profileEl);
        card.appendChild(whyEl);
        if (riskEl)
            card.appendChild(riskEl);
        card.append(stratWrap, previewContainer, toolRow);
        return card;
    }
    _buildFullPreprocessingCode(rec, selectedStrategy, recommendedCode) {
        const selectedPath = this._resolvedDatasetPath || this._pathInput.value.trim() || this._currentPath;
        return (0,_preprocessing_code_utils__rspack_import_4.buildFullPreprocessingCode)(selectedPath, rec, selectedStrategy, recommendedCode);
    }
    // ── Code Preview Modal ────────────────────────────────────────────────────
    _showCodePreviewModal(feature, code, level) {
        var _a;
        // Remove existing modal if any
        (_a = document.getElementById('mm-code-preview-modal')) === null || _a === void 0 ? void 0 : _a.remove();
        const levelColors = {
            basic: '#059669',
            medium: '#d97706',
            advanced: '#4f46e5',
        };
        const levelColor = levelColors[level] || '#4f46e5';
        const overlay = document.createElement('div');
        overlay.id = 'mm-code-preview-modal';
        overlay.style.cssText = `
      position:fixed; inset:0; z-index:99999;
      background:rgba(0,0,0,0.75); backdrop-filter:blur(4px);
      display:flex; align-items:center; justify-content:center;
      padding:20px;
    `;
        const modal = document.createElement('div');
        modal.style.cssText = `
      background:#ffffff; border:1px solid #dfe3ea; border-radius:12px;
      padding:0; width:min(680px, 95vw); max-height:85vh;
      display:flex; flex-direction:column; box-shadow:0 20px 45px rgba(0,0,0,0.12);
      overflow:hidden; color:#253041;
    `;
        // Modal header
        const modalHdr = document.createElement('div');
        modalHdr.style.cssText = `
      display:flex; align-items:center; gap:10px; padding:16px 20px;
      border-bottom:1px solid #dfe3ea;
      background:#f8fafc;
    `;
        modalHdr.innerHTML = `
      <span style="font-size:16px;">🔍</span>
      <div style="flex:1;">
        <div style="font-size:13px; font-weight:700; color:#172554;">Code Preview — <code style="color:${levelColor};">${feature}</code></div>
        <div style="font-size:10px; color:#64748b; margin-top:2px;">
          Skill Level: <span style="color:${levelColor}; font-weight:600; text-transform:capitalize;">${level}</span>
        </div>
      </div>
    `;
        const closeBtn = document.createElement('button');
        closeBtn.type = 'button';
        closeBtn.innerHTML = '✕';
        closeBtn.style.cssText = `
      background:#f1f5f9; border:1px solid #dfe3ea;
      color:#475569; border-radius:8px; width:28px; height:28px;
      cursor:pointer; font-size:12px; display:flex; align-items:center; justify-content:center;
    `;
        closeBtn.addEventListener('click', () => overlay.remove());
        modalHdr.appendChild(closeBtn);
        // Code body
        const codeBody = document.createElement('div');
        codeBody.style.cssText = 'flex:1; overflow-y:auto; padding:16px 20px; background:#f8fafc;';
        // Level badge row
        const badgeRow = document.createElement('div');
        badgeRow.style.cssText = 'display:flex; align-items:center; gap:8px; margin-bottom:12px;';
        badgeRow.innerHTML = `
      <span style="
        font-size:9.5px; font-weight:700; padding:3px 9px; border-radius:99px;
        background:${levelColor}15; color:${levelColor}; border:1px solid ${levelColor}35;
        text-transform:uppercase; letter-spacing:0.5px;
      ">${level} level</span>
      <span style="font-size:10.5px; color:#64748b;">Python code for column: ${feature}</span>
    `;
        const pre = document.createElement('pre');
        pre.style.cssText = `
      background:#ffffff; border:1px solid #dfe3ea; border-radius:8px;
      padding:16px 18px; font-size:11.5px; line-height:1.7;
      font-family:ui-monospace,SFMono-Regular,'Cascadia Code',monospace;
      color:#1e293b; overflow-x:auto; margin:0; white-space:pre;
    `;
        pre.textContent = code;
        codeBody.append(badgeRow, pre);
        // Modal footer
        const modalFtr = document.createElement('div');
        modalFtr.style.cssText = `
      display:flex; gap:8px; padding:14px 20px;
      border-top:1px solid #dfe3ea;
      background:#ffffff;
    `;
        const ftrCopy = document.createElement('button');
        ftrCopy.type = 'button';
        ftrCopy.className = 'mm-studio-btn mm-btn-sm';
        ftrCopy.innerHTML = '📋 Copy Code';
        ftrCopy.addEventListener('click', async () => {
            await navigator.clipboard.writeText(code);
            ftrCopy.textContent = 'Copied!';
            setTimeout(() => { ftrCopy.innerHTML = '📋 Copy Code'; }, 1500);
        });
        const ftrInsert = document.createElement('button');
        ftrInsert.type = 'button';
        ftrInsert.className = 'mm-studio-btn mm-btn-sm mm-btn-primary';
        ftrInsert.innerHTML = '📥 Insert into Notebook';
        ftrInsert.addEventListener('click', () => {
            const ok = this._insertCodeBelow(code);
            this._showToast(ok ? '✓ Code inserted into notebook!' : 'Please open a notebook first.');
            overlay.remove();
        });
        const ftrClose = document.createElement('button');
        ftrClose.type = 'button';
        ftrClose.className = 'mm-studio-btn mm-btn-sm';
        ftrClose.innerHTML = 'Close';
        ftrClose.addEventListener('click', () => overlay.remove());
        if (this._canUseCodeAction('copy')) {
            modalFtr.append(ftrCopy, ftrInsert);
        }
        modalFtr.append(ftrClose);
        modal.append(modalHdr, codeBody, modalFtr);
        overlay.appendChild(modal);
        // Close on backdrop click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay)
                overlay.remove();
        });
        document.body.appendChild(overlay);
    }
    _renderLivePreview(container, preview, recommendation, level) {
        var _a, _b, _c, _d, _e, _f, _g;
        container.replaceChildren();
        const title = document.createElement('div');
        title.style.cssText = 'font-weight:750; font-size:14px; margin-bottom:12px; color:#166534;';
        title.textContent = `👁️ Live Preview: ${preview.strategy.replace(/_/g, ' ')} on ${preview.feature}`;
        const beforeStats = preview.before.statistics;
        const afterStats = preview.after.statistics;
        const beforeMiss = (_b = (_a = beforeStats === null || beforeStats === void 0 ? void 0 : beforeStats.missing_count) !== null && _a !== void 0 ? _a : preview.before.missing_count) !== null && _b !== void 0 ? _b : 0;
        const afterMiss = (_d = (_c = afterStats === null || afterStats === void 0 ? void 0 : afterStats.missing_count) !== null && _c !== void 0 ? _c : preview.after.missing_count) !== null && _d !== void 0 ? _d : 0;
        const beforeMean = (_e = beforeStats === null || beforeStats === void 0 ? void 0 : beforeStats.mean) !== null && _e !== void 0 ? _e : preview.before.mean;
        const afterMean = (_f = afterStats === null || afterStats === void 0 ? void 0 : afterStats.mean) !== null && _f !== void 0 ? _f : preview.after.mean;
        const beforeSample = preview.before.sample || preview.before.sample_values || [];
        const afterSample = preview.after.sample || preview.after.sample_values || [];
        const grid = document.createElement('div');
        grid.className = 'mm-studio-stats-grid';
        grid.innerHTML = `
      <div class="mm-stat-box">
        <div class="mm-stat-val" style="color:#dc2626;">${beforeMiss}</div>
        <div class="mm-stat-lbl">Missing Before</div>
      </div>
      <div class="mm-stat-box">
        <div class="mm-stat-val" style="color:#059669;">${afterMiss}</div>
        <div class="mm-stat-lbl">Missing After</div>
      </div>
      ${beforeMean !== undefined ? `
        <div class="mm-stat-box">
          <div class="mm-stat-val">${typeof beforeMean === 'number' ? beforeMean.toFixed(2) : beforeMean}</div>
          <div class="mm-stat-lbl">Mean Before</div>
        </div>
      ` : ''}
      ${afterMean !== undefined ? `
        <div class="mm-stat-box">
          <div class="mm-stat-val">${typeof afterMean === 'number' ? afterMean.toFixed(2) : afterMean}</div>
          <div class="mm-stat-lbl">Mean After</div>
        </div>
      ` : ''}
      ${(beforeStats === null || beforeStats === void 0 ? void 0 : beforeStats.skewness) !== undefined ? `
        <div class="mm-stat-box">
          <div class="mm-stat-val">${beforeStats.skewness === null ? '—' : beforeStats.skewness.toFixed(2)}</div>
          <div class="mm-stat-lbl">Skewness Before</div>
        </div>
      ` : ''}
      ${(afterStats === null || afterStats === void 0 ? void 0 : afterStats.skewness) !== undefined ? `
        <div class="mm-stat-box">
          <div class="mm-stat-val">${afterStats.skewness === null ? '—' : afterStats.skewness.toFixed(2)}</div>
          <div class="mm-stat-lbl">Skewness After</div>
        </div>
      ` : ''}
    `;
        if ((beforeStats === null || beforeStats === void 0 ? void 0 : beforeStats.category_distribution) && (afterStats === null || afterStats === void 0 ? void 0 : afterStats.category_distribution)) {
            const beforeDistribution = beforeStats.category_distribution;
            const afterDistribution = afterStats.category_distribution;
            const categories = beforeDistribution.categories;
            const chartTitle = document.createElement('div');
            chartTitle.style.cssText = 'font-size:13px;font-weight:750;margin:14px 0 7px;color:#173b2b;';
            chartTitle.textContent = 'Categorical histogram — frequency before vs after';
            const rowHeight = 32;
            const chartHeight = Math.max(130, 38 + categories.length * rowHeight);
            const chart = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            chart.setAttribute('viewBox', `0 0 360 ${chartHeight}`);
            chart.setAttribute('role', 'img');
            chart.setAttribute('aria-label', `Categorical histogram for ${preview.feature} before and after ${preview.strategy} imputation`);
            chart.style.cssText = 'width:100%;height:auto;max-height:260px;background:#fff;border:1px solid #e2e8f0;border-radius:8px;';
            const addSvg = (name, attrs, text) => {
                const element = document.createElementNS('http://www.w3.org/2000/svg', name);
                Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, value));
                if (text)
                    element.textContent = text;
                chart.appendChild(element);
                return element;
            };
            addSvg('rect', { x: '126', y: '9', width: '9', height: '9', rx: '2', fill: '#6366f1' });
            addSvg('text', { x: '140', y: '17', fill: '#475569', 'font-size': '10' }, `Before (n=${beforeDistribution.sample_count})`);
            addSvg('rect', { x: '244', y: '9', width: '9', height: '9', rx: '2', fill: '#10b981' });
            addSvg('text', { x: '258', y: '17', fill: '#475569', 'font-size': '10' }, `After (n=${afterDistribution.sample_count})`);
            const maxPercentage = Math.max(1, ...beforeDistribution.percentages, ...afterDistribution.percentages);
            const barStart = 128;
            const barMaxWidth = 164;
            const label = (value) => value.length > 17 ? `${value.slice(0, 16)}…` : value;
            categories.forEach((category, index) => {
                const y = 27 + index * rowHeight;
                addSvg('text', { x: '8', y: String(y + 15), fill: '#334155', 'font-size': '10' }, label(category));
                addSvg('rect', { x: String(barStart), y: String(y + 1), width: String(barMaxWidth), height: '8', rx: '3', fill: '#eef2ff' });
                addSvg('rect', { x: String(barStart), y: String(y + 12), width: String(barMaxWidth), height: '8', rx: '3', fill: '#ecfdf5' });
                const beforeWidth = beforeDistribution.percentages[index] / maxPercentage * barMaxWidth;
                const afterWidth = afterDistribution.percentages[index] / maxPercentage * barMaxWidth;
                const beforeBar = addSvg('rect', { x: String(barStart), y: String(y + 1), width: beforeWidth.toFixed(2), height: '8', rx: '3', fill: '#6366f1' });
                beforeBar.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'title')).textContent =
                    `Before · ${beforeDistribution.counts[index]} rows (${beforeDistribution.percentages[index]}%)`;
                const afterBar = addSvg('rect', { x: String(barStart), y: String(y + 12), width: afterWidth.toFixed(2), height: '8', rx: '3', fill: '#10b981' });
                afterBar.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'title')).textContent =
                    `After · ${afterDistribution.counts[index]} rows (${afterDistribution.percentages[index]}%)`;
                addSvg('text', { x: String(barStart + barMaxWidth + 5), y: String(y + 8), fill: '#64748b', 'font-size': '9' }, `${beforeDistribution.percentages[index].toFixed(1)}%`);
                addSvg('text', { x: String(barStart + barMaxWidth + 5), y: String(y + 19), fill: '#64748b', 'font-size': '9' }, `${afterDistribution.percentages[index].toFixed(1)}%`);
            });
            const chartNote = document.createElement('div');
            chartNote.className = 'mm-prep-preview-note';
            chartNote.textContent = categories.includes('Other (remaining)')
                ? 'Bars compare category percentages on a shared scale. The eight most common categories are shown; the remaining categories are grouped as Other.'
                : 'Bars compare category percentages on a shared scale. Percentages use each side’s non-missing row count.';
            const whyBox = document.createElement('div');
            whyBox.className = 'mm-prep-preview-rationale';
            const whyHeading = document.createElement('strong');
            whyHeading.textContent = `✅ Why this ${level} choice? `;
            const whyText = document.createElement('span');
            whyText.textContent = recommendation.why || recommendation.explanation;
            whyBox.append(whyHeading, whyText);
            if (recommendation.imputation_reason) {
                const methodReason = document.createElement('div');
                methodReason.style.cssText = 'margin-top:7px;';
                methodReason.textContent = `Method rationale: ${recommendation.imputation_reason}`;
                whyBox.appendChild(methodReason);
            }
            const previewExplanation = document.createElement('div');
            previewExplanation.className = 'mm-prep-preview-note';
            previewExplanation.textContent = preview.details || preview.explanation || '';
            container.append(title, grid, chartTitle, chart, chartNote, whyBox, previewExplanation);
        }
        else if ((beforeStats === null || beforeStats === void 0 ? void 0 : beforeStats.pdf) && (afterStats === null || afterStats === void 0 ? void 0 : afterStats.pdf)) {
            const chartTitle = document.createElement('div');
            chartTitle.style.cssText = 'font-size:13px;font-weight:750;margin:14px 0 7px;color:#173b2b;';
            chartTitle.textContent = 'PDF — empirical probability density (shared bins)';
            const chart = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            chart.setAttribute('viewBox', '0 0 360 176');
            chart.setAttribute('role', 'img');
            chart.setAttribute('aria-label', `Probability density plot for ${preview.feature} before and after ${preview.strategy} imputation`);
            chart.style.cssText = 'width:100%;height:auto;max-height:190px;background:#fff;border:1px solid #e2e8f0;border-radius:8px;';
            const edges = beforeStats.pdf.edges;
            const beforeDensity = beforeStats.pdf.density;
            const afterDensity = afterStats.pdf.density;
            const binCount = Math.min(beforeDensity.length, afterDensity.length, Math.max(0, edges.length - 1));
            const maxDensity = Math.max(0, ...beforeDensity.slice(0, binCount), ...afterDensity.slice(0, binCount));
            const left = 42, right = 8, top = 24, plotHeight = 112;
            const plotWidth = 360 - left - right;
            const addSvg = (name, attrs, text) => {
                const element = document.createElementNS('http://www.w3.org/2000/svg', name);
                Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, value));
                if (text)
                    element.textContent = text;
                chart.appendChild(element);
                return element;
            };
            addSvg('line', { x1: String(left), y1: String(top + plotHeight), x2: String(360 - right), y2: String(top + plotHeight), stroke: '#94a3b8', 'stroke-width': '1' });
            addSvg('line', { x1: String(left), y1: String(top), x2: String(left), y2: String(top + plotHeight), stroke: '#94a3b8', 'stroke-width': '1' });
            if (maxDensity > 0 && binCount > 0) {
                const groupWidth = plotWidth / binCount;
                const barWidth = Math.max(2, groupWidth * 0.39);
                for (let index = 0; index < binCount; index += 1) {
                    const x = left + index * groupWidth + groupWidth * 0.08;
                    const beforeHeight = beforeDensity[index] / maxDensity * plotHeight;
                    const afterHeight = afterDensity[index] / maxDensity * plotHeight;
                    const beforeRect = addSvg('rect', {
                        x: x.toFixed(2), y: (top + plotHeight - beforeHeight).toFixed(2),
                        width: barWidth.toFixed(2), height: Math.max(0.5, beforeHeight).toFixed(2),
                        rx: '1', fill: '#6366f1', opacity: '0.78'
                    });
                    beforeRect.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'title')).textContent =
                        `Before · ${beforeStats.pdf.counts[index]} rows · density ${beforeDensity[index]}`;
                    const afterRect = addSvg('rect', {
                        x: (x + barWidth + groupWidth * 0.06).toFixed(2), y: (top + plotHeight - afterHeight).toFixed(2),
                        width: barWidth.toFixed(2), height: Math.max(0.5, afterHeight).toFixed(2),
                        rx: '1', fill: '#10b981', opacity: '0.78'
                    });
                    afterRect.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'title')).textContent =
                        `After · ${afterStats.pdf.counts[index]} rows · density ${afterDensity[index]}`;
                }
            }
            addSvg('rect', { x: '48', y: '7', width: '9', height: '9', rx: '2', fill: '#6366f1' });
            addSvg('text', { x: '61', y: '15', fill: '#475569', 'font-size': '9' }, `Before (n=${beforeStats.pdf.sample_count})`);
            addSvg('rect', { x: '166', y: '7', width: '9', height: '9', rx: '2', fill: '#10b981' });
            addSvg('text', { x: '179', y: '15', fill: '#475569', 'font-size': '9' }, `After (n=${afterStats.pdf.sample_count})`);
            addSvg('text', { x: String(left), y: '169', fill: '#64748b', 'font-size': '9' }, String(edges[0]));
            addSvg('text', { x: String(360 - right), y: '169', fill: '#64748b', 'font-size': '9', 'text-anchor': 'end' }, String(edges[edges.length - 1]));
            const chartNote = document.createElement('div');
            chartNote.className = 'mm-prep-preview-note';
            chartNote.textContent = 'This empirical PDF is a density-normalized histogram: bar area represents probability, and total area is approximately 1.';
            let kdeTitle = null;
            let kdeChart = null;
            let kdeNote = null;
            if (recommendation.numeric_kind === 'discrete') {
                kdeNote = document.createElement('div');
                kdeNote.className = 'mm-prep-preview-note';
                kdeNote.textContent = 'KDE is omitted because this is a discrete/count-like feature; smoothing it would imply values between valid counts. The PDF above shows its empirical distribution.';
            }
            else if (beforeStats.kde && afterStats.kde) {
                kdeTitle = document.createElement('div');
                kdeTitle.style.cssText = 'font-size:13px;font-weight:750;margin:14px 0 7px;color:#173b2b;';
                kdeTitle.textContent = 'KDE — smoothed density estimate (before vs after)';
                kdeChart = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                kdeChart.setAttribute('viewBox', '0 0 360 176');
                kdeChart.setAttribute('role', 'img');
                kdeChart.setAttribute('aria-label', `Gaussian KDE plot for ${preview.feature} before and after ${preview.strategy} imputation`);
                kdeChart.style.cssText = 'width:100%;height:auto;max-height:190px;background:#fff;border:1px solid #e2e8f0;border-radius:8px;';
                const kdeX = beforeStats.kde.x;
                const beforeKde = beforeStats.kde.density;
                const afterKde = afterStats.kde.density;
                const pointCount = Math.min(kdeX.length, beforeKde.length, afterKde.length);
                const maxKde = Math.max(0, ...beforeKde.slice(0, pointCount), ...afterKde.slice(0, pointCount));
                const kdeLeft = 42, kdeRight = 8, kdeTop = 24, kdeHeight = 112;
                const kdeWidth = 360 - kdeLeft - kdeRight;
                const addKdeSvg = (name, attrs, text) => {
                    const element = document.createElementNS('http://www.w3.org/2000/svg', name);
                    Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, value));
                    if (text)
                        element.textContent = text;
                    kdeChart === null || kdeChart === void 0 ? void 0 : kdeChart.appendChild(element);
                    return element;
                };
                addKdeSvg('line', { x1: String(kdeLeft), y1: String(kdeTop + kdeHeight), x2: String(360 - kdeRight), y2: String(kdeTop + kdeHeight), stroke: '#94a3b8', 'stroke-width': '1' });
                addKdeSvg('line', { x1: String(kdeLeft), y1: String(kdeTop), x2: String(kdeLeft), y2: String(kdeTop + kdeHeight), stroke: '#94a3b8', 'stroke-width': '1' });
                if (maxKde > 0 && pointCount > 1) {
                    const makePath = (density) => density.slice(0, pointCount).map((value, index) => {
                        const x = kdeLeft + (index / (pointCount - 1)) * kdeWidth;
                        const y = kdeTop + kdeHeight - (value / maxKde) * kdeHeight;
                        return `${index === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
                    }).join(' ');
                    addKdeSvg('path', { d: makePath(beforeKde), fill: 'none', stroke: '#6366f1', 'stroke-width': '2.5', 'stroke-linejoin': 'round', 'stroke-linecap': 'round' });
                    addKdeSvg('path', { d: makePath(afterKde), fill: 'none', stroke: '#10b981', 'stroke-width': '2.5', 'stroke-linejoin': 'round', 'stroke-linecap': 'round' });
                }
                addKdeSvg('line', { x1: '48', y1: '12', x2: '58', y2: '12', stroke: '#6366f1', 'stroke-width': '3' });
                addKdeSvg('text', { x: '62', y: '15', fill: '#475569', 'font-size': '9' }, `Before (n=${beforeStats.kde.sample_count})`);
                addKdeSvg('line', { x1: '166', y1: '12', x2: '176', y2: '12', stroke: '#10b981', 'stroke-width': '3' });
                addKdeSvg('text', { x: '180', y: '15', fill: '#475569', 'font-size': '9' }, `After (n=${afterStats.kde.sample_count})`);
                addKdeSvg('text', { x: String(kdeLeft), y: '169', fill: '#64748b', 'font-size': '9' }, String(kdeX[0]));
                addKdeSvg('text', { x: String(360 - kdeRight), y: '169', fill: '#64748b', 'font-size': '9', 'text-anchor': 'end' }, String(kdeX[pointCount - 1]));
                kdeNote = document.createElement('div');
                kdeNote.className = 'mm-prep-preview-note';
                kdeNote.textContent = `Gaussian KDE with shared bandwidth ${(_g = beforeStats.kde.bandwidth) !== null && _g !== void 0 ? _g : '—'}; this is a smoothed estimate, while the PDF above shows binned empirical density.`;
            }
            const whyBox = document.createElement('div');
            whyBox.className = 'mm-prep-preview-rationale';
            const whyHeading = document.createElement('strong');
            whyHeading.textContent = `✅ Why this ${level} choice? `;
            const whyText = document.createElement('span');
            whyText.textContent = recommendation.why || recommendation.explanation;
            whyBox.append(whyHeading, whyText);
            if (recommendation.imputation_reason) {
                const methodReason = document.createElement('div');
                methodReason.style.cssText = 'margin-top:7px;';
                methodReason.textContent = `Method rationale: ${recommendation.imputation_reason}`;
                whyBox.appendChild(methodReason);
            }
            const previewExplanation = document.createElement('div');
            previewExplanation.className = 'mm-prep-preview-note';
            previewExplanation.textContent = preview.details || preview.explanation || '';
            container.append(title, grid, chartTitle, chart, chartNote);
            if (kdeTitle && kdeChart && kdeNote)
                container.append(kdeTitle, kdeChart, kdeNote);
            else if (kdeNote)
                container.append(kdeNote);
            container.append(whyBox, previewExplanation);
        }
        // Sample Values Comparison
        const sampleBox = document.createElement('div');
        sampleBox.className = 'mm-prep-sample-box';
        const sampleTitle = document.createElement('div');
        sampleTitle.style.cssText = 'font-size:10px;font-weight:600;margin-bottom:4px;opacity:.8;';
        sampleTitle.textContent = 'Sample values (before vs after):';
        const sampleColumns = document.createElement('div');
        sampleColumns.style.cssText = 'display:flex;gap:10px;font-family:monospace;font-size:10px;';
        const beforeColumn = document.createElement('div');
        beforeColumn.style.flex = '1';
        const beforeLabel = document.createElement('div');
        beforeLabel.style.cssText = 'opacity:.6;margin-bottom:2px;';
        beforeLabel.textContent = 'Before:';
        const beforeValues = document.createElement('div');
        beforeValues.style.color = '#dc2626';
        beforeValues.textContent = beforeSample.slice(0, 5).map((v) => v === null ? 'NaN' : typeof v === 'number' ? v.toFixed(1) : String(v)).join(', ');
        beforeColumn.append(beforeLabel, beforeValues);
        const afterColumn = document.createElement('div');
        afterColumn.style.flex = '1';
        const afterLabel = document.createElement('div');
        afterLabel.style.cssText = 'opacity:.6;margin-bottom:2px;';
        afterLabel.textContent = 'After:';
        const afterValues = document.createElement('div');
        afterValues.style.color = '#059669';
        afterValues.textContent = afterSample.slice(0, 5).map((v) => v === null ? 'NaN' : typeof v === 'number' ? v.toFixed(1) : String(v)).join(', ');
        afterColumn.append(afterLabel, afterValues);
        sampleColumns.append(beforeColumn, afterColumn);
        sampleBox.append(sampleTitle, sampleColumns);
        if (!((beforeStats === null || beforeStats === void 0 ? void 0 : beforeStats.pdf) && (afterStats === null || afterStats === void 0 ? void 0 : afterStats.pdf))) {
            const reason = document.createElement('div');
            reason.className = 'mm-prep-text';
            reason.textContent = recommendation.why || recommendation.explanation;
            container.append(title, grid, reason, sampleBox);
        }
        else {
            container.appendChild(sampleBox);
        }
    }
    // ═════════════════════════════════════════════════════════════════
    // VIEW 4.5: 🤖 MODEL ADVISOR
    // ═════════════════════════════════════════════════════════════════
    _renderModelAdvisorTab() {
        var _a;
        if (!this._dataset || !this._dataset.supported) {
            this._contentArea.innerHTML = '<div class="mm-studio-empty">Analyze a dataset first to get model recommendations.</div>';
            return;
        }
        this._contentArea.replaceChildren();
        const frag = document.createDocumentFragment();
        // ── Header ──
        const hdr = document.createElement('div');
        hdr.className = 'mm-studio-section';
        hdr.innerHTML = `
      <div class="mm-studio-sec-title"><span>🤖</span> Intelligent Model Advisor</div>
      <div class="mm-studio-sec-sub">
        Choose the target you want to predict. ModelMind screens model candidates,
        then compares the finalists with cross-validation. Each model's Why section
        shows the measured evidence, how it fits the data, and what the score cannot prove.
      </div>
    `;
        // ── Target column selector ──
        const targetRow = document.createElement('div');
        targetRow.style.cssText = 'display:flex; align-items:center; gap:10px; margin-top:10px;';
        const targetLbl = document.createElement('span');
        targetLbl.style.cssText = 'font-size:11px; opacity:.7; font-weight:600;';
        targetLbl.textContent = '🎯 Target Column:';
        const targetSel = document.createElement('select');
        targetSel.className = 'mm-studio-select mm-select-sm';
        targetSel.style.maxWidth = '200px';
        ((_a = this._dataset.column_names) !== null && _a !== void 0 ? _a : []).forEach(col => {
            const opt = document.createElement('option');
            opt.value = col;
            opt.textContent = col;
            if (col === this._targetCol || col === this._dataset.column_names[this._dataset.column_names.length - 1])
                opt.selected = true;
            targetSel.appendChild(opt);
        });
        const runBtn = document.createElement('button');
        runBtn.type = 'button';
        runBtn.className = 'mm-studio-btn mm-btn-sm mm-btn-accent';
        runBtn.innerHTML = '🚀 Get Recommendations';
        targetRow.append(targetLbl, targetSel, runBtn);
        targetSel.addEventListener('change', () => {
            this._targetCol = targetSel.value;
        });
        hdr.appendChild(targetRow);
        frag.appendChild(hdr);
        // ── Results container ──
        // Phase 11: opt-in empirical evaluation, separate from heuristic ranking.
        const evaluationPanel = document.createElement('div');
        evaluationPanel.style.cssText =
            'background:#fff;border:1px solid #c7d2fe;border-radius:12px;' +
                'padding:14px;margin-bottom:16px;';
        const evaluationTitle = document.createElement('div');
        evaluationTitle.style.cssText =
            'font-size:14px;font-weight:800;color:#1e293b;margin-bottom:5px;';
        evaluationTitle.textContent = 'Measured Model Performance';
        const evaluationDescription = document.createElement('div');
        evaluationDescription.style.cssText =
            'font-size:11px;color:#64748b;line-height:1.6;margin-bottom:10px;';
        evaluationDescription.textContent =
            'Run real 3-fold cross-validation on your selected dataset. ' +
                'The score is measured on validation folds; the top-ranked model is not ' +
                'a guarantee for new data, and screened-out models are not fully compared.';
        const evaluationControls = document.createElement('div');
        evaluationControls.style.cssText =
            'display:flex;gap:8px;flex-wrap:wrap;align-items:center;';
        const evaluationButton = document.createElement('button');
        evaluationButton.type = 'button';
        evaluationButton.className = 'mm-studio-btn mm-btn-sm mm-btn-accent';
        evaluationButton.textContent = 'Evaluate Models on My Dataset';
        const evaluationCancel = document.createElement('button');
        evaluationCancel.type = 'button';
        evaluationCancel.className = 'mm-studio-btn mm-btn-sm';
        evaluationCancel.textContent = 'Cancel Evaluation';
        evaluationCancel.disabled = true;
        const evaluationStatus = document.createElement('div');
        evaluationStatus.style.cssText =
            'font-size:11px;color:#475569;margin-top:10px;';
        evaluationStatus.textContent =
            'Evaluation has not started.';
        const evaluationResults = document.createElement('div');
        evaluationResults.style.cssText = 'margin-top:12px;';
        evaluationControls.append(evaluationButton, evaluationCancel);
        evaluationPanel.append(evaluationTitle, evaluationDescription, evaluationControls, evaluationStatus, evaluationResults);
        frag.appendChild(evaluationPanel);
        let activeEvaluationJob = null;
        let evaluationBusy = false;
        const evaluationSettings = this._app.serviceManager.serverSettings;
        const setEvaluationBusy = (busy) => {
            evaluationBusy = busy;
            evaluationButton.disabled = busy;
            evaluationCancel.disabled = !busy || !activeEvaluationJob;
        };
        const showMeasuredResults = (jobResult, evaluationJobId, datasetPath, targetColumn) => {
            var _a, _b, _c, _d, _e, _f, _g;
            evaluationResults.replaceChildren();
            const evaluation = jobResult === null || jobResult === void 0 ? void 0 : jobResult.empirical_evaluation;
            if (!evaluation || evaluation.success !== true) {
                evaluationStatus.textContent =
                    'Evaluation did not return a successful comparison.';
                return;
            }
            const metric = String((_a = evaluation.metric) !== null && _a !== void 0 ? _a : 'score');
            const higherIsBetter = evaluation.higher_is_better === true;
            const heading = document.createElement('div');
            heading.style.cssText =
                'font-size:12px;font-weight:700;margin-bottom:8px;';
            heading.textContent =
                `Best measured model: ${String((_b = evaluation.recommended_model) !== null && _b !== void 0 ? _b : 'Unknown')}` +
                    ` | ${metric}: ${String((_c = evaluation.recommended_score) !== null && _c !== void 0 ? _c : 'N/A')}`;
            const explanation = document.createElement('div');
            explanation.style.cssText =
                'font-size:10px;color:#64748b;margin-bottom:10px;';
            explanation.textContent =
                `${String((_d = evaluation.cv_folds) !== null && _d !== void 0 ? _d : 3)}-fold cross-validation. ` +
                    (higherIsBetter
                        ? 'Higher scores are better.'
                        : 'Lower scores are better.') +
                    ' Results depend on this dataset and are not guarantees.';
            const table = document.createElement('table');
            table.style.cssText =
                'width:100%;border-collapse:collapse;font-size:11px;';
            const header = document.createElement('tr');
            for (const name of [
                'Model', 'Status', 'Mean score', 'Std. dev.', 'Scaler'
            ]) {
                const cell = document.createElement('th');
                cell.textContent = name;
                cell.style.cssText =
                    'padding:8px;border-bottom:1px solid #e2e8f0;' +
                        'text-align:left;background:#f8fafc;';
                header.appendChild(cell);
            }
            table.appendChild(header);
            const ranking = Array.isArray(evaluation.ranking)
                ? evaluation.ranking
                : [];
            for (const item of ranking) {
                const row = document.createElement('tr');
                const score = typeof item.mean_score === 'number'
                    ? item.mean_score.toFixed(4)
                    : 'N/A';
                const deviation = typeof item.std_score === 'number'
                    ? item.std_score.toFixed(4)
                    : 'N/A';
                for (const value of [
                    (_e = item.model) !== null && _e !== void 0 ? _e : 'Unknown',
                    (_f = item.status) !== null && _f !== void 0 ? _f : 'Unknown',
                    score,
                    deviation,
                    (_g = item.scaler) !== null && _g !== void 0 ? _g : 'None'
                ]) {
                    const cell = document.createElement('td');
                    cell.textContent = String(value);
                    cell.style.cssText =
                        'padding:8px;border-bottom:1px solid #e2e8f0;';
                    row.appendChild(cell);
                }
                table.appendChild(row);
            }
            evaluationResults.append(heading, explanation, table);
            if (Array.isArray(evaluation.warnings) &&
                evaluation.warnings.length > 0) {
                const warning = document.createElement('div');
                warning.style.cssText =
                    'font-size:10px;color:#92400e;margin-top:10px;';
                warning.textContent = evaluation.warnings
                    .filter((item) => typeof item === 'string')
                    .join(' ');
                evaluationResults.appendChild(warning);
            }
            const automl = jobResult === null || jobResult === void 0 ? void 0 : jobResult.automl_recommendations;
            if ((automl === null || automl === void 0 ? void 0 : automl.success) === true &&
                Array.isArray(automl.recommendations) &&
                evaluation.success === true) {
                this._renderFastTuneTopFive(evaluationResults, evaluationJobId, datasetPath, targetColumn, automl, evaluation);
            }
        };
        evaluationCancel.addEventListener('click', async () => {
            if (!activeEvaluationJob) {
                return;
            }
            evaluationCancel.disabled = true;
            try {
                await (0,_request__rspack_import_3.requestAPI)(`api/dataset/evaluation-jobs/${activeEvaluationJob}/cancel`, evaluationSettings, { method: 'POST' });
                evaluationStatus.textContent =
                    'Cancellation requested. Waiting for worker to stop...';
            }
            catch (error) {
                evaluationStatus.textContent =
                    `Cancellation request failed: ${String(error)}`;
                evaluationCancel.disabled = false;
            }
        });
        evaluationButton.addEventListener('click', async () => {
            var _a, _b;
            // Do not start two competing evaluations in one panel.
            // The main AutoML loader disables runBtn while active.
            if (evaluationBusy || runBtn.disabled) {
                return;
            }
            const selectedTarget = targetSel.value;
            const selectedPath = this._currentPath;
            if (!selectedPath || !selectedTarget) {
                evaluationStatus.textContent =
                    'Select a dataset and target column first.';
                return;
            }
            // Every result belongs to the exact dataset, target
            // and panel from which its evaluation started.
            const isEvaluationCurrent = () => {
                return (evaluationPanel.isConnected &&
                    this._activeTab === 'model-advisor' &&
                    this._currentPath === selectedPath &&
                    targetSel.value === selectedTarget);
            };
            evaluationResults.replaceChildren();
            activeEvaluationJob = null;
            setEvaluationBusy(true);
            runBtn.disabled = true;
            evaluationStatus.textContent =
                'Submitting measured model evaluation...';
            let submittedJobId = null;
            const cancelObsoleteJob = async () => {
                if (!submittedJobId) {
                    return;
                }
                try {
                    await (0,_request__rspack_import_3.requestAPI)(`api/dataset/evaluation-jobs/${submittedJobId}/cancel`, evaluationSettings, { method: 'POST' });
                }
                catch (_a) {
                    // The job may already be finished or no longer
                    // available. The server owns job timeout/cleanup.
                }
            };
            try {
                const submitted = await (0,_request__rspack_import_3.requestAPI)('api/dataset/evaluation-jobs', evaluationSettings, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        file_path: selectedPath,
                        target_col: selectedTarget,
                        cv_folds: 3,
                        evaluate_scalers: false
                    })
                });
                if (typeof submitted.job_id !== 'string' ||
                    !submitted.job_id) {
                    throw new Error('Evaluation job ID was not returned.');
                }
                submittedJobId = submitted.job_id;
                activeEvaluationJob = submitted.job_id;
                // The panel might have changed while the
                // submission request was in flight.
                if (!isEvaluationCurrent()) {
                    await cancelObsoleteJob();
                    return;
                }
                evaluationCancel.disabled = false;
                let finished = false;
                for (let attempt = 0; attempt < 180; attempt++) {
                    // Check before sending the next HTTP request.
                    if (!isEvaluationCurrent()) {
                        await cancelObsoleteJob();
                        return;
                    }
                    const job = await (0,_request__rspack_import_3.requestAPI)(`api/dataset/evaluation-jobs/${submitted.job_id}`, evaluationSettings);
                    // A dataset, target or navigation change may have
                    // happened while the HTTP request was in flight.
                    if (!isEvaluationCurrent()) {
                        await cancelObsoleteJob();
                        return;
                    }
                    const status = String((_a = job.status) !== null && _a !== void 0 ? _a : 'unknown');
                    evaluationStatus.textContent =
                        `Dataset target: ${selectedTarget} | Job: ${status}`;
                    if (status === 'completed') {
                        finished = true;
                        // Results are rendered only for the original
                        // dataset, target and active Model Advisor panel.
                        showMeasuredResults(job.result, submitted.job_id, selectedPath, selectedTarget);
                        break;
                    }
                    if (['failed', 'cancelled', 'timed_out'].includes(status)) {
                        finished = true;
                        evaluationStatus.textContent =
                            `Evaluation ${status}: ${String((_b = job.error) !== null && _b !== void 0 ? _b : '')}`;
                        break;
                    }
                    await new Promise(resolve => {
                        setTimeout(resolve, 1000);
                    });
                }
                if (!finished && isEvaluationCurrent()) {
                    evaluationStatus.textContent =
                        'Still waiting. The evaluation may continue on the server.';
                }
            }
            catch (error) {
                if (isEvaluationCurrent()) {
                    evaluationStatus.textContent =
                        `Evaluation error: ${String(error)}`;
                }
            }
            finally {
                activeEvaluationJob = null;
                setEvaluationBusy(false);
                runBtn.disabled = false;
            }
        });
        const resultsContainer = document.createElement('div');
        frag.appendChild(resultsContainer);
        this._contentArea.appendChild(frag);
        let recommendationBusy = false;
        const loadRecommendations = async () => {
            var _a, _b;
            if (recommendationBusy) {
                return;
            }
            const chosenTarget = targetSel.value;
            const chosenPath = this._currentPath;
            // A recommendation belongs to one dataset and target.
            // Never display it for a different selection or panel.
            const isRequestCurrent = () => {
                return (resultsContainer.isConnected &&
                    this._activeTab === 'model-advisor' &&
                    this._currentPath === chosenPath &&
                    targetSel.value === chosenTarget);
            };
            if (!chosenTarget || !chosenPath) {
                resultsContainer.textContent =
                    'Select a dataset and target column first.';
                return;
            }
            if (evaluationBusy) {
                resultsContainer.textContent =
                    'An evaluation is already running in this panel. ' +
                        'Wait for it to finish before requesting recommendations.';
                return;
            }
            recommendationBusy = true;
            runBtn.disabled = true;
            resultsContainer.replaceChildren();
            const statusEl = document.createElement('div');
            statusEl.className = 'mm-studio-loading';
            statusEl.textContent =
                'Starting measured AutoML evaluation...';
            const cancelBtn = document.createElement('button');
            cancelBtn.type = 'button';
            cancelBtn.className = 'mm-studio-btn mm-btn-sm';
            cancelBtn.textContent = 'Cancel AutoML';
            cancelBtn.disabled = true;
            resultsContainer.append(statusEl, cancelBtn);
            let jobId = null;
            let cancellationRequested = false;
            cancelBtn.addEventListener('click', async () => {
                if (!jobId || cancellationRequested) {
                    return;
                }
                cancellationRequested = true;
                cancelBtn.disabled = true;
                statusEl.textContent = 'Requesting cancellation...';
                try {
                    await (0,_request__rspack_import_3.requestAPI)(`api/dataset/evaluation-jobs/${jobId}/cancel`, this._app.serviceManager.serverSettings, { method: 'POST' });
                }
                catch (error) {
                    cancellationRequested = false;
                    cancelBtn.disabled = false;
                    statusEl.textContent =
                        `Cancellation request failed: ${String(error)}`;
                }
            });
            try {
                const settings = this._app.serviceManager.serverSettings;
                const submitted = await (0,_request__rspack_import_3.requestAPI)('api/dataset/evaluation-jobs', settings, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        file_path: chosenPath,
                        target_col: chosenTarget,
                        cv_folds: 3,
                        evaluate_scalers: false
                    })
                });
                if (typeof submitted.job_id !== 'string') {
                    throw new Error('Evaluation job ID is missing.');
                }
                jobId = submitted.job_id;
                cancelBtn.disabled = false;
                if (!isRequestCurrent()) {
                    try {
                        await (0,_request__rspack_import_3.requestAPI)(`api/dataset/evaluation-jobs/${jobId}/cancel`, settings, { method: 'POST' });
                    }
                    catch (_c) {
                        // The server will still enforce its job timeout.
                    }
                    return;
                }
                let finished = false;
                for (let attempt = 0; attempt < 180; attempt++) {
                    if (!isRequestCurrent()) {
                        try {
                            await (0,_request__rspack_import_3.requestAPI)(`api/dataset/evaluation-jobs/${jobId}/cancel`, settings, { method: 'POST' });
                        }
                        catch (_d) {
                            // Panel has closed; the server still owns job cleanup.
                        }
                        return;
                    }
                    const job = await (0,_request__rspack_import_3.requestAPI)(`api/dataset/evaluation-jobs/${jobId}`, settings);
                    // Ignore results belonging to an obsolete selection.
                    if (!isRequestCurrent()) {
                        try {
                            await (0,_request__rspack_import_3.requestAPI)(`api/dataset/evaluation-jobs/${jobId}/cancel`, settings, { method: 'POST' });
                        }
                        catch (_e) {
                            // A completed job cannot necessarily be cancelled.
                        }
                        return;
                    }
                    const status = String((_a = job.status) !== null && _a !== void 0 ? _a : 'unknown');
                    statusEl.textContent =
                        `AutoML: ${status} — comparing regression or ` +
                            `classification algorithms using cross-validation.`;
                    if (status === 'completed') {
                        finished = true;
                        const original = job.result;
                        const automl = original === null || original === void 0 ? void 0 : original.automl_recommendations;
                        if (!(original === null || original === void 0 ? void 0 : original.handled) ||
                            !(automl === null || automl === void 0 ? void 0 : automl.success) ||
                            !Array.isArray(automl.recommendations) ||
                            automl.recommendations.length === 0) {
                            throw new Error('Completed evaluation has no valid AutoML recommendations.');
                        }
                        const models = automl.recommendations.map((item, index) => {
                            var _a, _b, _c, _d;
                            const rank = Number.isInteger(item.rank)
                                ? item.rank
                                : index + 1;
                            const comparisonItem = rank === 1
                                ? automl.recommendations.find((candidate) => candidate.rank === 2)
                                : automl.recommendations.find((candidate) => candidate.rank === 1);
                            const explanation = (0,_model_advisor_explanations__rspack_import_5.buildMeasuredModelExplanation)({
                                name: String(item.name),
                                task: automl.task,
                                metric: String((_b = (_a = item.metric) !== null && _a !== void 0 ? _a : automl.metric) !== null && _b !== void 0 ? _b : 'CV score'),
                                score: item.measured_score,
                                scoreStd: item.std_score,
                                comparisonName: comparisonItem === null || comparisonItem === void 0 ? void 0 : comparisonItem.name,
                                comparisonScore: comparisonItem === null || comparisonItem === void 0 ? void 0 : comparisonItem.measured_score,
                                comparisonStd: comparisonItem === null || comparisonItem === void 0 ? void 0 : comparisonItem.std_score,
                                rank,
                                finalistCount: automl.recommendations.length,
                                candidateCount: automl.candidate_count,
                                cvFolds: (_c = item.cv_folds) !== null && _c !== void 0 ? _c : automl.cv_folds,
                                screeningFolds: automl.screening_folds,
                                screeningRows: automl.screening_rows,
                                rowsAvailable: automl.rows_available,
                                rowsTotal: automl.rows_total,
                                rowsEvaluated: automl.rows_evaluated,
                                rowsExcludedMissingTarget: automl.rows_excluded_missing_target,
                                targetColumn: (_d = automl.target_column) !== null && _d !== void 0 ? _d : original.target_column,
                                classDistribution: automl.class_distribution,
                                numericFeatureCount: automl.numeric_feature_count,
                                categoricalFeatureCount: automl.categorical_feature_count,
                                featureMissingCount: automl.feature_missing_count,
                                scaler: item.scaler,
                                warnings: automl.warnings
                            });
                            return {
                                name: item.name,
                                rank,
                                medal: rank === 1 ? '🥇' :
                                    rank === 2 ? '🥈' :
                                        rank === 3 ? '🥉' : '🏅',
                                score: 0,
                                tags: [
                                    'Measured CV',
                                    automl.task === 'regression'
                                        ? 'Regression'
                                        : 'Classification'
                                ],
                                why: explanation.why,
                                reasons: explanation.reasons,
                                why_evidence: explanation.evidence,
                                why_confidence: explanation.confidence,
                                strengths: explanation.strengths,
                                weaknesses: explanation.weaknesses,
                                best_for: explanation.bestFor,
                                training_speed: explanation.trainingSpeed,
                                complexity: explanation.complexity,
                                interpretability: explanation.interpretability,
                                code: item.code_available ? item.code : '',
                                defaultCode: item.code_available ? item.code : '',
                                automl_measured: true,
                                measured_score: item.measured_score,
                                measured_std: item.std_score,
                                automl_task: automl.task,
                                code_available: item.code_available,
                                code_error: item.code_error
                            };
                        });
                        const rendered = {
                            ...original,
                            models,
                            automl_measured: true,
                            automl_candidate_count: automl.candidate_count,
                            automl_task: automl.task
                        };
                        resultsContainer.replaceChildren();
                        this._renderModelAdvisorResults(resultsContainer, rendered);
                        // Optional Fast Tune. Existing results remain unchanged.
                        this._renderFastTuneTopFive(resultsContainer, jobId, chosenPath, chosenTarget, automl, original.empirical_evaluation, models);
                        break;
                    }
                    if (['failed', 'cancelled', 'timed_out'].includes(status)) {
                        finished = true;
                        statusEl.textContent =
                            `AutoML ${status}: ${String((_b = job.error) !== null && _b !== void 0 ? _b : '')}`;
                        cancelBtn.disabled = true;
                        break;
                    }
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
                if (!finished) {
                    statusEl.textContent =
                        'Evaluation is still pending on the server.';
                    cancelBtn.disabled = true;
                }
            }
            catch (error) {
                statusEl.textContent =
                    `AutoML failed: ${String(error)}`;
                cancelBtn.disabled = true;
            }
            finally {
                recommendationBusy = false;
                runBtn.disabled = false;
            }
        };
        runBtn.addEventListener('click', loadRecommendations);
        void loadRecommendations();
    }
    _renderModelAdvisorResults(container, res) {
        var _a, _b, _c, _d, _e, _f, _g;
        if (!res.handled) {
            container.innerHTML = `<div class="mm-studio-alert mm-alert-error">${(_a = res.error) !== null && _a !== void 0 ? _a : 'Analysis failed.'}</div>`;
            return;
        }
        const frag = document.createDocumentFragment();
        // ── Dataset + Task Summary cards ──
        const summaryGrid = document.createElement('div');
        summaryGrid.style.cssText = 'display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin-bottom:16px;';
        const addMeta = (label, value, color = '#4f46e5') => {
            const card = document.createElement('div');
            card.style.cssText = `
        padding:12px; border-radius:10px; border:1px solid #dfe3ea;
        background:#ffffff; box-shadow:0 1px 3px rgba(31,41,55,0.03);
      `;
            card.innerHTML = `
        <div style="font-size:16px; font-weight:800; color:${color};">${value}</div>
        <div style="font-size:9.5px; color:#5d6b80; text-transform:uppercase; letter-spacing:0.3px; font-weight:600; margin-top:2px;">${label}</div>
      `;
            summaryGrid.appendChild(card);
        };
        addMeta('Rows', (_c = (_b = res.rows) === null || _b === void 0 ? void 0 : _b.toLocaleString()) !== null && _c !== void 0 ? _c : '—');
        addMeta('Features', `${res.n_numeric_features} num · ${res.n_categorical_features} cat`);
        addMeta('Missing Data', res.has_missing ? `${res.missing_pct}%` : 'None', res.has_missing ? '#dc2626' : '#059669');
        frag.appendChild(summaryGrid);
        // ── Task badge ──
        const taskBadge = document.createElement('div');
        taskBadge.style.cssText = `
      padding:10px 14px; border-radius:10px; margin-bottom:16px; font-size:12px; font-weight:600;
      background:${res.task === 'regression' ? '#eef2ff' : '#ecfdf5'};
      border:1px solid ${res.task === 'regression' ? '#c7d2fe' : '#a7f3d0'};
      color:${res.task === 'regression' ? '#4338ca' : '#065f46'};
    `;
        taskBadge.innerHTML = `
      <b>Detected Task:</b> ${res.task_label}
      &nbsp;·&nbsp; <b>Target Column:</b> <code>${res.target_column}</code>
      &nbsp;·&nbsp; <b>Dataset Size:</b> ${res.dataset_size_label}
    `;
        frag.appendChild(taskBadge);
        if (res.target_encoding === 'LabelEncoder') {
            const encodingNotice = document.createElement('div');
            encodingNotice.className = 'mm-studio-alert mm-alert-info';
            encodingNotice.style.marginBottom = '16px';
            encodingNotice.textContent =
                'LabelEncoder is included in the generated classification code: target categories are encoded for training, the code prints the label-to-number mapping, and predictions are converted back to the original category names. The source CSV is not changed.';
            frag.appendChild(encodingNotice);
        }
        // ── Section title ──
        const secTitle = document.createElement('div');
        secTitle.style.cssText = 'font-size:13px; font-weight:700; margin-bottom:12px; color:#1e293b;';
        secTitle.innerHTML = `🏆 Ranked Model Recommendations <span style="color:#64748b; font-weight:400; font-size:11px;">(${(_e = (_d = res.models) === null || _d === void 0 ? void 0 : _d.length) !== null && _e !== void 0 ? _e : 0} models analysed)</span>`;
        if (res.automl_measured) {
            secTitle.textContent =
                `Measured AutoML Rankings (${res.models.length} finalists ` +
                    `from ${(_f = res.automl_candidate_count) !== null && _f !== void 0 ? _f : 'multiple'} candidates)`;
        }
        frag.appendChild(secTitle);
        // ── Model cards ──
        ((_g = res.models) !== null && _g !== void 0 ? _g : []).forEach((model) => {
            frag.appendChild(this._buildModelCard(model, res.target_column));
        });
        container.appendChild(frag);
    }
    /**
     * Optional Fast Tune Top 5.
     *
     * Runs only after a completed AutoML evaluation and only
     * when the student explicitly clicks the tuning button.
     *
     * No changes to Model Advisor ranking or existing cards.
     */
    _renderFastTuneTopFive(container, evaluationJobId, datasetPath, targetColumn, automl, empirical, advisorModels = []) {
        const recommendations = automl === null || automl === void 0 ? void 0 : automl.recommendations;
        const featureColumns = empirical === null || empirical === void 0 ? void 0 : empirical.features;
        const task = empirical === null || empirical === void 0 ? void 0 : empirical.task;
        if (!Array.isArray(recommendations) ||
            recommendations.length < 1 ||
            recommendations.length > 5 ||
            !Array.isArray(featureColumns) ||
            featureColumns.length === 0 ||
            !['classification', 'regression'].includes(task)) {
            return;
        }
        const names = recommendations.map((item) => item.name);
        if (!names.every((name) => typeof name === 'string' && name.length > 0)) {
            return;
        }
        const section = document.createElement('section');
        section.className = 'mm-studio-section';
        section.style.cssText =
            'margin-top:18px;padding:16px;border:1px solid #c7d2fe;' +
                'border-radius:12px;background:#f8faff;';
        const heading = document.createElement('div');
        heading.style.cssText =
            'font-size:15px;font-weight:800;color:#1e293b;';
        heading.textContent = 'Fast Hyperparameter Tuning';
        const explanation = document.createElement('p');
        explanation.style.cssText =
            'font-size:12px;line-height:1.6;color:#475569;' +
                'margin:8px 0 12px;';
        explanation.textContent =
            'Search important parameters for your measured Top 5. ' +
                'Basic tests fewer configurations. Advanced explores ' +
                'more important settings. Only useful changes are shown.';
        const modeRow = document.createElement('div');
        modeRow.style.cssText =
            'display:flex;gap:8px;align-items:center;margin-bottom:10px;';
        const modeLabel = document.createElement('label');
        modeLabel.textContent = 'Tuning level:';
        modeLabel.style.cssText =
            'font-size:12px;font-weight:700;color:#334155;';
        const modeSelect = document.createElement('select');
        modeSelect.className = 'mm-studio-select';
        ['basic', 'advanced'].forEach(level => {
            const option = document.createElement('option');
            option.value = level;
            option.textContent =
                level === 'basic' ? 'Basic' : 'Advanced';
            modeSelect.appendChild(option);
        });
        modeRow.append(modeLabel, modeSelect);
        const modeHelp = document.createElement('div');
        modeHelp.style.cssText =
            'font-size:11px;color:#64748b;margin-bottom:10px;';
        const updateModeHelp = () => {
            modeHelp.textContent = modeSelect.value === 'advanced'
                ? 'Advanced: up to 20 configurations per model. ' +
                    'More exploration; time limit may stop the search.'
                : 'Basic: up to 8 configurations per model. ' +
                    'Focuses on high-impact hyperparameters.';
        };
        modeSelect.addEventListener('change', updateModeHelp);
        updateModeHelp();
        const buttonRow = document.createElement('div');
        buttonRow.style.cssText =
            'display:flex;gap:8px;flex-wrap:wrap;';
        const tuneButton = document.createElement('button');
        tuneButton.type = 'button';
        tuneButton.className =
            'mm-studio-btn mm-btn-sm mm-btn-primary';
        tuneButton.textContent = '⚡ Fast Tune Top 5';
        const cancelButton = document.createElement('button');
        cancelButton.type = 'button';
        cancelButton.className = 'mm-studio-btn mm-btn-sm';
        cancelButton.textContent = 'Cancel Tuning';
        cancelButton.disabled = true;
        cancelButton.style.display = 'none';
        const status = document.createElement('div');
        status.setAttribute('role', 'status');
        status.style.cssText =
            'font-size:12px;color:#475569;margin-top:10px;';
        status.textContent = 'Tuning has not started.';
        const output = document.createElement('div');
        output.style.cssText = 'margin-top:12px;';
        buttonRow.append(tuneButton, cancelButton);
        section.append(heading, explanation, modeRow, modeHelp, buttonRow, status, output);
        container.appendChild(section);
        let activeJobId = null;
        let busy = false;
        const isCurrent = () => section.isConnected &&
            this._activeTab === 'model-advisor' &&
            this._currentPath === datasetPath &&
            this._targetCol === targetColumn;
        const settings = this._app.serviceManager.serverSettings;
        const printResult = (result) => {
            var _a, _b;
            output.replaceChildren();
            const title = document.createElement('div');
            title.style.cssText =
                'font-size:13px;font-weight:800;margin-bottom:8px;';
            title.textContent = 'Tuned Models — Tested Results';
            output.appendChild(title);
            const note = document.createElement('p');
            note.style.cssText =
                'font-size:11px;color:#64748b;line-height:1.5;';
            note.textContent =
                `Uses the Model Advisor metric (${String((_a = result === null || result === void 0 ? void 0 : result.metric) !== null && _a !== void 0 ? _a : 'CV score')}), ` +
                    `${String((_b = result === null || result === void 0 ? void 0 : result.cv_folds) !== null && _b !== void 0 ? _b : 'matching')} CV folds and its evaluated ` +
                    'dataset sample, so default scores are directly comparable to ' +
                    'the original finalists. Parameter selection can still overfit CV; ' +
                    'confirm a final model on a separate test set before deployment.';
            output.appendChild(note);
            const results = Array.isArray(result === null || result === void 0 ? void 0 : result.results)
                ? result.results
                : [];
            const rankedResults = Array.isArray(result === null || result === void 0 ? void 0 : result.ranking)
                ? result.ranking
                : results;
            const rankedNames = new Set(rankedResults.map((item) => item === null || item === void 0 ? void 0 : item.model));
            const ranking = [
                ...rankedResults,
                ...results.filter((item) => !rankedNames.has(item === null || item === void 0 ? void 0 : item.model))
            ];
            if (!ranking.length) {
                const message = document.createElement('pre');
                message.style.cssText =
                    'font-size:11px;white-space:pre-wrap;overflow-wrap:anywhere;';
                message.textContent = JSON.stringify(result, null, 2);
                output.appendChild(message);
                return;
            }
            const formattedScore = (item) => {
                var _a, _b, _c, _d, _e;
                const raw = (_c = (_b = (_a = item === null || item === void 0 ? void 0 : item.best_score) !== null && _a !== void 0 ? _a : item === null || item === void 0 ? void 0 : item.mean_score) !== null && _b !== void 0 ? _b : item === null || item === void 0 ? void 0 : item.score) !== null && _c !== void 0 ? _c : (_d = item === null || item === void 0 ? void 0 : item.best) === null || _d === void 0 ? void 0 : _d.score;
                if (typeof raw !== 'number' || !Number.isFinite(raw)) {
                    return 'No valid CV score';
                }
                if (task === 'regression') {
                    return `RMSE: ${Math.abs(raw).toFixed(4)} (lower is better)`;
                }
                const label = String((_e = result === null || result === void 0 ? void 0 : result.metric) !== null && _e !== void 0 ? _e : 'Accuracy');
                if (/accuracy|f1|precision|recall|roc.?auc/i.test(label)) {
                    return `${label}: ${(raw * 100).toFixed(2)}%`;
                }
                return `${label}: ${raw.toFixed(4)}`;
            };
            const formatValue = (value) => {
                if (value === null)
                    return 'None';
                if (typeof value === 'string')
                    return value;
                return JSON.stringify(value);
            };
            ranking.forEach((item, index) => {
                var _a, _b, _c, _d, _e;
                const card = document.createElement('div');
                card.style.cssText =
                    'padding:12px;margin:8px 0;' +
                        'border:1px solid #e2e8f0;' +
                        'border-radius:10px;background:#fff;';
                const name = document.createElement('div');
                name.style.cssText =
                    'font-size:13px;font-weight:700;color:#0f172a;';
                const modelName = String((_b = (_a = item === null || item === void 0 ? void 0 : item.model) !== null && _a !== void 0 ? _a : item === null || item === void 0 ? void 0 : item.name) !== null && _b !== void 0 ? _b : 'Model');
                name.textContent = `${index + 1}. ${modelName}`;
                const score = document.createElement('div');
                score.style.cssText =
                    'font-size:12px;font-weight:600;' +
                        'color:#059669;margin-top:6px;';
                score.textContent = formattedScore(item);
                const parameterText = document.createElement('div');
                parameterText.style.cssText =
                    'font-size:11px;color:#475569;margin-top:7px;line-height:1.6;';
                const recommendations = Array.isArray(item === null || item === void 0 ? void 0 : item.recommended_changes) ? item.recommended_changes : [];
                const params = (item === null || item === void 0 ? void 0 : item.best_params) &&
                    typeof item.best_params === 'object' &&
                    !Array.isArray(item.best_params)
                    ? item.best_params
                    : {};
                if (recommendations.length > 0 ||
                    Object.keys(params).length > 0) {
                    const heading = document.createElement('div');
                    heading.style.fontWeight = '700';
                    heading.textContent = (item === null || item === void 0 ? void 0 : item.completed) === false
                        ? 'Promising changes found (search incomplete):'
                        : 'Recommended parameter changes:';
                    parameterText.appendChild(heading);
                    if (recommendations.length > 0) {
                        recommendations.forEach((rec) => {
                            const row = document.createElement('div');
                            row.textContent =
                                `${String(rec.parameter)}: ` +
                                    `${formatValue(rec.default)} → ` +
                                    `${formatValue(rec.recommended)}`;
                            parameterText.appendChild(row);
                            const reason = document.createElement('div');
                            reason.style.cssText =
                                'font-size:10px;color:#64748b;margin:0 0 4px 8px;';
                            reason.textContent = (0,_tuning_explanations__rspack_import_6.explainTuningParameter)(String(rec.parameter));
                            parameterText.appendChild(reason);
                        });
                    }
                    else {
                        Object.entries(params).forEach(([key, value]) => {
                            const row = document.createElement('div');
                            row.textContent =
                                `${key}: ${formatValue(value)}`;
                            parameterText.appendChild(row);
                        });
                    }
                }
                else {
                    const state = String((_c = item === null || item === void 0 ? void 0 : item.recommendation_status) !== null && _c !== void 0 ? _c : '');
                    if (state === 'partial_defaults_recommended') {
                        parameterText.textContent =
                            'Defaults are the best-supported choice so far. ' +
                                'The baseline settings are kept; the search is incomplete, ' +
                                'so untested configurations could differ.';
                    }
                    else if (state === 'insufficient_validation') {
                        parameterText.textContent =
                            'No parameter changes recommended: the evaluation had fewer ' +
                                'than three CV folds, which is not enough to assess tuning ' +
                                'improvements reliably.';
                    }
                    else if (state === 'partial_parameter_changes') {
                        parameterText.textContent =
                            'Promising changes found, but the search is incomplete.';
                    }
                    else if (state === 'defaults_recommended') {
                        parameterText.textContent =
                            'Default parameters are the best-supported choice: no tested ' +
                                'alternative beat the baseline by a meaningful, consistent ' +
                                'margin on the same CV folds.';
                    }
                    else if (state === 'baseline_unavailable') {
                        parameterText.textContent =
                            'The default baseline was unavailable. ' +
                                'No parameter changes can be recommended reliably.';
                    }
                    else if (state === 'no_valid_configuration' ||
                        (item === null || item === void 0 ? void 0 : item.status) === 'failed') {
                        parameterText.textContent =
                            'No valid configuration was evaluated.';
                    }
                    else {
                        parameterText.textContent =
                            'No parameter changes recommended.';
                    }
                }
                const baseline = item === null || item === void 0 ? void 0 : item.baseline_score;
                const bestTested = item === null || item === void 0 ? void 0 : item.best_tested_score;
                if (typeof baseline === 'number' &&
                    Number.isFinite(baseline) &&
                    typeof bestTested === 'number' &&
                    Number.isFinite(bestTested)) {
                    const comparison = document.createElement('div');
                    comparison.style.cssText =
                        'font-size:10px;color:#64748b;margin-top:6px;';
                    const selectedScore = item === null || item === void 0 ? void 0 : item.best_score;
                    const selectedText = typeof selectedScore === 'number' &&
                        Number.isFinite(selectedScore)
                        ? ` • Recommended CV: ${formattedScore(item)}`
                        : '';
                    comparison.textContent =
                        `Default CV: ${formattedScore({ best_score: baseline })} • ` +
                            `Best tested CV: ${formattedScore({ best_score: bestTested })}` +
                            selectedText;
                    parameterText.appendChild(comparison);
                    const improvement = item === null || item === void 0 ? void 0 : item.improvement_over_default;
                    if (typeof improvement === 'number' &&
                        Number.isFinite(improvement)) {
                        const gain = document.createElement('div');
                        gain.style.cssText =
                            'font-size:10px;color:#475569;margin-top:4px;';
                        gain.textContent = task === 'classification'
                            ? `Best tested change vs. default: ${(improvement * 100).toFixed(2)} percentage points in ${String((_d = result === null || result === void 0 ? void 0 : result.metric) !== null && _d !== void 0 ? _d : 'CV score')}.`
                            : `Best tested RMSE change vs. default: ${improvement.toFixed(4)} lower is better.`;
                        parameterText.appendChild(gain);
                    }
                }
                const testedCount = item === null || item === void 0 ? void 0 : item.configurations_tested;
                const plannedCount = item === null || item === void 0 ? void 0 : item.configurations_planned;
                if (typeof testedCount === 'number' &&
                    typeof plannedCount === 'number' &&
                    plannedCount > 0) {
                    const progress = document.createElement('div');
                    progress.style.cssText =
                        'font-size:11px;color:#475569;margin-top:7px;';
                    progress.textContent =
                        `Configurations tested: ${testedCount}/${plannedCount}`;
                    parameterText.appendChild(progress);
                }
                if ((item === null || item === void 0 ? void 0 : item.completed) === false) {
                    const warning = document.createElement('div');
                    warning.style.cssText =
                        'font-size:11px;color:#b45309;margin-top:6px;';
                    warning.textContent =
                        'Partial search: not all configurations were tested.';
                    parameterText.appendChild(warning);
                }
                const recommendationReason = document.createElement('div');
                recommendationReason.style.cssText =
                    'font-size:10.5px;color:#334155;margin-top:7px;line-height:1.5;';
                const recommendationStatus = String((_e = item === null || item === void 0 ? void 0 : item.recommendation_status) !== null && _e !== void 0 ? _e : '');
                if (recommendationStatus === 'parameter_changes_recommended' ||
                    recommendationStatus === 'partial_parameter_changes') {
                    recommendationReason.textContent =
                        'Why these settings: this tested configuration was better than the default on the same CV folds and cleared the practical-gain and fold-consistency checks.' +
                            ((item === null || item === void 0 ? void 0 : item.completed) === false
                                ? ' The search is incomplete, so treat this as provisional.'
                                : '');
                }
                else if (recommendationStatus === 'defaults_recommended' ||
                    recommendationStatus === 'partial_defaults_recommended') {
                    recommendationReason.textContent =
                        'Why keep defaults: the baseline is the best-supported configuration. No tested alternative showed a sufficiently large, consistent improvement across the same CV folds.' +
                            ((item === null || item === void 0 ? void 0 : item.completed) === false
                                ? ' The search is incomplete; untested settings may differ.'
                                : '');
                }
                else if (recommendationStatus === 'insufficient_validation') {
                    recommendationReason.textContent =
                        'Why no tuning change: too few CV folds were available to distinguish a real gain from fold-to-fold variation.';
                }
                else if (recommendationStatus === 'baseline_unavailable') {
                    recommendationReason.textContent =
                        'Why no tuning change: without a valid default baseline, a fair parameter comparison is not possible.';
                }
                if (recommendationReason.textContent) {
                    parameterText.appendChild(recommendationReason);
                }
                if (typeof (item === null || item === void 0 ? void 0 : item.code) === 'string' && item.code.trim()) {
                    const tunedCode = item.code;
                    const hasRecommendedChanges = Object.keys(params).length > 0;
                    const codeNotice = document.createElement('div');
                    codeNotice.style.cssText =
                        'font-size:10.5px;color:#047857;margin-top:6px;font-weight:600;display:flex;align-items:center;gap:4px;';
                    codeNotice.textContent = hasRecommendedChanges
                        ? 'CV-selected parameter values are applied in this code. The Model Advisor card keeps its baseline code separately.'
                        : 'Defaults are the best-supported choice. This inserts the same default estimator settings as the baseline code; no parameter change passed the CV checks.';
                    parameterText.appendChild(codeNotice);
                    const actionRow = document.createElement('div');
                    actionRow.style.cssText =
                        'display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;';
                    const insertTunedBtn = document.createElement('button');
                    insertTunedBtn.type = 'button';
                    insertTunedBtn.className = 'mm-studio-btn mm-btn-sm mm-btn-primary';
                    insertTunedBtn.style.cssText = 'background:#059669;border-color:#047857;color:#fff;font-weight:600;';
                    insertTunedBtn.textContent =
                        hasRecommendedChanges
                            ? '📥 Insert CV-Selected Code'
                            : '📥 Insert Default Code';
                    insertTunedBtn.addEventListener('click', () => {
                        const ok = this._insertCodeBelow(tunedCode);
                        this._showToast(ok ? `✓ CV-selected ${modelName} code inserted into notebook!` : 'Open a notebook first.');
                    });
                    const copyTunedBtn = document.createElement('button');
                    copyTunedBtn.type = 'button';
                    copyTunedBtn.className = 'mm-studio-btn mm-btn-sm';
                    copyTunedBtn.innerHTML = '📋 Copy Code';
                    copyTunedBtn.addEventListener('click', async () => {
                        await navigator.clipboard.writeText(tunedCode);
                        copyTunedBtn.textContent = 'Copied!';
                        setTimeout(() => { copyTunedBtn.innerHTML = '📋 Copy Code'; }, 1500);
                    });
                    const previewTunedBtn = document.createElement('button');
                    previewTunedBtn.type = 'button';
                    previewTunedBtn.className = 'mm-studio-btn mm-btn-sm';
                    previewTunedBtn.innerHTML = '🔍 Preview Code';
                    previewTunedBtn.addEventListener('click', () => {
                        this._showCodePreviewModal(modelName + ' (Tuned)', tunedCode, 'advanced');
                    });
                    if (!this._canUseCodeAction('insert')) {
                        actionRow.append(previewTunedBtn);
                    }
                    else {
                        actionRow.append(insertTunedBtn, copyTunedBtn, previewTunedBtn);
                    }
                    card.appendChild(actionRow);
                }
                else if (typeof (item === null || item === void 0 ? void 0 : item.code_error) === 'string') {
                    const codeWarning = document.createElement('div');
                    codeWarning.style.cssText =
                        'font-size:10px;color:#b45309;margin-top:6px;';
                    codeWarning.textContent =
                        `Could not synchronize generated code: ${item.code_error}`;
                    parameterText.appendChild(codeWarning);
                }
                const details = document.createElement('details');
                details.style.cssText =
                    'margin-top:9px;font-size:11px;color:#475569;';
                const summary = document.createElement('summary');
                summary.textContent = 'Advanced Details';
                summary.style.cssText =
                    'cursor:pointer;font-weight:600;color:#4338ca;';
                const technical = document.createElement('pre');
                technical.style.cssText =
                    'margin:8px 0 0;padding:9px;' +
                        'background:#f8fafc;border-radius:8px;' +
                        'white-space:pre-wrap;overflow-wrap:anywhere;' +
                        'font-size:10px;';
                const technicalResult = { ...item };
                delete technicalResult.code;
                technical.textContent = JSON.stringify(technicalResult, null, 2);
                details.append(summary, technical);
                card.append(name, score, parameterText, details);
                output.appendChild(card);
            });
        };
        cancelButton.addEventListener('click', async () => {
            if (!activeJobId)
                return;
            cancelButton.disabled = true;
            status.textContent = 'Cancellation requested...';
            try {
                await (0,_request__rspack_import_3.requestAPI)(`api/dataset/tuning-jobs/${activeJobId}/cancel`, settings, { method: 'POST' });
            }
            catch (error) {
                status.textContent =
                    `Cancellation request failed: ${String(error)}`;
                cancelButton.disabled = false;
            }
        });
        tuneButton.addEventListener('click', async () => {
            var _a, _b, _c, _d, _e, _f;
            if (busy || !isCurrent())
                return;
            busy = true;
            activeJobId = null;
            tuneButton.disabled = true;
            cancelButton.disabled = true;
            cancelButton.style.display = 'none';
            output.replaceChildren();
            modeSelect.disabled = true;
            const chosenLevel = modeSelect.value;
            status.textContent = `Submitting ${chosenLevel} tuning for Top 5...`;
            try {
                const submitted = await (0,_request__rspack_import_3.requestAPI)('api/dataset/tuning-jobs', settings, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        evaluation_job_id: evaluationJobId,
                        file_path: datasetPath,
                        target_column: targetColumn,
                        feature_columns: featureColumns,
                        task,
                        model_names: names,
                        time_budget_seconds: chosenLevel === 'advanced' ? 120 : 60,
                        level: chosenLevel
                    })
                });
                if (typeof (submitted === null || submitted === void 0 ? void 0 : submitted.job_id) !== 'string') {
                    throw new Error('Tuning job ID is missing.');
                }
                activeJobId = submitted.job_id;
                cancelButton.disabled = false;
                cancelButton.style.display = 'inline-flex';
                let terminal = false;
                for (let attempt = 0; attempt < 240; attempt++) {
                    if (!isCurrent()) {
                        status.textContent =
                            'Panel changed. Tuning continues on the server ' +
                                'unless it is cancelled or reaches its timeout.';
                        break;
                    }
                    const job = await (0,_request__rspack_import_3.requestAPI)(`api/dataset/tuning-jobs/${activeJobId}`, settings);
                    const jobStatus = String((_a = job === null || job === void 0 ? void 0 : job.status) !== null && _a !== void 0 ? _a : 'unknown');
                    status.textContent = `Fast tuning: ${jobStatus}`;
                    if (jobStatus === 'completed') {
                        terminal = true;
                        (0,_model_code_utils__rspack_import_7.resetTunedModelCode)(advisorModels);
                        printResult(job.result);
                        const codeSync = (0,_model_code_utils__rspack_import_7.applyTunedModelCode)(advisorModels, (_b = job.result) === null || _b === void 0 ? void 0 : _b.results);
                        status.textContent =
                            `Tuning finished: ${String((_d = (_c = job.result) === null || _c === void 0 ? void 0 : _c.models_completed) !== null && _d !== void 0 ? _d : 0)}/` +
                                `${names.length} models fully searched.` +
                                (((_e = job.result) === null || _e === void 0 ? void 0 : _e.timed_out) ? ' Time budget reached.' : '') +
                                ` ${codeSync.updated} Model Advisor card(s) now have CV-checked code.` +
                                ' Only changes with a meaningful, consistent CV gain replace defaults; holdout accuracy can still differ.';
                        break;
                    }
                    if (['failed', 'cancelled', 'timed_out'].includes(jobStatus)) {
                        terminal = true;
                        status.textContent =
                            `Fast tuning ${jobStatus}: ` +
                                String((_f = job === null || job === void 0 ? void 0 : job.error) !== null && _f !== void 0 ? _f : '');
                        break;
                    }
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
                if (!terminal && isCurrent()) {
                    status.textContent =
                        'Tuning is taking longer than expected. ' +
                            'Check the job status before starting another run.';
                }
            }
            catch (error) {
                if (isCurrent()) {
                    status.textContent =
                        `Fast Tune error: ${String(error)}`;
                }
            }
            finally {
                busy = false;
                modeSelect.disabled = false;
                tuneButton.disabled = !isCurrent();
                cancelButton.disabled = true;
                cancelButton.style.display = 'none';
            }
        });
    }
    _buildModelCard(model, targetCol) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        // ── Preserve baseline code at card build time ──
        // defaultCode is the ORIGINAL code from the API — never overwritten by tuning.
        // This must be set before any tuning occurs so getBaselineCode() always returns
        // the clean pre-tuning version regardless of what happens to model.code later.
        if (typeof model.defaultCode !== 'string' || !model.defaultCode.trim()) {
            model.defaultCode = typeof model.code === 'string' ? model.code : '';
        }
        const getBaselineCode = () => {
            const src = (typeof model.defaultCode === 'string' && model.defaultCode.trim())
                ? model.defaultCode
                : model.code;
            return typeof src === 'string' ? (0,_model_code_utils__rspack_import_7.removeModelAdvisorRaiseGuards)(src) : '';
        };
        const getTunedCode = () => {
            const src = (typeof model.tuned_code === 'string' && model.tuned_code.trim())
                ? model.tuned_code
                : (typeof model.code === 'string' ? model.code : model.defaultCode);
            return typeof src === 'string' ? (0,_model_code_utils__rspack_import_7.removeModelAdvisorRaiseGuards)(src) : '';
        };
        // The Model Advisor card always provides the clean baseline model code without tuning
        const getModelCode = () => getBaselineCode();
        const rankColors = {
            1: { bg: '#fef3c7', border: '#fde68a', text: '#b45309' },
            2: { bg: '#f1f5f9', border: '#cbd5e1', text: '#475569' },
            3: { bg: '#ffedd5', border: '#fed7aa', text: '#c2410c' }
        };
        const rankStyle = (_a = rankColors[model.rank]) !== null && _a !== void 0 ? _a : { bg: '#f8fafc', border: '#e2e8f0', text: '#64748b' };
        const scoreColor = model.score >= 85 ? '#059669' : model.score >= 70 ? '#d97706' : '#dc2626';
        const card = document.createElement('div');
        card.style.cssText = `
      border:1px solid ${model.rank === 1 ? '#fde047' : '#dfe3ea'};
      border-radius:12px; padding:16px; margin-bottom:12px;
      background:${model.rank === 1 ? '#fffdf0' : '#ffffff'};
      box-shadow: 0 1px 3px rgba(31, 41, 55, 0.04);
      position:relative;
    `;
        // ── Card header ──
        const cardHdr = document.createElement('div');
        cardHdr.style.cssText = 'display:flex; align-items:center; gap:10px; margin-bottom:12px;';
        cardHdr.innerHTML = `
      <span style="font-size:22px; line-height:1;">${model.medal}</span>
      <div style="flex:1;">
        <div style="font-size:14px; font-weight:800; display:flex; align-items:center; gap:8px; color:#1e293b;">
          ${model.name}
          ${model.rank <= 3 ? `<span style="font-size:9px; padding:2px 8px; border-radius:99px; background:${rankStyle.bg}; color:${rankStyle.text}; border:1px solid ${rankStyle.border}; font-weight:700;">RANK #${model.rank}</span>` : ''}
        </div>
        <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:5px;">
          ${((_b = model.tags) !== null && _b !== void 0 ? _b : []).map((t) => `<span style="font-size:9px; font-weight:600; padding:2px 8px; border-radius:99px; background:#eef2ff; border:1px solid #c7d2fe; color:#4338ca;">${t}</span>`).join('')}
        </div>
      </div>
      <div style="text-align:right; flex-shrink:0;">
        <div style="font-size:22px; font-weight:900; color:${scoreColor}; line-height:1;">${model.score}</div>
        <div style="font-size:9px; color:#64748b; font-weight:600;">/ 100</div>
      </div>
    `;
        card.appendChild(cardHdr);
        if (model.automl_measured) {
            const scoreBox = cardHdr.lastElementChild;
            if (scoreBox) {
                scoreBox.replaceChildren();
                const score = document.createElement('div');
                score.style.cssText =
                    'font-size:19px;font-weight:900;color:#059669;';
                const value = Number(model.measured_score);
                const isRegression = model.automl_task === 'regression';
                score.textContent = Number.isFinite(value)
                    ? isRegression
                        ? value.toFixed(4)
                        : `${(value * 100).toFixed(2)}%`
                    : 'N/A';
                const metric = document.createElement('div');
                metric.style.cssText =
                    'font-size:10px;color:#64748b;font-weight:600;';
                metric.textContent = isRegression
                    ? 'CV RMSE (lower is better)'
                    : 'CV balanced accuracy';
                scoreBox.append(score, metric);
            }
        }
        // ── Score bar ──
        const barWrap = document.createElement('div');
        barWrap.style.cssText = 'height:6px; border-radius:99px; background:#e2e8f0; margin-bottom:12px; overflow:hidden;';
        const barFill = document.createElement('div');
        barFill.style.cssText = `height:100%; width:${model.score}%; border-radius:99px; background:linear-gradient(90deg, ${scoreColor}aa, ${scoreColor});`;
        barWrap.appendChild(barFill);
        if (!model.automl_measured) {
            card.appendChild(barWrap);
        }
        // ── Why recommended ──
        const whyEl = document.createElement('div');
        whyEl.style.cssText = `
      font-size:11.5px; padding:12px 14px; border-radius:8px; margin-bottom:10px;
      background:#f0fdf4; border:1px solid #bbf7d0; color:#14532d; line-height:1.65; font-weight:500;
    `;
        const whyHeading = document.createElement('div');
        whyHeading.textContent = '✅ Why this model';
        whyHeading.style.cssText =
            'color:#15803d;font-weight:800;font-size:12.5px;margin-bottom:6px;display:flex;align-items:center;gap:5px;';
        const whySummary = document.createElement('div');
        whySummary.style.cssText = 'display:flex;flex-direction:column;gap:5px;margin-top:4px;';
        const rawWhy = String((_c = model.why) !== null && _c !== void 0 ? _c : '');
        const lines = rawWhy.split('\n').filter(l => l.trim().length > 0);
        const modelReasons = Array.isArray(model.reasons) && model.reasons.length > 0
            ? model.reasons
            : (0,_model_advisor_explanations__rspack_import_5.getModelSelectionReasons)(String((_d = model.name) !== null && _d !== void 0 ? _d : ''), {
                name: String((_e = model.name) !== null && _e !== void 0 ? _e : ''),
                task: model.automl_task === 'regression' || model.task === 'regression'
                    ? 'regression'
                    : 'classification',
                metric: '',
                rank: (_f = model.rank) !== null && _f !== void 0 ? _f : 1,
                finalistCount: 5,
                targetColumn: targetCol
            });
        if (lines.length > 1) {
            lines.forEach(line => {
                const row = document.createElement('div');
                row.style.cssText =
                    'display:flex;align-items:flex-start;gap:6px;font-size:11px;line-height:1.5;';
                let icon = '•';
                let label = '';
                let val = line;
                if (line.startsWith('Result:')) {
                    icon = '📊';
                    label = 'Score & Rank:';
                    val = line.slice(7).trim();
                    row.innerHTML = `<span style="flex-shrink:0;font-size:11px;">${icon}</span><div style="color:#166534;"><strong style="color:#15803d;font-weight:700;">${label}</strong> ${val}</div>`;
                    whySummary.appendChild(row);
                }
                else if (line.startsWith('Model fit:')) {
                    if (modelReasons.length > 0) {
                        row.style.cssText = 'margin:3px 0 4px 0;';
                        const bulletItems = modelReasons
                            .map((r) => `<div style="display:flex;align-items:flex-start;gap:6px;color:#166534;font-size:11px;line-height:1.45;"><span style="color:#15803d;font-weight:800;flex-shrink:0;">•</span><span>${r}</span></div>`)
                            .join('');
                        row.innerHTML = `
              <div style="width:100%;">
                <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
                  <span style="flex-shrink:0;font-size:11px;">🧠</span>
                  <strong style="color:#15803d;font-weight:750;font-size:11.5px;">Why this model was selected:</strong>
                </div>
                <div style="display:flex;flex-direction:column;gap:3px;padding-left:18px;">
                  ${bulletItems}
                </div>
              </div>
            `;
                        whySummary.appendChild(row);
                    }
                    else {
                        icon = '🧠';
                        label = 'Why this model:';
                        val = line.slice(10).trim();
                        row.innerHTML = `<span style="flex-shrink:0;font-size:11px;">${icon}</span><div style="color:#166534;"><strong style="color:#15803d;font-weight:700;">${label}</strong> ${val}</div>`;
                        whySummary.appendChild(row);
                    }
                }
                else if (line.startsWith('Data:')) {
                    icon = '📁';
                    label = 'Dataset match:';
                    val = line.slice(5).trim();
                    row.innerHTML = `<span style="flex-shrink:0;font-size:11px;">${icon}</span><div style="color:#166534;"><strong style="color:#15803d;font-weight:700;">${label}</strong> ${val}</div>`;
                    whySummary.appendChild(row);
                }
                else if (line.startsWith('Comparison:')) {
                    icon = '⚖️';
                    label = 'Benchmark:';
                    val = line.slice(11).trim();
                    row.innerHTML = `<span style="flex-shrink:0;font-size:11px;">${icon}</span><div style="color:#166534;"><strong style="color:#15803d;font-weight:700;">${label}</strong> ${val}</div>`;
                    whySummary.appendChild(row);
                }
                else if (line.startsWith('Decision:')) {
                    icon = '🎯';
                    label = 'Next step:';
                    val = line.slice(9).trim();
                    row.innerHTML = `<span style="flex-shrink:0;font-size:11px;">${icon}</span><div style="color:#166534;"><strong style="color:#15803d;font-weight:700;">${label}</strong> ${val}</div>`;
                    whySummary.appendChild(row);
                }
            });
        }
        else if (modelReasons.length > 0) {
            const heading = document.createElement('div');
            heading.style.cssText =
                'display:flex;align-items:center;gap:6px;margin-bottom:4px;';
            heading.innerHTML = `<span style="flex-shrink:0;font-size:11px;">🧠</span><strong style="color:#15803d;font-weight:750;font-size:11.5px;">Why this model was selected:</strong>`;
            const list = document.createElement('div');
            list.style.cssText =
                'display:flex;flex-direction:column;gap:3px;padding-left:18px;';
            list.innerHTML = modelReasons
                .map((r) => `<div style="display:flex;align-items:flex-start;gap:6px;color:#166534;font-size:11px;line-height:1.45;"><span style="color:#15803d;font-weight:800;flex-shrink:0;">•</span><span>${r}</span></div>`)
                .join('');
            whySummary.append(heading, list);
            if (rawWhy) {
                const fallback = document.createElement('div');
                fallback.style.cssText =
                    'color:#166534;font-size:10.5px;margin-top:4px;';
                fallback.textContent = rawWhy;
                whySummary.appendChild(fallback);
            }
        }
        else {
            whySummary.textContent = rawWhy;
            whySummary.style.color = '#166534';
            whySummary.style.whiteSpace = 'pre-line';
        }
        whyEl.append(whyHeading, whySummary);
        if (model.automl_measured &&
            Array.isArray(model.why_evidence) &&
            model.why_evidence.length > 0) {
            const evidenceDetails = document.createElement('details');
            evidenceDetails.style.marginTop = '10px';
            evidenceDetails.style.paddingTop = '8px';
            evidenceDetails.style.borderTop = '1px solid #bbf7d0';
            const evidenceHeading = document.createElement('summary');
            evidenceHeading.textContent = '🔍 View detailed evaluation metrics, class balance & fold breakdown';
            evidenceHeading.style.cssText =
                'font-weight:750;color:#15803d;cursor:pointer;font-size:11px;user-select:none;';
            const evidenceList = document.createElement('ul');
            evidenceList.style.cssText =
                'margin:6px 0 0;padding-left:18px;color:#166534;font-size:10.5px;line-height:1.5;';
            for (const item of model.why_evidence) {
                const evidenceItem = document.createElement('li');
                evidenceItem.textContent = String(item);
                evidenceItem.style.marginTop = '4px';
                evidenceList.appendChild(evidenceItem);
            }
            evidenceDetails.append(evidenceHeading, evidenceList);
            if (typeof model.why_confidence === 'string' && model.why_confidence) {
                const confidence = document.createElement('div');
                confidence.textContent = `💡 How to interpret it: ${model.why_confidence}`;
                confidence.style.cssText =
                    'margin-top:9px;padding-top:7px;border-top:1px dashed #bbf7d0;font-weight:600;font-size:10.5px;color:#14532d;line-height:1.5;';
                evidenceDetails.appendChild(confidence);
            }
            whyEl.appendChild(evidenceDetails);
        }
        card.appendChild(whyEl);
        // ModelMind: optional ML dependency availability.
        // Keep model rank, score, code actions and existing UI unchanged.
        const dependency = model.dependency_status;
        if (dependency &&
            dependency.available === false &&
            typeof dependency.optional_dependency === 'string') {
            const warning = document.createElement('div');
            warning.style.cssText = `
        padding:10px 12px;
        margin-bottom:10px;
        border-radius:8px;
        background:#fff7ed;
        border:1px solid #fed7aa;
        color:#9a3412;
        font-size:11px;
        line-height:1.6;
      `;
            const heading = document.createElement('div');
            heading.style.fontWeight = '700';
            heading.textContent = 'Optional ML package unavailable';
            const message = document.createElement('div');
            message.textContent =
                typeof dependency.message === 'string'
                    ? dependency.message
                    : 'This model requires an additional Python package.';
            const kernelNote = document.createElement('div');
            kernelNote.style.marginTop = '4px';
            kernelNote.textContent =
                'Availability is checked on the ModelMind server. ' +
                    'Your notebook kernel may use a different environment.';
            warning.appendChild(heading);
            warning.appendChild(message);
            warning.appendChild(kernelNote);
            if (Array.isArray(dependency.alternatives) &&
                dependency.alternatives.length > 0) {
                const alternatives = document.createElement('div');
                alternatives.style.marginTop = '6px';
                alternatives.textContent =
                    'Available-library alternatives to consider: ' +
                        dependency.alternatives
                            .filter((name) => typeof name === 'string')
                            .join(', ');
                warning.appendChild(alternatives);
            }
            card.appendChild(warning);
        }
        // ── Meta grid: speed, complexity, interpretability ──
        const metaGrid = document.createElement('div');
        metaGrid.style.cssText = 'display:grid; grid-template-columns:repeat(3,1fr); gap:6px; margin-bottom:10px;';
        [
            ['Training Speed', (_g = model.training_speed) !== null && _g !== void 0 ? _g : '—'],
            ['Complexity', (_h = model.complexity) !== null && _h !== void 0 ? _h : '—'],
            ['Interpretability', (_j = model.interpretability) !== null && _j !== void 0 ? _j : '—'],
        ].forEach(([lbl, val]) => {
            const box = document.createElement('div');
            box.style.cssText = 'padding:8px 10px; border-radius:8px; background:#f8fafc; border:1px solid #e2e8f0; font-size:10px;';
            box.innerHTML = `<div style="color:#64748b; font-size:9px; font-weight:600; text-transform:uppercase; margin-bottom:3px;">${lbl}</div><div style="font-weight:700; color:#0f172a;">${val}</div>`;
            metaGrid.appendChild(box);
        });
        card.appendChild(metaGrid);
        // ── Strengths & Weaknesses ──
        const swGrid = document.createElement('div');
        swGrid.style.cssText = 'display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:10px;';
        const strengthBox = document.createElement('div');
        strengthBox.style.cssText = 'padding:10px; border-radius:8px; background:#f0fdf4; border:1px solid #bbf7d0;';
        strengthBox.innerHTML = `
      <div style="font-size:10.5px; font-weight:700; color:#15803d; margin-bottom:6px;">✅ Strengths</div>
      ${((_k = model.strengths) !== null && _k !== void 0 ? _k : []).map((s) => `<div style="font-size:10px; color:#166534; margin-bottom:3px; line-height:1.4;">• ${s}</div>`).join('')}
    `;
        const weakBox = document.createElement('div');
        weakBox.style.cssText = 'padding:10px; border-radius:8px; background:#fef2f2; border:1px solid #fecaca;';
        weakBox.innerHTML = `
      <div style="font-size:10.5px; font-weight:700; color:#b91c1c; margin-bottom:6px;">⚠️ Weaknesses</div>
      ${((_l = model.weaknesses) !== null && _l !== void 0 ? _l : []).map((w) => `<div style="font-size:10px; color:#991b1b; margin-bottom:3px; line-height:1.4;">• ${w}</div>`).join('')}
    `;
        swGrid.append(strengthBox, weakBox);
        card.appendChild(swGrid);
        // ── Best for ──
        const bestFor = document.createElement('div');
        bestFor.style.cssText = 'font-size:11px; color:#475569; margin-bottom:12px; padding:7px 10px; border-radius:6px; background:#f8fafc; border:1px solid #e2e8f0; line-height:1.4;';
        bestFor.innerHTML = `<b style="color:#1e293b;">Best for:</b> ${model.best_for}`;
        card.appendChild(bestFor);
        // ── Code preview (collapsed by default) ──
        const codeSection = document.createElement('div');
        let codeVisible = false;
        const codeToggleBtn = document.createElement('button');
        codeToggleBtn.type = 'button';
        codeToggleBtn.className = 'mm-studio-btn mm-btn-sm';
        codeToggleBtn.innerHTML = '📄 Show Full Code';
        const codePre = document.createElement('pre');
        codePre.style.cssText = `
      background:#ffffff; border:1px solid #dfe3ea; border-radius:8px;
      padding:14px 16px; font-size:10.5px; line-height:1.7;
      font-family:ui-monospace,SFMono-Regular,'Cascadia Code',monospace;
      color:#1e293b; overflow-x:auto; margin:8px 0 0 0; white-space:pre; display:none;
    `;
        codePre.textContent = getModelCode() || '# No code available';
        codeToggleBtn.addEventListener('click', () => {
            codeVisible = !codeVisible;
            codePre.textContent = getModelCode() || '# No code available';
            codePre.style.display = codeVisible ? 'block' : 'none';
            codeToggleBtn.innerHTML = codeVisible ? '🔼 Hide Code' : '📄 Show Full Code';
        });
        codeSection.appendChild(codeToggleBtn);
        codeSection.appendChild(codePre);
        card.appendChild(codeSection);
        // ── Tuned Configuration Banner ──
        const tunedBanner = document.createElement('div');
        tunedBanner.style.cssText =
            'display:none; padding:10px 14px; border-radius:8px; margin-top:12px; ' +
                'background:#ecfdf5; border:1px solid #6ee7b7; color:#065f46; font-size:11.5px; line-height:1.5;';
        // ── Action buttons ──
        const btnRow = document.createElement('div');
        btnRow.style.cssText = 'display:flex; gap:8px; margin-top:10px; flex-wrap:wrap;';
        const previewBtn = document.createElement('button');
        previewBtn.type = 'button';
        previewBtn.className = 'mm-studio-btn mm-btn-sm';
        previewBtn.innerHTML = '🔍 Preview Code';
        previewBtn.addEventListener('click', () => {
            this._showCodePreviewModal(model.name + ' (Baseline)', getBaselineCode(), model.rank === 1 ? 'advanced' : model.rank === 2 ? 'medium' : 'basic');
        });
        const copyBtn2 = document.createElement('button');
        copyBtn2.type = 'button';
        copyBtn2.className = 'mm-studio-btn mm-btn-sm';
        copyBtn2.innerHTML = '📋 Copy Code';
        copyBtn2.addEventListener('click', async () => {
            await navigator.clipboard.writeText(getModelCode());
            copyBtn2.textContent = 'Copied!';
            setTimeout(() => { copyBtn2.innerHTML = '📋 Copy Code'; }, 1500);
        });
        const insertBtn2 = document.createElement('button');
        insertBtn2.type = 'button';
        insertBtn2.className = 'mm-studio-btn mm-btn-sm mm-btn-primary';
        insertBtn2.innerHTML = '📥 Insert into Notebook';
        insertBtn2.title = 'Insert the clean baseline model code into your notebook';
        insertBtn2.addEventListener('click', () => {
            const ok = this._insertCodeBelow(getBaselineCode());
            this._showToast(ok
                ? `✓ ${model.name} baseline code inserted! (Ready for manual parameter changes)`
                : 'Open a notebook first.');
        });
        model.refreshCode = () => {
            var _a;
            const available = Boolean(getBaselineCode());
            codePre.textContent = getBaselineCode() || '# No code available';
            codeToggleBtn.disabled = !available;
            previewBtn.disabled = !available;
            copyBtn2.disabled = !available;
            insertBtn2.disabled = !available;
            if (model.tuned_configuration_applied) {
                card.style.borderColor = '#10b981';
                card.style.boxShadow = '0 0 0 1px #10b981, 0 3px 10px rgba(16, 185, 129, 0.12)';
                insertBtn2.innerHTML = '📥 Insert Baseline Code into Notebook';
                tunedBanner.replaceChildren();
                tunedBanner.style.display = 'block';
                const bannerHdr = document.createElement('div');
                bannerHdr.style.cssText =
                    'font-weight:700; color:#047857; margin-bottom:4px; display:flex; align-items:center; gap:6px; font-size:12px;';
                bannerHdr.innerHTML = '<span>⚡ Hyperparameter Tuning Recommendations:</span>';
                const changesList = document.createElement('div');
                changesList.style.cssText = 'font-size:11px; color:#14532d; margin-top:4px; line-height:1.6;';
                const formatVal = (v) => v === null ? 'None' : (typeof v === 'string' ? `"${v}"` : JSON.stringify(v));
                if (Array.isArray(model.tuned_changes) && model.tuned_changes.length > 0) {
                    model.tuned_changes.forEach((ch) => {
                        const itemEl = document.createElement('div');
                        itemEl.innerHTML = `• <b>${ch.parameter}</b>: change from <code>${formatVal(ch.default)}</code> → <code>${formatVal(ch.recommended)}</code>`;
                        changesList.appendChild(itemEl);
                    });
                }
                else if (model.tuned_params) {
                    Object.entries(model.tuned_params).forEach(([k, v]) => {
                        const itemEl = document.createElement('div');
                        itemEl.innerHTML = `• <b>${k}</b>: recommended value <code>${formatVal(v)}</code>`;
                        changesList.appendChild(itemEl);
                    });
                }
                if (changesList.childElementCount === 0 &&
                    model.tuned_recommendation_status === 'defaults_recommended') {
                    changesList.textContent =
                        'Default parameters are the best-supported choice: no tested alternative beat the baseline by a meaningful, consistent margin on the same CV folds.';
                }
                else if (changesList.childElementCount === 0 &&
                    model.tuned_recommendation_status === 'insufficient_validation') {
                    changesList.textContent =
                        'Defaults were retained because there were not enough CV folds to support a reliable tuning decision.';
                }
                else if (changesList.childElementCount === 0) {
                    changesList.textContent =
                        'No parameter changes were validated. The generated code preserves the baseline settings.';
                }
                const bannerNote = document.createElement('div');
                bannerNote.style.cssText =
                    'font-size:10.5px; color:#475569; margin-top:6px; line-height:1.4;';
                bannerNote.innerHTML =
                    '<b>Evaluation note:</b> The recommended code applies the tested estimator settings; when defaults are recommended, it uses the same estimator settings as baseline code. ' +
                        'Its held-out score can differ from CV, and no tuning search can guarantee higher accuracy on new data.';
                const bannerActions = document.createElement('div');
                bannerActions.style.cssText =
                    'display:flex; gap:8px; margin-top:8px; align-items:center; flex-wrap:wrap;';
                const previewTunedDirectBtn = document.createElement('button');
                previewTunedDirectBtn.type = 'button';
                previewTunedDirectBtn.className = 'mm-studio-btn mm-btn-sm';
                previewTunedDirectBtn.textContent = '🔍 Preview Recommended Code';
                previewTunedDirectBtn.addEventListener('click', () => {
                    this._showCodePreviewModal(model.name + ' (Recommended)', getTunedCode(), 'advanced');
                });
                const insertTunedDirectBtn = document.createElement('button');
                insertTunedDirectBtn.type = 'button';
                insertTunedDirectBtn.className = 'mm-studio-btn mm-btn-sm';
                insertTunedDirectBtn.style.cssText =
                    'background:#f0fdf4; border:1px solid #86efac; color:#15803d; font-weight:600; font-size:10.5px; cursor:pointer;';
                insertTunedDirectBtn.innerHTML = ((_a = model.tuned_changes) === null || _a === void 0 ? void 0 : _a.length)
                    ? '⚡ Insert CV-Selected Code'
                    : '⚡ Insert Recommended Default Code';
                insertTunedDirectBtn.addEventListener('click', () => {
                    const ok = this._insertCodeBelow(getTunedCode());
                    this._showToast(ok ? `✓ Tuned ${model.name} code inserted!` : 'Open a notebook first.');
                });
                if (!this._canUseCodeAction('insert')) {
                    bannerActions.append(previewTunedDirectBtn);
                }
                else {
                    bannerActions.append(insertTunedDirectBtn);
                }
                tunedBanner.append(bannerHdr, changesList, bannerNote, bannerActions);
            }
            else {
                card.style.borderColor = model.rank === 1 ? '#fde047' : '#dfe3ea';
                card.style.boxShadow = '0 1px 3px rgba(31, 41, 55, 0.04)';
                insertBtn2.innerHTML = '📥 Insert into Notebook';
                tunedBanner.style.display = 'none';
                tunedBanner.replaceChildren();
            }
        };
        if (model.automl_measured && !model.code_available) {
            codeToggleBtn.disabled = true;
            previewBtn.disabled = true;
            copyBtn2.disabled = true;
            insertBtn2.disabled = true;
            const note = document.createElement('div');
            note.style.cssText =
                'font-size:11px;color:#b45309;margin-top:8px;';
            note.textContent =
                model.code_error || 'Executable code is unavailable.';
            card.appendChild(note);
        }
        if (!this._canUseCodeAction('insert')) {
            btnRow.append(previewBtn);
        }
        else {
            btnRow.append(previewBtn, copyBtn2, insertBtn2);
        }
        card.append(tunedBanner, btnRow);
        // Initialize display state
        model.refreshCode();
        return card;
    }
    // ═════════════════════════════════════════════════════════════════
    // VIEW 5: ⚗️ MODEL VISUALIZATION LAB
    // ═════════════════════════════════════════════════════════════════
    _renderModelLabTab() {
        const frag = document.createDocumentFragment();
        const hdr = document.createElement('div');
        hdr.className = 'mm-studio-section';
        hdr.innerHTML = `
      <div class="mm-studio-sec-title"><span>⚗️</span> Model Visualization Lab</div>
      <div class="mm-studio-sec-sub">Interactive visualizers for foundational machine learning algorithms.</div>
    `;
        frag.appendChild(hdr);
        // Sub-nav for models
        const modelNav = document.createElement('div');
        modelNav.className = 'mm-studio-level-row';
        const models = [
            { id: 'gd', label: '📉 Gradient Descent' },
            { id: 'tree', label: '🌳 Decision Tree' },
            { id: 'knn', label: '🔵 KNN' },
            { id: 'kmeans', label: '🔮 K-Means' },
            { id: 'pca', label: '📐 PCA' },
        ];
        let selectedModel = 'gd';
        const modelContainer = document.createElement('div');
        modelContainer.className = 'mm-lab-model-container';
        models.forEach(m => {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = `mm-level-pill ${m.id === selectedModel ? 'active' : ''}`;
            b.textContent = m.label;
            b.addEventListener('click', () => {
                selectedModel = m.id;
                modelNav.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
                b.classList.add('active');
                this._renderSelectedModel(modelContainer, selectedModel);
            });
            modelNav.appendChild(b);
        });
        frag.appendChild(modelNav);
        frag.appendChild(modelContainer);
        this._contentArea.appendChild(frag);
        this._renderSelectedModel(modelContainer, selectedModel);
    }
    _renderSelectedModel(container, modelId) {
        container.replaceChildren();
        if (modelId === 'gd') {
            this._renderGradientDescentLab(container);
        }
        else if (modelId === 'tree') {
            this._renderDecisionTreeLab(container);
        }
        else if (modelId === 'knn') {
            this._renderKNNLab(container);
        }
        else if (modelId === 'kmeans') {
            this._renderKMeansLab(container);
        }
        else if (modelId === 'pca') {
            this._renderPCALab(container);
        }
    }
    // 1. Gradient Descent Interactive Simulator
    _renderGradientDescentLab(container) {
        const wrap = document.createElement('div');
        wrap.className = 'mm-studio-card';
        // State
        let w = 0.1;
        let b = 0.5;
        let lr = 0.05;
        let epoch = 0;
        let isRunning = false;
        let timer = null;
        // Fixed dummy data points for regression: y = 2x + 1 + noise
        const dataPoints = [
            { x: 0.1, y: 1.1 }, { x: 0.2, y: 1.5 }, { x: 0.3, y: 1.6 },
            { x: 0.4, y: 1.9 }, { x: 0.5, y: 2.1 }, { x: 0.6, y: 2.2 },
            { x: 0.7, y: 2.6 }, { x: 0.8, y: 2.7 }, { x: 0.9, y: 2.9 }
        ];
        const lossHistory = [];
        const computeLoss = (weight, bias) => {
            let sum = 0;
            dataPoints.forEach(p => {
                const pred = weight * p.x + bias;
                sum += Math.pow(pred - p.y, 2);
            });
            return sum / dataPoints.length;
        };
        const stepGD = () => {
            let gradW = 0;
            let gradB = 0;
            const n = dataPoints.length;
            dataPoints.forEach(p => {
                const diff = (w * p.x + b) - p.y;
                gradW += (2 / n) * diff * p.x;
                gradB += (2 / n) * diff;
            });
            w -= lr * gradW;
            b -= lr * gradB;
            epoch++;
            lossHistory.push(computeLoss(w, b));
            updateView();
        };
        wrap.innerHTML = `
      <div style="font-weight:700; font-size:13px; margin-bottom:8px; display:flex; justify-content:space-between;">
        <span>Gradient Descent Regression Simulator</span>
        <span class="mm-studio-badge badge-num">Optimization</span>
      </div>
      <div style="font-size:11px; opacity:.7; margin-bottom:12px;">Watch the regression line fit the data and loss minimize step-by-step.</div>

      <!-- Controls -->
      <div class="mm-lab-controls">
        <label class="mm-lab-ctrl-row">
          <span>Learning Rate (α): <b id="gd-lr-val">${lr}</b></span>
          <input type="range" id="gd-lr" min="0.01" max="0.2" step="0.01" value="${lr}" />
        </label>
        <div style="display:flex; gap:6px; margin-top:8px;">
          <button type="button" class="mm-studio-btn mm-btn-sm mm-btn-primary" id="gd-play">▶ Play</button>
          <button type="button" class="mm-studio-btn mm-btn-sm" id="gd-step">⏭ Step</button>
          <button type="button" class="mm-studio-btn mm-btn-sm" id="gd-reset">🔄 Reset</button>
        </div>
      </div>

      <!-- Live metrics -->
      <div class="mm-studio-stats-grid" style="margin-top:10px;">
        <div class="mm-stat-box"><div class="mm-stat-val" id="gd-epoch">0</div><div class="mm-stat-lbl">Epoch</div></div>
        <div class="mm-stat-box"><div class="mm-stat-val" id="gd-w">0.10</div><div class="mm-stat-lbl">Weight (w)</div></div>
        <div class="mm-stat-box"><div class="mm-stat-val" id="gd-b">0.50</div><div class="mm-stat-lbl">Bias (b)</div></div>
        <div class="mm-stat-box"><div class="mm-stat-val" id="gd-loss" style="color:#f87171;">—</div><div class="mm-stat-lbl">MSE Loss</div></div>
      </div>

      <!-- Canvas for Plot -->
      <div style="margin-top:12px; border:1px solid #dfe3ea; border-radius:8px; overflow:hidden; background:#ffffff; padding:8px;">
        <div style="font-size:10px; font-weight:600; color:#64748b; margin-bottom:4px;">Regression Line & Data Points</div>
        <svg id="gd-canvas" viewBox="0 0 300 160" style="width:100%; height:160px; display:block;"></svg>
      </div>
    `;
        container.appendChild(wrap);
        const svg = wrap.querySelector('#gd-canvas');
        const epochEl = wrap.querySelector('#gd-epoch');
        const wEl = wrap.querySelector('#gd-w');
        const bEl = wrap.querySelector('#gd-b');
        const lossEl = wrap.querySelector('#gd-loss');
        const lrInput = wrap.querySelector('#gd-lr');
        const lrVal = wrap.querySelector('#gd-lr-val');
        const playBtn = wrap.querySelector('#gd-play');
        const stepBtn = wrap.querySelector('#gd-step');
        const resetBtn = wrap.querySelector('#gd-reset');
        lrInput.addEventListener('input', () => {
            lr = parseFloat(lrInput.value);
            lrVal.textContent = lr.toFixed(2);
        });
        const updateView = () => {
            epochEl.textContent = String(epoch);
            wEl.textContent = w.toFixed(2);
            bEl.textContent = b.toFixed(2);
            const curLoss = computeLoss(w, b);
            lossEl.textContent = curLoss.toFixed(4);
            // Render SVG
            const wPx = 300;
            const hPx = 160;
            const pad = 24;
            const scaleX = (x) => pad + x * (wPx - pad * 2);
            const scaleY = (y) => hPx - pad - (y / 3.5) * (hPx - pad * 2);
            let svgHtml = `
        <line x1="${pad}" y1="${hPx - pad}" x2="${wPx - pad}" y2="${hPx - pad}" stroke="#334155" stroke-width="1"/>
        <line x1="${pad}" y1="${pad}" x2="${pad}" y2="${hPx - pad}" stroke="#334155" stroke-width="1"/>
      `;
            // Data points
            dataPoints.forEach(p => {
                svgHtml += `<circle cx="${scaleX(p.x)}" cy="${scaleY(p.y)}" r="4" fill="#818cf8"/>`;
            });
            // Fitted Line
            const y0 = w * 0 + b;
            const y1 = w * 1.0 + b;
            svgHtml += `
        <line x1="${scaleX(0)}" y1="${scaleY(y0)}" x2="${scaleX(1.0)}" y2="${scaleY(y1)}"
          stroke="#34d399" stroke-width="2.5" stroke-linecap="round"/>
      `;
            svg.innerHTML = svgHtml;
        };
        stepBtn.addEventListener('click', () => stepGD());
        playBtn.addEventListener('click', () => {
            isRunning = !isRunning;
            playBtn.textContent = isRunning ? '⏸ Pause' : '▶ Play';
            playBtn.className = isRunning ? 'mm-studio-btn mm-btn-sm mm-btn-accent' : 'mm-studio-btn mm-btn-sm mm-btn-primary';
            if (isRunning) {
                timer = setInterval(() => {
                    if (epoch >= 100) {
                        clearInterval(timer);
                        isRunning = false;
                        playBtn.textContent = '▶ Play';
                        return;
                    }
                    stepGD();
                }, 100);
            }
            else {
                clearInterval(timer);
            }
        });
        resetBtn.addEventListener('click', () => {
            clearInterval(timer);
            isRunning = false;
            playBtn.textContent = '▶ Play';
            w = 0.1;
            b = 0.5;
            epoch = 0;
            lossHistory.length = 0;
            updateView();
        });
        updateView();
    }
    // 2. Decision Tree Visualizer
    _renderDecisionTreeLab(container) {
        const wrap = document.createElement('div');
        wrap.className = 'mm-studio-card';
        wrap.innerHTML = `
      <div style="font-weight:700; font-size:13px; margin-bottom:8px; display:flex; justify-content:space-between;">
        <span>Decision Tree Node Split Visualizer</span>
        <span class="mm-studio-badge badge-cat">Classification</span>
      </div>
      <div style="font-size:11px; opacity:.7; margin-bottom:12px;">Visualize how a tree splits data on features to minimize impurity.</div>

      <div class="mm-tree-diagram">
        <div class="mm-tree-node root">
          <div class="mm-node-title">Root Node [Petal Length ≤ 2.45]</div>
          <div class="mm-node-meta">Gini = 0.667 • Samples = 150</div>
        </div>
        <div class="mm-tree-branches">
          <div class="mm-tree-branch">
            <div class="mm-branch-label">True</div>
            <div class="mm-tree-node leaf leaf-a">
              <div class="mm-node-title">Setosa (Class 0)</div>
              <div class="mm-node-meta">Gini = 0.0 • Samples = 50</div>
            </div>
          </div>
          <div class="mm-tree-branch">
            <div class="mm-branch-label">False</div>
            <div class="mm-tree-node internal">
              <div class="mm-node-title">[Petal Width ≤ 1.75]</div>
              <div class="mm-node-meta">Gini = 0.50 • Samples = 100</div>
              <div class="mm-tree-subbranches">
                <div class="mm-tree-node leaf leaf-b">Versicolor (49/5)</div>
                <div class="mm-tree-node leaf leaf-c">Virginica (1/45)</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
        container.appendChild(wrap);
    }
    // 3. KNN Visualizer
    _renderKNNLab(container) {
        const wrap = document.createElement('div');
        wrap.className = 'mm-studio-card';
        wrap.innerHTML = `
      <div style="font-weight:700; font-size:13px; margin-bottom:8px; display:flex; justify-content:space-between;">
        <span>k-Nearest Neighbors (KNN) 2D Space</span>
        <span class="mm-studio-badge badge-cat">Instance-Based</span>
      </div>
      <div style="font-size:11px; opacity:.7; margin-bottom:12px;">Click anywhere on the 2D grid to predict its class using k nearest neighbors.</div>

      <label class="mm-lab-ctrl-row">
        <span>k Neighbors: <b id="knn-k-val">3</b></span>
        <input type="range" id="knn-k" min="1" max="9" step="2" value="3" />
      </label>

      <div style="margin-top:10px; border:1px solid #dfe3ea; border-radius:8px; background:#ffffff; overflow:hidden;">
        <svg id="knn-svg" viewBox="0 0 300 180" style="width:100%; height:180px; display:block; cursor:crosshair;"></svg>
      </div>
      <div id="knn-pred-box" style="margin-top:8px; font-size:11px; font-weight:700; text-align:center; color:#0284c7;">
        Click the plot to classify a query point!
      </div>
    `;
        container.appendChild(wrap);
        const svg = wrap.querySelector('#knn-svg');
        const kInput = wrap.querySelector('#knn-k');
        const kVal = wrap.querySelector('#knn-k-val');
        const predBox = wrap.querySelector('#knn-pred-box');
        let k = 3;
        let queryPt = { x: 150, y: 90 };
        const classA = [
            { x: 50, y: 50 }, { x: 70, y: 70 }, { x: 80, y: 40 }, { x: 100, y: 60 }, { x: 90, y: 90 }, { x: 60, y: 110 }
        ];
        const classB = [
            { x: 220, y: 130 }, { x: 240, y: 150 }, { x: 210, y: 160 }, { x: 200, y: 120 }, { x: 250, y: 110 }, { x: 180, y: 140 }
        ];
        const draw = () => {
            let svgContent = '';
            classA.forEach(p => {
                svgContent += `<circle cx="${p.x}" cy="${p.y}" r="5" fill="#38bdf8" />`;
            });
            classB.forEach(p => {
                svgContent += `<circle cx="${p.x}" cy="${p.y}" r="5" fill="#f59e0b" />`;
            });
            if (queryPt) {
                // Compute distances
                const all = [
                    ...classA.map(p => ({ ...p, cls: 'Class A (Blue)' })),
                    ...classB.map(p => ({ ...p, cls: 'Class B (Amber)' }))
                ];
                all.sort((a, b) => {
                    const d1 = Math.hypot(a.x - queryPt.x, a.y - queryPt.y);
                    const d2 = Math.hypot(b.x - queryPt.x, b.y - queryPt.y);
                    return d1 - d2;
                });
                const neighbors = all.slice(0, k);
                const maxDist = Math.hypot(neighbors[neighbors.length - 1].x - queryPt.x, neighbors[neighbors.length - 1].y - queryPt.y);
                // Dashed circle
                svgContent += `<circle cx="${queryPt.x}" cy="${queryPt.y}" r="${maxDist}" fill="none" stroke="#a78bfa" stroke-dasharray="4" stroke-width="1.5"/>`;
                // Lines to neighbors
                neighbors.forEach(n => {
                    svgContent += `<line x1="${queryPt.x}" y1="${queryPt.y}" x2="${n.x}" y2="${n.y}" stroke="#a78bfa" stroke-width="1" opacity="0.6"/>`;
                });
                // Query point
                svgContent += `<circle cx="${queryPt.x}" cy="${queryPt.y}" r="6" fill="#ec4899" stroke="#fff" stroke-width="2"/>`;
                // Majority vote
                const countA = neighbors.filter(n => n.cls.includes('Class A')).length;
                const countB = k - countA;
                const winner = countA > countB ? 'Class A (Blue)' : 'Class B (Amber)';
                predBox.innerHTML = `Predicted: <span style="color:${countA > countB ? '#38bdf8' : '#f59e0b'}">${winner}</span> (${countA} vs ${countB} votes)`;
            }
            svg.innerHTML = svgContent;
        };
        kInput.addEventListener('input', () => {
            k = parseInt(kInput.value);
            kVal.textContent = String(k);
            draw();
        });
        svg.addEventListener('click', (e) => {
            const rect = svg.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 300;
            const y = ((e.clientY - rect.top) / rect.height) * 180;
            queryPt = { x, y };
            draw();
        });
        draw();
    }
    // 4. K-Means Clustering Visualizer
    _renderKMeansLab(container) {
        const wrap = document.createElement('div');
        wrap.className = 'mm-studio-card';
        wrap.innerHTML = `
      <div style="font-weight:700; font-size:13px; margin-bottom:8px; display:flex; justify-content:space-between;">
        <span>K-Means Clustering Simulator</span>
        <span class="mm-studio-badge badge-num">Clustering</span>
      </div>
      <div style="font-size:11px; opacity:.7; margin-bottom:12px;">Iteratively update cluster centroids to minimize within-cluster variance.</div>
      <div style="display:flex; gap:6px; margin-bottom:10px;">
        <button type="button" class="mm-studio-btn mm-btn-sm mm-btn-primary" id="km-step">Step Centroids</button>
        <button type="button" class="mm-studio-btn mm-btn-sm" id="km-reset">Reset</button>
      </div>
      <div style="border:1px solid #dfe3ea; border-radius:8px; background:#ffffff; overflow:hidden;">
        <svg id="km-svg" viewBox="0 0 300 160" style="width:100%; height:160px; display:block;"></svg>
      </div>
    `;
        container.appendChild(wrap);
        const svg = wrap.querySelector('#km-svg');
        const stepBtn = wrap.querySelector('#km-step');
        const resetBtn = wrap.querySelector('#km-reset');
        const points = [
            { x: 40, y: 40 }, { x: 50, y: 60 }, { x: 60, y: 35 }, { x: 70, y: 65 }, { x: 80, y: 50 },
            { x: 220, y: 120 }, { x: 230, y: 140 }, { x: 240, y: 110 }, { x: 250, y: 135 }, { x: 210, y: 130 },
            { x: 140, y: 90 }, { x: 150, y: 110 }, { x: 160, y: 85 }
        ];
        let centroids = [
            { x: 50, y: 120, color: '#38bdf8' },
            { x: 200, y: 50, color: '#f59e0b' }
        ];
        const drawKM = () => {
            let svgHtml = '';
            points.forEach(p => {
                // Assign to nearest centroid
                const d0 = Math.hypot(p.x - centroids[0].x, p.y - centroids[0].y);
                const d1 = Math.hypot(p.x - centroids[1].x, p.y - centroids[1].y);
                const col = d0 < d1 ? centroids[0].color : centroids[1].color;
                svgHtml += `<circle cx="${p.x}" cy="${p.y}" r="4" fill="${col}" opacity="0.8"/>`;
            });
            // Centroids as glowing crosses
            centroids.forEach(c => {
                svgHtml += `
          <line x1="${c.x - 6}" y1="${c.y - 6}" x2="${c.x + 6}" y2="${c.y + 6}" stroke="${c.color}" stroke-width="3"/>
          <line x1="${c.x - 6}" y1="${c.y + 6}" x2="${c.x + 6}" y2="${c.y - 6}" stroke="${c.color}" stroke-width="3"/>
        `;
            });
            svg.innerHTML = svgHtml;
        };
        stepBtn.addEventListener('click', () => {
            // Recompute means
            const cluster0 = points.filter(p => Math.hypot(p.x - centroids[0].x, p.y - centroids[0].y) <= Math.hypot(p.x - centroids[1].x, p.y - centroids[1].y));
            const cluster1 = points.filter(p => Math.hypot(p.x - centroids[0].x, p.y - centroids[0].y) > Math.hypot(p.x - centroids[1].x, p.y - centroids[1].y));
            if (cluster0.length > 0) {
                centroids[0].x = cluster0.reduce((s, p) => s + p.x, 0) / cluster0.length;
                centroids[0].y = cluster0.reduce((s, p) => s + p.y, 0) / cluster0.length;
            }
            if (cluster1.length > 0) {
                centroids[1].x = cluster1.reduce((s, p) => s + p.x, 0) / cluster1.length;
                centroids[1].y = cluster1.reduce((s, p) => s + p.y, 0) / cluster1.length;
            }
            drawKM();
        });
        resetBtn.addEventListener('click', () => {
            centroids = [
                { x: 50, y: 120, color: '#38bdf8' },
                { x: 200, y: 50, color: '#f59e0b' }
            ];
            drawKM();
        });
        drawKM();
    }
    // 5. PCA Visualizer
    _renderPCALab(container) {
        const wrap = document.createElement('div');
        wrap.className = 'mm-studio-card';
        wrap.innerHTML = `
      <div style="font-weight:700; font-size:13px; margin-bottom:8px; display:flex; justify-content:space-between;">
        <span>Principal Component Analysis (PCA)</span>
        <span class="mm-studio-badge badge-num">Dim Reduction</span>
      </div>
      <div style="font-size:11px; opacity:.7; margin-bottom:12px;">Projects high-dimensional data onto orthogonal axes of maximum variance.</div>

      <div style="font-size:11px; font-weight:600; margin-bottom:6px;">Variance Explained Ratio (Scree Plot):</div>
      <div class="mm-studio-bar-row">
        <div class="mm-studio-bar-label"><span>PC 1 (First Component)</span><span>72.8%</span></div>
        <div class="mm-studio-bar-track"><div class="mm-studio-bar-fill" style="width:72.8%; background:#818cf8;"></div></div>
      </div>
      <div class="mm-studio-bar-row">
        <div class="mm-studio-bar-label"><span>PC 2 (Second Component)</span><span>21.4%</span></div>
        <div class="mm-studio-bar-track"><div class="mm-studio-bar-fill" style="width:21.4%; background:#38bdf8;"></div></div>
      </div>
      <div class="mm-studio-bar-row">
        <div class="mm-studio-bar-label"><span>PC 3 (Residual)</span><span>5.8%</span></div>
        <div class="mm-studio-bar-track"><div class="mm-studio-bar-fill" style="width:5.8%; background:#64748b;"></div></div>
      </div>
    `;
        container.appendChild(wrap);
    }
    // ═════════════════════════════════════════════════════════════════
    // VIEW 6: 📖 PREPROCESSING & ML GUIDE
    // ═════════════════════════════════════════════════════════════════
    _renderGuideTab() {
        const frag = document.createDocumentFragment();
        const hdr = document.createElement('div');
        hdr.className = 'mm-studio-section';
        hdr.innerHTML = `
      <div class="mm-studio-sec-title"><span>📖</span> Preprocessing & ML Handbook</div>
      <div class="mm-studio-sec-sub">Essential guides and best practices for robust data preparation.</div>
    `;
        frag.appendChild(hdr);
        const installCard = document.createElement('section');
        installCard.className = 'mm-studio-card';
        installCard.setAttribute('aria-labelledby', 'mm-guide-install-title');
        const installTitle = document.createElement('div');
        installTitle.id = 'mm-guide-install-title';
        installTitle.className = 'mm-studio-sec-title';
        installTitle.textContent = '📦 Install ML Libraries';
        const installDescription = document.createElement('div');
        installDescription.className = 'mm-studio-sec-sub';
        installDescription.style.marginTop = '0';
        installDescription.textContent =
            'Copy this single command into a notebook code cell and run it to install the libraries in the active notebook kernel. Internet access is required; installation may take a while.';
        const installCommand = '%pip install numpy pandas scipy scikit-learn xgboost lightgbm catboost imbalanced-learn statsmodels joblib matplotlib seaborn plotly shap optuna';
        const installCode = document.createElement('pre');
        installCode.style.cssText =
            'background:#f8fafc;border:1px solid #dfe3ea;border-radius:8px;' +
                'padding:10px 12px;margin:0;overflow-x:auto;white-space:pre;' +
                'font:11px/1.6 ui-monospace,SFMono-Regular,monospace;color:#1e293b;';
        installCode.textContent = installCommand;
        const copyInstallButton = document.createElement('button');
        copyInstallButton.type = 'button';
        copyInstallButton.className = 'mm-studio-btn mm-btn-sm mm-btn-primary';
        copyInstallButton.textContent = '📋 Copy install command';
        copyInstallButton.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(installCommand);
                copyInstallButton.textContent = 'Copied!';
                this._showToast('✓ Install command copied. Paste it into a notebook cell.');
                window.setTimeout(() => {
                    copyInstallButton.textContent = '📋 Copy install command';
                }, 1800);
            }
            catch (_a) {
                this._showToast('Could not access the clipboard. Select and copy the command above.');
            }
        });
        const installActions = document.createElement('div');
        installActions.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;';
        installActions.appendChild(copyInstallButton);
        const insertInstallButton = document.createElement('button');
        insertInstallButton.type = 'button';
        insertInstallButton.className = 'mm-studio-btn mm-btn-sm';
        insertInstallButton.textContent = '📥 Insert into notebook';
        insertInstallButton.addEventListener('click', () => {
            const inserted = this._insertCodeBelow(installCommand);
            this._showToast(inserted
                ? '✓ Install command inserted below the active cell. Run that cell to install the libraries.'
                : 'Open a notebook and select a cell before inserting the install command.');
        });
        if (!this._canUseCodeAction('copy')) {
            const previewInstallButton = document.createElement('button');
            previewInstallButton.type = 'button';
            previewInstallButton.className = 'mm-studio-btn mm-btn-sm';
            previewInstallButton.textContent = '🔍 Preview Code';
            previewInstallButton.addEventListener('click', () => {
                this._showCodePreviewModal('ML library install command', installCommand, 'basic');
            });
            installActions.replaceChildren(previewInstallButton);
        }
        else {
            installActions.appendChild(insertInstallButton);
        }
        installCard.append(installTitle, installDescription, installCode, installActions);
        frag.appendChild(installCard);
        const guides = [
            {
                title: '1. Handling Missing Data (Imputation)',
                emoji: '🩹',
                content: `
          • <b>MCAR (Missing Completely at Random):</b> Safe to drop if < 5% or use Mean/Median.<br/>
          • <b>MAR (Missing at Random):</b> Impute using KNN or IterativeImputer conditioned on other features.<br/>
          • <b>MNAR (Missing Not at Random):</b> Create a missingness indicator column before imputing.<br/>
          • <b>Rule of Thumb:</b> Use Median over Mean when data is skewed or contains outliers.
        `
            },
            {
                title: '2. Categorical Encoding Guide',
                emoji: '🏷️',
                content: `
          • <b>One-Hot Encoding:</b> Best for nominal data with low cardinality (< 10 unique values). Always set <code>handle_unknown='ignore'</code> for test data!<br/>
          • <b>Ordinal Encoding:</b> Use only when natural ranking exists (e.g. Low, Medium, High).<br/>
          • <b>Target / Frequency Encoding:</b> Best for high-cardinality features. Always compute inside CV loops to avoid leakage!
        `
            },
            {
                title: '3. Feature Scaling & Normalization',
                emoji: '⚖️',
                content: `
          • <b>StandardScaler:</b> Transforms features to mean=0, std=1. Essential for Logistic Regression, SVM, KNN, Neural Networks.<br/>
          • <b>RobustScaler:</b> Uses median and IQR. Best when features have extreme outliers.<br/>
          • <b>MinMaxScaler:</b> Bounds features strictly to [0, 1]. Best for image pixels or neural activations.<br/>
          • <b>Tree Models:</b> Random Forest and XGBoost do NOT require feature scaling.
        `
            },
            {
                title: '4. Outlier Detection & Treatment',
                emoji: '🎯',
                content: `
          • <b>IQR Rule:</b> Points outside [Q1 - 1.5×IQR, Q3 + 1.5×IQR] are potential outliers.<br/>
          • <b>Capping / Winsorization:</b> Clip values to 1st and 99th percentiles rather than deleting rows to preserve sample size.
        `
            },
            {
                title: '5. Preventing Data Leakage Checklist',
                emoji: '🛡️',
                content: `
          • Always call <code>train_test_split</code> BEFORE fitting any Scaler or Imputer!<br/>
          • Fit transformers on training data only (<code>fit_transform</code>), then only <code>transform</code> the test data.<br/>
          • Never include the target variable in feature matrices.
        `
            }
        ];
        guides.forEach(g => {
            const card = document.createElement('div');
            card.className = 'mm-studio-card mm-guide-card';
            card.innerHTML = `
        <div class="mm-guide-hdr">
          <span>${g.emoji} ${g.title}</span>
        </div>
        <div class="mm-guide-body">${g.content}</div>
      `;
            frag.appendChild(card);
        });
        this._contentArea.appendChild(frag);
    }
    // ═════════════════════════════════════════════════════════════════
    // UTILITIES: INSERT CODE & TOAST
    // ═════════════════════════════════════════════════════════════════
    _insertPreprocessingCode(code) {
        const current = this._notebooks.currentWidget;
        if (!(current === null || current === void 0 ? void 0 : current.content)) {
            this._showToast('Open a notebook first.');
            return false;
        }
        return this._insertCodeBelow(code);
    }
    _insertCodeBelow(code) {
        const current = this._notebooks.currentWidget;
        if (!current)
            return false;
        const notebook = current.content;
        if (!(notebook === null || notebook === void 0 ? void 0 : notebook.model))
            return false;
        const insertedIndex = notebook.activeCell
            ? notebook.activeCellIndex + 1
            : notebook.model.cells.length;
        notebook.model.sharedModel.insertCell(insertedIndex, {
            cell_type: 'code',
            source: code,
            metadata: { trusted: true }
        });
        notebook.activeCellIndex = insertedIndex;
        return true;
    }
    _createStatCard(lbl, val, status = 'default') {
        const box = document.createElement('div');
        box.className = 'mm-stat-box';
        const valEl = document.createElement('div');
        valEl.className = 'mm-stat-val';
        if (status === 'warn')
            valEl.style.color = '#f87171';
        if (status === 'ok')
            valEl.style.color = '#34d399';
        valEl.textContent = String(val);
        const lblEl = document.createElement('div');
        lblEl.className = 'mm-stat-lbl';
        lblEl.textContent = lbl;
        box.append(valEl, lblEl);
        return box;
    }
    _showToast(msg) {
        const t = document.createElement('div');
        t.className = 'mm-studio-toast';
        t.textContent = msg;
        this._root.appendChild(t);
        setTimeout(() => {
            t.classList.add('fade-out');
            setTimeout(() => t.remove(), 400);
        }, 2200);
    }
}
function createModelMindStudioWidget(app, notebooks) {
    return new ModelMindStudioWidget(app, notebooks);
}


},
"./lib/notebook-mode.js"(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  MODEL_MIND_NOTEBOOK_TYPE: () => (MODEL_MIND_NOTEBOOK_TYPE),
  canUseNotebookCodeAction: () => (canUseNotebookCodeAction),
  getModelMindNotebookRole: () => (getModelMindNotebookRole)
});
const MODEL_MIND_NOTEBOOK_TYPE = 'modelmind_notebook_type';
function getModelMindNotebookRole(model) {
    const role = model === null || model === void 0 ? void 0 : model.getMetadata(MODEL_MIND_NOTEBOOK_TYPE);
    if (role === 'trainer' || role === 'plain' || role === 'practice') {
        return role;
    }
    return 'modelmind';
}
function canUseNotebookCodeAction(role, action) {
    if (role === 'plain') {
        return false;
    }
    return role !== 'trainer' || action === 'preview';
}


},
"./lib/practice-questions.js"(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  createPracticeQuestionsWidget: () => (createPracticeQuestionsWidget)
});
/* import */ var _lumino_widgets__rspack_import_0 = __webpack_require__("webpack/sharing/consume/default/@lumino/widgets");
/* import */ var _lumino_widgets__rspack_import_0_default = /*#__PURE__*/__webpack_require__.n(_lumino_widgets__rspack_import_0);
/* import */ var _request__rspack_import_1 = __webpack_require__("./lib/request.js");


const QUESTION_CELL = 'practice-question';
const ANSWER_CELL = 'practice-answer';
function isPracticeNotebook(notebooks) {
    var _a;
    return ((_a = notebooks.currentWidget) === null || _a === void 0 ? void 0 : _a.context.model.getMetadata('modelmind_notebook_type')) === 'practice';
}
function escapeMarkdown(value) {
    return value.replace(/\r/g, '').trim();
}
function questionSource(question, number) {
    var _a;
    const meta = [question.topic, question.level, question.type].filter(Boolean).join(' · ');
    const mode = question.gradingMode === 'code'
        ? question.testsAvailable ? 'Hidden-test exercise' : 'AI-reviewed coding exercise'
        : question.gradingMode === 'exact' ? 'Exact-answer exercise' : 'AI teacher review';
    const choices = ((_a = question.options) === null || _a === void 0 ? void 0 : _a.length)
        ? `\n\n### Options\n${question.options.map((option, index) => `${index + 1}. ${escapeMarkdown(option)}`).join('\n')}`
        : '';
    return `# Practice ${String(number).padStart(3, '0')} — ${escapeMarkdown(question.title)}\n\n` +
        `**${meta}**  \n${mode}\n\n${escapeMarkdown(question.question)}${choices}\n\n` +
        `> Write your response in the cell below. Then use **Check this answer** in the AI Chatbot panel on the right. Select Ollama or Gemini there before checking.`;
}
function answerSource(question) {
    var _a;
    if ((_a = question.options) === null || _a === void 0 ? void 0 : _a.length) {
        return '# My selected option (write its number):\n';
    }
    if (question.starterCode)
        return question.starterCode;
    return question.gradingMode === 'code'
        ? '# Write your Python solution here\n'
        : '# Write your explanation below. Use Python comments (#) or a print string so the AI teacher can read it.\n';
}
function injectPracticeStyles() {
    if (document.getElementById('mm-practice-questions-styles'))
        return;
    const style = document.createElement('style');
    style.id = 'mm-practice-questions-styles';
    style.textContent = `
    .mm-practice-root { height: 100%; display: flex; flex-direction: column; overflow: hidden; background: #f7f8fc; color: #24324a; font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
    .mm-practice-header { padding: 15px 14px 13px; border-bottom: 1px solid #dbe3f0; background: linear-gradient(135deg, #f9fbff 0%, #f0f3ff 100%); }
    .mm-practice-title-row { display: flex; align-items: flex-start; gap: 10px; }
    .mm-practice-brand { display: flex; min-width: 0; flex: 1; align-items: center; gap: 10px; }
    .mm-practice-brand-mark { display: grid; width: 34px; height: 34px; flex: 0 0 34px; place-items: center; border-radius: 10px; background: linear-gradient(135deg, #6d4aff, #3f50db); box-shadow: 0 5px 12px rgba(79, 70, 229, .22); color: #fff; font-size: 20px; font-weight: 800; transform: rotate(-4deg); }
    .mm-practice-heading-copy { min-width: 0; }
    .mm-practice-kicker { color: #6851dc; font-size: 9px; font-weight: 850; letter-spacing: .13em; line-height: 1.2; }
    .mm-practice-title-row h2 { margin: 2px 0 0; color: #1d2d58; font-size: 16px; line-height: 1.18; letter-spacing: -.01em; }
    .mm-practice-collapse { border: 1px solid #cfd9eb; background: #fff; color: #4757c9; border-radius: 7px; padding: 5px 8px; box-shadow: 0 1px 1px rgba(38, 61, 105, .04); cursor: pointer; font-size: 10px; font-weight: 800; white-space: nowrap; }
    .mm-practice-collapse:hover { border-color: #7480eb; background: #f7f8ff; }
    .mm-practice-header p { margin: 10px 0 0; color: #60708a; font-size: 11px; line-height: 1.48; }
    .mm-practice-summary { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 11px; }
    .mm-practice-summary span { border: 1px solid #d8e1ef; border-radius: 999px; background: #fff; color: #52617a; padding: 3px 7px; font-size: 9px; font-weight: 800; }
    .mm-practice-summary span:first-child { border-color: #c8c0ff; background: #f1efff; color: #5846d1; }
    .mm-practice-controls { display: grid; grid-template-columns: 1fr; gap: 7px; padding: 11px 12px 10px; border-bottom: 1px solid #dfe6f1; background: #fff; }
    .mm-practice-control-label { color: #76839a; font-size: 9px; font-weight: 850; letter-spacing: .08em; text-transform: uppercase; }
    .mm-practice-controls input, .mm-practice-controls select { box-sizing: border-box; width: 100%; min-height: 31px; border: 1px solid #cfd9e8; border-radius: 7px; background: #fbfcff; color: #253452; padding: 7px 9px; font: inherit; font-size: 11px; outline: none; }
    .mm-practice-controls input:focus, .mm-practice-controls select:focus { border-color: #5d55df; box-shadow: 0 0 0 3px rgba(93, 85, 223, .12); background: #fff; }
    .mm-practice-count { color: #65738b; font-size: 10px; font-weight: 750; }
    .mm-practice-list { flex: 1; overflow: auto; padding: 11px 10px 18px; background: linear-gradient(180deg, #f9fafc, #f5f7fb); }
    .mm-practice-group { margin: 0 0 16px; }
    .mm-practice-group-heading { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; margin: 2px 3px 8px; color: #384b74; font-size: 10px; font-weight: 900; letter-spacing: .075em; text-transform: uppercase; }
    .mm-practice-group-heading span { color: #7c89a0; font-size: 9px; font-weight: 800; letter-spacing: 0; text-transform: none; }
    .mm-practice-group.code .mm-practice-group-heading { color: #2a65b7; }
    .mm-practice-group.review .mm-practice-group-heading { color: #6747cc; }
    .mm-practice-group.exact .mm-practice-group-heading { color: #168166; }
    .mm-practice-item { display: grid; grid-template-columns: 30px minmax(0, 1fr); gap: 9px; width: 100%; margin: 0 0 7px; padding: 10px; border: 1px solid #d9e1ed; border-radius: 9px; text-align: left; background: #fff; box-shadow: 0 1px 2px rgba(38, 61, 105, .035); color: inherit; cursor: pointer; transition: border-color .16s ease, box-shadow .16s ease, transform .16s ease; }
    .mm-practice-item:hover { border-color: #91a2e9; box-shadow: 0 5px 14px rgba(49, 72, 135, .09); transform: translateY(-1px); }
    .mm-practice-item.active { border-color: #4f46e5; background: linear-gradient(135deg, #f4f2ff, #fff); box-shadow: 0 0 0 2px rgba(79, 70, 229, .13), 0 6px 16px rgba(79, 70, 229, .08); }
    .mm-practice-number { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 8px; background: #edf0ff; color: #5143cb; font-size: 10px; font-weight: 900; }
    .mm-practice-item.active .mm-practice-number { background: #5749d8; color: #fff; }
    .mm-practice-item b { display: block; color: #293852; font-size: 12px; line-height: 1.3; }
    .mm-practice-item small { display: block; margin-top: 3px; color: #718099; font-size: 10px; line-height: 1.3; }
    .mm-practice-item em { display: inline-flex; margin-top: 5px; border-radius: 4px; background: #eef0fb; color: #5d50ca; padding: 2px 5px; font-size: 9px; font-style: normal; font-weight: 850; }
    .mm-practice-group.exact .mm-practice-item em { background: #e5f7f0; color: #14785f; }
    .mm-practice-status { padding: 18px 12px; color: #6d7a90; font-size: 12px; line-height: 1.5; }
    .mm-practice-status.error { color: #a32954; }
  `;
    document.head.appendChild(style);
}
function createPracticeQuestionsWidget(app, notebooks, settings) {
    injectPracticeStyles();
    const widget = new _lumino_widgets__rspack_import_0.Widget();
    widget.id = 'modelmind-practice-questions';
    widget.title.label = 'Practice Questions';
    widget.title.caption = 'Select a ModelMind practice question';
    // A distinct icon keeps the Practice panel easy to find among JupyterLab's
    // built-in File Browser, Running, and extension panels.
    widget.title.iconClass = 'mm-sidebar-icon mm-icon-practice';
    widget.addClass('mm-practice-widget');
    const root = document.createElement('div');
    root.className = 'mm-practice-root';
    const header = document.createElement('header');
    header.className = 'mm-practice-header';
    const titleRow = document.createElement('div');
    titleRow.className = 'mm-practice-title-row';
    const brand = document.createElement('div');
    brand.className = 'mm-practice-brand';
    const brandMark = document.createElement('span');
    brandMark.className = 'mm-practice-brand-mark';
    brandMark.setAttribute('aria-hidden', 'true');
    brandMark.textContent = '✎';
    const headingCopy = document.createElement('div');
    headingCopy.className = 'mm-practice-heading-copy';
    const kicker = document.createElement('div');
    kicker.className = 'mm-practice-kicker';
    kicker.textContent = 'MODELMIND PRACTICE';
    const title = document.createElement('h2');
    title.textContent = 'Choose a question';
    headingCopy.append(kicker, title);
    brand.append(brandMark, headingCopy);
    const collapse = document.createElement('button');
    collapse.className = 'mm-practice-collapse';
    collapse.type = 'button';
    collapse.textContent = 'Hide panel';
    collapse.addEventListener('click', () => {
        var _a;
        const shell = app.shell;
        (_a = shell.collapseLeft) === null || _a === void 0 ? void 0 : _a.call(shell);
    });
    titleRow.append(brand, collapse);
    const intro = document.createElement('p');
    intro.textContent = 'Choose a focused exercise, answer it in the notebook, then ask your AI teacher for clear feedback.';
    const summary = document.createElement('div');
    summary.className = 'mm-practice-summary';
    summary.setAttribute('aria-label', 'Practice bank summary');
    header.append(titleRow, intro, summary);
    const controls = document.createElement('div');
    controls.className = 'mm-practice-controls';
    const controlLabel = document.createElement('span');
    controlLabel.className = 'mm-practice-control-label';
    controlLabel.textContent = 'Browse question bank';
    const search = document.createElement('input');
    search.placeholder = 'Search questions';
    search.type = 'search';
    const topic = document.createElement('select');
    const count = document.createElement('span');
    count.className = 'mm-practice-count';
    controls.append(controlLabel, search, topic, count);
    const list = document.createElement('div');
    list.className = 'mm-practice-list';
    root.append(header, controls, list);
    widget.node.appendChild(root);
    let questions = [];
    let selectedId = '';
    const render = () => {
        const query = search.value.trim().toLowerCase();
        const selectedTopic = topic.value;
        const filtered = questions.filter(question => {
            const matchesTopic = !selectedTopic || question.topic === selectedTopic;
            const text = `${question.title} ${question.question} ${question.topic}`.toLowerCase();
            return matchesTopic && (!query || text.includes(query));
        });
        const codingCount = filtered.filter(question => question.gradingMode === 'code').length;
        const reviewCount = filtered.filter(question => question.gradingMode === 'ai').length;
        const exactCount = filtered.filter(question => question.gradingMode === 'exact').length;
        count.textContent = `${filtered.length} questions · ${codingCount} coding · ${reviewCount} AI review${exactCount ? ` · ${exactCount} exact` : ''}`;
        summary.replaceChildren(Object.assign(document.createElement('span'), { textContent: `${questions.length} questions` }), Object.assign(document.createElement('span'), { textContent: `${codingCount} coding` }), Object.assign(document.createElement('span'), { textContent: `${reviewCount} teacher review` }), Object.assign(document.createElement('span'), { textContent: `${exactCount} exact checks` }));
        list.replaceChildren();
        if (!filtered.length) {
            const empty = document.createElement('p');
            empty.className = 'mm-practice-status';
            empty.textContent = 'No questions match this search.';
            list.appendChild(empty);
            return;
        }
        const groups = [
            { label: 'Coding & debugging', className: 'code', questions: filtered.filter(question => question.gradingMode === 'code') },
            { label: 'AI concept review', className: 'review', questions: filtered.filter(question => question.gradingMode === 'ai') },
            { label: 'Quick exact checks', className: 'exact', questions: filtered.filter(question => question.gradingMode === 'exact') }
        ];
        groups.forEach(group => {
            if (!group.questions.length)
                return;
            const section = document.createElement('section');
            section.className = `mm-practice-group ${group.className}`;
            const heading = document.createElement('div');
            heading.className = 'mm-practice-group-heading';
            heading.innerHTML = `<strong>${group.label}</strong><span>${group.questions.length} question${group.questions.length === 1 ? '' : 's'}</span>`;
            section.appendChild(heading);
            group.questions.forEach(question => {
                const position = questions.findIndex(item => item.id === question.id) + 1;
                const item = document.createElement('button');
                item.type = 'button';
                item.className = `mm-practice-item${question.id === selectedId ? ' active' : ''}`;
                const kind = question.gradingMode === 'code'
                    ? question.testsAvailable ? 'Code · tests' : 'Code · AI review'
                    : question.gradingMode === 'exact' ? 'Exact check' : 'AI review';
                item.innerHTML = `<span class="mm-practice-number">${position}</span><span><b></b><small></small><em>${kind}</em></span>`;
                const name = item.querySelector('b');
                const detail = item.querySelector('small');
                if (name)
                    name.textContent = question.title;
                if (detail)
                    detail.textContent = `${question.topic} · ${question.level}`;
                item.addEventListener('click', () => selectQuestion(question));
                section.appendChild(item);
            });
            list.appendChild(section);
        });
    };
    const selectQuestion = (question) => {
        if (!isPracticeNotebook(notebooks))
            return;
        const panel = notebooks.currentWidget;
        const notebook = panel === null || panel === void 0 ? void 0 : panel.content;
        const model = notebook === null || notebook === void 0 ? void 0 : notebook.model;
        if (!panel || !notebook || !model)
            return;
        selectedId = question.id;
        const questionIndex = questions.findIndex(item => item.id === question.id) + 1;
        const cells = notebook.widgets;
        let questionCellIndex = cells.findIndex(cell => cell.model.getMetadata('modelmind_practice_role') === QUESTION_CELL);
        let answerCellIndex = cells.findIndex(cell => cell.model.getMetadata('modelmind_practice_role') === ANSWER_CELL);
        if (questionCellIndex < 0) {
            model.sharedModel.insertCell(0, { cell_type: 'markdown', source: '', metadata: { modelmind_practice_role: QUESTION_CELL } });
            questionCellIndex = 0;
        }
        if (answerCellIndex < 0) {
            answerCellIndex = questionCellIndex + 1;
            model.sharedModel.insertCell(answerCellIndex, { cell_type: 'code', source: '', metadata: { trusted: true, modelmind_practice_role: ANSWER_CELL } });
        }
        const refreshedCells = notebook.widgets;
        const promptCell = refreshedCells[questionCellIndex];
        const answerCell = refreshedCells[answerCellIndex];
        promptCell === null || promptCell === void 0 ? void 0 : promptCell.model.sharedModel.setSource(questionSource(question, questionIndex));
        answerCell === null || answerCell === void 0 ? void 0 : answerCell.model.sharedModel.setSource(answerSource(question));
        model.setMetadata('modelmind_practice_question_id', question.id);
        notebook.activeCellIndex = answerCellIndex;
        notebook.deselectAll();
        if (answerCell)
            notebook.select(answerCell);
        answerCell === null || answerCell === void 0 ? void 0 : answerCell.node.scrollIntoView({ behavior: 'smooth', block: 'center' });
        window.dispatchEvent(new CustomEvent('modelmind:practice-question-selected', { detail: { question } }));
        render();
    };
    const load = async () => {
        list.innerHTML = '<p class="mm-practice-status">Loading practice questions…</p>';
        try {
            const result = await (0,_request__rspack_import_1.requestAPI)('api/practice/questions', settings);
            questions = Array.isArray(result.questions) ? result.questions : [];
            const topics = [...new Set(questions.map(question => question.topic))].sort();
            topic.replaceChildren();
            topic.append(new Option('All topics', ''));
            topics.forEach(value => topic.append(new Option(value, value)));
            render();
        }
        catch (_a) {
            list.innerHTML = '<p class="mm-practice-status error">Practice questions could not be loaded. Restart ModelMind and try again.</p>';
        }
    };
    search.addEventListener('input', render);
    topic.addEventListener('change', render);
    void load();
    return widget;
}


},
"./lib/preprocessing-code-utils.js"(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  buildDatasetLoadingCode: () => (buildDatasetLoadingCode),
  buildFullPreprocessingCode: () => (buildFullPreprocessingCode)
});
function buildDatasetLoadingCode(selectedPath) {
    var _a;
    const datasetPath = JSON.stringify(selectedPath);
    const extension = (_a = selectedPath
        .split(/[?#]/, 1)[0]
        .split('.')
        .pop()) === null || _a === void 0 ? void 0 : _a.toLowerCase();
    const reader = extension === 'xlsx' || extension === 'xls'
        ? 'read_excel'
        : extension === 'json'
            ? 'read_json'
            : 'read_csv';
    return [
        'import pandas as pd',
        '',
        `df = pd.${reader}(${datasetPath})`,
        'print(f"Loaded dataset: {df.shape[0]} rows × {df.shape[1]} columns")'
    ].join('\n');
}
function buildFullPreprocessingCode(selectedPath, rec, selectedStrategy, recommendedCode) {
    if (recommendedCode === null || recommendedCode === void 0 ? void 0 : recommendedCode.trim()) {
        return [
            '# Recommended preprocessing workflow for the selected skill level',
            buildDatasetLoadingCode(selectedPath),
            '',
            recommendedCode.trim()
        ].join('\n');
    }
    const imports = new Set(['import pandas as pd']);
    let strategy = selectedStrategy;
    if (strategy === 'most_frequent_or_unknown') {
        strategy = 'most_frequent';
    }
    const featureName = JSON.stringify(rec.feature);
    const featureAccess = `df[${featureName}]`;
    let operation;
    switch (strategy) {
        case 'mean':
        case 'median':
            operation = [
                `${featureAccess} = pd.to_numeric(${featureAccess}, errors="coerce")`,
                `${featureAccess} = ${featureAccess}.fillna(${featureAccess}.${strategy}())`
            ].join('\n');
            break;
        case 'most_frequent':
            operation = [
                `mode = ${featureAccess}.mode(dropna=True)`,
                `fill_value = mode.iloc[0] if not mode.empty else "Unknown"`,
                `${featureAccess} = ${featureAccess}.fillna(fill_value)`
            ].join('\n');
            break;
        case 'unknown':
            operation = `${featureAccess} = ${featureAccess}.fillna("Unknown")`;
            break;
        case 'constant':
            operation = [
                ...(rec.feature_type === 'numerical'
                    ? [
                        `${featureAccess} = pd.to_numeric(${featureAccess}, errors="coerce")`
                    ]
                    : []),
                `${featureAccess} = ${featureAccess}.fillna(${rec.feature_type === 'numerical' ? '0' : '"Unknown"'})`
            ].join('\n');
            break;
        case 'drop_column':
            operation = `df = df.drop(columns=[${featureName}])`;
            break;
        case 'standard_scaler':
        case 'minmax_scaler':
        case 'robust_scaler': {
            const scaler = {
                standard_scaler: 'StandardScaler',
                minmax_scaler: 'MinMaxScaler',
                robust_scaler: 'RobustScaler'
            }[strategy];
            imports.add(`from sklearn.preprocessing import ${scaler}`);
            operation = [
                `${featureAccess} = pd.to_numeric(${featureAccess}, errors="coerce")`,
                `${featureAccess} = ${featureAccess}.fillna(${featureAccess}.median())`,
                `df[[${featureName}]] = ${scaler}().fit_transform(df[[${featureName}]])`
            ].join('\n');
            break;
        }
        case 'cap_outliers_iqr':
            operation = [
                `${featureAccess} = pd.to_numeric(${featureAccess}, errors="coerce")`,
                `q1 = ${featureAccess}.quantile(0.25)`,
                `q3 = ${featureAccess}.quantile(0.75)`,
                'iqr = q3 - q1',
                `${featureAccess} = ${featureAccess}.clip(lower=q1 - 1.5 * iqr, upper=q3 + 1.5 * iqr)`
            ].join('\n');
            break;
        case 'one_hot_encode':
            operation = [
                `${featureAccess} = ${featureAccess}.fillna("Unknown")`,
                `df = pd.get_dummies(df, columns=[${featureName}], prefix=[${featureName}], dtype=int)`
            ].join('\n');
            break;
        case 'ordinal_encode':
            operation = `${featureAccess} = ${featureAccess}.fillna("Unknown").astype("category").cat.codes`;
            break;
        case 'frequency_encode':
            operation = [
                `${featureAccess} = ${featureAccess}.fillna("Unknown")`,
                `frequencies = ${featureAccess}.value_counts(normalize=True)`,
                `${featureAccess} = ${featureAccess}.map(frequencies)`
            ].join('\n');
            break;
        default:
            operation = `# No transformation is needed for ${featureName}.`;
    }
    if (rec.numeric_conversion_required &&
        rec.feature_type === 'numerical' &&
        strategy !== 'drop_column') {
        imports.add('import re');
        operation = [
            `# Parse recognized numeric text in ${featureName}; malformed cells become NaN for review.`,
            `_raw_numeric_text = ${featureAccess}.astype('string').str.extract(`,
            `    r"^\\s*[$₹€£¥]?\\s*([+-]?(?:(?:\\d{1,3}(?:,\\d{3})+)|\\d+)(?:\\.\\d+)?(?:[eE][+-]?\\d+)?)\\s*(?:kg|kgs|kilograms?|grams?|g|cm|centimeters?|m|meters?|mm|lbs?|pounds?|inches?|in|ft|years?|yrs?|months?|days?|hours?|hrs?|%)?\\s*$",`,
            '    flags=re.IGNORECASE, expand=False',
            ')',
            `${featureAccess} = pd.to_numeric(_raw_numeric_text.str.replace(',', '', regex=False), errors='coerce')`,
            '',
            operation
        ].join('\n');
    }
    return [
        '# Complete preprocessing workflow for the analyzed dataset',
        ...Array.from(imports),
        '',
        `df = pd.${getDatasetReader(selectedPath)}(${JSON.stringify(selectedPath)})`,
        'print(f"Loaded dataset: {df.shape[0]} rows × {df.shape[1]} columns")',
        '',
        '# Apply preprocessing only to the selected column',
        operation,
        '',
        '# Check the result',
        'print(f"Dataset shape after preprocessing: {df.shape}")',
        `print("Missing values remaining in " + ${featureName} + ": " + str(${featureAccess}.isna().sum()) if ${featureName} in df.columns else "Selected column was dropped.")`,
        '',
        '# Preview only the selected column or its encoded output columns',
        ...(strategy === 'one_hot_encode'
            ? [
                `print(df.loc[:, [column for column in df.columns if column == ${featureName} or column.startswith(${JSON.stringify(`${rec.feature}_`)})]].head())`
            ]
            : strategy === 'drop_column'
                ? ['print("Selected column was dropped as requested.")']
                : [`print(df[[${featureName}]].head())`])
    ].join('\n');
}
function getDatasetReader(selectedPath) {
    var _a;
    const extension = (_a = selectedPath
        .split(/[?#]/, 1)[0]
        .split('.')
        .pop()) === null || _a === void 0 ? void 0 : _a.toLowerCase();
    return extension === 'xlsx' || extension === 'xls'
        ? 'read_excel'
        : extension === 'json'
            ? 'read_json'
            : 'read_csv';
}


},
"./lib/request.js"(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  requestAPI: () => (requestAPI)
});
/* import */ var _jupyterlab_coreutils__rspack_import_0 = __webpack_require__("webpack/sharing/consume/default/@jupyterlab/coreutils");
/* import */ var _jupyterlab_coreutils__rspack_import_0_default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_coreutils__rspack_import_0);
/* import */ var _jupyterlab_services__rspack_import_1 = __webpack_require__("webpack/sharing/consume/default/@jupyterlab/services");
/* import */ var _jupyterlab_services__rspack_import_1_default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_services__rspack_import_1);


/**
 * Call the server extension
 *
 * @param endPoint API REST endpoint relative to the Jupyter Server base URL
 * @param serverSettings The server settings to use for the request
 * @param init Initial values for the request
 * @returns The response body interpreted as JSON
 */
async function requestAPI(endPoint, serverSettings, init = {}) {
    // Make request to Jupyter API
    const requestUrl = _jupyterlab_coreutils__rspack_import_0.URLExt.join(serverSettings.baseUrl, endPoint);
    let response;
    try {
        response = await _jupyterlab_services__rspack_import_1.ServerConnection.makeRequest(requestUrl, init, serverSettings);
    }
    catch (error) {
        throw new _jupyterlab_services__rspack_import_1.ServerConnection.NetworkError(error);
    }
    let data = await response.text();
    if (data.length > 0) {
        try {
            data = JSON.parse(data);
        }
        catch (error) {
            console.log('Not a JSON response body.', response);
        }
    }
    if (!response.ok) {
        const message = typeof data === 'string'
            ? data
            : data && typeof data === 'object'
                ? data.message || data.error || response.statusText
                : response.statusText;
        throw new _jupyterlab_services__rspack_import_1.ServerConnection.ResponseError(response, typeof message === 'string' ? message : JSON.stringify(message));
    }
    return data;
}


},
"./lib/trace-visualization.js"(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  summarizeLoopTrace: () => (summarizeLoopTrace)
});
/** Find the innermost source loop containing the selected trace line. */
function summarizeLoopTrace(source, events, activeEventIndex) {
    const lines = source.replace(/\r\n?/g, '\n').split('\n');
    const active = events[activeEventIndex];
    if (!active)
        return null;
    const indentOf = (text) => { var _a, _b; return (_b = (_a = text.match(/^[ \t]*/)) === null || _a === void 0 ? void 0 : _a[0].replace(/\t/g, '    ').length) !== null && _b !== void 0 ? _b : 0; };
    const candidates = [];
    lines.forEach((line, index) => {
        if (!/^\s*(?:for|while)\b/.test(line) || line.replace(/^\s+/, '').startsWith('#'))
            return;
        const indent = indentOf(line);
        let end = lines.length;
        for (let next = index + 1; next < lines.length; next += 1) {
            if (lines[next].trim() && indentOf(lines[next]) <= indent) {
                end = next;
                break;
            }
        }
        if (active.line >= index + 1 && active.line < end + 1)
            candidates.push({ index, end });
    });
    const loop = candidates.sort((left, right) => right.index - left.index)[0];
    if (!loop)
        return null;
    const line = loop.index + 1;
    const header = lines[loop.index].trim().replace(/:\s*(?:#.*)?$/, '');
    const visits = events.reduce((found, event, eventIndex) => {
        if (event.line === line)
            found.push({ eventIndex, visitNumber: found.length + 1 });
        return found;
    }, []);
    const target = lines[loop.index].match(/^\s*for\s+([A-Za-z_]\w*)\s+in\b/);
    const capturedVariables = target && active.variables[target[1]] !== undefined
        ? [`${target[1]} = ${active.variables[target[1]]}`]
        : [];
    return { line, header, visits, capturedVariables };
}


},
"./lib/tuning-explanations.js"(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  explainTuningParameter: () => (explainTuningParameter)
});
const PARAMETER_EXPLANATIONS = {
    alpha: 'Controls coefficient regularization; larger values penalize model complexity more strongly.',
    ccp_alpha: 'Controls cost-complexity pruning; larger values prune more of the tree.',
    C: 'Inverse regularization strength; smaller values apply stronger regularization.',
    class_weight: 'Can give minority classes more influence when class frequencies are uneven.',
    colsample_bytree: 'Controls the fraction of input features sampled for each boosted tree.',
    epsilon: 'Sets the error-insensitive margin in support-vector regression.',
    gamma: 'Controls the reach of the RBF kernel; larger values make its influence more local.',
    l1_ratio: 'Sets the blend between L1 sparsity and L2 coefficient shrinkage.',
    learning_rate: 'Controls each boosting step; smaller steps often need more trees.',
    max_depth: 'Limits tree depth and therefore the complexity of learned decision rules.',
    max_features: 'Limits the features considered for a tree split, affecting diversity and fit.',
    max_iter: 'Sets the number of boosting iterations or optimization steps.',
    max_leaf_nodes: 'Limits the number of leaves and therefore tree complexity.',
    max_samples: 'Controls the number or fraction of training rows sampled for an ensemble.',
    min_samples_leaf: 'Requires a minimum number of examples at each leaf, which can smooth predictions.',
    min_samples_split: 'Requires a minimum number of examples before a node can split.',
    n_estimators: 'Sets how many trees are combined in the ensemble.',
    n_neighbors: 'Sets how many nearby training examples contribute to a K-nearest-neighbor prediction.',
    p: 'Chooses the Minkowski distance: 1 is Manhattan distance and 2 is Euclidean distance.',
    reg_lambda: 'Controls L2 regularization of boosted-tree weights.',
    subsample: 'Controls the fraction of training rows sampled for each boosting step.',
    var_smoothing: 'Adds stability to small feature variances in Gaussian Naive Bayes.',
    weights: 'Distance weighting gives closer neighbors more influence than equally weighted neighbors.'
};
function explainTuningParameter(parameter) {
    var _a;
    return ((_a = PARAMETER_EXPLANATIONS[parameter]) !== null && _a !== void 0 ? _a : 'This setting controls model fit or complexity; its displayed value was selected by the measured cross-validation comparison.');
}


},
"./lib/visualization-registry.js"(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  CODE_VISUALIZATION_OVERLAYS: () => (CODE_VISUALIZATION_OVERLAYS),
  MODEL_VISUALIZATION_CATALOG: () => (MODEL_VISUALIZATION_CATALOG),
  getVisualizationLabel: () => (getVisualizationLabel)
});
const MODEL_VISUALIZATION_CATALOG = [
    { id: 'pca', name: 'PCA', category: 'Dimensionality reduction', patterns: [/\bPCA\s*\(/], process: ['Center numeric features when configured', 'Find principal directions from fitted data', 'Project rows into the selected component space'], limits: ['Explained variance, component loadings, and projected rows require a fitted PCA estimator.'] },
    { id: 'kmeans', name: 'K-Means', category: 'Clustering', patterns: [/\bKMeans\s*\(/], process: ['Initialize cluster centers', 'Assign each row to a nearest center', 'Update centers and repeat until stopping'], limits: ['Centers, assignments, cluster sizes, and inertia require fitting on data.'] },
    { id: 'random-forest', name: 'Random Forest', category: 'Classification', patterns: [/\bRandomForest(?:Classifier|Regressor)\s*\(/], process: ['Build trees from bootstrap samples when enabled', 'Consider feature splits in each tree', 'Aggregate tree outputs for a prediction'], limits: ['Tree structure, feature importance, and predictions require a fitted forest.'] },
    { id: 'xgboost', name: 'XGBoost', category: 'Boosting', patterns: [/\bXGB(?:Classifier|Regressor)\s*\(/], process: ['Add a tree to the ensemble', 'Fit the next tree to the configured objective and residual signal', 'Combine the trees for a prediction'], limits: ['Boosting rounds, split gains, and predictions require a fitted booster.'] },
    { id: 'decision-tree', name: 'Decision Tree', category: 'Classification', patterns: [/\bDecisionTree(?:Classifier|Regressor)\s*\(/], process: ['Evaluate candidate feature splits', 'Follow a learned branch for each row', 'Return the value or class stored at a leaf'], limits: ['Feature tests, thresholds, branches, and leaf values require a fitted tree.'] },
    { id: 'perceptron', name: 'Perceptron', category: 'Classification', patterns: [/\bPerceptron\s*\(/], process: ['Compute a weighted linear score', 'Compare the score with the decision boundary', 'Update weights during training when configured'], limits: ['Learned weights, boundary, and predictions require fitting and inspection.'] },
    { id: 'gradient-boosting', name: 'Gradient Boosting', category: 'Boosting', patterns: [/\b(?:GradientBoosting|HistGradientBoosting)(?:Classifier|Regressor)\s*\(/], process: ['Start with an initial prediction', 'Fit each weak learner to the current loss gradient', 'Add learners sequentially using the configured learning rate'], limits: ['Stage-wise predictions and fitted tree structure require a trained estimator.'] },
    { id: 'mlp', name: 'Multi-Layer Perceptron', category: 'Deep learning', patterns: [/\bMLP(?:Classifier|Regressor)\s*\(/], process: ['Pass inputs through configured hidden layers', 'Apply learned weights and activation functions', 'Produce the configured output'], limits: ['Weights, activations, loss history, and predictions require a fitted network.'] },
    { id: 'gradient-descent', name: 'Gradient Descent', category: 'Optimization', patterns: [/\b(?:SGDRegressor|SGDClassifier)\s*\(/, /\b(?:gradient_descent|gradient descent)\b/i], process: ['Compute an objective or loss gradient', 'Update parameters in the opposite gradient direction', 'Repeat until the stopping rule is met'], limits: ['Parameter trajectories and convergence require executed optimization with recorded values.'] },
    { id: 'linear-regression', name: 'Linear Regression', category: 'Regression', patterns: [/\bLinearRegression\s*\(/], process: ['Combine feature values with learned coefficients', 'Add the intercept when configured', 'Return a numeric prediction'], limits: ['Coefficients, intercept, residuals, and predictions require a fitted estimator and data.'] },
    { id: 'multiple-linear-regression', name: 'Multiple Linear Regression', category: 'Regression', patterns: [/\bLinearRegression\s*\(/, /\bX\s*=\s*[^\n]*\[\s*[^\]]*,[^\]]*\]/], requireAllPatterns: true, process: ['Read multiple feature columns', 'Combine them with learned coefficients and an intercept', 'Return a numeric prediction'], limits: ['The source alone cannot establish feature meaning, coefficients, or model quality.'] },
    { id: 'logistic-regression', name: 'Logistic Regression', category: 'Classification', patterns: [/\bLogisticRegression\s*\(/], process: ['Compute a linear class score', 'Map scores to class probabilities', 'Choose classes using the configured decision rule'], limits: ['Fitted coefficients, calibrated probabilities, thresholds, and metrics require model evaluation.'] },
    { id: 'multiclass-logistic-regression', name: 'Multiclass Logistic Regression', category: 'Classification', patterns: [/\bLogisticRegression\s*\(/, /\b(?:multi_class|OneVsRestClassifier|OneVsOneClassifier)\b/], requireAllPatterns: true, process: ['Compute class scores', 'Convert scores into class probabilities or pairwise decisions', 'Select a class under the configured strategy'], limits: ['The realized class strategy and predictions depend on fitted data and library configuration.'] },
    { id: 'knn', name: 'K-Nearest Neighbors', category: 'Classification', patterns: [/\bKNeighbors(?:Classifier|Regressor)\s*\(/], process: ['Measure distance from the query row to stored training rows', 'Select the configured number of neighbors', 'Vote or average their target values'], limits: ['Neighbor identities and predictions require training rows and a query row.'] },
    { id: 'svm', name: 'Support Vector Machine', category: 'Classification', patterns: [/\b(?:SVC|SVR|LinearSVC|LinearSVR)\s*\(/], process: ['Represent the decision function using support vectors', 'Choose a margin and kernel behavior from configuration', 'Classify or estimate a value from the fitted decision function'], limits: ['Support vectors, margins, and predictions require a fitted estimator.'] },
    { id: 'naive-bayes', name: 'Naive Bayes', category: 'Classification', patterns: [/\b(?:GaussianNB|MultinomialNB|BernoulliNB|CategoricalNB|ComplementNB)\s*\(/], process: ['Estimate class prior probabilities', 'Estimate per-feature likelihoods under the selected variant', 'Combine likelihoods to score candidate classes'], limits: ['Learned priors, likelihoods, and predictions require fitting on labeled data.'] },
    { id: 'catboost', name: 'CatBoost', category: 'Boosting', patterns: [/\bCatBoost(?:Classifier|Regressor)\s*\(/], process: ['Build gradient-boosted trees', 'Apply CatBoost handling for configured categorical features', 'Combine stages for a prediction'], limits: ['The fitted trees, categorical statistics, and predictions are not available from a declaration.'] },
    { id: 'lightgbm', name: 'LightGBM', category: 'Boosting', patterns: [/\bLGBM(?:Classifier|Regressor)\s*\(/], process: ['Grow gradient-boosted trees with configured leaf-wise controls', 'Optimize each stage for the selected loss', 'Combine stages for a prediction'], limits: ['Fitted leaf structure, feature importance, and predictions require training data.'] },
    { id: 'regularization', name: 'Regularization', category: 'Model fitting', patterns: [/\b(?:Ridge|Lasso|ElasticNet)\s*\(/, /\balpha\s*=/], requireAllPatterns: true, process: ['Add a penalty to the fitted objective', 'Trade fit against coefficient size or complexity', 'Estimate parameters under the configured penalty'], limits: ['The source does not establish whether regularization improves generalization on unseen data.'] },
    { id: 'polynomial-regression', name: 'Polynomial Regression', category: 'Regression', patterns: [/\bPolynomialFeatures\s*\(/], process: ['Expand input features into polynomial terms', 'Fit a regression estimator to the expanded matrix', 'Evaluate predictions in the original target scale'], limits: ['The realized feature expansion and curve depend on degree, input columns, and fitted coefficients.'] },
    { id: 'adaboost', name: 'AdaBoost', category: 'Boosting', patterns: [/\bAdaBoost(?:Classifier|Regressor)\s*\(/], process: ['Fit a weak learner', 'Increase emphasis on errors according to the configured algorithm', 'Combine learners using learned weights'], limits: ['Sample weights, learner sequence, and predictions require a fitted ensemble.'] },
    { id: 'voting-stacking', name: 'Voting and Stacking', category: 'Ensemble', patterns: [/\b(?:VotingClassifier|VotingRegressor|StackingClassifier|StackingRegressor)\s*\(/], process: ['Fit the configured base estimators', 'Combine their outputs or train a meta-estimator', 'Return the combined prediction'], limits: ['Base-estimator outputs and the fitted meta-model require trained estimators.'] },
    { id: 'ensemble-lab', name: 'Ensemble Lab', category: 'Ensemble', patterns: [], process: ['Select compatible base estimators', 'Compare bagging, boosting, or voting strategies', 'Evaluate each strategy on a consistent validation split'], limits: ['An interactive comparison requires explicit model runs on a selected dataset.'] },
    { id: 'bagging', name: 'Bagging Lab', category: 'Ensemble', patterns: [/\b(?:BaggingClassifier|BaggingRegressor)\s*\(/], process: ['Draw bootstrap samples when enabled', 'Fit base estimators independently', 'Aggregate their predictions'], limits: ['Bootstrap samples, estimator diversity, and variance changes require fitted models and data.'] },
    { id: 'boosting', name: 'Boosting', category: 'Boosting', patterns: [/\b(?:AdaBoost|GradientBoosting|HistGradientBoosting|XGB|LGBM|CatBoost)/], process: ['Fit a sequence of weak learners', 'Update later stages from the configured objective', 'Combine stages for a prediction'], limits: ['The source declaration does not show fitted stages, training trajectory, or generalization.'] }
];
/** Report overlay catalog. Capability labels keep source facts separate from runtime evidence. */
const CODE_VISUALIZATION_OVERLAYS = [
    ['C01', 'Control-flow graph', 'Static branch structure; conditions are not evaluated.'],
    ['C02', 'Step-through execution trace', 'Available after the user clicks Run & trace.'],
    ['C03', 'Variables and memory state', 'Simple captured values are shown only after Run & trace.'],
    ['C04', 'Call stack', 'Function frames require a captured execution trace.'],
    ['C05', 'Recursion tree', 'Recursive calls require a captured execution trace.'],
    ['C06', 'Loop animator', 'Executed loop iterations require a captured execution trace.'],
    ['C07', 'Array and vector transforms', 'Shapes and values require executed source or explicit data inspection.'],
    ['C08', 'Linked-list pointers', 'Requires recognized linked-node data and runtime values.'],
    ['C09', 'Stack and queue', 'Requires recognized operations and runtime values.'],
    ['C10', 'Sorting animation', 'Requires executed input and output values.'],
    ['C11', 'Binary-search walkthrough', 'Requires a sorted input and a query value.'],
    ['C12', 'Time and space complexity', 'Static explanation only; no runtime benchmark is inferred.'],
    ['D01', 'Error-location highlight', 'Available when traceback source lines are supplied.'],
    ['D02', 'Traceback flow', 'Available when a traceback is supplied.'],
    ['D03', 'Variable state delta', 'Requires captured values before and after a step.'],
    ['D04', 'Expected versus actual output', 'Requires an expected value and captured output.'],
    ['D05', 'Shape mismatch', 'Requires observed array or dataframe shapes.'],
    ['D06', 'Overfit and underfit view', 'Requires train and validation trajectories or scores.'],
    ['D07', 'Residual and prediction plot', 'Requires target values and model predictions.'],
    ['D08', 'Fix diff and checks', 'Uses the existing validated-fix workflow when a proposed patch is available.'],
    ['P01', 'Dataset preview and distributions', 'Available through the existing dataset profiler.'],
    ['P02', 'Missing and outlier map', 'Available through the existing dataset and preprocessing profilers.'],
    ['P03', 'Preprocessing comparison', 'Available when before and after previews are generated.'],
    ['P04', 'Pipeline and ColumnTransformer', 'Static branch and stage view is available from selected source.']
];
/** Resolve only IDs present in the source catalog or overlay registry. */
function getVisualizationLabel(id) {
    var _a;
    const model = MODEL_VISUALIZATION_CATALOG.find(item => item.id === id);
    if (model)
        return model.name;
    return (_a = CODE_VISUALIZATION_OVERLAYS.find(([overlayId]) => overlayId === id)) === null || _a === void 0 ? void 0 : _a[1];
}


},
"./style/modelmind-logo.png"(module, __unused_rspack_exports, __webpack_require__) {
module.exports = __webpack_require__.p + "68c5c2a70ed031f3.png";

},

}]);
//# sourceMappingURL=lib_index_js.ce62b7df929cc0d1.js.map