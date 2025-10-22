<template>
  <div class="day-long-box-container">
    <svg ref="svgRef" class="day-long-box-svg"></svg>
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
  positionNumber: number; // 表示順（必須項目）
  isTodo: boolean;      // TODOフラグ（必須項目）
}

// Props定義
interface DayLongBoxProps {
  date: Date;                    // 年月日
  holidayNote?: string;          // 休日注釈
  schedules?: ScheduleInfo[];     // スケジュール情報の配列
  isCurrentMonth?: boolean;      // 当月フラグ
}

const props = withDefaults(defineProps<DayLongBoxProps>(), {
  holidayNote: '',
  schedules: () => [],
  isCurrentMonth: true
});

// SVG要素の参照
const svgRef = ref<SVGSVGElement | null>(null);

// 描画関数
const drawDayLongBox = () => {
  console.log('drawDayLongBox called, svgRef.value:', svgRef.value);

  // svgRefが利用できない場合、DOM要素を直接取得
  let svgElement = svgRef.value;
  if (!svgElement) {
    console.log('svgRef.value is null, trying to find SVG element directly');
    const container = document.querySelector('.day-long-box-container');
    if (container) {
      svgElement = container.querySelector('svg') as SVGSVGElement;
      console.log('Found SVG element directly:', svgElement);
    }
  }

  if (!svgElement) {
    console.log('SVG要素が見つかりません - すべての方法で失敗');
    return;
  }

  console.log('DayLongBox描画開始', props.date, props.holidayNote);

  // SVGをクリア
  d3.select(svgElement).selectAll('*').remove();

  // SVGサイズ設定
  const width = 140;
  const height = 660; // 終日エリア(60px) + 24時間分の高さ（1時間=25px）

  // SVGサイズを設定
  d3.select(svgElement)
    .attr('width', width)
    .attr('height', height);

  console.log('SVGサイズ設定完了', width, height);

  // メイングループ
  const g = d3.select(svgElement)
    .append('g')
    .attr('transform', 'translate(0, 0)');

  // 背景色と文字色を決定
  const dayOfWeek = props.date.getDay();
  const isSunday = dayOfWeek === 0;
  const isSaturday = dayOfWeek === 6;
  const hasHolidayNote = props.holidayNote && props.holidayNote.trim() !== '';
  const isCurrentMonth = props.isCurrentMonth;

  let backgroundColor = 'white';
  let textColor = '#333333';

  // 当月外の場合は薄くするための透明度
  const opacity = isCurrentMonth ? 1.0 : 0.4;

  if (isSunday || hasHolidayNote) {
    // 日曜日または休日注釈がある場合：薄い赤背景、赤文字
    backgroundColor = isCurrentMonth ? '#ffebee' : '#fafafa';
    textColor = isCurrentMonth ? '#d32f2f' : '#999999';
  } else if (isSaturday) {
    // 土曜日の場合：薄い青背景、青文字
    backgroundColor = isCurrentMonth ? '#e3f2fd' : '#fafafa';
    textColor = isCurrentMonth ? '#1976d2' : '#999999';
  } else {
    // 平日の場合
    backgroundColor = isCurrentMonth ? 'white' : '#fafafa';
    textColor = isCurrentMonth ? '#333333' : '#999999';
  }

  // 外枠を描画
  const borderRect = g.append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', width)
    .attr('height', height)
    .attr('fill', backgroundColor)
    .attr('stroke', '#333333')
    .attr('stroke-width', 0.25)
    .attr('opacity', opacity);

  console.log('外枠描画完了', borderRect.node());

  // 休日注釈がある場合の描画（右上に配置）
  if (props.holidayNote) {
    // 文字の幅を計算
    const fontSize = 9;
    const charWidth = fontSize * 0.6;
    const textWidth = props.holidayNote.length * charWidth;
    const boxWidth = Math.max(textWidth + 18, 24);
    const boxHeight = 14;
    const rightMargin = 8;
    const topMargin = 5;

    // 赤い背景の箱（右上に配置）
    g.append('rect')
      .attr('x', width - boxWidth - rightMargin)
      .attr('y', topMargin)
      .attr('width', boxWidth)
      .attr('height', boxHeight)
      .attr('fill', isCurrentMonth ? '#ff4444' : '#ffaaaa')
      .attr('rx', 2)
      .attr('opacity', opacity);

    // 白抜き文字
    g.append('text')
      .attr('x', width - boxWidth/2 - rightMargin)
      .attr('y', topMargin + 10)
      .attr('text-anchor', 'middle')
      .attr('font-family', 'Arial, sans-serif')
      .attr('font-size', `${fontSize}px`)
      .attr('font-weight', 'bold')
      .attr('fill', '#ffffff')
      .attr('opacity', opacity)
      .text(props.holidayNote);
  }

  // 終日スケジュール表示領域を描画
  const allDayAreaHeight = 60; // 終日エリアの高さ（3行分）
  const allDayArea = g.append('rect')
    .attr('x', 5)
    .attr('y', 5)
    .attr('width', width - 10)
    .attr('height', allDayAreaHeight)
    .attr('fill', 'transparent')
    .attr('stroke', '#e0e0e0')
    .attr('stroke-width', 0.5)
    .attr('stroke-dasharray', '2,2')
    .attr('opacity', opacity);

  // 終日ラベルを描画
  g.append('text')
    .attr('x', 8)
    .attr('y', 20)
    .attr('text-anchor', 'start')
    .attr('font-family', 'Arial, sans-serif')
    .attr('font-size', '10px')
    .attr('fill', '#666666')
    .attr('opacity', opacity)
    .text('終日');

  // 終日スケジュールの表示
  if (props.schedules && props.schedules.length > 0) {
    // 終日スケジュールのみをフィルタリング
    const allDaySchedules = props.schedules.filter(schedule => schedule.isAllDay);

    if (allDaySchedules.length > 0) {
      // positionNumberでソート
      const sortedSchedules = [...allDaySchedules].sort((a, b) => a.positionNumber - b.positionNumber);

      const scheduleHeight = 20; // 各スケジュールの高さ
      const maxSchedules = Math.floor((allDayAreaHeight - 5) / scheduleHeight); // 終日エリア内に収まる数

      sortedSchedules.slice(0, maxSchedules).forEach((schedule, index) => {
        const y = 5 + (index * scheduleHeight) + 15; // 終日エリア内の位置

        // 背景色のグラデーション
        const gradientId = `allDayGradient-${schedule.id}`;
        const gradient = g.append('defs')
          .append('linearGradient')
          .attr('id', gradientId)
          .attr('x1', '0%')
          .attr('x2', '100%');

        gradient.append('stop')
          .attr('offset', '0%')
          .attr('stop-color', schedule.color)
          .attr('stop-opacity', 0.8);

        gradient.append('stop')
          .attr('offset', '100%')
          .attr('stop-color', schedule.color)
          .attr('stop-opacity', 0.3);

        // 背景を描画
        g.append('rect')
          .attr('x', 8)
          .attr('y', y - 12)
          .attr('width', width - 16)
          .attr('height', scheduleHeight - 2)
          .attr('fill', `url(#${gradientId})`)
          .attr('rx', 2)
          .attr('opacity', opacity);

        let currentX = 10;

        // チェックボックスの表示判定
        const scheduleDate = new Date(schedule.startDateTime);
        const boxDate = props.date;
        const shouldShowCheckbox = schedule.isTodo &&
          scheduleDate.getFullYear() === boxDate.getFullYear() &&
          scheduleDate.getMonth() === boxDate.getMonth() &&
          scheduleDate.getDate() === boxDate.getDate();

        // チェックボックスの表示
        if (shouldShowCheckbox) {
          const checkboxText = schedule.isTodoCompleted ? '☑' : '☐';
          g.append('text')
            .attr('x', currentX)
            .attr('y', y)
            .attr('font-family', 'Arial, sans-serif')
            .attr('font-size', '12px')
            .attr('fill', '#333333')
            .attr('opacity', opacity)
            .text(checkboxText);

          currentX += 15; // チェックボックスの幅分移動
        }

        // タイトルの表示
        const titleElement = g.append('text')
          .attr('x', currentX)
          .attr('y', y)
          .attr('font-family', 'Arial, sans-serif')
          .attr('font-size', '10px')
          .attr('fill', '#333333')
          .attr('opacity', opacity);

        // 取り消し線の処理（タイトルのみ）
        if (schedule.isTodoCompleted) {
          titleElement.attr('text-decoration', 'line-through');
        }

        // タイトルのテキスト（長すぎる場合は省略）
        const maxTitleLength = Math.floor((width - currentX - 10) / 6); // 文字幅を考慮
        const titleText = schedule.title.length > maxTitleLength ?
          schedule.title.substring(0, maxTitleLength) + '...' :
          schedule.title;

        titleElement.text(titleText);
      });
    }
  }

  // 24時間分の時間線を描画
  for (let hour = 0; hour < 24; hour++) {
    const y = 5 + allDayAreaHeight + (hour * 25); // 終日エリアの下から開始、1時間=25px

    // 時間線（横線）
    g.append('line')
      .attr('x1', 5)
      .attr('y1', y)
      .attr('x2', width - 5)
      .attr('y2', y)
      .attr('stroke', '#cccccc')
      .attr('stroke-width', 0.5)
      .attr('opacity', opacity);
  }

  console.log('DayLongBox描画完了', svgElement.innerHTML);
};

