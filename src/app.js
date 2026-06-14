const CONFIG = window.PEACE_DEATH_SUPABASE ?? {};
const root = document.getElementById("root");

const PHASES = [
  ["turn_start", "回合开始"],
  ["private_submission", "玩家提交私人行动"],
  ["private_resolution", "DM处理私人行动"],
  ["government_submission", "有职位者提交政府行动"],
  ["government_resolution", "DM处理政府行动"],
  ["debate", "国会辩论 / 大选辩论"],
  ["settlement", "回合结算"],
];

const PUBLIC_TRAITS = [
  ["约尔贵族", 1, "ethnicity:约尔裔"],
  ["卡兰克贵族", 1, "ethnicity:卡兰克裔"],
  ["精通双语", 1, "intellect:60"],
  ["资本家", 2, ""],
  ["神职人员", 2, ""],
  ["退役军官", 1, "age_min:50"],
  ["博士学位", 1, "intellect:80"],
  ["苦行僧", 2, ""],
  ["蹲监狱", -1, ""],
  ["年轻气盛", 1, "age_max:40"],
  ["老逼登", 1, "age_min:60"],
];

const SECRET_TRAITS = [
  ["文官联系", 1],
  ["军官联系", 1],
  ["媒体联系", 1],
  ["黑手党联系", 1],
  ["工会联系", 1],
  ["卡兰克联系", 1],
  ["罗伊尔联系", 1],
  ["海外情报局联系", 1],
];

const PURSUITS = ["利益至上", "权力至上", "国家至上", "理想至上"];

const POLICY_CATALOG = {
  regime: ["政体", { dual_monarchy: "二元君主立宪制", ceremonial_monarchy: "虚位君主立宪制", parliamentary_republic: "议会共和制", presidential_republic: "总统共和制", military_government: "军政府" }],
  civil_service: ["公务员制度", { independent: "公务员系统独立", bureaucrats_in_politics: "允许文官参政", free_participation: "允许自由参政" }],
  tax: ["税收制度", { single_tax: "单一税", regressive: "累退税", progressive: "累进税" }],
  economy: ["经济制度", { laissez_faire: "自由放任市场经济", intervention: "政府干预市场经济", heavy_intervention: "高度干预市场经济" }],
  assembly: ["集会制度", { banned: "禁止集会", registered: "允许申报集会", free: "允许自由集会" }],
  media: ["媒体制度", { state_media: "国家控制媒体", limited_censorship: "有限媒体审查", free_media: "全面媒体自由" }],
  religion: ["宗教政策", { secularization: "世俗化", state_church: "国立圣会宗", state_valler: "国立瓦勒宗", pluralism: "多元宗教" }],
  army_pay: ["军队开支", { docked: "克扣军饷", basic: "基本军饷", welfare: "军人福利" }],
  welfare: ["福利政策", { poor: "缺乏保障", basic: "基本保障", strong: "高度保障" }],
  labor: ["工人待遇", { eight_hours: "八小时工作制", ten_hours: "十小时工作制", twelve_hours: "十二小时工作制", fourteen_hours: "十四小时工作制" }],
  women: ["女性权益", { ignored: "漠视女性", formal_equality: "形式平权", active_equality: "积极平权" }],
  nationality: ["民族政策", { lurik_exception: "卢里孔例外论", karank_first: "卡兰克优先", yor_first: "约尔优先" }],
};

const POLICY_EFFECTS = {
  ceremonial_monarchy: { legitimacy: 5 },
  parliamentary_republic: { legitimacy: 5, anger: ["地主贵族"] },
  military_government: { please: ["士兵"] },
  independent: { legitimacy: 5 },
  bureaucrats_in_politics: { anger: ["保守知识分子"] },
  free_participation: { please: ["士兵", "地主贵族", "大约尔派", "大卡兰克派"], anger: ["保守知识分子"] },
  regressive: { budget: -1, please: ["资本家", "地主贵族"], anger: ["产业工人", "农民", "士兵"] },
  progressive: { budget: 1, please: ["产业工人"], anger: ["资本家", "地主贵族"] },
  laissez_faire: { legitimacy: 5, please: ["资本家", "地主贵族"], anger: ["农民"] },
  heavy_intervention: { legitimacy: -5, anger: ["资本家", "地主贵族"] },
  banned: { legitimacy: 5, anger: ["进步知识分子"] },
  registered: { legitimacy: 3 },
  free: { please: ["进步知识分子"] },
  state_media: { legitimacy: 5, anger: ["进步知识分子"] },
  limited_censorship: { legitimacy: 3 },
  free_media: { please: ["进步知识分子"] },
  secularization: { legitimacy: 5, please: ["进步知识分子"], anger: ["保守知识分子"] },
  state_church: { legitimacy: 10, please: ["大卡兰克派"], anger: ["进步知识分子", "大约尔派"] },
  state_valler: { legitimacy: 10, please: ["大约尔派"], anger: ["进步知识分子", "大卡兰克派"] },
  docked: { budget: 1, anger: ["士兵"] },
  welfare: { budget: -1, please: ["士兵"] },
  poor: { budget: 1, anger: ["产业工人", "农民", "士兵"] },
  basic: { legitimacy: 5 },
  strong: { legitimacy: 10, budget: -1, please: ["产业工人", "农民", "士兵"] },
  eight_hours: { please: ["产业工人"], anger: ["资本家"] },
  twelve_hours: { please: ["资本家"], anger: ["产业工人"] },
  fourteen_hours: { please: ["资本家"], anger: ["产业工人"] },
  formal_equality: { please: ["进步知识分子"], anger: ["保守知识分子"] },
  active_equality: { please: ["进步知识分子"], anger: ["保守知识分子"] },
  karank_first: { legitimacy: 5, please: ["大卡兰克派"], anger: ["大约尔派"] },
  yor_first: { legitimacy: 5, please: ["大约尔派"], anger: ["大卡兰克派"] },
};

