// 斗地主游戏核心逻辑

// 卡牌花色
const SUITS = ['♠', '♥', '♣', '♦'];
// 卡牌数值
const VALUES = ['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A', '2', '小王', '大王'];
// 卡牌权重（用于比较大小）
const CARD_WEIGHT = {
    '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
    'J': 11, 'Q': 12, 'K': 13, 'A': 14, '2': 15, '小王': 16, '大王': 17
};

// 卡牌类
class Card {
    constructor(suit, value) {
        this.suit = suit;
        this.value = value;
        this.weight = CARD_WEIGHT[value];
        this.selected = false;
    }

    // 获取卡牌颜色
    getColor() {
        return (this.suit === '♥' || this.suit === '♦' || this.value === '大王') ? 'red' : 'black';
    }

    // 获取卡牌显示文本
    getDisplayText() {
        if (this.value === '小王') return '小王';
        if (this.value === '大王') return '大王';
        return this.value;
    }
}

// 牌型枚举
const CARD_TYPE = {
    SINGLE: 'single',           // 单张
    PAIR: 'pair',               // 对子
    TRIPLE: 'triple',           // 三张
    TRIPLE_ONE: 'triple_one',   // 三带一
    TRIPLE_PAIR: 'triple_pair', // 三带二
    STRAIGHT: 'straight',       // 顺子
    PAIR_STRAIGHT: 'pair_straight', // 连对
    PLANE: 'plane',             // 飞机
    BOMB: 'bomb',               // 炸弹
    ROCKET: 'rocket',            // 王炸
    INVALID: 'invalid'          // 无效牌型
};

// 牌型判断类
class CardTypeAnalyzer {
    // 分析牌型
    static analyze(cards) {
        const length = cards.length;
        if (length === 0) return { type: CARD_TYPE.INVALID };

        // 按权重排序
        const sortedCards = [...cards].sort((a, b) => a.weight - b.weight);
        const weights = sortedCards.map(c => c.weight);

        // 王炸
        if (length === 2 && weights[0] === 16 && weights[1] === 17) {
            return { type: CARD_TYPE.ROCKET, weight: 17 };
        }

        // 炸弹
        if (length === 4 && this.isSameWeight(weights)) {
            return { type: CARD_TYPE.BOMB, weight: weights[0] };
        }

        // 单张
        if (length === 1) {
            return { type: CARD_TYPE.SINGLE, weight: weights[0] };
        }

        // 对子
        if (length === 2 && this.isSameWeight(weights)) {
            return { type: CARD_TYPE.PAIR, weight: weights[0] };
        }

        // 三张
        if (length === 3 && this.isSameWeight(weights)) {
            return { type: CARD_TYPE.TRIPLE, weight: weights[0] };
        }

        // 三带一
        if (length === 4) {
            const counts = this.getCounts(weights);
            for (let weight in counts) {
                if (counts[weight] === 3) {
                    return { type: CARD_TYPE.TRIPLE_ONE, weight: parseInt(weight) };
                }
            }
        }

        // 三带二
        if (length === 5) {
            const counts = this.getCounts(weights);
            let tripleWeight = null;
            let pairWeight = null;
            for (let weight in counts) {
                if (counts[weight] === 3) tripleWeight = parseInt(weight);
                if (counts[weight] === 2) pairWeight = parseInt(weight);
            }
            if (tripleWeight !== null && pairWeight !== null) {
                return { type: CARD_TYPE.TRIPLE_PAIR, weight: tripleWeight };
            }
        }

        // 顺子（5张及以上连续单牌，不能包含2和王）
        if (length >= 5 && this.isConsecutive(weights) && !weights.includes(15) && !weights.includes(16) && !weights.includes(17)) {
            return { type: CARD_TYPE.STRAIGHT, weight: weights[0], length: length };
        }

        // 连对（3对及以上连续对子）
        if (length >= 6 && length % 2 === 0) {
            const counts = this.getCounts(weights);
            const pairs = [];
            for (let weight in counts) {
                if (counts[weight] === 2) {
                    pairs.push(parseInt(weight));
                }
            }
            if (pairs.length === length / 2 && this.isConsecutive(pairs) && !pairs.includes(15)) {
                return { type: CARD_TYPE.PAIR_STRAIGHT, weight: pairs[0], length: length };
            }
        }

        // 飞机（2个及以上连续三张）
        if (length >= 6) {
            const counts = this.getCounts(weights);
            const triples = [];
            for (let weight in counts) {
                if (counts[weight] === 3) {
                    triples.push(parseInt(weight));
                }
            }
            if (triples.length >= 2 && this.isConsecutive(triples) && !triples.includes(15)) {
                const remaining = length - triples.length * 3;
                if (remaining === 0) {
                    return { type: CARD_TYPE.PLANE, weight: triples[0], length: triples.length };
                }
                if (remaining === triples.length) {
                    return { type: CARD_TYPE.PLANE, weight: triples[0], length: triples.length, withSingles: true };
                }
                if (remaining === triples.length * 2) {
                    return { type: CARD_TYPE.PLANE, weight: triples[0], length: triples.length, withPairs: true };
                }
            }
        }

        return { type: CARD_TYPE.INVALID };
    }

