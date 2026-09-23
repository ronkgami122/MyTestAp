export interface DummyItem {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  department: string;
  phone: string;
  city: string;
  country: string;
  status: 'Active' | 'Away' | 'Offline';
  joinDate: string;
  bio: string;
}

const fallbackRoles = [
  'Senior React Native Engineer',
  'Lead Mobile Architect',
  'UI/UX Product Designer',
  'Backend Cloud Specialist',
  'Full Stack Developer',
  'QA Automation Lead',
  'DevOps & Infrastructure Engineer',
  'Product Manager',
];

const fallbackDepartments = [
  'Mobile Platform',
  'Engineering',
  'Design & UX',
  'Product Innovation',
  'Cloud Infrastructure',
  'Quality Assurance',
];

const fallbackCities = [
  'San Francisco, USA',
  'London, UK',
  'Tokyo, Japan',
  'Berlin, Germany',
  'Toronto, Canada',
  'Sydney, Australia',
  'Bangalore, India',
  'Singapore',
];

const fallbackNames = [
  'Alex Morgan',
  'Sophia Chen',
  'Marcus Vance',
  'Elena Rostova',
  'Devon Taylor',
  'Amina Khan',
  'Lucas Silva',
  'Chloe Bennett',
  'Rahul Sharma',
  'Zoe Martinez',
  'David Kim',
  'Emma Watson',
  'Liam Johnson',
  'Olivia Williams',
  'Noah Brown',
  'Ava Garcia',
  'William Miller',
  'Isabella Davis',
  'James Rodriguez',
  'Mia Hernandez',
];

const statuses: Array<'Active' | 'Away' | 'Offline'> = ['Active', 'Away', 'Offline'];

export const generateDummyData = (count = 20): DummyItem[] => {
  let fakerModule: any = null;
  try {
    fakerModule = require('@faker-js/faker').faker;
  } catch (e) {
    fakerModule = null;
  }

  const items: DummyItem[] = [];

  for (let i = 0; i < count; i++) {
    const id = fakerModule ? fakerModule.string.uuid() : `user-${i + 1}-${Date.now().toString(36)}`;
    const name = fakerModule
      ? fakerModule.person.fullName()
      : fallbackNames[i % fallbackNames.length] + (i >= fallbackNames.length ? ` ${i + 1}` : '');
    const email = fakerModule
      ? fakerModule.internet.email({ firstName: name.split(' ')[0], lastName: name.split(' ')[1] })
      : `${name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@example.com`;
    const avatar = fakerModule
      ? fakerModule.image.avatar()
      : `https://i.pravatar.cc/150?u=${encodeURIComponent(id)}`;
    const role = fakerModule
      ? fakerModule.person.jobTitle()
      : fallbackRoles[i % fallbackRoles.length];
    const department = fakerModule
      ? fakerModule.commerce.department()
      : fallbackDepartments[i % fallbackDepartments.length];
    const phone = fakerModule
      ? fakerModule.phone.number()
      : `+1 (555) ${100 + i}-${1000 + i}`;
    const location = fakerModule
      ? `${fakerModule.location.city()}, ${fakerModule.location.country()}`
      : fallbackCities[i % fallbackCities.length];
    const [city, country] = location.includes(',')
      ? location.split(',').map((s: string) => s.trim())
      : [location, 'Global'];
    const status = statuses[i % statuses.length];
    const joinDate = fakerModule
      ? fakerModule.date.past({ years: 3 }).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      : `Jan ${10 + (i % 18)}, 2024`;
    const bio = fakerModule
      ? fakerModule.person.bio()
      : `Passionate about building scalable mobile experiences with clean architecture and modern tooling.`;

    items.push({
      id,
      name,
      email,
      avatar,
      role,
      department,
      phone,
      city,
      country,
      status,
      joinDate,
      bio,
    });
  }

  return items;
};
