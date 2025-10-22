<template>
  <div class="day-box-test">
    <h1>DayBox コンポーネント テスト</h1>

    <div class="test-section">
      <h2>基本テスト</h2>
      <div class="test-grid">
        <DayBox
          v-for="(day, index) in basicTestDays"
          :key="index"
          :date="day.date"
          :holiday-note="day.holidayNote"
          :is-current-month="day.isCurrentMonth"
        />
      </div>
    </div>

    <div class="test-section">
      <h2>休日注釈テスト</h2>
      <div class="test-grid">
        <DayBox
          v-for="(day, index) in holidayTestDays"
          :key="index"
          :date="day.date"
          :holiday-note="day.holidayNote"
          :is-current-month="day.isCurrentMonth"
        />
      </div>
    </div>

    <div class="test-section">
      <h2>カレンダー表示テスト（7×6グリッド）</h2>
      <div class="calendar-grid">
        <DayBox
          v-for="(day, index) in calendarDays"
          :key="index"
          :date="day.date"
          :holiday-note="day.holidayNote"
          :is-current-month="day.isCurrentMonth"
        />
      </div>
    </div>

    <div class="test-section">
      <h2>月表示テスト</h2>
      <div class="month-display">
        <h3>{{ currentMonthText }}</h3>
        <div class="month-grid">
          <DayBox
            v-for="(day, index) in monthDays"
            :key="index"
            :date="day.date"
            :holiday-note="day.holidayNote"
            :is-current-month="day.isCurrentMonth"
          />
        </div>
        <div class="month-controls">
          <button @click="previousMonth" class="nav-button">前月</button>
          <button @click="nextMonth" class="nav-button">次月</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import DayBox from '../components/DayBox.vue';

// 基本テスト用の日付データ
const basicTestDays = ref([
  {
    date: new Date(2024, 0, 1),
    holidayNote: '',
    isCurrentMonth: true,
    schedules: [
      {
        id: 1,
        title: '会議',
        isAllDay: false,
        startDateTime: new Date(2024, 0, 1, 10, 0),
        duration: 60,
        isTodoCompleted: false,
        color: '#e3f2fd'
      }
    ]
  },
  {
    date: new Date(2024, 0, 2),
    holidayNote: '',
    isCurrentMonth: true,
    schedules: []
  },
  {
    date: new Date(2024, 0, 3),
    holidayNote: '',
    isCurrentMonth: true,
    schedules: [
      {
        id: 2,
        title: '打ち合わせ',
        isAllDay: false,
        startDateTime: new Date(2024, 0, 3, 14, 0),
        duration: 90,
        isTodoCompleted: true,
        color: '#f3e5f5'
      }
    ]
  },
  {
    date: new Date(2024, 0, 4),
    holidayNote: '',
    isCurrentMonth: true,
    schedules: []
  },
  {
    date: new Date(2024, 0, 5),
    holidayNote: '',
    isCurrentMonth: true,
    schedules: []
  },
  {
    date: new Date(2024, 0, 6),
    holidayNote: '',
    isCurrentMonth: true,
    schedules: []
  },
  {
    date: new Date(2024, 0, 7),
    holidayNote: '',
    isCurrentMonth: true,
    schedules: []
  }
]);

// 休日注釈テスト用の日付データ
const holidayTestDays = ref([
  {
    date: new Date(2024, 0, 1),
    holidayNote: '元日',
    isCurrentMonth: true,
    schedules: []
  },
  {
    date: new Date(2024, 0, 2),
    holidayNote: '',
    isCurrentMonth: true,
    schedules: []
  },
  {
    date: new Date(2024, 0, 3),
    holidayNote: '',
    isCurrentMonth: true,
    schedules: []
  },
  {
    date: new Date(2024, 0, 4),
    holidayNote: '',
    isCurrentMonth: true,
    schedules: []
  },
  {
    date: new Date(2024, 0, 5),
    holidayNote: '',
    isCurrentMonth: true,
    schedules: []
  },
  {
    date: new Date(2024, 0, 6),
    holidayNote: '',
    isCurrentMonth: true,
    schedules: []
  },
  {
    date: new Date(2024, 0, 7),
    holidayNote: '',
    isCurrentMonth: true,
    schedules: []
  }
]);

// カレンダー表示テスト用の日付データ（7×6グリッド）
const calendarDays = ref<Array<{ date: Date; holidayNote: string; isCurrentMonth: boolean; schedules: any[] }>>([]);

// 月表示テスト用の状態
const currentMonth = ref(new Date());

// 現在月のテキスト
const currentMonthText = computed(() => {
  return currentMonth.value.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long'
  });
});

// 月表示用の日付データ
const monthDays = ref<Array<{ date: Date; holidayNote: string; isCurrentMonth: boolean; schedules: any[] }>>([]);