    // 判断是否相同权重
    static isSameWeight(weights) {
        return weights.every(w => w === weights[0]);
    }

    // 判断是否连续
    static isConsecutive(weights) {
        if (weights.length < 2) return false;
        for (let i = 1; i < weights.length; i++) {
            if (weights[i] - weights[i - 1] !== 1) return false;
        }
        return true;
    }

    // 获取每个权重的数量
    static getCounts(weights) {
        const counts = {};
        weights.forEach(w => {
            counts[w] = (counts[w] || 0) + 1;
        });
        return counts;
    }

    // 比较牌型大小
    static canBeat(newCards, lastCards) {
        const newType = this.analyze(newCards);
        const lastType = this.analyze(lastCards);

        if (newType.type === CARD_TYPE.INVALID) return false;
        if (lastType.type === CARD_TYPE.INVALID) return true;

        // 王炸最大
        if (newType.type === CARD_TYPE.ROCKET) return true;
        if (lastType.type === CARD_TYPE.ROCKET) return false;

        // 炸弹可以打非炸弹
        if (newType.type === CARD_TYPE.BOMB && lastType.type !== CARD_TYPE.BOMB) return true;
        if (newType.type !== CARD_TYPE.BOMB && lastType.type === CARD_TYPE.BOMB) return false;

        // 同类型比较
        if (newType.type !== lastType.type) return false;

        // 顺子、连对、飞机需要长度相同
        if ((newType.type === CARD_TYPE.STRAIGHT || newType.type === CARD_TYPE.PAIR_STRAIGHT || newType.type === CARD_TYPE.PLANE) && newType.length !== lastType.length) {
            return false;
        }

        // 比较权重
        return newType.weight > lastType.weight;
    }
}

// 玩家类
class Player {
    constructor(id, name, isAI = false) {
        this.id = id;
        this.name = name;
        this.isAI = isAI;
        this.cards = [];
        this.role = 'farmer'; // landlord 或 farmer
        this.score = 0;
    }

    // 添加卡牌
    addCard(card) {
        this.cards.push(card);
        this.sortCards();
    }

    // 添加多张卡牌
    addCards(cards) {
        this.cards.push(...cards);
        this.sortCards();
    }

    // 移除卡牌
    removeCards(cardsToRemove) {
        this.cards = this.cards.filter(card => 
            !cardsToRemove.some(c => c.suit === card.suit && c.value === card.value)
        );
    }

    // 排序卡牌（按权重降序）
    sortCards() {
        this.cards.sort((a, b) => b.weight - a.weight);
    }

    // 获取卡牌数量
    getCardCount() {
        return this.cards.length;
    }

    // 清空卡牌
    clearCards() {
        this.cards = [];
    }
}

