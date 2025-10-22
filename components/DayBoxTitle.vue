<template>
  <div class="day-box-title-container">
    <svg ref="svgRef" class="day-box-title-svg"></svg>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick, watchEffect } from 'vue';
import * as d3 from 'd3';

// Props定義
interface DayBoxTitleProps {
  dayOfWeek: number;  // 0=日曜日, 1=月曜日, ..., 6=土曜日
}

const props = defineProps<DayBoxTitleProps>();

// SVG要素の参照
const svgRef = ref<SVGSVGElement | null>(null);

// 描画関数
const drawDayBoxTitle = () => {
  console.log('drawDayBoxTitle called, svgRef.value:', svgRef.value);

  // svgRefが利用できない場合、DOM要素を直接取得
  let svgElement = svgRef.value;
  if (!svgElement) {
    console.log('svgRef.value is null, trying to find SVG element directly');
    const container = document.querySelector('.day-box-title-container');
    if (container) {
      svgElement = container.querySelector('svg') as SVGSVGElement;
      console.log('Found SVG element directly:', svgElement);
    }
  }

  if (!svgElement) {
    console.log('SVG要素が見つかりません - すべての方法で失敗');
    return;
  }

  console.log('DayBoxTitle描画開始', props.dayOfWeek);

  // SVGをクリア
  d3.select(svgElement).selectAll('*').remove();

  // SVGサイズ設定
  const width = 140; // DayBoxと同じ横幅
  const height = 25; // 文字1行程度の高さ

  // SVGサイズを設定
  d3.select(svgElement)
    .attr('width', width)
    .attr('height', height);

  console.log('SVGサイズ設定完了', width, height);

  // メイングループ
  const g = d3.select(svgElement)
    .append('g')
    .attr('transform', 'translate(0, 0)');

  // 曜日の文字列
  const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
  const dayName = dayNames[props.dayOfWeek];

  // 背景色と文字色を決定
  const isSunday = props.dayOfWeek === 0;
  const isSaturday = props.dayOfWeek === 6;

  let backgroundColor = 'white';
  let textColor = '#333333';

  if (isSunday) {
    // 日曜日：薄い赤背景、赤文字
    backgroundColor = '#ffebee';
    textColor = '#d32f2f';
  } else if (isSaturday) {
    // 土曜日：薄い青背景、青文字
    backgroundColor = '#e3f2fd';
    textColor = '#1976d2';
  } else {
    // 平日：白背景、黒文字
    backgroundColor = 'white';
    textColor = '#333333';
  }

  // 背景を描画
  const backgroundRect = g.append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', width)
    .attr('height', height)
    .attr('fill', backgroundColor)
    .attr('stroke', '#333333')
    .attr('stroke-width', 0.25);

  console.log('背景描画完了', backgroundRect.node());

  // 曜日文字を描画（中央配置）
  const dayText = g.append('text')
    .attr('x', width / 2)
    .attr('y', height / 2 + 5) // 中央に配置（文字のベースライン調整）
    .attr('text-anchor', 'middle')
    .attr('font-family', 'Arial, sans-serif')
    .attr('font-size', '14px')
    .attr('font-weight', 'bold')
    .attr('fill', textColor)
    .text(dayName);

  console.log('曜日文字描画完了', dayName, dayText.node());

  console.log('DayBoxTitle描画完了', svgElement.innerHTML);
};

// SVG要素が利用可能になった時点で描画
watchEffect(() => {
  console.log('watchEffect triggered, svgRef.value:', svgRef.value);
  if (svgRef.value) {
    console.log('SVG要素が利用可能になりました');
    drawDayBoxTitle();
  }
});

// コンポーネントマウント時とprops変更時に描画
onMounted(() => {
  console.log('DayBoxTitle onMounted', svgRef.value);
  nextTick(() => {
    console.log('DayBoxTitle nextTick', svgRef.value);
    if (svgRef.value) {
      drawDayBoxTitle();
    } else {
      // SVG要素がまだ利用できない場合、少し遅延して再試行
      setTimeout(() => {
        console.log('setTimeout retry, svgRef.value:', svgRef.value);
        if (svgRef.value) {
          drawDayBoxTitle();
        }
      }, 100);
    }
  });
});

watch(() => props.dayOfWeek, () => {
  console.log('DayBoxTitle props changed', svgRef.value);
  nextTick(() => {
    if (svgRef.value) {
      drawDayBoxTitle();
    }
  });
});
</script>

<style scoped>
.day-box-title-container {
  display: inline-block;
  margin: 0px;
  border: none;
  box-sizing: border-box;
}

.day-box-title-svg {
  display: block;
  width: 140px;
  height: 25px;
}
</style>
