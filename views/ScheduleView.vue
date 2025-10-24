<template>
  <div class="schedule-view">
    <!-- ヘッダー -->
    <div class="schedule-header">
      <h1>スケジュール管理</h1>
      <button @click="goToMenu" class="menu-button">メニューに戻る</button>
    </div>

    <!-- タブ -->
    <div class="schedule-tabs">
      <button
        :class="{ active: currentView === 'monthly' }"
        @click="switchView('monthly')"
        class="tab-button"
      >
        月表示
      </button>
      <button
        :class="{ active: currentView === 'weekly' }"
        @click="switchView('weekly')"
        class="tab-button"
      >
        週間表示
      </button>
    </div>

    <!-- コンテンツ -->
    <div v-if="isLoading" class="loading">
      スケジュールを読み込み中...
    </div>

    <div v-if="errorMessage" class="error">
      {{ errorMessage }}
    </div>

    <!-- 月表示 -->
    <ScheduleMonthlyView
      v-if="currentView === 'monthly' && scheduleData"
      :display-target-date="displayTargetDate"
      :display-start-date="displayStartDate"
      :display-end-date="displayEndDate"
      :display-mode="displayMode"
      :is-monday-start="isMondayStart"
      :schedules="scheduleData.schedules"
      @previous="handlePrevious"
      @next="handleNext"
      @edit-schedule="handleEditSchedule"
      @add-schedule="handleAddSchedule"
      @sunday-start="handleSundayStart"
      @monday-start="handleMondayStart"
    />

    <!-- 週間表示 -->
    <ScheduleWeekly
      v-if="currentView === 'weekly' && scheduleData"
      :display-target-date="displayTargetDate"
      :display-start-date="displayStartDate"
      :display-end-date="displayEndDate"
      :schedules="scheduleData.schedules"
      @previous="handlePrevious"
      @next="handleNext"
      @edit-schedule="handleEditSchedule"
      @add-schedule="handleAddSchedule"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ScheduleService } from '../services/api';
import { ScheduleItem } from '../types/schedule';
import ScheduleMonthlyView from '../components/ScheduleMonthlyView.vue';
import ScheduleWeekly from '../components/ScheduleWeekly.vue';

enum DisplayMode {
  Monthly = '月表示',
  ThreeDayWeek = '週３日表示',
}

const router = useRouter();

// 状態管理
const isLoading = ref(false);
const errorMessage = ref('');
const scheduleData = ref<{ session_string: string; schedules: ScheduleItem[] } | null>(null);
const currentView = ref<'monthly' | 'weekly'>('monthly');

// 表示制御
const displayMode = ref<DisplayMode>(DisplayMode.Monthly);
const isMondayStart = ref(false); // 月曜始まりフラグ
const displayTargetDate = ref(new Date());

