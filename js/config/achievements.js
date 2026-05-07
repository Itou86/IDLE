/* ===== 成就配置 ===== */
const ACHIEVEMENT_CONFIG = {
    // 成就列表
    list: [
        // === 数值成就 ===
        { id: 'num_001', name: '初出茅庐', desc: '累计获得100金币', condition: { type: 'gold_total', value: 100 }, reward: { gold: 50 }, hidden: false },
        { id: 'num_002', name: '小有积蓄', desc: '累计获得1,000金币', condition: { type: 'gold_total', value: 1000 }, reward: { gold: 200 }, hidden: false },
        { id: 'num_003', name: '富翁之路', desc: '累计获得10,000金币', condition: { type: 'gold_total', value: 10000 }, reward: { gold: 1000, tickets: 1 }, hidden: false },
        { id: 'num_004', name: '百万富翁', desc: '累计获得100万金币', condition: { type: 'gold_total', value: 1000000 }, reward: { gold: 50000, tickets: 5 }, hidden: false },
        { id: 'num_005', name: '亿万富翁', desc: '累计获得1亿金币', condition: { type: 'gold_total', value: 100000000 }, reward: { gold: 1000000, tickets: 20 }, hidden: false },

        { id: 'num_010', name: '初次抽卡', desc: '进行首次抽卡', condition: { type: 'gacha_count', value: 1 }, reward: { tickets: 1 }, hidden: false },
        { id: 'num_011', name: '抽卡爱好者', desc: '累计抽卡10次', condition: { type: 'gacha_count', value: 10 }, reward: { tickets: 2 }, hidden: false },
        { id: 'num_012', name: '抽卡狂魔', desc: '累计抽卡100次', condition: { type: 'gacha_count', value: 100 }, reward: { tickets: 10 }, hidden: false },
        { id: 'num_013', name: '抽卡之神', desc: '累计抽卡1000次', condition: { type: 'gacha_count', value: 1000 }, reward: { tickets: 50 }, hidden: false },

        { id: 'num_020', name: '首次胜利', desc: '赢得第一场竞技', condition: { type: 'battle_win', value: 1 }, reward: { gold: 100 }, hidden: false },
        { id: 'num_021', name: '连胜新手', desc: '累计获胜10场', condition: { type: 'battle_win', value: 10 }, reward: { gold: 500 }, hidden: false },
        { id: 'num_022', name: '竞技场常客', desc: '累计获胜100场', condition: { type: 'battle_win', value: 100 }, reward: { gold: 5000, tickets: 3 }, hidden: false },
        { id: 'num_023', name: '不败传说', desc: '累计获胜1000场', condition: { type: 'battle_win', value: 1000 }, reward: { gold: 50000, tickets: 10 }, hidden: false },

        { id: 'num_030', name: '突破第一层', desc: '通过第10关', condition: { type: 'stage', value: 10 }, reward: { gold: 200 }, hidden: false },
        { id: 'num_031', name: '中层挑战者', desc: '通过第50关', condition: { type: 'stage', value: 50 }, reward: { gold: 1000, tickets: 2 }, hidden: false },
        { id: 'num_032', name: '高层攀登者', desc: '通过第100关', condition: { type: 'stage', value: 100 }, reward: { gold: 5000, tickets: 5 }, hidden: false },
        { id: 'num_033', name: '巅峰之上', desc: '通过第500关', condition: { type: 'stage', value: 500 }, reward: { gold: 50000, tickets: 20 }, hidden: false },

        // === 系统成就 ===
        { id: 'sys_001', name: '第一张卡', desc: '获得第一张卡牌', condition: { type: 'card_count', value: 1 }, reward: { gold: 50 }, hidden: false },
        { id: 'sys_002', name: '卡组成型', desc: '拥有10张不同卡牌', condition: { type: 'card_unique', value: 10 }, reward: { gold: 300 }, hidden: false },
        { id: 'sys_003', name: '收藏家', desc: '拥有30张不同卡牌', condition: { type: 'card_unique', value: 30 }, reward: { gold: 2000, tickets: 3 }, hidden: false },
        { id: 'sys_004', name: '全图鉴', desc: '收集所有卡牌', condition: { type: 'card_all', value: 0 }, reward: { gold: 100000, tickets: 50 }, hidden: false },

        { id: 'sys_010', name: '首次升级', desc: '将一张卡牌升到2级', condition: { type: 'card_level', value: 2 }, reward: { gold: 100 }, hidden: false },
        { id: 'sys_011', name: '卡牌大师', desc: '将一张卡牌升到10级', condition: { type: 'card_level', value: 10 }, reward: { gold: 5000, tickets: 2 }, hidden: false },
        { id: 'sys_012', name: '极限突破', desc: '将一张卡牌升到50级', condition: { type: 'card_level', value: 50 }, reward: { gold: 50000, tickets: 10 }, hidden: false },

        { id: 'sys_020', name: '稀有发现', desc: '抽到第一张R卡', condition: { type: 'rarity_obtain', value: 'R' }, reward: { gold: 200 }, hidden: false },
        { id: 'sys_021', name: '史诗时刻', desc: '抽到第一张SR卡', condition: { type: 'rarity_obtain', value: 'SR' }, reward: { gold: 1000, tickets: 2 }, hidden: false },
        { id: 'sys_022', name: '传说降临', desc: '抽到第一张SSR卡', condition: { type: 'rarity_obtain', value: 'SSR' }, reward: { gold: 5000, tickets: 5 }, hidden: false },

        { id: 'sys_030', name: '套装新手', desc: '激活第一个套装羁绊', condition: { type: 'set_active', value: 1 }, reward: { gold: 300 }, hidden: false },
        { id: 'sys_031', name: '套装大师', desc: '激活所有套装羁绊', condition: { type: 'set_active', value: 0 }, reward: { gold: 20000, tickets: 10 }, hidden: false },

        // === 隐藏成就（搞怪/探索）===
        { id: 'hid_001', name: '十连保底', desc: '连续10次抽卡没有R以上', condition: { type: 'gacha_streak_no_rare', value: 10 }, reward: { tickets: 5 }, hidden: true },
        { id: 'hid_002', name: '欧皇附体', desc: '单次抽卡抽到SSR', condition: { type: 'gacha_single_ssr', value: 1 }, reward: { tickets: 10 }, hidden: true },
        { id: 'hid_003', name: '非酋之王', desc: '连续100次抽卡没有SSR', condition: { type: 'gacha_streak_no_ssr', value: 100 }, reward: { tickets: 20 }, hidden: true },
        { id: 'hid_005', name: '守财奴', desc: '持有金币超过10万但一次都不抽卡', condition: { type: 'hoarder', value: 100000 }, reward: { tickets: 10 }, hidden: true },
        { id: 'hid_006', name: '赌徒', desc: '金币为0时进行抽卡', condition: { type: 'gamble', value: 0 }, reward: { gold: 100 }, hidden: true },
        { id: 'hid_007', name: '连败者', desc: '连续失败10场竞技', condition: { type: 'lose_streak', value: 10 }, reward: { gold: 1000 }, hidden: true },
        { id: 'hid_008', name: '绝地反击', desc: '战力低于敌人10%时获胜', condition: { type: 'underdog_win', value: 0.9 }, reward: { tickets: 3 }, hidden: true },
        { id: 'hid_009', name: '点击狂魔', desc: '1分钟内点击抽卡按钮超过30次', condition: { type: 'click_spam', value: 30 }, reward: { gold: 100 }, hidden: true },
        { id: 'hid_010', name: '午夜玩家', desc: '在0:00-1:00之间登录游戏', condition: { type: 'midnight_login', value: 1 }, reward: { tickets: 1 }, hidden: true },
    ]
};
