import { useState, useEffect, useCallback, useRef, type FormEvent } from 'react';
import {
  LayoutDashboard, User, FolderOpen, GraduationCap, Target, Wallet, Briefcase,
  Trophy, Award, Puzzle, Rocket, Calendar as CalIcon, Brain, Map as MapIcon,
  PenLine, FileText, Languages, Bot, ClipboardList, Heart, Settings as SettingsIcon,
  Menu, X, LogOut, Bell,
} from 'lucide-react';

/* ===================== TYPES ===================== */
interface University {
  id: string; name: string; country: string; city: string; majors: string[];
  gpaMin: number; english: string; engPct: number; sat: boolean; tuition: string;
  docs: string[]; deadline: string; site: string;
}
interface Opportunity {
  id: string; title: string; org: string; cat: string; country: string; mode: string;
  cost: string; major: string; deadline: string; link: string; desc: string;
}
interface Profile {
  name: string; surname: string; age: string; country: string; city: string;
  school: string; grade: string; gpa: string; major: string; countries: string;
  languages: string; english: string; olympiadsCount: number; projectsCount: number;
  competitionsCount: number; volunteeringCount: number; internshipsCount: number;
  certificatesCount: number; researchCount: number; leadershipCount: number;
  programmingCount: number; mathScore: number; achievements: string; github: string; resume: string;
}
interface AppEvent {
  id: string; title: string; date: string; time: string; desc: string;
  category: string; link: string; priority: string; status: string;
}
interface Application {
  id: string; university: string; program: string; status: string; deadline: string; notes: string;
}
interface ChatMessage { role: 'user' | 'ai'; text: string }
interface AppState {
  user: { name: string; email: string } | null;
  profile: Profile;
  saved: { uni: string[]; opp: string[] };
  portfolio: Record<string, string[]>;
  events: AppEvent[];
  applications: Application[];
  chat: ChatMessage[];
}

/* ===================== CONSTANTS ===================== */
const LS_KEY = 'fm_v1';
const uid = () => Math.random().toString(36).slice(2, 9);
const todayISO = () => new Date().toISOString().slice(0, 10);

const MAJORS = ['Computer Science','Software Engineering','Artificial Intelligence','Data Science','Cybersecurity','Robotics','Information Systems','Mathematics','Applied Mathematics','Physics','Chemistry','Biology','Biochemistry','Medicine','Dentistry','Pharmacy','Nursing','Biotechnology','Genetics','Neuroscience','Public Health','Economics','Finance','Accounting','Business Administration','Management','Marketing','Entrepreneurship','International Relations','Political Science','Law','International Law','Architecture','Urban Planning','Graphic Design','UI/UX Design','Industrial Design','Fashion Design','Psychology','Sociology','Journalism','Media Studies','Communications','Film Studies','Mechanical Engineering','Electrical Engineering','Civil Engineering','Environmental Engineering','Aerospace Engineering','Chemical Engineering','Petroleum Engineering','Mining Engineering','Materials Science','Linguistics','Translation Studies','Education','Pedagogy','History','Philosophy','Art History','Fine Arts','Music','Theatre','Anthropology','Geography','Agriculture','Veterinary Science','Sports Science','Hospitality Management','Logistics','Actuarial Science','Statistics','Astronomy','Geology','Oceanography'];

const UNIS: University[] = [
  {id:"nu",name:"Nazarbayev University",country:"Казахстан",city:"Астана",majors:["Computer Science","Engineering","Medicine","Economics"],gpaMin:3.6,english:"IELTS 6.5+",engPct:70,sat:false,tuition:"Гранты покрывают большинство мест",docs:["Аттестат","IELTS/TOEFL","Эссе","Рекомендательные письма"],deadline:"Апрель (демо-дата)",site:"https://nu.edu.kz"},
  {id:"kaznu",name:"Al-Farabi KazNU",country:"Казахстан",city:"Алматы",majors:["Economics","Medicine","Law","Computer Science"],gpaMin:3.2,english:"IELTS 5.5+",engPct:55,sat:false,tuition:"Гранты + платное",docs:["Аттестат","Сертификат языка"],deadline:"Июль (демо-дата)",site:"https://kaznu.kz"},
  {id:"enu",name:"L.N. Gumilyov ENU",country:"Казахстан",city:"Астана",majors:["Law","International Relations","Computer Science"],gpaMin:3.0,english:"IELTS 5.5+",engPct:55,sat:false,tuition:"Гранты + платное",docs:["Аттестат","Сертификат языка"],deadline:"Июль (демо-дата)",site:"https://enu.kz"},
  {id:"satbayev",name:"Satbayev University",country:"Казахстан",city:"Алматы",majors:["Mining Engineering","Civil Engineering","Petroleum Engineering"],gpaMin:2.9,english:"IELTS 5.0+",engPct:50,sat:false,tuition:"Гранты доступны",docs:["Аттестат","Сертификат языка"],deadline:"Июль (демо-дата)",site:"https://satbayev.university"},
  {id:"aitu",name:"Astana IT University",country:"Казахстан",city:"Астана",majors:["Computer Science","Data Science","Cybersecurity"],gpaMin:3.0,english:"IELTS 5.5+",engPct:55,sat:false,tuition:"Гранты доступны",docs:["Аттестат","Портфолио проектов"],deadline:"Июнь (демо-дата)",site:"https://astanait.edu.kz"},
  {id:"kbtu",name:"KBTU",country:"Казахстан",city:"Алматы",majors:["Computer Science","Engineering","Economics"],gpaMin:3.0,english:"IELTS 5.5+",engPct:55,sat:false,tuition:"Гранты + платное",docs:["Аттестат","Мотивационное письмо"],deadline:"Июль (демо-дата)",site:"https://kbtu.edu.kz"},
  {id:"sdu",name:"SDU University",country:"Казахстан",city:"Каскелен",majors:["Computer Science","Business Administration"],gpaMin:2.8,english:"IELTS 5.0+",engPct:50,sat:false,tuition:"Гранты доступны",docs:["Аттестат"],deadline:"Август (демо-дата)",site:"https://sdu.edu.kz"},
  {id:"kimep",name:"KIMEP University",country:"Казахстан",city:"Алматы",majors:["Business Administration","Finance","Law"],gpaMin:3.0,english:"IELTS 5.5+",engPct:55,sat:false,tuition:"Платное + гранты",docs:["Аттестат","Эссе"],deadline:"Июль (демо-дата)",site:"https://kimep.kz"},
  {id:"almau",name:"AlmaU",country:"Казахстан",city:"Алматы",majors:["Marketing","Business Administration","Design"],gpaMin:2.7,english:"IELTS 5.0+",engPct:50,sat:false,tuition:"Платное + гранты",docs:["Аттестат"],deadline:"Август (демо-дата)",site:"https://almau.edu.kz"},
  {id:"buketov",name:"Karaganda Buketov University",country:"Казахстан",city:"Караганда",majors:["Education","History","Biology"],gpaMin:2.7,english:"IELTS 4.5+",engPct:40,sat:false,tuition:"Гранты доступны",docs:["Аттестат"],deadline:"Июль (демо-дата)",site:"https://buketov.edu.kz"},
  {id:"mit",name:"MIT",country:"США",city:"Кембридж",majors:["Computer Science","Engineering","Physics"],gpaMin:3.9,english:"IELTS 7.5+",engPct:88,sat:false,tuition:"Need-blind aid для международных",docs:["Эссе x5","Рекомендации","SAT/ACT","Портфолио"],deadline:"1 января (демо-дата)",site:"https://mit.edu"},
  {id:"stanford",name:"Stanford University",country:"США",city:"Стэнфорд",majors:["Computer Science","Artificial Intelligence","Business Administration"],gpaMin:3.9,english:"IELTS 7.0+",engPct:85,sat:false,tuition:"Need-based aid (демо)",docs:["Эссе","Рекомендации","SAT/ACT"],deadline:"Январь (демо-дата)",site:"https://stanford.edu"},
  {id:"harvard",name:"Harvard University",country:"США",city:"Кембридж",majors:["Law","Economics","Medicine"],gpaMin:3.9,english:"IELTS 7.5+",engPct:88,sat:false,tuition:"Need-blind aid (демо)",docs:["Эссе","Рекомендации","SAT/ACT"],deadline:"Январь (демо-дата)",site:"https://harvard.edu"},
  {id:"uoft",name:"University of Toronto",country:"Канада",city:"Торонто",majors:["Computer Science","Economics","Medicine"],gpaMin:3.7,english:"IELTS 6.5+",engPct:70,sat:false,tuition:"От $45,000/год (демо)",docs:["Транскрипт","Эссе","IELTS"],deadline:"Январь (демо-дата)",site:"https://utoronto.ca"},
  {id:"ubc",name:"University of British Columbia",country:"Канада",city:"Ванкувер",majors:["Environmental Engineering","Biology","Business Administration"],gpaMin:3.5,english:"IELTS 6.5+",engPct:70,sat:false,tuition:"От $40,000/год (демо)",docs:["Транскрипт","Эссе"],deadline:"Январь (демо-дата)",site:"https://ubc.ca"},
  {id:"oxford",name:"University of Oxford",country:"Великобритания",city:"Оксфорд",majors:["Law","Philosophy","Medicine"],gpaMin:3.8,english:"IELTS 7.0+",engPct:85,sat:false,tuition:"Scholarships доступны (демо)",docs:["Эссе","Рекомендации","Собеседование"],deadline:"Октябрь (демо-дата)",site:"https://ox.ac.uk"},
  {id:"imperial",name:"Imperial College London",country:"Великобритания",city:"Лондон",majors:["Mechanical Engineering","Computer Science","Physics"],gpaMin:3.7,english:"IELTS 6.5+",engPct:75,sat:false,tuition:"От £32,000/год (демо)",docs:["Транскрипт","Эссе"],deadline:"Январь (демо-дата)",site:"https://imperial.ac.uk"},
  {id:"sorbonne",name:"Sorbonne University",country:"Франция",city:"Париж",majors:["Linguistics","Art History","Chemistry"],gpaMin:3.2,english:"IELTS 6.0+",engPct:60,sat:false,tuition:"Символическая плата (демо)",docs:["Транскрипт","Французский/английский сертификат"],deadline:"Март (демо-дата)",site:"https://sorbonne-universite.fr"},
  {id:"tum",name:"TU Munich",country:"Германия",city:"Мюнхен",majors:["Mechanical Engineering","Computer Science","Physics"],gpaMin:3.3,english:"IELTS 6.0+",engPct:60,sat:false,tuition:"Символическая плата (демо)",docs:["Транскрипт","Немецкий/английский сертификат"],deadline:"15 июля (демо-дата)",site:"https://tum.de"},
  {id:"lmu",name:"LMU Munich",country:"Германия",city:"Мюнхен",majors:["Medicine","Biology","Psychology"],gpaMin:3.4,english:"IELTS 6.0+",engPct:60,sat:false,tuition:"Символическая плата (демо)",docs:["Транскрипт"],deadline:"15 июля (демо-дата)",site:"https://lmu.de"},
  {id:"tudelft",name:"TU Delft",country:"Нидерланды",city:"Делфт",majors:["Civil Engineering","Aerospace Engineering","Architecture"],gpaMin:3.4,english:"IELTS 6.5+",engPct:70,sat:false,tuition:"От €2,500/год для EU, выше для остальных (демо)",docs:["Транскрипт","Эссе"],deadline:"Май (демо-дата)",site:"https://tudelft.nl"},
  {id:"ethz",name:"ETH Zurich",country:"Швейцария",city:"Цюрих",majors:["Mathematics","Physics","Computer Science"],gpaMin:3.7,english:"IELTS 7.0+",engPct:80,sat:false,tuition:"Низкая плата (демо)",docs:["Транскрипт","Экзамен"],deadline:"Апрель (демо-дата)",site:"https://ethz.ch"},
  {id:"polimi",name:"Politecnico di Milano",country:"Италия",city:"Милан",majors:["Architecture","Industrial Design","Civil Engineering"],gpaMin:3.2,english:"IELTS 6.0+",engPct:60,sat:false,tuition:"От €4,000/год (демо)",docs:["Транскрипт","Тест TOLC"],deadline:"Июль (демо-дата)",site:"https://polimi.it"},
  {id:"uc3m",name:"Universidad Carlos III",country:"Испания",city:"Мадрид",majors:["Economics","Journalism","Law"],gpaMin:3.0,english:"IELTS 5.5+",engPct:55,sat:false,tuition:"От €4,500/год (демо)",docs:["Транскрипт"],deadline:"Июнь (демо-дата)",site:"https://uc3m.es"},
  {id:"kaist",name:"KAIST",country:"Южная Корея",city:"Тэджон",majors:["Computer Science","Robotics","Materials Science"],gpaMin:3.6,english:"IELTS 6.5+",engPct:70,sat:false,tuition:"Стипендии доступны (демо)",docs:["Транскрипт","Эссе"],deadline:"Сентябрь (демо-дата)",site:"https://kaist.ac.kr"},
  {id:"utokyo",name:"University of Tokyo",country:"Япония",city:"Токио",majors:["Physics","Engineering","Economics"],gpaMin:3.6,english:"IELTS 6.5+",engPct:70,sat:false,tuition:"Низкая плата для стипендиатов (демо)",docs:["Транскрипт","Экзамен EJU"],deadline:"Ноябрь (демо-дата)",site:"https://u-tokyo.ac.jp"},
  {id:"tsinghua",name:"Tsinghua University",country:"Китай",city:"Пекин",majors:["Computer Science","Civil Engineering","Economics"],gpaMin:3.6,english:"IELTS 6.5+",engPct:70,sat:false,tuition:"Стипендии CSC доступны (демо)",docs:["Транскрипт","HSK/английский тест"],deadline:"Февраль (демо-дата)",site:"https://tsinghua.edu.cn"},
  {id:"nus",name:"National University of Singapore",country:"Сингапур",city:"Сингапур",majors:["Computer Science","Economics","Medicine"],gpaMin:3.6,english:"IELTS 6.5+",engPct:70,sat:false,tuition:"Гранты доступны (демо)",docs:["Транскрипт","Эссе","Рекомендации"],deadline:"Февраль (демо-дата)",site:"https://nus.edu.sg"},
  {id:"unimelb",name:"University of Melbourne",country:"Австралия",city:"Мельбурн",majors:["Psychology","Business Administration","Biology"],gpaMin:3.4,english:"IELTS 6.5+",engPct:70,sat:false,tuition:"От AUD 40,000/год (демо)",docs:["Транскрипт","Эссе"],deadline:"Октябрь (демо-дата)",site:"https://unimelb.edu.au"},
  {id:"kaust",name:"KAUST",country:"ОАЭ/регион Персидского залива",city:"Тувал",majors:["Materials Science","Computer Science","Environmental Engineering"],gpaMin:3.5,english:"IELTS 6.0+",engPct:65,sat:false,tuition:"Полное покрытие для магистратуры (демо)",docs:["Транскрипт","Research proposal"],deadline:"Март (демо-дата)",site:"https://kaust.edu.sa"},
  {id:"bogazici",name:"Boğaziçi University",country:"Турция",city:"Стамбул",majors:["Computer Science","Economics","Mechanical Engineering"],gpaMin:3.2,english:"IELTS 6.0+",engPct:60,sat:false,tuition:"Низкая плата (демо)",docs:["Транскрипт","YOS/SAT"],deadline:"Июль (демо-дата)",site:"https://boun.edu.tr"},
];

