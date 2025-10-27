// ПРИМЕР: Как да използваш настройките за цени на всяка страница

import { useSettings } from '@/src/contexts/SettingsContext';

export default function ExamplePage() {
  // 1. Импортирай useSettings hook
  const { settings, loading } = useSettings();

  // 2. Използвай цените
  const buyPrice = settings.buy_price; // Цена на покупка
  const sellPrice = settings.sell_price; // Цена на продажба

  // 3. Изчисли печалба
  const profitPerCan = sellPrice - buyPrice;
  const profitPercentage = (profitPerCan / buyPrice) * 100;

  // 4. Пример: Изчисли печалба за 10 тенекии
  const totalCans = 10;
  const totalProfit = profitPerCan * totalCans;

  if (loading) {
    return <div>Зареждане...</div>;
  }

  return (
    <div>
      <h1>Пример за използване на цените</h1>

      <p>Цена на покупка: €{buyPrice}</p>
      <p>Цена на продажба: €{sellPrice}</p>
      <p>Печалба на тенекия: €{profitPerCan}</p>
      <p>Процент печалба: {profitPercentage.toFixed(2)}%</p>

      <hr />

      <p>За {totalCans} тенекии:</p>
      <p>Обща печалба: €{totalProfit}</p>
    </div>
  );
}

// ПРИМЕР 2: Използване в изчисления
function calculateOrderProfit(numberOfCans: number) {
  const { settings } = useSettings();

  const costPrice = settings.buy_price * numberOfCans;
  const sellPrice = settings.sell_price * numberOfCans;
  const profit = sellPrice - costPrice;

  return {
    costPrice,
    sellPrice,
    profit,
    profitPercentage: (profit / costPrice) * 100,
  };
}

// ПРИМЕР 3: Показване в таблица
function OrdersTableExample() {
  const { settings } = useSettings();

  const orders = [
    { id: 1, cans: 10 },
    { id: 2, cans: 25 },
    { id: 3, cans: 50 },
  ];

  return (
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Тенекии</th>
          <th>Разход</th>
          <th>Продажба</th>
          <th>Печалба</th>
        </tr>
      </thead>
      <tbody>
        {orders.map((order) => {
          const cost = settings.buy_price * order.cans;
          const revenue = settings.sell_price * order.cans;
          const profit = revenue - cost;

          return (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.cans}</td>
              <td>€{cost.toFixed(2)}</td>
              <td>€{revenue.toFixed(2)}</td>
              <td className={profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                €{profit.toFixed(2)}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
