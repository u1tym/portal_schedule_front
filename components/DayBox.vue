<template>
  <div class="day-box-container">
    <svg ref="svgRef" class="day-box-svg"></svg>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick, watchEffect } from 'vue';
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
interface DayBoxProps {
  date: Date;                    // 年月日
  holidayNote?: string;          // 休日注釈
  schedules?: ScheduleInfo[];     // スケジュール情報の配列
  isCurrentMonth?: boolean;      // 当月フラグ
}

// Emits定義
const emit = defineEmits<{
  scheduleClick: [scheduleId: number]
  dateClick: [year: number, month: number, day: number]
}>();

const props = withDefaults(defineProps<DayBoxProps>(), {
  holidayNote: '',
  schedules: () => [],
  isCurrentMonth: true
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

  // SVGサイズ設定（画面サイズの25%）
  const containerElement = svgElement.parentElement;
  const containerWidth = containerElement ? containerElement.offsetWidth : window.innerWidth;
  const width = Math.max(containerWidth * 0.25, 100); // 最小100px
  const height = 100;

  // SVGサイズを設定
  d3.select(svgElement)
    .attr('width', width)
    .attr('height', height);

  console.log('SVGサイズ設定完了', width, height);

  // 矢印マーカーの定義
  const defs = d3.select(svgElement).append('defs');

  // 右向き矢印
  defs.append('marker')
    .attr('id', 'arrowhead')
    .attr('viewBox', '0 0 10 10')
    .attr('refX', 9)
    .attr('refY', 3)
    .attr('markerWidth', 6)
    .attr('markerHeight', 6)
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M0,0 L0,6 L9,3 z')
    .attr('fill', '#333333');

  // 左向き矢印
  defs.append('marker')
    .attr('id', 'arrowhead-left')
    .attr('viewBox', '0 0 10 10')
    .attr('refX', 1)
    .attr('refY', 3)
    .attr('markerWidth', 6)
    .attr('markerHeight', 6)
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M9,0 L9,6 L0,3 z')
    .attr('fill', '#333333');

  // メイングループ
  const g = d3.select(svgElement)
    .append('g')
    .attr('transform', 'translate(0, 0)'); // マージンを0に設定

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
           .attr('stroke', '#333333') // 枠線は常に同じ色
           .attr('stroke-width', 0.25)
           .attr('opacity', opacity)
           .style('cursor', 'pointer')
           .on('click', (event) => {
             // スケジュール部分以外のクリックを検出
             const target = event.target as SVGElement;
             if (target === borderRect.node()) {
               const year = props.date.getFullYear();
               const month = props.date.getMonth() + 1; // 0ベースなので+1
               const day = props.date.getDate();
               emit('dateClick', year, month, day);
             }
           });

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
    .attr('fill', textColor) // 決定された文字色を使用
    .attr('opacity', opacity) // 透明度を適用
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
      .attr('fill', isCurrentMonth ? '#ff4444' : '#ffaaaa')
      .attr('rx', 2)
      .attr('opacity', opacity);

    // 白抜き文字（少し大きなフォント）
    g.append('text')
      .attr('x', width - boxWidth/2 - rightMargin)
      .attr('y', topMargin + 10) // 上端マージン + テキストのベースライン調整
      .attr('text-anchor', 'middle')
      .attr('font-family', 'Arial, sans-serif')
      .attr('font-size', `${fontSize}px`)
      .attr('font-weight', 'bold')
      .attr('fill', '#ffffff')
      .attr('opacity', opacity)
      .text(props.holidayNote);
  }

  // スケジュール情報の描画
  if (props.schedules && props.schedules.length > 0) {
    const scheduleStartY = 30; // 休日注釈が右上に移動したので、常に30から開始
    const scheduleHeight = 15;
    const maxSchedules = Math.floor((height - scheduleStartY - 10) / (scheduleHeight + 2));

    // positionNumberでソートしてから表示
    const sortedSchedules = [...props.schedules].sort((a, b) => a.positionNumber - b.positionNumber);

    // 連番でない場合の間隔を計算
    let currentY = scheduleStartY;

    sortedSchedules.slice(0, maxSchedules).forEach((schedule, index) => {
      // 前のスケジュールとの間隔を計算（positionNumberの差に基づく）
      if (index > 0) {
        const prevSchedule = sortedSchedules[index - 1];
        const positionDiff = schedule.positionNumber - prevSchedule.positionNumber;
        if (positionDiff > 1) {
          // 番号が空いている場合は間隔を開ける
          currentY += (positionDiff - 1) * (scheduleHeight + 2);
        }
      }

      const y = currentY;

      // isAllDayがTrueの場合の処理
      if (schedule.isAllDay) {
        const scheduleDate = new Date(schedule.startDateTime);
        const boxDate = props.date;

               // 年月が異なる場合
               if (scheduleDate.getFullYear() !== boxDate.getFullYear() ||
                   scheduleDate.getMonth() !== boxDate.getMonth()) {

                 // 年月が異なる場合：横線のみ（タイトルなし）
                 g.append('line')
                   .attr('x1', 8)
                   .attr('y1', y + scheduleHeight / 2 + 4)
                   .attr('x2', width - 8)
                   .attr('y2', y + scheduleHeight / 2 + 4)
                   .attr('stroke', schedule.color)
                   .attr('stroke-width', 2)
                   .attr('opacity', opacity);

                 // 透明なクリック可能エリア（終日イベント表示エリア全体を覆う）- 最後に描画して一番上に配置
                 g.append('rect')
                   .attr('x', 8)
                   .attr('y', y)
                   .attr('width', width - 16)
                   .attr('height', scheduleHeight)
                   .attr('fill', 'transparent')
                   .attr('rx', 2)
                   .style('cursor', 'pointer')
                   .on('click', () => {
                     emit('scheduleClick', schedule.id);
                   });
               } else {
                 // 年月が同じ場合：横線 + タイトル（開始日のみ）
                 g.append('line')
                   .attr('x1', 8)
                   .attr('y1', y + scheduleHeight / 2 + 4)
                   .attr('x2', width - 8)
                   .attr('y2', y + scheduleHeight / 2 + 4)
                   .attr('stroke', schedule.color)
                   .attr('stroke-width', 2)
                   .attr('opacity', opacity);

                 // 開始日のみタイトルを表示（日付が同じ場合）
                 if (scheduleDate.getDate() === boxDate.getDate()) {
                   g.append('text')
                     .attr('x', 8)
                     .attr('y', y + 10)
                     .attr('font-family', 'Arial, sans-serif')
                     .attr('font-size', '9px')
                     .attr('fill', schedule.color)
                     .attr('opacity', opacity)
                     .text(schedule.title.length > 12 ? schedule.title.substring(0, 12) + '...' : schedule.title);
                 }

                 // 透明なクリック可能エリア（終日イベント表示エリア全体を覆う）- 最後に描画して一番上に配置
                 g.append('rect')
                   .attr('x', 8)
                   .attr('y', y)
                   .attr('width', width - 16)
                   .attr('height', scheduleHeight)
                   .attr('fill', 'transparent')
                   .attr('rx', 2)
                   .style('cursor', 'pointer')
                   .on('click', () => {
                     emit('scheduleClick', schedule.id);
                   });
               }
      } else {
        // isAllDayがFalseの場合
        let textContent = '';

               // 背景色のグラデーション
               const gradientId = `gradient-${schedule.id}`;
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

               // 背景
               g.append('rect')
                 .attr('x', 5)
                 .attr('y', y)
                 .attr('width', width - 14)
                 .attr('height', scheduleHeight)
                 .attr('fill', `url(#${gradientId})`)
                 .attr('rx', 2)
                 .attr('opacity', opacity);

               // チェックボックスの表示
               if (schedule.isTodo) {
                 const checkboxText = schedule.isTodoCompleted ? '☑' : '☐';
                 g.append('text')
                   .attr('x', 8)
                   .attr('y', y + 12) // y + 10 → y + 12 に変更
                   .attr('font-family', 'Arial, sans-serif')
                   .attr('font-size', '14px') // 12px → 14px に変更
                   .attr('fill', '#333333')
                   .attr('opacity', opacity)
                   .text(checkboxText);
               }

               // 時分の表示
               const timeStr = schedule.startDateTime.toLocaleTimeString('ja-JP', {
                 hour: '2-digit',
                 minute: '2-digit',
                 hour12: false
               });

               const timeX = schedule.isTodo ? 24 : 8; // チェックボックスがある場合は右にずらす（20 → 24に変更）
               g.append('text')
                 .attr('x', timeX)
                 .attr('y', y + 10)
                 .attr('font-family', 'Arial, sans-serif')
                 .attr('font-size', '9px')
                 .attr('fill', '#333333')
                 .attr('opacity', opacity)
                 .text(timeStr);

               // タイトルの表示
               const titleX = timeX + timeStr.length * 5.5 + 2; // 時分の後にスペース
               const titleElement = g.append('text')
                 .attr('x', titleX)
                 .attr('y', y + 10)
                 .attr('font-family', 'Arial, sans-serif')
                 .attr('font-size', '9px')
                 .attr('fill', '#333333')
                 .attr('opacity', opacity);

               // 取り消し線の処理（タイトルのみ）
               if (schedule.isTodoCompleted) {
                 titleElement.attr('text-decoration', 'line-through');
               }

               titleElement.text(schedule.title.length > 15 ? schedule.title.substring(0, 15) + '...' : schedule.title);

               // 透明なクリック可能エリア（スケジュール表示エリア全体を覆う）- 最後に描画して一番上に配置
               g.append('rect')
                 .attr('x', 5)
                 .attr('y', y)
                 .attr('width', width - 14)
                 .attr('height', scheduleHeight)
                 .attr('fill', 'transparent')
                 .attr('rx', 2)
                 .style('cursor', 'pointer')
                 .on('click', () => {
                   emit('scheduleClick', schedule.id);
                 });
             }

             currentY += scheduleHeight + 2;
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

// 画面サイズ変更を監視
const handleResize = () => {
  if (svgRef.value) {
    drawDayBox();
  }
};

// コンポーネントマウント時とprops変更時に描画
onMounted(() => {
  console.log('DayBox onMounted', svgRef.value);

  // 画面サイズ変更イベントリスナーを追加
  window.addEventListener('resize', handleResize);

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

onUnmounted(() => {
  // 画面サイズ変更イベントリスナーを削除
  window.removeEventListener('resize', handleResize);
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
  width: 25vw; /* 画面幅の25% */
  min-width: 100px; /* 最小幅 */
  max-width: 200px; /* 最大幅 */
  height: 100px;
}
</style>