const SCANDALS = [
  ["罪大恶极", "你和亲妈有奸情。"],
  ["罪大恶极", "你和女儿有奸情。"],
  ["可大可小", "你有婚外情。"],
  ["有点严重", "你儿子是个强奸犯，受害者还在世。"],
  ["罪大恶极", "你是个强奸犯，受害者还在世。"],
  ["罪大恶极", "你是个恋童癖。"],
  ["罪大恶极", "你是个同性恋，还参加过一些同性银趴。"],
  ["可大可小", "你的一个家庭成员是同性恋。"],
  ["可大可小", "你频繁造访性交易场所。"],
  ["可大可小", "你收了一家本地企业的钱。"],
  ["可大可小", "你收了一家卡兰克企业的钱。"],
  ["可大可小", "你收了一家罗伊尔企业的钱。"],
  ["可大可小", "你收了一家德诺企业的钱。"],
  ["可大可小", "你的大部分财产都存在外国账户里。"],
  ["有点严重", "你的大学学位是用权钱交易换来的。"],
  ["可大可小", "你亲戚的大学学位是你帮他换来的。"],
  ["有点严重", "你偷税漏税。"],
  ["有点严重", "你一个亲戚杀了人，利用你的关系跑脱了。"],
  ["不可饶恕", "你杀过人。"],
  ["罪大恶极", "你拿政府预算投机交易，亏本了。"],
  ["可大可小", "你酗酒成性。"],
  ["有点严重", "你参加赌博，输了不少钱，以至于侵吞预算。"],
  ["有点严重", "你从事高利贷生意。"],
  ["可大可小", "你利用职权帮助朋友企业牟利。"],
  ["可大可小", "你紧张时会口吃。"],
  ["有点严重", "你曾私下羞辱你信奉的教派。"],
  ["有点严重", "谋杀公爵的人是你的朋友。"],
  ["可大可小", "你是性无能。"],
  ["可大可小", "你沾染了毒瘾。"],
  ["有点严重", "你沾染毒瘾，还参与毒品交易。"],
  ["可大可小", "你曾经羞辱过前公爵埃德沃德二世。"],
  ["有点严重", "你曾经当街殴打他人。"],
  ["可大可小", "你亲戚曾经当街殴打他人，被你保了下来。"],
  ["可大可小", "你有异装癖。"],
  ["可大可小", "你经常研究神秘主义和炼金术。"],
  ["罪大恶极", "你跟当今公爵的母亲有奸情。"],
];

let supabase = null;
let state = {
  session: null,
  profile: null,
  tab: "overview",
  error: "",
  data: emptyData(),
};

boot();

async function boot() {
  if (!CONFIG.url || !CONFIG.anonKey) {
    renderSetup();
    return;
  }
  try {
    const mod = await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm");
    supabase = mod.createClient(CONFIG.url, CONFIG.anonKey);
    const { data } = await supabase.auth.getSession();
    state.session = data.session;
    supabase.auth.onAuthStateChange((_event, session) => {
      state.session = session;
      if (session) loadAll();
      else {
        state.profile = null;
        render();
      }
    });
    if (state.session) await loadAll();
    render();
  } catch (error) {
    state.error = error.message ?? String(error);
    renderSetup();
  }
}

function emptyData() {
  return {
    state: null,
    characters: [],
    privateStats: [],
    retainers: [],
    retainerPrivate: [],
    assignments: [],
    actions: [],
    factions: [],
    groups: [],
    policies: [],
    foreignPowers: [],
    votes: [],
    positions: [],
    profiles: [],
  };
}

async function loadAll() {
  state.error = "";
  const profile = await supabase.from("profiles").select("*").eq("id", state.session.user.id).maybeSingle();
  if (profile.error) {
    state.error = profile.error.message;
    render();
    return;
  }
  state.profile = profile.data;

  const queries = await Promise.all([
    supabase.from("game_state").select("*").eq("id", true).maybeSingle(),
    supabase.from("characters_public").select("*").order("created_at"),
    supabase.from("character_private").select("*"),
    supabase.from("retainers").select("*").order("created_at"),
    supabase.from("retainer_private").select("*"),
    supabase.from("position_assignments").select("*, positions(*)").order("created_at"),
    supabase.from("actions").select("*").order("created_at", { ascending: false }),
    supabase.from("factions").select("*").order("sort_order"),
    supabase.from("social_groups").select("*").order("sort_order"),
    supabase.from("current_policies").select("*").order("policy_key"),
    supabase.from("foreign_powers").select("*").order("name"),
    supabase.from("parliament_votes").select("*, factions(short_name, color)").order("created_at", { ascending: false }),
    supabase.from("positions").select("*").order("sort_order"),
    supabase.from("profiles").select("*").order("created_at"),
  ]);
  const error = queries.find((item) => item.error)?.error;
  if (error) {
    state.error = error.message;
    render();
    return;
  }
  const [gameState, characters, privateStats, retainers, retainerPrivate, assignments, actions, factions, groups, policies, foreignPowers, votes, positions, profiles] = queries;
  state.data = {
    state: gameState.data,
    characters: characters.data ?? [],
    privateStats: privateStats.data ?? [],
    retainers: retainers.data ?? [],
    retainerPrivate: retainerPrivate.data ?? [],
    assignments: assignments.data ?? [],
    actions: actions.data ?? [],
    factions: factions.data ?? [],
    groups: groups.data ?? [],
    policies: policies.data ?? [],
    foreignPowers: foreignPowers.data ?? [],
    votes: votes.data ?? [],
    positions: positions.data ?? [],
    profiles: profiles.data ?? [],
  };
  render();
}

function renderSetup() {
  root.innerHTML = shell(`
    <section class="setupPanel">
      <p class="eyebrow">Peace Death</p>
      <h1>需要连接 Supabase</h1>
      <p>编辑 <code>config.js</code>，填入项目 URL 和 anon key。随后在 Supabase SQL Editor 运行 <code>supabase/schema.sql</code> 与 <code>supabase/seed.sql</code>。</p>
      ${state.error ? `<div class="errorBox">${escapeHtml(state.error)}</div>` : ""}
    </section>
  `);
}

function render() {
  if (!state.session) {
    renderLogin();
    return;
  }
  if (!state.profile) {
    root.innerHTML = shell(`
      <section class="panel">
        <h2>账号还没有档案</h2>
        <p>请先创建 Auth 用户，并运行 seed.sql 中的 profiles 初始化段。</p>
        ${state.error ? `<div class="errorBox">${escapeHtml(state.error)}</div>` : ""}
      </section>
    `);
    return;
  }

  const isDm = state.profile.role === "dm";
  root.innerHTML = shell(`
    <header class="topbar">
      <div>
        <p class="eyebrow">巨人之间：和平之死</p>
        <h1>团务控制台</h1>
      </div>
      <div class="topbarActions">
        <button class="iconButton" data-action="refresh" title="刷新">↻</button>
        <button class="ghostButton" data-action="logout">退出</button>
      </div>
    </header>
    ${phaseStrip()}
    ${state.error ? `<div class="errorBox">${escapeHtml(state.error)}</div>` : ""}
    <nav class="tabs">
      ${tabButton("overview", "总览")}
      ${tabButton("character", "角色")}
      ${tabButton("actions", "行动")}
      ${tabButton("government", "政府")}
      ${tabButton("parliament", "国会")}
      ${isDm ? tabButton("dm", "DM") : ""}
    </nav>
    ${renderTab()}
  `);
  bindCommon();
  bindTab();
}