const OPPS: Opportunity[] = [
  {id:"o1",title:"Full Scholarship — Global Merit Award",org:"Global Merit Foundation",cat:"Scholarships",country:"Международно",mode:"—",cost:"Бесплатно",major:"Любая",deadline:"2026-12-15",link:"#",desc:"Стипендия на полное покрытие обучения (демо-данные)."},
  {id:"o2",title:"Bolashak Scholarship",org:"МОН РК",cat:"Scholarships",country:"Казахстан",mode:"—",cost:"Бесплатно",major:"Любая",deadline:"2026-05-01",link:"#",desc:"Государственная стипендия на обучение за рубежом (демо-данные)."},
  {id:"o3",title:"DAAD Scholarship for Kazakhstan",org:"DAAD",cat:"Scholarships",country:"Германия",mode:"—",cost:"Бесплатно",major:"Любая",deadline:"2026-11-01",link:"#",desc:"Немецкая госстипендия для студентов из Казахстана (демо-данные)."},
  {id:"o4",title:"Chevening Scholarship",org:"UK Government",cat:"Scholarships",country:"Великобритания",mode:"—",cost:"Бесплатно",major:"Любая",deadline:"2026-11-05",link:"#",desc:"Британская государственная стипендия для магистратуры (демо-данные)."},
  {id:"o5",title:"Fulbright Program",org:"US Department of State",cat:"Scholarships",country:"США",mode:"—",cost:"Бесплатно",major:"Любая",deadline:"2026-05-15",link:"#",desc:"Программа академического обмена США (демо-данные)."},
  {id:"o6",title:"Erasmus Mundus Scholarship",org:"European Commission",cat:"Scholarships",country:"Международно (ЕС)",mode:"—",cost:"Бесплатно",major:"Любая",deadline:"2026-01-15",link:"#",desc:"Стипендия на совместные магистерские программы в Европе (демо-данные)."},
  {id:"o7",title:"MEXT Scholarship",org:"Правительство Японии",cat:"Scholarships",country:"Япония",mode:"—",cost:"Бесплатно",major:"Любая",deadline:"2026-06-01",link:"#",desc:"Японская государственная стипендия (демо-данные)."},
  {id:"o8",title:"CSC Scholarship",org:"China Scholarship Council",cat:"Scholarships",country:"Китай",mode:"—",cost:"Бесплатно",major:"Любая",deadline:"2026-04-01",link:"#",desc:"Китайская государственная стипендия (демо-данные)."},
  {id:"o9",title:"Turkiye Burslari Scholarship",org:"Правительство Турции",cat:"Scholarships",country:"Турция",mode:"—",cost:"Бесплатно",major:"Любая",deadline:"2026-02-20",link:"#",desc:"Турецкая государственная стипендия (демо-данные)."},
  {id:"o10",title:"Merit Scholarship for STEM Women",org:"STEM Girls Fund",cat:"Scholarships",country:"Международно",mode:"—",cost:"Бесплатно",major:"Computer Science",deadline:"2026-10-10",link:"#",desc:"Стипендия для девушек в STEM-специальностях (демо-данные)."},
  {id:"o11",title:"Partial Scholarship — Regional Talent",org:"Regional Talent Fund",cat:"Scholarships",country:"Казахстан",mode:"—",cost:"Частично",major:"Любая",deadline:"2026-09-01",link:"#",desc:"Частичная стипендия для региональных школьников (демо-данные)."},
  {id:"o12",title:"Need-Based Grant for Undergraduates",org:"OpenAccess Fund",cat:"Grants",country:"Международно",mode:"—",cost:"Бесплатно",major:"Любая",deadline:"2026-08-20",link:"#",desc:"Грант на основе финансовой нуждаемости (демо-данные)."},
  {id:"o13",title:"Chemistry Research Grant for Students",org:"SciYouth",cat:"Grants",country:"Международно",mode:"—",cost:"Бесплатно",major:"Medicine",deadline:"2026-12-05",link:"#",desc:"Грант на исследовательский проект по химии (демо-данные)."},
  {id:"o14",title:"Undergraduate Research Grant",org:"National Science Fund KZ",cat:"Grants",country:"Казахстан",mode:"—",cost:"Бесплатно",major:"Любая",deadline:"2026-09-25",link:"#",desc:"Грант на студенческое исследование (демо-данные)."},
  {id:"o15",title:"Green Innovation Grant",org:"EcoFund",cat:"Grants",country:"Международно",mode:"—",cost:"Бесплатно",major:"Environmental Engineering",deadline:"2026-11-18",link:"#",desc:"Грант на экологические инновационные проекты (демо-данные)."},
  {id:"o16",title:"Tech Internship Program",org:"TechStart",cat:"Internships",country:"Казахстан",mode:"Онлайн",cost:"Оплачивается",major:"Computer Science",deadline:"2026-10-25",link:"#",desc:"Стажировка для junior-разработчиков (демо-данные)."},
  {id:"o17",title:"Finance Summer Internship",org:"KZ Invest Bank",cat:"Internships",country:"Казахстан",mode:"Офлайн",cost:"Оплачивается",major:"Finance",deadline:"2026-11-01",link:"#",desc:"Летняя стажировка в инвестиционном банке (демо-данные)."},
  {id:"o18",title:"Marketing Internship",org:"BrandLab",cat:"Internships",country:"Казахстан",mode:"Онлайн",cost:"Оплачивается",major:"Marketing",deadline:"2026-10-15",link:"#",desc:"Стажировка в маркетинговом агентстве (демо-данные)."},
  {id:"o19",title:"Legal Internship Program",org:"LawFirm KZ",cat:"Internships",country:"Казахстан",mode:"Офлайн",cost:"Оплачивается",major:"Law",deadline:"2026-11-10",link:"#",desc:"Стажировка в юридической фирме (демо-данные)."},
  {id:"o20",title:"Data Analytics Internship",org:"DataWorks",cat:"Internships",country:"Международно",mode:"Онлайн",cost:"Оплачивается",major:"Data Science",deadline:"2026-12-01",link:"#",desc:"Удалённая стажировка по анализу данных (демо-данные)."},
  {id:"o21",title:"Architecture Studio Internship",org:"ArchStudio",cat:"Internships",country:"Казахстан",mode:"Офлайн",cost:"Оплачивается",major:"Architecture",deadline:"2026-10-20",link:"#",desc:"Стажировка в архитектурном бюро (демо-данные)."},
  {id:"o22",title:"Biotech Lab Internship",org:"BioLab KZ",cat:"Internships",country:"Казахстан",mode:"Офлайн",cost:"Оплачивается",major:"Biotechnology",deadline:"2026-11-05",link:"#",desc:"Стажировка в биотехнологической лаборатории (демо-данные)."},
  {id:"o23",title:"UX Design Internship",org:"DesignHub",cat:"Internships",country:"Международно",mode:"Онлайн",cost:"Оплачивается",major:"UI/UX Design",deadline:"2026-12-10",link:"#",desc:"Удалённая стажировка UX-дизайнера (демо-данные)."},
  {id:"o24",title:"Kazakhstan Youth Economic Case Cup",org:"EconClub",cat:"Competitions",country:"Казахстан",mode:"Офлайн",cost:"Бесплатно",major:"Economics",deadline:"2026-11-05",link:"#",desc:"Кейс-чемпионат по экономике и бизнесу (демо-данные)."},
  {id:"o25",title:"National Business Case Championship",org:"Junior Achievement KZ",cat:"Competitions",country:"Казахстан",mode:"Офлайн",cost:"Бесплатно",major:"Business Administration",deadline:"2026-10-30",link:"#",desc:"Национальный чемпионат по бизнес-кейсам (демо-данные)."},
  {id:"o26",title:"Young Architects Design Contest",org:"ArchYouth",cat:"Competitions",country:"Казахстан",mode:"Офлайн",cost:"Бесплатно",major:"Architecture",deadline:"2026-11-12",link:"#",desc:"Конкурс архитектурных проектов для школьников (демо-данные)."},
  {id:"o27",title:"International Debate Championship",org:"WSDC",cat:"Competitions",country:"Международно",mode:"Офлайн",cost:"Платно",major:"Любая",deadline:"2026-12-01",link:"#",desc:"Международный чемпионат по дебатам (демо-данные)."},
  {id:"o28",title:"Legal Moot Court Competition",org:"Moot Court KZ",cat:"Competitions",country:"Казахстан",mode:"Офлайн",cost:"Бесплатно",major:"Law",deadline:"2026-11-20",link:"#",desc:"Учебный судебный процесс для студентов права (демо-данные)."},
  {id:"o29",title:"Creative Writing Contest",org:"WordCraft",cat:"Competitions",country:"Международно",mode:"Онлайн",cost:"Бесплатно",major:"Journalism",deadline:"2026-10-28",link:"#",desc:"Международный конкурс творческого письма (демо-данные)."},
  {id:"o30",title:"Robotics Cup Kazakhstan",org:"RoboCup KZ",cat:"Competitions",country:"Казахстан",mode:"Офлайн",cost:"Бесплатно",major:"Robotics",deadline:"2026-11-15",link:"#",desc:"Соревнование по робототехнике (демо-данные)."},
  {id:"o31",title:"Math Modeling Challenge",org:"MathWorks",cat:"Competitions",country:"Международно",mode:"Онлайн",cost:"Бесплатно",major:"Applied Mathematics",deadline:"2026-12-08",link:"#",desc:"Международный конкурс по математическому моделированию (демо-данные)."},
  {id:"o32",title:"Daryn National Olympiad",org:"Daryn",cat:"Olympiads",country:"Казахстан",mode:"Офлайн",cost:"Бесплатно",major:"Любая",deadline:"2026-11-15",link:"#",desc:"Национальная олимпиада для одарённых школьников (Daryn) (демо-данные)."},
  {id:"o33",title:"Republican Mathematics Olympiad",org:"МОН РК",cat:"Olympiads",country:"Казахстан",mode:"Офлайн",cost:"Бесплатно",major:"Mathematics",deadline:"2026-10-25",link:"#",desc:"Республиканская олимпиада по математике (демо-данные)."},
  {id:"o34",title:"Republican Physics Olympiad",org:"МОН РК",cat:"Olympiads",country:"Казахстан",mode:"Офлайн",cost:"Бесплатно",major:"Physics",deadline:"2026-10-27",link:"#",desc:"Республиканская олимпиада по физике (демо-данные)."},
  {id:"o35",title:"Republican Chemistry Olympiad",org:"МОН РК",cat:"Olympiads",country:"Казахстан",mode:"Офлайн",cost:"Бесплатно",major:"Chemistry",deadline:"2026-10-29",link:"#",desc:"Республиканская олимпиада по химии (демо-данные)."},
  {id:"o36",title:"Republican Biology Olympiad",org:"МОН РК",cat:"Olympiads",country:"Казахстан",mode:"Офлайн",cost:"Бесплатно",major:"Biology",deadline:"2026-11-01",link:"#",desc:"Республиканская олимпиада по биологии (демо-данные)."},
  {id:"o37",title:"Republican English Language Olympiad",org:"МОН РК",cat:"Olympiads",country:"Казахстан",mode:"Офлайн",cost:"Бесплатно",major:"Linguistics",deadline:"2026-11-03",link:"#",desc:"Республиканская олимпиада по английскому языку (демо-данные)."},
  {id:"o38",title:"NIS IT Olympiad",org:"НИШ",cat:"Olympiads",country:"Казахстан",mode:"Офлайн",cost:"Бесплатно",major:"Computer Science",deadline:"2026-10-20",link:"#",desc:"Олимпиада по информатике среди школьников НИШ и других школ (демо-данные)."},
  {id:"o39",title:"International Astronomy Olympiad",org:"IAO",cat:"Olympiads",country:"Международно",mode:"Офлайн",cost:"Бесплатно",major:"Physics",deadline:"2026-11-15",link:"#",desc:"Профильная олимпиада по астрономии для школьников (демо-данные)."},
  {id:"o40",title:"International Linguistics Olympiad",org:"IOL",cat:"Olympiads",country:"Международно",mode:"Офлайн",cost:"Бесплатно",major:"Linguistics",deadline:"2026-11-22",link:"#",desc:"Международная олимпиада по лингвистике (демо-данные)."},
  {id:"o41",title:"Model United Nations Almaty",org:"MUN Almaty",cat:"Olympiads",country:"Казахстан",mode:"Офлайн",cost:"Платно",major:"International Relations",deadline:"2026-11-10",link:"#",desc:"Модель ООН для развития soft skills и лидерства (демо-данные)."},
  {id:"o42",title:"Community Solar Project",org:"GreenKZ",cat:"Projects",country:"Казахстан",mode:"Офлайн",cost:"Бесплатно",major:"Environmental Engineering",deadline:"2026-11-25",link:"#",desc:"Проект по установке солнечных панелей в школах (демо-данные)."},
  {id:"o43",title:"Open-Source Learning App",org:"DevCommunity",cat:"Projects",country:"Международно",mode:"Онлайн",cost:"Бесплатно",major:"Computer Science",deadline:"2026-12-05",link:"#",desc:"Совместная разработка образовательного приложения с открытым кодом (демо-данные)."},
  {id:"o44",title:"Youth Podcast Initiative",org:"MediaYouth",cat:"Projects",country:"Казахстан",mode:"Онлайн",cost:"Бесплатно",major:"Journalism",deadline:"2026-10-18",link:"#",desc:"Создание подкаста силами школьников (демо-данные)."},
  {id:"o45",title:"Mobile Health Data Project",org:"HealthTech KZ",cat:"Projects",country:"Казахстан",mode:"Онлайн",cost:"Бесплатно",major:"Public Health",deadline:"2026-11-30",link:"#",desc:"Сбор и анализ данных для мобильного здравоохранения (демо-данные)."},
  {id:"o46",title:"Urban Garden Initiative",org:"EcoKZ",cat:"Projects",country:"Казахстан",mode:"Офлайн",cost:"Бесплатно",major:"Agriculture",deadline:"2026-10-22",link:"#",desc:"Проект городского озеленения силами волонтёров (демо-данные)."},
  {id:"o47",title:"AI Chatbot for Students",org:"AI Club KZ",cat:"Projects",country:"Казахстан",mode:"Онлайн",cost:"Бесплатно",major:"Artificial Intelligence",deadline:"2026-12-01",link:"#",desc:"Разработка учебного AI-чатбота (демо-данные)."},
  {id:"o48",title:"Historical Archive Digitization",org:"HistoryLab",cat:"Projects",country:"Казахстан",mode:"Офлайн",cost:"Бесплатно",major:"History",deadline:"2026-11-08",link:"#",desc:"Оцифровка исторических архивов региона (демо-данные)."},
  {id:"o49",title:"Renewable Energy Research Project",org:"EnergyFuture",cat:"Projects",country:"Международно",mode:"Онлайн",cost:"Бесплатно",major:"Environmental Engineering",deadline:"2026-12-12",link:"#",desc:"Исследовательский проект по возобновляемой энергии (демо-данные)."},
  {id:"o50",title:"Youth Startup Incubator",org:"StartupHub KZ",cat:"Startups",country:"Казахстан",mode:"Офлайн",cost:"Бесплатно",major:"Business Administration",deadline:"2026-11-20",link:"#",desc:"Инкубатор для стартапов старшеклассников и студентов (демо-данные)."},
  {id:"o51",title:"EdTech Startup Challenge",org:"EdTech Ventures",cat:"Startups",country:"Международно",mode:"Онлайн",cost:"Бесплатно",major:"Computer Science",deadline:"2026-12-10",link:"#",desc:"Конкурс стартап-идей в сфере образования (демо-данные)."},
  {id:"o52",title:"Green Startup Accelerator",org:"GreenVentures",cat:"Startups",country:"Казахстан",mode:"Офлайн",cost:"Бесплатно",major:"Environmental Engineering",deadline:"2026-11-28",link:"#",desc:"Акселератор для эко-стартапов (демо-данные)."},
  {id:"o53",title:"FinTech Student Startup Cup",org:"FinTech KZ",cat:"Startups",country:"Казахстан",mode:"Офлайн",cost:"Бесплатно",major:"Finance",deadline:"2026-12-02",link:"#",desc:"Конкурс финтех-стартапов среди студентов (демо-данные)."},
  {id:"o54",title:"HealthTech Startup Weekend",org:"Startup Weekend",cat:"Startups",country:"Международно",mode:"Офлайн",cost:"Платно",major:"Public Health",deadline:"2026-11-14",link:"#",desc:"Уикенд по созданию стартапов в здравоохранении (демо-данные)."},
  {id:"o55",title:"Social Impact Startup Fund",org:"Impact Fund KZ",cat:"Startups",country:"Казахстан",mode:"Офлайн",cost:"Бесплатно",major:"Любая",deadline:"2026-12-18",link:"#",desc:"Грантовый конкурс для социальных стартапов (демо-данные)."},
  {id:"o56",title:"Global AI Hackathon",org:"DevChallenge",cat:"Hackathons",country:"Международно",mode:"Онлайн",cost:"Бесплатно",major:"Computer Science",deadline:"2026-12-01",link:"#",desc:"48-часовой хакатон по AI-проектам (демо-данные)."},
  {id:"o57",title:"Kazakhstan National Hackathon",org:"Digital KZ",cat:"Hackathons",country:"Казахстан",mode:"Офлайн",cost:"Бесплатно",major:"Computer Science",deadline:"2026-11-16",link:"#",desc:"Национальный хакатон по цифровым решениям (демо-данные)."},
  {id:"o58",title:"EdTech Hackathon",org:"HackEd",cat:"Hackathons",country:"Международно",mode:"Онлайн",cost:"Бесплатно",major:"Computer Science",deadline:"2026-12-06",link:"#",desc:"Хакатон образовательных технологий (демо-данные)."},
  {id:"o59",title:"Cybersecurity CTF Hackathon",org:"CyberKZ",cat:"Hackathons",country:"Казахстан",mode:"Онлайн",cost:"Бесплатно",major:"Cybersecurity",deadline:"2026-11-22",link:"#",desc:"Соревнование Capture The Flag по кибербезопасности (демо-данные)."},
  {id:"o60",title:"Girls Who Code Hackathon",org:"Girls Who Code",cat:"Hackathons",country:"Международно",mode:"Онлайн",cost:"Бесплатно",major:"Computer Science",deadline:"2026-12-09",link:"#",desc:"Хакатон для девушек, изучающих программирование (демо-данные)."},
  {id:"o61",title:"HealthTech Hackathon",org:"MedHack",cat:"Hackathons",country:"Казахстан",mode:"Офлайн",cost:"Бесплатно",major:"Public Health",deadline:"2026-11-27",link:"#",desc:"Хакатон медицинских технологий (демо-данные)."},
  {id:"o62",title:"Volunteer Eco Project",org:"EcoKZ",cat:"Volunteering",country:"Казахстан",mode:"Офлайн",cost:"Бесплатно",major:"Любая",deadline:"2026-10-15",link:"#",desc:"Волонтёрская экологическая инициатива (демо-данные)."},
  {id:"o63",title:"Hospital Volunteer Program",org:"Red Crescent KZ",cat:"Volunteering",country:"Казахстан",mode:"Офлайн",cost:"Бесплатно",major:"Medicine",deadline:"2026-11-05",link:"#",desc:"Волонтёрство в больницах (демо-данные)."},
  {id:"o64",title:"Teach-a-Child Volunteering",org:"EduVolunteer",cat:"Volunteering",country:"Казахстан",mode:"Офлайн",cost:"Бесплатно",major:"Education",deadline:"2026-11-12",link:"#",desc:"Волонтёрское репетиторство для младших школьников (демо-данные)."},
  {id:"o65",title:"Summer School: Data Science Bootcamp",org:"DS Camp",cat:"Summer Schools",country:"Казахстан",mode:"Офлайн",cost:"Есть грантовые места",major:"Data Science",deadline:"2026-11-20",link:"#",desc:"Интенсив по анализу данных для школьников (демо-данные)."},
  {id:"o66",title:"Summer School in Biomedical Sciences",org:"BioSummer",cat:"Summer Schools",country:"США",mode:"Офлайн",cost:"Платно (есть гранты)",major:"Medicine",deadline:"2026-12-01",link:"#",desc:"Летняя школа по биомедицине (демо-данные)."},
  {id:"o67",title:"Summer School in Design Thinking",org:"DesignSummer",cat:"Summer Schools",country:"Международно",mode:"Онлайн",cost:"Бесплатно",major:"UI/UX Design",deadline:"2026-11-18",link:"#",desc:"Летняя школа по дизайн-мышлению (демо-данные)."},
  {id:"o68",title:"Summer Research Program in Biology",org:"BioFuture",cat:"Research Programs",country:"США",mode:"Офлайн",cost:"Платно (есть гранты)",major:"Medicine",deadline:"2026-11-30",link:"#",desc:"Летняя исследовательская программа по биологии (демо-данные)."},
  {id:"o69",title:"Young Researchers Program",org:"ScienceKZ",cat:"Research Programs",country:"Казахстан",mode:"Офлайн",cost:"Бесплатно",major:"Physics",deadline:"2026-11-24",link:"#",desc:"Программа для начинающих исследователей (демо-данные)."},
  {id:"o70",title:"Economics Research Fellowship",org:"EconLab",cat:"Research Programs",country:"Международно",mode:"Онлайн",cost:"Бесплатно",major:"Economics",deadline:"2026-12-14",link:"#",desc:"Исследовательская стажировка по экономике (демо-данные)."},
  {id:"o71",title:"Youth Science Conference",org:"ScienceYouth KZ",cat:"Conferences",country:"Казахстан",mode:"Офлайн",cost:"Платно",major:"Любая",deadline:"2026-11-19",link:"#",desc:"Научная конференция для школьников и студентов (демо-данные)."},
  {id:"o72",title:"International Model UN Conference",org:"MUN International",cat:"Conferences",country:"Международно",mode:"Офлайн",cost:"Платно",major:"International Relations",deadline:"2026-12-03",link:"#",desc:"Международная конференция Model UN (демо-данные)."},
  {id:"o73",title:"Coursera Machine Learning Course",org:"Coursera/Stanford",cat:"Courses",country:"Онлайн",mode:"Онлайн",cost:"Бесплатно (аудит)",major:"Computer Science",deadline:"Без дедлайна",link:"#",desc:"Классический курс по машинному обучению (демо-данные)."},
  {id:"o74",title:"edX Intro to Psychology",org:"edX/Harvard",cat:"Courses",country:"Онлайн",mode:"Онлайн",cost:"Бесплатно (аудит)",major:"Psychology",deadline:"Без дедлайна",link:"#",desc:"Вводный курс по психологии (демо-данные)."},
  {id:"o75",title:"Khan Academy SAT Prep",org:"Khan Academy",cat:"Educational Programs",country:"Онлайн",mode:"Онлайн",cost:"Бесплатно",major:"Любая",deadline:"Без дедлайна",link:"#",desc:"Бесплатная подготовка к SAT (демо-данные)."},
];