// SVG要素が利用可能になった時点で描画
watchEffect(() => {
  console.log('watchEffect triggered, svgRef.value:', svgRef.value);
  if (svgRef.value) {
    console.log('SVG要素が利用可能になりました');
    drawDayLongBox();
  }
});

// コンポーネントマウント時とprops変更時に描画
onMounted(() => {
  console.log('DayLongBox onMounted', svgRef.value);
  nextTick(() => {
    console.log('DayLongBox nextTick', svgRef.value);
    if (svgRef.value) {
      drawDayLongBox();
    } else {
      // SVG要素がまだ利用できない場合、少し遅延して再試行
      setTimeout(() => {
        console.log('setTimeout retry, svgRef.value:', svgRef.value);
        if (svgRef.value) {
          drawDayLongBox();
        }
      }, 100);
    }
  });
});

watch(() => [props.date, props.holidayNote, props.schedules, props.isCurrentMonth], () => {
  console.log('DayLongBox props changed', svgRef.value);
  nextTick(() => {
    if (svgRef.value) {
      drawDayLongBox();
    }
  });
}, { deep: true });
</script>

<style scoped>
.day-long-box-container {
  display: inline-block;
  margin: 0px;
  border: none;
  box-sizing: border-box;
}

.day-long-box-svg {
  display: block;
  width: 140px;
  height: 660px;
}
</style>
