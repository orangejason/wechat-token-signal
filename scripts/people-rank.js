#!/usr/bin/env node
/**
 * WeChat Token Signal - 人物推荐排行
 * 实时统计推荐人的修正胜率和推荐数量排行
 *
 * 用法: node people-rank.js [TOP_N]
 * 依赖: npm install ws
 */

const WebSocket = require('ws');

const WS_URL = 'ws://43.254.167.238:3000/token';
const TOP_N = parseInt(process.argv[2] || '10');

const people = {};
let count = 0;

function connect() {
  const ws = new WebSocket(WS_URL);

  ws.on('open', () => {
    console.log(`=== 推荐人排行 TOP ${TOP_N} ===`);
    console.log('等待数据...\n');
  });

  ws.on('message', (data) => {
    try {
      const t = JSON.parse(data);
      count++;

      const caller = t.sfr || t.cxr || t.qy_name;
      if (!caller || caller === '未知') return;

      if (!people[caller]) {
        people[caller] = { tokens: new Set(), totalTokens: 0, winTokens: 0, bestMultiple: 0 };
      }

      people[caller].tokens.add(t.token);
      people[caller].totalTokens = t.sender_total_tokens || people[caller].totalTokens;
      people[caller].winTokens = parseInt(t.sender_win_tokens) || people[caller].winTokens;
      people[caller].bestMultiple = Math.max(
        people[caller].bestMultiple,
        parseFloat(t.sender_best_multiple) || 0
      );

      // 每 100 条输出排行
      if (count % 100 === 0) {
        const ranked = Object.entries(people)
          .map(([name, d]) => ({
            name,
            totalTokens: d.totalTokens,
            winTokens: d.winTokens,
            // 修正胜率
            correctedRate: d.totalTokens > 0 ? (d.winTokens / d.totalTokens * 100) : 0,
            bestMultiple: d.bestMultiple,
            seenTokens: d.tokens.size,
          }))
          .filter(p => p.totalTokens > 10) // 最低样本量
          .sort((a, b) => b.correctedRate - a.correctedRate);

        console.log(`\n${'='.repeat(80)}`);
        console.log(`  推荐人排行 TOP ${TOP_N}（已处理 ${count} 条，${Object.keys(people).length} 个推荐人）`);
        console.log(`${'='.repeat(80)}`);

        ranked.slice(0, TOP_N).forEach((p, i) => {
          console.log(
            `  ${String(i + 1).padStart(2)}. ${p.name.padEnd(15)} | ` +
            `修正胜率: ${p.correctedRate.toFixed(1)}% | ` +
            `推荐: ${p.totalTokens} | ` +
            `盈利: ${p.winTokens} | ` +
            `最佳: ${p.bestMultiple.toFixed(1)}x`
          );
        });
        console.log();
      }
    } catch (e) {
      // ignore
    }
  });

  ws.on('close', () => setTimeout(connect, 5000));
  ws.on('error', () => {});
}

connect();
