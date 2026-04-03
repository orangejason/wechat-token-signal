# 应用场景详解

## 场景 1: 早期 Alpha 发现（Tokens + People）

利用社群信号数据，追踪高质量推荐人推荐的新代币。

### 策略

1. 使用**修正后的胜率** > 60%（不使用原始 `sender_win_rate`）
2. 关注 `sfsj` 在 1 小时内的新推荐代币
3. `risk_score >= 60` 过滤高风险项目
4. `is_honeypot !== '1'` 排除蜜罐
5. `fgq > 3` 确认多群覆盖

### 信号强度评估

| 条件 | 权重 | 说明 |
|------|------|------|
| 修正胜率 > 60% | 高 | 历史表现优秀 |
| 推荐时间 < 30 分钟 | 高 | 极早期发现 |
| 覆盖群数 `fgq` > 5 | 中 | 多群同时关注 |
| 风险分 > 70 | 中 | 合约安全 |
| 买入量/卖出量 > 3x | 中 | 买方力量强势 |
| `sender_total_tokens` > 50 | 中 | 样本量可信 |

### 实现

```javascript
ws.on('message', (data) => {
  const t = JSON.parse(data);
  const caller = t.sfr || t.cxr || '未知';
  const winTokens = parseInt(t.sender_win_tokens) || 0;
  const totalTokens = t.sender_total_tokens || 0;
  const correctedWinRate = totalTokens > 0 ? (winTokens / totalTokens * 100) : 0;
  const minutesAgo = (Date.now() - new Date(t.sfsj).getTime()) / 60000;

  if (correctedWinRate > 60 && totalTokens > 50 &&
      minutesAgo < 60 && parseInt(t.risk_score) >= 60 && t.fgq > 3) {
    console.log(`Alpha: ${t.symbol} by ${caller}`);
    console.log(`  修正胜率: ${correctedWinRate.toFixed(1)}% | 覆盖: ${t.fgq}群`);
  }
});
```

---

## 场景 2: 实时监控看板（Tokens）

构建实时仪表板展示代币核心指标。

### 关键指标

| 指标 | 数据源 | 字段 |
|------|--------|------|
| 实时价格 | WS | `current_price_usd` |
| 5m 涨幅 | WS | `price_change_5m` |
| 买卖比 | WS | `buy_volume_u_5m / sell_volume_u_5m` |
| 持有人数 | WS | `holders` |
| 覆盖群数 | WS | `fgq` |
| 全网提及次数 | WS | `qwfc` |
| 推荐倍数 | WS | `sfzf` |

### 持久化建议

- 设置 60 秒去重窗口避免重复记录
- 大文件（400MB+）使用 Worker Threads 异步读写
- 流式 JSON 序列化避免阻塞

---

## 场景 3: 风控预警（Tokens: risk）

基于风险字段构建实时预警。

### 预警规则

| 规则 | 触发条件 | 等级 |
|------|----------|------|
| 蜜罐 | `is_honeypot === '1'` | 极高 |
| 可增发 | `is_mintable === '1'` | 高 |
| 钓鱼钱包 | `phishing_wallet_rate > 0.1` | 高 |
| 捆绑钱包 | `bundle_wallet_rate > 0.2` | 高 |
| Rug Pull | `rug_risk_rate > 0.3` | 极高 |
| 持仓集中 | TOP1 `zbbl > 50%` | 高 |

---

## 场景 4: 社群信号聚合（Groups: ranking）

跨多个群聚合信号，发现正在传播的热门代币。

### 热度排行

```python
heat_score = sqzs * 0.4 + fgq * 10 * 0.3 + qwfc * 0.2 + cazs * 0.1
```

### 扩散阶段

1. **萌芽期**: `fgq <= 2`
2. **扩散期**: `fgq` 3-10
3. **爆发期**: `fgq > 10`
4. **衰退期**: 新分享减少

---

## 场景 5: 推荐人跟踪（People: performance）

建立推荐人画像，跟踪高质量推荐者。

### 评估维度

| 维度 | 字段 | 权重 |
|------|------|------|
| 修正胜率 | `sender_win_tokens / sender_total_tokens` | 40% |
| 推荐数量 | `sender_total_tokens` | 20% |
| 最佳倍数 | `sender_best_multiple` | 20% |
| 成功数量 | `sender_win_tokens` | 20% |

### 人物分级

| 等级 | 条件 |
|------|------|
| S 级 | 修正胜率 > 65% 且推荐 > 100 且最佳 > 1000x |
| A 级 | 修正胜率 > 55% 且推荐 > 50 |
| B 级 | 修正胜率 > 45% 且推荐 > 20 |
| C 级 | 其他 |

---

## 场景 6: 三维关系追踪（People × Groups × Tokens）

追踪"谁在哪个群推荐了哪个币"的完整链路。

### 数据模型

```
人(sfr/cxr)
  └─ 推荐了代币(token)
       └─ 在群(qun_id/qun_name)
            └─ 时间(sfsj/created)
```

### 查询维度

| 查询 | 数据源 | 说明 |
|------|--------|------|
| 某代币被谁推荐 | HTTP `/token` | 返回所有推荐者和群 |
| 某人推荐过什么 | HTTP `/member` | 返回全部推荐历史 |
| 某群的推荐记录 | HTTP `/group` | 返回群内全部记录 |
| 实时推荐流 | WS | 自行累积建立关系图 |
