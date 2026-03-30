#!/usr/bin/env python3
"""
WeChat Token Signal - 社群热度排行
实时统计代币社群热度，每100条数据输出一次 TOP N 排行

用法: python community-rank.py [TOP_N]
依赖: pip install websockets
"""

import asyncio
import json
import sys
from collections import defaultdict

import websockets

WS_URL = 'ws://43.254.167.238:3000/token'
TOP_N = int(sys.argv[1]) if len(sys.argv) > 1 else 10


async def track():
    tokens = defaultdict(dict)
    count = 0

    while True:
        try:
            async with websockets.connect(WS_URL) as ws:
                print(f'已连接，统计社群热度 TOP {TOP_N}...\n')
                async for message in ws:
                    try:
                        t = json.loads(message)
                        count += 1

                        tokens[t.get('symbol', '?')] = {
                            'chain': t.get('chain', '?'),
                            'sqzs': t.get('sqzs', 0),
                            'cazs': t.get('cazs', 0),
                            'qwfc': t.get('qwfc', 0),
                            'fgq': t.get('fgq', 0),
                            'sfzf': t.get('sfzf', '-'),
                            'sfr': t.get('sfr', '-'),
                            'market_cap': t.get('new_market_cap_format', t.get('market_cap', '?')),
                            'price': t.get('current_price_usd', '?'),
                        }

                        # 每100条输出排行
                        if count % 100 == 0:
                            ranked = sorted(
                                tokens.items(),
                                key=lambda x: x[1].get('sqzs', 0),
                                reverse=True,
                            )

                            print(f'\n{"=" * 70}')
                            print(f'  社群热度 TOP {TOP_N}（已处理 {count} 条数据，{len(tokens)} 个代币）')
                            print(f'{"=" * 70}')

                            for i, (sym, d) in enumerate(ranked[:TOP_N]):
                                heat = (
                                    d.get('sqzs', 0) * 0.4
                                    + d.get('fgq', 0) * 10 * 0.3
                                    + d.get('qwfc', 0) * 0.2
                                    + d.get('cazs', 0) * 0.1
                                )
                                print(
                                    f'  {i + 1:>2}. {sym:<12} | {d["chain"]:<6} | '
                                    f'社群指数:{d["sqzs"]:<5} | 覆盖{d["fgq"]}群 | '
                                    f'分享{d["qwfc"]}次 | 倍数:{d["sfzf"]:<10} | '
                                    f'市值:{d["market_cap"]}'
                                )

                            print()

                    except json.JSONDecodeError:
                        pass

        except (websockets.ConnectionClosed, ConnectionRefusedError, OSError) as e:
            print(f'\n连接断开 ({e})，5秒后重连...')
            await asyncio.sleep(5)


if __name__ == '__main__':
    asyncio.run(track())