function renderLogin() {
  root.innerHTML = shell(`
    <form class="loginPanel" id="login-form">
      <p class="eyebrow">Peace Death</p>
      <h1>登录角色</h1>
      <label>邮箱<input name="email" placeholder="hanna@peace.local" autocomplete="username"></label>
      <label>密码<input name="password" type="password" autocomplete="current-password"></label>
      ${state.error ? `<div class="errorBox">${escapeHtml(state.error)}</div>` : ""}
      <button class="primaryButton">进入</button>
    </form>
  `);
  document.getElementById("login-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const { error } = await supabase.auth.signInWithPassword({
      email: form.get("email"),
      password: form.get("password"),
    });
    state.error = error?.message ?? "";
    render();
  });
}

function shell(content) {
  return `<main class="appShell">${content}</main>`;
}

function tabButton(key, label) {
  return `<button class="tab ${state.tab === key ? "active" : ""}" data-tab="${key}">${label}</button>`;
}

function phaseStrip() {
  const current = state.data.state?.current_phase ?? "turn_start";
  return `
    <section class="phaseStrip">
      <div><span>第 ${state.data.state?.current_turn ?? 1} 回合</span><strong>${phaseLabel(current)}</strong></div>
      <div class="phaseSteps">
        ${PHASES.map(([key, label]) => `<span class="phaseStep ${key === current ? "active" : ""}">${label}</span>`).join("")}
      </div>
    </section>
  `;
}

function renderTab() {
  if (state.tab === "overview") return overview();
  if (state.tab === "character") return characterPanel();
  if (state.tab === "actions") return actionPanel();
  if (state.tab === "government") return governmentPanel();
  if (state.tab === "parliament") return parliamentPanel();
  if (state.tab === "dm") return dmPanel();
  return "";
}

function overview() {
  const legitimacy = calculateLegitimacy();
  return `
    <div class="grid two">
      <section class="panel">
        <div class="panelHeader">
          <h2>国家状态</h2>
          <span class="scorePill ${legitimacy < 25 ? "danger" : legitimacy >= 75 ? "good" : ""}">合法性 ${legitimacy}%</span>
        </div>
        <div class="statGrid">
          ${metric("经济形势", state.data.state?.economy_status ?? "一切如常")}
          ${metric("国家预算", state.data.state?.budget_status ?? "平衡")}
          ${metric("DM修正", `${state.data.state?.legitimacy_modifier ?? 0}%`)}
          ${metric("最大回合", state.data.state?.max_turns ?? 5)}
        </div>
        <div class="policyList">
          ${state.data.policies.map(policyRow).join("")}
        </div>
      </section>
      <section class="panel">
        <h2>派系与社会</h2>
        <div class="factionList">
          ${state.data.factions.map((f) => `
            <div class="factionRow">
              <span class="swatch" style="background:${escapeAttr(f.color)}"></span>
              <strong>${escapeHtml(f.short_name)}</strong>
              <span>${Number(f.influence)}%</span>
              <span>${Math.round(Number(f.influence))}席</span>
            </div>
          `).join("")}
        </div>
        <div class="moodGrid">
          ${state.data.groups.map((g) => `<span class="mood ${g.mood <= -1 ? "low" : g.mood === 2 ? "high" : ""}">${escapeHtml(g.name)}：${moodLabel(g.mood)}</span>`).join("")}
        </div>
        <div class="foreignRow">
          ${state.data.foreignPowers.map((p) => metric(p.name, `耐心 ${p.patience}`)).join("")}
        </div>
      </section>
    </div>
  `;
}

function policyRow(policy) {
  const isDm = state.profile.role === "dm";
  const [label, options] = POLICY_CATALOG[policy.policy_key] ?? [policy.policy_key, {}];
  if (!isDm) {
    return `<div class="policyRow"><span>${escapeHtml(label)}</span><strong>${escapeHtml(options[policy.option_key] ?? policy.option_key)}</strong></div>`;
  }
  return `
    <label class="policyRow">
      <span>${escapeHtml(label)}</span>
      <select data-policy="${escapeAttr(policy.policy_key)}">
        ${Object.entries(options).map(([key, name]) => `<option value="${key}" ${key === policy.option_key ? "selected" : ""}>${escapeHtml(name)}</option>`).join("")}
      </select>
    </label>
  `;
}

function characterPanel() {
  const isDm = state.profile.role === "dm";
  const characters = isDm ? state.data.characters : state.data.characters.filter((c) => c.owner_id === state.profile.id);
  const statsByCharacter = new Map(state.data.privateStats.map((s) => [s.character_id, s]));
  const assignmentNames = assignmentMap();
  return `
    <section class="panel wide">
      <div class="panelHeader">
        <div>
          <h2>车卡</h2>
          <p>固定四点特质点；可以少花，少花作废。属性和骰点按场外结果手动填写。</p>
        </div>
        <span class="scorePill">亲信数 = (魅力 + 威望) / 50 向下取整</span>
      </div>
      ${characterCreateForm()}
    </section>
    <div class="grid two characterList">
      ${characters.map((character) => {
        const stats = statsByCharacter.get(character.id);
        const retainers = state.data.retainers.filter((r) => r.character_id === character.id);
        return `
          <section class="panel characterCard">
            <div class="panelHeader">
              <div>
                <h2>${escapeHtml(character.name)}</h2>
                <p>${escapeHtml(character.ethnicity)} / ${escapeHtml(character.faith)} / ${escapeHtml(factionName(character.faction_id))}</p>
              </div>
              <div class="cardActions">
                <span class="scorePill">${escapeHtml((assignmentNames[`character:${character.id}`] ?? ["无职位"]).join("、"))}</span>
                ${canDeleteCharacter(character) ? `<button class="dangerButton" data-delete-character="${character.id}" data-character-name="${escapeAttr(character.name)}" type="button">删除</button>` : ""}
              </div>
            </div>
            <p class="story">${escapeHtml(character.public_background || "暂无公开背景。")}</p>
            ${tagBlock("公开特质", character.public_traits)}
            ${stats ? statGrid(stats) + tagBlock("秘密特质", stats.secret_traits) + tagBlock("人生追求", [stats.pursuit].filter(Boolean)) : ""}
            <h3>亲信</h3>
            <div class="retainerGrid">
              ${retainers.map((retainer) => `
                <div class="retainerCard">
                  <strong>${escapeHtml(retainer.name)}</strong>
                  <span>${retainer.gender && retainer.age ? `${escapeHtml(retainer.gender)}，${retainer.age}岁` : "资料不完整"}</span>
                  <span>${escapeHtml((assignmentNames[`retainer:${retainer.id}`] ?? ["无职位"]).join("、"))}</span>
                  <small>${escapeHtml(retainer.notes ?? "")}</small>
                </div>
              `).join("")}
            </div>
          </section>
        `;
      }).join("")}
    </div>
  `;
}

