export interface ScheduleRequest {
  username: string;
  session_string: string;
}

export interface ScheduleResponse {
  success: boolean;
  session_string: string;
}

export interface ApiError {
  detail: string;
}