const CATS = ["Scholarships","Grants","Internships","Olympiads","Competitions","Projects","Startups","Hackathons","Volunteering","Summer Schools","Research Programs","Conferences","Educational Programs","Courses"];

const CAT_META: Record<string, {team:string; teamSize?:string; skills:string[]; requires:string[]; rewards:string[]; stages:string[]}> = {
  Scholarships:{team:'Individual',skills:['Academic writing','Time management'],requires:['Аттестат/транскрипт','Motivation Letter','Рекомендательные письма'],rewards:['Покрытие/частичное покрытие обучения'],stages:['Регистрация','Проверка документов','Результат']},
  Grants:{team:'Individual',skills:['Research skills','Проектное мышление'],requires:['Проектное предложение','CV'],rewards:['Финансирование проекта'],stages:['Регистрация','Оценка заявки','Результат']},
  Internships:{team:'Individual',skills:['Профильные технические навыки','Коммуникация'],requires:['CV','Motivation Letter'],rewards:['Опыт работы','Networking','Возможен оффер'],stages:['Регистрация','Собеседование','Оффер']},
  Olympiads:{team:'Individual',skills:['Профильные предметные знания'],requires:['Регистрация от школы/самостоятельно'],rewards:['Сертификат','Диплом призёра','Бонус при поступлении'],stages:['Отборочный тур','Региональный этап','Финал']},
  Competitions:{team:'Team required',teamSize:'2–5',skills:['Командная работа','Профильные навыки','Презентация'],requires:['Регистрация команды','Иногда — эссе/заявка'],rewards:['Сертификат','Призы','Networking'],stages:['Регистрация','Квалификация','Финал','Презентация']},
  Projects:{team:'Team required',teamSize:'2–5',skills:['Профильные навыки','Проектное мышление'],requires:['Заявка','Иногда — CV'],rewards:['Сертификат','Портфолио-кейс','Менторство'],stages:['Заявка','Отбор','Реализация проекта']},
  Startups:{team:'Team required',teamSize:'2–4',skills:['Предпринимательское мышление','Презентация','Профильные навыки'],requires:['Питч-дек','Команда'],rewards:['Менторство','Инвестиции/грант','Networking'],stages:['Заявка','Отбор','Акселерация','Демо-день']},
  Hackathons:{team:'Team required',teamSize:'2–5',skills:['Программирование','Командная работа','Презентация'],requires:['Регистрация команды'],rewards:['Призы','Сертификат','Networking'],stages:['Регистрация','Хакатон','Питчинг','Итоги']},
  Volunteering:{team:'Individual',skills:['Коммуникация','Ответственность'],requires:['Заявка'],rewards:['Сертификат волонтёра','Опыт'],stages:['Регистрация','Участие']},
  'Summer Schools':{team:'Individual',skills:['Профильные базовые знания'],requires:['Заявка','Иногда — эссе'],rewards:['Сертификат','Networking','Профильные знания'],stages:['Заявка','Отбор','Программа']},
  'Research Programs':{team:'Individual',skills:['Research skills','Аналитическое мышление'],requires:['CV','Research interest statement'],rewards:['Сертификат','Публикация/отчёт','Менторство'],stages:['Заявка','Отбор','Исследование','Презентация результатов']},
  Conferences:{team:'Individual',skills:['Коммуникация','Публичные выступления'],requires:['Регистрация'],rewards:['Сертификат','Networking'],stages:['Регистрация','Участие']},
  'Educational Programs':{team:'Individual',skills:['Самостоятельное обучение'],requires:['Регистрация'],rewards:['Сертификат','Новые знания'],stages:['Регистрация','Обучение']},
  Courses:{team:'Individual',skills:['Самостоятельное обучение'],requires:['Регистрация'],rewards:['Сертификат об окончании'],stages:['Регистрация','Прохождение курса']},
};