function characterCreateForm() {
  const playerOptions = state.profile.role === "dm"
    ? state.data.profiles?.map((p) => `<option value="${p.id}" ${p.id === state.profile.id ? "selected" : ""}>${escapeHtml(p.display_name)}</option>`).join("") ?? ""
    : "";
  return `
    <form id="character-form" class="characterForm">
      ${state.profile.role === "dm" ? `<label>归属账号<select name="owner_id">${playerOptions}</select></label>` : ""}
      <div class="formRow">
        <label>姓名<input name="name" required></label>
        <label>性别<input name="gender"></label>
        <label>年龄<input name="age" type="number" min="1" value="40"></label>
      </div>
      <div class="formRow">
        <label>民族<select name="ethnicity"><option>约尔裔</option><option>卡兰克裔</option><option>其他少数民族</option></select></label>
        <label>信仰<select name="faith"><option>圣会派</option><option>瓦勒派</option><option>无神论</option></select></label>
        <label>政治派系<select name="faction_id">${state.data.factions.filter((f) => f.faction_type === "political" && f.key !== "unaligned").map((f) => `<option value="${f.id}">${escapeHtml(f.short_name)}</option>`).join("")}</select></label>
      </div>
      <h3>属性</h3>
      <div class="statInputGrid">
        ${statInput("body", "体质", 40, 40, 80)}
        ${statInput("willpower", "意志", 40, 40, 80)}
        ${statInput("wealth", "财富", 40, 10, 90)}
        ${statInput("charm", "魅力", 40, 40, 80)}
        ${statInput("intellect", "智力", 40, 40, 80)}
        ${statInput("prestige", "威望", 20, 20, 100)}
        ${statInput("perception", "感知", 40, 40, 80)}
        ${statInput("luck", "幸运", 45, 15, 90, 5)}
      </div>
      <h3>技能</h3>
      <div class="statInputGrid">
        ${["谈判", "演讲", "写作", "法律", "会计"].map((skill) => `<label>${skill}<input name="skill_${skill}" type="number" min="10" max="100" value="10"></label>`).join("")}
      </div>
      <div class="traitColumns">
        <div>
          <h3>公开特质</h3>
          ${PUBLIC_TRAITS.map(([name, cost, req]) => traitCheckbox("public_traits", name, cost, req)).join("")}
        </div>
        <div>
          <h3>秘密特质</h3>
          ${SECRET_TRAITS.map(([name, cost]) => traitCheckbox("secret_traits", name, cost, "")).join("")}
          <h3>人生追求</h3>
          <label>选择一项<select name="pursuit" required>${PURSUITS.map((p) => `<option>${p}</option>`).join("")}</select></label>
        </div>
      </div>
      <label>公开背景<textarea name="public_background"></textarea></label>
      <label>亲信（每行一个：姓名，性别，年龄，备注）<textarea name="retainers" placeholder="海因里希，男，55，管家"></textarea></label>
      <div class="toggleRow">
        ${state.profile.role === "dm" ? `<label><input name="override_validation" type="checkbox"> DM忽略特质/亲信校验</label>` : ""}
      </div>
      <div class="buttonRow">
        <button class="primaryButton" type="button" data-action="create-character">保存角色卡</button>
      </div>
    </form>
  `;
}

function statInput(name, label, value, min, max, step = 1) {
  return `<label>${label}<input name="${name}" type="number" min="${min}" max="${max}" step="${step}" value="${value}"></label>`;
}

function traitCheckbox(group, name, cost, req) {
  const reqText = req ? ` · ${traitRequirementLabel(req)}` : "";
  return `<label class="checkLine"><input type="checkbox" name="${group}" value="${escapeAttr(name)}" data-cost="${cost}" data-req="${escapeAttr(req)}"> ${escapeHtml(name)}（${cost >= 0 ? cost : "+" + Math.abs(cost)}点${reqText}）</label>`;
}

function actionPanel() {
  const ownCharacters = state.data.characters.filter((c) => c.owner_id === state.profile.id);
  const ownIds = new Set(ownCharacters.map((c) => c.id));
  const retainers = state.data.retainers.filter((r) => ownIds.has(r.character_id));
  const actors = [
    ...ownCharacters.map((c) => ["character", c.id, c.name]),
    ...retainers.map((r) => ["retainer", r.id, `${r.name}（亲信）`]),
  ];
  const ownStats = state.data.privateStats.filter((s) => ownIds.has(s.character_id));
  const hasYouth = ownCharacters.some((c) => c.public_traits?.includes("年轻气盛")) || ownStats.some((s) => s.secret_traits?.includes("年轻气盛"));
  return `
    <div class="grid two">
      <section class="panel">
        <div class="panelHeader"><h2>行动草稿</h2><span class="scorePill">草稿不限阶段</span></div>
        <div class="notice">正式提交只在对应阶段开放；政府行动不公开必须填写理由，理由不合理由DM扣威望。</div>
        <form id="action-form">
          <label>行动类型<select name="action_kind"><option value="private">私人行动</option><option value="government">政府行动</option></select></label>
          <label>执行者<select name="actor">${actors.map(([type, id, name]) => `<option value="${type}:${id}">${escapeHtml(name)}</option>`).join("")}</select></label>
          <label>标题<input name="title"></label>
          <div class="formRow">
            <label>分类<select name="category">${["外交", "情报", "经济", "宣传", "军事", "司法", "结党", "调查", "改革", "其他"].map((x) => `<option>${x}</option>`).join("")}</select></label>
            <label>目标<input name="target"></label>
          </div>
          <label>描述<textarea name="description"></textarea></label>
          <label>使用资源 / 特质 / 备注<textarea name="resources"></textarea></label>
          <div class="toggleRow">
            <label><input name="requires_approval" type="checkbox"> 需要公爵或首相批准</label>
            <label><input name="public_government" type="checkbox"> 政府行动公开完整内容</label>
          </div>
          <label>不公开理由<input name="non_public_reason"></label>
          <div class="buttonRow">
            <button class="ghostButton" type="button" data-action-save="draft">保存草稿</button>
            <button class="primaryButton" type="button" data-action-save="submitted">提交</button>
          </div>
        </form>
      </section>
      <section class="panel">
        <div class="panelHeader"><h2>行动记录</h2><div class="quota">私人 ${hasYouth ? 3 : 2} / 政府 ${hasYouth ? 2 : 1}</div></div>
        <div class="actionStack">${state.data.actions.map(actionCard).join("")}</div>
      </section>
    </div>
  `;
}

function governmentPanel() {
  const canApprove = isGovernmentHead();
  const approvals = state.data.actions.filter((a) => a.status === "needs_approval");
  return `
    <div class="grid two">
      <section class="panel"><h2>政府职位</h2>${positionList()}</section>
      <section class="panel">
        <h2>待批准改革</h2>
        ${canApprove ? "" : `<div class="notice">只有公爵或首相可以批准部长改革。</div>`}
        <div class="actionStack">
          ${approvals.map((a) => `
            <article class="actionCard">
              <strong>${escapeHtml(a.title)}</strong>
              <span>${a.non_public_reason ? `不公开理由：${escapeHtml(a.non_public_reason)}` : "公开行动"}</span>
              <p>${escapeHtml(a.description)}</p>
              ${canApprove ? `<div class="buttonRow"><button class="primaryButton" data-approve="${a.id}" data-status="approved">批准</button><button class="ghostButton" data-approve="${a.id}" data-status="rejected">驳回</button></div>` : ""}
            </article>
          `).join("")}
        </div>
      </section>
    </div>
  `;
}

