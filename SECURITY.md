# 🔒 Защита на Routes - Архитектура

## Двупластова система за сигурност

### Пласт 1️⃣: Middleware (Edge Runtime - бърза филтрация)

**Файл:** `middleware.ts`

**Цел:** UX оптимизация и първична филтрация

**Как работи:**

```
Заявка → Middleware проверява cookie 'supabase-auth-token'
         ├─ НЕ съществува → Redirect към /login
         └─ Съществува → Пропуска заявката напред
```

**⚠️ ВАЖНО:** Middleware НЕ прави валидация с база данни!

- Защо? Edge Runtime не може да прави async Supabase заявки ефективно
- Това е САМО филтър за UX, НЕ е реална сигурност

**Правила:**

- `/login`, `/signup` → Публични (без cookie проверка)
- Всички други → Изискват cookie (но НЕ валидират)

---

### Пласт 2️⃣: Server Component (Node Runtime - РЕАЛНА СИГУРНОСТ)

**Файл:** `app/(protected)/layout.tsx`

**Цел:** Валидация на сесия с Supabase база данни

**Как работи:**

```
Protected страница заредена
  └─ Layout извиква isAuthenticated()
      └─ supabase.auth.getUser() → Валидира с БАЗА ДАННИ
          ├─ Валиден token → Показва страница
          ├─ Изтекъл token → Redirect /login
          ├─ Невалиден token → Redirect /login
          └─ Изтрит user → Redirect /login
```

**✅ ИСТИНСКА СИГУРНОСТ:**

- Проверява token срещу Supabase Auth API
- Валидира дали потребителят съществува
- Проверява дали session е активна
- Изчиства невалидни cookies

---

## 🛡️ Защо две пласта?

### Пласт 1 (Middleware) - Бърз филтър

- ⚡ Много бърз (няма DB заявки)
- 👤 Подобрява UX (не чака база данни)
- 🚫 НЕ е сигурност (само cookie проверка)

### Пласт 2 (Server Component) - Реална защита

- 🔐 Валидира с база данни
- ✅ Истинска проверка на сесия
- 🗑️ Изчиства невалидни cookies
- 🛡️ РЕАЛНА СИГУРНОСТ

---

## 📊 Поток на заявка

### Случай 1: Потребител без cookie

```
GET /dashboard
  └─ Middleware: Няма cookie → Redirect /login (бързо)
```

### Случай 2: Потребител с валиден cookie & валидна сесия

```
GET /dashboard
  └─ Middleware: Има cookie → Пропуска
      └─ Protected Layout: supabase.auth.getUser() → ✅ Валиден
          └─ Рендерира страница
```

### Случай 3: Потребител с cookie но изтекла сесия

```
GET /dashboard
  └─ Middleware: Има cookie → Пропуска (НЕ знае че е изтекла)
      └─ Protected Layout: supabase.auth.getUser() → ❌ Грешка
          └─ Изтрива cookies → Redirect /login
```

### Случай 4: Потребител с подправен/невалиден cookie

```
GET /dashboard
  └─ Middleware: Има cookie → Пропуска (НЕ може да знае че е фалшив)
      └─ Protected Layout: supabase.auth.getUser() → ❌ Грешка
          └─ Изтрива cookies → Redirect /login
```

---

## 🎯 Защо Middleware НЕ проверява сесията?

1. **Edge Runtime ограничения** - Edge функциите са оптимизирани за скорост, не за сложна логика
2. **Performance** - DB заявка на всяка заявка е бавно
3. **Next.js препоръка** - Middleware за редиректи, Server Components за валидация
4. **Cookie-based auth** - Middleware вижда cookie, но не може да знае дали е валиден

---

## ✅ Как се гарантира защита?

### НЕ можеш да достигнеш protected страница без валидна сесия:

1. **Без cookie** → Middleware спира на Пласт 1
2. **С cookie, но невалиден** → Protected Layout спира на Пласт 2
3. **С cookie, но изтекъл** → Protected Layout спира на Пласт 2
4. **С cookie, но user изтрит** → Protected Layout спира на Пласт 2

### Всяка protected страница минава през:

```typescript
app/(protected)/layout.tsx
  ↓
isAuthenticated() // Валидира с Supabase
  ↓
supabase.auth.getUser() // API заявка към Supabase
  ↓
✅ Валиден → Показва страница
❌ Невалиден → Redirect /login
```

---

## 🔑 Ключови точки

- **Middleware = UX оптимизация** (бърз redirect за видимо неавторизирани)
- **Server Component = РЕАЛНА СИГУРНОСТ** (валидация с база данни)
- **Двата пласта работят заедно** - бързина + сигурност
- **Supabase Auth API** е източникът на истина за валидност на сесията
