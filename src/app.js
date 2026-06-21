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

const TRAIT_EFFECTS = {
  约尔贵族: { prestige: 3, note: "威望+3" },
  卡兰克贵族: { prestige: 3, note: "威望+3" },
  精通双语: { note: "与其他族裔互动时免除威望/谈判/演讲惩罚骰，可伪造族裔身份" },
  资本家: { prestige: 3, wealthRange: [40, 90], note: "威望+3；财富检定成功等级+1；财富40-90" },
  神职人员: { prestige: 2, note: "威望+2；与本信仰教会互动的威望/谈判检定奖励骰" },
  退役军官: { prestige: 1, note: "威望+1；可用黑料+1换取军官联系效果" },
  博士学位: { prestige: 1, note: "威望+1；与知识分子互动的威望/谈判检定奖励骰" },
  苦行僧: { prestige: 5, wealthRange: [10, 20], scandalDelta: -1, note: "威望+5；财富10-20；黑料数-1" },
  蹲监狱: { note: "只能进行私人行动，直到离开监狱" },
  年轻气盛: { actionBonus: 1, note: "所有类型行动可用数+1" },
  老逼登: { prestige: 10, scandalDelta: 1, note: "威望+10；黑料数+1" },
};

const COUNTRY_INTEL = {
  karank: {
    name: "卡兰克",
    flag: "./卡兰克.png",
    government: "共和国，总统执政",
    summary: "大陆西侧强权，卢里孔圣会派与卡兰克裔社群天然受其牵动。它公开主张地区稳定，私下关注蓝隼党和亲卡兰克舆论。",
    pressure: "若卢里孔政局失控，卡兰克会以保护本国侨民、教会和边境安全为由施压。",
  },
  royer: {
    name: "罗伊尔",
    flag: "./罗伊尔.png",
    government: "帝国，皇帝统治",
    summary: "大陆中部强权，约尔民族主义者的天然靠山。它不愿看到卡兰克重新控制卢里孔，也不愿公国成为众治主义样板。",
    pressure: "若卡兰克影响力过强或约尔派遭到镇压，罗伊尔会迅速提高军事与外交压力。",
  },
  deno: {
    name: "德诺",
    flag: "./德诺.png",
    government: "议会君主制，海外情报局活跃",
    summary: "隔海强权，擅长调停和情报渗透。德诺不一定亲自下场，但乐于让大陆强国彼此牵制。",
    pressure: "德诺更偏向暗中收集情报、提供避难渠道，必要时把卢里孔问题推上国际会议桌。",
  },
  lurik: {
    name: "卢里孔",
    flag: "./卢里孔.png",
    government: "二元君主立宪制，摄政内阁临时执政",
    summary: "卡兰克与罗伊尔之间的缓冲公国。公爵遇刺后，议会解散、政府合法性低迷，各派都在争夺一月大选前的主动权。",
    pressure: "卢里孔没有强权余裕；合法性、群体情绪和两大国耐心会共同决定它还能不能维持和平。",
  },
};

const PEOPLE = [
  {
    group: "中央人物",
    name: "汉娜·派·提克多德",
    role: "卢里孔公爵",
    portrait: "汉娜·派·提克多德.png",
    lines: [
      "父亲遇刺后继承公爵位，年纪轻，宫廷长辈围在她身边。",
      "她以宪法紧急权力维持摄政内阁，对众治党旧政府保持强烈戒心。",
      "她的性别与继承权成为全国争论焦点。",
    ],
  },
  {
    group: "党派人物",
    name: "马蒂亚斯·凡·德尔梅尔",
    role: "卢里孔众治党 · 前政府首相",
    portrait: "马蒂亚斯·凡·德尔梅尔.png",
    lines: ["前政府首相，众治党温和派领袖，开局被摄政内阁关押。", "他相信议会、多数、工会与福利政策能够稳住卢里孔。", "他在监狱里仍能通过律师、家属与工会干部影响外部局势。"],
  },
  {
    group: "党派人物",
    name: "伊莲娜·德·沃尔夫",
    role: "卢里孔众治党 · 青年议员",
    portrait: "伊莲娜·德·沃尔夫.png",
    lines: ["众治党青年议员，出身产业工人家庭，擅长群众演说。", "她主张八小时工作制、媒体自由与女性平权。", "她把公爵继位后的紧急状态视为工人运动重组的机会。"],
  },
  {
    group: "党派人物",
    name: "克洛蒂尔德·德·拉谢尔",
    role: "卢里孔蓝隼党 · 激进派领袖",
    portrait: "克洛蒂尔德·德·拉谢尔.png",
    lines: ["蓝隼党激进派领袖，卡兰克裔贵族家庭出身。", "她主张国立圣会宗、卡兰克优先政策与强力媒体管制。", "她认为卢里孔危机是文明边境遭到约尔势力侵蚀。"],
  },
  {
    group: "党派人物",
    name: "奥古斯特·德·莫朗",
    role: "卢里孔蓝隼党 · 财政金主",
    portrait: "奥古斯特·德·莫朗.png",
    lines: ["蓝隼党财政金主，掌握银行、航运与进口贸易网络。", "他希望摄政内阁压制众治党，同时恢复资本家的政策优势。", "他同卡兰克共和国商界关系密切，经常被政敌称为外国金钱的代理人。"],
  },
  {
    group: "党派人物",
    name: "赫尔曼·冯·埃尔茨",
    role: "约尔统一运动 · 主席",
    portrait: "赫尔曼·冯·埃尔茨.png",
    lines: ["约统运主席，瓦勒派神学院出身，演说风格尖锐。", "他主张约尔优先政策、国立瓦勒宗与对罗伊尔帝国的战略靠拢。", "他把卢里孔例外论称为软弱贵族的缓兵术。"],
  },
  {
    group: "党派人物",
    name: "弗里德里希·范·哈尔",
    role: "约尔统一运动 · 组织部长",
    portrait: "弗里德里希·范·哈尔.png",
    lines: ["约统运组织部长，退役军官家庭出身，熟悉准军事社团。", "他相信街头力量、退伍军人协会与边境走私网络能改变选举结果。", "他经常向支持者暗示，议会道路需要配合更硬的手段。"],
  },
  {
    group: "党派人物",
    name: "维克托·德·格伦瓦尔",
    role: "公爵忠诚派 · 宫廷顾问",
    portrait: "维克托·德·格伦瓦尔.png",
    lines: ["宫廷顾问，前任公爵时代的老臣，摄政内阁核心人物。", "他认为提克多德家族是卢里孔能够维持独立地位的关键。", "他擅长利用礼仪、法律文本与贵族关系压住临时政府内部裂缝。"],
  },
  {
    group: "党派人物",
    name: "塞勒斯·派·奥列克",
    role: "公爵忠诚派 · 王室法律顾问",
    portrait: "塞勒斯·派·奥列克.png",
    lines: ["王室法律顾问，年轻的新锐，参与起草解散议会后的紧急命令。", "他主张以二元君主立宪制为底线，逐步重建公爵权威。", "他对蓝隼党与约统运都保持警惕，担心任何一方把公国献给境外强权。"],
  },
  {
    group: "社会群体代表",
    name: "塞莱斯蒂娜·勒布伦",
    role: "大卡兰克派 · 报纸主编",
    portrait: "塞莱斯蒂娜·勒布伦.png",
    portraitClass: "portraitNudgeDown",
    lines: ["卡兰克语报纸主编，圣会派家庭出身。", "她认为卢里孔的未来应当回到卡兰克文化圈。", "她很会制造街头情绪，尤其擅长把女性公爵与卡兰克女总统放进同一套政治叙事里。"],
  },
  {
    group: "社会群体代表",
    name: "奥托·冯·赖希贝格",
    role: "大约尔派 · 瓦勒派牧师",
    portrait: "奥托·冯·赖希贝格.png",
    portraitClass: "portraitNudgeDown",
    lines: ["瓦勒派牧师，长期在边境村镇布道。", "他把约尔语、瓦勒宗与罗伊尔帝国视为同一条历史道路。", "他对公爵家族抱有复杂情绪，尊重其血统，也怀疑其卢里孔例外论。"],
  },
  {
    group: "社会群体代表",
    name: "阿黛尔·范·艾克",
    role: "进步知识分子 · 大学讲师",
    portrait: "阿黛尔·范·艾克.png",
    lines: ["大学讲师，研究宪政史、劳动法与女性教育。", "她支持世俗化、媒体自由与形式平权。", "她对众治党有明显同情，也愿意批评众治党内部的腐败传闻。"],
  },
  {
    group: "社会群体代表",
    name: "西奥多·范·霍夫",
    role: "保守知识分子 · 王立学院院长",
    portrait: "西奥多·范·霍夫.png",
    lines: ["王立学院院长，圣会派学者，重视秩序与传统教育。", "他厌恶众治党的国有化语言，也厌恶约统运的街头粗暴风格。", "他希望公爵恢复稳定，同时保留公务员系统的独立性。"],
  },
  {
    group: "社会群体代表",
    name: "扬·德·斯密特",
    role: "产业工人 · 工会基层代表",
    portrait: "扬·德·斯密特.png",
    lines: ["首都机械厂工头，工会基层代表。", "他关心工资、工时、食品价格与被捕工友的命运。", "他支持众治党，同时对党内律师和议员的妥协感到焦躁。"],
  },
  {
    group: "社会群体代表",
    name: "埃米尔·德·克莱尔",
    role: "资本家 · 纺织业巨头",
    portrait: "埃米尔·德·克莱尔.png",
    lines: ["纺织业巨头，蓝隼党与约统运都想争取他的资金。", "他关心税制、关税、铁路订单与工人运动的扩张。", "他愿意同摄政内阁合作，前提是政府给出可靠的市场承诺。"],
  },
  {
    group: "社会群体代表",
    name: "马库斯·范·林登",
    role: "士兵 · 陆军上校",
    portrait: "马库斯·范·林登.png",
    lines: ["陆军上校，驻扎首都外营区，深受基层军官信任。", "他关心军饷、军队荣誉与街头秩序。", "他对政客普遍缺乏耐心，政变传闻越多，他的话语权越高。"],
  },
  {
    group: "社会群体代表",
    name: "彼得·范·布鲁克",
    role: "农民 · 北部乡村自治会长",
    portrait: "彼得·范·布鲁克.png",
    lines: ["北部乡村自治会长，代表小农、佃农与乡村教区。", "他关心粮价、税负、征兵与城市政府对乡村的轻视。", "他对所有大党都保持距离，谁能保护土地和教区，他便愿意听谁讲话。"],
  },
  {
    group: "社会群体代表",
    name: "阿尔方斯·德·梅尔滕",
    role: "地主贵族 · 乡绅家族家主",
    portrait: "阿尔方斯·德·梅尔滕.png",
    lines: ["古老乡绅家族家主，拥有大片林地与租佃农庄。", "他支持公爵权威与财产权神圣，反感共和国口号与工人集会。", "他同宫廷关系紧密，私下也在评估军队介入政局的收益。"],
  },
  {
    group: "外国首领",
    name: "蕾妮·德·瓦卢瓦",
    role: "卡兰克共和国总统",
    portrait: "蕾妮·德·瓦卢瓦.png",
    lines: ["卡兰克共和国总统，公开强调民族自决与圣会派共同体。", "她以共和国领袖形象压迫卢里孔保守派话语空间。", "她的外交班子把蓝隼党视为打开卢里孔大门的关键工具。"],
  },
  {
    group: "外国首领",
    name: "威廉·冯·阿德勒",
    role: "罗伊尔帝国皇帝",
    portrait: "威廉·冯·阿德勒.png",
    lines: ["罗伊尔帝国皇帝，宣称保护全体约尔人和瓦勒派信徒。", "他关注卢里孔港口、铁路与边境军事缓冲价值。", "他对约统运保持耐心，也随时准备利用危机向西推进。"],
  },
  {
    group: "外国首领",
    name: "亚瑟·格雷维尔",
    role: "德诺王国首相",
    portrait: "亚瑟·格雷维尔.png",
    lines: ["德诺首相，海峡彼岸的平衡政策执行者。", "他希望卢里孔维持缓冲国地位，避免卡兰克与罗伊尔提前摊牌。", "他的海外情报局在首都拥有少量线人，经常把避难承诺当成政治筹码。"],
  },
];

const FOREIGN_LEADER_GROUP = "外国首领";

const PERSON_FACTION_KEYS = {
  "汉娜·派·提克多德": "ducal_loyalists",
  "马蒂亚斯·凡·德尔梅尔": "social_democrats",
  "伊莲娜·德·沃尔夫": "social_democrats",
  "克洛蒂尔德·德·拉谢尔": "blue_falcon",
  "奥古斯特·德·莫朗": "blue_falcon",
  "赫尔曼·冯·埃尔茨": "yor_unity",
  "弗里德里希·范·哈尔": "yor_unity",
  "维克托·德·格伦瓦尔": "ducal_loyalists",
  "塞勒斯·派·奥列克": "ducal_loyalists",
};

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

const POLICY_LEGITIMACY = {
  "regime.ceremonial_monarchy": 5,
  "regime.parliamentary_republic": 5,
  "civil_service.independent": 5,
  "economy.laissez_faire": 5,
  "economy.heavy_intervention": -5,
  "assembly.banned": 5,
  "assembly.registered": 3,
  "media.state_media": 5,
  "media.limited_censorship": 3,
  "religion.secularization": 5,
  "religion.state_church": 10,
  "religion.state_valler": 10,
  "welfare.basic": 5,
  "welfare.strong": 10,
  "nationality.karank_first": 5,
  "nationality.yor_first": 5,
};

const BUDGET_LEVELS = ["耗尽", "缺乏", "平衡", "盈余", "充沛"];

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
let presenceClientId = "";
let presenceUpdateInFlight = false;
let editTrackingBound = false;
let unsavedEdit = false;
let actionSaveInFlight = false;
let autoSubmittingDrafts = false;
let loadAllGeneration = 0;
let openDetailKeys = new Set();
const CHARACTER_DRAFT_STORAGE_KEY = "peace_death_character_draft_v1";
const RETAINER_DRAFT_STORAGE_KEY = "peace_death_retainer_draft_v1";
let characterDraftCache = readCharacterDraftCache();
let retainerDraftCache = readRetainerDraftCache();
let state = {
  session: null,
  profile: null,
  tab: "overview",
  selectedCountry: "karank",
  error: "",
  data: emptyData(),
};

document.addEventListener("visibilitychange", () => {
  if (!state.session) return;
  if (document.visibilityState === "visible") {
    touchPresence(true);
  } else {
    touchPresence(false);
  }
});

window.addEventListener("pagehide", () => {
  if (state.session) touchPresence(false);
});

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
      if (session) {
        startAutoRefresh();
        loadAll();
      }
      else {
        stopAutoRefresh();
        state.profile = null;
        render();
      }
    });
    if (state.session) {
      startAutoRefresh();
      await loadAll();
    }
    render();
  } catch (error) {
    state.error = error.message ?? String(error);
    renderSetup();
  }
}

function startAutoRefresh() {
  // No periodic polling: Supabase presence calls can interrupt long DM edits.
}

function stopAutoRefresh() {
  presenceUpdateInFlight = false;
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
    presence: [],
    audits: [],
  };
}

