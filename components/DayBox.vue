<template>
  <div class="day-box-container">
    <svg ref="svgRef" class="day-box-svg"></svg>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick, watchEffect } from 'vue';
import * as d3 from 'd3';

// スケジュール情報の型定義
interface ScheduleInfo {
  id: number;           // スケジュールのID
  title: string;        // タイトル
  isAllDay: boolean;    // 終日フラグ
  startDateTime: Date;  // 開始日時
  duration: number;     // 期間
  isTodoCompleted: boolean; // TODO完了フラグ
  color: string;        // 描画色
}

// Props定義
interface DayBoxProps {
  date: Date;                    // 年月日
  holidayNote?: string;          // 休日注釈
  schedules?: ScheduleInfo[];     // スケジュール情報の配列
}

const props = withDefaults(defineProps<DayBoxProps>(), {
  holidayNote: '',
  schedules: () => []
});

// SVG要素の参照
const svgRef = ref<SVGSVGElement | null>(null);

// 描画関数
const drawDayBox = () => {
  console.log('drawDayBox called, svgRef.value:', svgRef.value);

  // svgRefが利用できない場合、DOM要素を直接取得
  let svgElement = svgRef.value;
  if (!svgElement) {
    console.log('svgRef.value is null, trying to find SVG element directly');
    const container = document.querySelector('.day-box-container');
    if (container) {
      svgElement = container.querySelector('svg') as SVGSVGElement;
      console.log('Found SVG element directly:', svgElement);
    }
  }

  if (!svgElement) {
    console.log('SVG要素が見つかりません - すべての方法で失敗');
    return;
  }

  console.log('DayBox描画開始', props.date, props.holidayNote, props.schedules);

  // SVGをクリア
  d3.select(svgElement).selectAll('*').remove();

  // SVGサイズ設定
  const width = 140;
  const height = 100;

  // SVGサイズを設定
  d3.select(svgElement)
    .attr('width', width)
    .attr('height', height);

  console.log('SVGサイズ設定完了', width, height);

  // メイングループ
  const g = d3.select(svgElement)
    .append('g')
    .attr('transform', 'translate(0, 0)'); // マージンを0に設定

  // 外枠を描画
  const borderRect = g.append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', width)
    .attr('height', height)
    .attr('fill', 'none')
    .attr('stroke', '#333333')
    .attr('stroke-width', 0.25);

  console.log('外枠描画完了', borderRect.node());

  // 日付を描画（左端に配置）
  const dayText = props.date.getDate().toString();
  const dayTextElement = g.append('text')
    .attr('x', 8)
    .attr('y', 20)
    .attr('text-anchor', 'start')
    .attr('font-family', 'Arial, sans-serif')
    .attr('font-size', '16px')
    .attr('font-weight', 'bold')
    .attr('fill', '#333333')
    .text(dayText);

  console.log('日付描画完了', dayText, dayTextElement.node());

  // 休日注釈がある場合の描画（右上に配置）
  if (props.holidayNote) {
    // 文字の幅を計算（おおよその計算）
    const fontSize = 9; // フォントサイズを少し大きく
    const charWidth = fontSize * 0.6; // 文字の幅はフォントサイズの約0.6倍
    const textWidth = props.holidayNote.length * charWidth;
    const boxWidth = Math.max(textWidth + 18, 24); // 最小幅24px、パディング9pxずつ（+5px追加）
    const boxHeight = 14; // 高さも少し大きく
    const rightMargin = 8; // 右端から8px左側に配置（重ならないように）
    const topMargin = 5; // 上端から5px下側に配置

    // 赤い背景の箱（右上に配置、文字幅に応じてサイズ調整）
    g.append('rect')
      .attr('x', width - boxWidth - rightMargin)
      .attr('y', topMargin)
      .attr('width', boxWidth)
      .attr('height', boxHeight)
      .attr('fill', '#ff4444')
      .attr('rx', 2);

    // 白抜き文字（少し大きなフォント）
    g.append('text')
      .attr('x', width - boxWidth/2 - rightMargin)
      .attr('y', topMargin + 10) // 上端マージン + テキストのベースライン調整
      .attr('text-anchor', 'middle')
      .attr('font-family', 'Arial, sans-serif')
      .attr('font-size', `${fontSize}px`)
      .attr('font-weight', 'bold')
      .attr('fill', '#ffffff')
      .text(props.holidayNote);
  }

  // スケジュール情報の描画
  if (props.schedules && props.schedules.length > 0) {
    const scheduleStartY = 30; // 休日注釈が右上に移動したので、常に30から開始
    const scheduleHeight = 15;
    const maxSchedules = Math.floor((height - scheduleStartY - 10) / (scheduleHeight + 2));

    props.schedules.slice(0, maxSchedules).forEach((schedule, index) => {
      const y = scheduleStartY + index * (scheduleHeight + 2);

      // スケジュールの背景
      g.append('rect')
        .attr('x', 5)
        .attr('y', y)
        .attr('width', width - 14)
        .attr('height', scheduleHeight)
        .attr('fill', schedule.color || '#e3f2fd')
        .attr('stroke', '#1976d2')
        .attr('stroke-width', 1)
        .attr('rx', 2);

      // スケジュールのタイトル
      g.append('text')
        .attr('x', 8)
        .attr('y', y + 10)
        .attr('font-family', 'Arial, sans-serif')
        .attr('font-size', '9px')
        .attr('fill', '#333333')
        .text(schedule.title.length > 12 ? schedule.title.substring(0, 12) + '...' : schedule.title);

      // TODO完了フラグの表示
      if (schedule.isTodoCompleted) {
        g.append('circle')
          .attr('cx', width - 15)
          .attr('cy', y + 8)
          .attr('r', 4)
          .attr('fill', '#4caf50');
      }
    });
  }

  console.log('DayBox描画完了', svgElement.innerHTML);
};

// SVG要素が利用可能になった時点で描画
watchEffect(() => {
  console.log('watchEffect triggered, svgRef.value:', svgRef.value);
  if (svgRef.value) {
    console.log('SVG要素が利用可能になりました');
    drawDayBox();
  }
});

// コンポーネントマウント時とprops変更時に描画
onMounted(() => {
  console.log('DayBox onMounted', svgRef.value);
  nextTick(() => {
    console.log('DayBox nextTick', svgRef.value);
    if (svgRef.value) {
      drawDayBox();
    } else {
      // SVG要素がまだ利用できない場合、少し遅延して再試行
      setTimeout(() => {
        console.log('setTimeout retry, svgRef.value:', svgRef.value);
        if (svgRef.value) {
          drawDayBox();
        }
      }, 100);
    }
  });
});

watch(() => [props.date, props.holidayNote, props.schedules], () => {
  console.log('DayBox props changed', svgRef.value);
  nextTick(() => {
    if (svgRef.value) {
      drawDayBox();
    }
  });
}, { deep: true });
</script>

<style scoped>
.day-box-container {
  display: inline-block;
  margin: 0px; /* マージンを0pxに設定 */
  border: none; /* ボーダーを削除 */
  box-sizing: border-box;
}

.day-box-svg {
  display: block;
  width: 140px;
  height: 100px;
}
</style>
