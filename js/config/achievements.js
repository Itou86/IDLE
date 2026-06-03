/* ===== 成就配置 ===== */
const ACHIEVEMENT_CONFIG = {
    // 成就奖励公式：每解锁 N 个成就，战力 +N%
    // 例如：解锁 10 个 → +10% 战力，解锁 50 个 → +50% 战力
    powerBonusPerAchievement: 1, // 每个成就 +1% 基础战力

    // 成就列表
    list: [
        // === 数值成就：系统点累计 ===
        { id: 'num_001', name: '初入轮回', desc: '累计获得100系统点', condition: { type: 'points_total', value: 100 }, reward: { powerBonus: 1 }, hidden: false },
        { id: 'num_002', name: '位面积蓄', desc: '累计获得500系统点', condition: { type: 'points_total', value: 500 }, reward: { powerBonus: 1 }, hidden: false },
        { id: 'num_003', name: '次元积累', desc: '累计获得2,000系统点', condition: { type: 'points_total', value: 2000 }, reward: { powerBonus: 1 }, hidden: false },
        { id: 'num_004', name: '万界富豪', desc: '累计获得10,000系统点', condition: { type: 'points_total', value: 10000 }, reward: { powerBonus: 1 }, hidden: false },
        { id: 'num_005', name: '系统眷顾', desc: '累计获得5万系统点', condition: { type: 'points_total', value: 50000 }, reward: { powerBonus: 1 }, hidden: false },
        { id: 'num_006', name: '系统点大亨', desc: '累计获得100万系统点', condition: { type: 'points_total', value: 1000000 }, reward: { powerBonus: 2 }, hidden: false },
        { id: 'num_007', name: '无限富者', desc: '累计获得1亿系统点', condition: { type: 'points_total', value: 100000000 }, reward: { powerBonus: 3 }, hidden: false },
        { id: 'num_008', name: '位面之主', desc: '累计获得100亿系统点', condition: { type: 'points_total', value: 10000000000 }, reward: { powerBonus: 5 }, hidden: false },
        { id: 'num_009', name: '次元财神', desc: '累计获得10亿系统点', condition: { type: 'points_total', value: 1000000000 }, reward: { powerBonus: 4 }, hidden: false },
        { id: 'num_00a', name: '万界金库', desc: '累计获得1000亿系统点', condition: { type: 'points_total', value: 100000000000 }, reward: { powerBonus: 5 }, hidden: false },
        { id: 'num_00b', name: '无限财富', desc: '累计获得1万亿系统点', condition: { type: 'points_total', value: 1000000000000 }, reward: { powerBonus: 5 }, hidden: false },

        // === 数值成就：抽卡次数 ===
        { id: 'num_010', name: '首次次元抽取', desc: '进行首次抽卡', condition: { type: 'gacha_count', value: 1 }, reward: { powerBonus: 1 }, hidden: false },
        { id: 'num_011', name: '次元漫步者', desc: '累计抽卡5次', condition: { type: 'gacha_count', value: 5 }, reward: { powerBonus: 1 }, hidden: false },
        { id: 'num_012', name: '次元猎人', desc: '累计抽卡25次', condition: { type: 'gacha_count', value: 25 }, reward: { powerBonus: 1 }, hidden: false },
        { id: 'num_013', name: '次元行者', desc: '累计抽卡50次', condition: { type: 'gacha_count', value: 50 }, reward: { powerBonus: 1 }, hidden: false },
        { id: 'num_014', name: '次元撕裂者', desc: '累计抽卡100次', condition: { type: 'gacha_count', value: 100 }, reward: { powerBonus: 2 }, hidden: false },
        { id: 'num_015', name: '次元主宰', desc: '累计抽卡500次', condition: { type: 'gacha_count', value: 500 }, reward: { powerBonus: 2 }, hidden: false },
        { id: 'num_016', name: '万界收集者', desc: '累计抽卡2,000次', condition: { type: 'gacha_count', value: 2000 }, reward: { powerBonus: 3 }, hidden: false },
        { id: 'num_017', name: '无限抽取', desc: '累计抽卡1万次', condition: { type: 'gacha_count', value: 10000 }, reward: { powerBonus: 5 }, hidden: false },
        { id: 'num_018', name: '次元漩涡', desc: '累计抽卡5,000次', condition: { type: 'gacha_count', value: 5000 }, reward: { powerBonus: 4 }, hidden: false },
        { id: 'num_019', name: '万界漩涡', desc: '累计抽卡5万次', condition: { type: 'gacha_count', value: 50000 }, reward: { powerBonus: 5 }, hidden: false },
        { id: 'num_01a', name: '无限漩涡', desc: '累计抽卡10万次', condition: { type: 'gacha_count', value: 100000 }, reward: { powerBonus: 5 }, hidden: false },

        // === 数值成就：竞技胜利 ===
        { id: 'num_020', name: '首次位面通关', desc: '赢得第一场竞技', condition: { type: 'battle_win', value: 1 }, reward: { powerBonus: 1 }, hidden: false },
        { id: 'num_021', name: '锋芒初现', desc: '累计获胜5场', condition: { type: 'battle_win', value: 5 }, reward: { powerBonus: 1 }, hidden: false },
        { id: 'num_022', name: '连胜传说', desc: '累计获胜25场', condition: { type: 'battle_win', value: 25 }, reward: { powerBonus: 1 }, hidden: false },
        { id: 'num_023', name: '位面征服者', desc: '累计获胜100场', condition: { type: 'battle_win', value: 100 }, reward: { powerBonus: 2 }, hidden: false },
        { id: 'num_024', name: '万界战神', desc: '累计获胜500场', condition: { type: 'battle_win', value: 500 }, reward: { powerBonus: 2 }, hidden: false },
        { id: 'num_025', name: '不败神话', desc: '累计获胜2,000场', condition: { type: 'battle_win', value: 2000 }, reward: { powerBonus: 3 }, hidden: false },
        { id: 'num_026', name: '位面之主', desc: '累计获胜1万场', condition: { type: 'battle_win', value: 10000 }, reward: { powerBonus: 5 }, hidden: false },
        { id: 'num_027', name: '战神传说', desc: '累计获胜5,000场', condition: { type: 'battle_win', value: 5000 }, reward: { powerBonus: 4 }, hidden: false },
        { id: 'num_028', name: '万界征服', desc: '累计获胜5万场', condition: { type: 'battle_win', value: 50000 }, reward: { powerBonus: 5 }, hidden: false },
        { id: 'num_029', name: '无限战神', desc: '累计获胜10万场', condition: { type: 'battle_win', value: 100000 }, reward: { powerBonus: 5 }, hidden: false },

        // === 数值成就：关卡进度 ===
        { id: 'num_030', name: '初探竞技', desc: '通过第1关', condition: { type: 'stage', value: 1 }, reward: { powerBonus: 1 }, hidden: false },
        { id: 'num_031', name: '稳步前进', desc: '通过第5关', condition: { type: 'stage', value: 5 }, reward: { powerBonus: 1 }, hidden: false },
        { id: 'num_032', name: '突破第一层', desc: '通过第10关', condition: { type: 'stage', value: 10 }, reward: { powerBonus: 1 }, hidden: false },
        { id: 'num_033', name: '中层挑战者', desc: '通过第25关', condition: { type: 'stage', value: 25 }, reward: { powerBonus: 1 }, hidden: false },
        { id: 'num_034', name: '高层攀登者', desc: '通过第50关', condition: { type: 'stage', value: 50 }, reward: { powerBonus: 2 }, hidden: false },
        { id: 'num_035', name: '百层突破', desc: '通过第100关', condition: { type: 'stage', value: 100 }, reward: { powerBonus: 2 }, hidden: false },
        { id: 'num_036', name: '深渊行者', desc: '通过第250关', condition: { type: 'stage', value: 250 }, reward: { powerBonus: 3 }, hidden: false },
        { id: 'num_037', name: '巅峰之上', desc: '通过第500关', condition: { type: 'stage', value: 500 }, reward: { powerBonus: 3 }, hidden: false },
        { id: 'num_038', name: '传说之路', desc: '通过第1,000关', condition: { type: 'stage', value: 1000 }, reward: { powerBonus: 5 }, hidden: false },
        { id: 'num_039', name: '万界穿越者', desc: '通过第5,000关', condition: { type: 'stage', value: 5000 }, reward: { powerBonus: 5 }, hidden: false },
        { id: 'num_03a', name: '无限轮回', desc: '通过第1万关', condition: { type: 'stage', value: 10000 }, reward: { powerBonus: 5 }, hidden: false },

        // === 系统成就：卡牌收集 ===
        { id: 'sys_001', name: '第一件遗物', desc: '获得第一张卡牌', condition: { type: 'card_count', value: 1 }, reward: { powerBonus: 1 }, hidden: false },
        { id: 'sys_002', name: '遗物收集者', desc: '拥有3张不同卡牌', condition: { type: 'card_unique', value: 3 }, reward: { powerBonus: 1 }, hidden: false },
        { id: 'sys_003', name: '背包扩充', desc: '拥有5张不同卡牌', condition: { type: 'card_unique', value: 5 }, reward: { powerBonus: 1 }, hidden: false },
        { id: 'sys_004', name: '遗物成型', desc: '拥有10张不同卡牌', condition: { type: 'card_unique', value: 10 }, reward: { powerBonus: 1 }, hidden: false },
        { id: 'sys_005', name: '位面收藏家', desc: '拥有20张不同卡牌', condition: { type: 'card_unique', value: 20 }, reward: { powerBonus: 2 }, hidden: false },
        { id: 'sys_006', name: '万界收藏家', desc: '拥有30张不同卡牌', condition: { type: 'card_unique', value: 30 }, reward: { powerBonus: 2 }, hidden: false },
        { id: 'sys_007', name: '万界全收集', desc: '收集所有卡牌', condition: { type: 'card_all', value: 0 }, reward: { powerBonus: 5 }, hidden: false },

        // === 系统成就：卡牌升级 ===
        { id: 'sys_010', name: '首次升级', desc: '将一张卡牌升到2级', condition: { type: 'card_level', value: 2 }, reward: { powerBonus: 1 }, hidden: false },
        { id: 'sys_011', name: '遗物强化', desc: '将一张卡牌升到5级', condition: { type: 'card_level', value: 5 }, reward: { powerBonus: 1 }, hidden: false },
        { id: 'sys_012', name: '遗物觉醒', desc: '将一张卡牌升到10级', condition: { type: 'card_level', value: 10 }, reward: { powerBonus: 2 }, hidden: false },
        { id: 'sys_013', name: '极限突破', desc: '将一张卡牌升到25级', condition: { type: 'card_level', value: 25 }, reward: { powerBonus: 2 }, hidden: false },
        { id: 'sys_014', name: '传说遗物', desc: '将一张卡牌升到50级', condition: { type: 'card_level', value: 50 }, reward: { powerBonus: 3 }, hidden: false },

        // === 系统成就：稀有度收集 ===
        { id: 'sys_020', name: '稀有发现', desc: '抽到第一张R卡', condition: { type: 'rarity_obtain', value: 'R' }, reward: { powerBonus: 1 }, hidden: false },
        { id: 'sys_021', name: '史诗时刻', desc: '抽到第一张SR卡', condition: { type: 'rarity_obtain', value: 'SR' }, reward: { powerBonus: 1 }, hidden: false },
        { id: 'sys_022', name: '传说降临', desc: '抽到第一张SSR卡', condition: { type: 'rarity_obtain', value: 'SSR' }, reward: { powerBonus: 2 }, hidden: false },

        // === 系统成就：套装羁绊 ===
        { id: 'sys_030', name: '套装新手', desc: '激活第一个套装羁绊', condition: { type: 'set_active', value: 1 }, reward: { powerBonus: 1 }, hidden: false },
        { id: 'sys_031', name: '套装收集者', desc: '激活2个套装羁绊', condition: { type: 'set_active_count', value: 2 }, reward: { powerBonus: 2 }, hidden: false },
        { id: 'sys_032', name: '套装大师', desc: '激活3个套装羁绊', condition: { type: 'set_active_count', value: 3 }, reward: { powerBonus: 2 }, hidden: false },
        { id: 'sys_033', name: '套装之王', desc: '激活所有套装羁绊', condition: { type: 'set_active', value: 0 }, reward: { powerBonus: 5 }, hidden: false },

        // === 组合成就：同时拥有特定卡牌 ===
        { id: 'combo_001', name: '攻守平衡', desc: '同时拥有苦无和木制替身', condition: { type: 'has_cards', value: ['n_001', 'n_002'] }, reward: { powerBonus: 1 }, hidden: false },
        { id: 'combo_002', name: '元素共鸣', desc: '同时拥有现实宝石和飞雷神苦无', condition: { type: 'has_cards', value: ['r_004', 'r_005'] }, reward: { powerBonus: 1 }, hidden: false },
        { id: 'combo_003', name: '自然亲和', desc: '同时拥有令咒残片和立体机动气体', condition: { type: 'has_cards', value: ['n_007', 'n_008'] }, reward: { powerBonus: 1 }, hidden: false },
        { id: 'combo_004', name: '龙之共鸣', desc: '同时拥有霜之哀伤和统御之冠', condition: { type: 'has_cards', value: ['sr_001', 'sr_002'] }, reward: { powerBonus: 2 }, hidden: false },
        { id: 'combo_005', name: '创世共鸣', desc: '同时拥有无限手套和王之财宝', condition: { type: 'has_cards', value: ['ssr_001', 'ssr_002'] }, reward: { powerBonus: 3 }, hidden: false },

        // === 组合成就：激活特定套装 ===
        { id: 'combo_010', name: '骑士荣耀', desc: '激活草帽团羁绊', condition: { type: 'set_active_specific', value: '草帽团羁绊' }, reward: { powerBonus: 1 }, hidden: false },
        { id: 'combo_011', name: '屠龙传说', desc: '激活权游龙焰套装', condition: { type: 'set_active_specific', value: '权游龙焰套装' }, reward: { powerBonus: 2 }, hidden: false },
        { id: 'combo_012', name: '神王降临', desc: '激活无限宝石套装', condition: { type: 'set_active_specific', value: '无限宝石套装' }, reward: { powerBonus: 3 }, hidden: false },

        // === 新增系统成就 ===
        { id: 'sys_040', name: '遗物融合', desc: '首次合成卡牌', condition: { type: 'card_level', value: 2 }, reward: { powerBonus: 1 }, hidden: false },
        { id: 'sys_041', name: '次元裂缝封闭', desc: '十连抽无SSR', condition: { type: 'gacha_streak_no_ssr', value: 10 }, reward: { powerBonus: 1 }, hidden: false },
        { id: 'sys_042', name: '连胜传说', desc: '连胜10场竞技', condition: { type: 'win_streak', value: 10 }, reward: { powerBonus: 2 }, hidden: false },
        { id: 'sys_043', name: '新世界大门', desc: '首次解锁新世界', condition: { type: 'world_unlock', value: 1 }, reward: { powerBonus: 2 }, hidden: false },
        { id: 'sys_044', name: '套装猎人', desc: '收集第一个套装', condition: { type: 'set_active', value: 1 }, reward: { powerBonus: 1 }, hidden: false },
        { id: 'sys_045', name: '天降SSR', desc: '首次战斗掉落SSR', condition: { type: 'battle_drop_ssr', value: 1 }, reward: { powerBonus: 3 }, hidden: false },
        { id: 'sys_046', name: '单抽百次', desc: '连续100次单抽', condition: { type: 'gacha_single_streak', value: 100 }, reward: { powerBonus: 2 }, hidden: false },

        // === 隐藏成就（搞怪/探索，但都可解锁） ===
        { id: 'hid_001', name: '次元裂缝保底', desc: '连续10次抽卡没有R以上', condition: { type: 'gacha_streak_no_rare', value: 10 }, reward: { powerBonus: 1 }, hidden: true },
        { id: 'hid_002', name: '天命之子', desc: '单次抽卡抽到SSR', condition: { type: 'gacha_single_ssr', value: 1 }, reward: { powerBonus: 2 }, hidden: true },
        { id: 'hid_003', name: '被系统针对的可怜人', desc: '连续100次抽卡没有SSR', condition: { type: 'gacha_streak_no_ssr', value: 100 }, reward: { powerBonus: 3 }, hidden: true },
        { id: 'hid_004', name: '真·非酋', desc: '累计抽卡1000次没有SSR', condition: { type: 'gacha_total_no_ssr', value: 1000 }, reward: { powerBonus: 5 }, hidden: true },
        { id: 'hid_005', name: '囤积10万系统点的主神空间异类', desc: '持有系统点超过10万但一次都不次元抽取', condition: { type: 'hoarder', value: 100000 }, reward: { powerBonus: 1 }, hidden: true },
        { id: 'hid_006', name: '系统点为0时强行抽取的赌徒', desc: '系统点为0时进行抽卡', condition: { type: 'gamble', value: 0 }, reward: { powerBonus: 1 }, hidden: true },
        { id: 'hid_007', name: '被位面碾压', desc: '连续失败10场竞技', condition: { type: 'lose_streak', value: 10 }, reward: { powerBonus: 1 }, hidden: true },
        { id: 'hid_008', name: '以弱胜强', desc: '战力低于敌人10%时获胜', condition: { type: 'underdog_win', value: 0.9 }, reward: { powerBonus: 2 }, hidden: true },
        { id: 'hid_009', name: '系统点收割机', desc: '1分钟内点击赚系统点按钮超过30次', condition: { type: 'click_spam', value: 30 }, reward: { powerBonus: 1 }, hidden: true },
        { id: 'hid_010', name: '午夜轮回者', desc: '在0:00-1:00之间登录游戏', condition: { type: 'midnight_login', value: 1 }, reward: { powerBonus: 1 }, hidden: true },
        { id: 'hid_011', name: '被系统针对的可怜人·进阶', desc: '连续失败20场竞技', condition: { type: 'lose_streak', value: 20 }, reward: { powerBonus: 2 }, hidden: true },
        { id: 'hid_012', name: '位面弃子', desc: '连续失败50场竞技', condition: { type: 'lose_streak', value: 50 }, reward: { powerBonus: 3 }, hidden: true },
        { id: 'hid_013', name: 'N卡之王', desc: '同时拥有所有N卡', condition: { type: 'has_all_rarity', value: 'N' }, reward: { powerBonus: 2 }, hidden: true },
        { id: 'hid_014', name: 'R卡之王', desc: '同时拥有所有R卡', condition: { type: 'has_all_rarity', value: 'R' }, reward: { powerBonus: 2 }, hidden: true },
        { id: 'hid_015', name: '恶魔数字', desc: '系统点恰好为66666', condition: { type: 'exact_points', value: 66666 }, reward: { powerBonus: 2 }, hidden: true },
        { id: 'hid_016', name: '吉利数字', desc: '系统点恰好为88888', condition: { type: 'exact_points', value: 88888 }, reward: { powerBonus: 2 }, hidden: true },
        { id: 'hid_017', name: '点击之神', desc: '1分钟内点击赚系统点按钮超过60次', condition: { type: 'click_spam', value: 60 }, reward: { powerBonus: 3 }, hidden: true },
        { id: 'hid_018', name: '忍耐大师', desc: '连续在线1小时不抽卡', condition: { type: 'no_gacha_hour', value: 1 }, reward: { powerBonus: 2 }, hidden: true },
        { id: 'hid_019', name: '出师不利', desc: '首次战斗就输', condition: { type: 'first_battle_lose', value: 1 }, reward: { powerBonus: 1 }, hidden: true },
        { id: 'hid_01a', name: '势均力敌', desc: '战力恰好等于敌人战力时获胜', condition: { type: 'exact_power_win', value: 1 }, reward: { powerBonus: 3 }, hidden: true },
        { id: 'hid_01b', name: '极限挑战', desc: '用最低战力通过第10关', condition: { type: 'low_power_stage10', value: 1 }, reward: { powerBonus: 3 }, hidden: true },
        { id: 'hid_01c', name: '龙之传承', desc: '集齐霜之哀伤、统御之冠、无限手套、王之财宝', condition: { type: 'has_cards', value: ['sr_001', 'sr_002', 'ssr_001', 'ssr_002'] }, reward: { powerBonus: 5 }, hidden: true },
        { id: 'hid_01d', name: '13:13的诅咒', desc: '在13:13登录游戏', condition: { type: 'unlucky_time', value: 1 }, reward: { powerBonus: 1 }, hidden: true },
    ]
};