function parliamentPanel() {
  const isDm = state.profile.role === "dm";
  const voteGroups = groupedVotes();
  return `
    <section class="panel">
      <div class="panelHeader"><h2>议会投票</h2><span class="scorePill">100席</span></div>
      ${isDm ? `<div class="inlineForm"><input id="vote-issue" placeholder="议题"><button class="primaryButton" data-action="create-vote">创建投票</button></div>` : ""}
      <div class="parliamentStack">
        ${voteGroups.length ? voteGroups.map(parliamentVoteCard).join("") : parliamentVoteCard({ issue: "当前席位", turn: state.data.state?.current_turn ?? 1, rows: [] })}
      </div>
    </section>
  `;
}

function parliamentVoteCard(group) {
  const isDm = state.profile.role === "dm";
  const totals = voteTotals(group.rows);
  return `
    <article class="parliamentCard">
      <div class="parliamentHeader">
        <div>
          <h3>${escapeHtml(group.issue)}</h3>
          <span>第 ${group.turn} 回合</span>
        </div>
        <div class="voteTotals">
          <b class="yes">赞成 ${totals.yes}</b>
          <b class="no">反对 ${totals.no}</b>
          <b class="abstain">弃权 ${totals.abstain}</b>
        </div>
      </div>
      <div class="chamber" aria-label="${escapeAttr(group.issue)} 席位图">
        ${parliamentDots(group.rows)}
      </div>
      <div class="voteLegend">
        ${state.data.factions.filter((f) => f.faction_type === "political").map((f) => `<span><i style="background:${escapeAttr(f.color)}"></i>${escapeHtml(f.short_name)}</span>`).join("")}
      </div>
      <div class="voteTable">
        ${group.rows.map((v) => `
          <div class="voteRow">
            <strong>${escapeHtml(v.factions?.short_name ?? factionName(v.faction_id))}</strong>
            <span>${v.seats}席</span>
            <button ${isDm ? "" : "disabled"} data-vote="${v.id}" data-field="yes_votes" data-current="${v.yes_votes}">赞成 ${v.yes_votes}</button>
            <button ${isDm ? "" : "disabled"} data-vote="${v.id}" data-field="no_votes" data-current="${v.no_votes}">反对 ${v.no_votes}</button>
            <button ${isDm ? "" : "disabled"} data-vote="${v.id}" data-field="abstain_votes" data-current="${v.abstain_votes}">弃权 ${v.abstain_votes}</button>
          </div>
        `).join("")}
      </div>
    </article>
  `;
}

function groupedVotes() {
  const groups = new Map();
  for (const vote of state.data.votes) {
    const key = `${vote.turn_number}:${vote.issue}`;
    if (!groups.has(key)) groups.set(key, { issue: vote.issue, turn: vote.turn_number, rows: [] });
    groups.get(key).rows.push(vote);
  }
  return Array.from(groups.values()).sort((a, b) => b.turn - a.turn);
}

function voteTotals(rows) {
  return rows.reduce((sum, row) => ({
    yes: sum.yes + Number(row.yes_votes ?? 0),
    no: sum.no + Number(row.no_votes ?? 0),
    abstain: sum.abstain + Number(row.abstain_votes ?? 0),
  }), { yes: 0, no: 0, abstain: 0 });
}

function parliamentDots(rows) {
  const seats = [];
  const rowByFaction = new Map(rows.map((row) => [row.faction_id, row]));
  for (const faction of state.data.factions.filter((f) => f.faction_type === "political")) {
    const row = rowByFaction.get(faction.id);
    const seatCount = row ? Number(row.seats) : Math.round(Number(faction.influence));
    const votes = row
      ? [
          ["yes", Number(row.yes_votes ?? 0)],
          ["no", Number(row.no_votes ?? 0)],
          ["abstain", Math.max(0, seatCount - Number(row.yes_votes ?? 0) - Number(row.no_votes ?? 0))],
        ]
      : [["neutral", seatCount]];
    for (const [voteClass, count] of votes) {
      for (let i = 0; i < count; i += 1) seats.push({ color: faction.color, faction: faction.short_name, voteClass });
    }
  }
  const normalized = seats.slice(0, 100);
  while (normalized.length < 100) normalized.push({ color: "#b9b3aa", faction: "空席", voteClass: "neutral" });
  const centerX = 50;
  const centerY = 50;
  const rings = [
    { radius: 44, count: 36 },
    { radius: 34, count: 30 },
    { radius: 24, count: 22 },
    { radius: 14, count: 12 },
  ];
  let index = 0;
  return rings.map((ring) => {
    const dots = [];
    for (let i = 0; i < ring.count; i += 1) {
      const seat = normalized[index] ?? normalized[normalized.length - 1];
      const angle = Math.PI - (Math.PI * (i + 0.5)) / ring.count;
      const x = centerX + Math.cos(angle) * ring.radius;
      const y = centerY - Math.sin(angle) * ring.radius;
      dots.push(`<span class="seatDot ${seat.voteClass}" style="left:${x}%; top:${y}%; background:${escapeAttr(seat.color)}" title="${escapeAttr(`${seat.faction} · ${voteClassLabel(seat.voteClass)}`)}"></span>`);
      index += 1;
    }
    return dots.join("");
  }).join("");
}

function voteClassLabel(value) {
  return { yes: "赞成", no: "反对", abstain: "弃权", neutral: "未表决" }[value] ?? value;
}

function dmPanel() {
  return `
    <div class="grid two">
      <section class="panel">
        <h2>阶段与国家修正</h2>
        <button class="primaryButton" data-action="advance-phase">推进到下一阶段</button>
        <label>合法性DM修正<input id="legitimacy-modifier" type="number" value="${state.data.state?.legitimacy_modifier ?? 0}"></label>
        <button class="ghostButton" data-action="save-state">保存修正</button>
        <button class="ghostButton" data-action="draw-scandal">随机抽取黑料</button>
      </section>
      <section class="panel">
        <h2>职位任命</h2>
        <div class="inlineForm">
          <select id="assign-entity">${entityOptions()}</select>
          <select id="assign-position">${state.data.positions.map((p) => `<option value="${p.id}">${escapeHtml(p.name)}</option>`).join("")}</select>
          <button class="primaryButton" data-action="assign-position">任命</button>
        </div>
        ${positionList()}
      </section>
      <section class="panel wide">
        <h2>待处理行动</h2>
        <div class="actionStack">
          ${state.data.actions.filter((a) => ["submitted", "approved"].includes(a.status)).map((a) => `
            <article class="actionCard">
              <strong>${escapeHtml(a.title)}</strong>
              <span>${statusLabel(a.status)} · ${a.action_kind === "private" ? "私人行动" : "政府行动"}</span>
              <p>${escapeHtml(a.description)}</p>
              <button class="primaryButton" data-process="${a.id}">填写结果并处理</button>
            </article>
          `).join("")}
        </div>
      </section>
    </div>
  `;
}