// 表示開始・終了日時の計算
const displayStartDate = computed(() => {
  const target = displayTargetDate.value;
  const year = target.getFullYear();
  const month = target.getMonth();

  if (displayMode.value === DisplayMode.Monthly) {
    const firstDay = new Date(year, month, 1);
    const dayOfWeek = firstDay.getDay();
    const startDate = new Date(firstDay);

    if (isMondayStart.value) {
      // 月曜始まり
      startDate.setDate(startDate.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    } else {
      // 日曜始まり
      startDate.setDate(startDate.getDate() - dayOfWeek);
    }
    return startDate;
  } else {
    // 週3日表示
    return new Date(target);
  }
});

const displayEndDate = computed(() => {
  const target = displayTargetDate.value;
  const year = target.getFullYear();
  const month = target.getMonth();

  if (displayMode.value === DisplayMode.Monthly) {
    const lastDay = new Date(year, month + 1, 0);
    const dayOfWeek = lastDay.getDay();
    const endDate = new Date(lastDay);

    if (isMondayStart.value) {
      // 月曜始まり
      endDate.setDate(endDate.getDate() + (dayOfWeek === 0 ? 0 : 7 - dayOfWeek));
    } else {
      // 日曜始まり
      endDate.setDate(endDate.getDate() + (6 - dayOfWeek));
    }
    return endDate;
  } else {
    // 週3日表示
    const endDate = new Date(target);
    endDate.setDate(endDate.getDate() + 2);
    return endDate;
  }
});

// スケジュール取得
const getSchedule = async () => {
  isLoading.value = true;
  errorMessage.value = '';

  try {
    const username = sessionStorage.getItem('username');
    const sessionString = sessionStorage.getItem('session_string');

    if (!username) {
      throw new Error('ユーザー情報が見つかりません');
    }

    if (!sessionString) {
      throw new Error('セッションが見つかりません');
    }

    const response = await ScheduleService.getSchedule({
      username: username,
      session_string: sessionString
    });

    if (response.success) {
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

// イベントハンドラー
const goToMenu = () => {
  router.push('/user');
};

const switchView = (view: 'monthly' | 'weekly') => {
  currentView.value = view;

  // タブ選択時に表示モードを設定
  if (view === 'monthly') {
    displayMode.value = DisplayMode.Monthly;
  } else {
    displayMode.value = DisplayMode.ThreeDayWeek;
  }
};

const handlePrevious = () => {
  if (displayMode.value === DisplayMode.ThreeDayWeek) {
    // 週3日表示の場合：3日前にする
    displayTargetDate.value = new Date(displayTargetDate.value.getTime() - 3 * 24 * 60 * 60 * 1000);
  } else {
    // 月表示の場合：1か月前の同日にする。同日が存在しない場合は1か月前の末日にする
    const target = displayTargetDate.value;
    const newDate = new Date(target.getFullYear(), target.getMonth() - 1, target.getDate());
    if (newDate.getDate() !== target.getDate()) {
      // 同日が存在しない場合、1か月前の末日にする
      newDate.setDate(0);
    }
    displayTargetDate.value = newDate;
  }
};

const handleNext = () => {
  if (displayMode.value === DisplayMode.ThreeDayWeek) {
    // 週3日表示の場合：3日後にする
    displayTargetDate.value = new Date(displayTargetDate.value.getTime() + 3 * 24 * 60 * 60 * 1000);
  } else {
    // 月表示の場合：1か月後の同日にする。同日が存在しない場合は1か月後の末日にする
    const target = displayTargetDate.value;
    const newDate = new Date(target.getFullYear(), target.getMonth() + 1, target.getDate());
    if (newDate.getDate() !== target.getDate()) {
      // 同日が存在しない場合、1か月後の末日にする
      newDate.setDate(0);
    }
    displayTargetDate.value = newDate;
  }
};

const handleEditSchedule = (scheduleId: number) => {
  alert(`スケジュールID: ${scheduleId} を編集します`);
};

const handleAddSchedule = (year: number, month: number, day: number, hour?: number, minute?: number) => {
  if (hour !== undefined && minute !== undefined) {
    alert(`${year}年${month}月${day}日 ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}に新しいスケジュールを追加します`);
  } else {
    alert(`${year}年${month}月${day}日に新しいスケジュールを追加します`);
  }
};

const handleSundayStart = () => {
  isMondayStart.value = false;
};

const handleMondayStart = () => {
  isMondayStart.value = true;
};

onMounted(() => {
  getSchedule();
});
</script>

<style scoped>
.schedule-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.schedule-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #e0e0e0;
}

.schedule-header h1 {
  margin: 0;
  color: #333;
}

.menu-button {
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.menu-button:hover {
  background-color: #0056b3;
}

.schedule-tabs {
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.tab-button {
  padding: 10px 20px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  font-size: 16px;
  color: #666;
}

.tab-button.active {
  color: #007bff;
  border-bottom-color: #007bff;
}

.tab-button:hover {
  color: #007bff;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
}

.error {
  background-color: #f8d7da;
  color: #721c24;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 20px;
}
</style>