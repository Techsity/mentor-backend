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
  PENDING_RESCHEDULE_APPROVAL = 'pending_reschedule_approval',
  OVERDUE = 'overdue',
}
