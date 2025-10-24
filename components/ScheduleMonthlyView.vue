<template>
  <div class="schedule-monthly-view">
    <!-- コントロールパネル -->
    <div class="control-panel">
      <div class="navigation-buttons">
        <button @click="handlePrevious" class="nav-button">前へ</button>
        <button @click="handleNext" class="nav-button">次へ</button>
      </div>

      <div class="display-controls">
        <button @click="handleSundayStart" class="mode-button">日曜始まり</button>
        <button @click="handleMondayStart" class="mode-button">月曜始まり</button>
      </div>

      <div class="display-info">
        <div class="info-item">
          <label>表示モード:</label>
          <span>{{ displayModeText }}</span>
        </div>
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

    <!-- カレンダー表示 -->
    <div class="calendar-container">
      <div class="calendar-grid">
        <!-- 曜日ヘッダー -->
        <div class="day-header" v-for="dayOfWeek in dayHeaders" :key="dayOfWeek">
          {{ dayOfWeek }}
        </div>

        <!-- 日付セル -->
        <div
          v-for="day in calendarDays"
          :key="`${day.date.getFullYear()}-${day.date.getMonth()}-${day.date.getDate()}`"
          class="day-cell"
          :class="{
            'current-month': day.isCurrentMonth,
            'today': isToday(day.date),
            'sunday': day.date.getDay() === 0,
            'saturday': day.date.getDay() === 6
          }"
          @click="handleDateClick(day.date)"
        >
          <div class="day-number">{{ day.date.getDate() }}</div>
          <div class="day-schedules">
            <div
              v-for="schedule in getSchedulesForDay(day.date)"
              :key="schedule.id"
              class="schedule-item"
              :style="{ backgroundColor: getScheduleColor(schedule) }"
              @click.stop="handleScheduleClick(schedule.id)"
            >
              {{ schedule.title }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ScheduleItem } from '../types/schedule';

interface Props {
  displayTargetDate: Date;
  displayStartDate: Date;
  displayEndDate: Date;
  displayMode: string;
  isMondayStart: boolean;
  schedules: ScheduleItem[];
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  previous: [],
  next: [],
  editSchedule: [scheduleId: number],
  addSchedule: [year: number, month: number, day: number, hour?: number, minute?: number],
  sundayStart: [],
  mondayStart: []
}>();

// 曜日ヘッダー
const dayHeaders = computed(() => {
  if (props.isMondayStart) {
    return ['月', '火', '水', '木', '金', '土', '日'];
  } else {
    return ['日', '月', '火', '水', '木', '金', '土'];
  }
});

// 表示モードテキスト
const displayModeText = computed(() => props.displayMode);

// カレンダー日付の生成
const calendarDays = computed(() => {
  const days: CalendarDay[] = [];
  const startDate = new Date(props.displayStartDate);
  const endDate = new Date(props.displayEndDate);

  // 6週間分（42日）の日付を生成
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);

    const isCurrentMonth = date.getMonth() === props.displayTargetDate.getMonth();
    days.push({ date, isCurrentMonth });
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

// スケジュールの色を取得
const getScheduleColor = (schedule: ScheduleItem) => {
  // 簡単な色分けロジック（実際の実装では、カテゴリやタイプに基づく）
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
  return colors[schedule.id % colors.length];
};

// 今日かどうか判定
const isToday = (date: Date) => {
  const today = new Date();
  return date.getFullYear() === today.getFullYear() &&
         date.getMonth() === today.getMonth() &&
         date.getDate() === today.getDate();
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

const handleDateClick = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  emit('addSchedule', year, month, day);
};

const handleSundayStart = () => {
  emit('sundayStart');
};

const handleMondayStart = () => {
  emit('mondayStart');
};
</script>

<style scoped>
.schedule-monthly-view {
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

.display-controls {
  display: flex;
  gap: 10px;
}

.mode-button {
  padding: 8px 16px;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.mode-button:hover {
  background-color: #545b62;
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

.calendar-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  overflow: hidden;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background-color: #e0e0e0;
}

.day-header {
  background-color: #f8f9fa;
  padding: 10px;
  text-align: center;
  font-weight: bold;
  color: #666;
  border-bottom: 1px solid #e0e0e0;
}

.day-cell {
  background-color: white;
  min-height: 120px;
  padding: 8px;
  border: 1px solid #e0e0e0;
  cursor: pointer;
  transition: background-color 0.2s;
}

.day-cell:hover {
  background-color: #f8f9fa;
}

.day-cell.current-month {
  background-color: white;
}

.day-cell:not(.current-month) {
  background-color: #f8f9fa;
  color: #999;
}

.day-cell.today {
  background-color: #e3f2fd;
  border: 2px solid #2196f3;
}

.day-cell.sunday {
  background-color: #ffebee;
}

.day-cell.saturday {
  background-color: #e3f2fd;
}

.day-number {
  font-weight: bold;
  margin-bottom: 4px;
}

.day-schedules {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.schedule-item {
  padding: 2px 4px;
  border-radius: 3px;
  font-size: 10px;
  color: white;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.schedule-item:hover {
  opacity: 0.8;
}
</style>