// 游戏类
class Game {
    constructor() {
        this.players = [];
        this.deck = [];
        this.baseCards = []; // 底牌
        this.landlord = null; // 地主
        this.currentPlayer = 0; // 当前玩家索引
        this.lastPlayedCards = []; // 上一次出的牌
        this.lastPlayedPlayer = -1; // 上一次出牌的玩家
        this.gameState = 'waiting'; // waiting, bidding, playing, ended
        this.score = 0;
        this.passCount = 0; // 连续不出次数
    }

    // 初始化游戏
    init() {
        this.players = [
            new Player(0, '玩家', false),
            new Player(1, '电脑1', true),
            new Player(2, '电脑2', true)
        ];
        this.createDeck();
        this.updateUI();
    }

    // 创建牌组
    createDeck() {
        this.deck = [];
        // 普通牌
        for (let suit of SUITS) {
            for (let i = 0; i < 13; i++) {
                this.deck.push(new Card(suit, VALUES[i]));
            }
        }
        // 大小王
        this.deck.push(new Card('', '小王'));
        this.deck.push(new Card('', '大王'));
        this.shuffleDeck();
    }

    // 洗牌
    shuffleDeck() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }

    // 发牌
    dealCards() {
        // 每人17张
        for (let i = 0; i < 51; i++) {
            const playerIndex = i % 3;
            this.players[playerIndex].addCard(this.deck[i]);
        }
        // 剩下3张作为底牌
        this.baseCards = this.deck.slice(51, 54);
        this.gameState = 'bidding';
        this.currentPlayer = Math.floor(Math.random() * 3);
        this.showMessage(`${this.players[this.currentPlayer].name}开始叫地主`);
        this.updateUI();
        this.startBidding();
    }

    // 开始叫地主
    startBidding() {
        if (this.players[this.currentPlayer].isAI) {
            setTimeout(() => {
                const bid = Math.random() > 0.5 ? 1 : 0;
                this.bid(bid);
            }, 1000);
        } else {
            document.getElementById('bid-buttons').style.display = 'flex';
        }
    }

    // 叫地主
    bid(value) {
        document.getElementById('bid-buttons').style.display = 'none';
        
        if (value === 1) {
            // 叫地主
            this.landlord = this.currentPlayer;
            this.players[this.currentPlayer].role = 'landlord';
            this.players[this.currentPlayer].addCards(this.baseCards);
            this.showMessage(`${this.players[this.currentPlayer].name}成为地主！`);
            this.gameState = 'playing';
            this.currentPlayer = this.landlord;
            this.updateUI();
            this.startTurn();
        } else {
            // 不叫，下一个人叫
            this.showMessage(`${this.players[this.currentPlayer].name}不叫`);
            this.currentPlayer = (this.currentPlayer + 1) % 3;
            
            // 如果三个人都不叫，重新发牌
            if (this.currentPlayer === Math.floor(Math.random() * 3)) {
                this.showMessage('无人叫地主，重新发牌');
                setTimeout(() => {
                    this.resetGame();
                    this.dealCards();
                }, 1500);
            } else {
                this.startBidding();
            }
        }
    }

    // 开始回合
    startTurn() {
        this.updateUI();
        
        if (this.players[this.currentPlayer].isAI) {
            setTimeout(() => {
                this.aiPlay();
            }, 1000);
        } else {
            document.getElementById('play-buttons').style.display = 'flex';
        }
    }

    // 玩家出牌
    playCards() {
        const selectedCards = this.players[0].cards.filter(c => c.selected);
        
        if (selectedCards.length === 0) {
            this.showMessage('请选择要出的牌');
            return;
        }

        const cardType = CardTypeAnalyzer.analyze(selectedCards);
        
        if (cardType.type === CARD_TYPE.INVALID) {
            this.showMessage('无效的牌型');
            return;
        }

        // 检查是否能打过上家的牌
        if (this.lastPlayedCards.length > 0 && this.lastPlayedPlayer !== 0) {
            if (!CardTypeAnalyzer.canBeat(selectedCards, this.lastPlayedCards)) {
                this.showMessage('打不过上家的牌');
                return;
            }
        }

        // 出牌成功
        this.players[0].removeCards(selectedCards);
        this.lastPlayedCards = selectedCards;
        this.lastPlayedPlayer = 0;
        this.passCount = 0;
        
        // 清除选中状态
        this.players[0].cards.forEach(c => c.selected = false);
        
        document.getElementById('play-buttons').style.display = 'none';
        this.showMessage('出牌成功');
        this.updateUI();
        
        // 检查是否获胜
        if (this.checkWin(0)) {
            return;
        }

        // 下一个玩家
        this.currentPlayer = (this.currentPlayer + 1) % 3;
        this.startTurn();
    }

    // 不出
    pass() {
        if (this.lastPlayedCards.length === 0 || this.lastPlayedPlayer === 0) {
            this.showMessage('你必须出牌');
            return;
        }

        this.showMessage('不出');
        this.passCount++;
        document.getElementById('play-buttons').style.display = 'none';
        
        // 清除选中状态
        this.players[0].cards.forEach(c => c.selected = false);
        
        // 如果连续两个人不出，清空上一次出牌
        if (this.passCount >= 2) {
            this.lastPlayedCards = [];
            this.lastPlayedPlayer = -1;
            this.passCount = 0;
        }

        this.currentPlayer = (this.currentPlayer + 1) % 3;
        this.startTurn();
    }

    // 提示
    hint() {
        const player = this.players[0];
        const validPlays = this.findValidPlays(player.cards, this.lastPlayedCards);
        
        if (validPlays.length === 0) {
            this.showMessage('没有能出的牌');
            return;
        }

        // 清除所有选中
        player.cards.forEach(c => c.selected = false);

        // 选中提示的牌
        validPlays[0].forEach(c => {
            const card = player.cards.find(pc => pc.suit === c.suit && pc.value === c.value);
            if (card) card.selected = true;
        });

        this.updateUI();
    }

    // AI出牌
    aiPlay() {
        const player = this.players[this.currentPlayer];
        const validPlays = this.findValidPlays(player.cards, this.lastPlayedCards);
        
        if (validPlays.length === 0) {
            this.showMessage(`${player.name}不出`);
            this.passCount++;
            
            if (this.passCount >= 2) {
                this.lastPlayedCards = [];
                this.lastPlayedPlayer = -1;
                this.passCount = 0;
            }
        } else {
            // 选择第一个合法的出牌方案
            const play = validPlays[0];
            player.removeCards(play);
            this.lastPlayedCards = play;
            this.lastPlayedPlayer = this.currentPlayer;
            this.passCount = 0;
            this.showMessage(`${player.name}出牌`);
            
            // 检查是否获胜
            if (this.checkWin(this.currentPlayer)) {
                return;
            }
        }

        this.currentPlayer = (this.currentPlayer + 1) % 3;
        this.startTurn();
    }

    // 查找合法出牌方案
    findValidPlays(cards, lastCards) {
        const plays = [];
        
        // 如果没有上一次出牌，可以出任意合法牌型
        if (lastCards.length === 0) {
            // 单张
            for (let card of cards) {
                plays.push([card]);
            }
            
            // 对子
            const pairs = this.findPairs(cards);
            plays.push(...pairs);
            
            // 三张
            const triples = this.findTriples(cards);
            plays.push(...triples);
            
            // 三带一
            const tripleOnes = this.findTripleOnes(cards);
            plays.push(...tripleOnes);
            
            // 三带二
            const triplePairs = this.findTriplePairs(cards);
            plays.push(...triplePairs);
            
            // 顺子
            const straights = this.findStraights(cards);
            plays.push(...straights);
            
            // 连对
            const pairStraights = this.findPairStraights(cards);
            plays.push(...pairStraights);
            
            // 炸弹
            const bombs = this.findBombs(cards);
            plays.push(...bombs);
            
            // 王炸
            const rocket = this.findRocket(cards);
            if (rocket) plays.push(rocket);
        } else {
            const lastType = CardTypeAnalyzer.analyze(lastCards);
            
            // 尝试找能打过的牌
            if (lastType.type === CARD_TYPE.SINGLE) {
                for (let card of cards) {
                    if (card.weight > lastType.weight) {
                        plays.push([card]);
                    }
                }
            } else if (lastType.type === CARD_TYPE.PAIR) {
                const pairs = this.findPairs(cards);
                for (let pair of pairs) {
                    if (pair[0].weight > lastType.weight) {
                        plays.push(pair);
                    }
                }
            } else if (lastType.type === CARD_TYPE.TRIPLE) {
                const triples = this.findTriples(cards);
                for (let triple of triples) {
                    if (triple[0].weight > lastType.weight) {
                        plays.push(triple);
                    }
                }
            } else if (lastType.type === CARD_TYPE.TRIPLE_ONE) {
                const tripleOnes = this.findTripleOnes(cards);
                for (let tripleOne of tripleOnes) {
                    const triple = tripleOne.slice(0, 3);
                    if (triple[0].weight > lastType.weight) {
                        plays.push(tripleOne);
                    }
                }
            } else if (lastType.type === CARD_TYPE.TRIPLE_PAIR) {
                const triplePairs = this.findTriplePairs(cards);
                for (let triplePair of triplePairs) {
                    const triple = triplePair.slice(0, 3);
                    if (triple[0].weight > lastType.weight) {
                        plays.push(triplePair);
                    }
                }
            } else if (lastType.type === CARD_TYPE.STRAIGHT) {
                const straights = this.findStraights(cards);
                for (let straight of straights) {
                    if (straight.length === lastType.length && straight[0].weight > lastType.weight) {
                        plays.push(straight);
                    }
                }
            } else if (lastType.type === CARD_TYPE.PAIR_STRAIGHT) {
                const pairStraights = this.findPairStraights(cards);
                for (let pairStraight of pairStraights) {
                    if (pairStraight.length === lastType.length && pairStraight[0].weight > lastType.weight) {
                        plays.push(pairStraight);
                    }
                }
            } else if (lastType.type === CARD_TYPE.BOMB) {
                const bombs = this.findBombs(cards);
                for (let bomb of bombs) {
                    if (bomb[0].weight > lastType.weight) {
                        plays.push(bomb);
                    }
                }
                // 王炸可以打炸弹
                const rocket = this.findRocket(cards);
                if (rocket) plays.push(rocket);
            }
            
            // 炸弹可以打非炸弹
            if (lastType.type !== CARD_TYPE.BOMB && lastType.type !== CARD_TYPE.ROCKET) {
                const bombs = this.findBombs(cards);
                plays.push(...bombs);
                
                const rocket = this.findRocket(cards);
                if (rocket) plays.push(rocket);
            }
        }

        return plays;
    }

    // 查找对子
    findPairs(cards) {
        const pairs = [];
        const counts = {};
        cards.forEach(c => {
            counts[c.weight] = (counts[c.weight] || 0) + 1;
        });
        
        for (let weight in counts) {
            if (counts[weight] >= 2) {
                const pairCards = cards.filter(c => c.weight === parseInt(weight)).slice(0, 2);
                pairs.push(pairCards);
            }
        }
        
        return pairs;
    }

    // 查找三张
    findTriples(cards) {
        const triples = [];
        const counts = {};
        cards.forEach(c => {
            counts[c.weight] = (counts[c.weight] || 0) + 1;
        });
        
        for (let weight in counts) {
            if (counts[weight] >= 3) {
                const tripleCards = cards.filter(c => c.weight === parseInt(weight)).slice(0, 3);
                triples.push(tripleCards);
            }
        }
        
        return triples;
    }

    // 查找三带一
    findTripleOnes(cards) {
        const tripleOnes = [];
        const triples = this.findTriples(cards);
        
        for (let triple of triples) {
            const remainingCards = cards.filter(c => 
                !triple.some(t => t.suit === c.suit && t.value === c.value)
            );
            
            for (let card of remainingCards) {
                tripleOnes.push([...triple, card]);
            }
        }
        
        return tripleOnes;
    }

    // 查找三带二
    findTriplePairs(cards) {
        const triplePairs = [];
        const triples = this.findTriples(cards);
        const pairs = this.findPairs(cards);
        
        for (let triple of triples) {
            for (let pair of pairs) {
                if (!pair.some(p => triple.some(t => t.suit === p.suit && t.value === p.value))) {
                    triplePairs.push([...triple, ...pair]);
                }
            }
        }
        
        return triplePairs;
    }

    // 查找顺子
    findStraights(cards) {
        const straights = [];
        const sortedCards = [...cards].sort((a, b) => a.weight - b.weight);
        
        // 过滤掉2和王
        const validCards = sortedCards.filter(c => c.weight <= 14);
        
        for (let i = 0; i <= validCards.length - 5; i++) {
            for (let j = i + 5; j <= validCards.length; j++) {
                const subset = validCards.slice(i, j);
                if (this.isConsecutive(subset)) {
                    straights.push(subset);
                }
            }
        }
        
        return straights;
    }

    // 查找连对
    findPairStraights(cards) {
        const pairStraights = [];
        const counts = {};
        cards.forEach(c => {
            counts[c.weight] = (counts[c.weight] || 0) + 1;
        });
        
        const pairWeights = [];
        for (let weight in counts) {
            if (counts[weight] >= 2 && parseInt(weight) <= 14) {
                pairWeights.push(parseInt(weight));
            }
        }
        
        pairWeights.sort((a, b) => a - b);
        
        for (let i = 0; i <= pairWeights.length - 3; i++) {
            for (let j = i + 3; j <= pairWeights.length; j++) {
                const subset = pairWeights.slice(i, j);
                if (this.isConsecutive(subset.map(w => ({ weight: w })))) {
                    const pairStraight = [];
                    for (let weight of subset) {
                        const pair = cards.filter(c => c.weight === weight).slice(0, 2);
                        pairStraight.push(...pair);
                    }
                    pairStraights.push(pairStraight);
                }
            }
        }
        
        return pairStraights;
    }

    // 查找炸弹
    findBombs(cards) {
        const bombs = [];
        const counts = {};
        cards.forEach(c => {
            counts[c.weight] = (counts[c.weight] || 0) + 1;
        });
        
        for (let weight in counts) {
            if (counts[weight] === 4) {
                const bombCards = cards.filter(c => c.weight === parseInt(weight));
                bombs.push(bombCards);
            }
        }
        
        return bombs;
    }

    // 查找王炸
    findRocket(cards) {
        const smallJoker = cards.find(c => c.value === '小王');
        const bigJoker = cards.find(c => c.value === '大王');
        
        if (smallJoker && bigJoker) {
            return [smallJoker, bigJoker];
        }
        
        return null;
    }

    // 判断是否连续
    isConsecutive(cards) {
        if (cards.length < 2) return false;
        for (let i = 1; i < cards.length; i++) {
            if (cards[i].weight - cards[i - 1].weight !== 1) return false;
        }
        return true;
    }

    // 检查获胜
    checkWin(playerIndex) {
        const player = this.players[playerIndex];
        
        if (player.getCardCount() === 0) {
            this.gameState = 'ended';
            
            let winnerRole = player.role;
            let isWin = (winnerRole === 'landlord' && this.landlord === playerIndex) ||
                       (winnerRole === 'farmer' && this.landlord !== playerIndex);
            
            if (isWin) {
                this.score += winnerRole === 'landlord' ? 3 : 1;
                this.showGameOver('恭喜！你赢了！', `${player.name}获胜！`);
            } else {
                this.score -= winnerRole === 'landlord' ? 3 : 1;
                this.showGameOver('很遗憾，你输了', `${player.name}获胜！`);
            }
            
            document.getElementById('play-buttons').style.display = 'none';
            document.getElementById('restart-buttons').style.display = 'flex';
            this.updateUI();
            
            return true;
        }
        
        return false;
    }

    // 显示游戏结束
    showGameOver(title, message) {
        document.getElementById('game-over-title').textContent = title;
        document.getElementById('game-over-message').textContent = message;
        document.getElementById('game-over-modal').style.display = 'flex';
    }

    // 显示消息
    showMessage(message) {
        const messageEl = document.getElementById('game-message');
        messageEl.textContent = message;
        messageEl.style.animation = 'none';
        messageEl.offsetHeight; // 触发重排
        messageEl.style.animation = 'fadeIn 0.3s ease';
    }

    // 更新UI
    updateUI() {
        // 更新分数
        document.getElementById('score').textContent = this.score;
        
        // 更新当前玩家
        document.getElementById('currentPlayer').textContent = this.players[this.currentPlayer].name;
        
        // 更新玩家手牌
        for (let i = 0; i < 3; i++) {
            const player = this.players[i];
            const cardsContainer = document.getElementById(`player${i}-cards`);
            const countEl = document.getElementById(`player${i}-count`);
            const roleEl = document.getElementById(`player${i}-role`);
            
            // 更新卡牌数量
            countEl.textContent = `${player.getCardCount()}张`;
            
            // 更新角色
            roleEl.textContent = player.role === 'landlord' ? '地主' : '农民';
            roleEl.className = `player-role ${player.role}`;
            
            // 清空并重新渲染卡牌
            cardsContainer.innerHTML = '';
            
            if (i === 0) {
                // 玩家的牌显示正面
                player.cards.forEach(card => {
                    const cardEl = this.createCardElement(card);
                    cardEl.onclick = () => this.toggleCardSelection(card);
                    if (card.selected) {
                        cardEl.classList.add('selected');
                    }
                    cardsContainer.appendChild(cardEl);
                });
            } else {
                // 电脑的牌显示背面
                for (let j = 0; j < player.getCardCount(); j++) {
                    const cardEl = document.createElement('div');
                    cardEl.className = 'card card-back';
                    cardEl.textContent = '牌';
                    cardsContainer.appendChild(cardEl);
                }
            }
        }
        
        // 更新底牌
        const baseCardsContainer = document.getElementById('base-cards-container');
        baseCardsContainer.innerHTML = '';
        
        if (this.gameState === 'playing' || this.gameState === 'ended') {
            this.baseCards.forEach(card => {
                const cardEl = this.createCardElement(card);
                baseCardsContainer.appendChild(cardEl);
            });
        } else {
            for (let i = 0; i < 3; i++) {
                const cardEl = document.createElement('div');
                cardEl.className = 'card card-back';
                cardEl.textContent = '?';
                baseCardsContainer.appendChild(cardEl);
            }
        }
        
        // 更新出牌区域
        this.updatePlayedCards();
    }

    // 更新出牌区域
    updatePlayedCards() {
        for (let i = 0; i < 3; i++) {
            const container = document.getElementById(`played-cards-player${i}`);
            if (container) {
                container.innerHTML = '';
                
                if (this.lastPlayedPlayer === i && this.lastPlayedCards.length > 0) {
                    this.lastPlayedCards.forEach(card => {
                        const cardEl = this.createCardElement(card);
                        container.appendChild(cardEl);
                    });
                }
            }
        }
    }

    // 创建卡牌元素
    createCardElement(card) {
        const cardEl = document.createElement('div');
        cardEl.className = `card ${card.getColor()}`;
        
        const valueEl = document.createElement('div');
        valueEl.className = 'card-value';
        valueEl.textContent = card.getDisplayText();
        
        const suitEl = document.createElement('div');
        suitEl.className = 'card-suit';
        suitEl.textContent = card.suit;
        
        cardEl.appendChild(valueEl);
        cardEl.appendChild(suitEl);
        
        return cardEl;
    }

    // 切换卡牌选中状态
    toggleCardSelection(card) {
        if (this.gameState !== 'playing' || this.currentPlayer !== 0) return;
        
        card.selected = !card.selected;
        this.updateUI();
    }

    // 重置游戏
    resetGame() {
        this.players.forEach(player => player.clearCards());
        this.baseCards = [];
        this.landlord = null;
        this.currentPlayer = 0;
        this.lastPlayedCards = [];
        this.lastPlayedPlayer = -1;
        this.gameState = 'waiting';
        this.passCount = 0;
        this.createDeck();
    }

    // 开始新游戏
    startNewGame() {
        this.resetGame();
        this.dealCards();
    }
}

