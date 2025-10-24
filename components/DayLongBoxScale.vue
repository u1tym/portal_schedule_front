<template>
  <div class="daylong-box-scale-container">
    <svg ref="svgRef" class="daylong-box-scale-svg"></svg>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick, watchEffect } from 'vue';
import * as d3 from 'd3';

const svgRef = ref<SVGSVGElement | null>(null);

// 描画関数
const drawDayLongBoxScale = () => {
  console.log('drawDayLongBoxScale called, svgRef.value:', svgRef.value);

  // svgRefが利用できない場合、DOM要素を直接取得
  let svgElement = svgRef.value;
  if (!svgElement) {
    console.log('svgRef.value is null, trying to find SVG element directly');
    const container = document.querySelector('.daylong-box-scale-container');
    if (container) {
      svgElement = container.querySelector('svg') as SVGSVGElement;
      console.log('Found SVG element directly:', svgElement);
    }
  }

  if (!svgElement) {
    console.log('SVG要素が見つかりません - すべての方法で失敗');
    return;
  }

  console.log('DayLongBoxScale描画開始');

  // SVGをクリア
  d3.select(svgElement).selectAll('*').remove();

  // SVGサイズ設定
  const width = 60; // スケールの幅
  const allDayAreaHeight = 60; // 終日エリアの高さ
  const hourHeight = 50; // 1時間の高さ
  const height = allDayAreaHeight + (24 * hourHeight); // 終日エリア + 24時間分の高さ

  // SVGサイズを設定
  d3.select(svgElement)
    .attr('width', width)
    .attr('height', height);

  console.log('SVGサイズ設定完了', width, height);

  // メイングループ
  const g = d3.select(svgElement)
    .append('g')
    .attr('transform', 'translate(0, 0)');

  // 背景
  g.append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', width)
    .attr('height', height)
    .attr('fill', '#f8f9fa')
    .attr('stroke', '#333333')
    .attr('stroke-width', 0.25);

  // 終日エリア
  g.append('rect')
    .attr('x', 5)
    .attr('y', 5)
    .attr('width', width - 10)
    .attr('height', allDayAreaHeight)
    .attr('fill', 'transparent')
    .attr('stroke', '#e0e0e0')
    .attr('stroke-width', 0.5)
    .attr('stroke-dasharray', '2,2');

  // 終日ラベル
  g.append('text')
    .attr('x', width / 2)
    .attr('y', 20)
    .attr('text-anchor', 'middle')
    .attr('font-family', 'Arial, sans-serif')
    .attr('font-size', '10px')
    .attr('fill', '#666666')
    .text('終日');

  // 24時間分の時間線と時刻表示
  for (let hour = 0; hour < 24; hour++) {
    const y = 5 + allDayAreaHeight + (hour * hourHeight);

    // 時間線（横線）
    g.append('line')
      .attr('x1', 5)
      .attr('y1', y)
      .attr('x2', width - 5)
      .attr('y2', y)
      .attr('stroke', '#cccccc')
      .attr('stroke-width', 0.5);

    // 時刻表示
    const timeText = hour.toString().padStart(2, '0') + ':00';
    g.append('text')
      .attr('x', 8)
      .attr('y', y + 15)
      .attr('font-family', 'Arial, sans-serif')
      .attr('font-size', '10px')
      .attr('fill', '#333333')
      .text(timeText);
  }

  console.log('DayLongBoxScale描画完了', svgElement.innerHTML);
};

// SVG要素が利用可能になった時点で描画
watchEffect(() => {
  console.log('watchEffect triggered, svgRef.value:', svgRef.value);
  if (svgRef.value) {
    console.log('SVG要素が利用可能になりました');
    drawDayLongBoxScale();
  }
});

onMounted(() => {
  nextTick(() => {
    if (svgRef.value) {
      drawDayLongBoxScale();
    } else {
      setTimeout(() => {
        if (svgRef.value) {
          drawDayLongBoxScale();
        }
      }, 100);
    }
  });
});
</script>

<style scoped>
.daylong-box-scale-container {
  display: inline-block;
  margin: 0px;
  border: none;
  box-sizing: border-box;
}

.daylong-box-scale-svg {
  display: block;
  width: 60px;
  height: 1260px; /* 60px (終日エリア) + 24 * 50px (時間エリア) = 1260px */
}
</style>
