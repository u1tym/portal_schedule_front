<template>
  <div class="schedule-view">
    <h1>スケジュール管理</h1>

    <!-- コントロールパネル -->
    <div class="control-panel">
      <div class="navigation-buttons">
        <button @click="goPrevious" class="nav-button">前へ</button>
        <button @click="goNext" class="nav-button">次へ</button>
      </div>

      <div class="display-controls">
        <button @click="toggleDisplayMode" class="mode-button">
          表示切替
        </button>
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

    <div v-if="isLoading" class="loading">
      スケジュールを取得中...
    </div>

    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>

    <div v-if="scheduleData" class="schedule-info">
      <p>スケジュール取得完了</p>
      <p>セッション: {{ scheduleData.session_string }}</p>
      <p>スケジュール数: {{ scheduleData.schedules?.length || 0 }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { ScheduleService } from '../services/api';

// 表示モードの定義
enum DisplayMode {
  SUNDAY_START_MONTH = 'sunday_start_month',
  MONDAY_START_MONTH = 'monday_start_month',
  THREE_DAY_WEEK = 'three_day_week'
}

// 状態管理
const isLoading = ref(false);
const errorMessage = ref('');
const scheduleData = ref<{ session_string: string; schedules: any[] } | null>(null);

// 表示関連の状態
const targetDate = ref(new Date()); // 表示対象年月日
const displayMode = ref<DisplayMode>(DisplayMode.SUNDAY_START_MONTH); // 表示モード
const displayStartDate = ref<Date>(new Date()); // 表示開始年月日
const displayEndDate = ref<Date>(new Date()); // 表示終了年月日

// 表示モードのテキスト
const displayModeText = computed(() => {
  switch (displayMode.value) {
    case DisplayMode.SUNDAY_START_MONTH:
      return '日曜始まり月表示';
    case DisplayMode.MONDAY_START_MONTH:
      return '月曜始まり月表示';
    case DisplayMode.THREE_DAY_WEEK:
      return '週３日表示';
    default:
      return '不明';
  }
});

// 日付フォーマット関数
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

// 表示開始年月日算出
const calculateDisplayStartDate = (): Date => {
  const target = new Date(targetDate.value);

  switch (displayMode.value) {
    case DisplayMode.SUNDAY_START_MONTH:
      // 1日が日曜ならその日、そうでなければ過去の直近の日曜日
      const firstDay = new Date(target.getFullYear(), target.getMonth(), 1);
      const dayOfWeek = firstDay.getDay();
      const daysToSubtract = dayOfWeek === 0 ? 0 : dayOfWeek;
      return new Date(firstDay.getTime() - daysToSubtract * 24 * 60 * 60 * 1000);

    case DisplayMode.MONDAY_START_MONTH:
      // 1日が月曜ならその日、そうでなければ過去の直近の月曜日
      const firstDayMon = new Date(target.getFullYear(), target.getMonth(), 1);
      const dayOfWeekMon = firstDayMon.getDay();
      const daysToSubtractMon = dayOfWeekMon === 0 ? 6 : dayOfWeekMon - 1;
      return new Date(firstDayMon.getTime() - daysToSubtractMon * 24 * 60 * 60 * 1000);

    case DisplayMode.THREE_DAY_WEEK:
      // 表示対象年月日
      return new Date(targetDate.value);

    default:
      return new Date(targetDate.value);
  }
};

// 表示終了年月日算出
const calculateDisplayEndDate = (): Date => {
  const target = new Date(targetDate.value);

  switch (displayMode.value) {
    case DisplayMode.SUNDAY_START_MONTH:
      // 月末が土曜ならその日、そうでなければその後の直近の土曜日
      const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0);
      const dayOfWeekLast = lastDay.getDay();
      const daysToAdd = dayOfWeekLast === 6 ? 0 : 6 - dayOfWeekLast;
      return new Date(lastDay.getTime() + daysToAdd * 24 * 60 * 60 * 1000);

    case DisplayMode.MONDAY_START_MONTH:
      // 月末が日曜ならその日、そうでなければその後の直近の日曜日
      const lastDayMon = new Date(target.getFullYear(), target.getMonth() + 1, 0);
      const dayOfWeekLastMon = lastDayMon.getDay();
      const daysToAddMon = dayOfWeekLastMon === 0 ? 0 : 7 - dayOfWeekLastMon;
      return new Date(lastDayMon.getTime() + daysToAddMon * 24 * 60 * 60 * 1000);

    case DisplayMode.THREE_DAY_WEEK:
      // 表示対象年月日 + 2日
      const endDate = new Date(targetDate.value);
      endDate.setDate(endDate.getDate() + 2);
      return endDate;

    default:
      return new Date(targetDate.value);
  }
};

// 表示日付の更新
const updateDisplayDates = () => {
  displayStartDate.value = calculateDisplayStartDate();
  displayEndDate.value = calculateDisplayEndDate();
};