function bindCommon() {
  root.querySelectorAll("[data-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      state.tab = button.dataset.tab;
      render();
    });
  });
  root.querySelector('[data-action="refresh"]')?.addEventListener("click", loadAll);
  root.querySelector('[data-action="logout"]')?.addEventListener("click", () => supabase.auth.signOut());
}

function bindTab() {
  root.querySelectorAll("[data-policy]").forEach((select) => {
    select.addEventListener("change", async () => {
      await supabase.from("current_policies").update({ option_key: select.value }).eq("policy_key", select.dataset.policy);
      loadAll();
    });
  });

  root.querySelectorAll("[data-action-save]").forEach((button) => {
    button.addEventListener("click", () => saveAction(button.dataset.actionSave));
  });

  root.querySelector('[data-action="create-character"]')?.addEventListener("click", createCharacter);
  root.querySelectorAll("[data-delete-character]").forEach((button) => {
    button.addEventListener("click", () => deleteCharacter(button.dataset.deleteCharacter, button.dataset.characterName));
  });

  root.querySelectorAll("[data-approve]").forEach((button) => {
    button.addEventListener("click", async () => {
      await supabase.from("actions").update({ status: button.dataset.status, approved_by: state.profile.id }).eq("id", button.dataset.approve);
      loadAll();
    });
  });

  root.querySelector('[data-action="create-vote"]')?.addEventListener("click", createVote);
  root.querySelectorAll("[data-vote]").forEach((button) => {
    button.addEventListener("click", () => updateVote(button.dataset.vote, button.dataset.field, button.dataset.current ?? "0"));
  });
  root.querySelector('[data-action="advance-phase"]')?.addEventListener("click", advancePhase);
  root.querySelector('[data-action="save-state"]')?.addEventListener("click", saveState);
  root.querySelector('[data-action="assign-position"]')?.addEventListener("click", assignPosition);
  root.querySelector('[data-action="draw-scandal"]')?.addEventListener("click", drawScandal);
  root.querySelectorAll("[data-process]").forEach((button) => {
    button.addEventListener("click", () => processAction(button.dataset.process));
  });
}

async function saveAction(mode) {
  const form = document.getElementById("action-form");
  if (!form) return;
  const data = new FormData(form);
  const [actorType, actorId] = String(data.get("actor")).split(":");
  const actionKind = data.get("action_kind");
  const expectedPhase = actionKind === "private" ? "private_submission" : "government_submission";
  if (mode !== "draft" && state.data.state?.current_phase !== expectedPhase) {
    alert(`当前阶段不能提交${actionKind === "private" ? "私人" : "政府"}行动。`);
    return;
  }
  const isPublic = Boolean(data.get("public_government"));
  const reason = String(data.get("non_public_reason") ?? "");
  if (actionKind === "government" && !isPublic && !reason.trim()) {
    alert("政府行动不公开必须填写理由。");
    return;
  }
  const status = mode === "draft"
    ? "draft"
    : actionKind === "government" && data.get("requires_approval")
      ? "needs_approval"
      : "submitted";
  const { error } = await supabase.from("actions").insert({
    owner_id: state.profile.id,
    turn_number: state.data.state?.current_turn ?? 1,
    action_kind: actionKind,
    actor_type: actorType,
    actor_id: actorId,
    title: data.get("title"),
    category: data.get("category"),
    target: data.get("target"),
    description: data.get("description"),
    resources: data.get("resources"),
    visibility: actionKind === "private" ? "private" : isPublic ? "public" : "private",
    non_public_reason: reason,
    requires_approval: Boolean(data.get("requires_approval")),
    status,
  });
  if (error) alert(error.message);
  else loadAll();
}

async function createCharacter() {
  const form = document.getElementById("character-form");
  if (!form) return;
  const data = new FormData(form);
  const ownerId = state.profile.role === "dm" ? String(data.get("owner_id")) : state.profile.id;
  const publicTraits = selectedValues(form, "public_traits");
  const secretTraits = selectedValues(form, "secret_traits");
  const pursuit = String(data.get("pursuit") ?? "");
  const override = state.profile.role === "dm" && Boolean(data.get("override_validation"));
  const attributes = {
    body: numberField(data, "body"),
    willpower: numberField(data, "willpower"),
    wealth: numberField(data, "wealth"),
    charm: numberField(data, "charm"),
    intellect: numberField(data, "intellect"),
    prestige: numberField(data, "prestige"),
    perception: numberField(data, "perception"),
    luck: numberField(data, "luck"),
  };
  const characterDraft = {
    name: String(data.get("name") ?? "").trim(),
    gender: String(data.get("gender") ?? "").trim(),
    age: numberField(data, "age"),
    ethnicity: String(data.get("ethnicity") ?? ""),
    faith: String(data.get("faith") ?? ""),
    faction_id: String(data.get("faction_id") ?? ""),
    public_traits: publicTraits,
    public_background: String(data.get("public_background") ?? "").trim(),
  };
  const retainers = parseRetainers(String(data.get("retainers") ?? ""));
  const errors = override ? [] : validateCharacterDraft(characterDraft, attributes, publicTraits, secretTraits, pursuit, retainers);
  if (errors.length) {
    alert(errors.join("\n"));
    return;
  }
  const skills = {
    谈判: numberField(data, "skill_谈判"),
    演讲: numberField(data, "skill_演讲"),
    写作: numberField(data, "skill_写作"),
    法律: numberField(data, "skill_法律"),
    会计: numberField(data, "skill_会计"),
  };
  const skillErrors = override ? [] : validateSkills(skills, attributes.intellect);
  if (skillErrors.length) {
    alert(skillErrors.join("\n"));
    return;
  }
  const inserted = await supabase.from("characters_public").insert({
    owner_id: ownerId,
    ...characterDraft,
  }).select("id").single();
  if (inserted.error) {
    alert(inserted.error.message);
    return;
  }
  const characterId = inserted.data.id;
  const privateInsert = await supabase.from("character_private").insert({
    character_id: characterId,
    ...attributes,
    skills,
    secret_traits: secretTraits,
    pursuit,
    scandal_count: 0,
  });
  if (privateInsert.error) {
    alert(privateInsert.error.message);
    return;
  }
  if (retainers.length) {
    const retainerRows = retainers.map((retainer) => ({ character_id: characterId, ...retainer }));
    const retainerInsert = await supabase.from("retainers").insert(retainerRows);
    if (retainerInsert.error) {
      alert(retainerInsert.error.message);
      return;
    }
  }
  await loadAll();
}

