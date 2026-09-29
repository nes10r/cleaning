import type { Locale } from '@/config/i18n';
import { POLICY } from '@/config/site';
import type { SiteSettings } from '@/lib/content/types';

/**
 * Legal documents. These are starting templates written for a Lithuanian
 * cleaning business — have them reviewed by a lawyer before launch.
 */
export type LegalDocKey = 'privacy' | 'cookies' | 'terms';
export interface LegalDoc {
  title: string;
  updated: string;
  intro: string;
  sections: { id: string; heading: string; paragraphs: string[] }[];
}

const UPDATED = '2026-09-26';
const g = POLICY.guaranteeHours;
const c = POLICY.freeCancellationHours;

/** Legal texts filled in with the admin-managed company details. */
export function getLegalDoc(locale: Locale, key: LegalDocKey, site: SiteSettings): LegalDoc {
  return legalDocs(site)[locale][key];
}

const legalDocs = (site: SiteSettings): Record<Locale, Record<LegalDocKey, LegalDoc>> => ({
  lt: {
    privacy: {
      title: 'Privatumo politika',
      updated: UPDATED,
      intro: `Ši politika paaiškina, kaip ${site.legalName} (toliau – „mes“) tvarko asmens duomenis, kai naudojatės svetaine ir užsisakote paslaugas. Duomenis tvarkome laikydamiesi Bendrojo duomenų apsaugos reglamento (BDAR) ir Lietuvos Respublikos teisės aktų.`,
      sections: [
        { id: 'valdytojas', heading: 'Duomenų valdytojas', paragraphs: [`${site.legalName}, ${site.address.street}, ${site.address.postalCode} ${site.address.city}. El. paštas ${site.email}, tel. ${site.phone}.`] },
        { id: 'duomenys', heading: 'Kokius duomenis renkame', paragraphs: ['Užsakymo duomenis: vardą, pavardę, el. pašto adresą, telefono numerį, valymo adresą, patekimo informaciją, pasirinktą paslaugą, datą ir pastabas.', 'Kandidatų duomenis: vardą, kontaktus, miestą, patirtį ir užimtumą, kai pildote darbo anketą.', 'Techninius duomenis: IP adresą, naršyklės tipą ir slapukus pagal jūsų pasirinkimą.'] },
        { id: 'tikslai', heading: 'Tikslai ir teisiniai pagrindai', paragraphs: ['Užsakymui įvykdyti ir su jumis susisiekti – sutarties vykdymas (BDAR 6 str. 1 d. b p.).', 'Buhalterinei apskaitai ir sąskaitoms – teisinė prievolė (BDAR 6 str. 1 d. c p.).', 'Paslaugų kokybei gerinti ir garantijai vykdyti – teisėtas interesas (BDAR 6 str. 1 d. f p.).', 'Naujienlaiškiams, analitikos ir rinkodaros slapukams – jūsų sutikimas (BDAR 6 str. 1 d. a p.), kurį galite bet kada atšaukti.'] },
        { id: 'saugojimas', heading: 'Kiek laiko saugome', paragraphs: ['Užsakymų duomenis – 3 metus po paskutinio užsakymo.', 'Apskaitos dokumentus – 10 metų, kaip reikalauja teisės aktai.', 'Kandidatų anketas – 6 mėnesius, nebent sutiksite ilgiau.'] },
        { id: 'gavejai', heading: 'Kam perduodame duomenis', paragraphs: ['Užsakymą vykdantiems specialistams – tik tiek, kiek reikia valymui atlikti.', 'Paslaugų teikėjams: prieglobos, el. pašto, SMS, mokėjimų ir apskaitos. Su jais sudarytos duomenų tvarkymo sutartys.', 'Duomenų už Europos ekonominės erdvės ribų neperduodame, išskyrus atvejus, kai taikomos tinkamos apsaugos priemonės.'] },
        { id: 'teises', heading: 'Jūsų teisės', paragraphs: ['Galite prašyti susipažinti su savo duomenimis, juos ištaisyti, ištrinti, apriboti tvarkymą, nesutikti su tvarkymu ir perkelti duomenis. Prašymus siųskite el. paštu ' + site.email + '. Atsakysime per 30 dienų.', 'Jei manote, kad jūsų teisės pažeistos, galite kreiptis į Valstybinę duomenų apsaugos inspekciją (vdai.lrv.lt).'] },
      ],
    },
    cookies: {
      title: 'Slapukų politika',
      updated: UPDATED,
      intro: 'Slapukai – tai nedideli failai, saugomi jūsų naršyklėje. Juos naudojame, kad svetainė veiktų, o jums sutikus – kad galėtume ją tobulinti ir rodyti aktualią reklamą.',
      sections: [
        { id: 'butini', heading: 'Būtini slapukai', paragraphs: ['sp_consent – išsaugo jūsų slapukų pasirinkimą, 12 mėn.', 'Užsakymo juodraštis saugomas naršyklės vietinėje saugykloje (localStorage), kad nepamestumėte įvestų duomenų. Jis ištrinamas pateikus užsakymą arba po 30 dienų.'] },
        { id: 'analitika', heading: 'Analitikos slapukai', paragraphs: ['Naudojami tik gavus sutikimą. Padeda suprasti, kurie puslapiai naudingi ir kur lankytojai susiduria su sunkumais. Duomenys apibendrinami.'] },
        { id: 'rinkodara', heading: 'Rinkodaros slapukai', paragraphs: ['Naudojami tik gavus sutikimą, kad galėtume matuoti reklamos socialiniuose tinkluose ir paieškos sistemose efektyvumą.'] },
        { id: 'valdymas', heading: 'Kaip pakeisti pasirinkimą', paragraphs: ['Pasirinkimą galite pakeisti bet kada paspaudę „Slapukų nustatymai“ svetainės apačioje arba ištrynę slapukus naršyklės nustatymuose.'] },
      ],
    },
    terms: {
      title: 'Paslaugų teikimo sąlygos',
      updated: UPDATED,
      intro: `Šios sąlygos taikomos valymo paslaugoms, kurias ${site.legalName} teikia užsakymus pateikusiems klientams.`,
      sections: [
        { id: 'uzsakymas', heading: 'Užsakymas', paragraphs: ['Užsakymas laikomas priimtu, kai jį patvirtiname el. paštu. Prieš valymą galime su jumis susisiekti, kad patikslintume informaciją.'] },
        { id: 'kaina', heading: 'Kaina', paragraphs: ['Svetainėje rodoma kaina yra preliminari. Galutinė kaina priklauso nuo ploto, būklės ir papildomų paslaugų; ją patvirtiname prieš valymą. Jei vietoje paaiškėja, kad reikia papildomų darbų, juos atliekame tik jums sutikus.', 'Visos kainos nurodytos eurais su PVM. Sekmadieniais taikomas 15 % priedas.'] },
        { id: 'atsiskaitymas', heading: 'Atsiskaitymas', paragraphs: ['Už paslaugas atsiskaitoma po valymo kortele, per el. bankininkystę arba grynaisiais. Verslo klientams išrašome PVM sąskaitą faktūrą.'] },
        { id: 'atsaukimas', heading: 'Perkėlimas ir atšaukimas', paragraphs: [`Nemokamai perkelti ar atšaukti valymą galite likus ne mažiau kaip ${c} val. iki jo pradžios. Vėliau atšaukus arba specialistams negalint patekti į patalpas, galime taikyti 50 % užsakymo kainos mokestį.`] },
        { id: 'garantija', heading: 'Kokybės garantija', paragraphs: [`Jei pastebėjote, kad dalis sutartų darbų neatlikta, praneškite per ${g} val. ir atsiųskite nuotrauką. Trūkumus pašalinsime nemokamai.`] },
        { id: 'atsakomybe', heading: 'Atsakomybė', paragraphs: ['Esame apdraudę civilinę atsakomybę. Apie žalą praneškite per 48 val. Neatsakome už daiktus, kurių būklė prieš valymą buvo netinkama, ir už vertybes, kurios nebuvo paslėptos ar apie kurias nebuvome informuoti.'] },
        { id: 'gincai', heading: 'Ginčai', paragraphs: ['Ginčus stengiamės spręsti derybomis. Vartotojai taip pat gali kreiptis į Valstybinę vartotojų teisių apsaugos tarnybą (vvtat.lt) arba naudotis EGS platforma ec.europa.eu/odr.'] },
      ],
    },
  },
  en: {
    privacy: {
      title: 'Privacy policy',
      updated: UPDATED,
      intro: `This policy explains how ${site.legalName} ("we") processes personal data when you use the website and book our services. We process data in line with the General Data Protection Regulation (GDPR) and Lithuanian law.`,
      sections: [
        { id: 'controller', heading: 'Data controller', paragraphs: [`${site.legalName}, ${site.address.street}, ${site.address.postalCode} ${site.address.city}, Lithuania. Email ${site.email}, phone ${site.phone}.`] },
        { id: 'data', heading: 'What data we collect', paragraphs: ['Booking data: first and last name, email, phone number, cleaning address, access information, chosen service, date and notes.', 'Applicant data: name, contacts, city, experience and availability when you fill in the job application.', 'Technical data: IP address, browser type and cookies according to your choice.'] },
        { id: 'purposes', heading: 'Purposes and legal bases', paragraphs: ['To fulfil your booking and contact you – performance of a contract (GDPR Art. 6(1)(b)).', 'For accounting and invoicing – legal obligation (Art. 6(1)(c)).', 'To improve our service and honour the guarantee – legitimate interest (Art. 6(1)(f)).', 'For newsletters, analytics and marketing cookies – your consent (Art. 6(1)(a)), which you can withdraw at any time.'] },
        { id: 'retention', heading: 'How long we keep data', paragraphs: ['Booking data – 3 years after your last booking.', 'Accounting documents – 10 years, as required by law.', 'Job applications – 6 months unless you agree to longer.'] },
        { id: 'recipients', heading: 'Who we share data with', paragraphs: ['The specialists carrying out your booking – only what they need for the job.', 'Service providers for hosting, email, SMS, payments and accounting, under data processing agreements.', 'We do not transfer data outside the European Economic Area unless appropriate safeguards apply.'] },
        { id: 'rights', heading: 'Your rights', paragraphs: [`You can request access, rectification, erasure, restriction, objection and data portability. Send requests to ${site.email}; we reply within 30 days.`, 'If you believe your rights have been infringed, you can contact the State Data Protection Inspectorate of Lithuania (vdai.lrv.lt).'] },
      ],
    },
    cookies: {
      title: 'Cookie policy',
      updated: UPDATED,
      intro: 'Cookies are small files stored in your browser. We use them to make the website work and, with your consent, to improve it and show relevant ads.',
      sections: [
        { id: 'essential', heading: 'Essential cookies', paragraphs: ['sp_consent – stores your cookie choice for 12 months.', 'Your booking draft is kept in the browser’s local storage so you don’t lose what you entered. It is deleted when you submit the booking or after 30 days.'] },
        { id: 'analytics', heading: 'Analytics cookies', paragraphs: ['Used only with consent. They help us see which pages are useful and where visitors get stuck. Data is aggregated.'] },
        { id: 'marketing', heading: 'Marketing cookies', paragraphs: ['Used only with consent to measure the effectiveness of ads on social networks and search engines.'] },
        { id: 'manage', heading: 'Changing your choice', paragraphs: ['You can change your choice any time via “Cookie settings” at the bottom of the site, or by deleting cookies in your browser settings.'] },
      ],
    },
    terms: {
      title: 'Terms of service',
      updated: UPDATED,
      intro: `These terms apply to cleaning services provided by ${site.legalName} to customers who place a booking.`,
      sections: [
        { id: 'booking', heading: 'Booking', paragraphs: ['A booking is accepted once we confirm it by email. We may contact you before the cleaning to clarify details.'] },
        { id: 'price', heading: 'Price', paragraphs: ['The price shown on the website is an estimate. The final price depends on the area, condition and extras, and we confirm it before the cleaning. Additional work found on site is done only with your approval.', 'All prices are in euros including VAT. A 15% surcharge applies on Sundays.'] },
        { id: 'payment', heading: 'Payment', paragraphs: ['Payment is made after the cleaning by card, bank link or cash. Business customers receive a VAT invoice.'] },
        { id: 'cancellation', heading: 'Rescheduling and cancellation', paragraphs: [`You can reschedule or cancel for free up to ${c} hours before the start. For later cancellations, or if the specialists cannot access the premises, we may charge 50% of the booking price.`] },
        { id: 'guarantee', heading: 'Quality guarantee', paragraphs: [`If part of the agreed work was not done, let us know within ${g} hours with a photo and we will fix it free of charge.`] },
        { id: 'liability', heading: 'Liability', paragraphs: ['We hold civil liability insurance. Please report any damage within 48 hours. We are not liable for items that were already in poor condition or valuables that were not put away or disclosed to us.'] },
        { id: 'disputes', heading: 'Disputes', paragraphs: ['We aim to resolve disputes through negotiation. Consumers may also contact the State Consumer Rights Protection Authority (vvtat.lt) or use the EU ODR platform at ec.europa.eu/odr.'] },
      ],
    },
  },
  ru: {
    privacy: {
      title: 'Политика конфиденциальности',
      updated: UPDATED,
      intro: `Эта политика объясняет, как ${site.legalName} («мы») обрабатывает персональные данные, когда вы пользуетесь сайтом и заказываете услуги. Мы обрабатываем данные в соответствии с Общим регламентом по защите данных (GDPR) и законодательством Литвы.`,
      sections: [
        { id: 'controller', heading: 'Контролёр данных', paragraphs: [`${site.legalName}, ${site.address.street}, ${site.address.postalCode} ${site.address.city}, Литва. Эл. почта ${site.email}, тел. ${site.phone}.`] },
        { id: 'data', heading: 'Какие данные мы собираем', paragraphs: ['Данные заказа: имя, фамилия, эл. почта, телефон, адрес уборки, информация о доступе, выбранная услуга, дата и примечания.', 'Данные кандидатов: имя, контакты, город, опыт и занятость при заполнении анкеты.', 'Технические данные: IP-адрес, тип браузера и cookie в соответствии с вашим выбором.'] },
        { id: 'purposes', heading: 'Цели и правовые основания', paragraphs: ['Выполнение заказа и связь с вами – исполнение договора (ст. 6(1)(b) GDPR).', 'Бухгалтерия и счета – юридическая обязанность (ст. 6(1)(c)).', 'Улучшение услуг и выполнение гарантии – законный интерес (ст. 6(1)(f)).', 'Рассылки, аналитические и маркетинговые cookie – ваше согласие (ст. 6(1)(a)), которое можно отозвать в любой момент.'] },
        { id: 'retention', heading: 'Сроки хранения', paragraphs: ['Данные заказов – 3 года после последнего заказа.', 'Бухгалтерские документы – 10 лет, как требует закон.', 'Анкеты кандидатов – 6 месяцев, если вы не согласитесь на больший срок.'] },
        { id: 'recipients', heading: 'Кому мы передаём данные', paragraphs: ['Специалистам, выполняющим заказ, – только необходимое для уборки.', 'Поставщикам услуг хостинга, почты, SMS, платежей и бухгалтерии на основании договоров обработки данных.', 'Мы не передаём данные за пределы Европейской экономической зоны без надлежащих гарантий.'] },
        { id: 'rights', heading: 'Ваши права', paragraphs: [`Вы можете запросить доступ, исправление, удаление, ограничение обработки, возразить против обработки и перенести данные. Запросы отправляйте на ${site.email}; ответим в течение 30 дней.`, 'Если вы считаете, что ваши права нарушены, обратитесь в Государственную инспекцию по защите данных Литвы (vdai.lrv.lt).'] },
      ],
    },
    cookies: {
      title: 'Политика cookie',
      updated: UPDATED,
      intro: 'Cookie – небольшие файлы, которые хранятся в браузере. Мы используем их для работы сайта, а с вашего согласия – для его улучшения и показа релевантной рекламы.',
      sections: [
        { id: 'essential', heading: 'Необходимые cookie', paragraphs: ['sp_consent – хранит ваш выбор cookie 12 месяцев.', 'Черновик заказа хранится в локальном хранилище браузера, чтобы вы не потеряли введённые данные. Он удаляется после отправки заказа или через 30 дней.'] },
        { id: 'analytics', heading: 'Аналитические cookie', paragraphs: ['Используются только с согласия. Помогают понять, какие страницы полезны и где посетители испытывают трудности. Данные обобщаются.'] },
        { id: 'marketing', heading: 'Маркетинговые cookie', paragraphs: ['Используются только с согласия, чтобы измерять эффективность рекламы в социальных сетях и поисковых системах.'] },
        { id: 'manage', heading: 'Как изменить выбор', paragraphs: ['Изменить выбор можно в любой момент через «Настройки cookie» внизу сайта или удалив cookie в настройках браузера.'] },
      ],
    },
    terms: {
      title: 'Условия оказания услуг',
      updated: UPDATED,
      intro: `Эти условия применяются к услугам уборки, которые ${site.legalName} оказывает клиентам, оформившим заказ.`,
      sections: [
        { id: 'booking', heading: 'Заказ', paragraphs: ['Заказ считается принятым после подтверждения по эл. почте. До уборки мы можем связаться с вами для уточнения деталей.'] },
        { id: 'price', heading: 'Цена', paragraphs: ['Цена на сайте предварительная. Итоговая цена зависит от площади, состояния и дополнительных услуг; мы подтверждаем её до уборки. Дополнительные работы выполняются только с вашего согласия.', 'Все цены указаны в евро с НДС. По воскресеньям действует надбавка 15 %.'] },
        { id: 'payment', heading: 'Оплата', paragraphs: ['Оплата после уборки картой, через интернет-банк или наличными. Бизнес-клиентам выставляем счёт с НДС.'] },
        { id: 'cancellation', heading: 'Перенос и отмена', paragraphs: [`Перенести или отменить уборку бесплатно можно не позднее чем за ${c} ч до начала. При более поздней отмене или если специалисты не могут попасть в помещение, может взиматься 50 % стоимости заказа.`] },
        { id: 'guarantee', heading: 'Гарантия качества', paragraphs: [`Если часть оговорённых работ не выполнена, сообщите нам в течение ${g} ч и пришлите фото – мы бесплатно устраним недочёты.`] },
        { id: 'liability', heading: 'Ответственность', paragraphs: ['Наша гражданская ответственность застрахована. О повреждениях сообщите в течение 48 ч. Мы не отвечаем за вещи, которые уже были в плохом состоянии, и за ценности, которые не были убраны или о которых нам не сообщили.'] },
        { id: 'disputes', heading: 'Споры', paragraphs: ['Споры мы стремимся решать путём переговоров. Потребители также могут обратиться в Государственную службу защиты прав потребителей (vvtat.lt) или на платформу ЕС ec.europa.eu/odr.'] },
      ],
    },
  },
});
