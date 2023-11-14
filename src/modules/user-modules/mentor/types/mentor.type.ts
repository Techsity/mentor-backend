export type Skill = {
  skill_name: string;

  years_of_exp: number;
};

export type WorkExperience = {
  company: string;

  job_role: string;

  description: string;
  from_year: Date;
  to_year: Date;
};

export type PastProjects = {
  company: string;

  job_role: string;

  description: string;
};

export type Education = {
  school: string;

  credential_type: string;

  course_of_study: string;

  from_year: Date;

  to_year: Date;
};

export type Certification = {
  organization: string;

  title: string;

  year: Date;
};

export type UserAvailability = {
  day: string;

  from_time: string;

  to_time: string;
};

export type BasicMessageResponse = {
  message: string;
};
