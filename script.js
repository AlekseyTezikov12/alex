document.addEventListener('DOMContentLoaded', function() {
    // Структура видео: videos[язык][группа] = [{title, url}, ...]
    const videos = {
        ru: {
            cooking: [
                {title: 'Готовка 1', url: 'https://www.youtube.com/watch?v=fPzXgAnjJHU'},
                {title: 'Готовка 2', url: 'https://www.youtube.com/watch?v=6WcSzWuEFdo'},
                {title: 'Готовка 3', url: 'https://www.youtube.com/watch?v=cejK5Dkn8qE'},
                {title: 'Готовка 4', url: 'https://www.youtube.com/watch?v=9ZxN3k4O3G4'}
            ],
            programming: [
                {title: 'Основы HTML за 10 минут', url: 'https://www.youtube.com/watch?v=SKRydSA2bYA'},
                {title: 'JavaScript для начинающих', url: 'https://www.youtube.com/watch?v=fHl7UyRjOf0&list=PLDyJYA6aTY1kJIwbYHzGOuvSMNTfqksmk&index=1'},
                {title: 'Программирование 1', url: 'https://www.youtube.com/watch?v=i4Cp34azt0I'},
                {title: 'Программирование 2', url: 'https://www.youtube.com/watch?v=aaGC7_t52KA'},
                {title: 'Программирование 3', url: 'https://www.youtube.com/watch?v=EM9SV2diJJc'}
            ],
            music: [
                {title: 'Русская музыка 2025', url: 'https://www.youtube.com/watch?v=bICiwrMSMBk&t=146s'}
            ],
            sport: [
                {title: 'Лучшие голы в истории футбола', url: 'https://www.youtube.com/watch?v=Kn2shpkBJ_U'},
                {title: 'Топ-2024 нокаутов в боксе', url: 'https://www.youtube.com/watch?v=CTtAscWaGvA'}
            ],
            humor: [
                {title: 'Лучшие приколы 2024', url: 'https://www.youtube.com/watch?v=4dFUEe-OthU'},
                {title: 'КВН — лучшие выступления', url: 'https://www.youtube.com/watch?v=4dFUEe-OthU'}
            ],
            movies: [
                {title: 'Топ-10 лучших фильмов 2023', url: 'https://www.youtube.com/watch?v=T6nXi4Un4JU'},
                {title: 'Советские комедии (подборка)', url: 'https://www.youtube.com/watch?v=qGXoycbxSnA&list=PLvozwN3BraFTmc_HADFnHS5TodE2he6zA'}
            ],
            games: [
                {title: 'Обзор лучших игр 2023', url: 'https://www.youtube.com/watch?v=Xyktiw0aCs0'}
            ],
            science: [
                {title: 'Космос: удивительные факты', url: 'https://www.youtube.com/watch?v=Kgr6q9kKut8'},
                {title: 'Почему небо голубое?', url: 'https://www.youtube.com/watch?v=opHOfc0fdis'}
            ],
            travel: [
                {title: 'Европа — достопримечательности', url: 'https://www.youtube.com/watch?v=NC00VL9j9zw'},
                {title: 'Азия — экзотические страны', url: 'https://www.youtube.com/watch?v=z6bZPhBijfU'},
                {title: 'Америка — путешествия', url: 'https://www.youtube.com/watch?v=G7g8kNazmkI'},
                {title: 'Африка — сафари и природа', url: 'https://www.youtube.com/watch?v=voUqq5Ufuvc'}
            ],
            motivation: [
                {title: 'Успешные люди России', url: 'https://www.youtube.com/watch?v=D7ms1A0P-Nk&t=2s'},
                {title: 'Истории успеха', url: 'https://www.youtube.com/watch?v=c-lHniXnVe8'},
                {title: 'Саморазвитие и продуктивность', url: 'https://www.youtube.com/watch?v=a-S9DaYtu9s&t=1s'},
                {title: 'Цели и достижения', url: 'https://www.youtube.com/watch?v=1q2PIHgDeIM'}
            ],
            money: [
                {title: 'Как заработать в интернете', url: 'https://www.youtube.com/watch?v=y9HmtYa6YBw'},
                {title: 'Пассивный доход', url: 'https://www.youtube.com/watch?v=yoXcTQVhldU'},
                {title: 'Инвестиции для начинающих', url: 'https://www.youtube.com/watch?v=L309lv8QWVo'},
                {title: 'Финансовая грамотность', url: 'https://www.youtube.com/watch?v=fyrBdjHZvLw'}
            ],
            auto: [
                {title: 'Обзор новых авто', url: 'https://www.youtube.com/watch?app=desktop&v=cwTeRIGhTgM&utm_source=chatgpt.com'},
                {title: 'Лучшие автомобили года', url: 'https://www.youtube.com/watch?v=deHd0HHNDzg'},
                {title: 'Тест-драйв и советы', url: 'https://www.youtube.com/watch?v=bfwGZ3xzIEM'}
            ]
        },
        en: {
            cooking: [
                {title: 'How to cook perfect pasta', url: 'https://www.youtube.com/watch?v=4aZr5hZXP_s'},
                {title: 'Easy Chicken Teriyaki', url: 'https://www.youtube.com/watch?v=Q4q3r3yXo6g'}
            ],
            programming: [
                {title: 'HTML Basics in 10 Minutes', url: 'https://www.youtube.com/watch?v=UB1O30fR-EE'},
                {title: 'JavaScript for Beginners', url: 'https://www.youtube.com/watch?v=PkZNo7MFNFg'}
            ],
            music: [
                {title: 'Best hits 2023', url: 'https://www.youtube.com/watch?v=JGwWNGJdvx8'},
                {title: 'English music', url: 'https://www.youtube.com/watch?v=60ItHLz5WEA'}
            ],
            sport: [], humor: [], movies: [], games: [], science: [], travel: [], motivation: [], money: [], auto: []
        },
        zh: {
            cooking: [
                {title: '家常红烧肉做法', url: 'https://www.youtube.com/watch?v=QJ5g9g5w5gA'}
            ],
            programming: [
                {title: '10分钟学HTML', url: 'https://www.youtube.com/watch?v=UB1O30fR-EE'}
            ],
            music: [
                {title: '中文流行音乐', url: 'https://www.youtube.com/watch?v=60ItHLz5WEA'}
            ],
            sport: [], humor: [], movies: [], games: [], science: [], travel: [], motivation: [], money: [], auto: []
        }
    };

    const groupNames = {
        ru: {
            cooking: 'Готовка', programming: 'Программирование', music: 'Музыка', sport: 'Спорт', humor: 'Юмор', movies: 'Фильмы', games: 'Игры', science: 'Наука', travel: 'Путешествия', motivation: 'Мотивация', money: 'Заработок', auto: 'Авто'
        },
        en: {
            cooking: 'Cooking', programming: 'Programming', music: 'Music', sport: 'Sport', humor: 'Humor', movies: 'Movies', games: 'Games', science: 'Science', travel: 'Travel', motivation: 'Motivation', money: 'Money', auto: 'Auto'
        },
        zh: {
            cooking: '烹饪', programming: '编程', music: '音乐', sport: '运动', humor: '幽默', movies: '电影', games: '游戏', science: '科学', travel: '旅行', motivation: '激励', money: '赚钱', auto: '汽车'
        }
    };

    const titles = {
        ru: 'Сборник интересных YouTube видео',
        en: 'Collection of Interesting YouTube Videos',
        zh: '有趣的YouTube视频合集'
    };
    const labelLang = {
        ru: 'Язык:',
        en: 'Language:',
        zh: '语言:'
    };

    // Получить язык
    const langSelect = document.getElementById('lang-select');
    let currentLang = localStorage.getItem('lang') || 'ru';
    langSelect.value = currentLang;

    function renderHeader() {
        document.querySelector('h1').textContent = titles[currentLang] || titles['ru'];
        document.querySelector('label[for="lang-select"]').textContent = labelLang[currentLang] || labelLang['ru'];
    }

    // Рендер групп
    function renderFolders() {
        const foldersDiv = document.getElementById('folders');
        foldersDiv.innerHTML = '';
        const names = groupNames[currentLang] || groupNames['ru'];
        for (const key in names) {
            if (videos[currentLang] && videos[currentLang][key] && videos[currentLang][key].length > 0) {
                const btn = document.createElement('button');
                btn.className = 'folder-btn';
                btn.dataset.folder = key;
                btn.textContent = names[key];
                btn.onclick = () => renderSection(key);
                foldersDiv.appendChild(btn);
            }
        }
        foldersDiv.style.display = 'flex';
    }

    // Рендер секции
    function renderSection(group) {
        const sectionsDiv = document.getElementById('sections');
        sectionsDiv.innerHTML = '';
        const names = groupNames[currentLang] || groupNames['ru'];
        const groupTitle = names[group] || group;
        const groupVideos = (videos[currentLang] && videos[currentLang][group]) || [];
        const section = document.createElement('section');
        section.className = 'folder-section active';
        section.innerHTML = `<h2>${groupTitle} <button class="back-btn">Назад</button></h2>`;
        const ul = document.createElement('ul');
        ul.className = 'video-list';
        if (groupVideos.length === 0) {
            const li = document.createElement('li');
            li.textContent = 'Нет видео для выбранного языка.';
            ul.appendChild(li);
        } else {
            groupVideos.forEach(v => {
                const li = document.createElement('li');
                li.innerHTML = `<a href="${v.url}" target="_blank">${v.title}</a>`;
                ul.appendChild(li);
            });
        }
        section.appendChild(ul);
        sectionsDiv.appendChild(section);
        document.getElementById('folders').style.display = 'none';
        section.querySelector('.back-btn').onclick = () => {
            sectionsDiv.innerHTML = '';
            document.getElementById('folders').style.display = 'flex';
        };
    }

    // Смена языка
    langSelect.addEventListener('change', function() {
        currentLang = langSelect.value;
        localStorage.setItem('lang', currentLang);
        document.getElementById('folders').style.display = 'flex';
        document.getElementById('sections').innerHTML = '';
        renderHeader();
        renderFolders();
    });

    // Тема (оставляю как было)
    const themeBtn = document.getElementById('theme-btn');
    const body = document.body;
    function setTheme(isDark) {
        if (isDark) {
            body.classList.add('dark-theme');
            localStorage.setItem('theme', 'dark');
        } else {
            body.classList.remove('dark-theme');
            localStorage.setItem('theme', 'light');
        }
    }
    themeBtn.addEventListener('click', function() {
        setTheme(!body.classList.contains('dark-theme'));
    });
    if (localStorage.getItem('theme') === 'dark') {
        setTheme(true);
    }

    // Инициализация
    renderHeader();
    renderFolders();
}); 