async function deleteCharacter(characterId, characterName) {
  const typed = prompt(`要删除角色卡“${characterName}”，请输入完整角色名确认。`);
  if (typed !== characterName) return;
  const { error } = await supabase.rpc("delete_character", { character_uuid: characterId });
  if (error) alert(error.message);
  else await loadAll();
}

function validateCharacterDraft(character, attributes, publicTraits, secretTraits, pursuit, retainers) {
  const errors = [];
  if (!character.name) errors.push("姓名不能为空。");
  if (!pursuit || !PURSUITS.includes(pursuit)) errors.push("必须选择一个人生追求。");
  const attributeErrors = validateAttributes(character, attributes, publicTraits);
  errors.push(...attributeErrors);
  const cost = traitCost(publicTraits, secretTraits, character.faction_id);
  if (cost > 4) errors.push(`特质点超支：当前 ${cost} 点，最多 4 点。`);
  if (publicTraits.includes("资本家") && publicTraits.includes("苦行僧")) {
    errors.push("资本家和苦行僧的财富范围冲突，不能同时选择。");
  }
  for (const [name, , req] of PUBLIC_TRAITS) {
    if (publicTraits.includes(name) && !meetsRequirement(req, character, attributes)) {
      errors.push(`${name} 不满足前置：${traitRequirementLabel(req)}。`);
    }
  }
  const retainerLimit = Math.floor((Number(attributes.charm) + Number(attributes.prestige)) / 50);
  if (retainers.length > retainerLimit) errors.push(`亲信数量超出上限：当前 ${retainers.length} 个，上限 ${retainerLimit} 个。`);
  retainers.forEach((retainer, index) => {
    if (!retainer.name || !retainer.gender || !retainer.age) {
      errors.push(`第 ${index + 1} 个亲信格式不完整，请按“姓名，性别，年龄，备注”填写。`);
    }
  });
  return errors;
}

function validateAttributes(character, attributes, publicTraits) {
  const errors = [];
  const coreStats = ["body", "willpower", "wealth", "charm", "intellect", "perception"];
  const labels = { body: "体质", willpower: "意志", wealth: "财富", charm: "魅力", intellect: "智力", perception: "感知" };
  const sum = coreStats.reduce((total, key) => total + Number(attributes[key] ?? 0), 0);
  if (sum !== 400) errors.push(`六项属性点合计必须为 400；当前为 ${sum}。`);
  for (const key of ["body", "willpower", "charm", "intellect", "perception"]) {
    if (!inRange(attributes[key], 40, 80)) errors.push(`${labels[key]}必须在 40-80 之间。`);
  }
  const [wealthMin, wealthMax] = wealthRange(publicTraits);
  if (!inRange(attributes.wealth, wealthMin, wealthMax)) errors.push(`财富必须在 ${wealthMin}-${wealthMax} 之间。`);
  const age = Number(character.age ?? 0);
  if (!Number.isInteger(age) || age <= 0) errors.push("年龄必须是正整数。");
  if (!inRange(attributes.prestige, 20, Math.max(20, age))) errors.push(`威望最低 20，且不能大于年龄；当前年龄 ${age}。`);
  if (!inRange(attributes.luck, 15, 90) || Number(attributes.luck) % 5 !== 0) errors.push("幸运必须是 15-90 之间的 5 的倍数。");
  return errors;
}

function validateSkills(skills, intellect) {
  const errors = [];
  let spent = 0;
  for (const [name, value] of Object.entries(skills)) {
    if (!inRange(value, 10, 100)) errors.push(`${name}必须在 10-100 之间。`);
    spent += Math.max(0, Number(value) - 10);
  }
  const budget = Number(intellect) * 2;
  if (spent !== budget) errors.push(`技能点投入必须等于 智力×2，即 ${budget} 点；当前投入 ${spent} 点。`);
  return errors;
}

function wealthRange(publicTraits) {
  if (publicTraits.includes("苦行僧")) return [10, 20];
  if (publicTraits.includes("资本家")) return [40, 90];
  return [40, 80];
}

function inRange(value, min, max) {
  const number = Number(value);
  return Number.isFinite(number) && number >= min && number <= max;
}

function traitCost(publicTraits, secretTraits, factionId) {
  let total = 0;
  for (const trait of publicTraits) total += PUBLIC_TRAITS.find(([name]) => name === trait)?.[1] ?? 0;
  for (const trait of secretTraits) {
    if (trait === "工会联系" && factionKey(factionId) !== "social_democrats") total += 2;
    else total += SECRET_TRAITS.find(([name]) => name === trait)?.[1] ?? 0;
  }
  return total;
}

function meetsRequirement(req, character, attributes) {
  if (!req) return true;
  const [kind, value] = req.split(":");
  if (kind === "ethnicity") return character.ethnicity === value;
  if (kind === "intellect") return Number(attributes.intellect) >= Number(value);
  if (kind === "age_min") return Number(character.age) >= Number(value);
  if (kind === "age_max") return Number(character.age) <= Number(value);
  return true;
}

function traitRequirementLabel(req) {
  if (!req) return "";
  const [kind, value] = req.split(":");
  if (kind === "ethnicity") return `需要民族为${value}`;
  if (kind === "intellect") return `需要智力至少${value}`;
  if (kind === "age_min") return `需要年龄至少${value}`;
  if (kind === "age_max") return `需要年龄不超过${value}`;
  return req;
}

function selectedValues(form, name) {
  return Array.from(form.querySelectorAll(`input[name="${name}"]:checked`)).map((input) => input.value);
}

function numberField(data, name) {
  return Number(data.get(name) ?? 0);
}

function parseRetainers(text) {
  return text.split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name = "", gender = "", age = "", ...notes] = line.split(/[，,]/).map((part) => part.trim());
      return { name, gender, age: Number(age) || null, notes: notes.join("，") };
    })
    .filter((retainer) => retainer.name);
}

async function advancePhase() {
  const current = state.data.state?.current_phase ?? "turn_start";
  const index = PHASES.findIndex(([key]) => key === current);
  const next = PHASES[(index + 1) % PHASES.length][0];
  const patch = next === "turn_start"
    ? { current_phase: next, current_turn: Number(state.data.state?.current_turn ?? 1) + 1 }
    : { current_phase: next };
  const { error } = await supabase.from("game_state").update(patch).eq("id", true);
  if (error) alert(error.message);
  else loadAll();
}

async function saveState() {
  const value = Number(document.getElementById("legitimacy-modifier")?.value ?? 0);
  const { error } = await supabase.from("game_state").update({ legitimacy_modifier: value }).eq("id", true);
  if (error) alert(error.message);
  else loadAll();
}

async function assignPosition() {
  const [entityType, entityId] = document.getElementById("assign-entity").value.split(":");
  const positionId = document.getElementById("assign-position").value;
  const { error } = await supabase.from("position_assignments").insert({ entity_type: entityType, entity_id: entityId, position_id: positionId });
  if (error) alert(error.message);
  else loadAll();
}

