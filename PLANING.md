# 🎯 План за Действие: Мениджър на Поръчки (Next.js/Supabase)

Този план обхваща четирите фази на проекта, фокусирайки се изцяло върху **Next.js (App Router) с TypeScript и Supabase**.

---

## 🟢 ФАЗА 0: Настройка на Средата

Целта е да подготвим проекта и връзката към базата данни.

### 0.1. Инициализация на Проекта

[X] Стартирайте създаването на Next.js проекта:
`npx create-next-app@latest my-olive-oil-manager --ts --tailwind --app --src-dir`
[X] Изберете всички препоръчителни настройки (TypeScript, ESLint, Tailwind, App Router, Source Directory).

### 0.2. Инсталиране на Зависимости

[X] Инсталирайте основните библиотеки:
`npm install @supabase/supabase-js zod react-hook-form`

### 0.3. Конфигурация на Средата (.env)

[X] Създайте файл `.env.local` в корена на проекта.
[X] Добавете вашите Supabase ключове (взети от Settings -> API в Supabase):
`# Вземете тези стойности от вашия Supabase проект
    NEXT_PUBLIC_SUPABASE_URL="[Вашият Supabase Project URL]"
    NEXT_PUBLIC_SUPABASE_ANON_KEY="[Вашият Public Anon Key]"`

### 0.4. Настройка на Supabase Клиента

[X] Създайте папката `src/lib`.
[X] В нея създайте файл `src/lib/supabase.ts` и добавете кода за инициализация на клиента:

