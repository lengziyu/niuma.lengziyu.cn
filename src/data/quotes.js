import { getHomeToolCatalog } from './home';

const zhHomeQuotes = [
  '努力不一定成功，但摸鱼一定很轻松。',
  '先别慌，喝口水，文件名一会儿再改。',
  '今天也要优雅地把“最终版”留在昨天。',
  '任务再多，也别忘了给自己留一点呼吸感。',
  '会摸鱼的人，往往更懂得怎么把节奏找回来。'
];

const enHomeQuotes = [
  'Steady beats rushed.',
  'Sip water, then continue.',
  'One task at a time.',
  'Busy day, keep breathing.',
  'Rest helps you move faster.'
];

const zhFavorablePool = [
  '先清一项',
  '批量整理',
  '一口气做完',
  '先拆小任务',
  '先改文件名',
  '先出可用版',
  '顺手清桌面',
  '收藏常用流程',
  '交给工具做',
  '先定交付格式',
  '附件先压缩',
  '先做最简单的',
  '同步下进度',
  '先统一格式',
  '先整理链接',
  '先做最关键的',
  '留点复查时间',
  '推进一轮番茄钟',
  '先分类再导出',
  '先套模板'
];

const enFavorablePool = [
  'Clear one task',
  'Batch similar tasks',
  'One focused run',
  'Split small steps',
  'Rename files',
  'Ship v1 first',
  'Tidy desktop',
  'Save your workflow',
  'Use tools more',
  'Set format first',
  'Compress files first',
  'Start easy',
  'Send quick status',
  'Unify format',
  'Sort links',
  'Do key task first',
  'Leave review time',
  'One Pomodoro',
  'Sort then export',
  'Use template'
];

const zhAvoidPool = [
  '继续叠“最终版”',
  '拖到下班前再导出',
  '边改边删',
  '忘了备份',
  '开太多窗口',
  '硬扛不喝水',
  '发错测试文件',
  '不预览就提交',
  '改需求不留备注',
  '文件塞进新建文件夹',
  '重复手动操作',
  '关掉所有提醒',
  '开会时忘保存',
  '不看页码就合并',
  '压缩包叫 1.zip',
  '忘了权限设置'
];

const enAvoidPool = [
  'Too many "final" files',
  'Last-minute export',
  'Edit while deleting',
  'Forgetting backup',
  'Too many windows',
  'No water all day',
  'Wrong test file',
  'Submit no preview',
  'Scope change no notes',
  'Random file folders',
  'Repeating manual steps',
  'All reminders off',
  'Forget save in meeting',
  'Merge without page check',
  'Archive named 1.zip',
  'Forgetting permissions'
];

const zhNotePool = [
  '{tool}今天很贴你。',
  '{tool}会让你更顺手。',
  '{tool}今天特别加分。',
  '{tool}能帮你省点心。',
  '{tool}会托住你的节奏。',
  '{tool}今天很懂你。',
  '{tool}会把麻烦变轻。',
  '{tool}会让成果更漂亮。'
];

const enNotePool = [
  '{tool} works for you today.',
  '{tool} keeps flow smooth.',
  '{tool} gives extra speed.',
  '{tool} saves your energy.',
  '{tool} keeps your rhythm.',
  '{tool} fits this task.',
  '{tool} makes it lighter.',
  '{tool} improves the result.'
];

const zhHighScoreNotePool = [
  '{tool}一上场就顺。',
  '{tool}今天像开了加速。',
  '{tool}会陪你一路顺手。'
];

const enHighScoreNotePool = [
  '{tool} starts strong.',
  '{tool} is a speed boost.',
  '{tool} keeps momentum.'
];

function pickRandom(items) {
  if (!items.length) {
    return '';
  }

  return items[Math.floor(Math.random() * items.length)];
}

function pickByWeight(weightedItems) {
  const total = weightedItems.reduce((sum, item) => sum + item.weight, 0);
  let cursor = Math.random() * total;

  for (const item of weightedItems) {
    cursor -= item.weight;
    if (cursor <= 0) {
      return item.value;
    }
  }

  return weightedItems[weightedItems.length - 1]?.value;
}