// 前へボタン押下時
const goPrevious = () => {
  const target = new Date(targetDate.value);

  switch (displayMode.value) {
    case DisplayMode.SUNDAY_START_MONTH:
    case DisplayMode.MONDAY_START_MONTH:
      // 1か月前の同日、同日が存在しない場合は末日
      const prevMonth = new Date(target.getFullYear(), target.getMonth() - 1, target.getDate());
      if (prevMonth.getMonth() !== target.getMonth() - 1) {
        // 同日が存在しない場合、前月の末日
        const lastDayOfPrevMonth = new Date(target.getFullYear(), target.getMonth(), 0);
        targetDate.value = lastDayOfPrevMonth;
      } else {
        targetDate.value = prevMonth;
      }
      break;

    case DisplayMode.THREE_DAY_WEEK:
      // 3日前
      target.setDate(target.getDate() - 3);
      targetDate.value = target;
      break;
  }

  updateDisplayDates();
};

// 次へボタン押下時
const goNext = () => {
  const target = new Date(targetDate.value);

  switch (displayMode.value) {
    case DisplayMode.SUNDAY_START_MONTH:
    case DisplayMode.MONDAY_START_MONTH:
      // 1か月後の同日、同日が存在しない場合は末日
      const nextMonth = new Date(target.getFullYear(), target.getMonth() + 1, target.getDate());
      if (nextMonth.getMonth() !== target.getMonth() + 1) {
        // 同日が存在しない場合、翌月の末日
        const lastDayOfNextMonth = new Date(target.getFullYear(), target.getMonth() + 2, 0);
        targetDate.value = lastDayOfNextMonth;
      } else {
        targetDate.value = nextMonth;
      }
      break;

    case DisplayMode.THREE_DAY_WEEK:
      // 3日後
      target.setDate(target.getDate() + 3);
      targetDate.value = target;
      break;
  }

  updateDisplayDates();
};

// 表示切替ボタン
const toggleDisplayMode = () => {
  switch (displayMode.value) {
    case DisplayMode.SUNDAY_START_MONTH:
      displayMode.value = DisplayMode.MONDAY_START_MONTH;
      break;
    case DisplayMode.MONDAY_START_MONTH:
      displayMode.value = DisplayMode.THREE_DAY_WEEK;
      break;
    case DisplayMode.THREE_DAY_WEEK:
      displayMode.value = DisplayMode.SUNDAY_START_MONTH;
      break;
  }

  updateDisplayDates();
};

// スケジュール取得
const getSchedule = async () => {
  isLoading.value = true;
  errorMessage.value = '';

  try {
    // セッションストレージからユーザー名とセッション文字列を取得
    const username = sessionStorage.getItem('username');
    const sessionString = sessionStorage.getItem('session_string');

    if (!username) {
      throw new Error('ユーザー情報が見つかりません');
    }

    if (!sessionString) {
      throw new Error('セッションが見つかりません');
    }

    // スケジュール取得要求
    const response = await ScheduleService.getSchedule({
      username: username,
      session_string: sessionString
    });

    if (response.success) {
      // 新しいセッション文字列を保持
      scheduleData.value = {
        session_string: response.session_string,
        schedules: response.schedules
      };
      sessionStorage.setItem('session_string', response.session_string);
    } else {
      throw new Error('スケジュール取得に失敗しました');
    }

  } catch (error) {
    const message = error instanceof Error ? error.message : 'スケジュール取得に失敗しました';
    errorMessage.value = message;
  } finally {
    isLoading.value = false;
  }
};

// 初期化
onMounted(() => {
  // デフォルト値の設定
  targetDate.value = new Date(); // 現在月
  displayMode.value = DisplayMode.SUNDAY_START_MONTH; // 日曜始まり月表示
  updateDisplayDates(); // 表示日付の初期化

  getSchedule();
});
</script>

<style scoped>
.schedule-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f0f2f5;
  padding: 20px;
}

h1 {
  color: #333;
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 30px;
}

.control-panel {
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 800px;
}

.navigation-buttons {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  justify-content: center;
}

.nav-button {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s ease;
}

.nav-button:hover {
  background-color: #0056b3;
}

.display-controls {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.mode-button {
  padding: 10px 20px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s ease;
}

.mode-button:hover {
  background-color: #218838;
}

.display-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: #f8f9fa;
  border-radius: 6px;
}

.info-item label {
  font-weight: bold;
  color: #495057;
}

.info-item span {
  color: #6c757d;
}

.loading {
  padding: 20px;
  background-color: #e3f2fd;
  color: #1976d2;
  border-radius: 8px;
  text-align: center;
  margin-bottom: 20px;
}

.error-message {
  padding: 20px;
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  border-radius: 8px;
  text-align: center;
  margin-bottom: 20px;
}

.schedule-info {
  padding: 20px;
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
  border-radius: 8px;
  text-align: center;
}

.schedule-info p {
  margin: 10px 0;
}
</style>