````typescript
import { createClient } from '@supabase/supabase-js';

    // Създава клиента за използване в Server Components / Server Actions
    export const supabaseServer = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    ```

### 0.5. Основни Стилизации

[X] Отворете `src/app/layout.tsx` и настройте основните елементи (`<html>`, `<body>`).
[X] Изчистете `src/app/page.tsx` от излишния начален код, оставяйки само основната структура.

---

## 🔵 ФАЗА 1: Моделиране на Данните и Типове

Целта е да създадем таблиците в Supabase и съответните TypeScript типове.

### 1.1. Таблица `orders` (Поръчки)

[ ] Влезте в Supabase (SQL Editor) и изпълнете SQL за създаване на таблицата `orders` (или я създайте през UI с тези колони):
| Колона | Тип | NOT NULL |
| :--- | :--- | :--- |
| `id` | `uuid` (PK) | Да |
| **`client_name`** | **`text`** | **Да** |
| `client_phone` | `text` | Не |
| `client_address` | `text` | Не |
| `client_email` | `text` | Не |
| `order_date` | `timestamp with time zone` | Да (default: `now()`) |
| `total_tins` | `integer` | Да |
| `paid_tins` | `integer` | Да |
| `selling_price_per_tin` | `numeric(10, 2)` | Да |
| `cost_price_per_tin` | `numeric(10, 2)` | Да |

### 1.2. Таблица `settings` (Настройки на Цените)

[ ] Създайте таблицата `settings` (за да съхранява текущите цени).
| Колона | Тип | NOT NULL |
| :--- | :--- | :--- |
| `id` | `text` (PK) | Да (Задайте на 'global') |
| `current_selling_price`| `numeric(10, 2)` | Да |
| `current_cost_price` | `numeric(10, 2)` | Да |
[ ] Добавете един ред в таблица `settings` с `id = 'global'` и примерни стойности за цените.

### 1.3. Дефиниране на TypeScript Типове

[ ] Създайте папка `src/types`.
[ ] В нея създайте файл `src/types/db.ts` и дефинирайте типовете за данните:
```typescript
// Тип за поръчка, както е в базата данни
export type Order = {
id: string;
client_name: string;
client_phone: string | null;
client_address: string | null;
client_email: string | null;
order_date: string; // timestamp
total_tins: number;
paid_tins: number;
selling_price_per_tin: number;
cost_price_per_tin: number;
};

    // Тип за данни при създаване на поръчка (от формата)
    export type NewOrderData = Omit<Order, 'id' | 'order_date'>;
    ```

---

## 🔶 ФАЗА 2: CRUD и Проследяване на Плащанията

Това е основната функционалност.

### 2.1. Server Actions (CRUD Функции)

[ ] Създайте файл `src/app/actions.ts`.
[ ] Добавете функция **`getOrders()`** за извличане на всички поръчки.
[ ] Добавете функция **`createOrder(data: NewOrderData)`** за запис на нова поръчка.
[ ] Добавете функция **`deleteOrder(id: string)`** за изтриване на поръчка.
[ ] Добавете функция **`updatePaymentStatus(id: string, newPaidTins: number)`** за актуализиране само на броя платени тенекии.

### 2.2. UI: Форма за Нова Поръчка (`NewOrderForm.tsx`)

[ ] Създайте папка `src/components`.
[ ] В нея създайте компонент `NewOrderForm.tsx`.
[ ] Дефинирайте **Zod схема** за валидация: `client_name` е `min(1)`, а контактите (`phone`, `address`, `email`) са `optional()`.
[ ] Използвайте `react-hook-form` за създаване на формата.
[ ] При Submit извикайте Server Action **`createOrder()`** и след това обновете страницата (`revalidatePath('/')`).

### 2.3. UI: Таблица с Поръчките (`OrdersTable.tsx`)

[ ] Създайте компонент `OrdersTable.tsx`.
[ ] В `src/app/page.tsx` извикайте `getOrders()` (като Server Component) и подайте данните на `OrdersTable.tsx`.
[ ] **Изобразете** всички поръчки в таблица.
[ ] За всеки ред, покажете: Име, Дата, Общо тенекии, **Платени тенекии**, **Дължими тенекии** (`total_tins - paid_tins`).
[ ] Добавете бутон "Изтриване" и бутон "Промени плащане" за всеки ред.

### 2.4. UI: Промяна на Плащането (`UpdatePaymentModal.tsx`)

[ ] Създайте компонент `UpdatePaymentModal.tsx` (или `UpdatePaymentForm.tsx`).
[ ] Този компонент трябва да приема ID на поръчката и текущите `total_tins` и `paid_tins`.
[ ] Има едно поле за въвеждане на новия брой **платени тенекии**.
[ ] При Submit, извикайте Server Action **`updatePaymentStatus()`**.

### 2.5. UI: Настройки на Цените (`SettingsForm.tsx`)

[ ] Създайте Server Action функции **`getSettings()`** и **`updateSettings(data)`** за таблица `settings`.
[ ] Създайте компонент `SettingsForm.tsx`.
[ ] Използвайте `getSettings()` за да заредите текущите цени.
[ ] При създаване на **нова поръчка (2.2)**, вземете тези стойности като _default_ за `selling_price_per_tin` и `cost_price_per_tin`.

---

## 🟡 ФАЗА 3: Финансов Дашборд

Целта е да изчислим и покажем ключовите финансови метрики.

### 3.1. Server Action: Финансови Изчисления

[ ] В `src/app/actions.ts` добавете функция **`getFinancialSummary()`**.
[ ] В тази функция изпълнете **агрегиращи Supabase заявки** за изчисляване на:
[ ] **Общи Приходи** ($\sum (\text{paid\_tins} \times \text{selling\_price\_per\_tin})$)
[ ] **Задължения към Доставчик** ($\sum (\text{total\_tins} \times \text{cost\_price\_per\_tin})$)
[ ] **Обща Печалба** ($\sum (\text{paid\_tins} \times (\text{selling\_price\_per\_tin} - \text{cost\_price\_per\_tin}))$)
[ ] **Дължими Суми от Клиенти** ($\sum ((\text{total\_tins} - \text{paid\_tins}) \times \text{selling\_price\_per\_tin})$)

### 3.2. Агрегация по Клиент

[ ] В същата функция `getFinancialSummary()` добавете заявка, която групира данните по `client_name` за да покаже:
[ ] Обща дължима сума от всеки клиент.
[ ] Обща реализирана печалба от всеки клиент.

### 3.3. UI: Дашборд Компонент (`Dashboard.tsx`)

[ ] Създайте компонент `Dashboard.tsx`.
[ ] В `src/app/page.tsx` извикайте `getFinancialSummary()` и подайте данните на `Dashboard.tsx`.
[ ] Използвайте Tailwind CSS, за да покажете четирите ключови метрики (3.1) в ясни, големи блокове.
[ ] Добавете отделна таблица или секция, която показва детайлите по клиент (3.2).

---

## 🟣 ФАЗА 4: AI Асистент (TypeScript)

Подготовка на пътя за интелигентен чатбот с достъп до данните.

### 4.1. Инсталиране на AI Библиотеки

[ ] Инсталирайте необходимите пакети за AI:
`npm install langchain @langchain/openai`

### 4.2. Създаване на AI API Route

[ ] Създайте папката `src/app/api/ai-chat`.
[ ] В нея създайте файл `route.ts` (за Route Handler, който приема POST заявки).

### 4.3. Дефиниране на Database Tool (Инструмент)

[ ] Създайте файл `src/lib/ai-tools.ts`.
[ ] Дефинирайте функция или клас, която приема SQL заявка (като стринг) и я изпълнява срещу Supabase, връщайки резултата. Този клас е "инструментът" на AI агента.

### 4.4. AI Agent Logic

[ ] В `route.ts` (4.2):
[ ] Инициализирайте AI модела (OpenAI или Gemini) и му подайте `DatabaseTool` (4.3).
[ ] Напишете **System Prompt** (инструкция) към AI модела да действа като "Финансов Асистент" и да използва инструмента за всички въпроси, свързани с данните.

### 4.5. UI: Чат Интерфейс

[ ] Създайте компонент `AIChat.tsx`.
[ ] Добавете поле за въвеждане на въпроси и зона за показване на отговорите.
[ ] При Submit, изпратете въпроса към `api/ai-chat` Route Handler-а.
[ ] Показвайте отговора на AI.

---

**КРАЙ НА ПЛАНА**
````
