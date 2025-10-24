<template>
  <div class="schedule-weekly-view">
    <!-- コントロールパネル -->
    <div class="control-panel">
      <div class="navigation-buttons">
        <button @click="handlePrevious" class="nav-button">前へ</button>
        <button @click="handleNext" class="nav-button">次へ</button>
      </div>

      <div class="display-info">
        <div class="info-item">
          <label>表示開始:</label>
          <span>{{ formatDate(displayStartDate) }}</span>
        </div>
        <div class="info-item">
          <label>表示終了:</label>
          <span>{{ formatDate(displayEndDate) }}</span>
        </div>
      </div>
    </div>

    <!-- 週3日表示（DayLongBoxScale + DayLongBoxを並べる） -->
    <div class="weekly-container">
      <div class="daylong-box-grid">
        <!-- 時刻スケール -->
        <div class="daylong-box-wrapper">
          <div class="day-header scale-header">
            <div class="scale-label">時刻</div>
          </div>
          <DayLongBoxScale />
        </div>

        <!-- 各日のDayLongBox -->
        <div
          v-for="day in weekDays"
          :key="`${day.date.getFullYear()}-${day.date.getMonth()}-${day.date.getDate()}`"
          class="daylong-box-wrapper"
        >
          <div class="day-header">
            <div class="day-info">
              <div class="day-number">{{ day.date.getDate() }}</div>
              <div class="day-month">{{ day.date.getMonth() + 1 }}月</div>
            </div>
            <div class="day-of-week">{{ getDayOfWeekText(day.date) }}</div>
          </div>
          <DayLongBox
            :date="day.date"
            :holiday-note="getHolidayNote(day.date)"
            :is-current-month="isCurrentMonth(day.date)"
            :schedules="getSchedulesForDay(day.date)"
            @schedule-click="handleScheduleClick"
            @time-click="handleTimeClick"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ScheduleItem } from '../types/schedule';
import DayLongBox from './DayLongBox.vue';
import DayLongBoxScale from './DayLongBoxScale.vue';

interface Props {
  displayTargetDate: Date;
  displayStartDate: Date;
  displayEndDate: Date;
  schedules: ScheduleItem[];
}

interface WeekDay {
  date: Date;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  previous: [],
  next: [],
  editSchedule: [scheduleId: number],
  addSchedule: [year: number, month: number, day: number, hour?: number, minute?: number]
}>();

// 週3日の日付を生成
const weekDays = computed(() => {
  const days: WeekDay[] = [];
  const startDate = new Date(props.displayStartDate);

  // 3日分の日付を生成
  for (let i = 0; i < 3; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    days.push({ date });
  }

  return days;
});

// 指定日のスケジュール取得
const getSchedulesForDay = (date: Date) => {
  return props.schedules.filter(schedule => {
    const scheduleDate = new Date(schedule.start_datetime);
    return scheduleDate.getFullYear() === date.getFullYear() &&
           scheduleDate.getMonth() === date.getMonth() &&
           scheduleDate.getDate() === date.getDate();
  });
};

// 曜日テキストを取得
const getDayOfWeekText = (date: Date) => {
  const days = ['日', '月', '火', '水', '木', '金', '土'];
  return days[date.getDay()];
};

// 休日注釈を取得（簡単な実装）
const getHolidayNote = (date: Date) => {
  // 実際の実装では、休日データベースやAPIから取得
  return '';
};

// 当月かどうか判定
const isCurrentMonth = (date: Date) => {
  return date.getMonth() === props.displayTargetDate.getMonth();
};

// 日付フォーマット
const formatDate = (date: Date) => {
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

// イベントハンドラー
const handlePrevious = () => {
  emit('previous');
};

const handleNext = () => {
  emit('next');
};

const handleScheduleClick = (scheduleId: number) => {
  emit('editSchedule', scheduleId);
};

const handleTimeClick = (year: number, month: number, day: number, hour: number, minute: number) => {
  emit('addSchedule', year, month, day, hour, minute);
};
</script>

<style scoped>
.schedule-weekly-view {
  width: 100%;
}

.control-panel {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.navigation-buttons {
  display: flex;
  gap: 10px;
}

.nav-button {
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.nav-button:hover {
  background-color: #0056b3;
}

.display-info {
  display: flex;
  gap: 20px;
  font-size: 14px;
}

.info-item {
  display: flex;
  gap: 5px;
}

.info-item label {
  font-weight: bold;
  color: #666;
}

.weekly-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  overflow: hidden;
  padding: 20px;
}

.daylong-box-grid {
  display: flex;
  gap: 0px; /* 隙間をなくす */
  justify-content: center;
  flex-wrap: wrap;
}

.daylong-box-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.daylong-box-wrapper:first-child {
  align-items: flex-start;
}

.day-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 10px;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 8px;
  width: 100%; /* コンテナの幅に合わせる */
  height: 60px; /* 統一された高さ */
  justify-content: center;
}

.day-info {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 5px;
}

.day-number {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.day-month {
  font-size: 12px;
  color: #666;
}

.day-of-week {
  font-size: 14px;
  font-weight: bold;
  color: #007bff;
}

.scale-header {
  background-color: #e9ecef;
  border: 1px solid #dee2e6;
  width: 60px; /* DayLongBoxScaleの幅に合わせる */
}

.scale-label {
  font-size: 12px;
  font-weight: bold;
  color: #495057;
}
</style>
