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
        { id: 'n_001', name: '生锈的剑', rarity: 'N', stats: { power: 5 }, desc: '攻击力 +5' },
        { id: 'n_002', name: '破木盾', rarity: 'N', stats: { defense: 3 }, desc: '防御力 +3' },
        { id: 'n_003', name: '铜币袋', rarity: 'N', stats: { goldBonus: 2 }, desc: '金币产出 +2/秒' },
        { id: 'n_004', name: '学徒法杖', rarity: 'N', stats: { power: 4 }, desc: '攻击力 +4' },
        { id: 'n_005', name: '旧皮甲', rarity: 'N', stats: { defense: 4 }, desc: '防御力 +4' },
        { id: 'n_006', name: '草药包', rarity: 'N', stats: { hpRegen: 3 }, desc: '每关恢复 +3 HP' },
        { id: 'n_007', name: '铁箭头', rarity: 'N', stats: { power: 4 }, desc: '攻击力 +4' },
        { id: 'n_008', name: '麻绳', rarity: 'N', stats: {}, desc: '羁绊素材' },
        { id: 'n_009', name: '木弓', rarity: 'N', stats: { power: 4 }, desc: '攻击力 +4' },
        { id: 'n_010', name: '石斧', rarity: 'N', stats: { power: 5 }, desc: '攻击力 +5' },
        { id: 'n_011', name: '皮靴', rarity: 'N', stats: { speed: 2 }, desc: '速度 +2' },
        { id: 'n_012', name: '铁盔', rarity: 'N', stats: { defense: 3 }, desc: '防御力 +3' },
        { id: 'n_013', name: '火把', rarity: 'N', stats: { power: 3 }, desc: '攻击力 +3' },
        { id: 'n_014', name: '水壶', rarity: 'N', stats: { hpRegen: 1 }, desc: '每关恢复 +1 HP' },
        { id: 'n_015', name: '磨刀石', rarity: 'N', stats: { critRate: 2 }, desc: '暴击率 +2%' },
        { id: 'n_016', name: '幸运符', rarity: 'N', stats: { dropRate: 1 }, desc: '掉率 +1%' },

        // ===== R 卡 (12张) - 有特性 =====
        { id: 'r_001', name: '精钢剑', rarity: 'R', stats: { power: 12 }, desc: '攻击力 +12' },
        { id: 'r_002', name: '骑士盾', rarity: 'R', stats: { defense: 10 }, desc: '防御力 +10' },
        { id: 'r_003', name: '幸运金币', rarity: 'R', stats: { goldBonus: 5, ticketBonus: 1 }, desc: '金币 +5/秒，每10关+1券' },
        { id: 'r_004', name: '火焰宝石', rarity: 'R', stats: { power: 15, critRate: 3 }, desc: '攻击力 +15，暴击率+3%' },
        { id: 'r_005', name: '疾风靴', rarity: 'R', stats: { speed: 5, critRate: 2 }, desc: '速度 +5，暴击率+2%' },
        { id: 'r_006', name: '生命护符', rarity: 'R', stats: { hpRegen: 8, hp: 20 }, desc: '恢复+8，生命上限+20' },
        { id: 'r_007', name: '猎人之弓', rarity: 'R', stats: { power: 14, critRate: 3 }, desc: '攻击力 +14，暴击率+3%' },
        { id: 'r_008', name: '鹰眼', rarity: 'R', stats: { critRate: 5, critDamage: 10 }, desc: '暴击率+5%，暴击伤害+10%' },
        { id: 'r_009', name: '铁匠锤', rarity: 'R', stats: { expBonus: 10 }, desc: '卡牌经验+10%' },
        { id: 'r_010', name: '魔法卷轴', rarity: 'R', stats: { power: 11, critRate: 4 }, desc: '攻击力 +11，暴击率+4%' },
        { id: 'r_011', name: '盗贼匕首', rarity: 'R', stats: { power: 9, speed: 3 }, desc: '攻击力 +9，速度+3' },
        { id: 'r_012', name: '圣水', rarity: 'R', stats: { hpRegen: 6, hp: 10 }, desc: '恢复+6，生命上限+10' },

        // ===== SR 卡 (8张) - 有联动 =====
        { id: 'sr_001', name: '龙血剑', rarity: 'SR', stats: { power: 30, critRate: 5 }, desc: '攻击力 +30，暴击率+5%' },
        { id: 'sr_002', name: '龙鳞甲', rarity: 'SR', stats: { defense: 25, hp: 50 }, desc: '防御力 +25，生命上限+50' },
        { id: 'sr_003', name: '聚宝盆', rarity: 'SR', stats: { goldBonus: 15, ticketBonus: 2 }, desc: '金币 +15/秒，每10关+2券' },
        { id: 'sr_004', name: '时空沙漏', rarity: 'SR', stats: { speed: 8, goldBonus: 3 }, desc: '速度 +8，金币 +3/秒' },
        { id: 'sr_005', name: '灵魂契约', rarity: 'SR', stats: { power: 20, critRate: 5 }, desc: '攻击力 +20，暴击率+5%' },
        { id: 'sr_006', name: '元素之心', rarity: 'SR', stats: { power: 18, critDamage: 15 }, desc: '攻击力 +18，暴击伤害+15%' },
        { id: 'sr_007', name: '暗影斗篷', rarity: 'SR', stats: { defense: 16, speed: 5 }, desc: '防御力 +16，速度+5' },
        { id: 'sr_008', name: '贤者石', rarity: 'SR', stats: { goldBonus: 10, expBonus: 15 }, desc: '金币 +10/秒，经验+15%' },

        // ===== SSR 卡 (4张) - 核心驱动 =====
        { id: 'ssr_001', name: '创世之刃', rarity: 'SSR', stats: { power: 80, critRate: 10, critDamage: 20 }, desc: '攻击力 +80，暴击率+10%，暴伤+20%' },
        { id: 'ssr_002', name: '永恒王冠', rarity: 'SSR', stats: { goldBonus: 50, ticketBonus: 5, hp: 100 }, desc: '金币 +50/秒，每10关+5券，生命+100' },
        { id: 'ssr_003', name: '命运骰子', rarity: 'SSR', stats: { dropRate: 5, speed: 10 }, desc: '掉率 +5%，速度+10' },
        { id: 'ssr_004', name: '虚空之眼', rarity: 'SSR', stats: { power: 60, critRate: 8, critDamage: 25 }, desc: '攻击力 +60，暴击率+8%，暴伤+25%' },
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