// カレンダー用の日付データを生成
const generateCalendarDays = () => {
  const days: Array<{ date: Date; holidayNote: string; isCurrentMonth: boolean; schedules: any[] }> = [];

  // 7×6 = 42日分のデータを生成
  for (let i = 0; i < 42; i++) {
    const date = new Date(2024, 0, i + 1);
    let holidayNote = '';
    let schedules: any[] = [];

    // 当月フラグを設定（1月の日付のみ当月）
    const isCurrentMonth = date.getMonth() === 0;

    // 土日の自動判定は削除（親コンポーネントから指定されたもののみ表示）

    // 特定の日付を祝日として設定
    if (date.getDate() === 1 && date.getMonth() === 0) {
      holidayNote = '元日';
    } else if (date.getDate() === 8 && date.getMonth() === 0) {
      holidayNote = '成人の日';
    }

    // サンプルスケジュールを追加
    if (date.getDate() % 3 === 0 && !holidayNote) {
      schedules = [{
        id: i,
        title: `スケジュール${i}`,
        isAllDay: false,
        startDateTime: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 10, 0),
        duration: 60,
        isTodoCompleted: i % 2 === 0,
        color: i % 2 === 0 ? '#e3f2fd' : '#f3e5f5'
      }];
    }

    days.push({ date, holidayNote, isCurrentMonth, schedules });
  }

  calendarDays.value = days;
};

// 月表示用の日付データを生成
const generateMonthDays = () => {
  const year = currentMonth.value.getFullYear();
  const month = currentMonth.value.getMonth();

  // 月の最初の日
  const firstDay = new Date(year, month, 1);
  // 月の最後の日
  const lastDay = new Date(year, month + 1, 0);

  // 月の最初の日が日曜日でない場合、前月から日付を取得
  const startDate = new Date(firstDay);
  const dayOfWeek = firstDay.getDay();
  startDate.setDate(startDate.getDate() - dayOfWeek);

  const days: Array<{ date: Date; holidayNote: string; isCurrentMonth: boolean; schedules: any[] }> = [];

  // 6週間分（42日）の日付を生成
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);

    let holidayNote = '';
    let schedules: any[] = [];

    // 当月フラグを設定（現在表示している月かどうか）
    const isCurrentMonth = date.getMonth() === month;

    // 土日の自動判定は削除（親コンポーネントから指定されたもののみ表示）

    // 祝日チェック（簡易版）
    if (date.getMonth() === month) {
      if (date.getDate() === 1) {
        holidayNote = '元日';
      } else if (date.getDate() === 8) {
        holidayNote = '成人の日';
      } else if (date.getDate() === 11) {
        holidayNote = '建国記念の日';
      } else if (date.getDate() === 12) {
        holidayNote = '天皇誕生日';
      } else if (date.getDate() === 20) {
        holidayNote = '春分の日';
      } else if (date.getDate() === 29) {
        holidayNote = '昭和の日';
      }
    }

    // サンプルスケジュールを追加（現在月のみ）
    if (date.getMonth() === month && !holidayNote && date.getDate() % 5 === 0) {
      schedules = [{
        id: i,
        title: `会議${date.getDate()}`,
        isAllDay: false,
        startDateTime: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 14, 0),
        duration: 90,
        isTodoCompleted: date.getDate() % 10 === 0,
        color: date.getDate() % 10 === 0 ? '#e8f5e8' : '#fff3e0'
      }];
    }

    days.push({ date, holidayNote, isCurrentMonth, schedules });
  }

  monthDays.value = days;
};

// 前月ボタン
const previousMonth = () => {
  currentMonth.value = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() - 1, 1);
  generateMonthDays();
};

// 次月ボタン
const nextMonth = () => {
  currentMonth.value = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() + 1, 1);
  generateMonthDays();
};

// 初期化
onMounted(() => {
  generateCalendarDays();
  generateMonthDays();
});
</script>

<style scoped>
.day-box-test {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
}

.test-section {
  margin-bottom: 40px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.test-section h2 {
  color: #495057;
  margin-bottom: 20px;
  border-bottom: 2px solid #dee2e6;
  padding-bottom: 10px;
}

.test-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0px; /* 間隔を0pxに設定 */
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 140px); /* 固定サイズ140pxに変更 */
  gap: 0px; /* 間隔を0pxに設定 */
  max-width: 980px; /* 7 * 140px = 980px */
  margin: 0 auto;
}

.month-display {
  text-align: center;
}

.month-display h3 {
  color: #495057;
  margin-bottom: 20px;
  font-size: 1.5rem;
}

.month-grid {
  display: grid;
  grid-template-columns: repeat(7, 140px); /* 固定サイズ140pxに変更 */
  gap: 0px; /* 間隔を0pxに設定 */
  max-width: 980px; /* 7 * 140px = 980px */
  margin: 0 auto 20px;
}

.month-controls {
  display: flex;
  justify-content: center;
  gap: 20px;
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

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .calendar-grid,
  .month-grid {
    grid-template-columns: repeat(7, 140px); /* 固定サイズを維持 */
    gap: 0px; /* 間隔を0pxに設定 */
  }

  .test-grid {
    justify-content: center;
  }
}
</style>
