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

    // 基础卡牌池 (40张卡，覆盖各种效果)
    pool: [
        // ===== N 卡 (16张) - 基础数值卡 =====
        { id: 'n_001', name: '生锈的剑', rarity: 'N', basePower: 5, effect: 'power', desc: '攻击力 +5' },
        { id: 'n_002', name: '破木盾', rarity: 'N', basePower: 3, effect: 'defense', desc: '防御力 +3' },
        { id: 'n_003', name: '铜币袋', rarity: 'N', basePower: 2, effect: 'gold', desc: '金币产出 +2' },
        { id: 'n_004', name: '学徒法杖', rarity: 'N', basePower: 4, effect: 'power', desc: '攻击力 +4' },
        { id: 'n_005', name: '旧皮甲', rarity: 'N', basePower: 4, effect: 'defense', desc: '防御力 +4' },
        { id: 'n_006', name: '草药包', rarity: 'N', basePower: 3, effect: 'heal', desc: '每关恢复 +3' },
        { id: 'n_007', name: '铁箭头', rarity: 'N', basePower: 4, effect: 'power', desc: '攻击力 +4' },
        { id: 'n_008', name: '麻绳', rarity: 'N', basePower: 1, effect: 'utility', desc: '羁绊素材' },
        { id: 'n_009', name: '木弓', rarity: 'N', basePower: 4, effect: 'power', desc: '攻击力 +4' },
        { id: 'n_010', name: '石斧', rarity: 'N', basePower: 5, effect: 'power', desc: '攻击力 +5' },
        { id: 'n_011', name: '皮靴', rarity: 'N', basePower: 2, effect: 'speed', desc: '先攻+1' },
        { id: 'n_012', name: '铁盔', rarity: 'N', basePower: 3, effect: 'defense', desc: '防御力 +3' },
        { id: 'n_013', name: '火把', rarity: 'N', basePower: 3, effect: 'power', desc: '攻击力 +3' },
        { id: 'n_014', name: '水壶', rarity: 'N', basePower: 1, effect: 'heal', desc: '每关恢复 +1' },
        { id: 'n_015', name: '磨刀石', rarity: 'N', basePower: 2, effect: 'utility', desc: '所有武器卡+10%效果' },
        { id: 'n_016', name: '幸运符', rarity: 'N', basePower: 1, effect: 'dropRate', desc: '抽卡稀有度+1%' },

        // ===== R 卡 (12张) - 有特性 =====
        { id: 'r_001', name: '精钢剑', rarity: 'R', basePower: 12, effect: 'power', desc: '攻击力 +12' },
        { id: 'r_002', name: '骑士盾', rarity: 'R', basePower: 10, effect: 'defense', desc: '防御力 +10' },
        { id: 'r_003', name: '幸运金币', rarity: 'R', basePower: 5, effect: 'gold', desc: '金币产出 +5，抽卡券产出 +1' },
        { id: 'r_004', name: '火焰宝石', rarity: 'R', basePower: 15, effect: 'power', desc: '攻击力 +15，对BOSS伤害+20%' },
        { id: 'r_005', name: '疾风靴', rarity: 'R', basePower: 8, effect: 'speed', desc: '先攻+1，闪避+5%' },
        { id: 'r_006', name: '生命护符', rarity: 'R', basePower: 8, effect: 'heal', desc: '每关恢复 +8，生命上限+20' },
        { id: 'r_007', name: '猎人之弓', rarity: 'R', basePower: 14, effect: 'power', desc: '攻击力 +14，与"鹰眼"同时装备时+30%' },
        { id: 'r_008', name: '鹰眼', rarity: 'R', basePower: 6, effect: 'utility', desc: '暴击率+10%，与"猎人之弓"同时装备时+30%' },
        { id: 'r_009', name: '铁匠锤', rarity: 'R', basePower: 7, effect: 'utility', desc: '卡牌升级消耗-1' },
        { id: 'r_010', name: '魔法卷轴', rarity: 'R', basePower: 11, effect: 'power', desc: '攻击力 +11，有10%概率双倍伤害' },
        { id: 'r_011', name: '盗贼匕首', rarity: 'R', basePower: 9, effect: 'power', desc: '攻击力 +9，击败敌人时偷取10%金币' },
        { id: 'r_012', name: '圣水', rarity: 'R', basePower: 6, effect: 'heal', desc: '每关恢复 +6，免疫一次失败' },

        // ===== SR 卡 (8张) - 有联动 =====
        { id: 'sr_001', name: '龙血剑', rarity: 'SR', basePower: 30, effect: 'power', desc: '攻击力 +30，与"龙鳞甲"同时装备时+50%' },
        { id: 'sr_002', name: '龙鳞甲', rarity: 'SR', basePower: 25, effect: 'defense', desc: '防御力 +25，与"龙血剑"同时装备时+50%' },
        { id: 'sr_003', name: '聚宝盆', rarity: 'SR', basePower: 15, effect: 'gold', desc: '金币产出 +15，每10关额外获得抽卡券' },
        { id: 'sr_004', name: '时空沙漏', rarity: 'SR', basePower: 12, effect: 'utility', desc: '离线收益+50%，在线时每分钟额外+1金币' },
        { id: 'sr_005', name: '灵魂契约', rarity: 'SR', basePower: 20, effect: 'power', desc: '攻击力 +20，击败敌人时20%概率再抽1次' },
        { id: 'sr_006', name: '元素之心', rarity: 'SR', basePower: 18, effect: 'power', desc: '攻击力 +18，集齐四元素时效果翻倍' },
        { id: 'sr_007', name: '暗影斗篷', rarity: 'SR', basePower: 16, effect: 'defense', desc: '防御力 +16，闪避+15%，夜间效果+50%' },
        { id: 'sr_008', name: '贤者石', rarity: 'SR', basePower: 10, effect: 'gold', desc: '金币产出 +10，所有R卡效果+25%' },

        // ===== SSR 卡 (4张) - 核心驱动 =====
        { id: 'ssr_001', name: '创世之刃', rarity: 'SSR', basePower: 80, effect: 'power', desc: '攻击力 +80，所有N卡效果翻倍' },
        { id: 'ssr_002', name: '永恒王冠', rarity: 'SSR', basePower: 50, effect: 'gold', desc: '金币产出 +50，成就奖励+30%' },
        { id: 'ssr_003', name: '命运骰子', rarity: 'SSR', basePower: 30, effect: 'utility', desc: '抽卡时10%概率额外抽1张，且稀有度+1' },
        { id: 'ssr_004', name: '虚空之眼', rarity: 'SSR', basePower: 60, effect: 'power', desc: '攻击力 +60，可看到隐藏成就的提示' },
    ],

    // 卡组收集奖励（羁绊）- 15个套装，2-7张不等
    sets: [
        // ===== 2张套 =====
        { 
            ids: ['n_001', 'n_002'], 
            name: '新手套装', 
            desc: '冒险者的第一套装备',
            bonus: { power: 8, defense: 5 } 
        },
        { 
            ids: ['n_009', 'n_011'], 
            name: '游侠套装', 
            desc: '森林猎人的标配',
            bonus: { power: 6, speed: 2 } 
        },
        { 
            ids: ['r_001', 'r_002'], 
            name: '骑士套装', 
            desc: '王国正规军的装备',
            bonus: { power: 20, defense: 15 } 
        },
        { 
            ids: ['sr_001', 'sr_002'], 
            name: '屠龙套装', 
            desc: '传说中屠龙的勇者装备',
            bonus: { power: 60, defense: 40 } 
        },
        { 
            ids: ['ssr_001', 'ssr_002'], 
            name: '神王套装', 
            desc: '神界统治者的象征',
            bonus: { power: 150, gold: 50, dropRate: 5 } 
        },

        // ===== 3张套 =====
        { 
            ids: ['n_003', 'n_014', 'n_016'], 
            name: '幸运套装', 
            desc: '幸运女神眷顾之人',
            bonus: { gold: 10, dropRate: 3 } 
        },
        { 
            ids: ['n_004', 'n_006', 'n_013'], 
            name: '学徒套装', 
            desc: '魔法学院的入门套装',
            bonus: { power: 10, heal: 5 } 
        },
        { 
            ids: ['r_007', 'r_008', 'r_011'], 
            name: '猎人套装', 
            desc: '荒野猎人的全套装备',
            bonus: { power: 25, speed: 3, gold: 5 } 
        },
        { 
            ids: ['n_010', 'n_012', 'n_015'], 
            name: '工匠套装', 
            desc: '铁匠铺的实用工具',
            bonus: { power: 12, defense: 8 } 
        },

        // ===== 4张套 =====
        { 
            ids: ['n_001', 'n_004', 'n_007', 'n_010'], 
            name: '武器大师', 
            desc: '精通所有近战武器的战士',
            bonus: { power: 30, defense: 10 } 
        },
        { 
            ids: ['n_002', 'n_005', 'n_012', 'r_002'], 
            name: '钢铁壁垒', 
            desc: '无人能破的绝对防御',
            bonus: { defense: 35, power: 10 } 
        },
        { 
            ids: ['r_003', 'r_009', 'sr_003', 'sr_008'], 
            name: '财富套装', 
            desc: '商人和收藏家的最爱',
            bonus: { gold: 30, dropRate: 5 } 
        },

        // ===== 5张套 =====
        { 
            ids: ['n_006', 'n_014', 'r_006', 'r_012', 'sr_007'], 
            name: '生存专家', 
            desc: '在绝境中也能存活',
            bonus: { heal: 20, defense: 20, power: 15 } 
        },
        { 
            ids: ['n_011', 'r_005', 'r_008', 'sr_004', 'sr_007'], 
            name: '暗影行者', 
            desc: '穿梭于阴影中的刺客',
            bonus: { speed: 10, power: 25, dropRate: 3 } 
        },

        // ===== 7张套（终极套装） =====
        { 
            ids: ['n_001', 'n_002', 'r_001', 'r_002', 'sr_001', 'sr_002', 'ssr_001'], 
            name: '传说勇者', 
            desc: '跨越时代的勇者传承',
            bonus: { power: 200, defense: 100, gold: 30, dropRate: 10, speed: 5 } 
        },
        { 
            ids: ['n_003', 'n_016', 'r_003', 'r_009', 'sr_003', 'sr_008', 'ssr_002'], 
            name: '黄金帝国', 
            desc: '掌控世间一切财富',
            bonus: { gold: 80, dropRate: 15, power: 50 } 
        },
    ]
};