// 作弊功能类
class Cheat {
    constructor(game) {
        this.game = game;
    }

    // 查看底牌
    showBaseCards() {
        const baseCardsContainer = document.getElementById('base-cards-container');
        baseCardsContainer.innerHTML = '';
        
        this.game.baseCards.forEach(card => {
            const cardEl = this.game.createCardElement(card);
            baseCardsContainer.appendChild(cardEl);
        });
        
        this.game.showMessage('已显示底牌');
    }

    // 查看所有牌
    seeAllCards() {
        for (let i = 1; i < 3; i++) {
            const player = this.game.players[i];
            const cardsContainer = document.getElementById(`player${i}-cards`);
            cardsContainer.innerHTML = '';
            
            player.cards.forEach(card => {
                const cardEl = this.game.createCardElement(card);
                cardsContainer.appendChild(cardEl);
            });
        }
        
        this.game.showMessage('已显示所有牌');
    }

    // 换好牌
    exchangeCards() {
        const player = this.game.players[0];
        player.clearCards();
        
        // 给玩家一副好牌
        const goodCards = [
            new Card('♠', '大王'),
            new Card('♥', '小王'),
            new Card('♦', '2'),
            new Card('♣', '2'),
            new Card('♠', 'A'),
            new Card('♥', 'A'),
            new Card('♦', 'A'),
            new Card('♣', 'K'),
            new Card('♠', 'K'),
            new Card('♥', 'K'),
            new Card('♦', 'Q'),
            new Card('♣', 'Q'),
            new Card('♠', 'Q'),
            new Card('♥', 'J'),
            new Card('♣', 'J'),
            new Card('♦', '10'),
            new Card('♠', '10')
        ];
        
        player.addCards(goodCards);
        this.game.updateUI();
        this.game.showMessage('已换好牌');
    }

