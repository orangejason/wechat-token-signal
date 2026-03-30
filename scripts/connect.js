#!/usr/bin/env node
/**
 * WeChat Token Signal - 基础连接示例
 * 连接 WebSocket 并打印实时代币数据
 *
 * 用法: node connect.js
 * 依赖: npm install ws
 */

const WebSocket = require('ws');

const WS_URL = 'ws://43.254.167.238:3000/token';
let reconnectDelay = 5000;
let messageCount = 0;

function connect() {
  console.log(`正在连接 ${WS_URL} ...`);
  const ws = new WebSocket(WS_URL);

  ws.on('open', () => {
    console.log('已连接，等待数据推送...\n');
    reconnectDelay = 5000;
  });

  ws.on('message', (data) => {
    try {
      const token = JSON.parse(data);
      messageCount++;

      const sfzf = token.sfzf ? ` | 首发倍数: ${token.sfzf}` : '';
      const sfr = token.sfr ? ` | 首发人: ${token.sfr}` : '';
      const risk = token.risk_score ? ` | 风险分: ${token.risk_score}` : '';

      console.log(
        `[${messageCount}] ${token.symbol} | ${token.chain} | ` +
        `$${token.current_price_usd} | 市值: ${token.new_market_cap_format || token.market_cap}` +
        `${sfzf}${sfr}${risk}`
      );
    } catch (e) {
      console.error('数据解析错误:', e.message);
    }
  });

  ws.on('close', () => {
    console.log(`\n连接断开，${reconnectDelay / 1000}秒后重连...`);
    setTimeout(connect, reconnectDelay);
    reconnectDelay = Math.min(reconnectDelay * 1.5, 30000);
  });

  ws.on('error', (err) => {
    console.error('连接错误:', err.message);
  });
}

connect();
