import { faker } from '@faker-js/faker';
import { Mentor } from '../modules/mentor/entities/mentor.entity';
import {
  MentorExpLevel,
  MentorRole,
} from '../modules/mentor/enums/mentor.enum';
import { User } from '../modules/user/entities/user.entity';
export function createMentor(user: User): Mentor {
  const mentor = new Mentor();
  mentor.about = faker.lorem.sentence();
  mentor.availability = generateAvailability();
  mentor.certifications = generateCertifications(); // or generate some data
  mentor.education_bg = generateEducationBackground(); // or generate some data
  mentor.exp_level = faker.helpers.enumValue(MentorExpLevel);
  mentor.hourly_rate = faker.number.int({ min: 30, max: 100 });
  mentor.language = [
    faker.helpers.arrayElement(['English', 'Spanish', 'French']),
  ];
  mentor.projects = generateProjects(); // or generate some data
  mentor.role = faker.helpers.enumValue(MentorRole);
  mentor.skills = generateSkills();
  mentor.user = user;
  return mentor;
}

function generateAvailability() {
  const days = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];
  const numberOfDays = faker.datatype.number({ min: 1, max: days.length });
  const availability = [];

  for (let i = 0; i < numberOfDays; i++) {
    availability.push({
      day: faker.helpers.arrayElement(days),
      start_time: faker.number.int({ min: 8, max: 12 }) + ':00', // Example: '9:00'
      end_time: faker.number.int({ min: 13, max: 17 }) + ':00', // Example: '16:00'
    });
  }

  return availability;
}
function generateCertifications() {
  const numberOfCertifications = faker.number.int({ min: 1, max: 5 });
  const certifications = [];

  for (let i = 0; i < numberOfCertifications; i++) {
    certifications.push({
      name: faker.company.name(),
      institution: faker.company.name(),
      year: faker.date.past({
        years: faker.number.int({ min: 2010, max: 2020 }),
      }),
    });
  }

  return certifications;
}

function generateEducationBackground() {
  const numberOfEducations = faker.datatype.number({ min: 1, max: 3 });
  const educationBackground = [];

  for (let i = 0; i < numberOfEducations; i++) {
    educationBackground.push({
      credential_type: faker.person.jobTitle(),
      course_of_study: faker.person.jobTitle(),
      school: faker.company.name(),
      year: faker.date.past().getFullYear(),
    });
  }

  return educationBackground;
}

function generateProjects() {
  const numberOfProjects = faker.number.int({ min: 1, max: 3 });
  const projects = [];

  for (let i = 0; i < numberOfProjects; i++) {
    const startDate = faker.date.past({
      years: faker.number.int({ min: 2010 }),
    });
    const endDate = faker.date.between({ from: startDate, to: new Date() });

    projects.push({
      name: faker.commerce.productName(),
      description: faker.lorem.sentence(),
      startDate: startDate,
      endDate: endDate,
    });
  }

  return projects;
}

function generateSkills() {
  const skillsList = [
    'JavaScript',
    'TypeScript',
    'Python',
    'Java',
    'C#',
    'Ruby',
  ];
  const numberOfSkills = faker.number.int({
    min: 1,
    max: skillsList.length,
  });
  const skills = [];

  for (let i = 0; i < numberOfSkills; i++) {
    skills.push({
      skill_name: faker.helpers.arrayElement(skillsList),
      years_of_exp: faker.number.int({ min: 1, max: 10 }),
    });
  }

  return skills;
}
