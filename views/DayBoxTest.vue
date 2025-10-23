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
      <h2>スケジュール表示テスト</h2>
      <div class="test-grid">
        <DayBox
          v-for="(day, index) in scheduleTestDays"
          :key="index"
          :date="day.date"
          :holiday-note="day.holidayNote"
          :is-current-month="day.isCurrentMonth"
          :schedules="day.schedules"
          @schedule-click="editSchedule"
          @date-click="addSchedule"
        />
      </div>
    </div>

    <div class="test-section">
      <h2>カレンダー表示テスト（7×6グリッド）</h2>
      <!-- 曜日ヘッダー -->
      <div class="calendar-header">
        <DayBoxTitle
          v-for="dayOfWeek in [1, 2, 3, 4, 5, 6, 0]"
          :key="dayOfWeek"
          :day-of-week="dayOfWeek"
        />
      </div>
      <!-- カレンダーグリッド -->
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

    <div class="test-section">
      <h2>DayLongBoxテスト（3日分）</h2>
      <div class="day-long-box-grid">
            <DayLongBox
              v-for="(day, index) in dayLongBoxTestDays"
              :key="index"
              :date="day.date"
              :holiday-note="day.holidayNote"
              :is-current-month="day.isCurrentMonth"
              :schedules="day.schedules"
              @schedule-click="editSchedule"
              @time-click="addSchedule"
            />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import DayBox from '../components/DayBox.vue';
import DayBoxTitle from '../components/DayBoxTitle.vue';
import DayLongBox from '../components/DayLongBox.vue';

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
        color: '#e3f2fd',
        positionNumber: 1,
        isTodo: false
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
        color: '#f3e5f5',
        positionNumber: 1,
        isTodo: true
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

// スケジュール表示テスト用の日付データ
const scheduleTestDays = ref([
  {
    date: new Date(2024, 0, 1),
    holidayNote: '',
    isCurrentMonth: true,
    schedules: [
      {
        id: 1,
        title: '終日イベント（開始日）',
        isAllDay: true,
        startDateTime: new Date(2024, 0, 1, 0, 0),
        duration: 3,
        isTodoCompleted: false,
        color: '#ff6b6b',
        positionNumber: 1,
        isTodo: false
      },
      {
        id: 2,
        title: '10:00 会議',
        isAllDay: false,
        startDateTime: new Date(2024, 0, 1, 10, 0),
        duration: 60,
        isTodoCompleted: false,
        color: '#4ecdc4',
        positionNumber: 2,
        isTodo: false
      },
      {
        id: 3,
        title: '買い物',
        isAllDay: false,
        startDateTime: new Date(2024, 0, 1, 15, 30),
        duration: 30,
        isTodoCompleted: false,
        color: '#45b7d1',
        positionNumber: 3,
        isTodo: true
      }
    ]
  },
  {
    date: new Date(2024, 0, 2),
    holidayNote: '',
    isCurrentMonth: true,
    schedules: [
      {
        id: 4,
        title: '終日イベント（継続中）',
        isAllDay: true,
        startDateTime: new Date(2024, 0, 1, 0, 0),
        duration: 3,
        isTodoCompleted: false,
        color: '#ff6b6b',
        positionNumber: 1,
        isTodo: false
      },
      {
        id: 5,
        title: '09:00 朝会',
        isAllDay: false,
        startDateTime: new Date(2024, 0, 2, 9, 0),
        duration: 30,
        isTodoCompleted: false,
        color: '#96ceb4',
        positionNumber: 2,
        isTodo: false
      },
      {
        id: 6,
        title: 'レポート作成',
        isAllDay: false,
        startDateTime: new Date(2024, 0, 2, 14, 0),
        duration: 120,
        isTodoCompleted: true,
        color: '#feca57',
        positionNumber: 3,
        isTodo: true
      }
    ]
  },
  {
    date: new Date(2024, 0, 3),
    holidayNote: '',
    isCurrentMonth: true,
    schedules: [
      {
        id: 7,
        title: '終日イベント（終了日）',
        isAllDay: true,
        startDateTime: new Date(2024, 0, 1, 0, 0),
        duration: 2,
        isTodoCompleted: false,
        color: '#ff6b6b',
        positionNumber: 1,
        isTodo: false
      },
      {
        id: 8,
        title: '11:00 プレゼン',
        isAllDay: false,
        startDateTime: new Date(2024, 0, 3, 11, 0),
        duration: 90,
        isTodoCompleted: false,
        color: '#ff9ff3',
        positionNumber: 2,
        isTodo: false
      }
    ]
  },
  {
    date: new Date(2024, 0, 4),
    holidayNote: '',
    isCurrentMonth: true,
    schedules: [
      {
        id: 9,
        title: '別月の終日イベント（継続中）',
        isAllDay: true,
        startDateTime: new Date(2023, 11, 30, 0, 0),
        duration: 5,
        isTodoCompleted: false,
        color: '#a8e6cf',
        positionNumber: 1,
        isTodo: false
      },
      {
        id: 10,
        title: '08:30 朝食',
        isAllDay: false,
        startDateTime: new Date(2024, 0, 4, 8, 30),
        duration: 30,
        isTodoCompleted: false,
        color: '#ffd3a5',
        positionNumber: 2,
        isTodo: false
      },
      {
        id: 11,
        title: '☐ ジム',
        isAllDay: false,
        startDateTime: new Date(2024, 0, 4, 18, 0),
        duration: 60,
        isTodoCompleted: false,
        color: '#fd79a8',
        positionNumber: 3,
        isTodo: true
      }
    ]
  },
  {
    date: new Date(2024, 0, 5),
    holidayNote: '',
    isCurrentMonth: true,
    schedules: [
      {
        id: 12,
        title: '別月の終日イベント（終了日）',
        isAllDay: true,
        startDateTime: new Date(2023, 11, 30, 0, 0),
        duration: 6,
        isTodoCompleted: false,
        color: '#a8e6cf',
        positionNumber: 1,
        isTodo: false
      }
    ]
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
    schedules: [
      {
        id: 13,
        title: '13:00 ランチ',
        isAllDay: false,
        startDateTime: new Date(2024, 0, 7, 13, 0),
        duration: 60,
        isTodoCompleted: false,
        color: '#74b9ff',
        positionNumber: 1,
        isTodo: false
      },
      {
        id: 14,
        title: '☐ 読書',
        isAllDay: false,
        startDateTime: new Date(2024, 0, 7, 20, 0),
        duration: 30,
        isTodoCompleted: true,
        color: '#fd79a8',
        positionNumber: 2,
        isTodo: true
      }
    ]
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
        color: i % 2 === 0 ? '#e3f2fd' : '#f3e5f5',
        positionNumber: 1,
        isTodo: i % 3 === 0
      }];
    }

    days.push({ date, holidayNote, isCurrentMonth, schedules });
  }

  calendarDays.value = days;
};

