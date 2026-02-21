# Portfolio Website

Одностраничный сайт-портфолио на чистом `HTML + CSS + JS` в стиле glass / futuristic UI.

## Структура проекта

```text
port/
├─ assets/
│  ├─ dashboard-shot.svg
│  ├─ logs-shot.svg
│  └─ flow-shot.svg
├─ index.html               # Главная страница портфолио
├─ projects/
│  ├─ project-automation.html  # Страница проекта
│  └─ project.css              # Стили страниц проекта
├─ style.css                # Общие стили сайта
├─ scripts.js               # Анимации при скролле
├─ app.py                   # Локальный сервер для запуска
└─ README.md
```

## Локальный запуск

1. Открой терминал в папке проекта:
```powershell
cd C:\Users\kobzu\port
```
2. Запусти сервер:
```powershell
python app.py
```
3. Открой в браузере:
```text
http://127.0.0.1:8000
```

Остановка сервера: `Ctrl + C`.

## Что где менять

- Контент главной: `index.html`
- Контент страниц проектов: `projects/*.html`
- Дизайн и адаптив: `style.css`, `projects/project.css`
- Скролл-анимации: `scripts.js`
- Картинки проекта: `assets/*.svg`

## Публикация

Подходит для:
- GitHub Pages
- Netlify
- Vercel

Для деплоя загрузи все файлы из папки проекта.  
`app.py` нужен только для локального запуска.
