import type { Job } from '../schemas/job.schema';
import type { User } from '../schemas/auth.schema';

const companies = [
  'Google', 'Amazon', 'Microsoft', 'Apple', 'Meta', 'Netflix', 'Spotify',
  'Uber', 'Airbnb', 'Twitter', 'LinkedIn', 'Salesforce', 'Adobe', 'Oracle',
  'IBM', 'Intel', 'Cisco', 'Dell', 'HP', 'NVIDIA', 'Mercado Libre', 'Rappi',
  'Kavak', 'Clip', 'Bitso', 'Konfio', 'Kueski', 'Nubank', 'Stori', 'Clara',
];

const cities = [
  'Ciudad de México', 'Guadalajara', 'Monterrey', 'Puebla', 'Tijuana',
  'León', 'Querétaro', 'Mérida', 'Cancún', 'Aguascalientes',
];

const titles = [
  'Software Engineer', 'Senior Software Engineer', 'Staff Engineer',
  'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
  'Mobile Developer', 'iOS Developer', 'Android Developer', 'React Native Developer',
  'DevOps Engineer', 'SRE Engineer', 'Cloud Engineer', 'Data Engineer',
  'Machine Learning Engineer', 'QA Engineer', 'Tech Lead', 'Engineering Manager',
  'Product Manager', 'UX Designer', 'UI Designer', 'Scrum Master',
];

const tags = [
  'React', 'React Native', 'TypeScript', 'JavaScript', 'Node.js', 'Python',
  'Java', 'Kotlin', 'Swift', 'Go', 'Rust', 'AWS', 'GCP', 'Azure', 'Docker',
  'Kubernetes', 'PostgreSQL', 'MongoDB', 'Redis', 'GraphQL', 'REST API',
  'CI/CD', 'Agile', 'Scrum', 'Remote', 'Híbrido', 'Presencial',
];

const descriptions = [
  'Buscamos un profesional apasionado por la tecnología para unirse a nuestro equipo de desarrollo.',
  'Oportunidad de trabajar en proyectos innovadores con impacto a nivel internacional.',
  'Únete a un equipo dinámico y colaborativo donde podrás crecer profesionalmente.',
  'Estamos en búsqueda de talento excepcional para resolver problemas complejos.',
  'Forma parte de una empresa líder en su sector con excelentes beneficios.',
];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomElements<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function getRandomSalary(): number | null {
  const hasNullSalary = Math.random() < 0.15;
  if (hasNullSalary) return null;
  
  const base = Math.floor(Math.random() * 80000) + 20000;
  return Math.round(base / 1000) * 1000;
}

function getRandomDate(): string {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 90);
  const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  return date.toISOString();
}

export function generateJobs(count: number = 95): Job[] {
  const jobs: Job[] = [];
  
  for (let i = 1; i <= count; i++) {
    jobs.push({
      id: i,
      title: getRandomElement(titles),
      company: getRandomElement(companies),
      city: getRandomElement(cities),
      salary: getRandomSalary(),
      description: `${getRandomElement(descriptions)} Responsabilidades incluyen desarrollo de software de alta calidad, colaboración con equipos multidisciplinarios, y participación en la toma de decisiones técnicas. Requisitos: experiencia comprobable, habilidades de comunicación, y deseo de aprender continuamente.`,
      publishedAt: getRandomDate(),
      tags: getRandomElements(tags, Math.floor(Math.random() * 4) + 2),
    });
  }
  
  return jobs.sort((a, b) => 
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export const mockUser: User = {
  id: 1,
  email: 'test@occ.com.mx',
  name: 'Usuario de Prueba',
};

export const mockPassword = 'Test1234';

export const jobs = generateJobs(95);