const MAJOR_TRACKS: Record<string, string[]> = {
  'Computer Science':['Python и алгоритмы','Работа над pet-проектом на GitHub','Участие в hackathon','Изучение структур данных','Подготовка портфолио проектов'],
  'Artificial Intelligence':['Python и ML-библиотеки','Kaggle-проект','Изучение нейросетей','Участие в AI-хакатоне','ML-портфолио на GitHub'],
  'Software Engineering':['Python/Java основы','Совместный pet-проект','Git и code review','Участие в hackathon','Портфолио на GitHub'],
  'Medicine':['Углублённая биология','Углублённая химия','Волонтёрство в больнице/клинике','Research-проект по медицине','Подготовка к профильным экзаменам'],
  'Biotechnology':['Биология и химия','Лабораторная практика','Research-проект','Волонтёрство в лаборатории','Подготовка эссе с фокусом на исследования'],
  'Economics':['Математика и статистика','Изучение основ экономики','Участие в кейс-чемпионате','Финансовое моделирование','Стажировка/проект по экономике'],
  'Finance':['Математика и статистика','Основы финансов','Кейс-чемпионат по финансам','Стажировка в банке/финтех','Портфолио финансовых моделей'],
  'Business Administration':['Основы бизнеса','Бизнес-кейс-чемпионат','Мини-стартап проект','Стажировка в компании','Портфолио бизнес-проектов'],
  'UI/UX Design':['Основы UI/UX','Figma и прототипирование','Дизайн-проект в портфолио','Дизайн-конкурс','Стажировка у дизайнера'],
  'Graphic Design':['Основы графического дизайна','Работа в Figma/Illustrator','Портфолио работ','Дизайн-конкурс','Стажировка в студии'],
  'Architecture':['Основы черчения и композиции','Архитектурный софт (AutoCAD/SketchUp)','Проект здания в портфолио','Архитектурный конкурс','Стажировка в бюро'],
};

const PORTFOLIO_CATS = ['Academic','Projects','Olympiads','Competitions','Internships','Volunteering','Leadership','Research','Certificates','Awards'];

const NAV: {view:string; icon: typeof LayoutDashboard; label:string}[] = [
  {view:'dashboard',icon:LayoutDashboard,label:'Dashboard'},
  {view:'profile',icon:User,label:'My Profile'},
  {view:'portfolio',icon:FolderOpen,label:'My Portfolio'},
  {view:'universities',icon:GraduationCap,label:'Universities'},
  {view:'opportunities',icon:Target,label:'Opportunities'},
  {view:'scholarships',icon:Wallet,label:'Scholarships'},
  {view:'internships',icon:Briefcase,label:'Internships'},
  {view:'competitions',icon:Trophy,label:'Competitions'},
  {view:'olympiads',icon:Award,label:'Olympiads'},
  {view:'projects',icon:Puzzle,label:'Projects'},
  {view:'startups',icon:Rocket,label:'Startups'},
  {view:'calendar',icon:CalIcon,label:'Calendar'},
  {view:'skillgap',icon:Brain,label:'Skill Gap'},
  {view:'roadmap',icon:MapIcon,label:'12-Month Roadmap'},
  {view:'essay',icon:PenLine,label:'Essay Analyzer'},
  {view:'documents',icon:FileText,label:'Documents'},
  {view:'translator',icon:Languages,label:'Translator'},
  {view:'assistant',icon:Bot,label:'AI Assistant'},
  {view:'applications',icon:ClipboardList,label:'My Applications'},
  {view:'saved',icon:Heart,label:'Saved'},
  {view:'settings',icon:SettingsIcon,label:'Settings'},
];

/* ===================== HELPERS ===================== */
function defaultProfile(): Profile {
  return {
    name:'',surname:'',age:'',country:'Казахстан',city:'',school:'',grade:'',gpa:'',major:'Computer Science',
    countries:'',languages:'Русский, Казахский',english:'B1',olympiadsCount:0,projectsCount:0,competitionsCount:0,
    volunteeringCount:0,internshipsCount:0,certificatesCount:0,researchCount:0,leadershipCount:0,
    programmingCount:0,mathScore:50,achievements:'',github:'',resume:'',
  };
}
function defaultState(): AppState {
  return {
    user:null,
    profile:defaultProfile(),
    saved:{uni:[],opp:[]},
    portfolio:{Academic:[],Projects:[],Olympiads:[],Competitions:[],Internships:[],Volunteering:[],Leadership:[],Research:[],Certificates:[],Awards:[]},
    events:[],applications:[],chat:[],
  };
}
function loadState(): AppState {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return defaultState();
    const r = JSON.parse(raw) as Partial<AppState>;
    const d = defaultState();
    return {
      ...d,
      user: r.user ?? null,
      profile: { ...d.profile, ...r.profile },
      saved: { ...d.saved, ...r.saved },
      portfolio: { ...d.portfolio, ...r.portfolio },
      events: r.events ?? [],
      applications: r.applications ?? [],
      chat: r.chat ?? [],
    };
  } catch { return defaultState(); }
}