// DayLongBoxテスト用の日付データ
const dayLongBoxTestDays = ref([
  {
    date: new Date(2024, 0, 1),
    holidayNote: '',
    isCurrentMonth: true,
    schedules: [
      {
        id: 1,
        title: '新年会',
        isAllDay: true,
        startDateTime: new Date(2024, 0, 1, 0, 0),
        duration: 1,
        isTodoCompleted: false,
        color: '#ff6b6b',
        positionNumber: 1,
        isTodo: false
      },
      {
        id: 2,
        title: '年賀状作成',
        isAllDay: true,
        startDateTime: new Date(2024, 0, 1, 0, 0),
        duration: 1,
        isTodoCompleted: true,
        color: '#4ecdc4',
        positionNumber: 2,
        isTodo: true
      },
      {
        id: 4,
        title: '会議',
        isAllDay: false,
        startDateTime: new Date(2024, 0, 1, 10, 0),
        duration: 60, // 60分
        isTodoCompleted: false,
        color: '#95a5a6',
        positionNumber: 1,
        isTodo: false
      },
      {
        id: 5,
        title: 'ランチ',
        isAllDay: false,
        startDateTime: new Date(2024, 0, 1, 12, 0),
        duration: 90, // 90分
        isTodoCompleted: false,
        color: '#f39c12',
        positionNumber: 2,
        isTodo: false
      }
    ]
  },
  {
    date: new Date(2024, 0, 2),
    holidayNote: '',
    isCurrentMonth: true,
    schedules: [
      {
        id: 3,
        title: '買い物',
        isAllDay: true,
        startDateTime: new Date(2024, 0, 2, 0, 0),
        duration: 1,
        isTodoCompleted: false,
        color: '#45b7d1',
        positionNumber: 1,
        isTodo: true
      },
      {
        id: 6,
        title: 'ジム',
        isAllDay: false,
        startDateTime: new Date(2024, 0, 2, 18, 0),
        duration: 120, // 120分
        isTodoCompleted: false,
        color: '#27ae60',
        positionNumber: 1,
        isTodo: true
      },
      {
        id: 7,
        title: '読書',
        isAllDay: false,
        startDateTime: new Date(2024, 0, 2, 20, 30),
        duration: 30, // 30分
        isTodoCompleted: true,
        color: '#8e44ad',
        positionNumber: 2,
        isTodo: true
      }
    ]
  },
  {
    date: new Date(2024, 0, 3),
    holidayNote: '',
    isCurrentMonth: true,
    schedules: [
      {
        id: 8,
        title: '朝の散歩',
        isAllDay: false,
        startDateTime: new Date(2024, 0, 3, 7, 0),
        duration: 45, // 45分
        isTodoCompleted: false,
        color: '#16a085',
        positionNumber: 1,
        isTodo: true
      },
      {
        id: 9,
        title: 'プロジェクト作業',
        isAllDay: false,
        startDateTime: new Date(2024, 0, 3, 9, 0),
        duration: 180, // 180分（3時間）
        isTodoCompleted: false,
        color: '#e74c3c',
        positionNumber: 2,
        isTodo: false
      }
    ]
  }
]);

// スケジュール編集メソッド
const editSchedule = (scheduleId: number) => {
  alert(`スケジュールID: ${scheduleId} がクリックされました`);
};

// スケジュール追加メソッド
const addSchedule = (year: number, month: number, day: number, hour?: number, minute?: number) => {
  if (hour !== undefined && minute !== undefined) {
    alert(`${year}年${month}月${day}日 ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}に新しいスケジュールを追加します`);
  } else {
    alert(`${year}年${month}月${day}日に新しいスケジュールを追加します`);
  }
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
        color: date.getDate() % 10 === 0 ? '#e8f5e8' : '#fff3e0',
        positionNumber: 1,
        isTodo: date.getDate() % 7 === 0
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

.calendar-header {
  display: grid;
  grid-template-columns: repeat(7, 140px); /* 固定サイズ140pxに変更 */
  gap: 0px; /* 間隔を0pxに設定 */
  max-width: 980px; /* 7 * 140px = 980px */
  margin: 0 auto;
  margin-bottom: 5px;
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

.day-long-box-grid {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
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
