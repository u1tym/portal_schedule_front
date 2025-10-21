export interface ScheduleRequest {
  username: string;
  session_string: string;
}

export interface ScheduleItem {
  id: number;
  title: string;
  is_all_day: boolean;
  start_datetime: string;
  duration: number;
  activity_category_id?: number;
  schedule_type?: string;
  location?: string;
  details?: string;
  is_todo_completed: boolean;
}

export interface ScheduleResponse {
  success: boolean;
  session_string: string;
  schedules: ScheduleItem[];
}

export interface ApiError {
  detail: string;
}
