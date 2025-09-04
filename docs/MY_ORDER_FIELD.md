# Документация: Поле my_order для отслеживания источника заказов

## Описание
Добавлено поле `my_order` в систему заказов для различения источника создания заказов.

## Логика работы
- **true** - заказ создан на главной странице сайта (через BookingModal из CalendarPicker)
- **false** - заказ создан администратором (через AddOrderModal)

## Реализованные изменения

### 1. База данных (models/order.js)
```javascript
my_order: {
  type: Boolean,
  default: false,
},
```

### 2. API endpoints
- `app/api/order/add/route.js` - добавлена обработка поля my_order при создании заказов
- `app/api/order/update/route.js` - добавлена возможность обновления поля my_order

### 3. Компоненты

#### BookingModal (Главная страница)
- Автоматически устанавливает `my_order: true` для всех заказов, создаваемых через CalendarPicker
- Файл: `app/components/CarComponent/BookingModal.js`

#### AddOrderModal (Админ панель)
- Автоматически устанавливает `my_order: false` для всех админских заказов
- Файл: `app/components/Admin/Order/AddOrderModal.js`

#### EditOrderModal (Отладка)
- Отображает значение поля my_order с цветовой индикацией:
  - 🟢 Зеленый фон - заказы с главной страницы (my_order = true)
  - 🔴 Красный фон - админские заказы (my_order = false)
- Файл: `app/components/Admin/Order/EditOrderModal.js`

## Миграция существующих данных

### Запуск миграции
```bash
npm run migrate:my-order
```

### Что делает миграция
- Находит все заказы без поля my_order
- Устанавливает значение `false` для всех старых заказов (считаем их админскими)
- Выводит статистику до и после миграции

## Отладка
Для отладки работы поля:
1. Откройте BigCalendar в админ панели
2. Кликните на любой заказ (короткий клик)
3. В модальном окне EditOrderModal будет отображена debug-информация с текущим значением поля

## Пример использования в коде

### Проверка источника заказа
```javascript
if (order.my_order) {
  console.log('Заказ создан пользователем с главной страницы через CalendarPicker');
} else {
  console.log('Заказ создан администратором через AddOrderModal');
}
```

### Фильтрация заказов
```javascript
// Только заказы с главной страницы
const userOrders = orders.filter(order => order.my_order === true);

// Только админские заказы  
const adminOrders = orders.filter(order => order.my_order === false);
```

## Статус реализации
✅ Схема базы данных обновлена
✅ API endpoints обновлены  
✅ BookingModal настроен (my_order = true для заказов из CalendarPicker)
✅ AddOrderModal настроен (my_order = false для админских заказов)
✅ EditOrderModal для отладки добавлен
✅ Скрипт миграции создан
✅ Команда миграции добавлена в package.json

## Следующие шаги
1. Запустить миграцию базы данных: `npm run migrate:my-order`
2. Протестировать создание заказов через оба интерфейса
3. Проверить отображение отладочной информации в EditOrderModal
4. При необходимости использовать поле для дополнительной логики приложения
