type CourseSection = {
  section_name: string;

  video_url: string;

  notes: string;
};
export type CourseContent = {
  title: string;
  course_sections: CourseSection[];
};