function engPct(lvl: string): number {
  return ({ A1: 20, A2: 35, B1: 50, B2: 65, C1: 80, C2: 95 } as Record<string, number>)[lvl] || 50;
}
function skillGap(p: Profile) {
  return [
    { k: 'GPA', v: Math.min(100, Math.round((parseFloat(p.gpa) || 0) / 4 * 100)) },
    { k: 'Английский', v: engPct(p.english) },
    { k: 'Программирование', v: Math.min(100, (p.programmingCount || 0) * 20) },
    { k: 'Математика', v: Math.min(100, p.mathScore || 0) },
    { k: 'Проекты', v: Math.min(100, (p.projectsCount || 0) * 25) },
    { k: 'Исследования', v: Math.min(100, (p.researchCount || 0) * 50) },
    { k: 'Олимпиады', v: Math.min(100, (p.olympiadsCount || 0) * 30) },
    { k: 'Лидерство', v: Math.min(100, (p.leadershipCount || 0) * 30) },
    { k: 'Волонтёрство', v: Math.min(100, (p.volunteeringCount || 0) * 25) },
  ];
}
function gapAdvice(sg: {k:string;v:number}[], major: string): string[] {
  const notes: string[] = [];
  sg.forEach(s => {
    if (s.v < 40) {
      if (s.k === 'Исследования') notes.push('Для выбранной специальности желательно усилить исследовательский опыт — попробуй профильный research-проект.');
      if (s.k === 'Проекты') notes.push('У тебя мало профильных проектов по направлению «' + major + '» — стоит запустить хотя бы один.');
      if (s.k === 'Олимпиады') notes.push('Тебе не хватает олимпиад/конкурсов в профильной области.');
      if (s.k === 'GPA') notes.push('Стоит подтянуть GPA — это важный критерий для большинства университетов.');
      if (s.k === 'Английский') notes.push('Для многих зарубежных университетов нужен более высокий уровень английского.');
      if (s.k === 'Программирование') notes.push('Стоит прокачать программирование — например, через личный проект или курс.');
      if (s.k === 'Математика') notes.push('Математическая база пока слабовата для «' + major + '» — уделяй ей больше времени.');
      if (s.k === 'Лидерство') notes.push('Добавь опыт лидерства — например, руководство школьным проектом или клубом.');
      if (s.k === 'Волонтёрство') notes.push('Волонтёрский опыт усилит портфолио — рассмотри локальные инициативы.');
    }
  });
  return notes.length ? notes : ['Твой профиль сбалансирован — продолжай развивать текущие направления.'];
}
function matchUni(uni: University, p: Profile) {
  const checks = [
    { label: 'GPA', pass: (parseFloat(p.gpa) || 0) >= uni.gpaMin, detail: `Твой GPA ${p.gpa || '—'}, нужно от ${uni.gpaMin}` },
    { label: 'Английский', pass: engPct(p.english) >= uni.engPct, detail: `Твой уровень ${p.english}, ориентир — ${uni.english}` },
    { label: 'Профильные проекты', pass: (p.projectsCount || 0) >= 1, detail: `У тебя ${p.projectsCount || 0} проектов` },
    { label: 'Олимпиады/конкурсы', pass: (p.olympiadsCount || 0) >= 1, detail: `У тебя ${p.olympiadsCount || 0}` },
    { label: 'Исследовательский опыт', pass: (p.researchCount || 0) >= 1, detail: `У тебя ${p.researchCount || 0}` },
  ];
  const passed = checks.filter(c => c.pass).length;
  return { pct: Math.round(passed / checks.length * 100), checks };
}
function daysLeft(dateStr: string): number {
  const d = new Date(dateStr + 'T00:00:00');
  const t = new Date(todayISO() + 'T00:00:00');
  return Math.round((d.getTime() - t.getTime()) / 86400000);
}
function DeadlineBadge({ dl }: { dl: string }) {
  if (!dl || dl === 'Без дедлайна') return null;
  const iso = dl.length === 10 && dl.includes('-') ? dl : null;
  if (!iso) return <span className="badge b-ok">{dl}</span>;
  const d = daysLeft(iso);
  if (d < 0) return <span className="badge b-late">Просрочено</span>;
  if (d === 0) return <span className="badge b-late">Дедлайн сегодня</span>;
  if (d === 1) return <span className="badge b-soon">Дедлайн завтра</span>;
  if (d <= 3) return <span className="badge b-soon">Осталось {d} дня</span>;
  if (d <= 10) return <span className="badge b-soon">Осталось {d} дней</span>;
  return <span className="badge b-ok">{iso}</span>;
}
function roadmap(p: Profile) {
  const sg = skillGap(p).sort((a, b) => a.v - b.v);
  const weak = sg.slice(0, 4).map(s => s.k);
  const track = MAJOR_TRACKS[p.major] || ['Профильные онлайн-курсы','Личный проект по специальности','Участие в профильной олимпиаде/конкурсе','Волонтёрство/практика по теме','Портфолио работ'];
  const months = [
    [`Начать усиливать: ${weak[0]}`, 'Составить список из 5–7 подходящих университетов', track[0]],
    [`Продолжить: ${weak[1]}`, 'Начать IELTS/TOEFL подготовку', track[1]],
    ['Найти 2–3 подходящие олимпиады/конкурса', 'Продолжить IELTS/TOEFL', 'Начать профильный проект'],
    [`Работать над: ${weak[2]}`, 'Завершить черновик профильного проекта', 'Изучить требования выбранных университетов'],
    ['Подготовить черновик CV', 'Собрать первые сертификаты/достижения', track[2]],
    [`Усилить: ${weak[3]}`, 'Участие в олимпиаде/конкурсе', 'Обновить портфолио проектов'],
    ['Сдать пробный IELTS/TOEFL', 'Начать черновик motivation letter', 'Найти научного руководителя/ментора (если нужно research)'],
    ['Доработать motivation letter', 'Собрать рекомендательные письма', 'Продолжить исследовательский/профильный проект'],
    [track[3], 'Финализировать IELTS/TOEFL', 'Проверить SAT/ACT требования (если нужны)'],
    ['Завершить все профильные проекты', 'Проверить все документы по чек-листу', 'Подготовить финальные версии эссе'],
    ['Проверить дедлайны каждого университета', 'Собрать полный пакет документов', 'Запросить финальные рекомендательные письма'],
    ['Подать документы в приоритетные университеты', 'Подать заявки на стипендии/гранты', 'Отслеживать статус заявок в Applications'],
  ];
  return months.map((tasks, i) => ({ m: `Месяц ${i + 1}`, tasks }));
}
function analyzeEssay(t: string) {
  const wc = t.trim().split(/\s+/).filter(Boolean).length;
  const pros: string[] = [], cons: string[] = [];
  if (wc > 250) pros.push('Хороший объём текста'); else cons.push('Текст короткий — добавь больше конкретных деталей');
  if (/потому что|так как|because/i.test(t)) pros.push('Есть аргументация и объяснение причин'); else cons.push('Не хватает объяснения «почему» — покажи причины своих решений');
  if (/университет|university|программ/i.test(t)) pros.push('Есть упоминание университета/программы'); else cons.push('Не хватает объяснения, почему выбран именно этот университет');
  if (/карьер|career|будущ/i.test(t)) pros.push('Есть связь с будущей карьерой'); else cons.push('Добавь, как это связано с твоими будущими планами');
  if (/например|for example|в частности/i.test(t)) pros.push('Есть конкретные примеры'); else cons.push('Слишком общие формулировки — добавь конкретные примеры и цифры');
  return { wc, pros, cons };
}
function checkDoc(t: string) {
  const res: { label: string; ok: boolean }[] = [];
  res.push({ label: 'Указано имя (ФИО)', ok: /[a-zа-яё]+\s+[a-zа-яё]+/i.test(t) });
  res.push({ label: 'Указан год/дата', ok: /\d{4}/.test(t) });
  res.push({ label: 'Есть информация об оценках/GPA', ok: /gpa|балл|оценк/i.test(t) });
  res.push({ label: 'Указан email', ok: /@/.test(t) });
  res.push({ label: 'Указано учебное заведение', ok: /школ|university|университет|college/i.test(t) });
  return res;
}
const CHAT_KB: [RegExp, string][] = [
  [/ielts|toefl|английск/i, 'IELTS/TOEFL показывают уровень английского. Для большинства зарубежных программ бакалавриата нужен IELTS 6.0–7.0. Совет: начни готовиться минимум за 3–4 месяца, раздел Writing обычно самый слабый у школьников.'],
  [/sat|act/i, 'SAT — стандартизированный тест для поступления в США. Многие университеты сейчас test-optional, уточняй это на странице университета в разделе «Universities».'],
  [/эссе|essay|мотивацион/i, 'Загрузи эссе в разделе «Essay Analyzer» — AI покажет, что уже хорошо получилось, а что стоит усилить, не переписывая текст за тебя.'],
  [/грант|scholarship|стипенд/i, 'Открой раздел «Opportunities» → фильтр Scholarships, или посмотри вкладку «Scholarships» — там подобраны демо-варианты по категориям.'],
  [/дедлайн|deadline/i, 'Добавь важные даты в «Calendar» — система покажет напоминания за 10, 5, 3, 1 день и в день дедлайна.'],
  [/документ/i, 'В разделе «Documents» можно вставить текст документа, и AI проверит, заполнены ли основные обязательные поля.'],
  [/перевод|translat/i, 'Раздел «Translator» — demo-режим показывает интерфейс перевода документов; для реального перевода нужно подключить AI API.'],
  [/skill ?gap|пробел/i, 'Skill Gap считается по твоему профилю: GPA, английский, проекты, олимпиады, исследования, лидерство, волонтёрство. Заполни профиль полнее — оценка станет точнее.'],
];
function chatReply(msg: string): string {
  for (const [re, ans] of CHAT_KB) if (re.test(msg)) return ans;
  return 'Хороший вопрос! Это demo-версия AI-ассистента с базовыми правилами. Для полноценных ответов на любые вопросы о поступлении подключи реальный AI API (см. инструкцию внизу страницы настроек).';
}

