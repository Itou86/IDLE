/* ===== 成就配置 ===== */
const ACHIEVEMENT_CONFIG = {
    // 成就奖励公式：每解锁 N 个成就，战力 +N%
    // 例如：解锁 10 个 → +10% 战力，解锁 50 个 → +50% 战力
    powerBonusPerAchievement: 1, // 每个成就 +1% 基础战力

    // 成就列表
    list: [
        // === 数值成就：金币累计 ===
        { id: 'num_001', name: '初出茅庐', desc: '累计获得100系统点', condition: { type: 'points_total', value: 100 }, reward: { powerBonus: 1 }, hidden: false },
        { id: 'num_002', name: '小有积蓄', desc: '累计获得500系统点', condition: { type: 'points_total', value: 500 }, reward: { powerBonus: 1 }, hidden: false },
        { id: 'num_003', name: '稳步积累', desc: '累计获得2,000系统点', condition: { type: 'points_total', value: 2000 }, reward: { powerBonus: 1 }, hidden: false },
        { id: 'num_004', name: '富翁之路', desc: '累计获得10,000系统点', condition: { type: 'points_total', value: 10000 }, reward: { powerBonus: 1 }, hidden: false },
        { id: 'num_005', name: '财运亨通', desc: '累计获得5万系统点', condition: { type: 'points_total', value: 50000 }, reward: { powerBonus: 1 }, hidden: false },
        { id: 'num_006', name: '百万富翁', desc: '累计获得100万系统点', condition: { type: 'points_total', value: 1000000 }, reward: { powerBonus: 2 }, hidden: false },
        { id: 'num_007', name: '亿万富翁', desc: '累计获得1亿系统点', condition: { type: 'points_total', value: 100000000 }, reward: { powerBonus: 3 }, hidden: false },
        { id: 'num_008', name: '富可敌国', desc: '累计获得100亿系统点', condition: { type: 'points_total', value: 10000000000 }, reward: { powerBonus: 5 }, hidden: false },

        // === 数值成就：抽卡次数 ===
        { id: 'num_010', name: '初次抽卡', desc: '进行首次抽卡', condition: { type: 'gacha_count', value: 1 }, reward: { powerBonus: 1 }, hidden: false },
        { id: 'num_011', name: '抽卡新手', desc: '累计抽卡5次', condition: { type: 'gacha_count', value: 5 }, reward: { powerBonus: 1 }, hidden: false },
        { id: 'num_012', name: '抽卡爱好者', desc: '累计抽卡25次', condition: { type: 'gacha_count', value: 25 }, reward: { powerBonus: 1 }, hidden: false },
        { id: 'num_013', name: '抽卡常客', desc: '累计抽卡50次', condition: { type: 'gacha_count', value: 50 }, reward: { powerBonus: 1 }, hidden: false },
        { id: 'num_014', name: '抽卡狂魔', desc: '累计抽卡100次', condition: { type: 'gacha_count', value: 100 }, reward: { powerBonus: 2 }, hidden: false },
        { id: 'num_015', name: '抽卡大师', desc: '累计抽卡500次', condition: { type: 'gacha_count', value: 500 }, reward: { powerBonus: 2 }, hidden: false },
        { id: 'num_016', name: '抽卡之神', desc: '累计抽卡2,000次', condition: { type: 'gacha_count', value: 2000 }, reward: { powerBonus: 3 }, hidden: false },
        { id: 'num_017', name: '无限抽卡', desc: '累计抽卡1万次', condition: { type: 'gacha_count', value: 10000 }, reward: { powerBonus: 5 }, hidden: false },

        // === 数值成就：竞技胜利 ===
        { id: 'num_020', name: '首次胜利', desc: '赢得第一场竞技', condition: { type: 'battle_win', value: 1 }, reward: { powerBonus: 1 }, hidden: false },
        { id: 'num_021', name: '初露锋芒', desc: '累计获胜5场', condition: { type: 'battle_win', value: 5 }, reward: { powerBonus: 1 }, hidden: false },
        { id: 'num_022', name: '连胜新手', desc: '累计获胜25场', condition: { type: 'battle_win', value: 25 }, reward: { powerBonus: 1 }, hidden: false },
        { id: 'num_023', name: '竞技场常客', desc: '累计获胜100场', condition: { type: 'battle_win', value: 100 }, reward: { powerBonus: 2 }, hidden: false },
        { id: 'num_024', name: '竞技高手', desc: '累计获胜500场', condition: { type: 'battle_win', value: 500 }, reward: { powerBonus: 2 }, hidden: false },
        { id: 'num_025', name: '不败传说', desc: '累计获胜2,000场', condition: { type: 'battle_win', value: 2000 }, reward: { powerBonus: 3 }, hidden: false },
        { id: 'num_026', name: '战神', desc: '累计获胜1万场', condition: { type: 'battle_win', value: 10000 }, reward: { powerBonus: 5 }, hidden: false },

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

        // === 系统成就：卡牌收集 ===
        { id: 'sys_001', name: '第一张卡', desc: '获得第一张卡牌', condition: { type: 'card_count', value: 1 }, reward: { powerBonus: 1 }, hidden: false },
        { id: 'sys_002', name: '卡牌新手', desc: '拥有3张不同卡牌', condition: { type: 'card_unique', value: 3 }, reward: { powerBonus: 1 }, hidden: false },
        { id: 'sys_003', name: '卡组扩充', desc: '拥有5张不同卡牌', condition: { type: 'card_unique', value: 5 }, reward: { powerBonus: 1 }, hidden: false },
        { id: 'sys_004', name: '卡组成型', desc: '拥有10张不同卡牌', condition: { type: 'card_unique', value: 10 }, reward: { powerBonus: 1 }, hidden: false },
        { id: 'sys_005', name: '收藏家', desc: '拥有20张不同卡牌', condition: { type: 'card_unique', value: 20 }, reward: { powerBonus: 2 }, hidden: false },
        { id: 'sys_006', name: '资深收藏家', desc: '拥有30张不同卡牌', condition: { type: 'card_unique', value: 30 }, reward: { powerBonus: 2 }, hidden: false },
        { id: 'sys_007', name: '全图鉴', desc: '收集所有卡牌', condition: { type: 'card_all', value: 0 }, reward: { powerBonus: 5 }, hidden: false },

        // === 系统成就：卡牌升级 ===
        { id: 'sys_010', name: '首次升级', desc: '将一张卡牌升到2级', condition: { type: 'card_level', value: 2 }, reward: { powerBonus: 1 }, hidden: false },
        { id: 'sys_011', name: '卡牌培养', desc: '将一张卡牌升到5级', condition: { type: 'card_level', value: 5 }, reward: { powerBonus: 1 }, hidden: false },
        { id: 'sys_012', name: '卡牌大师', desc: '将一张卡牌升到10级', condition: { type: 'card_level', value: 10 }, reward: { powerBonus: 2 }, hidden: false },
        { id: 'sys_013', name: '极限突破', desc: '将一张卡牌升到25级', condition: { type: 'card_level', value: 25 }, reward: { powerBonus: 2 }, hidden: false },
        { id: 'sys_014', name: '传说卡牌', desc: '将一张卡牌升到50级', condition: { type: 'card_level', value: 50 }, reward: { powerBonus: 3 }, hidden: false },

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
        { id: 'combo_001', name: '攻守兼备', desc: '同时拥有苦无和木制替身', condition: { type: 'has_cards', value: ['n_001', 'n_002'] }, reward: { powerBonus: 1 }, hidden: false },
        { id: 'combo_002', name: '元素亲和', desc: '同时拥有现实宝石和飞雷神苦无', condition: { type: 'has_cards', value: ['r_004', 'r_005'] }, reward: { powerBonus: 1 }, hidden: false },
        { id: 'combo_003', name: '自然之力', desc: '同时拥有令咒残片和立体机动气体', condition: { type: 'has_cards', value: ['n_007', 'n_008'] }, reward: { powerBonus: 1 }, hidden: false },
        { id: 'combo_004', name: '光暗平衡', desc: '同时拥有霜之哀伤和统御之冠', condition: { type: 'has_cards', value: ['sr_001', 'sr_002'] }, reward: { powerBonus: 2 }, hidden: false },
        { id: 'combo_005', name: '创世之力', desc: '同时拥有无限手套和王之财宝', condition: { type: 'has_cards', value: ['ssr_001', 'ssr_002'] }, reward: { powerBonus: 3 }, hidden: false },

        // === 组合成就：激活特定套装 ===
        { id: 'combo_010', name: '骑士荣耀', desc: '激活草帽团羁绊', condition: { type: 'set_active_specific', value: '草帽团羁绊' }, reward: { powerBonus: 1 }, hidden: false },
        { id: 'combo_011', name: '屠龙传说', desc: '激活权游龙焰套装', condition: { type: 'set_active_specific', value: '权游龙焰套装' }, reward: { powerBonus: 2 }, hidden: false },
        { id: 'combo_012', name: '神王降临', desc: '激活无限宝石套装', condition: { type: 'set_active_specific', value: '无限宝石套装' }, reward: { powerBonus: 3 }, hidden: false },

        // === 隐藏成就（搞怪/探索，但都可解锁） ===
        { id: 'hid_001', name: '十连保底', desc: '连续10次抽卡没有R以上', condition: { type: 'gacha_streak_no_rare', value: 10 }, reward: { powerBonus: 1 }, hidden: true },
        { id: 'hid_002', name: '欧皇附体', desc: '单次抽卡抽到SSR', condition: { type: 'gacha_single_ssr', value: 1 }, reward: { powerBonus: 2 }, hidden: true },
        { id: 'hid_003', name: '非酋之王', desc: '连续100次抽卡没有SSR', condition: { type: 'gacha_streak_no_ssr', value: 100 }, reward: { powerBonus: 3 }, hidden: true },
        { id: 'hid_005', name: '守财奴', desc: '持有系统点超过10万但一次都不次元抽取', condition: { type: 'hoarder', value: 100000 }, reward: { powerBonus: 1 }, hidden: true },
        { id: 'hid_006', name: '赌徒', desc: '系统点为0时进行抽卡', condition: { type: 'gamble', value: 0 }, reward: { powerBonus: 1 }, hidden: true },
        { id: 'hid_007', name: '连败者', desc: '连续失败10场竞技', condition: { type: 'lose_streak', value: 10 }, reward: { powerBonus: 1 }, hidden: true },
        { id: 'hid_008', name: '绝地反击', desc: '战力低于敌人10%时获胜', condition: { type: 'underdog_win', value: 0.9 }, reward: { powerBonus: 2 }, hidden: true },
        { id: 'hid_009', name: '点击狂魔', desc: '1分钟内点击赚系统点按钮超过30次', condition: { type: 'click_spam', value: 30 }, reward: { powerBonus: 1 }, hidden: true },
        { id: 'hid_010', name: '午夜玩家', desc: '在0:00-1:00之间登录游戏', condition: { type: 'midnight_login', value: 1 }, reward: { powerBonus: 1 }, hidden: true },
    ]
};