async function loadAll({ background = false } = {}) {
  if (background && shouldDeferAutoRefresh()) return;
  const generation = ++loadAllGeneration;
  state.error = "";
  const profile = await supabase.from("profiles").select("*").eq("id", state.session.user.id).maybeSingle();
  if (profile.error) {
    if (shouldDiscardLoadResult(generation, background)) return;
    state.error = profile.error.message;
    render();
    return;
  }
  state.profile = profile.data;
  touchPresence(true);
  const actionColumns = "id, owner_id, turn_number, action_kind, actor_type, actor_id, title, category, target, description, resources, visibility, non_public_reason, requires_approval, status, approved_by, result_public, processed_at, created_at, updated_at";
  const allowedPrivateActionResults = supabase.rpc("visible_action_private_results");

  const queries = await Promise.all([
    supabase.from("game_state").select("*").eq("id", true).maybeSingle(),
    supabase.from("characters_public").select("*").order("created_at"),
    supabase.from("character_private").select("*"),
    supabase.from("retainers").select("*").order("created_at"),
    supabase.from("retainer_private").select("*"),
    supabase.from("position_assignments").select("*, positions(*)").order("created_at"),
    supabase.from("actions").select(actionColumns).order("created_at", { ascending: false }),
    supabase.from("factions").select("*").order("sort_order"),
    supabase.from("social_groups").select("*").order("sort_order"),
    supabase.from("current_policies").select("*").order("policy_key"),
    supabase.from("foreign_powers").select("*").order("name"),
    supabase.from("parliament_votes").select("*, factions(short_name, color)").order("created_at", { ascending: false }),
    supabase.from("positions").select("*").order("sort_order"),
    supabase.from("profiles").select("*").order("created_at"),
    allowedPrivateActionResults,
  ]);
  const error = queries.slice(0, -1).find((item) => item.error)?.error;
  if (error) {
    if (shouldDiscardLoadResult(generation, background)) return;
    state.error = error.message;
    render();
    return;
  }
  const [gameState, characters, privateStats, retainers, retainerPrivate, assignments, actions, factions, groups, policies, foreignPowers, votes, positions, profiles, privateActionResults] = queries;
  let presenceRows = [];
  let auditRows = [];
  if (canObserve()) {
    const [presence, audits] = await Promise.all([
      supabase.from("player_presence").select("*").order("last_seen_at", { ascending: false }),
      supabase.from("audit_log").select("*").order("created_at", { ascending: false }).limit(120),
    ]);
    if (presence.error || audits.error) {
      if (shouldDiscardLoadResult(generation, background)) return;
      state.error = presence.error?.message ?? audits.error?.message;
      render();
      return;
    }
    presenceRows = presence.data ?? [];
    auditRows = audits.data ?? [];
  }
  const privateResultsByAction = new Map((privateActionResults.data ?? []).map((item) => [item.action_id, item.result_private]));
  const visibleActions = (actions.data ?? [])
    .filter(actionVisibleToCurrentUser)
    .map((action) => ({ ...action, result_private: privateResultsByAction.get(action.id) ?? "" }));
  if (shouldDiscardLoadResult(generation, background)) return;
  state.data = {
    state: gameState.data,
    characters: characters.data ?? [],
    privateStats: privateStats.data ?? [],
    retainers: retainers.data ?? [],
    retainerPrivate: retainerPrivate.data ?? [],
    assignments: assignments.data ?? [],
    actions: visibleActions,
    factions: factions.data ?? [],
    groups: groups.data ?? [],
    policies: policies.data ?? [],
    foreignPowers: foreignPowers.data ?? [],
    votes: votes.data ?? [],
    positions: positions.data ?? [],
    profiles: profiles.data ?? [],
    presence: presenceRows,
    audits: auditRows,
  };
  unsavedEdit = false;
  if (await autoSubmitEligibleDrafts()) return;
  render();
}