/* ===================== MAIN APP ===================== */
function App() {
  const [state, setState] = useState<AppState>(loadState);
  const [view, setView] = useState<string>(() => location.hash.replace('#/', '') || 'landing');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'register' | 'login'>('register');

  useEffect(() => {
    const onHash = () => setView(location.hash.replace('#/', '') || 'landing');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const save = useCallback((next: AppState) => {
    setState(next);
    try { localStorage.setItem(LS_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  }, []);

  const nav = useCallback((v: string) => {
    location.hash = '#/' + v;
    setSidebarOpen(false);
  }, []);

  const logout = useCallback(() => {
    const next = { ...state, user: null };
    save(next);
    location.hash = '#/';
    setView('landing');
  }, [state, save]);

  const tryDemo = useCallback(() => {
    const next = { ...state, user: { name: 'Гость', email: 'demo@scholarship.ai' }, profile: { ...state.profile, name: 'Гость' } };
    save(next);
    location.hash = '#/dashboard';
  }, [state, save]);

  const doAuth = useCallback((name: string, email: string) => {
    const next = { ...state, user: { name, email }, profile: { ...state.profile, name } };
    save(next);
    setAuthOpen(false);
    location.hash = '#/profile';
  }, [state, save]);

  const toggleSave = useCallback((type: 'uni' | 'opp', id: string) => {
    const arr = [...state.saved[type]];
    const i = arr.indexOf(id);
    if (i >= 0) arr.splice(i, 1); else arr.push(id);
    save({ ...state, saved: { ...state.saved, [type]: arr } });
  }, [state, save]);

  const upcomingEvents = useCallback(() => {
    return [...state.events].filter(e => e.status !== 'Завершено').sort((a, b) => a.date.localeCompare(b.date));
  }, [state.events]);

  if (!state.user) {
    return <Landing onAuth={setAuthMode} onShowAuth={() => setAuthOpen(true)} onTryDemo={tryDemo}
      authOpen={authOpen} authMode={authMode} onDoAuth={doAuth} onHideAuth={() => setAuthOpen(false)} />;
  }

  const renderView = () => {
    switch (view) {
      case 'dashboard': return <Dashboard state={state} nav={nav} upcomingEvents={upcomingEvents} />;
      case 'profile': return <Profile state={state} save={save} nav={nav} />;
      case 'portfolio': return <Portfolio state={state} save={save} />;
      case 'universities': return <Universities state={state} toggleSave={toggleSave} save={save} nav={nav} />;
      case 'opportunities': return <Opportunities state={state} toggleSave={toggleSave} save={save} forceCat="" />;
      case 'scholarships': return <Opportunities state={state} toggleSave={toggleSave} save={save} forceCat="Scholarships" />;
      case 'internships': return <Opportunities state={state} toggleSave={toggleSave} save={save} forceCat="Internships" />;
      case 'competitions': return <Opportunities state={state} toggleSave={toggleSave} save={save} forceCat="Competitions" />;
      case 'olympiads': return <Opportunities state={state} toggleSave={toggleSave} save={save} forceCat="Olympiads" />;
      case 'projects': return <Opportunities state={state} toggleSave={toggleSave} save={save} forceCat="Projects" />;
      case 'startups': return <Opportunities state={state} toggleSave={toggleSave} save={save} forceCat="Startups" />;
      case 'calendar': return <CalendarView state={state} save={save} />;
      case 'skillgap': return <SkillGap state={state} />;
      case 'roadmap': return <Roadmap state={state} save={save} />;
      case 'essay': return <EssayAnalyzer state={state} />;
      case 'documents': return <Documents state={state} />;
      case 'translator': return <Translator />;
      case 'assistant': return <Assistant state={state} save={save} />;
      case 'applications': return <Applications state={state} save={save} />;
      case 'saved': return <Saved state={state} toggleSave={toggleSave} />;
      case 'settings': return <Settings state={state} />;
      default: return <Dashboard state={state} nav={nav} upcomingEvents={upcomingEvents} />;
    }
  };

  return (
    <div id="app">
      <div className={`sidebar ${sidebarOpen ? '' : 'hide'}`} id="sb">
        <div className="brand">🚀 FutureMinds</div>
        {NAV.map(({ view: v, icon: Icon, label }) => (
          <div key={v} className={`navlink ${view === v ? 'active' : ''}`} onClick={() => nav(v)}>
            <Icon size={16} style={{ verticalAlign: 'middle', marginRight: 8 }} />
            {label}
          </div>
        ))}
        <div style={{ marginTop: 16, padding: '0 12px' }}>
          <button className="btn ghost sm" style={{ width: '100%' }} onClick={logout}>
            <LogOut size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />Выйти
          </button>
        </div>
      </div>
      <div className="main">
        <div className="topbar">
          <button className="mobile-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
          <div className="row" style={{ marginLeft: 'auto' }}>
            <span className="pill">
              <Bell size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
              {upcomingEvents().filter(e => daysLeft(e.date) <= 10).length} напоминаний
            </span>
          </div>
        </div>
        {renderView()}
      </div>
    </div>
  );
}

/* ===================== LANDING ===================== */
function Landing({ onAuth, onShowAuth, onTryDemo, authOpen, authMode, onDoAuth, onHideAuth }:
  { onAuth: (m: 'register' | 'login') => void; onShowAuth: () => void; onTryDemo: () => void;
    authOpen: boolean; authMode: 'register' | 'login'; onDoAuth: (name: string, email: string) => void; onHideAuth: () => void; }) {
  const features: [string, string, string][] = [
    ['🎓','Universities','База университетов Казахстана и мира с демо-критериями поступления'],
    ['💰','Scholarships & Grants','Стипендии и гранты по категориям, с фильтрами'],
    ['🚀','Startups & Hackathons','Стартап-акселераторы и хакатоны для школьников и студентов'],
    ['🗂','My Portfolio','Academic, Projects, Research, Awards и другие разделы портфолио'],
    ['📅','Personal Calendar','Дедлайны, экзамены и напоминания в одном месте'],
    ['🧠','Skill Gap','AI показывает сильные и слабые стороны портфолио'],
    ['🗺','12-Month Roadmap','Персональный план поступления с ветвлением по специальности'],
    ['✍','Essay Analyzer','Проверка мотивационного эссе без переписывания за тебя'],
    ['📄','Document Checker','Проверка заполнения документов перед подачей'],
    ['🌍','AI Translator','Перевод документов на нужный язык'],
    ['🤖','AI Assistant','Отвечает на вопросы о поступлении с учётом твоего профиля'],
  ];
  return (
    <div className="main" style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div className="hero">
        <div style={{ fontSize: 15, color: 'var(--primary)', fontWeight: 700 }} className="glow-text">🚀 FUTUREMINDS</div>
        <h1 style={{ fontSize: 'clamp(28px,5vw,46px)', margin: '10px 0' }} className="glow-text">Твой AI-помощник для поступления и развития портфолио</h1>
        <p className="muted" style={{ fontSize: 16, maxWidth: 560, margin: '0 auto 22px' }}>Университеты, гранты, олимпиады, проекты и стажировки — в одном месте. AI покажет Skill Gap и составит план на 12 месяцев.</p>
        <div className="row" style={{ justifyContent: 'center' }}>
          <button className="btn" onClick={() => { onAuth('register'); onShowAuth(); }}>Создать профиль</button>
          <button className="btn ghost" onClick={onTryDemo}>Попробовать AI</button>
        </div>
        <div className="row" style={{ justifyContent: 'center', marginTop: 22 }}>
          <span className="pill">{UNIS.length} университетов (демо-база)</span>
          <span className="pill">{OPPS.length} возможностей (демо-база)</span>
          <span className="pill">{MAJORS.length} специальностей</span>
        </div>
      </div>
      <h2 style={{ textAlign: 'center', fontSize: 22 }}>Что умеет FutureMinds</h2>
      <div className="grid g3" style={{ margin: '20px 0 50px' }}>
        {features.map(([ic, t, d], i) => (
          <div key={i} className="card feat">
            <div style={{ fontSize: 26 }}>{ic}</div>
            <h3 style={{ margin: '8px 0 4px', fontSize: 16 }}>{t}</h3>
            <p className="muted" style={{ fontSize: '13.5px' }}>{d}</p>
          </div>
        ))}
      </div>
      {authOpen && <AuthModal mode={authMode} onDoAuth={onDoAuth} onHide={onHideAuth} />}
    </div>
  );
}

function AuthModal({ mode, onDoAuth, onHide }: { mode: 'register' | 'login'; onDoAuth: (name: string, email: string) => void; onHide: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const submit = (e: FormEvent) => {
    e.preventDefault();
    onDoAuth(name || 'Ученик', email || 'user@example.com');
  };
  return (
    <div className="overlay" onClick={e => { if (e.target === e.currentTarget) onHide(); }}>
      <div className="modal" style={{ maxWidth: 380 }}>
        <h2 style={{ marginTop: 0 }}>Вход в FutureMinds</h2>
        <p className="muted" style={{ fontSize: 13 }}>Демо-аутентификация — данные хранятся только в твоём браузере.</p>
        <form onSubmit={submit}>
          <label>Имя</label>
          <input value={name} onChange={e => setName(e.target.value)} required />
          <label>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          <label>Пароль</label>
          <input type="password" value={pw} onChange={e => setPw(e.target.value)} required />
          <div className="row" style={{ marginTop: 16 }}>
            <button className="btn" type="submit">Продолжить</button>
            <button className="btn ghost" type="button" onClick={onHide}>Отмена</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ===================== DASHBOARD ===================== */
function Dashboard({ state, nav, upcomingEvents }: { state: AppState; nav: (v: string) => void; upcomingEvents: () => AppEvent[] }) {
  const p = state.profile;
  const sg = skillGap(p);
  const avgSkill = Math.round(sg.reduce((a, b) => a + b.v, 0) / sg.length);
  const upc = upcomingEvents().slice(0, 4);
  return (
    <>
      <h2>Привет, {p.name || 'друг'}! 👋</h2>
      <div className="grid g3" style={{ margin: '16px 0' }}>
        <div className="card"><div className="muted">GPA</div><h2 style={{ margin: '4px 0' }}>{p.gpa || '—'}</h2></div>
        <div className="card"><div className="muted">Portfolio Score</div><h2 style={{ margin: '4px 0' }}>{avgSkill}%</h2></div>
        <div className="card"><div className="muted">Сохранённые вузы</div><h2 style={{ margin: '4px 0' }}>{state.saved.uni.length}</h2></div>
        <div className="card"><div className="muted">Сохранённые возможности</div><h2 style={{ margin: '4px 0' }}>{state.saved.opp.length}</h2></div>
        <div className="card"><div className="muted">Ближайшие дедлайны</div><h2 style={{ margin: '4px 0' }}>{upc.length}</h2></div>
        <div className="card"><div className="muted">Заявки</div><h2 style={{ margin: '4px 0' }}>{state.applications.length}</h2></div>
      </div>
      <div className="grid g2">
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Ближайшие дедлайны</h3>
          {upc.length ? upc.map(e => (
            <div key={e.id} className="row" style={{ justifyContent: 'space-between', borderBottom: '1px solid var(--border)', padding: '6px 0' }}>
              <span>{e.title}</span>
              <DeadlineBadge dl={e.date} />
            </div>
          )) : <p className="muted">Пока нет событий — добавь их в Calendar.</p>}
          <button className="btn ghost sm" style={{ marginTop: 10 }} onClick={() => nav('calendar')}>Открыть календарь</button>
        </div>
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Мой Skill Gap</h3>
          {sg.map(s => (
            <div key={s.k} style={{ fontSize: 13 }}>{s.k} — {s.v}%
              <div className="bar-bg"><div className="bar-fill" style={{ width: `${s.v}%` }} /></div>
            </div>
          ))}
          <button className="btn ghost sm" style={{ marginTop: 6 }} onClick={() => nav('skillgap')}>Подробнее</button>
        </div>
      </div>
    </>
  );
}

/* ===================== PROFILE ===================== */
function Profile({ state, save, nav }: { state: AppState; save: (s: AppState) => void; nav: (v: string) => void }) {
  const p = state.profile;
  const [form, setForm] = useState<Profile>(p);
  const set = (k: keyof Profile, v: string) => setForm({ ...form, [k]: v });
  const numFields: (keyof Profile)[] = ['olympiadsCount','projectsCount','competitionsCount','volunteeringCount','internshipsCount','certificatesCount','researchCount','leadershipCount','programmingCount','mathScore'];
  const submit = (e: FormEvent) => {
    e.preventDefault();
    save({ ...state, profile: form });
    nav('dashboard');
  };
  const f = (key: keyof Profile, label: string, type = 'text') => (
    <div>
      <label>{label}</label>
      <input type={type} value={(form[key] ?? '').toString()} onChange={e => set(key, e.target.value)} />
    </div>
  );
  const nf = (key: keyof Profile, label: string) => (
    <div>
      <label>{label}</label>
      <input type="number" value={form[key] as number} onChange={e => set(key, e.target.value)} />
    </div>
  );
  return (
    <>
      <h2>Мой профиль</h2>
      <form className="card" onSubmit={submit}>
        <div className="grid g3">
          {f('name', 'Имя')}{f('surname', 'Фамилия')}{f('age', 'Возраст', 'number')}
          {f('country', 'Страна')}{f('city', 'Город')}{f('school', 'Школа/университет')}
          {f('grade', 'Класс/курс')}{f('gpa', 'GPA (0–4.0)')}
          <div>
            <label>Специальность (поиск)</label>
            <input list="majorsList" value={form.major} onChange={e => set('major', e.target.value)} />
            <datalist id="majorsList">{MAJORS.map(m => <option key={m} value={m} />)}</datalist>
          </div>
          {f('countries', 'Интересующие страны')}
          {f('languages', 'Языки')}
          <div>
            <label>Уровень английского</label>
            <select value={form.english} onChange={e => set('english', e.target.value)}>
              {['A1','A2','B1','B2','C1','C2'].map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          {f('github', 'GitHub/портфолио (ссылка)')}
        </div>
        <h3>Быстрые счётчики достижений</h3>
        <p className="muted" style={{ fontSize: '12.5px' }}>Используются для расчёта Skill Gap и match с университетами.</p>
        <div className="grid g3">
          {nf('olympiadsCount', 'Олимпиады (кол-во)')}{nf('projectsCount', 'Проекты (кол-во)')}
          {nf('competitionsCount', 'Конкурсы (кол-во)')}{nf('volunteeringCount', 'Волонтёрство (кол-во)')}
          {nf('internshipsCount', 'Стажировки (кол-во)')}{nf('certificatesCount', 'Сертификаты (кол-во)')}
          {nf('researchCount', 'Исследовательские проекты')}{nf('leadershipCount', 'Лидерский опыт (кол-во)')}
          {nf('programmingCount', 'Программирование — проектов/курсов')}{nf('mathScore', 'Математика — самооценка 0-100')}
        </div>
        <label>Достижения и активности (через запятую)</label>
        <textarea rows={3} value={form.achievements} onChange={e => set('achievements', e.target.value)} />
        <button className="btn" type="submit" style={{ marginTop: 14 }}>Сохранить профиль</button>
      </form>
    </>
  );
}

/* ===================== UNIVERSITIES ===================== */
function Universities({ state, toggleSave, save, nav }: { state: AppState; toggleSave: (t: 'uni' | 'opp', id: string) => void; save: (s: AppState) => void; nav: (v: string) => void }) {
  const [q, setQ] = useState('');
  const [country, setCountry] = useState('');
  const [major, setMajor] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);

  const list = UNIS.filter(u =>
    (!q || u.name.toLowerCase().includes(q.toLowerCase())) &&
    (!country || u.country === country) &&
    (!major || u.majors.includes(major))
  );

  const addApplication = (uniId: string) => {
    const u = UNIS.find(x => x.id === uniId);
    if (!u) return;
    save({ ...state, applications: [...state.applications, { id: uid(), university: u.name, program: u.majors[0], status: 'Research', deadline: '', notes: '' }] });
    nav('applications');
  };

  return (
    <>
      <h2>Universities</h2>
      <p className="notice">Демо-база данных университетов. Требования и дедлайны — примерные, для реального использования подключите официальные источники.</p>
      <div className="card row" style={{ marginBottom: 14 }}>
        <input placeholder="Найти университет..." style={{ maxWidth: 220 }} value={q} onChange={e => setQ(e.target.value)} />
        <select value={country} onChange={e => setCountry(e.target.value)}>
          <option value="">Все страны</option>
          {[...new Set(UNIS.map(u => u.country))].map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={major} onChange={e => setMajor(e.target.value)}>
          <option value="">Все специальности</option>
          {[...new Set(UNIS.flatMap(u => u.majors))].sort().map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>
      <div className="grid g3">
        {list.length ? list.map(u => {
          const m = matchUni(u, state.profile);
          const sav = state.saved.uni.includes(u.id);
          return (
            <div key={u.id} className="card">
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <b>{u.name}</b>
                <span style={{ cursor: 'pointer' }} onClick={() => toggleSave('uni', u.id)}>{sav ? '❤️' : '♡'}</span>
              </div>
              <div className="muted">{u.city}, {u.country}</div>
              <div className="pill" style={{ margin: '8px 0' }}>Match: {m.pct}%</div>
              <button className="btn ghost sm" onClick={() => setOpenId(u.id)}>Подробнее</button>
            </div>
          );
        }) : <p className="muted">Ничего не найдено.</p>}
      </div>
      {openId && <UniModal id={openId} state={state} onClose={() => setOpenId(null)} onAddApp={addApplication} />}
    </>
  );
}

function UniModal({ id, state, onClose, onAddApp }: { id: string; state: AppState; onClose: () => void; onAddApp: (id: string) => void }) {
  const u = UNIS.find(x => x.id === id);
  if (!u) return null;
  const m = matchUni(u, state.profile);
  const sg = skillGap(state.profile);
  return (
    <div className="overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <h2 style={{ marginTop: 0 }}>{u.name}</h2>
        <div className="muted">{u.city}, {u.country}</div>
        <p><b>Специальности:</b> {u.majors.join(', ')}</p>
        <p><b>Мин. GPA:</b> {u.gpaMin} · <b>Язык:</b> {u.english} · <b>Стоимость:</b> {u.tuition}</p>
        <p><b>Документы:</b> {u.docs.join(', ')}</p>
        <p><b>Дедлайн:</b> {u.deadline} <span className="muted">(демо)</span> · <a href={u.site} target="_blank" rel="noreferrer">Официальный сайт</a></p>
        <h3>Твой Match — {m.pct}%</h3>
        {m.checks.map((c, i) => (
          <div key={i} className="check">{c.pass ? '✓' : '✗'} <span>{c.label}: <span className="muted">{c.detail}</span></span></div>
        ))}
        <p className="muted" style={{ fontSize: '12.5px' }}>Обозначения условны: «частично соответствует» / «требуется доп. подготовка» — это не гарантия поступления.</p>
        <h3>Skill Gap для этого направления</h3>
        {sg.map(s => (
          <div key={s.k} style={{ fontSize: 13 }}>{s.k} — {s.v}%
            <div className="bar-bg"><div className="bar-fill" style={{ width: `${s.v}%` }} /></div>
          </div>
        ))}
        <div className="row" style={{ marginTop: 14 }}>
          <button className="btn sm" onClick={() => onAddApp(u.id)}>Добавить в заявки</button>
          <button className="btn ghost sm" onClick={onClose}>Закрыть</button>
        </div>
      </div>
    </div>
  );
}

/* ===================== OPPORTUNITIES ===================== */
function Opportunities({ state, toggleSave, save, forceCat }: { state: AppState; toggleSave: (t: 'uni' | 'opp', id: string) => void; save: (s: AppState) => void; forceCat: string }) {
  const [cat, setCat] = useState(forceCat);
  const [country, setCountry] = useState('');
  const [mode, setMode] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => { if (forceCat) setCat(forceCat); }, [forceCat]);

  const list = OPPS.filter(o =>
    (!cat || o.cat === cat) &&
    (!country || o.country === country) &&
    (!mode || o.mode === mode)
  );

  const addOppToCalendar = (id: string) => {
    const o = OPPS.find(x => x.id === id);
    if (!o) return;
    save({ ...state, events: [...state.events, { id: uid(), title: o.title, date: o.deadline.length === 10 && o.deadline.includes('-') ? o.deadline : todayISO(), time: '', desc: o.desc, category: o.cat, link: o.link, priority: 'Средний', status: 'Запланировано' }] });
    alert('Добавлено в календарь!');
  };

  return (
    <>
      <h2>{forceCat || 'Opportunities'}</h2>
      <p className="notice">Демо-возможности для примера интерфейса (помечено как Demo Data). Для реальных дедлайнов и требований всегда проверяй официальный сайт организатора.</p>
      <div className="card row" style={{ marginBottom: 14 }}>
        <select value={cat} onChange={e => setCat(e.target.value)}>
          <option value="">Все категории</option>
          {CATS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={country} onChange={e => setCountry(e.target.value)}>
          <option value="">Все страны</option>
          {[...new Set(OPPS.map(o => o.country))].map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={mode} onChange={e => setMode(e.target.value)}>
          <option value="">Онлайн/Офлайн</option>
          <option value="Онлайн">Онлайн</option>
          <option value="Офлайн">Офлайн</option>
        </select>
      </div>
      <div className="grid g3">
        {list.length ? list.map(o => {
          const sav = state.saved.opp.includes(o.id);
          return (
            <div key={o.id} className="card">
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <span className="pill">{o.cat}</span>
                <span style={{ cursor: 'pointer' }} onClick={() => toggleSave('opp', o.id)}>{sav ? '❤️' : '♡'}</span>
              </div>
              <h3 style={{ margin: '8px 0 2px' }}>{o.title}</h3>
              <div className="muted" style={{ fontSize: 13 }}>{o.org} · {o.country} · {o.mode} · {o.cost}</div>
              <p style={{ fontSize: '13.5px' }}>{o.desc}</p>
              <div style={{ margin: '6px 0' }}><DeadlineBadge dl={o.deadline} /></div>
              <button className="btn ghost sm" onClick={() => setOpenId(o.id)}>Подробнее</button>
            </div>
          );
        }) : <p className="muted">Ничего не найдено.</p>}
      </div>
      {openId && <OppModal id={openId} state={state} toggleSave={toggleSave} onClose={() => setOpenId(null)} onAddCal={addOppToCalendar} />}
    </>
  );
}

function OppModal({ id, state, toggleSave, onClose, onAddCal }: { id: string; state: AppState; toggleSave: (t: 'uni' | 'opp', id: string) => void; onClose: () => void; onAddCal: (id: string) => void }) {
  const o = OPPS.find(x => x.id === id);
  if (!o) return null;
  const meta = CAT_META[o.cat] || { team: 'Individual', skills: [], requires: [], rewards: [], stages: [] };
  const sav = state.saved.opp.includes(o.id);
  return (
    <div className="overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <span className="pill">{o.cat}</span>
          <span style={{ cursor: 'pointer', fontSize: 20 }} onClick={() => toggleSave('opp', o.id)}>{sav ? '❤️' : '♡'}</span>
        </div>
        <h2>{o.title}</h2>
        <p className="muted">{o.org} · {o.country} · {o.mode} · {o.cost}</p>
        <p>{o.desc}</p>
        <div style={{ margin: '8px 0' }}><DeadlineBadge dl={o.deadline} /></div>
        <h3>Участие</h3>
        <p style={{ fontSize: 14 }}>Специальность: <b>{o.major}</b> · Формат: <b>{o.mode}</b> · Стоимость участия: <b>{o.cost}</b></p>
        <h3>Команда</h3>
        <p style={{ fontSize: 14 }}>{meta.team}{meta.teamSize ? ` · Team size: ${meta.teamSize}` : ''}</p>
        <h3>Навыки</h3>
        <div className="row">{meta.skills.map(s => <span key={s} className="pill">{s}</span>)}</div>
        <h3>Что необходимо</h3>
        {meta.requires.map(r => <div key={r} className="check">• {r}</div>)}
        <h3>Что получит участник</h3>
        {meta.rewards.map(r => <div key={r} className="check">✓ {r}</div>)}
        <h3>Как проходит</h3>
        <p style={{ fontSize: 14 }}>{meta.stages.join(' → ')}</p>
        <div className="row" style={{ marginTop: 14 }}>
          <button className="btn sm" onClick={() => onAddCal(o.id)}>+ Add to Calendar</button>
          <button className="btn ghost sm" onClick={() => alert('Demo: в реальной версии откроется форма заявки или переход на сайт организатора.')}>Apply</button>
          <a className="btn ghost sm" href={o.link} target="_blank" rel="noreferrer" style={{ display: 'inline-block' }}>Official Website</a>
          <button className="btn ghost sm" onClick={onClose}>Закрыть</button>
        </div>
      </div>
    </div>
  );
}

/* ===================== CALENDAR ===================== */
function CalendarView({ state, save }: { state: AppState; save: (s: AppState) => void }) {
  const [calMonth, setCalMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [calSelDate, setCalSelDate] = useState<string | null>(todayISO());

  const y = calMonth.getFullYear(), m = calMonth.getMonth();
  const startDow = (new Date(y, m, 1).getDay() + 6) % 7;
  const days = new Date(y, m + 1, 0).getDate();
  const cells: (string | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(`${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`);

  const dayEvents = state.events.filter(e => e.date === calSelDate);
  const upcoming = [...state.events].filter(e => e.status !== 'Завершено').sort((a, b) => a.date.localeCompare(b.date));

  const addEvent = (e: FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);
    if (!calSelDate) return;
    save({ ...state, events: [...state.events, {
      id: uid(), title: fd.get('title') as string, date: calSelDate, time: fd.get('time') as string,
      category: fd.get('cat') as string, priority: fd.get('pri') as string, desc: fd.get('desc') as string, status: 'Запланировано',
    }] });
    form.reset();
  };
  const delEvent = (id: string) => save({ ...state, events: state.events.filter(e => e.id !== id) });
  const updateStatus = (id: string, val: string) => save({ ...state, events: state.events.map(e => e.id === id ? { ...e, status: val } : e) });

  return (
    <>
      <h2>Calendar</h2>
      <div className="grid g2">
        <div className="card">
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <button className="btn ghost sm" onClick={() => setCalMonth(new Date(y, m - 1, 1))}>←</button>
            <b>{calMonth.toLocaleString('ru', { month: 'long', year: 'numeric' })}</b>
            <button className="btn ghost sm" onClick={() => setCalMonth(new Date(y, m + 1, 1))}>→</button>
          </div>
          <div className="cal-grid" style={{ marginTop: 10 }}>
            {['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map(d => <div key={d} className="muted" style={{ textAlign: 'center', fontSize: 11 }}>{d}</div>)}
            {cells.map((iso, i) => iso ? (
              <div key={i} className={`cal-cell ${iso === todayISO() ? 'today' : ''} ${iso === calSelDate ? 'sel' : ''}`} onClick={() => setCalSelDate(iso)}>
                {parseInt(iso.slice(-2))}
                {state.events.some(e => e.date === iso) && <div className="dot" />}
              </div>
            ) : <div key={i} />)}
          </div>
        </div>
        <div className="card">
          <h3 style={{ marginTop: 0 }}>{calSelDate || 'Выбери день'}</h3>
          {calSelDate ? (
            <>
              {dayEvents.map(e => (
                <div key={e.id} style={{ borderBottom: '1px solid var(--border)', padding: '6px 0' }}>
                  <b>{e.title}</b> <span className="pill">{e.category}</span><br />
                  <span className="muted" style={{ fontSize: '12.5px' }}>{e.desc || ''}</span><br />
                  <select value={e.status} onChange={ev => updateStatus(e.id, ev.target.value)} style={{ marginTop: 4, width: 'auto', display: 'inline-block' }}>
                    {['Запланировано','В процессе','Завершено','Просрочено'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button className="btn ghost sm" onClick={() => delEvent(e.id)}>Удалить</button>
                </div>
              ))}
              <form onSubmit={addEvent} style={{ marginTop: 10 }}>
                <label>Название</label>
                <input name="title" required />
                <label>Категория</label>
                <select name="cat">{['Дедлайн университета','Олимпиада','Экзамен','IELTS/TOEFL','SAT','Стажировка','Собеседование','Другое'].map(c => <option key={c} value={c}>{c}</option>)}</select>
                <label>Время</label>
                <input name="time" type="time" />
                <label>Приоритет</label>
                <select name="pri"><option value="Высокий">Высокий</option><option value="Средний" selected>Средний</option><option value="Низкий">Низкий</option></select>
                <label>Описание</label>
                <textarea name="desc" rows={2} />
                <button className="btn sm" style={{ marginTop: 8 }} type="submit">Добавить событие</button>
              </form>
            </>
          ) : <p className="muted">Выбери день в календаре, чтобы добавить событие.</p>}
        </div>
      </div>
      <div className="card" style={{ marginTop: 14 }}>
        <h3 style={{ marginTop: 0 }}>Ближайшие дедлайны</h3>
        {upcoming.length ? upcoming.map(e => (
          <div key={e.id} className="row" style={{ justifyContent: 'space-between', borderBottom: '1px solid var(--border)', padding: '6px 0' }}>
            <span>{e.title} <span className="muted">({e.date})</span></span>
            <DeadlineBadge dl={e.date} />
          </div>
        )) : <p className="muted">Событий пока нет.</p>}
      </div>
    </>
  );
}

/* ===================== SKILL GAP ===================== */
function SkillGap({ state }: { state: AppState }) {
  const sg = skillGap(state.profile);
  return (
    <>
      <h2>Skill Gap</h2>
      <p className="muted">Оценка пересчитывается автоматически на основе твоего профиля.</p>
      <div className="card">
        {sg.map(s => (
          <div key={s.k} style={{ marginBottom: 10 }}>{s.k} — {s.v}%
            <div className="bar-bg"><div className="bar-fill" style={{ width: `${s.v}%` }} /></div>
          </div>
        ))}
      </div>
      <div className="card" style={{ marginTop: 14 }}>
        <h3 style={{ marginTop: 0 }}>Рекомендации AI</h3>
        {gapAdvice(sg, state.profile.major).map((n, i) => <div key={i} className="notice">{n}</div>)}
      </div>
    </>
  );
}

/* ===================== ROADMAP ===================== */
function Roadmap({ state, save }: { state: AppState; save: (s: AppState) => void }) {
  const rm = roadmap(state.profile);
  const quickAddTask = (title: string) => {
    const d = new Date(); d.setDate(d.getDate() + 14);
    save({ ...state, events: [...state.events, { id: uid(), title, date: d.toISOString().slice(0, 10), category: 'Roadmap', priority: 'Средний', status: 'Запланировано', time: '', desc: '', link: '' }] });
    alert('Добавлено в календарь (через 14 дней)');
  };
  return (
    <>
      <h2>12-Month Roadmap</h2>
      <p className="muted">Персональный план на 12 месяцев — учитывает твою специальность «{state.profile.major}» и слабые зоны Skill Gap.</p>
      <div className="grid g2">
        {rm.map(r => (
          <div key={r.m} className="card">
            <h3 style={{ marginTop: 0 }}>{r.m}</h3>
            {r.tasks.map((t, i) => (
              <div key={i} className="row" style={{ justifyContent: 'space-between', borderBottom: '1px solid var(--border)', padding: '5px 0' }}>
                <span style={{ fontSize: 14 }}>• {t}</span>
                <button className="btn ghost sm" onClick={() => quickAddTask(t)}>+ В календарь</button>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}

/* ===================== ESSAY ANALYZER ===================== */
function EssayAnalyzer({ state }: { state: AppState }) {
  const [text, setText] = useState('');
  const [result, setResult] = useState<{ wc: number; pros: string[]; cons: string[] } | null>(null);
  const [loading, setLoading] = useState(false);

  const run = () => {
    if (!text.trim()) return;
    setLoading(true);
    setTimeout(() => {
      const r = analyzeEssay(text);
      setResult(r);
      setLoading(false);
    }, 400);
  };

  return (
    <>
      <h2>Essay Analyzer</h2>
      <p className="notice">🟡 Упрощённый demo-анализ (правила по ключевым словам). AI не переписывает твой текст автоматически — только показывает сильные и слабые стороны.</p>
      <div className="card">
        <label>Вставь текст эссе</label>
        <textarea rows={8} value={text} onChange={e => setText(e.target.value)} />
        <button className="btn" style={{ marginTop: 10 }} onClick={run}>Анализировать</button>
      </div>
      {loading && <div className="card" style={{ marginTop: 14 }}><p className="muted">Анализирую...</p></div>}
      {result && (
        <div className="card" style={{ marginTop: 14 }}>
          <p className="muted">Слов: {result.wc}</p>
          <h3>Что хорошо</h3>
          {result.pros.length ? result.pros.map((p, i) => <div key={i} className="check">✓ {p}</div>) : <p className="muted">Пока не найдено.</p>}
          <h3>Что улучшить</h3>
          {result.cons.length ? result.cons.map((c, i) => <div key={i} className="check">⚠ {c}</div>) : <p className="muted">Отлично, серьёзных замечаний нет!</p>}
        </div>
      )}
    </>
  );
}

/* ===================== DOCUMENTS ===================== */
function Documents({ state: _state }: { state: AppState }) {
  const [text, setText] = useState('');
  const [items, setItems] = useState<{ label: string; ok: boolean }[] | null>(null);
  const [loading, setLoading] = useState(false);

  const run = () => {
    if (!text.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setItems(checkDoc(text));
      setLoading(false);
    }, 400);
  };

  return (
    <>
      <h2>Document Checker</h2>
      <p className="notice">🟡 Упрощённый demo-анализ. AI не подтверждает подлинность документа — только проверяет заполнение основных полей.</p>
      <div className="card">
        <label>Вставь текст документа (CV, транскрипт и т.д.)</label>
        <textarea rows={8} value={text} onChange={e => setText(e.target.value)} />
        <button className="btn" style={{ marginTop: 10 }} onClick={run}>Проверить</button>
      </div>
      {loading && <div className="card" style={{ marginTop: 14 }}><p className="muted">Проверяю...</p></div>}
      {items && (
        <div className="card" style={{ marginTop: 14 }}>
          {items.map((r, i) => (
            <div key={i} className="check">{r.ok ? '✓ Проверка заполнения пройдена' : '⚠ Найдена возможная ошибка'}: {r.label}</div>
          ))}
          <p className="muted" style={{ marginTop: 8 }}>Требуется ручная проверка перед подачей документа — подлинность AI не подтверждает.</p>
        </div>
      )}
    </>
  );
}

/* ===================== TRANSLATOR ===================== */
function Translator() {
  const langs = ['English','Русский','Қазақша','Français','Deutsch','Español','Italiano','中文','日本語','한국어','العربية','Türkçe','Português'];
  const [from, setFrom] = useState(langs[1]);
  const [to, setTo] = useState(langs[0]);
  const [text, setText] = useState('');
  const [result, setResult] = useState('');

  const run = () => {
    if (!text.trim()) { setResult('Вставь текст для перевода.'); return; }
    setResult('Живой AI недоступен в этом окне — реальный перевод сейчас невозможен. Для перевода подключите AI API.');
  };

  return (
    <>
      <h2>AI Translator</h2>
      <p className="notice">🟡 Живой AI недоступен — показан demo-режим без перевода.</p>
      <div className="card">
        <div className="row">
          <div style={{ flex: 1 }}><label>Откуда</label><select value={from} onChange={e => setFrom(e.target.value)}>{langs.map(l => <option key={l} value={l}>{l}</option>)}</select></div>
          <div style={{ flex: 1 }}><label>Куда</label><select value={to} onChange={e => setTo(e.target.value)}>{langs.map(l => <option key={l} value={l}>{l}</option>)}</select></div>
        </div>
        <label>Текст документа</label>
        <textarea rows={6} value={text} onChange={e => setText(e.target.value)} />
        <button className="btn" style={{ marginTop: 10 }} onClick={run}>Перевести (demo)</button>
      </div>
      {result && <div className="card" style={{ marginTop: 14 }}><p style={{ whiteSpace: 'pre-wrap' }}>{result}</p></div>}
    </>
  );
}

/* ===================== AI ASSISTANT ===================== */
function Assistant({ state, save }: { state: AppState; save: (s: AppState) => void }) {
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [state.chat, thinking]);

  const send = (e: FormEvent) => {
    e.preventDefault();
    const msg = input.trim();
    if (!msg) return;
    const newChat = [...state.chat, { role: 'user' as const, text: msg }];
    save({ ...state, chat: newChat });
    setInput('');
    setThinking(true);
    setTimeout(() => {
      const reply = chatReply(msg);
      save({ ...state, chat: [...newChat, { role: 'ai', text: reply }] });
      setThinking(false);
    }, 500);
  };

  return (
    <>
      <h2>AI Assistant</h2>
      <p className="notice">🟡 Живой AI сейчас недоступен в этом окне — работает упрощённый demo-режим по ключевым словам.</p>
      <div className="card">
        <div className="chatbox" ref={chatRef}>
          {state.chat.length ? state.chat.map((m, i) => (
            <div key={i} className={`msg ${m.role}`}>{m.text}</div>
          )) : <p className="muted">Задай вопрос об университетах, грантах, IELTS, эссе...</p>}
          {thinking && <div className="msg ai">Думаю...</div>}
        </div>
        <form className="row" style={{ marginTop: 10 }} onSubmit={send}>
          <input value={input} onChange={e => setInput(e.target.value)} placeholder="Напиши сообщение..." style={{ flex: 1 }} />
          <button className="btn sm" type="submit">Отправить</button>
        </form>
      </div>
    </>
  );
}

/* ===================== APPLICATIONS ===================== */
function Applications({ state, save }: { state: AppState; save: (s: AppState) => void }) {
  const statuses = ['Research','Preparing','Documents Ready','Submitted','Interview','Accepted','Rejected'];
  const update = (id: string, field: 'deadline' | 'status', val: string) =>
    save({ ...state, applications: state.applications.map(a => a.id === id ? { ...a, [field]: val } : a) });
  const del = (id: string) => save({ ...state, applications: state.applications.filter(a => a.id !== id) });

  return (
    <>
      <h2>My Applications</h2>
      <div className="card">
        <table>
          <thead><tr><th>Университет</th><th>Программа</th><th>Дедлайн</th><th>Статус</th><th></th></tr></thead>
          <tbody>
            {state.applications.length ? state.applications.map(a => (
              <tr key={a.id}>
                <td>{a.university}</td>
                <td>{a.program}</td>
                <td><input type="date" value={a.deadline || ''} onChange={e => update(a.id, 'deadline', e.target.value)} style={{ padding: 4 }} /></td>
                <td><select value={a.status} onChange={e => update(a.id, 'status', e.target.value)}>{statuses.map(s => <option key={s} value={s}>{s}</option>)}</select></td>
                <td><button className="btn ghost sm" onClick={() => del(a.id)}>✕</button></td>
              </tr>
            )) : <tr><td className="muted" colSpan={5}>Пока нет заявок — добавь их со страницы университета.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ===================== PORTFOLIO ===================== */
function Portfolio({ state, save }: { state: AppState; save: (s: AppState) => void }) {
  const [inputs, setInputs] = useState<Record<string, string>>({});

  const add = (cat: string) => {
    const v = (inputs[cat] || '').trim();
    if (!v) return;
    const next = { ...state.portfolio };
    if (!next[cat]) next[cat] = [];
    next[cat] = [...next[cat], v];
    save({ ...state, portfolio: next });
    setInputs({ ...inputs, [cat]: '' });
  };
  const del = (cat: string, i: number) => {
    const next = { ...state.portfolio };
    next[cat] = (next[cat] || []).filter((_, idx) => idx !== i);
    save({ ...state, portfolio: next });
  };

  return (
    <>
      <h2>My Portfolio</h2>
      <p className="muted">Добавляй сюда достижения вручную — они не влияют на Skill Gap автоматически (для этого используются счётчики в профиле), но формируют твоё резюме.</p>
      <div className="grid g2">
        {PORTFOLIO_CATS.map(cat => (
          <div key={cat} className="card">
            <h3 style={{ marginTop: 0 }}>{cat}</h3>
            {(state.portfolio[cat] || []).length ? (state.portfolio[cat] || []).map((item, i) => (
              <div key={i} className="row" style={{ justifyContent: 'space-between', borderBottom: '1px solid var(--border)', padding: '5px 0' }}>
                <span style={{ fontSize: '13.5px' }}>• {item}</span>
                <button className="btn ghost sm" onClick={() => del(cat, i)}>✕</button>
              </div>
            )) : <p className="muted" style={{ fontSize: '12.5px' }}>Пока пусто.</p>}
            <div className="row" style={{ marginTop: 8 }}>
              <input value={inputs[cat] || ''} onChange={e => setInputs({ ...inputs, [cat]: e.target.value })} placeholder="Добавить..." style={{ flex: 1 }}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(cat); } }} />
              <button className="btn sm" onClick={() => add(cat)}>+</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ===================== SAVED ===================== */
function Saved({ state, toggleSave }: { state: AppState; toggleSave: (t: 'uni' | 'opp', id: string) => void }) {
  const [openUniId, setOpenUniId] = useState<string | null>(null);
  const [openOppId, setOpenOppId] = useState<string | null>(null);
  const savedUnis = UNIS.filter(u => state.saved.uni.includes(u.id));
  const savedOpps = OPPS.filter(o => state.saved.opp.includes(o.id));

  return (
    <>
      <h2>Saved</h2>
      <h3>Университеты</h3>
      <div className="grid g3">
        {savedUnis.length ? savedUnis.map(u => (
          <div key={u.id} className="card">
            <b>{u.name}</b>
            <div className="muted">{u.city}, {u.country}</div>
            <button className="btn ghost sm" style={{ marginTop: 8 }} onClick={() => setOpenUniId(u.id)}>Открыть</button>
          </div>
        )) : <p className="muted">Пока нет сохранённых университетов.</p>}
      </div>
      <h3 style={{ marginTop: 20 }}>Возможности</h3>
      <div className="grid g3">
        {savedOpps.length ? savedOpps.map(o => (
          <div key={o.id} className="card">
            <span className="pill">{o.cat}</span>
            <h3 style={{ margin: '8px 0 2px' }}>{o.title}</h3>
            <div className="muted" style={{ fontSize: 13 }}>{o.org}</div>
            <button className="btn ghost sm" style={{ marginTop: 8 }} onClick={() => setOpenOppId(o.id)}>Открыть</button>
          </div>
        )) : <p className="muted">Пока нет сохранённых возможностей.</p>}
      </div>
      {openUniId && <UniModal id={openUniId} state={state} onClose={() => setOpenUniId(null)} onAddApp={() => {}} />}
      {openOppId && <OppModal id={openOppId} state={state} toggleSave={toggleSave} onClose={() => setOpenOppId(null)} onAddCal={() => {}} />}
    </>
  );
}

/* ===================== SETTINGS ===================== */
function Settings({ state }: { state: AppState }) {
  const clearAll = () => {
    if (confirm('Удалить все данные?')) { localStorage.clear(); location.reload(); }
  };
  return (
    <>
      <h2>Settings</h2>
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Аккаунт</h3>
        <p>{state.profile.name} · {state.user?.email}</p>
        <button className="btn ghost sm" onClick={clearAll}>Очистить все данные</button>
      </div>
      <div className="card" style={{ marginTop: 14 }}>
        <h3 style={{ marginTop: 0 }}>Статус AI</h3>
        <p>🟡 Живой AI сейчас недоступен в этом окне — работают упрощённые demo-ответы.</p>
        <p className="muted" style={{ fontSize: '13.5px' }}>Чтобы AI работал и на своём домене/хостинге, нужен отдельный backend с ключом API в переменных окружения (никогда во frontend).</p>
      </div>
    </>
  );
}

export default App;
