export enum AppointmentStatus {
  AWAITING_PAYMENT = 'awaiting_payment',
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  IN_PROGRESS = 'in_progress',
  UPCOMING = 'upcoming',
  DECLINED = 'declined',
  CANCELLED_BY_USER = 'cancelled_by_user',
  CANCELLED_BY_MENTOR = 'cancelled_by_mentor',
  NO_SHOW = 'no_show',
  COMPLETED = 'completed',
  RESCHEDULED_BY_USER = 'rescheduled_by_user',
  RESCHEDULED_BY_MENTOR = 'rescheduled_by_mentor',
  OVERDUE = 'overdue',
}

export enum AppointmentRescheduleStatus {
  AWAITING_USER_APPROVAL = 'awaiting_user_approval',
  AWAITING_MENTOR_APPROVAL = 'awaiting_mentor_approval',
}
