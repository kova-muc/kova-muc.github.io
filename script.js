const burger = document.getElementById("burger");
const menu = document.getElementById("menu");
const bioModal = document.getElementById("bioModal");

/* ===== МЕНЮ ===== */
function toggleMenu() {
  menu.classList.toggle("active");
}

burger.onclick = toggleMenu;
burger.onkeydown = (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    toggleMenu();
  }
};

function toggleSub(id) {
  const el = document.getElementById(id);
  el.style.display = el.style.display === "block" ? "none" : "block";
}

/* клик вне меню закрывает его */
document.addEventListener("click", (e) => {
  if (!menu.contains(e.target) && !burger.contains(e.target)) {
    menu.classList.remove("active");
  }
});

/* ===== БИОГРАФИЯ ===== */
function openBio() {
  menu.classList.remove("active");
  bioModal.classList.add("active");
  bioModal.setAttribute("aria-hidden", "false");
}

function closeBio() {
  bioModal.classList.remove("active");
  bioModal.setAttribute("aria-hidden", "true");
}

document.getElementById("bioClose").onclick = closeBio;
bioModal.addEventListener("click", (e) => {
  if (e.target === bioModal) closeBio();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeBio();
});

/* ===== ЯЗЫК ===== */
const translations = {
  ru: {
    menu_bio: "Биография",
    menu_social: "Соц Сети",
    menu_platforms: "Площадки",
    bio_title: "Биография",
    bio_p1: "Kovay – независимый музыкальный проект, вдохновленный жанрами post-punk и indie rock.",
    bio_p2: "В 14 лет старший брат скинул ему курс по созданию музыки – но тогда это быстро надоело. А спустя два года он сам вернулся к этому, скачал программу и начал делать пост-панк. Слушал много, экспериментировал, пытался добиться нужного звучания. Слабое железо не позволяло воплотить всё задуманное, но он не сдался.",
    photo_caption: "Это я, Алексей Гаврилов :3",
    bio_p3: "Потом понял, что вариться в одном жанре скучно – и пошёл дальше: пост-рок, панк-рок, инди. Начал вести TikTok, видео стали попадать в рекомендации, появились первые слушатели.",
    about_title: "О проекте",
    about_text: "Kovay - независимый музыкальный проект, вдохновленный жанрами post-punk и indie rock. Звучание сочетает атмосферную меланхолию, гитарные соло и эмоциональные тексты, передающие внутренние переживания, одиночество и поиск себя.",
    soon_title: "Скоро",
    soon_track: "Песенка в процессе ;)",
    contact: "Связь:",
    t_summer: "Кончится лето",
    t_vanya: "Песня про Ваню",
    t_dream: "Мечта",
    t_friends: "История двух друзей",
    t_time: "Время",
    t_home: "Я хочу домой",
    t_sky: "Небо",
    t_happy: "Счастливый день",
    t_together: "Позови меня с собой",
    t_night: "Ночь",
    t_breakup: "Песня про расставание",
    t_oursummer: "НАШЕ ЛЕТО"
  },
  en: {
    menu_bio: "Biography",
    menu_social: "Social",
    menu_platforms: "Platforms",
    bio_title: "Biography",
    bio_p1: "Kovay is an independent music project inspired by post-punk and indie rock.",
    bio_p2: "When he was 14, his older brother sent him a music production course, but he quickly lost interest. Two years later he came back to it on his own, downloaded a program and started making post-punk. He listened a lot, experimented and tried to get the sound he was after. Weak hardware couldn't bring everything he had in mind to life, but he didn't give up.",
    photo_caption: "This is me, Alexey Gavrilov :3",
    bio_p3: "Then he realized that staying in one genre gets boring, and moved on: post-rock, punk rock, indie. He started a TikTok, his videos began appearing in recommendations, and the first listeners showed up.",
    about_title: "About",
    about_text: "Kovay is an independent music project inspired by post-punk and indie rock. The sound blends atmospheric melancholy, guitar solos and emotional lyrics about inner struggles, loneliness and the search for oneself.",
    soon_title: "Coming soon",
    soon_track: "Song in progress ;)",
    contact: "Contact:",
    t_summer: "Summer Will End",
    t_vanya: "Song About Vanya",
    t_dream: "Dream",
    t_friends: "A Story of Two Friends",
    t_time: "Time",
    t_home: "I Want to Go Home",
    t_sky: "Sky",
    t_happy: "Happy Day",
    t_together: "Take Me With You",
    t_night: "Night",
    t_breakup: "Breakup Song",
    t_oursummer: "OUR SUMMER"
  }
};

function setLang(lang) {
  if (!translations[lang]) lang = "ru";

  document.documentElement.lang = lang;

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    if (translations[lang][key] !== undefined) {
      el.textContent = translations[lang][key];
    }
  });

  document.querySelectorAll(".lang-option").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.lang === lang);
  });

  document.getElementById("currentFlag").setAttribute("href", "#flag-" + lang);

  try {
    localStorage.setItem("kovay-lang", lang);
  } catch (e) {}
}

const langSwitch = document.getElementById("langSwitch");
const langCurrent = document.getElementById("langCurrent");

function setLangMenu(open) {
  langSwitch.classList.toggle("open", open);
  langCurrent.setAttribute("aria-expanded", open ? "true" : "false");
}

langCurrent.onclick = () => setLangMenu(!langSwitch.classList.contains("open"));

document.querySelectorAll(".lang-option").forEach((btn) => {
  btn.onclick = () => {
    setLang(btn.dataset.lang);
    setLangMenu(false);
  };
});

document.addEventListener("click", (e) => {
  if (!langSwitch.contains(e.target)) setLangMenu(false);
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") setLangMenu(false);
});

let savedLang = "ru";
try {
  savedLang = localStorage.getItem("kovay-lang") || "ru";
} catch (e) {}
setLang(savedLang);

/* ===== АНИМАЦИЯ ПОЯВЛЕНИЯ ПРИ ПРОКРУТКЕ ===== */
(function () {
  const items = document.querySelectorAll(
    ".bio h2, .bio p, .tracks h2, .track-card, footer p"
  );

  items.forEach((el) => el.classList.add("reveal"));

  /* небольшая «лесенка» задержки: карточки появляются друг за другом */
  document.querySelectorAll(".track-grid").forEach((grid) => {
    grid.querySelectorAll(".track-card").forEach((card, i) => {
      card.style.setProperty("--d", (i % 4) * 0.1 + "s");
    });
  });
  const bioP = document.querySelector(".bio p");
  if (bioP) bioP.style.setProperty("--d", "0.15s");

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduce || !("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  items.forEach((el) => observer.observe(el));
})();