async function createVote() {
  const issue = document.getElementById("vote-issue").value.trim();
  if (!issue) return;
  const rows = state.data.factions.filter((f) => f.faction_type === "political").map((f) => ({
    issue,
    turn_number: state.data.state?.current_turn ?? 1,
    faction_id: f.id,
    seats: Math.round(Number(f.influence)),
    yes_votes: 0,
    no_votes: 0,
    abstain_votes: Math.round(Number(f.influence)),
  }));
  const { error } = await supabase.from("parliament_votes").insert(rows);
  if (error) alert(error.message);
  else loadAll();
}

async function updateVote(id, field, currentValue) {
  const value = Number(prompt("填写票数", currentValue || "0"));
  if (Number.isNaN(value)) return;
  const { error } = await supabase.from("parliament_votes").update({ [field]: value }).eq("id", id);
  if (error) alert(error.message);
  else loadAll();
}

async function processAction(id) {
  const action = state.data.actions.find((item) => item.id === id);
  const resultPublic = prompt("公开结果", action?.result_public ?? "") ?? "";
  const resultPrivate = prompt("私密结果", action?.result_private ?? "") ?? "";
  const { error } = await supabase
    .from("actions")
    .update({ status: "processed", result_public: resultPublic, result_private: resultPrivate, processed_at: new Date().toISOString() })
    .eq("id", id);
  if (error) alert(error.message);
  else loadAll();
}

function drawScandal() {
  const item = SCANDALS[Math.floor(Math.random() * SCANDALS.length)];
  alert(`${item[0]}：${item[1]}`);
}

function metric(label, value) {
  return `<div class="metric"><span>${escapeHtml(label)}</span><strong>${escapeHtml(String(value ?? "-"))}</strong></div>`;
}

function statGrid(stats) {
  const labels = { body: "体质", willpower: "意志", wealth: "财富", charm: "魅力", intellect: "智力", prestige: "威望", perception: "感知", luck: "幸运" };
  return `<div class="statGrid compact">${Object.entries(labels).map(([key, label]) => metric(label, stats[key])).join("")}</div>`;
}

function tagBlock(title, items = []) {
  if (!items?.length) return "";
  return `<div class="tagBlock"><span>${escapeHtml(title)}</span><div>${items.map((item) => `<b>${escapeHtml(item)}</b>`).join("")}</div></div>`;
}

function actionCard(action) {
  return `
    <article class="actionCard">
      <div><strong>${escapeHtml(action.title || "未命名行动")}</strong><span>${statusLabel(action.status)} · 第${action.turn_number}回合 · ${action.action_kind === "government" ? (action.visibility === "public" ? "公开政府行动" : "不公开政府行动") : "私人行动"}</span></div>
      <p>${escapeHtml(action.description)}</p>
      ${action.result_public ? `<div class="resultBox">${escapeHtml(action.result_public)}</div>` : ""}
      ${action.result_private ? `<div class="resultBox private">${escapeHtml(action.result_private)}</div>` : ""}
    </article>
  `;
}

function positionList() {
  const names = new Map([
    ...state.data.characters.map((c) => [`character:${c.id}`, c.name]),
    ...state.data.retainers.map((r) => [`retainer:${r.id}`, `${r.name}（亲信）`]),
  ]);
  const assignmentsByPosition = new Map();
  for (const assignment of state.data.assignments) {
    const list = assignmentsByPosition.get(assignment.position_id) ?? [];
    list.push(escapeHtml(names.get(`${assignment.entity_type}:${assignment.entity_id}`) ?? "未知"));
    assignmentsByPosition.set(assignment.position_id, list);
  }
  return `
    <div class="positionList">
      ${state.data.positions.filter((p) => p.is_government).map((p) => {
        const holders = assignmentsByPosition.get(p.id);
        return `<div class="positionRow ${holders?.length ? "" : "vacant"}"><strong>${escapeHtml(p.name)}</strong><span>${holders?.length ? holders.join("、") : "无"}</span></div>`;
      }).join("")}
    </div>
  `;
}

function entityOptions() {
  return [
    ...state.data.characters.map((c) => [`character:${c.id}`, c.name]),
    ...state.data.retainers.map((r) => [`retainer:${r.id}`, `${r.name}（亲信）`]),
  ].map(([value, label]) => `<option value="${value}">${escapeHtml(label)}</option>`).join("");
}

function calculateLegitimacy() {
  let total = Number(state.data.state?.legitimacy_base ?? 12) + Number(state.data.state?.legitimacy_modifier ?? 0);
  for (const policy of state.data.policies) {
    total += Number(POLICY_EFFECTS[policy.option_key]?.legitimacy ?? 0);
  }
  for (const group of state.data.groups) {
    if (Number(group.mood) === 2) total += 5;
    if (Number(group.mood) === -2) total -= 5;
  }
  for (const faction of state.data.factions.filter((f) => f.faction_type === "political" && f.key !== "unaligned")) {
    if (Number(faction.government_positions) > 0) total += Number(faction.influence) / 8;
    else total -= Number(faction.influence) / 2;
  }
  return Math.round(total * 10) / 10;
}

function isGovernmentHead() {
  const ownCharacters = new Set(state.data.characters.filter((c) => c.owner_id === state.profile.id).map((c) => c.id));
  const ownRetainers = new Set(state.data.retainers.filter((r) => ownCharacters.has(r.character_id)).map((r) => r.id));
  return state.data.assignments.some((a) => {
    const key = a.positions?.key;
    return ["duke", "prime_minister"].includes(key) &&
      ((a.entity_type === "character" && ownCharacters.has(a.entity_id)) || (a.entity_type === "retainer" && ownRetainers.has(a.entity_id)));
  });
}

function assignmentMap() {
  const map = {};
  for (const assignment of state.data.assignments) {
    const key = `${assignment.entity_type}:${assignment.entity_id}`;
    map[key] ??= [];
    map[key].push(assignment.positions?.name ?? "未知职位");
  }
  return map;
}

function factionName(id) {
  return state.data.factions.find((f) => f.id === id)?.short_name ?? "未定";
}

function canDeleteCharacter(character) {
  return state.profile.role === "dm" || character.owner_id === state.profile.id;
}

function factionKey(id) {
  return state.data.factions.find((f) => f.id === id)?.key ?? "";
}

function phaseLabel(key) {
  return PHASES.find(([phaseKey]) => phaseKey === key)?.[1] ?? key;
}

function moodLabel(value) {
  return ({ "-2": "愤怒", "-1": "抵触", 0: "冷漠", 1: "温和", 2: "满意" })[Number(value)] ?? "冷漠";
}

function statusLabel(status) {
  return { draft: "草稿", submitted: "已提交", needs_approval: "待批准", approved: "已批准", processed: "已处理", rejected: "已驳回" }[status] ?? status;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll("`", "&#096;");
}