function pickManyUnique(items, count) {
  const pool = [...items];

  for (let index = pool.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [pool[index], pool[swapIndex]] = [pool[swapIndex], pool[index]];
  }

  return pool.slice(0, Math.max(0, Math.min(count, pool.length)));
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickWeightedTool(locale = 'zh', previousTool = '') {
  const localizedTools = getHomeToolCatalog(locale);

  if (!localizedTools.length) {
    return null;
  }

  const priorityTools = localizedTools.slice(0, 8);
  const regularTools = localizedTools.slice(8);

  const bucket =
    !regularTools.length || Math.random() < 0.7 ? priorityTools : regularTools;

  let candidates = bucket;

  if (previousTool) {
    const filtered = bucket.filter((tool) => tool.name !== previousTool);
    if (filtered.length) {
      candidates = filtered;
    }
  }

  if (!candidates.length) {
    const fallback = localizedTools.filter((tool) => tool.name !== previousTool);
    return pickRandom(fallback.length ? fallback : localizedTools);
  }

  return pickRandom(candidates);
}

function generateScore(tool, locale = 'zh') {
  const localizedTools = getHomeToolCatalog(locale);
  const priorityToolIds = new Set(localizedTools.slice(0, 8).map((item) => item.id));
  const isPriority = priorityToolIds.has(tool.id);

  if (isPriority) {
    const range = pickByWeight([
      { value: [90, 98], weight: 0.58 },
      { value: [84, 89], weight: 0.3 },
      { value: [78, 83], weight: 0.12 }
    ]);
    return randomInt(range[0], range[1]);
  }

  const range = pickByWeight([
    { value: [84, 94], weight: 0.34 },
    { value: [76, 83], weight: 0.5 },
    { value: [70, 75], weight: 0.16 }
  ]);
  return randomInt(range[0], range[1]);
}

function buildFavorableList(locale, toolName) {
  if (locale === 'en') {
    const toolFriendly = [
      `${toolName} first`,
      `Start ${toolName}`,
      `Finish with ${toolName}`
    ];

    return [
      pickRandom(toolFriendly),
      ...pickManyUnique(enFavorablePool, 1)
    ];
  }

  const toolFriendly = [
    `先用${toolName}`,
    `先开${toolName}`,
    `收尾用${toolName}`
  ];

  return [
    pickRandom(toolFriendly),
    ...pickManyUnique(zhFavorablePool, 1)
  ];
}

function buildAvoid(locale, toolName) {
  if (locale === 'en') {
    const customAvoid = [
      `Delay ${toolName}`,
      `Skip ${toolName} options`,
      `No ${toolName} preview`
    ];

    return pickRandom([...customAvoid, ...enAvoidPool]);
  }

  const customAvoid = [
    `${toolName}拖到最后`,
    `${toolName}忘了看参数`,
    `${toolName}结果不预览`
  ];

  return pickRandom([...customAvoid, ...zhAvoidPool]);
}

function buildNote(locale, toolName, score) {
  const pool = locale === 'en' ? enNotePool : zhNotePool;
  const highScorePool = locale === 'en' ? enHighScoreNotePool : zhHighScoreNotePool;
  const source = score >= 92 ? [...pool, ...highScorePool] : pool;
  const template = pickRandom(source);
  const note = template.replaceAll('{tool}', toolName);

  return locale === 'en' ? `Tip: ${note}` : `小牛说：${note}`;
}

export const homeQuotes = zhHomeQuotes;

export function getHomeQuotes(locale = 'zh') {
  return locale === 'en' ? enHomeQuotes : zhHomeQuotes;
}

export function createOfficeFortune(locale = 'zh', previousFortune = null) {
  const previousTool = previousFortune?.luckyTool ?? '';
  const tool = pickWeightedTool(locale, previousTool) ?? getHomeToolCatalog(locale)[0];
  const toolName = tool?.name ?? (locale === 'en' ? 'Lucky Tool of the Day' : '今日幸运工具');
  const score = generateScore(tool, locale);

  return {
    score,
    luckyTool: toolName,
    favorable: buildFavorableList(locale, toolName),
    avoid: buildAvoid(locale, toolName),
    note: buildNote(locale, toolName, score)
  };
}

export const officeFortunes = Array.from({ length: 12 }, () => createOfficeFortune());
