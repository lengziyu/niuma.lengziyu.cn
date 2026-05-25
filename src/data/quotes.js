import { tools } from './tools';

export const homeQuotes = [
  '努力不一定成功，但摸鱼一定很轻松。',
  '先别慌，喝口水，文件名一会儿再改。',
  '今天也要优雅地把“最终版”留在昨天。',
  '任务再多，也别忘了给自己留一点呼吸感。',
  '会摸鱼的人，往往更懂得怎么把节奏找回来。'
];

const priorityToolIds = new Set(tools.slice(0, 8).map((tool) => tool.id));

const favorablePool = [
  '先处理 1 个最小任务热身',
  '批量整理同类型文件',
  '一次完成一类转换',
  '把待办拆成 20 分钟小段',
  '给每份文件先起清晰名字',
  '先发一版可用结果再优化',
  '顺手清理桌面与下载夹',
  '把高频流程收藏成固定动作',
  '把重复步骤交给工具',
  '先确认交付格式再开工',
  '处理邮件附件前先压缩',
  '先做“最容易完成”的一项',
  '同步一次进度给同事',
  '先统一文档格式再汇总',
  '把需要分享的链接一次整理好',
  '先做“影响最大”的任务',
  '提前 10 分钟预留复查时间',
  '用番茄钟推进两轮小冲刺',
  '把文件分类后再批量导出',
  '先把模板准备好再填内容'
];

const avoidPool = [
  '把“最终版”继续叠后缀',
  '临近下班才开始导出大文件',
  '边改边删导致版本找不回',
  '忘记备份就直接覆盖原文件',
  '一次开太多窗口分散注意力',
  '空腹硬扛到下午才喝水',
  '把测试文件误发到正式群',
  '跳过预览就直接提交',
  '临时改需求却不留备注',
  '把重要文件放在“新建文件夹”',
  '反复手动做重复步骤',
  '把提醒都关掉导致遗漏',
  '边开会边改文档忘了保存',
  '不检查页码就直接合并文档',
  '把压缩包命名成“1.zip”',
  '急着交付却忘记权限设置'
];

const notePool = [
  '{tool}今天和你超合拍，随手一用就会有小惊喜。',
  '你的节奏感很在线，{tool}会把琐碎步骤变得丝滑。',
  '慢一点也没关系，{tool}会稳稳托住你的效率。',
  '今天的你自带好运，配上{tool}会更顺手更省心。',
  '{tool}正在给你加一点“轻松 buff”，工作会越做越顺。',
  '你负责发光，{tool}负责把细节照顾得妥妥的。',
  '别急，你已经很棒了，{tool}会把麻烦悄悄变简单。',
  '这波手感很好，{tool}会让你的成果又快又漂亮。',
  '今天适合温柔高效，{tool}会是你的贴心小搭子。',
  '你每一步都很稳，{tool}会把效率线再抬高一点。'
];

const highScoreNotePool = [
  '好运值拉满，{tool}一上场就像开了加速器。',
  '今天是“轻松高产”体质，{tool}会让你事半功倍。',
  '效率指数发光啦，{tool}会陪你一路顺风顺水。'
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

function pickWeightedTool(previousTool = '') {
  if (!tools.length) {
    return null;
  }

  const priorityTools = tools.slice(0, 8);
  const regularTools = tools.slice(8);

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
    const fallback = tools.filter((tool) => tool.name !== previousTool);
    return pickRandom(fallback.length ? fallback : tools);
  }

  return pickRandom(candidates);
}

function generateScore(tool) {
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

function buildFavorableList(toolName) {
  const toolFriendly = [
    `先用${toolName}打开节奏`,
    `把${toolName}放在第一轮任务里`,
    `用${toolName}收尾会更省心`
  ];

  return [
    pickRandom(toolFriendly),
    ...pickManyUnique(favorablePool, 2)
  ];
}

function buildAvoid(toolName) {
  const customAvoid = [
    `把${toolName}拖到最后一刻才处理`,
    `开着${toolName}却忘了确认参数`,
    `导出前不预览${toolName}结果`
  ];

  return pickRandom([...customAvoid, ...avoidPool]);
}

function buildNote(toolName, score) {
  const source = score >= 92 ? [...notePool, ...highScoreNotePool] : notePool;
  const template = pickRandom(source);
  return `小牛说：${template.replaceAll('{tool}', toolName)}`;
}

export function createOfficeFortune(previousFortune = null) {
  const previousTool = previousFortune?.luckyTool ?? '';
  const tool = pickWeightedTool(previousTool) ?? tools[0];
  const toolName = tool?.name ?? '今日幸运工具';
  const score = generateScore(tool);

  return {
    score,
    luckyTool: toolName,
    favorable: buildFavorableList(toolName),
    avoid: buildAvoid(toolName),
    note: buildNote(toolName, score)
  };
}

export const officeFortunes = Array.from({ length: 12 }, () => createOfficeFortune());