function shouldDiscardLoadResult(generation, background) {
  return generation !== loadAllGeneration || (background && shouldDeferAutoRefresh());
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
  rememberCharacterDraft();
  rememberRetainerDrafts();
  rememberOpenDetails();
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
  const observer = isObserver();
  if (observer && ["character", "people"].includes(state.tab)) state.tab = "actions";
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
      ${observer ? "" : tabButton("character", "角色")}
      ${observer ? "" : tabButton("people", "人物")}
      ${tabButton("actions", "行动")}
      ${tabButton("government", "政府")}
      ${tabButton("parliament", "国会")}
      ${isDm ? tabButton("dm", "DM") : ""}
    </nav>
    ${renderTab()}
  `);
  restoreOpenDetails();
  restoreRetainerDrafts();
  bindEditTracking();
  bindCommon();
  bindTab();
}

function renderLogin() {
  root.innerHTML = shell(`
    <form class="loginPanel" id="login-form">
      <p class="eyebrow">Peace Death</p>
      <h1>登录角色</h1>
      <label>邮箱<input name="email" placeholder="player1@peace.local" autocomplete="username"></label>
      <label>密码<input name="password" type="password" autocomplete="current-password"></label>
      ${state.error ? `<div class="errorBox">${escapeHtml(state.error)}</div>` : ""}
      <button class="primaryButton">进入</button>
    </form>
  `);
  document.getElementById("login-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: form.get("email"),
      password: form.get("password"),
    });
    state.error = error?.message ?? "";
    if (!error) {
      state.session = data.session;
      await touchPresence(true);
      await recordActivity("login", "auth");
    }
    render();
  });
}

async function touchPresence(online) {
  if (!supabase || !state.session) return;
  if (presenceUpdateInFlight) return;
  presenceUpdateInFlight = true;
  try {
    await supabase.rpc("touch_presence", {
      presence_online: Boolean(online),
      presence_tab: tabLabel(state.tab),
      presence_user_agent: window.navigator.userAgent,
      presence_client_id: getPresenceClientId(),
    });
  } catch (error) {
    console.warn("presence update failed", error);
  } finally {
    presenceUpdateInFlight = false;
  }
}

function getPresenceClientId() {
  if (!isObserver()) return "primary";
  if (presenceClientId) return presenceClientId;
  const key = "peace_death_observer_client_id";
  presenceClientId = window.localStorage.getItem(key) || "";
  if (!presenceClientId) {
    presenceClientId = window.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    window.localStorage.setItem(key, presenceClientId);
  }
  return presenceClientId;
}

async function recordActivity(action, tableName = "app", rowId = null, details = {}) {
  if (!supabase || !state.session) return;
  try {
    await supabase.rpc("log_activity", {
      activity_action: action,
      activity_table: tableName,
      activity_row_id: rowId,
      activity_details: details,
    });
  } catch (error) {
    console.warn("activity log failed", error);
  }
}

function shell(content) {
  return `<main class="appShell">${content}</main>`;
}

function tabButton(key, label) {
  return `<button class="tab ${state.tab === key ? "active" : ""}" data-tab="${key}">${label}</button>`;
}

function tabLabel(key) {
  return {
    overview: "总览",
    character: "角色",
    people: "人物",
    actions: "行动",
    government: "政府",
    parliament: "国会",
    dm: "DM",
  }[key] ?? key;
}

function isDm() {
  return state.profile?.role === "dm";
}

function isPlayer() {
  return state.profile?.role === "player";
}

function isObserver() {
  return state.profile?.role === "observer";
}

function canObserve() {
  return ["dm", "observer"].includes(state.profile?.role);
}

function actionVisibleToCurrentUser(action) {
  if (isDm() || action.owner_id === state.profile?.id) return true;
  if (action.action_kind === "private") return false;
  if (isObserver()) return action.status !== "draft";
  return true;
}

function phaseStrip() {
  const current = state.data.state?.current_phase ?? "turn_start";
  return `
    <section class="phaseStrip">
      <div><span>第 ${state.data.state?.current_turn ?? 1} 回合</span><strong>${phaseLabel(current)}</strong></div>
      ${foreignPatienceStrip()}
      <div class="phaseSteps">
        ${PHASES.map(([key, label]) => `<span class="phaseStep ${key === current ? "active" : ""}">${label}</span>`).join("")}
      </div>
    </section>
  `;
}

function foreignPatienceStrip() {
  const karank = countryPatience("karank") ?? 0;
  const royer = countryPatience("royer") ?? 0;
  return `
    <div class="patienceStrip">
      ${patienceMeter("卡兰克", karank)}
      ${patienceMeter("罗伊尔", royer)}
    </div>
  `;
}

function patienceMeter(name, value) {
  return `
    <div class="patienceMeter">
      <span>${escapeHtml(name)}</span>
      <strong>耐心 ${value} / 100</strong>
      <i><em style="width:${Math.max(0, Math.min(100, value))}%"></em></i>
    </div>
  `;
}

function renderTab() {
  if (state.tab === "overview") return overview();
  if (state.tab === "character") return characterPanel();
  if (state.tab === "people") return peoplePanel();
  if (state.tab === "actions") return actionPanel();
  if (state.tab === "government") return governmentPanel();
  if (state.tab === "parliament") return parliamentPanel();
  if (state.tab === "dm") return dmPanel();
  return "";
}

function overview() {
  const legitimacy = calculateLegitimacyBreakdown();
  return `
    <div class="grid two">
      <section class="panel">
        <div class="panelHeader">
          <h2>国家状态</h2>
          <span class="scorePill ${legitimacy.total < 25 ? "danger" : legitimacy.total >= 75 ? "good" : ""}">合法性 ${legitimacy.total}%</span>
        </div>
        <div class="statGrid">
          ${metric("经济形势", state.data.state?.economy_status ?? "一切如常")}
          ${metric("国家预算", state.data.state?.budget_status ?? "平衡")}
          ${metric("DM修正", `${state.data.state?.legitimacy_modifier ?? 0}%`)}
          ${metric("最大回合", state.data.state?.max_turns ?? 5)}
        </div>
        <div class="legitimacyLedger">
          ${legitimacy.entries.filter((entry) => !entry.hidden).map((entry) => `
            <div class="ledgerRow ${entry.value < 0 ? "negative" : entry.value > 0 ? "positive" : ""}">
              <span>${escapeHtml(entry.label)}</span>
              <strong>${formatSigned(entry.value)}%</strong>
            </div>
          `).join("")}
        </div>
        ${legitimacyThresholdPanel(legitimacy.total)}
        <div class="policyList">
          ${state.data.policies.map(policyRow).join("")}
        </div>
      </section>
      <section class="panel">
        <h2>派系与社会</h2>
        <div class="factionList">
          ${state.data.factions.filter((f) => f.faction_type === "political").map((f) => `
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
        ${supportMatrixPanel()}
        ${prestigeReferencePanel()}
        <h3>国家情报</h3>
        ${countryIntelGrid()}
      </section>
    </div>
  `;
}

function supportMatrixPanel() {
  const socialGroups = state.data.groups.map((group) => group.name);
  const absorbed = new Set();
  const factions = sortedPoliticalFactions().filter((faction) => faction.key !== "unaligned");
  for (const faction of factions) {
    for (const supporter of faction.supporters ?? []) absorbed.add(supporter);
  }
  const unabsorbed = socialGroups.filter((name) => !absorbed.has(name));
  return `
    <div class="supportMatrix">
      <h3>派系吸纳群体</h3>
      <div class="supportRows">
        ${factions.map((faction) => `
          <div class="supportRow">
            <strong><i style="background:${escapeAttr(faction.color)}"></i>${escapeHtml(faction.short_name)}</strong>
            <span>${supporterTags(faction.supporters)}</span>
          </div>
        `).join("")}
        <div class="supportRow unabsorbed">
          <strong><i></i>未介入</strong>
          <span>${supporterTags(unabsorbed)}</span>
        </div>
      </div>
    </div>
  `;
}

function supporterTags(items = []) {
  return items.length
    ? items.map((item) => `<b>${escapeHtml(item)}</b>`).join("")
    : `<em>无</em>`;
}

function legitimacyThresholdPanel(total) {
  const freeParticipation = currentPolicyOption("civil_service") === "free_participation";
  const coupThreshold = freeParticipation ? 50 : 25;
  return `
    <div class="thresholdReference">
      <h3>合法性门槛速查</h3>
      <div class="ruleList">
        ${legitimacyRule("低于90%", "可尝试把尚未介入的政治或社会群体纳入派系；该群体需抵触或愤怒，并由派系领袖通过威望检定。", total < 90)}
        ${legitimacyRule("低于75%", "所有境外势力耐心每回合 -7。", total < 75)}
        ${legitimacyRule("低于50%", "可尝试把已经介入的政治或社会群体挖入己方派系；该群体需抵触或愤怒，并由双方派系领袖进行威望对抗。", total < 50)}
        ${legitimacyRule(`低于${coupThreshold}%`, `${freeParticipation ? "因“允许自由参政”，政变前置提高到合法性低于50%。" : ""}士兵或地主贵族不满、抵触或愤怒，且发起者是战争部长或拥有军官联系时，军队可以发动政变。`, total < coupThreshold)}
        ${legitimacyRule("等于0%", "政府立刻垮台；卡兰克与罗伊尔军事干预，进入世界大战前奏。", total <= 0, "danger")}
        ${legitimacyRule("大选结算", "第五回合和平结束后，影响力最高派系赢得大选；若新政府合法性高于75%，胜选派系完全胜利，否则必须组成联合政府。", total > 75, "good")}
      </div>
    </div>
  `;
}

function legitimacyRule(title, text, active, tone = "") {
  const classes = ["ruleRow", active ? "active" : "", tone].filter(Boolean).join(" ");
  return `<div class="${classes}"><strong>${escapeHtml(title)}</strong><span>${escapeHtml(text)}</span></div>`;
}

function prestigeReferencePanel() {
  const duke = positionHolder("duke");
  const primeMinister = positionHolder("prime_minister");
  const justiceMinister = positionHolder("justice_minister");
  const heads = [duke, primeMinister].filter(Boolean);
  const justiceThreshold = justiceMinister ? entityPrestige(justiceMinister) : null;
  return `
    <div class="prestigeReference">
      <h3>威望门槛速查</h3>
      <div class="ruleList">
        ${prestigeRule("对抗检定", "成功等级相同时，威望较高者获胜；威望也相同则受对抗方获胜。")}
        ${prestigeRule("50基准", "公爵、首相等关键职位的威望围绕50计算合法性；低于50会拖累政府合法性。")}
        ${prestigeRule("部长强推改革", heads.length ? "若未获公爵或首相同意，部长威望必须高于公爵/首相，并赢得与公爵/首相的威望对抗，才能推行改革。" : "当前缺少公爵/首相门槛；默认需要公爵或首相同意。")}
        ${prestigeRule("搜查/逮捕争议", justiceThreshold === null ? "司法部长空缺时由DM裁量。" : `没有司法部允许时，需要赢得与司法部长威望 ${justiceThreshold} 的对抗。`)}
        ${prestigeRule("军事政变", "满足政变前置后，若发起者与公爵或首相不同阵营，需要与他们进行威望对抗。")}
      </div>
    </div>
  `;
}

function prestigeRule(title, text) {
  return `<div class="ruleRow"><strong>${escapeHtml(title)}</strong><span>${escapeHtml(text)}</span></div>`;
}

function countryIntelGrid() {
  const selected = COUNTRY_INTEL[state.selectedCountry] ?? COUNTRY_INTEL.karank;
  return `
    <div class="countryGrid">
      ${Object.entries(COUNTRY_INTEL).map(([key, country]) => {
        return `
          <button class="countryCard ${state.selectedCountry === key ? "active" : ""}" data-country="${key}" type="button">
            <img src="${country.flag}" alt="${escapeAttr(country.name)}旗帜">
            <strong>${escapeHtml(country.name)}</strong>
            <span>情报</span>
          </button>
        `;
      }).join("")}
    </div>
    <article class="intelPanel">
      <img src="${selected.flag}" alt="${escapeAttr(selected.name)}旗帜">
      <div>
        <h3>${escapeHtml(selected.name)}</h3>
        <strong>${escapeHtml(selected.government)}</strong>
        <p>${escapeHtml(selected.summary)}</p>
        <p>${escapeHtml(selected.pressure)}</p>
      </div>
    </article>
  `;
}

function countryPatience(key) {
  const aliases = { karank: "karank", royer: "royer" };
  const power = state.data.foreignPowers.find((p) => p.key === aliases[key]);
  return power ? Number(power.patience) : null;
}

function peoplePanel() {
  const groups = Array.from(new Set(PEOPLE.map((person) => person.group)));
  return `
    <section class="panel wide peoplePanel">
      <div class="panelHeader">
        <div>
          <h2>人物</h2>
          <p>核心角色、党派人物、社会群体代表与外国首领。</p>
        </div>
        <span class="scorePill">${PEOPLE.length} 人</span>
      </div>
      ${groups.map((group) => `
        <section class="peopleSection">
          <h3>${escapeHtml(group)}</h3>
          <div class="peopleGrid">
            ${PEOPLE.filter((person) => person.group === group).map(personCard).join("")}
          </div>
        </section>
      `).join("")}
    </section>
  `;
}

function personCard(person) {
  const positions = assignmentMap()[`person:${personEntityId(person.name)}`] ?? [];
  const portraitClass = person.portraitClass ? ` ${person.portraitClass}` : "";
  return `
    <article class="personCard${portraitClass}">
      <img src="${portraitPath(person.portrait)}" alt="${escapeAttr(person.name)}头像" loading="lazy">
      <div>
        <span>${escapeHtml(person.role)}</span>
        <h4>${escapeHtml(person.name)}</h4>
        ${positions.length ? `<div class="personPositions">${positions.map((position) => `<b>${escapeHtml(position)}</b>`).join("")}</div>` : ""}
        ${person.lines.map((line) => `<p>${escapeHtml(line)}</p>`).join("")}
      </div>
    </article>
  `;
}

function portraitPath(fileName) {
  return `./assets/portraits/${encodeURI(fileName)}`;
}

function assignablePeople() {
  return PEOPLE.filter((person) => person.group !== FOREIGN_LEADER_GROUP);
}

function personEntityId(name) {
  const text = `peace-death-person:${name}`;
  const bytes = Array(16).fill(0);
  for (let i = 0; i < text.length; i += 1) {
    const code = text.charCodeAt(i);
    bytes[i % 16] = (bytes[i % 16] * 31 + code + i) & 255;
    bytes[(i * 7) % 16] = (bytes[(i * 7) % 16] ^ (code >> 8) ^ code) & 255;
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.map((byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function personByEntityId(id) {
  return assignablePeople().find((person) => personEntityId(person.name) === id) ?? null;
}

function policyRow(policy) {
  const isDm = state.profile.role === "dm";
  const [label, options] = POLICY_CATALOG[policy.policy_key] ?? [policy.policy_key, {}];
  return `
    <details class="policyRow" data-detail-key="policy:${escapeAttr(policy.policy_key)}">
      <summary>
        <span>${escapeHtml(label)}</span>
        ${isDm ? `
          <div class="policyEditor">
            <select data-policy-draft="${escapeAttr(policy.policy_key)}" data-current="${escapeAttr(policy.option_key)}">
            ${Object.entries(options).map(([key, name]) => `<option value="${key}" ${key === policy.option_key ? "selected" : ""}>${escapeHtml(name)}</option>`).join("")}
            </select>
            <button class="ghostButton" type="button" data-policy-save="${escapeAttr(policy.policy_key)}">确认更改</button>
          </div>
        ` : `<strong>${escapeHtml(options[policy.option_key] ?? policy.option_key)}</strong>`}
      </summary>
      <div class="policyOptions">
        ${Object.entries(options).map(([key, name]) => `
          <div class="policyOption ${key === policy.option_key ? "current" : ""}">
            <strong>${escapeHtml(name)}</strong>
            <span>${policyEffectText(policy.policy_key, key)}</span>
          </div>
        `).join("")}
      </div>
    </details>
  `;
}

function policyEffectText(policyKey, optionKey) {
  const details = {
    "regime.dual_monarchy": [
      "公爵威望每比50多5，政府合法性+1%；反之-1%",
      "首相威望每比50多5，政府合法性+1%；反之-1%",
    ],
    "regime.ceremonial_monarchy": [
      "合法性+5%",
      "首相威望每比50多5，政府合法性+1%；反之-1%",
    ],
    "regime.parliamentary_republic": ["合法性+5%", "惹恼：地主贵族"],
    "regime.presidential_republic": [
      "首相威望每比50多1，政府合法性+1%；反之-1%",
      "惹恼：地主贵族",
    ],
    "regime.military_government": [
      "战争部长威望每比50多1，政府合法性+1%；反之-1%",
      "取悦：士兵",
    ],
    "civil_service.independent": ["合法性+5%"],
    "civil_service.bureaucrats_in_politics": [
      "在政府中的政治派系提供的合法性翻倍",
      "惹恼：保守知识分子",
    ],
    "civil_service.free_participation": [
      "在政府中的政治派系提供的合法性翻倍",
      "不在政府中的政治派系降低的合法性翻倍",
      "军队发动政变前置要求改为合法性＜50%",
      "惹恼：保守知识分子",
      "取悦：士兵、地主贵族、大约尔派、大卡兰克派",
    ],
    "tax.single_tax": ["无直接数值效果"],
    "tax.regressive": [
      "降低一级预算",
      "有10%的概率使经济形势上行",
      "取悦：资本家、地主贵族",
      "惹恼：产业工人、农民、士兵",
    ],
    "tax.progressive": [
      "提升一级预算",
      "有10%的概率使经济形势下行",
      "取悦：产业工人",
      "惹恼：资本家、地主贵族",
    ],
    "economy.laissez_faire": [
      "合法性+5%",
      "取悦：资本家、地主贵族",
      "惹恼：农民",
    ],
    "economy.intervention": ["无直接数值效果"],
    "economy.heavy_intervention": ["合法性-5%", "惹恼：资本家、地主贵族"],
    "assembly.banned": [
      "合法性+5%",
      "惹恼：进步知识分子",
      "惹恼所有在政府中没有职位的政治派系的支持者",
    ],
    "assembly.registered": ["合法性+3%"],
    "assembly.free": ["取悦：进步知识分子"],
    "media.state_media": [
      "合法性+5%",
      "惹恼：进步知识分子",
      "惹恼所有在政府中没有职位的政治派系的支持者",
    ],
    "media.limited_censorship": ["合法性+3%"],
    "media.free_media": [
      "取悦：进步知识分子",
      "所有玩家每回合进行一次幸运检定，看你有没有被挖出黑料",
    ],
    "religion.secularization": [
      "合法性+5%",
      "取悦：进步知识分子",
      "惹恼：保守知识分子",
    ],
    "religion.state_church": [
      "合法性+10%",
      "取悦：大卡兰克派",
      "惹恼：进步知识分子、大约尔派",
    ],
    "religion.state_valler": [
      "合法性+10%",
      "取悦：大约尔派",
      "惹恼：进步知识分子、大卡兰克派",
    ],
    "religion.pluralism": ["无直接数值效果"],
    "army_pay.docked": ["提升一级预算", "惹恼：士兵"],
    "army_pay.basic": ["无直接数值效果"],
    "army_pay.welfare": ["降低一级预算", "取悦：士兵"],
    "welfare.poor": ["提升一级预算", "惹恼：产业工人、农民、士兵"],
    "welfare.basic": ["合法性+5%"],
    "welfare.strong": [
      "合法性+10%",
      "降低一级预算",
      "取悦：产业工人、农民、士兵",
    ],
    "labor.eight_hours": [
      "有10%的概率使经济形势下行",
      "取悦：产业工人",
      "惹恼：资本家",
    ],
    "labor.ten_hours": ["无直接数值效果"],
    "labor.twelve_hours": [
      "有10%的概率使经济形势上行",
      "取悦：资本家",
      "惹恼：产业工人",
    ],
    "labor.fourteen_hours": [
      "有10%的概率使经济形势上行",
      "取悦：资本家",
      "惹恼：产业工人",
    ],
    "women.ignored": ["无直接数值效果"],
    "women.formal_equality": ["取悦：进步知识分子", "惹恼：保守知识分子"],
    "women.active_equality": ["取悦：进步知识分子", "惹恼：保守知识分子"],
    "nationality.lurik_exception": ["无直接数值效果"],
    "nationality.karank_first": [
      "合法性+5%",
      "取悦：大卡兰克派",
      "惹恼：大约尔派",
    ],
    "nationality.yor_first": [
      "合法性+5%",
      "取悦：大约尔派",
      "惹恼：大卡兰克派",
    ],
  };
  return (details[`${policyKey}.${optionKey}`] ?? ["无直接数值效果"]).join("；");
}

function characterPanel() {
  const dm = isDm();
  const characters = state.data.characters;
  const statsByCharacter = new Map(state.data.privateStats.map((s) => [s.character_id, s]));
  const assignmentNames = assignmentMap();
  const ownCharacterCount = state.data.characters.filter((c) => c.owner_id === state.profile.id && c.active !== false).length;
  const canCreate = dm || (isPlayer() && ownCharacterCount === 0);
  return `
    <section class="panel wide">
      <div class="panelHeader">
        <div>
          <h2>车卡</h2>
          <p>固定四点特质点；可以少花，少花作废。属性和骰点按场外结果手动填写。</p>
        </div>
        <span class="scorePill">亲信数 = (魅力 + 威望) / 50 向下取整</span>
      </div>
      ${canCreate ? characterCreateForm() : `<div class="notice">${canObserve() && !dm ? "OB账号只能旁观角色卡，不能创建或修改。" : "每个玩家账号只能创建一张角色卡；需要重车请先删除旧卡，或找 DM 处理。"}</div>`}
    </section>
    <div class="grid two characterList">
      ${characters.map((character) => {
        const stats = statsByCharacter.get(character.id);
        const retainers = state.data.retainers.filter((r) => r.character_id === character.id);
        const canSeeRetainers = dm || character.owner_id === state.profile.id;
        const canEditRetainers = canEditCharacterRetainers(character);
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
            <h3>公开信息</h3>
            <p class="story">${escapeHtml(character.public_background || "暂无公开背景。")}</p>
            ${tagBlock("公开特质", character.public_traits)}
            ${stats ? `<h3>私密信息</h3>${statGrid(stats)}${skillGrid(stats)}${tagBlock("秘密特质", stats.secret_traits)}${tagBlock("人生追求", [stats.pursuit].filter(Boolean))}${tagBlock("黑料", scandalLabels(stats.scandals))}` : ""}
            ${canSeeRetainers ? `
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
              ${canEditRetainers ? retainerEditor(character, retainers) : ""}
            ` : ""}
            ${dm ? dmCharacterEditor(character, stats) : ""}
          </section>
        `;
      }).join("")}
    </div>
  `;
}

function retainerEditor(character, retainers) {
  const limit = retainerLimitForCharacter(character);
  return `
    <details class="retainerEditor" data-detail-key="retainers:${escapeAttr(character.id)}">
      <summary>编辑亲信</summary>
      <div data-retainer-edit="${character.id}">
        <div class="retainerEditList">
          ${retainers.map(retainerEditRow).join("") || `<div class="notice">还没有亲信。</div>`}
        </div>
        <div class="buttonRow">
          <span class="quota">当前 ${retainers.length} / ${Number.isFinite(limit) ? limit : "?"}</span>
          <button class="primaryButton" type="button" data-save-retainers="${character.id}">保存亲信修改</button>
        </div>
        <h3>新增亲信</h3>
        <div class="retainerEditRow new">
          <label>姓名<input data-new-retainer-name="${character.id}"></label>
          <label>性别${retainerGenderSelect(`data-new-retainer-gender="${character.id}"`)}</label>
          <label>年龄<input data-new-retainer-age="${character.id}" type="number" min="1"></label>
          <label>备注<input data-new-retainer-notes="${character.id}"></label>
          <button class="ghostButton" type="button" data-add-retainer="${character.id}">新增亲信</button>
        </div>
      </div>
    </details>
  `;
}

function retainerEditRow(retainer) {
  return `
    <div class="retainerEditRow" data-retainer-row="${retainer.id}">
      <label>姓名<input data-retainer-name="${retainer.id}" value="${escapeAttr(retainer.name)}"></label>
      <label>性别${retainerGenderSelect(`data-retainer-gender="${retainer.id}"`, retainer.gender)}</label>
      <label>年龄<input data-retainer-age="${retainer.id}" type="number" min="1" value="${Number(retainer.age ?? "") || ""}"></label>
      <label>备注<input data-retainer-notes="${retainer.id}" value="${escapeAttr(retainer.notes ?? "")}"></label>
      <button class="dangerButton" type="button" data-delete-retainer="${retainer.id}" data-retainer-name="${escapeAttr(retainer.name)}">删除</button>
    </div>
  `;
}

function retainerGenderSelect(attributes, selected = "男") {
  const options = ["男", "女", "其他"];
  const values = options.includes(selected) ? options : [selected, ...options];
  return `<select ${attributes}>${values.map((value) => `<option ${value === selected ? "selected" : ""}>${escapeHtml(value)}</option>`).join("")}</select>`;
}

function characterCreateForm() {
  const selectedOwnerId = defaultCharacterOwnerId();
  const defaultFactionId = defaultCharacterFactionId(selectedOwnerId);
  const factionOptions = characterCreateFactionOptions(defaultFactionId);
  const playerOptions = state.profile.role === "dm"
    ? state.data.profiles?.map((p) => {
        const blocked = !canOwnerCreateCharacter(p.id);
        return `<option value="${p.id}" ${p.id === selectedOwnerId ? "selected" : ""} ${blocked ? "disabled" : ""}>${escapeHtml(p.display_name)}${blocked ? "（已有角色）" : ""}</option>`;
      }).join("") ?? ""
    : "";
  return `
    <form id="character-form" class="characterForm">
      ${state.profile.role === "dm" ? `<label>归属账号<select name="owner_id">${playerOptions}</select></label>` : ""}
      <div class="formRow">
        <label>姓名<input name="name" required></label>
        <label>性别<select name="gender"><option>男</option><option>女</option><option>其他</option></select></label>
        <label>年龄<input name="age" type="number" min="1" value="40"></label>
      </div>
      <div class="formRow">
        <label>民族<select name="ethnicity"><option>约尔裔</option><option>卡兰克裔</option><option>其他少数民族</option></select></label>
        <label>信仰<select name="faith"><option>圣会派</option><option>瓦勒派</option><option>无神论</option></select></label>
        <label>政治派系<select name="faction_id">${factionOptions}</select></label>
      </div>
      <h3>属性</h3>
      <div class="sheetMeters">
        <span id="attribute-meter">属性点：0 / 400</span>
        <span id="wealth-meter">财富范围：40-80</span>
        <span id="prestige-meter">威望范围：20-年龄</span>
        <span id="luck-meter">幸运：15-90，5的倍数</span>
      </div>
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
      <div class="sheetMeters">
        <span id="skill-meter">技能点：0 / 智力×2</span>
      </div>
      <div class="statInputGrid">
        ${["谈判", "演讲", "写作", "法律", "会计"].map((skill) => `<label>${skill}<input name="skill_${skill}" type="number" min="10" max="100" value="10"></label>`).join("")}
      </div>
      <div class="traitColumns">
        <div>
          <h3>公开特质</h3>
          <div class="sheetMeters"><span id="trait-meter">特质点：0 / 4</span></div>
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
      <div class="sheetMeters"><span id="retainer-meter">亲信：0 / 0</span></div>
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

function dmCharacterEditor(character, stats) {
  const skills = stats?.skills ?? {};
  const skillKeys = Array.from(new Set(["谈判", "演讲", "写作", "法律", "会计", ...Object.keys(skills)]));
  return `
    <details class="dmEditor" data-detail-key="dm-character:${escapeAttr(character.id)}">
      <summary>DM编辑角色卡</summary>
      <form data-character-edit="${character.id}">
        <div class="formRow">
          <label>姓名<input name="name" value="${escapeAttr(character.name)}"></label>
          <label>性别<select name="gender">${["男", "女", "其他"].map((value) => `<option ${value === character.gender ? "selected" : ""}>${value}</option>`).join("")}</select></label>
          <label>年龄<input name="age" type="number" value="${character.age ?? ""}"></label>
        </div>
        <div class="formRow">
          <label>民族<input name="ethnicity" value="${escapeAttr(character.ethnicity)}"></label>
          <label>信仰<input name="faith" value="${escapeAttr(character.faith)}"></label>
          <label>政治派系<select name="faction_id">${state.data.factions.filter((f) => f.faction_type === "political").map((f) => `<option value="${f.id}" ${f.id === character.faction_id ? "selected" : ""}>${escapeHtml(f.short_name)}</option>`).join("")}</select></label>
        </div>
        <label>公开背景<textarea name="public_background">${escapeHtml(character.public_background ?? "")}</textarea></label>
        <label>公开特质（每行一个）<textarea name="public_traits">${escapeHtml((character.public_traits ?? []).join("\n"))}</textarea></label>
        ${stats ? `
          <h3>属性</h3>
          <div class="statInputGrid">
            ${dmStatInput("body", "体质", stats.body)}
            ${dmStatInput("willpower", "意志", stats.willpower)}
            ${dmStatInput("wealth", "财富", stats.wealth)}
            ${dmStatInput("charm", "魅力", stats.charm)}
            ${dmStatInput("intellect", "智力", stats.intellect)}
            ${dmStatInput("prestige", "威望", stats.prestige)}
            ${dmStatInput("perception", "感知", stats.perception)}
            ${dmStatInput("luck", "幸运", stats.luck)}
          </div>
          <h3>技能</h3>
          <div class="statInputGrid">
            ${skillKeys.map((skill) => `<label>${escapeHtml(skill)}<input name="skill_${escapeAttr(skill)}" type="number" value="${Number(skills[skill] ?? 10)}"></label>`).join("")}
          </div>
          <label>秘密特质（每行一个）<textarea name="secret_traits">${escapeHtml((stats.secret_traits ?? []).join("\n"))}</textarea></label>
          <label>人生追求<input name="pursuit" value="${escapeAttr(stats.pursuit ?? "")}"></label>
          <label>黑料（每行：严重度｜内容）<textarea name="scandals">${escapeHtml(scandalLines(stats.scandals).join("\n"))}</textarea></label>
        ` : `<div class="notice">缺少私密卡，无法编辑属性、技能和黑料。</div>`}
        <button class="primaryButton" type="button" data-save-character="${character.id}">保存角色修改</button>
      </form>
    </details>
  `;
}

function dmStatInput(name, label, value) {
  return `<label>${label}<input name="${name}" type="number" value="${Number(value ?? 0)}"></label>`;
}

function statInput(name, label, value, min, max, step = 1) {
  return `<label>${label}<input name="${name}" type="number" min="${min}" max="${max}" step="${step}" value="${value}"></label>`;
}

function traitCheckbox(group, name, cost, req) {
  const reqText = req ? ` · ${traitRequirementLabel(req)}` : "";
  const effectText = TRAIT_EFFECTS[name]?.note ? ` · ${TRAIT_EFFECTS[name].note}` : "";
  return `<label class="checkLine"><input type="checkbox" name="${group}" value="${escapeAttr(name)}" data-cost="${cost}" data-req="${escapeAttr(req)}"> ${escapeHtml(name)}（<span data-trait-cost-label>${traitCostLabel(cost)}</span>${reqText}${effectText}）</label>`;
}

function actionPanel() {
  const readonly = !isPlayer() && !isDm();
  const ownCharacters = state.data.characters.filter((c) => c.owner_id === state.profile.id);
  const ownIds = new Set(ownCharacters.map((c) => c.id));
  const retainers = state.data.retainers.filter((r) => ownIds.has(r.character_id));
  const actors = [
    ...ownCharacters.map((c) => ["character", c.id, c.name]),
    ...retainers.map((r) => ["retainer", r.id, r.name]),
  ];
  const ownStats = state.data.privateStats.filter((s) => ownIds.has(s.character_id));
  const hasYouth = ownCharacters.some((c) => c.public_traits?.includes("年轻气盛")) || ownStats.some((s) => s.secret_traits?.includes("年轻气盛"));
  if (readonly) {
    return `
      <section class="panel wide">
        <div class="panelHeader"><h2>行动记录</h2><div class="quota">OB只读</div></div>
        <div class="actionStack">${state.data.actions.map(actionCard).join("")}</div>
      </section>
    `;
  }
  return `
    <div class="grid two">
      <section class="panel">
          <div class="panelHeader"><h2>行动草稿</h2><span class="scorePill">草稿不限阶段</span></div>
          <div class="notice">草稿会在对应阶段自动提交；也可以在行动记录里手动提交。政府行动不公开必须填写理由，理由不合理由DM扣威望。</div>
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
  const canApprove = isPlayer() && isGovernmentHead();
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
        ${voteGroups.length ? voteGroups.map(parliamentVoteCard).join("") : `<article class="parliamentCard recessCard"><h3>休会中</h3><span>当前没有议案。</span></article>`}
      </div>
    </section>
  `;
}

function parliamentVoteCard(group) {
  const isDm = state.profile.role === "dm";
  const totals = voteTotals(group.rows);
  const settlement = group.rows.find((row) => row.notes)?.notes ?? "";
  const voteIds = group.rows.map((row) => row.id).join(",");
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
      ${settlement ? `<div class="resultBox"><strong>议会结算</strong><span>${escapeHtml(settlement)}</span></div>` : ""}
      <div class="chamber" aria-label="${escapeAttr(group.issue)} 席位图">
        ${parliamentDots(group.rows)}
      </div>
      <div class="voteLegend">
        ${sortedPoliticalFactions().map((f) => `<span><i style="background:${escapeAttr(f.color)}"></i>${escapeHtml(f.short_name)}</span>`).join("")}
      </div>
      <div class="voteTable">
        ${sortedVoteRows(group.rows).map((rawVote) => {
          const v = normalizedVoteRow(rawVote);
          return `
          <div class="voteRow">
            <strong>${escapeHtml(v.factions?.short_name ?? factionName(v.faction_id))}</strong>
            <span>${v.seats}席</span>
            ${voteControl(v, "yes_votes", "赞成", isDm)}
            ${voteControl(v, "no_votes", "反对", isDm)}
            ${voteControl(v, "abstain_votes", "弃权", isDm)}
          </div>
        `}).join("")}
      </div>
      ${isDm && group.rows.length ? `
        <div class="parliamentActions">
          <button class="primaryButton" data-settle-vote="${escapeAttr(voteIds)}">结算投票</button>
          <button class="dangerButton" data-delete-vote="${escapeAttr(voteIds)}" data-vote-issue="${escapeAttr(group.issue)}">删除投票</button>
        </div>
      ` : ""}
    </article>
  `;
}

function voteControl(v, field, label, enabled) {
  const value = Number(v[field] ?? 0);
  return `
    <label class="voteControl">
      <span>${label} ${value}</span>
      <input type="range" min="0" max="${v.seats}" step="1" value="${value}" ${enabled ? "" : "disabled"} data-vote="${v.id}" data-field="${field}">
      <input type="number" min="0" max="${v.seats}" step="1" value="${value}" ${enabled ? "" : "disabled"} data-vote="${v.id}" data-field="${field}">
    </label>
  `;
}

function groupedVotes() {
  const groups = new Map();
  for (const vote of state.data.votes) {
    const key = `${vote.turn_number}:${vote.issue}`;
    if (!groups.has(key)) groups.set(key, { issue: vote.issue, turn: vote.turn_number, rows: [] });
    groups.get(key).rows.push(vote);
  }
  return Array.from(groups.values())
    .map((group) => ({ ...group, rows: sortedVoteRows(group.rows) }))
    .sort((a, b) => b.turn - a.turn || a.issue.localeCompare(b.issue, "zh-Hans-CN"));
}

function voteTotals(rows) {
  return rows.map(normalizedVoteRow).reduce((sum, row) => ({
    yes: sum.yes + Number(row.yes_votes ?? 0),
    no: sum.no + Number(row.no_votes ?? 0),
    abstain: sum.abstain + Number(row.abstain_votes ?? 0),
  }), { yes: 0, no: 0, abstain: 0 });
}

function parliamentDots(rows) {
  const seats = [];
  const rowByFaction = new Map(rows.map((row) => [row.faction_id, normalizedVoteRow(row)]));
  for (const faction of sortedPoliticalFactions()) {
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
      for (let i = 0; i < count; i += 1) seats.push({ color: faction.color, faction: faction.short_name, factionOrder: factionOrder(faction.id), voteClass });
    }
  }
  const normalized = seats
    .sort((a, b) => voteClassOrder(a.voteClass) - voteClassOrder(b.voteClass) || a.factionOrder - b.factionOrder)
    .slice(0, 100);
  while (normalized.length < 100) normalized.push({ color: "#b9b3aa", faction: "空席", voteClass: "neutral" });
  const centerX = 50;
  const centerY = 50;
  const rings = [
    { radius: 44, count: 36 },
    { radius: 34, count: 30 },
    { radius: 24, count: 22 },
    { radius: 14, count: 12 },
  ];
  const positions = [];
  for (const ring of rings) {
    for (let i = 0; i < ring.count; i += 1) {
      const angle = Math.PI - (Math.PI * (i + 0.5)) / ring.count;
      const x = centerX + Math.cos(angle) * ring.radius;
      const y = centerY - Math.sin(angle) * ring.radius;
      positions.push({ x, y, ringIndex: rings.indexOf(ring), seatIndex: i });
    }
  }
  positions.sort((a, b) => a.x - b.x || a.ringIndex - b.ringIndex || b.y - a.y || a.seatIndex - b.seatIndex);
  return positions.map((position, index) => {
    const seat = normalized[index] ?? normalized[normalized.length - 1];
    return `<span class="seatDot ${seat.voteClass}" style="left:${position.x}%; top:${position.y}%; background:${escapeAttr(seat.color)}" title="${escapeAttr(`${seat.faction} · ${voteClassLabel(seat.voteClass)}`)}"></span>`;
  }).join("");
}

function normalizedVoteRow(row) {
  const seats = Math.max(0, Number(row.seats ?? 0));
  const values = normalizeVoteValues({
    yes_votes: Number(row.yes_votes ?? 0),
    no_votes: Number(row.no_votes ?? 0),
    abstain_votes: Number(row.abstain_votes ?? seats),
  }, seats, "yes_votes");
  return { ...row, seats, ...values };
}

function voteClassLabel(value) {
  return { yes: "赞成", no: "反对", abstain: "弃权", neutral: "未表决" }[value] ?? value;
}

function dmPanel() {
  return `
    <div class="grid two">
      ${dmPlayerMonitor()}
      <section class="panel">
        <h2>阶段与国家修正</h2>
        <div class="buttonRow">
          <button class="ghostButton" data-action="previous-phase">回退阶段</button>
          <button class="primaryButton" data-action="advance-phase">推进到下一阶段</button>
          <button class="dangerButton" data-action="reset-turn">重置到第1回合开始</button>
        </div>
        <div class="formRow">
          <label>当前回合<input id="dm-turn" type="number" min="1" value="${state.data.state?.current_turn ?? 1}"></label>
          <label>当前阶段<select id="dm-phase">${PHASES.map(([key, label]) => `<option value="${key}" ${key === state.data.state?.current_phase ? "selected" : ""}>${escapeHtml(label)}</option>`).join("")}</select></label>
        </div>
        <button class="ghostButton" data-action="save-phase">保存回合/阶段</button>
        <label>合法性DM修正<input id="legitimacy-modifier" type="number" value="${state.data.state?.legitimacy_modifier ?? 0}"></label>
        <label>经济形势<input id="economy-status" value="${escapeAttr(state.data.state?.economy_status ?? "一切如常")}"></label>
        <label>国家预算<select id="budget-status">${BUDGET_LEVELS.map((status) => `<option ${status === state.data.state?.budget_status ? "selected" : ""}>${status}</option>`).join("")}</select></label>
        ${foreignPowerEditor()}
        <h3>社会群体满意度</h3>
        <div class="moodEditor">
          ${state.data.groups.map((group) => `
            <label>
              <span>${escapeHtml(group.name)}</span>
              <input data-mood-group="${group.id}" type="number" min="-2" max="2" step="1" value="${Number(group.mood ?? 0)}">
              <small>${moodLabel(group.mood)}</small>
            </label>
          `).join("")}
        </div>
        ${dmSupporterEditor()}
        <button class="ghostButton" data-action="save-state">保存国家修正</button>
      </section>
      <section class="panel">
        <h2>黑料</h2>
        <label>目标角色<select id="scandal-character">${characterOptions()}</select></label>
        <label>预设黑料<select id="scandal-preset">${SCANDALS.map((item, index) => `<option value="${index}">${escapeHtml(item[0])}：${escapeHtml(item[1])}</option>`).join("")}</select></label>
        <div class="buttonRow">
          <button class="ghostButton" data-action="draw-scandal">随机加入</button>
          <button class="primaryButton" data-action="add-scandal">加入所选</button>
        </div>
        <div class="formRow">
          <label>严重度<input id="custom-scandal-severity" value="可大可小"></label>
          <label>内容<input id="custom-scandal-text" placeholder="手写黑料"></label>
        </div>
        <button class="ghostButton" data-action="add-custom-scandal">加入自定义黑料</button>
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
        ${pendingActionStack()}
      </section>
      <section class="panel wide">
        <h2>草稿待提交</h2>
        ${dmDraftActionStack()}
      </section>
    </div>
  `;
}

function pendingActionStack() {
  const groups = groupedPendingActions();
  const draftCount = state.data.actions.filter((a) => a.status === "draft").length;
  const draftNotice = draftCount ? `<div class="notice">${draftCount} 条草稿尚未提交，不会进入待处理行动。</div>` : "";
  if (!groups.length) return `${draftNotice}<div class="notice">暂无待处理行动。</div>`;
  return `
    ${draftNotice}
    <div class="actionStack">
      ${groups.map(pendingActionCard).join("")}
    </div>
  `;
}

function groupedPendingActions() {
  const grouped = new Map();
  for (const action of state.data.actions.filter((a) => ["submitted", "approved"].includes(a.status))) {
    const key = pendingActionSignature(action);
    if (!grouped.has(key)) grouped.set(key, { action, duplicateIds: [] });
    else grouped.get(key).duplicateIds.push(action.id);
  }
  return Array.from(grouped.values());
}

function pendingActionSignature(action) {
  return [
    action.owner_id,
    action.turn_number,
    action.action_kind,
    action.actor_type,
    action.actor_id,
    action.title,
    action.category,
    action.target,
    action.description,
    action.resources,
    action.visibility,
    action.non_public_reason,
    action.status,
  ].map((value) => String(value ?? "").trim()).join("\u001f");
}

function pendingActionCard(group) {
  const action = group.action;
  const duplicateCount = group.duplicateIds.length;
  const duplicateLabel = duplicateCount ? ` · 重复 ${duplicateCount} 条已折叠` : "";
  return `
    <article class="actionCard">
      <div class="actionHeader">
        <div>
          <strong>${escapeHtml(action.title || "未命名行动")}</strong>
          <span>${statusLabel(action.status)} · ${action.action_kind === "private" ? "私人行动" : "政府行动"}${duplicateLabel}</span>
          <span>提交者：${escapeHtml(actionOwnerLabel(action))} · 执行者：${escapeHtml(actionActorLabel(action))}</span>
        </div>
      </div>
      <p>${escapeHtml(action.description)}</p>
      ${processActionForm(action)}
      <div class="buttonRow">
        <button class="dangerButton" data-delete-action="${action.id}" data-action-title="${escapeAttr(action.title || "未命名行动")}" type="button">删除</button>
        ${duplicateCount ? `<button class="ghostButton" data-delete-duplicate-actions="${escapeAttr(group.duplicateIds.join(","))}" data-action-title="${escapeAttr(action.title || "未命名行动")}" type="button">删除重复项</button>` : ""}
      </div>
    </article>
  `;
}

function processActionForm(action) {
  if (action.action_kind === "private") {
    return `
      <div class="processBox">
        <label>结果（仅DM和本人可见）<textarea data-result-private="${action.id}" rows="6">${escapeHtml(action.result_private ?? "")}</textarea></label>
        <button class="primaryButton" data-process-action="${action.id}" type="button">保存结果并处理</button>
      </div>
    `;
  }
  return `
    <div class="processBox">
      <label>公开结果<textarea data-result-public="${action.id}" rows="5">${escapeHtml(action.result_public ?? "")}</textarea></label>
      <label>私密结果（仅DM和提交者可见）<textarea data-result-private="${action.id}" rows="5">${escapeHtml(action.result_private ?? "")}</textarea></label>
      <button class="primaryButton" data-process-action="${action.id}" type="button">保存结果并处理</button>
    </div>
  `;
}

function dmDraftActionStack() {
  const drafts = state.data.actions.filter((action) => action.status === "draft");
  if (!drafts.length) return `<div class="notice">暂无草稿。</div>`;
  return `
    <div class="actionStack">
      ${drafts.map(actionCard).join("")}
    </div>
  `;
}

function actionOwnerLabel(action) {
  const profileName = profileDisplayName(action.owner_id) || "未知账号";
  const character = state.data.characters.find((item) => item.owner_id === action.owner_id && item.active !== false);
  return character ? `${character.name}（${profileName}）` : profileName;
}

function actionActorLabel(action) {
  if (action.actor_type === "character") {
    return state.data.characters.find((item) => item.id === action.actor_id)?.name ?? "未知角色";
  }
  if (action.actor_type === "retainer") {
    return state.data.retainers.find((item) => item.id === action.actor_id)?.name ?? "未知亲信";
  }
  return "未指定";
}

function dmSupporterEditor() {
  const groups = state.data.groups.map((group) => group.name);
  const factions = sortedPoliticalFactions().filter((faction) => faction.key !== "unaligned");
  return `
    <h3>派系吸纳群体</h3>
    <div class="supportEditor">
      ${factions.map((faction) => {
        const supporters = new Set(faction.supporters ?? []);
        return `
          <fieldset>
            <legend><i style="background:${escapeAttr(faction.color)}"></i>${escapeHtml(faction.short_name)}</legend>
            ${groups.map((group) => `
              <label>
                <input type="checkbox" data-faction-supporter="${faction.id}" value="${escapeAttr(group)}" ${supporters.has(group) ? "checked" : ""}>
                ${escapeHtml(group)}
              </label>
            `).join("")}
          </fieldset>
        `;
      }).join("")}
    </div>
    <button class="ghostButton" data-action="save-supporters" type="button">保存派系吸纳群体</button>
  `;
}

function dmPlayerMonitor() {
  const presenceByProfile = latestPresenceByProfile();
  const players = state.data.profiles.filter((profile) => profile.role === "player");
  const observers = state.data.profiles.filter((profile) => profile.role === "observer");
  const observerProfiles = new Set(observers.map((profile) => profile.id));
  const observerSessions = state.data.presence.filter((row) => observerProfiles.has(row.profile_id));
  const audits = state.data.audits.slice(0, 80);
  return `
    <section class="panel wide">
      <div class="panelHeader">
        <div>
          <h2>玩家观测</h2>
          <p>在线状态按最近心跳判断；关闭页面时可能最多延迟几十秒。</p>
        </div>
        <span class="scorePill">${players.filter((profile) => isProfileOnline(presenceByProfile.get(profile.id))).length} / ${players.length} 在线</span>
      </div>
      <div class="monitorGrid">
        <div class="playerPresenceList">
          ${players.map((profile) => {
            const presence = presenceByProfile.get(profile.id);
            const online = isProfileOnline(presence);
            return `
              <article class="presenceCard ${online ? "online" : ""}">
                <div>
                  <strong>${escapeHtml(profile.display_name)}</strong>
                  <span>${online ? "在线" : "离线"}</span>
                </div>
                <small>最后心跳：${formatDateTime(presence?.last_seen_at)}</small>
                <small>上线：${formatDateTime(presence?.last_online_at)}</small>
                <small>下线：${formatDateTime(presence?.last_offline_at)}</small>
                <small>当前页面：${escapeHtml(presence?.current_tab || "未知")}</small>
              </article>
            `;
          }).join("") || `<div class="notice">还没有玩家账号。</div>`}
          ${observers.length ? `
            <h3>OB会话</h3>
            ${observerPresenceCards(observers, observerSessions)}
          ` : ""}
        </div>
        <div class="activityFeed">
          ${audits.map((entry) => `
            <article class="activityItem">
              <time>${formatDateTime(entry.created_at)}</time>
              <strong>${escapeHtml(profileDisplayName(entry.actor_id) || "未知账号")}</strong>
              <span>${escapeHtml(activityLabel(entry.action))}</span>
              <small>${escapeHtml(activityDetailText(entry))}</small>
            </article>
          `).join("") || `<div class="notice">还没有活动记录。</div>`}
        </div>
      </div>
    </section>
  `;
}

function foreignPowerEditor() {
  const powers = state.data.foreignPowers.filter((power) => ["karank", "royer"].includes(power.key));
  return `
    <h3>大国耐心</h3>
    <div class="moodEditor">
      ${powers.map((power) => `
        <label>
          <span>${escapeHtml(power.name)}</span>
          <input data-foreign-power="${power.id}" type="number" min="0" max="100" step="1" value="${Number(power.patience ?? 30)}">
          <small>${Number(power.patience ?? 30)} / 100</small>
        </label>
      `).join("") || `<div class="notice">还没有大国耐心数据，请检查 foreign_powers 初始化。</div>`}
    </div>
  `;
}

function observerPresenceCards(observers, sessions) {
  return observers.map((observer) => {
    const ownSessions = sessions.filter((presence) => presence.profile_id === observer.id);
    if (!ownSessions.length) {
      return presenceCard(observer.display_name || "OB", null);
    }
    return ownSessions.map((presence, index) => presenceCard(`${observer.display_name || "OB"} ${ownSessions.length > 1 ? index + 1 : ""}`.trim(), presence)).join("");
  }).join("");
}

function presenceCard(name, presence) {
  const online = isProfileOnline(presence);
  return `
    <article class="presenceCard ${online ? "online" : ""}">
      <div>
        <strong>${escapeHtml(name)}</strong>
        <span>${online ? "在线" : "离线"}</span>
      </div>
      <small>最后心跳：${formatDateTime(presence?.last_seen_at)}</small>
      <small>上线：${formatDateTime(presence?.last_online_at)}</small>
      <small>下线：${formatDateTime(presence?.last_offline_at)}</small>
      <small>当前页面：${escapeHtml(presence?.current_tab || "未知")}</small>
    </article>
  `;
}

function latestPresenceByProfile() {
  const rows = state.data.presence.slice().sort((a, b) => new Date(b.last_seen_at ?? 0) - new Date(a.last_seen_at ?? 0));
  const map = new Map();
  for (const row of rows) {
    if (!map.has(row.profile_id)) map.set(row.profile_id, row);
  }
  return map;
}

function isProfileOnline(presence) {
  if (!presence?.online || !presence.last_seen_at) return false;
  return Date.now() - new Date(presence.last_seen_at).getTime() < 45000;
}

function formatDateTime(value) {
  if (!value) return "无";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "无";
  return date.toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function activityLabel(action) {
  return {
    login: "登录",
    logout: "退出",
    create_action: "创建行动",
    delete_action: "删除行动",
    delete_duplicate_actions: "删除重复行动",
    submit_draft_action: "提交草稿",
    auto_submit_draft_actions: "自动提交草稿",
    process_action: "处理行动",
    reopen_action: "撤回处理",
    approve_action: "批准/驳回行动",
    create_character: "创建角色卡",
    update_character: "修改角色卡",
    delete_character: "删除角色卡",
    advance_phase: "推进阶段",
    previous_phase: "回退阶段",
    save_phase: "修改回合/阶段",
    reset_turn: "重置回合",
    save_state: "修改国家状态",
    change_policy: "修改政策",
    assign_position: "任命职位",
    unassign_position: "撤任职位",
    create_vote: "创建投票",
    update_vote: "调整票向",
    settle_vote: "结算投票",
    delete_vote: "删除投票",
    add_scandal: "添加黑料",
  }[action] ?? action;
}

function activityDetailText(entry) {
  const details = typeof entry.details === "object" && entry.details ? entry.details : {};
  const parts = [
    details.title,
    details.name,
    details.issue,
    details.policy,
    details.phase,
    details.status,
  ].filter(Boolean);
  return parts.join(" · ") || entry.table_name || "";
}

function bindCommon() {
  root.querySelectorAll("[data-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      state.tab = button.dataset.tab;
      touchPresence(true);
      render();
    });
  });
  root.querySelector('[data-action="refresh"]')?.addEventListener("click", loadAll);
  root.querySelector('[data-action="logout"]')?.addEventListener("click", async () => {
    await recordActivity("logout", "auth");
    await touchPresence(false);
    await supabase.auth.signOut();
  });
  root.querySelectorAll("[data-country]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedCountry = button.dataset.country;
      render();
    });
  });
}

function bindEditTracking() {
  if (editTrackingBound) return;
  editTrackingBound = true;
  root.addEventListener("input", markUnsavedEdit, true);
  root.addEventListener("change", markUnsavedEdit, true);
  root.addEventListener("toggle", rememberOpenDetails, true);
}

function markUnsavedEdit(event) {
  if (!isEditableControl(event.target)) return;
  unsavedEdit = true;
  if (event.target.closest?.("[data-retainer-edit]")) rememberRetainerDrafts();
}

function isEditableControl(element) {
  return element instanceof HTMLInputElement ||
    element instanceof HTMLTextAreaElement ||
    element instanceof HTMLSelectElement ||
    Boolean(element?.isContentEditable);
}

function shouldDeferAutoRefresh() {
  return unsavedEdit || isEditableControl(document.activeElement) || hasOpenDetails();
}

function hasOpenDetails() {
  return Boolean(root.querySelector("details[data-detail-key][open]"));
}

function bindTab() {
  root.querySelectorAll(".policyEditor").forEach((editor) => {
    editor.addEventListener("click", (event) => event.stopPropagation());
  });
  root.querySelectorAll("[data-policy-save]").forEach((button) => {
    button.addEventListener("click", () => savePolicyChange(button.dataset.policySave));
  });

  root.querySelectorAll("[data-action-save]").forEach((button) => {
    button.addEventListener("click", () => saveAction(button.dataset.actionSave, button));
  });

  root.querySelector('[data-action="create-character"]')?.addEventListener("click", createCharacter);
  setupCharacterSheetAssistant();
  root.querySelectorAll("[data-delete-character]").forEach((button) => {
    button.addEventListener("click", () => deleteCharacter(button.dataset.deleteCharacter, button.dataset.characterName));
  });
  root.querySelectorAll("[data-save-character]").forEach((button) => {
    button.addEventListener("click", () => saveCharacterEdits(button.dataset.saveCharacter));
  });
  root.querySelectorAll("[data-save-retainers]").forEach((button) => {
    button.addEventListener("click", () => saveRetainers(button.dataset.saveRetainers));
  });
  root.querySelectorAll("[data-add-retainer]").forEach((button) => {
    button.addEventListener("click", () => addRetainer(button.dataset.addRetainer));
  });
  root.querySelectorAll("[data-delete-retainer]").forEach((button) => {
    button.addEventListener("click", () => deleteRetainer(button.dataset.deleteRetainer, button.dataset.retainerName));
  });
  root.querySelectorAll("[data-delete-action]").forEach((button) => {
    button.addEventListener("click", () => deleteAction(button.dataset.deleteAction, button.dataset.actionTitle));
  });
  root.querySelectorAll("[data-delete-duplicate-actions]").forEach((button) => {
    button.addEventListener("click", () => deleteDuplicateActions(button.dataset.deleteDuplicateActions, button.dataset.actionTitle));
  });
  root.querySelectorAll("[data-submit-draft]").forEach((button) => {
    button.addEventListener("click", () => submitDraftAction(button.dataset.submitDraft));
  });

  root.querySelectorAll("[data-approve]").forEach((button) => {
    button.addEventListener("click", async () => {
      const action = state.data.actions.find((item) => item.id === button.dataset.approve);
      const { error } = await supabase.from("actions").update({ status: button.dataset.status, approved_by: state.profile.id }).eq("id", button.dataset.approve);
      if (error) alert(error.message);
      else {
        await recordActivity("approve_action", "actions", button.dataset.approve, {
          title: action?.title ?? "",
          status: statusLabel(button.dataset.status),
        });
        loadAll();
      }
    });
  });

  root.querySelector('[data-action="create-vote"]')?.addEventListener("click", createVote);
  root.querySelectorAll("[data-vote]").forEach((input) => {
    input.addEventListener("change", () => updateVote(input.dataset.vote, input.dataset.field, input.value));
  });
  root.querySelectorAll("[data-settle-vote]").forEach((button) => {
    button.addEventListener("click", () => settleVote(button.dataset.settleVote));
  });
  root.querySelectorAll("[data-delete-vote]").forEach((button) => {
    button.addEventListener("click", () => deleteVote(button.dataset.deleteVote, button.dataset.voteIssue));
  });
  root.querySelector('[data-action="advance-phase"]')?.addEventListener("click", advancePhase);
  root.querySelector('[data-action="previous-phase"]')?.addEventListener("click", previousPhase);
  root.querySelector('[data-action="save-phase"]')?.addEventListener("click", savePhase);
  root.querySelector('[data-action="reset-turn"]')?.addEventListener("click", resetTurn);
  root.querySelector('[data-action="save-state"]')?.addEventListener("click", saveState);
  root.querySelector('[data-action="save-supporters"]')?.addEventListener("click", saveSupporters);
  root.querySelector('[data-action="assign-position"]')?.addEventListener("click", assignPosition);
  root.querySelectorAll("[data-unassign-position]").forEach((button) => {
    button.addEventListener("click", () => unassignPosition(button.dataset.unassignPosition, button.dataset.assignmentName));
  });
  root.querySelector('[data-action="draw-scandal"]')?.addEventListener("click", addRandomScandal);
  root.querySelector('[data-action="add-scandal"]')?.addEventListener("click", addSelectedScandal);
  root.querySelector('[data-action="add-custom-scandal"]')?.addEventListener("click", addCustomScandal);
  root.querySelectorAll("[data-process-action]").forEach((button) => {
    button.addEventListener("click", () => processAction(button.dataset.processAction));
  });
  root.querySelectorAll("[data-reopen-action]").forEach((button) => {
    button.addEventListener("click", () => reopenAction(button.dataset.reopenAction));
  });
}

function rememberCharacterDraft(form = document.getElementById("character-form")) {
  if (!form || !state.profile) return;
  const fields = {};
  form.querySelectorAll("input, select, textarea").forEach((control) => {
    if (!control.name || control.type === "button") return;
    if (control.type === "checkbox") {
      fields[control.name] ??= [];
      if (control.checked) fields[control.name].push(control.value || "on");
      return;
    }
    fields[control.name] = control.value;
  });
  characterDraftCache = {
    profileId: state.profile?.id ?? "",
    fields,
  };
  writeCharacterDraftCache();
}

function rememberOpenDetails() {
  const keys = Array.from(root.querySelectorAll("details[data-detail-key][open]"))
    .map((detail) => detail.dataset.detailKey)
    .filter(Boolean);
  if (keys.length || root.querySelector("details[data-detail-key]")) {
    openDetailKeys = new Set(keys);
  }
}

function restoreOpenDetails() {
  root.querySelectorAll("details[data-detail-key]").forEach((detail) => {
    detail.open = openDetailKeys.has(detail.dataset.detailKey);
  });
}

function rememberRetainerDrafts() {
  if (!state.profile) return;
  const editors = Array.from(root.querySelectorAll("[data-retainer-edit]"));
  if (!editors.length) return;
  const retainers = { ...(retainerDraftCache?.retainers ?? {}) };
  const newRetainers = { ...(retainerDraftCache?.newRetainers ?? {}) };
  for (const editor of editors) {
    const characterId = editor.dataset.retainerEdit;
    editor.querySelectorAll("[data-retainer-row]").forEach((row) => {
      const retainerId = row.dataset.retainerRow;
      retainers[retainerId] = retainerDraftFromInputs(retainerId);
    });
    newRetainers[characterId] = newRetainerDraft(characterId);
  }
  retainerDraftCache = {
    profileId: state.profile.id,
    retainers,
    newRetainers,
  };
  writeRetainerDraftCache();
}

function restoreRetainerDrafts() {
  if (!retainerDraftCache || retainerDraftCache.profileId !== state.profile?.id) return;
  for (const [retainerId, draft] of Object.entries(retainerDraftCache.retainers ?? {})) {
    setControlValue(`[data-retainer-name="${retainerId}"]`, draft.name);
    setControlValue(`[data-retainer-gender="${retainerId}"]`, draft.gender);
    setControlValue(`[data-retainer-age="${retainerId}"]`, draft.age);
    setControlValue(`[data-retainer-notes="${retainerId}"]`, draft.notes);
  }
  for (const [characterId, draft] of Object.entries(retainerDraftCache.newRetainers ?? {})) {
    setControlValue(`[data-new-retainer-name="${characterId}"]`, draft.name);
    setControlValue(`[data-new-retainer-gender="${characterId}"]`, draft.gender);
    setControlValue(`[data-new-retainer-age="${characterId}"]`, draft.age);
    setControlValue(`[data-new-retainer-notes="${characterId}"]`, draft.notes);
  }
}

function clearRetainerDraft(characterId, retainerIds = []) {
  if (!retainerDraftCache) return;
  const retainers = { ...(retainerDraftCache.retainers ?? {}) };
  const newRetainers = { ...(retainerDraftCache.newRetainers ?? {}) };
  for (const retainerId of retainerIds) delete retainers[retainerId];
  if (characterId) delete newRetainers[characterId];
  retainerDraftCache = {
    profileId: state.profile?.id ?? retainerDraftCache.profileId,
    retainers,
    newRetainers,
  };
  writeRetainerDraftCache();
}

function setControlValue(selector, value) {
  const control = root.querySelector(selector);
  if (!control || value === undefined || value === null) return;
  control.value = String(value);
}

function restoreCharacterDraft(form) {
  if (!form || characterDraftCache?.profileId !== state.profile?.id) return;
  const fields = characterDraftCache.fields ?? {};
  form.querySelectorAll("input, select, textarea").forEach((control) => {
    if (!control.name || !(control.name in fields) || control.type === "button") return;
    const value = fields[control.name];
    if (control.type === "checkbox") {
      const checkedValues = Array.isArray(value) ? value : [];
      control.checked = checkedValues.includes(control.value || "on");
      return;
    }
    if (control.tagName === "SELECT") {
      const exists = Array.from(control.options).some((option) => option.value === value);
      if (!exists) return;
    }
    control.value = value;
  });
}

function clearCharacterDraft() {
  characterDraftCache = null;
  writeCharacterDraftCache();
}

function readCharacterDraftCache() {
  try {
    const raw = window.localStorage.getItem(CHARACTER_DRAFT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_error) {
    return null;
  }
}

function readRetainerDraftCache() {
  try {
    const raw = window.localStorage.getItem(RETAINER_DRAFT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_error) {
    return null;
  }
}

function writeCharacterDraftCache() {
  try {
    if (characterDraftCache) {
      window.localStorage.setItem(CHARACTER_DRAFT_STORAGE_KEY, JSON.stringify(characterDraftCache));
    } else {
      window.localStorage.removeItem(CHARACTER_DRAFT_STORAGE_KEY);
    }
  } catch (_error) {
    // 草稿缓存只是防丢保险，浏览器禁用 localStorage 时不影响车卡本身。
  }
}

function writeRetainerDraftCache() {
  try {
    if (retainerDraftCache) {
      const hasRetainers = Object.keys(retainerDraftCache.retainers ?? {}).length > 0;
      const hasNewRetainers = Object.keys(retainerDraftCache.newRetainers ?? {}).length > 0;
      if (hasRetainers || hasNewRetainers) {
        window.localStorage.setItem(RETAINER_DRAFT_STORAGE_KEY, JSON.stringify(retainerDraftCache));
      } else {
        window.localStorage.removeItem(RETAINER_DRAFT_STORAGE_KEY);
      }
    } else {
      window.localStorage.removeItem(RETAINER_DRAFT_STORAGE_KEY);
    }
  } catch (_error) {
    // 草稿缓存只是防丢保险，浏览器禁用 localStorage 时不影响亲信编辑本身。
  }
}

function setupCharacterSheetAssistant() {
  const form = document.getElementById("character-form");
  if (!form) return;
  restoreCharacterDraft(form);
  const update = () => {
    rememberCharacterDraft(form);
    updateCharacterSheetAssistant(form);
  };
  const ownerInput = form.querySelector('[name="owner_id"]');
  ownerInput?.addEventListener("change", () => {
    const factionId = defaultCharacterFactionId(String(ownerInput.value));
    if (factionId) form.elements.faction_id.value = factionId;
    update();
  });
  form.addEventListener("input", update);
  form.addEventListener("change", update);
  update();
}

function updateCharacterSheetAssistant(form) {
  const data = new FormData(form);
  const publicTraits = selectedValues(form, "public_traits");
  const secretTraits = selectedValues(form, "secret_traits");
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
  const skills = {
    谈判: numberField(data, "skill_谈判"),
    演讲: numberField(data, "skill_演讲"),
    写作: numberField(data, "skill_写作"),
    法律: numberField(data, "skill_法律"),
    会计: numberField(data, "skill_会计"),
  };
  const factionId = String(data.get("faction_id") ?? "");
  const ownerId = state.profile.role === "dm" ? String(data.get("owner_id") ?? "") : state.profile.id;
  refreshTraitCostLabels(form, factionId, ownerId);
  const traitEffects = combinedTraitEffects(publicTraits);
  const coreSum = ["body", "willpower", "wealth", "charm", "intellect", "prestige", "perception"].reduce((total, key) => total + Number(attributes[key] ?? 0), 0);
  setMeter("attribute-meter", `属性点：${coreSum} / 400，剩余 ${400 - coreSum}`, coreSum === 400);

  const [wealthMin, wealthMax] = wealthRange(publicTraits);
  updateNumberBounds(form, "wealth", wealthMin, wealthMax);
  setMeter("wealth-meter", `财富范围：${wealthMin}-${wealthMax}，当前 ${attributes.wealth}`, inRange(attributes.wealth, wealthMin, wealthMax));

  const age = numberField(data, "age");
  const actualPrestige = adjustedPrestige(attributes.prestige, publicTraits);
  const prestigeDeltaText = traitEffects.prestige >= 0 ? `+${traitEffects.prestige}` : String(traitEffects.prestige);
  setMeter("prestige-meter", `基础威望：20-${Math.max(20, age)}，当前 ${attributes.prestige}；特质修正 ${prestigeDeltaText}，实际 ${actualPrestige}`, inRange(attributes.prestige, 20, Math.max(20, age)));
  setMeter("luck-meter", `幸运：${attributes.luck}，需为15-90且为5的倍数`, inRange(attributes.luck, 15, 90) && Number(attributes.luck) % 5 === 0);

  const skillSpent = Object.values(skills).reduce((total, value) => total + Math.max(0, Number(value) - 10), 0);
  const skillBudget = Number(attributes.intellect) * 2;
  setMeter("skill-meter", `技能点：已用 ${skillSpent} / ${skillBudget}，剩余 ${skillBudget - skillSpent}`, skillSpent === skillBudget);

  const traitSpent = traitCost(publicTraits, secretTraits, factionId, ownerId);
  const traitOk = traitSpent <= 4 && !(publicTraits.includes("资本家") && publicTraits.includes("苦行僧"));
  const scandalText = traitEffects.scandalDelta ? `；黑料数修正 ${traitEffects.scandalDelta > 0 ? "+" : ""}${traitEffects.scandalDelta}` : "";
  setMeter("trait-meter", `特质点：已用 ${traitSpent} / 4，剩余 ${4 - traitSpent}${scandalText}`, traitOk);

  const retainers = parseRetainers(String(data.get("retainers") ?? ""));
  const retainerLimit = Math.floor((Number(attributes.charm) + Number(actualPrestige)) / 50);
  const retainerFormatOk = retainers.every((retainer) => retainer.name && retainer.gender && retainer.age);
  setMeter("retainer-meter", `亲信：${retainers.length} / ${retainerLimit}`, retainers.length <= retainerLimit && retainerFormatOk);
}

function setMeter(id, text, ok) {
  const element = document.getElementById(id);
  if (!element) return;
  element.textContent = text;
  element.classList.toggle("bad", !ok);
  element.classList.toggle("good", ok);
}

async function saveAction(mode, triggerButton) {
  if (!isPlayer() && !isDm()) return;
  if (actionSaveInFlight) return;
  const form = document.getElementById("action-form");
  if (!form) return;
  actionSaveInFlight = true;
  setActionSaveBusy(true, triggerButton, mode);
  try {
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
    const needsApproval = actionKind === "government" && !isGovernmentHeadForOwner(state.profile.id);
    const status = mode === "draft" ? "draft" : submittedStatusForAction({ action_kind: actionKind, owner_id: state.profile.id });
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
      requires_approval: needsApproval,
      status,
    });
    if (error) alert(error.message);
    else {
      await recordActivity("create_action", "actions", null, {
        title: String(data.get("title") ?? ""),
        status,
        kind: actionKind,
      });
      await loadAll();
    }
  } finally {
    actionSaveInFlight = false;
    setActionSaveBusy(false, triggerButton, mode);
  }
}

function setActionSaveBusy(busy, triggerButton, mode) {
  root.querySelectorAll("[data-action-save]").forEach((button) => {
    if (busy) {
      button.dataset.originalText = button.dataset.originalText || button.textContent;
      button.disabled = true;
      if (button === triggerButton) button.textContent = mode === "draft" ? "保存中..." : "提交中...";
      return;
    }
    button.disabled = false;
    if (button.dataset.originalText) {
      button.textContent = button.dataset.originalText;
      delete button.dataset.originalText;
    }
  });
}

async function autoSubmitEligibleDrafts() {
  if (autoSubmittingDrafts || !isPlayer() || !state.data.state) return false;
  const drafts = state.data.actions.filter((action) =>
    action.status === "draft" &&
    action.owner_id === state.profile.id &&
    actionExpectedPhase(action) === state.data.state.current_phase &&
    !draftSubmissionError(action)
  );
  if (!drafts.length) return false;
  autoSubmittingDrafts = true;
  try {
    const results = await Promise.all(drafts.map((action) =>
      supabase
        .from("actions")
        .update({
          status: submittedStatusForAction(action),
          requires_approval: action.action_kind === "government" && !isGovernmentHeadForOwner(action.owner_id),
        })
        .eq("id", action.id)
        .eq("owner_id", state.profile.id)
        .eq("status", "draft")
    ));
    const error = results.find((result) => result.error)?.error;
    if (error) {
      state.error = error.message;
      render();
      return true;
    }
    await recordActivity("auto_submit_draft_actions", "actions", null, { count: drafts.length });
    await loadAll();
    return true;
  } finally {
    autoSubmittingDrafts = false;
  }
}

async function submitDraftAction(actionId) {
  const action = state.data.actions.find((item) => item.id === actionId);
  if (!action || !canSubmitDraftAction(action)) return;
  const errorMessage = draftSubmissionError(action);
  if (errorMessage) {
    alert(errorMessage);
    return;
  }
  const { error } = await supabase
    .from("actions")
    .update({
      status: submittedStatusForAction(action),
      requires_approval: action.action_kind === "government" && !isGovernmentHeadForOwner(action.owner_id),
    })
    .eq("id", action.id)
    .eq("status", "draft");
  if (error) alert(error.message);
  else {
    await recordActivity("submit_draft_action", "actions", action.id, {
      title: action.title ?? "",
      status: statusLabel(submittedStatusForAction(action)),
    });
    await loadAll();
  }
}

function canSubmitDraftAction(action) {
  if (action.status !== "draft") return false;
  if (isDm()) return true;
  if (!isPlayer() || action.owner_id !== state.profile.id) return false;
  return actionExpectedPhase(action) === state.data.state?.current_phase;
}

function actionExpectedPhase(action) {
  return action.action_kind === "private" ? "private_submission" : "government_submission";
}

function submittedStatusForAction(action) {
  if (action.action_kind !== "government") return "submitted";
  return isGovernmentHeadForOwner(action.owner_id) ? "submitted" : "needs_approval";
}

function draftSubmissionError(action) {
  if (action.action_kind === "government" && action.visibility !== "public" && !String(action.non_public_reason ?? "").trim()) {
    return "政府行动不公开必须填写理由。";
  }
  return "";
}

async function createCharacter() {
  if (!isPlayer() && !isDm()) return;
  const form = document.getElementById("character-form");
  if (!form) return;
  const data = new FormData(form);
  const ownerId = state.profile.role === "dm" ? String(data.get("owner_id")) : state.profile.id;
  if (!canOwnerCreateCharacter(ownerId)) {
    alert("每个玩家账号只能创建一张角色卡；DM账号不受此限制。");
    return;
  }
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
  const errors = override ? [] : validateCharacterDraft(characterDraft, attributes, publicTraits, secretTraits, pursuit, retainers, ownerId);
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
  const storedAttributes = { ...attributes, prestige: adjustedPrestige(attributes.prestige, publicTraits) };
  const inserted = await supabase.from("characters_public").insert({
    owner_id: ownerId,
    prestige: storedAttributes.prestige,
    ...characterDraft,
  }).select("id").single();
  if (inserted.error) {
    alert(inserted.error.message);
    return;
  }
  const characterId = inserted.data.id;
  const privateInsert = await supabase.from("character_private").insert({
    character_id: characterId,
    ...storedAttributes,
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
  await recordActivity("create_character", "characters_public", characterId, { name: characterDraft.name });
  clearCharacterDraft();
  await loadAll();
}

async function deleteCharacter(characterId, characterName) {
  const typed = prompt(`要删除角色卡“${characterName}”，请输入完整角色名确认。`);
  if (typed !== characterName) return;
  const { error } = await supabase.rpc("delete_character", { character_uuid: characterId });
  if (error) alert(error.message);
  else {
    await recordActivity("delete_character", "characters_public", characterId, { name: characterName });
    await loadAll();
  }
}

async function saveCharacterEdits(characterId) {
  if (state.profile.role !== "dm") return;
  const form = Array.from(root.querySelectorAll("[data-character-edit]")).find((item) => item.dataset.characterEdit === characterId);
  if (!form) return;
  const data = new FormData(form);
  const publicPatch = {
    name: String(data.get("name") ?? "").trim(),
    gender: String(data.get("gender") ?? ""),
    age: numberField(data, "age"),
    ethnicity: String(data.get("ethnicity") ?? "").trim(),
    faith: String(data.get("faith") ?? "").trim(),
    faction_id: String(data.get("faction_id") ?? ""),
    public_background: String(data.get("public_background") ?? "").trim(),
    public_traits: linesFromText(data.get("public_traits")),
  };

  const publicUpdate = await supabase.from("characters_public").update(publicPatch).eq("id", characterId);
  if (publicUpdate.error) {
    alert(publicUpdate.error.message);
    return;
  }
  const hasPrivateStats = state.data.privateStats.some((item) => item.character_id === characterId);
  if (hasPrivateStats) {
    const privatePatch = {
      body: numberField(data, "body"),
      willpower: numberField(data, "willpower"),
      wealth: numberField(data, "wealth"),
      charm: numberField(data, "charm"),
      intellect: numberField(data, "intellect"),
      prestige: numberField(data, "prestige"),
      perception: numberField(data, "perception"),
      luck: numberField(data, "luck"),
      skills: skillValuesFromForm(data),
      secret_traits: linesFromText(data.get("secret_traits")),
      pursuit: String(data.get("pursuit") ?? "").trim(),
      scandals: scandalsFromText(data.get("scandals")),
    };
    privatePatch.scandal_count = privatePatch.scandals.length;
    const privateUpdate = await supabase.from("character_private").update(privatePatch).eq("character_id", characterId);
    if (privateUpdate.error) {
      alert(privateUpdate.error.message);
      return;
    }
  }
  alert("角色卡已保存。");
  await recordActivity("update_character", "characters_public", characterId, { name: publicPatch.name });
  await loadAll();
}

async function saveRetainers(characterId) {
  const character = state.data.characters.find((item) => item.id === characterId);
  if (!character || !canEditCharacterRetainers(character)) return;
  const wrapper = root.querySelector(`[data-retainer-edit="${characterId}"]`);
  if (!wrapper) return;
  const retainers = state.data.retainers.filter((retainer) => retainer.character_id === characterId);
  const drafts = retainers.map((retainer) => [retainer.id, retainerDraftFromInputs(retainer.id)]);
  const errors = validateRetainerDrafts(character, drafts.map(([, draft]) => draft));
  if (errors.length) {
    alert(errors.join("\n"));
    return;
  }
  const updates = drafts.map(([id, draft]) => supabase.from("retainers").update(draft).eq("id", id).eq("character_id", characterId));
  const results = await Promise.all(updates);
  const error = results.find((result) => result.error)?.error;
  if (error) {
    alert(error.message);
    return;
  }
  clearRetainerDraft(characterId, retainers.map((retainer) => retainer.id));
  await recordActivity("update_retainers", "retainers", characterId, { name: character.name });
  await loadAll();
}

async function addRetainer(characterId) {
  const character = state.data.characters.find((item) => item.id === characterId);
  if (!character || !canEditCharacterRetainers(character)) return;
  const draft = newRetainerDraft(characterId);
  const currentCount = state.data.retainers.filter((retainer) => retainer.character_id === characterId).length;
  const errors = validateRetainerDrafts(character, [draft], currentCount);
  if (errors.length) {
    alert(errors.join("\n"));
    return;
  }
  const { error } = await supabase.from("retainers").insert({ character_id: characterId, ...draft });
  if (error) {
    alert(error.message);
    return;
  }
  clearRetainerDraft(characterId);
  await recordActivity("add_retainer", "retainers", characterId, { name: draft.name });
  await loadAll();
}

async function deleteRetainer(retainerId, retainerName) {
  const retainer = state.data.retainers.find((item) => item.id === retainerId);
  const character = retainer ? state.data.characters.find((item) => item.id === retainer.character_id) : null;
  if (!retainer || !character || !canEditCharacterRetainers(character)) return;
  if (!confirm(`确定删除亲信“${retainerName || retainer.name}”吗？相关职位任命也会被清除。`)) return;
  const { error } = await supabase.rpc("delete_retainer", { retainer_uuid: retainerId });
  if (error) {
    alert(error.message);
    return;
  }
  clearRetainerDraft(character.id, [retainerId]);
  await recordActivity("delete_retainer", "retainers", retainerId, { name: retainer.name });
  await loadAll();
}

function retainerDraftFromInputs(retainerId) {
  return {
    name: root.querySelector(`[data-retainer-name="${retainerId}"]`)?.value.trim() ?? "",
    gender: root.querySelector(`[data-retainer-gender="${retainerId}"]`)?.value ?? "",
    age: Number(root.querySelector(`[data-retainer-age="${retainerId}"]`)?.value ?? 0),
    notes: root.querySelector(`[data-retainer-notes="${retainerId}"]`)?.value.trim() ?? "",
  };
}

function newRetainerDraft(characterId) {
  return {
    name: root.querySelector(`[data-new-retainer-name="${characterId}"]`)?.value.trim() ?? "",
    gender: root.querySelector(`[data-new-retainer-gender="${characterId}"]`)?.value ?? "",
    age: Number(root.querySelector(`[data-new-retainer-age="${characterId}"]`)?.value ?? 0),
    notes: root.querySelector(`[data-new-retainer-notes="${characterId}"]`)?.value.trim() ?? "",
  };
}

function validateRetainerDrafts(character, drafts, existingCount = 0) {
  const errors = [];
  const limit = retainerLimitForCharacter(character);
  if (Number.isFinite(limit) && existingCount + drafts.length > limit) {
    errors.push(`亲信数量超出上限：当前 ${existingCount + drafts.length} 个，上限 ${limit} 个。`);
  }
  drafts.forEach((draft, index) => {
    if (!draft.name) errors.push(`第 ${index + 1} 个亲信缺少姓名。`);
    if (!["男", "女", "其他"].includes(draft.gender)) errors.push(`第 ${index + 1} 个亲信性别只能选择男、女或其他。`);
    if (!Number.isInteger(draft.age) || draft.age <= 0) errors.push(`第 ${index + 1} 个亲信年龄必须是正整数。`);
  });
  return errors;
}

async function deleteAction(actionId, actionTitle) {
  if (state.profile.role !== "dm") return;
  if (!confirm(`确定删除行动“${actionTitle || "未命名行动"}”吗？`)) return;
  const { error } = await supabase.from("actions").delete().eq("id", actionId);
  if (error) alert(error.message);
  else {
    await recordActivity("delete_action", "actions", actionId, { title: actionTitle });
    await loadAll();
  }
}

async function deleteDuplicateActions(actionIds, actionTitle) {
  if (state.profile.role !== "dm") return;
  const ids = String(actionIds ?? "").split(",").filter(Boolean);
  if (!ids.length) return;
  if (!confirm(`确定删除行动“${actionTitle || "未命名行动"}”的 ${ids.length} 条重复项吗？`)) return;
  const { error } = await supabase.from("actions").delete().in("id", ids);
  if (error) alert(error.message);
  else {
    await recordActivity("delete_duplicate_actions", "actions", null, { title: actionTitle, count: ids.length });
    await loadAll();
  }
}

function validateCharacterDraft(character, attributes, publicTraits, secretTraits, pursuit, retainers, ownerId) {
  const errors = [];
  if (!character.name) errors.push("姓名不能为空。");
  if (!["男", "女", "其他"].includes(character.gender)) errors.push("性别只能选择男、女或其他。");
  if (!pursuit || !PURSUITS.includes(pursuit)) errors.push("必须选择一个人生追求。");
  const attributeErrors = validateAttributes(character, attributes, publicTraits);
  errors.push(...attributeErrors);
  const cost = traitCost(publicTraits, secretTraits, character.faction_id, ownerId);
  if (cost > 4) errors.push(`特质点超支：当前 ${cost} 点，最多 4 点。`);
  if (publicTraits.includes("资本家") && publicTraits.includes("苦行僧")) {
    errors.push("资本家和苦行僧的财富范围冲突，不能同时选择。");
  }
  for (const [name, , req] of PUBLIC_TRAITS) {
    if (publicTraits.includes(name) && !meetsRequirement(req, character, attributes)) {
      errors.push(`${name} 不满足前置：${traitRequirementLabel(req)}。`);
    }
  }
  const retainerLimit = Math.floor((Number(attributes.charm) + Number(adjustedPrestige(attributes.prestige, publicTraits))) / 50);
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
  const coreStats = ["body", "willpower", "wealth", "charm", "intellect", "prestige", "perception"];
  const labels = { body: "体质", willpower: "意志", wealth: "财富", charm: "魅力", intellect: "智力", prestige: "威望", perception: "感知" };
  const sum = coreStats.reduce((total, key) => total + Number(attributes[key] ?? 0), 0);
  if (sum !== 400) errors.push(`七项属性点合计必须为 400；当前为 ${sum}。`);
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
  return combinedTraitEffects(publicTraits).wealthRange;
}

function combinedTraitEffects(publicTraits) {
  const effects = { prestige: 0, scandalDelta: 0, actionBonus: 0, wealthRange: [40, 80] };
  for (const trait of publicTraits) {
    const effect = TRAIT_EFFECTS[trait];
    if (!effect) continue;
    effects.prestige += Number(effect.prestige ?? 0);
    effects.scandalDelta += Number(effect.scandalDelta ?? 0);
    effects.actionBonus += Number(effect.actionBonus ?? 0);
    if (effect.wealthRange) effects.wealthRange = effect.wealthRange;
  }
  return effects;
}

function adjustedPrestige(basePrestige, publicTraits) {
  return Math.max(0, Number(basePrestige ?? 0) + combinedTraitEffects(publicTraits).prestige);
}

function updateNumberBounds(form, name, min, max) {
  const input = form.elements[name];
  if (!input) return;
  input.min = String(min);
  input.max = String(max);
}

function inRange(value, min, max) {
  const number = Number(value);
  return Number.isFinite(number) && number >= min && number <= max;
}

function traitCost(publicTraits, secretTraits, factionId, ownerId = "") {
  let total = 0;
  for (const trait of publicTraits) total += PUBLIC_TRAITS.find(([name]) => name === trait)?.[1] ?? 0;
  for (const trait of secretTraits) {
    const baseCost = SECRET_TRAITS.find(([name]) => name === trait)?.[1] ?? 0;
    total += effectiveTraitCost(trait, baseCost, factionId, ownerId);
  }
  return total;
}

function effectiveTraitCost(trait, baseCost, factionId, ownerId = "") {
  if (hasFreeContactTrait(trait, ownerId)) return 0;
  if (trait === "工会联系" && !hasUnionContactDiscount(factionId, ownerId)) return 2;
  return baseCost;
}

function hasUnionContactDiscount(factionId, ownerId = "") {
  return profileDisplayName(ownerId) === "player1";
}

function hasFreeContactTrait(trait, ownerId = "") {
  const displayName = profileDisplayName(ownerId).toLowerCase();
  return (trait === "卡兰克联系" && displayName === "player3") ||
    (trait === "罗伊尔联系" && displayName === "player4");
}

function traitCostLabel(cost) {
  return `${cost >= 0 ? cost : "+" + Math.abs(cost)}点`;
}

function refreshTraitCostLabels(form, factionId, ownerId = "") {
  form.querySelectorAll("[data-trait-cost-label]").forEach((label) => {
    const checkbox = label.closest("label")?.querySelector("input[type='checkbox']");
    if (!checkbox) return;
    const baseCost = Number(checkbox.dataset.cost ?? 0);
    label.textContent = traitCostLabel(effectiveTraitCost(checkbox.value, baseCost, factionId, ownerId));
  });
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

function linesFromText(text) {
  return String(text ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function skillValuesFromForm(data) {
  const skills = {};
  for (const [key, value] of data.entries()) {
    if (!key.startsWith("skill_")) continue;
    skills[key.slice("skill_".length)] = Number(value ?? 10);
  }
  return skills;
}

function scandalsFromText(text) {
  return linesFromText(text).map((line) => {
    const [severity = "可大可小", ...rest] = line.split(/[|｜]/);
    return {
      severity: severity.trim() || "可大可小",
      text: rest.join("｜").trim(),
      added_at: new Date().toISOString(),
    };
  }).filter((item) => item.text);
}

function scandalLines(scandals) {
  if (!Array.isArray(scandals)) return [];
  return scandals.map((item) => {
    if (Array.isArray(item)) return `${item[0] ?? "可大可小"}｜${item[1] ?? ""}`;
    return `${item.severity ?? "可大可小"}｜${item.text ?? ""}`;
  }).filter((line) => !line.endsWith("｜"));
}

async function advancePhase() {
  return shiftPhase(1);
}

async function previousPhase() {
  return shiftPhase(-1);
}

async function shiftPhase(direction) {
  const current = state.data.state?.current_phase ?? "turn_start";
  const index = PHASES.findIndex(([key]) => key === current);
  const safeIndex = index >= 0 ? index : 0;
  const currentTurn = Number(state.data.state?.current_turn ?? 1);
  const nextIndex = (safeIndex + direction + PHASES.length) % PHASES.length;
  const next = PHASES[nextIndex][0];
  const patch = { current_phase: next };
  if (direction > 0 && next === "turn_start") patch.current_turn = currentTurn + 1;
  if (direction < 0 && safeIndex === 0) patch.current_turn = Math.max(1, currentTurn - 1);
  const { error } = await supabase.from("game_state").update(patch).eq("id", true);
  if (error) alert(error.message);
  else {
    await recordActivity(direction > 0 ? "advance_phase" : "previous_phase", "game_state", null, {
      phase: phaseLabel(next),
      turn: patch.current_turn ?? currentTurn,
    });
    loadAll();
  }
}

async function savePhase() {
  const turn = Math.max(1, Number(document.getElementById("dm-turn")?.value ?? 1));
  const phase = document.getElementById("dm-phase")?.value ?? "turn_start";
  const { error } = await supabase.from("game_state").update({ current_turn: turn, current_phase: phase }).eq("id", true);
  if (error) alert(error.message);
  else {
    await recordActivity("save_phase", "game_state", null, { phase: phaseLabel(phase), turn });
    loadAll();
  }
}

async function resetTurn() {
  if (!confirm("确定要把回合重置为第1回合 / 回合开始吗？")) return;
  const { error } = await supabase.from("game_state").update({ current_turn: 1, current_phase: "turn_start" }).eq("id", true);
  if (error) alert(error.message);
  else {
    await recordActivity("reset_turn", "game_state", null, { phase: phaseLabel("turn_start"), turn: 1 });
    loadAll();
  }
}

async function saveState() {
  const legitimacyModifier = Number(document.getElementById("legitimacy-modifier")?.value ?? 0);
  const economyStatus = document.getElementById("economy-status")?.value.trim() || "一切如常";
  const budgetStatus = document.getElementById("budget-status")?.value ?? state.data.state?.budget_status ?? "平衡";
  const stateUpdate = await supabase
    .from("game_state")
    .update({ legitimacy_modifier: legitimacyModifier, economy_status: economyStatus, budget_status: budgetStatus })
    .eq("id", true);
  if (stateUpdate.error) {
    alert(stateUpdate.error.message);
    return;
  }
  const moodUpdates = Array.from(root.querySelectorAll("[data-mood-group]")).map((input) =>
    supabase.from("social_groups").update({ mood: clampMood(input.value) }).eq("id", input.dataset.moodGroup)
  );
  const patienceUpdates = Array.from(root.querySelectorAll("[data-foreign-power]")).map((input) =>
    supabase.from("foreign_powers").update({ patience: clampPatience(input.value) }).eq("id", input.dataset.foreignPower)
  );
  const results = await Promise.all([...moodUpdates, ...patienceUpdates]);
  const stateDetailError = results.find((result) => result.error)?.error;
  if (stateDetailError) alert(stateDetailError.message);
  else {
    await recordActivity("save_state", "game_state", null, {
      legitimacy_modifier: legitimacyModifier,
      economy_status: economyStatus,
      budget_status: budgetStatus,
    });
    loadAll();
  }
}

async function savePolicyChange(policyKey) {
  const select = Array.from(root.querySelectorAll("[data-policy-draft]")).find((item) => item.dataset.policyDraft === policyKey);
  if (!select) return;
  const current = select.dataset.current;
  const next = select.value;
  if (next === current) {
    alert("政策没有变化。");
    return;
  }
  const [policyLabel, options] = POLICY_CATALOG[policyKey] ?? [policyKey, {}];
  if (!confirm(`确认将${policyLabel}改为「${options[next] ?? next}」吗？`)) {
    select.value = current;
    return;
  }
  const policyUpdate = await supabase.from("current_policies").update({ option_key: next }).eq("policy_key", policyKey);
  if (policyUpdate.error) {
    alert(policyUpdate.error.message);
    return;
  }
  const effectError = await applyPolicyConsequences(current, next);
  if (effectError) alert(effectError.message ?? String(effectError));
  else {
    await recordActivity("change_policy", "current_policies", null, {
      policy: policyLabel,
      from: options[current] ?? current,
      to: options[next] ?? next,
    });
    loadAll();
  }
}

async function applyPolicyConsequences(previousOption, nextOption) {
  const deltas = policyConsequenceDeltas(previousOption, nextOption);
  const updates = [];
  if (deltas.budget !== 0) {
    updates.push(supabase.from("game_state").update({ budget_status: shiftBudget(state.data.state?.budget_status ?? "平衡", deltas.budget) }).eq("id", true));
  }
  for (const [groupName, delta] of deltas.moods) {
    const group = state.data.groups.find((item) => item.name === groupName);
    if (!group || delta === 0) continue;
    updates.push(supabase.from("social_groups").update({ mood: clampMood(Number(group.mood) + delta) }).eq("id", group.id));
  }
  const results = await Promise.all(updates);
  return results.find((result) => result.error)?.error ?? null;
}

function policyConsequenceDeltas(previousOption, nextOption) {
  const moods = new Map();
  let budget = 0;
  const addMood = (name, delta) => moods.set(name, (moods.get(name) ?? 0) + delta);
  const apply = (option, direction) => {
    const effect = POLICY_EFFECTS[option];
    if (!effect) return;
    budget += Number(effect.budget ?? 0) * direction;
    for (const name of effect.please ?? []) addMood(name, direction);
    for (const name of effect.anger ?? []) addMood(name, -direction);
  };
  apply(previousOption, -1);
  apply(nextOption, 1);
  return { budget, moods };
}

function shiftBudget(currentStatus, delta) {
  const index = BUDGET_LEVELS.includes(currentStatus) ? BUDGET_LEVELS.indexOf(currentStatus) : BUDGET_LEVELS.indexOf("平衡");
  const nextIndex = Math.max(0, Math.min(BUDGET_LEVELS.length - 1, index + delta));
  return BUDGET_LEVELS[nextIndex];
}

function clampMood(value) {
  return Math.max(-2, Math.min(2, Math.round(Number(value) || 0)));
}

function clampPatience(value) {
  return Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
}

async function assignPosition() {
  const [entityType, entityId] = document.getElementById("assign-entity").value.split(":");
  const positionId = document.getElementById("assign-position").value;
  const cleared = await supabase.from("position_assignments").delete().eq("position_id", positionId);
  if (cleared.error) {
    alert(cleared.error.message);
    return;
  }
  const { error } = await supabase.from("position_assignments").insert({ entity_type: entityType, entity_id: entityId, position_id: positionId });
  if (error) alert(error.message);
  else {
    const position = state.data.positions.find((item) => item.id === positionId);
    await recordActivity("assign_position", "position_assignments", null, { name: position?.name ?? "" });
    loadAll();
  }
}

async function saveSupporters() {
  const factions = sortedPoliticalFactions().filter((faction) => faction.key !== "unaligned");
  const updates = factions.map((faction) => {
    const supporters = Array.from(root.querySelectorAll(`[data-faction-supporter="${faction.id}"]:checked`))
      .map((input) => input.value);
    return supabase.from("factions").update({ supporters }).eq("id", faction.id);
  });
  const results = await Promise.all(updates);
  const error = results.find((result) => result.error)?.error;
  if (error) {
    alert(error.message);
    return;
  }
  await recordActivity("update_supporters", "factions");
  loadAll();
}

async function unassignPosition(assignmentId, assignmentName) {
  if (!confirm(`确定撤任「${assignmentName}」吗？`)) return;
  const { error } = await supabase.from("position_assignments").delete().eq("id", assignmentId);
  if (error) alert(error.message);
  else {
    await recordActivity("unassign_position", "position_assignments", assignmentId, { name: assignmentName });
    loadAll();
  }
}

async function createVote() {
  const issue = document.getElementById("vote-issue").value.trim();
  if (!issue) return;
  const rows = sortedPoliticalFactions().map((f) => ({
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
  else {
    await recordActivity("create_vote", "parliament_votes", null, { issue });
    loadAll();
  }
}

async function updateVote(id, field, currentValue) {
  const row = state.data.votes.find((vote) => vote.id === id);
  if (!row) return;
  const seats = Math.max(0, Number(row.seats ?? 0));
  const patch = normalizeVoteValues({
    yes_votes: Number(row.yes_votes ?? 0),
    no_votes: Number(row.no_votes ?? 0),
    abstain_votes: Number(row.abstain_votes ?? seats),
    [field]: Number(currentValue),
  }, seats, field);
  if (Object.values(patch).some((value) => Number.isNaN(value))) return;
  const { error } = await supabase.from("parliament_votes").update(patch).eq("id", id);
  if (error) alert(error.message);
  else {
    await recordActivity("update_vote", "parliament_votes", id, { issue: row.issue });
    loadAll();
  }
}

async function settleVote(idsText) {
  const ids = voteIdsFromText(idsText);
  const rows = state.data.votes.filter((vote) => ids.includes(vote.id));
  if (!rows.length) return;
  const totals = voteTotals(rows);
  const verdict = totals.yes > totals.no ? "通过" : totals.yes < totals.no ? "否决" : "僵持";
  const issue = rows[0]?.issue ?? "未命名议案";
  const defaultSummary = `${issue}：${verdict}。赞成 ${totals.yes}，反对 ${totals.no}，弃权 ${totals.abstain}。`;
  const summary = prompt("议会投票结算", defaultSummary);
  if (summary === null) return;
  const { error } = await supabase.from("parliament_votes").update({ notes: summary.trim() || defaultSummary }).in("id", ids);
  if (error) alert(error.message);
  else {
    await recordActivity("settle_vote", "parliament_votes", null, { issue, status: verdict });
    loadAll();
  }
}

async function deleteVote(idsText, issue) {
  const ids = voteIdsFromText(idsText);
  if (!ids.length) return;
  if (!confirm(`确定删除议案“${issue || "未命名议案"}”的整组投票吗？`)) return;
  const { error } = await supabase.from("parliament_votes").delete().in("id", ids);
  if (error) alert(error.message);
  else {
    await recordActivity("delete_vote", "parliament_votes", null, { issue });
    loadAll();
  }
}

function voteIdsFromText(idsText) {
  return String(idsText ?? "").split(",").map((id) => id.trim()).filter(Boolean);
}

function normalizeVoteValues(values, seats, changedField) {
  const clamp = (value, min, max) => Math.min(max, Math.max(min, Math.round(Number(value) || 0)));
  let yes = clamp(values.yes_votes, 0, seats);
  let no = clamp(values.no_votes, 0, seats);
  let abstain = clamp(values.abstain_votes, 0, seats);

  if (changedField === "yes_votes") {
    no = Math.min(no, seats - yes);
    abstain = seats - yes - no;
  } else if (changedField === "no_votes") {
    yes = Math.min(yes, seats - no);
    abstain = seats - yes - no;
  } else {
    const remaining = seats - abstain;
    yes = Math.min(yes, remaining);
    no = Math.min(no, remaining - yes);
    yes += remaining - yes - no;
  }

  return { yes_votes: yes, no_votes: no, abstain_votes: abstain };
}

async function processAction(id) {
  const action = state.data.actions.find((item) => item.id === id);
  if (!action || !isDm()) return;
  const resultPublic = action.action_kind === "private" ? "" : resultTextareaValue("public", id);
  const resultPrivate = resultTextareaValue("private", id);
  if (action.action_kind === "private" && !resultPrivate) {
    alert("私人行动必须填写结果；不处理就先留在待处理行动里。");
    return;
  }
  if (action.action_kind === "government" && !resultPublic && !resultPrivate) {
    alert("政府行动请至少填写公开结果或私密结果；不处理就先留在待处理行动里。");
    return;
  }
  const { error } = await supabase
    .from("actions")
    .update({ status: "processed", result_public: resultPublic, result_private: resultPrivate, processed_at: new Date().toISOString() })
    .eq("id", id);
  if (error) alert(error.message);
  else {
    await recordActivity("process_action", "actions", id, { title: action?.title ?? "" });
    loadAll();
  }
}

async function reopenAction(id) {
  const action = state.data.actions.find((item) => item.id === id);
  if (!action || !isDm() || action.status !== "processed") return;
  const nextStatus = action.action_kind === "government" && action.requires_approval ? "approved" : "submitted";
  if (!confirm(`确定撤回行动“${action.title || "未命名行动"}”的处理结果，恢复为${statusLabel(nextStatus)}吗？`)) return;
  const { error } = await supabase
    .from("actions")
    .update({ status: nextStatus, processed_at: null })
    .eq("id", id);
  if (error) alert(error.message);
  else {
    await recordActivity("reopen_action", "actions", id, { title: action.title ?? "", status: statusLabel(nextStatus) });
    loadAll();
  }
}

function resultTextareaValue(kind, actionId) {
  const textarea = Array.from(root.querySelectorAll(`[data-result-${kind}]`)).find((item) => item.dataset[`result${kind[0].toUpperCase()}${kind.slice(1)}`] === actionId);
  return textarea?.value.trim() ?? "";
}

async function addRandomScandal() {
  const item = SCANDALS[Math.floor(Math.random() * SCANDALS.length)];
  await addScandalToSelected(item);
}

async function addSelectedScandal() {
  const index = Number(document.getElementById("scandal-preset")?.value ?? 0);
  await addScandalToSelected(SCANDALS[index] ?? SCANDALS[0]);
}

async function addCustomScandal() {
  const severity = document.getElementById("custom-scandal-severity")?.value.trim() || "可大可小";
  const text = document.getElementById("custom-scandal-text")?.value.trim();
  if (!text) {
    alert("请填写自定义黑料内容。");
    return;
  }
  await addScandalToSelected([severity, text]);
}

async function addScandalToSelected(item) {
  const characterId = document.getElementById("scandal-character")?.value;
  if (!characterId) return;
  const stats = state.data.privateStats.find((row) => row.character_id === characterId);
  if (!stats) {
    alert("找不到该角色的私密卡。");
    return;
  }
  const scandals = Array.isArray(stats.scandals) ? stats.scandals : [];
  const next = [
    ...scandals,
    { severity: item[0], text: item[1], added_at: new Date().toISOString() },
  ];
  const { error } = await supabase
    .from("character_private")
    .update({ scandals: next, scandal_count: next.length })
    .eq("character_id", characterId);
  if (error) alert(error.message);
  else {
    const character = state.data.characters.find((item) => item.id === characterId);
    await recordActivity("add_scandal", "character_private", characterId, {
      name: character?.name ?? "",
      title: item[1],
      severity: item[0],
    });
    alert(`已给${character?.name ?? "该角色"}添加黑料：${item[0]}：${item[1]}`);
    loadAll();
  }
}

function metric(label, value) {
  return `<div class="metric"><span>${escapeHtml(label)}</span><strong>${escapeHtml(String(value ?? "-"))}</strong></div>`;
}

function statGrid(stats) {
  const labels = { body: "体质", willpower: "意志", wealth: "财富", charm: "魅力", intellect: "智力", prestige: "威望", perception: "感知", luck: "幸运" };
  return `<div class="statGrid compact">${Object.entries(labels).map(([key, label]) => metric(label, stats[key])).join("")}</div>`;
}

function skillGrid(stats) {
  const skills = typeof stats.skills === "object" && stats.skills ? stats.skills : {};
  const skillNames = Array.from(new Set(["谈判", "演讲", "写作", "法律", "会计", ...Object.keys(skills)]));
  const skillValues = skillNames.map((name) => Number(skills[name] ?? 10));
  const spent = skillValues.reduce((total, value) => total + Math.max(0, value - 10), 0);
  const budget = Number(stats.intellect ?? 0) * 2;
  return `
    <div class="privateBlockHeader">
      <span>技能</span>
      <b>已用 ${spent} / ${budget}，剩余 ${budget - spent}</b>
    </div>
    <div class="statGrid compact">${skillNames.map((name, index) => metric(name, skillValues[index])).join("")}</div>
  `;
}

function tagBlock(title, items = []) {
  if (!items?.length) return "";
  return `<div class="tagBlock"><span>${escapeHtml(title)}</span><div>${items.map((item) => `<b>${escapeHtml(item)}</b>`).join("")}</div></div>`;
}

function actionCard(action) {
  const canSeePrivate = isDm() || action.owner_id === state.profile.id;
  const isPrivateAction = action.action_kind === "private";
  const privateLabel = isPrivateAction ? "结果（仅DM和本人可见）" : "私密结果（仅DM和提交者可见）";
  const submitButton = canSubmitDraftAction(action)
    ? `<button class="primaryButton" data-submit-draft="${action.id}" type="button">${isDm() && action.owner_id !== state.profile.id ? "代提交草稿" : "提交草稿"}</button>`
    : "";
  const reopenButton = canReopenAction(action) ? `<button class="ghostButton" data-reopen-action="${action.id}" type="button">撤回处理</button>` : "";
  const deleteButton = isDm() ? `<button class="dangerButton" data-delete-action="${action.id}" data-action-title="${escapeAttr(action.title || "未命名行动")}" type="button">删除</button>` : "";
  const observerMeta = canObserve() ? `<span>提交者：${escapeHtml(actionOwnerLabel(action))} · 执行者：${escapeHtml(actionActorLabel(action))}</span>` : "";
  return `
    <article class="actionCard">
      <div class="actionHeader">
        <div><strong>${escapeHtml(action.title || "未命名行动")}</strong><span>${statusLabel(action.status)} · 第${action.turn_number}回合 · ${action.action_kind === "government" ? (action.visibility === "public" ? "公开政府行动" : "不公开政府行动") : "私人行动"}</span>${observerMeta}</div>
        ${submitButton || reopenButton || deleteButton ? `<div class="buttonRow">${submitButton}${reopenButton}${deleteButton}</div>` : ""}
      </div>
      <p>${escapeHtml(action.description)}</p>
      ${!isPrivateAction && action.result_public ? `<div class="resultBox"><strong>公开结果</strong><span>${escapeHtml(action.result_public)}</span></div>` : ""}
      ${canSeePrivate && action.result_private ? `<div class="resultBox private"><strong>${privateLabel}</strong><span>${escapeHtml(action.result_private)}</span></div>` : ""}
    </article>
  `;
}

function canReopenAction(action) {
  return isDm() && action.status === "processed";
}

function positionList() {
  const isDm = state.profile.role === "dm";
  const names = new Map([
    ...state.data.characters.map((c) => [`character:${c.id}`, c.name]),
    ...state.data.retainers.map((r) => [`retainer:${r.id}`, r.name]),
    ...assignablePeople().map((person) => [`person:${personEntityId(person.name)}`, person.name]),
  ]);
  const assignmentsByPosition = new Map();
  for (const assignment of state.data.assignments) {
    const list = assignmentsByPosition.get(assignment.position_id) ?? [];
    list.push({
      id: assignment.id,
      name: names.get(`${assignment.entity_type}:${assignment.entity_id}`) ?? "未知",
    });
    assignmentsByPosition.set(assignment.position_id, list);
  }
  return `
    <div class="positionList">
      ${state.data.positions.filter((p) => p.is_government).map((p) => {
        const holders = assignmentsByPosition.get(p.id);
        return `
          <div class="positionRow ${holders?.length ? "" : "vacant"}">
            <strong>${escapeHtml(p.name)}</strong>
            ${holders?.length ? `
              <span class="positionHolders">
                ${holders.map((holder) => `
                  <span class="positionHolder">
                    ${escapeHtml(holder.name)}
                    ${isDm ? `<button class="iconButton dangerMini" type="button" title="撤任" data-unassign-position="${holder.id}" data-assignment-name="${escapeAttr(holder.name)}">×</button>` : ""}
                  </span>
                `).join("")}
              </span>
            ` : `<span>无</span>`}
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function entityOptions() {
  return [
    ...state.data.characters.map((c) => [`character:${c.id}`, `PC：${c.name}`]),
    ...state.data.retainers.map((r) => [`retainer:${r.id}`, `亲信：${r.name}`]),
    ...assignablePeople().map((person) => [`person:${personEntityId(person.name)}`, `人物：${person.name}`]),
  ].map(([value, label]) => `<option value="${value}">${escapeHtml(label)}</option>`).join("");
}

function calculateLegitimacyBreakdown() {
  const entries = [];
  const add = (label, value) => entries.push({ label, value: roundTenth(value) });
  const base = Number(state.data.state?.legitimacy_base ?? 40);
  add("基础合法性", base);

  const budgetValues = { "耗尽": -10, "缺乏": -5, "平衡": 0, "盈余": 5, "充沛": 10 };
  const budgetStatus = state.data.state?.budget_status ?? "平衡";
  add(`国家预算：${budgetStatus}`, budgetValues[budgetStatus] ?? 0);

  for (const policy of state.data.policies) {
    const key = `${policy.policy_key}.${policy.option_key}`;
    const value = POLICY_LEGITIMACY[key] ?? 0;
    if (value) add(`政策：${policyOptionName(policy)}`, value);
  }

  addRegimeLegitimacy(entries);
  addFactionLegitimacy(entries);

  for (const group of state.data.groups) {
    const mood = Number(group.mood);
    if (mood === 2) add(`满意群体：${group.name}`, 5);
    if (mood === -2) add(`愤怒群体：${group.name}`, -5);
  }

  const dmModifier = Number(state.data.state?.legitimacy_modifier ?? 0);
  if (dmModifier) add("DM修正", dmModifier);

  const total = roundTenth(entries.reduce((sum, entry) => sum + entry.value, 0));
  return { total, entries };
}

function addRegimeLegitimacy(entries) {
  const regime = currentPolicyOption("regime");
  const addPrestige = (positionKey, label, perPoint = false) => {
    const holder = positionHolder(positionKey);
    if (!holder) {
      entries.push({ label: `${label}空缺`, value: 0 });
      return;
    }
    const prestige = entityPrestige(holder);
    const value = perPoint ? prestige - 50 : Math.trunc((prestige - 50) / 5);
    entries.push({
      label: `${label}威望 ${prestige}`,
      value: roundTenth(value),
      hidden: ["duke", "prime_minister"].includes(positionKey),
    });
  };

  if (regime === "dual_monarchy") {
    addPrestige("duke", "公爵");
    addPrestige("prime_minister", "首相");
  }
  if (regime === "ceremonial_monarchy") addPrestige("prime_minister", "首相");
  if (regime === "presidential_republic") addPrestige("prime_minister", "首相", true);
  if (regime === "military_government") addPrestige("war_minister", "战争部长", true);
}

function addFactionLegitimacy(entries) {
  const civilService = currentPolicyOption("civil_service");
  const positiveMultiplier = civilService === "bureaucrats_in_politics" || civilService === "free_participation" ? 2 : 1;
  const absentMultiplier = civilService === "free_participation" ? 2 : 1;
  const counts = governmentFactionCounts();

  for (const faction of state.data.factions.filter((f) => f.faction_type === "political" && f.key !== "unaligned")) {
    const count = counts.get(faction.id) ?? 0;
    const influence = Number(faction.influence ?? 0);
    if (count > 0) {
      entries.push({
        label: `${faction.short_name}入阁 ${count} 人`,
        value: roundTenth((influence / 8) * count * positiveMultiplier),
      });
    } else {
      entries.push({
        label: `${faction.short_name}未入阁`,
        value: roundTenth(-(influence / 2) * absentMultiplier),
      });
    }
  }
}

function governmentFactionCounts() {
  const counts = new Map();
  for (const assignment of state.data.assignments) {
    const position = assignment.positions;
    if (!position?.is_government || position.key === "duke") continue;
    const factionId = entityFactionId(assignment);
    if (!factionId) continue;
    counts.set(factionId, (counts.get(factionId) ?? 0) + 1);
  }
  return counts;
}

function positionHolder(positionKey) {
  return state.data.assignments.find((assignment) => assignment.positions?.key === positionKey) ?? null;
}

function entityFactionId(entity) {
  if (entity.entity_type === "character") {
    return state.data.characters.find((character) => character.id === entity.entity_id)?.faction_id ?? null;
  }
  if (entity.entity_type === "person") {
    const person = personByEntityId(entity.entity_id);
    const factionKeyForPerson = person ? PERSON_FACTION_KEYS[person.name] : "";
    return state.data.factions.find((faction) => faction.key === factionKeyForPerson)?.id ?? null;
  }
  const retainer = state.data.retainers.find((item) => item.id === entity.entity_id);
  if (!retainer) return null;
  return state.data.characters.find((character) => character.id === retainer.character_id)?.faction_id ?? null;
}

function entityPrestige(entity) {
  if (entity.entity_type === "character") {
    const character = state.data.characters.find((item) => item.id === entity.entity_id);
    return Number(character?.prestige ?? 20);
  }
  return 50;
}

function currentPolicyOption(policyKey) {
  return state.data.policies.find((policy) => policy.policy_key === policyKey)?.option_key ?? "";
}

function policyOptionName(policy) {
  const [label, options] = POLICY_CATALOG[policy.policy_key] ?? [policy.policy_key, {}];
  return `${label}：${options[policy.option_key] ?? policy.option_key}`;
}

function roundTenth(value) {
  return Math.round(Number(value) * 10) / 10;
}

function formatSigned(value) {
  const rounded = roundTenth(value);
  return rounded > 0 ? `+${rounded}` : String(rounded);
}

function isGovernmentHead() {
  return isGovernmentHeadForOwner(state.profile.id);
}

function isGovernmentHeadForOwner(ownerId) {
  const ownCharacters = new Set(state.data.characters.filter((c) => c.owner_id === ownerId).map((c) => c.id));
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

function sortedPoliticalFactions() {
  return state.data.factions
    .filter((faction) => faction.faction_type === "political")
    .slice()
    .sort((a, b) => factionOrder(a.id) - factionOrder(b.id) || Number(b.influence ?? 0) - Number(a.influence ?? 0) || a.short_name.localeCompare(b.short_name, "zh-Hans-CN"));
}

function sortedVoteRows(rows) {
  return rows.slice().sort((a, b) => factionOrder(a.faction_id) - factionOrder(b.faction_id));
}

function factionOrder(id) {
  const faction = state.data.factions.find((item) => item.id === id);
  return Number(faction?.sort_order ?? 999);
}

function voteClassOrder(value) {
  return { yes: 0, no: 1, abstain: 2, neutral: 3 }[value] ?? 9;
}

function characterOptions() {
  return state.data.characters
    .filter((character) => character.active !== false)
    .map((character) => `<option value="${character.id}">${escapeHtml(character.name)} / ${escapeHtml(factionName(character.faction_id))}</option>`)
    .join("");
}

function canOwnerCreateCharacter(ownerId) {
  const profile = state.data.profiles.find((item) => item.id === ownerId);
  if (profile?.role === "dm") return true;
  return !state.data.characters.some((character) => character.owner_id === ownerId && character.active !== false);
}

function scandalLabels(scandals) {
  if (!Array.isArray(scandals)) return [];
  return scandals.map((item) => {
    if (Array.isArray(item)) return `${item[0]}：${item[1]}`;
    return `${item.severity ?? "黑料"}：${item.text ?? ""}`;
  }).filter((text) => text.trim() !== "：");
}

function canDeleteCharacter(character) {
  return isDm() || (isPlayer() && character.owner_id === state.profile.id);
}

function canEditCharacterRetainers(character) {
  return isDm() || (isPlayer() && character.owner_id === state.profile.id);
}

function retainerLimitForCharacter(character) {
  const stats = state.data.privateStats.find((item) => item.character_id === character.id);
  if (!stats) return Infinity;
  return Math.floor((Number(stats.charm ?? 0) + Number(character.prestige ?? stats.prestige ?? 20)) / 50);
}

function defaultCharacterOwnerId() {
  if (!isDm()) return state.profile.id;
  const player1 = state.data.profiles?.find((profile) => profile.display_name === "player1" && canOwnerCreateCharacter(profile.id));
  return player1?.id ?? state.profile.id;
}

function defaultCharacterFactionId(ownerId) {
  const preferredKey = profileDisplayName(ownerId) === "player1" ? "social_democrats" : "";
  const preferred = state.data.factions.find((faction) => faction.key === preferredKey);
  return preferred?.id ?? state.data.factions.find((faction) => faction.faction_type === "political" && faction.key !== "unaligned")?.id ?? "";
}

function characterCreateFactionOptions(selectedFactionId) {
  return state.data.factions
    .filter((faction) => faction.faction_type === "political" && faction.key !== "unaligned")
    .map((faction) => `<option value="${faction.id}" ${faction.id === selectedFactionId ? "selected" : ""}>${escapeHtml(faction.short_name)}</option>`)
    .join("");
}

function profileDisplayName(ownerId) {
  if (ownerId === state.profile.id) return state.profile.display_name;
  return state.data.profiles?.find((profile) => profile.id === ownerId)?.display_name ?? "";
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
