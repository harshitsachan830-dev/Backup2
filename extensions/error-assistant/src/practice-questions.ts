import { JupyterFrontEnd } from '@jupyterlab/application';
import { INotebookTracker } from '@jupyterlab/notebook';
import { ServerConnection } from '@jupyterlab/services';
import { Widget } from '@lumino/widgets';

import { requestAPI } from './request';

export type PracticeQuestion = {
  id: string;
  topic: string;
  level: string;
  type: string;
  title: string;
  question: string;
  starterCode?: string;
  tags?: string[];
  options?: string[];
  gradingMode: 'exact' | 'code' | 'ai';
  testsAvailable: boolean;
};

const QUESTION_CELL = 'practice-question';
const ANSWER_CELL = 'practice-answer';

function isPracticeNotebook(notebooks: INotebookTracker): boolean {
  return notebooks.currentWidget?.context.model.getMetadata('modelmind_notebook_type') === 'practice';
}

function escapeMarkdown(value: string): string {
  return value.replace(/\r/g, '').trim();
}

function questionSource(question: PracticeQuestion, number: number): string {
  const meta = [question.topic, question.level, question.type].filter(Boolean).join(' · ');
  const mode = question.gradingMode === 'code'
    ? question.testsAvailable ? 'Hidden-test exercise' : 'AI-reviewed coding exercise'
    : question.gradingMode === 'exact' ? 'Exact-answer exercise' : 'AI teacher review';
  const choices = question.options?.length
    ? `\n\n### Options\n${question.options.map((option, index) => `${index + 1}. ${escapeMarkdown(option)}`).join('\n')}`
    : '';
  return `# Practice ${String(number).padStart(3, '0')} — ${escapeMarkdown(question.title)}\n\n` +
    `**${meta}**  \n${mode}\n\n${escapeMarkdown(question.question)}${choices}\n\n` +
    `> Write your response in the cell below. Then use **Check this answer** in the AI Chatbot panel on the right. Select Ollama or Gemini there before checking.`;
}

function answerSource(question: PracticeQuestion): string {
  if (question.options?.length) {
    return '# My selected option (write its number):\n';
  }
  if (question.starterCode) return question.starterCode;
  return question.gradingMode === 'code'
    ? '# Write your Python solution here\n'
    : '# Write your explanation below. Use Python comments (#) or a print string so the AI teacher can read it.\n';
}

function injectPracticeStyles(): void {
  if (document.getElementById('mm-practice-questions-styles')) return;
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

export function createPracticeQuestionsWidget(
  app: JupyterFrontEnd,
  notebooks: INotebookTracker,
  settings: ServerConnection.ISettings
): Widget {
  injectPracticeStyles();
  const widget = new Widget();
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
    const shell = app.shell as typeof app.shell & { collapseLeft?: () => void };
    shell.collapseLeft?.();
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

  let questions: PracticeQuestion[] = [];
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
    summary.replaceChildren(
      Object.assign(document.createElement('span'), { textContent: `${questions.length} questions` }),
      Object.assign(document.createElement('span'), { textContent: `${codingCount} coding` }),
      Object.assign(document.createElement('span'), { textContent: `${reviewCount} teacher review` }),
      Object.assign(document.createElement('span'), { textContent: `${exactCount} exact checks` })
    );
    list.replaceChildren();
    if (!filtered.length) {
      const empty = document.createElement('p');
      empty.className = 'mm-practice-status';
      empty.textContent = 'No questions match this search.';
      list.appendChild(empty);
      return;
    }
    const groups: Array<{ label: string; className: string; questions: PracticeQuestion[] }> = [
      { label: 'Coding & debugging', className: 'code', questions: filtered.filter(question => question.gradingMode === 'code') },
      { label: 'AI concept review', className: 'review', questions: filtered.filter(question => question.gradingMode === 'ai') },
      { label: 'Quick exact checks', className: 'exact', questions: filtered.filter(question => question.gradingMode === 'exact') }
    ];
    groups.forEach(group => {
      if (!group.questions.length) return;
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
        if (name) name.textContent = question.title;
        if (detail) detail.textContent = `${question.topic} · ${question.level}`;
        item.addEventListener('click', () => selectQuestion(question));
        section.appendChild(item);
      });
      list.appendChild(section);
    });
  };

  const selectQuestion = (question: PracticeQuestion) => {
    if (!isPracticeNotebook(notebooks)) return;
    const panel = notebooks.currentWidget;
    const notebook = panel?.content;
    const model = notebook?.model;
    if (!panel || !notebook || !model) return;
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
    promptCell?.model.sharedModel.setSource(questionSource(question, questionIndex));
    answerCell?.model.sharedModel.setSource(answerSource(question));
    model.setMetadata('modelmind_practice_question_id', question.id);
    notebook.activeCellIndex = answerCellIndex;
    notebook.deselectAll();
    if (answerCell) notebook.select(answerCell);
    answerCell?.node.scrollIntoView({ behavior: 'smooth', block: 'center' });
    window.dispatchEvent(new CustomEvent('modelmind:practice-question-selected', { detail: { question } }));
    render();
  };

  const load = async () => {
    list.innerHTML = '<p class="mm-practice-status">Loading practice questions…</p>';
    try {
      const result = await requestAPI<{ questions?: PracticeQuestion[] }>('api/practice/questions', settings);
      questions = Array.isArray(result.questions) ? result.questions : [];
      const topics = [...new Set(questions.map(question => question.topic))].sort();
      topic.replaceChildren();
      topic.append(new Option('All topics', ''));
      topics.forEach(value => topic.append(new Option(value, value)));
      render();
    } catch {
      list.innerHTML = '<p class="mm-practice-status error">Practice questions could not be loaded. Restart ModelMind and try again.</p>';
    }
  };

  search.addEventListener('input', render);
  topic.addEventListener('change', render);
  void load();
  return widget;
}
