/* ===== 卡牌配置 ===== */
const CARD_CONFIG = {
    // 稀有度概率
    rates: {
        N: 0.60,    // 60%
        R: 0.25,    // 25%
        SR: 0.10,   // 10%
        SSR: 0.05   // 5%
    },

    // 稀有度颜色/样式映射（供UI使用）
    rarityStyle: {
        N:   { color: '#888',  name: '普通' },
        R:   { color: '#4fc3f7', name: '稀有' },
        SR:  { color: '#ba68c8', name: '史诗' },
        SSR: { color: '#ffd54f', name: '传说' }
    },

    // 基础卡牌池
    pool: [
        // N 卡 - 基础数值卡
        { id: 'n_001', name: '生锈的剑', rarity: 'N', basePower: 5, effect: 'power', desc: '攻击力 +5' },
        { id: 'n_002', name: '破木盾', rarity: 'N', basePower: 3, effect: 'defense', desc: '防御力 +3' },
        { id: 'n_003', name: '铜币袋', rarity: 'N', basePower: 2, effect: 'gold', desc: '金币产出 +2' },
        { id: 'n_004', name: '学徒法杖', rarity: 'N', basePower: 4, effect: 'power', desc: '攻击力 +4' },
        { id: 'n_005', name: '旧皮甲', rarity: 'N', basePower: 4, effect: 'defense', desc: '防御力 +4' },
        { id: 'n_006', name: '草药包', rarity: 'N', basePower: 3, effect: 'heal', desc: '每关恢复 +3' },
        { id: 'n_007', name: '铁箭头', rarity: 'N', basePower: 4, effect: 'power', desc: '攻击力 +4' },
        { id: 'n_008', name: '麻绳', rarity: 'N', basePower: 1, effect: 'utility', desc: '羁绊素材' },

        // R 卡 - 有特性
        { id: 'r_001', name: '精钢剑', rarity: 'R', basePower: 12, effect: 'power', desc: '攻击力 +12' },
        { id: 'r_002', name: '骑士盾', rarity: 'R', basePower: 10, effect: 'defense', desc: '防御力 +10' },
        { id: 'r_003', name: '幸运金币', rarity: 'R', basePower: 5, effect: 'gold', desc: '金币产出 +5，抽卡券产出 +1' },
        { id: 'r_004', name: '火焰宝石', rarity: 'R', basePower: 15, effect: 'power', desc: '攻击力 +15，对BOSS伤害+20%' },
        { id: 'r_005', name: '疾风靴', rarity: 'R', basePower: 8, effect: 'speed', desc: '先攻+1，闪避+5%' },
        { id: 'r_006', name: '生命护符', rarity: 'R', basePower: 8, effect: 'heal', desc: '每关恢复 +8，生命上限+20' },

        // SR 卡 - 有联动
        { id: 'sr_001', name: '龙血剑', rarity: 'SR', basePower: 30, effect: 'power', desc: '攻击力 +30，与"龙鳞甲"同时装备时+50%' },
        { id: 'sr_002', name: '龙鳞甲', rarity: 'SR', basePower: 25, effect: 'defense', desc: '防御力 +25，与"龙血剑"同时装备时+50%' },
        { id: 'sr_003', name: '聚宝盆', rarity: 'SR', basePower: 15, effect: 'gold', desc: '金币产出 +15，每10关额外获得抽卡券' },
        { id: 'sr_004', name: '时空沙漏', rarity: 'SR', basePower: 12, effect: 'utility', desc: '离线收益+50%，在线时每分钟额外+1金币' },
        { id: 'sr_005', name: '灵魂契约', rarity: 'SR', basePower: 20, effect: 'power', desc: '攻击力 +20，击败敌人时20%概率再抽1次' },

        // SSR 卡 - 核心驱动
        { id: 'ssr_001', name: '创世之刃', rarity: 'SSR', basePower: 80, effect: 'power', desc: '攻击力 +80，所有N卡效果翻倍' },
        { id: 'ssr_002', name: '永恒王冠', rarity: 'SSR', basePower: 50, effect: 'gold', desc: '金币产出 +50，成就奖励+30%' },
        { id: 'ssr_003', name: '命运骰子', rarity: 'SSR', basePower: 30, effect: 'utility', desc: '抽卡时10%概率额外抽1张，且稀有度+1' },
        { id: 'ssr_004', name: '虚空之眼', rarity: 'SSR', basePower: 60, effect: 'power', desc: '攻击力 +60，可看到隐藏成就的提示' },
    ],

    // 卡组收集奖励（羁绊）
    sets: [
        { ids: ['n_001', 'n_002'], name: '新手套装', bonus: { power: 5 } },
        { ids: ['r_001', 'r_002'], name: '骑士套装', bonus: { power: 15, defense: 10 } },
        { ids: ['sr_001', 'sr_002'], name: '屠龙套装', bonus: { power: 50, defense: 30 } },
        { ids: ['ssr_001', 'ssr_002'], name: '神王套装', bonus: { power: 100, gold: 30 } },
    ]
};