    // 必胜牌型
    autoWin() {
        const player = this.game.players[0];
        player.clearCards();
        
        // 给玩家王炸和炸弹
        const winCards = [
            new Card('', '大王'),
            new Card('', '小王'),
            new Card('♠', '2'),
            new Card('♥', '2'),
            new Card('♦', '2'),
            new Card('♣', '2'),
            new Card('♠', 'A'),
            new Card('♥', 'A'),
            new Card('♦', 'A'),
            new Card('♣', 'A'),
            new Card('♠', 'K'),
            new Card('♥', 'K'),
            new Card('♦', 'K'),
            new Card('♣', 'K'),
            new Card('♠', 'Q'),
            new Card('♥', 'Q'),
            new Card('♦', 'Q'),
            new Card('♣', 'Q'),
            new Card('♠', 'J'),
            new Card('♥', 'J')
        ];
        
        player.addCards(winCards);
        this.game.updateUI();
        this.game.showMessage('已设置必胜牌型');
    }

    // 加分
    addScore() {
        this.game.score += 100;
        document.getElementById('score').textContent = this.game.score;
        this.game.showMessage('已增加100分');
    }

    // 重置分数
    resetScore() {
        this.game.score = 0;
        document.getElementById('score').textContent = this.game.score;
        this.game.showMessage('已重置分数');
    }
}

// 全局变量
let game;
let cheat;

// 初始化游戏
function initGame() {
    game = new Game();
    game.init();
    cheat = new Cheat(game);
}

// 开始游戏
function startGame() {
    game.dealCards();
}

// 切换作弊面板
function toggleCheatPanel() {
    const cheatContent = document.getElementById('cheat-content');
    cheatContent.style.display = cheatContent.style.display === 'none' ? 'block' : 'none';
}

// 关闭弹窗
function closeModal() {
    document.getElementById('game-over-modal').style.display = 'none';
}

// 页面加载完成后初始化
window.onload = function() {
    initGame();
    setTimeout(() => {
        startGame();
    }, 500);
};
