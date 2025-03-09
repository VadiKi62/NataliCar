import dayjs from "dayjs";
import { companyData } from "@utils/companyData";

const defaultStartHour = companyData.defaultStart.slice(0, 2);
const defaultStartMinute = companyData.defaultStart.slice(-2);

const defaultEndHour = companyData.defaultEnd.slice(0, 2);
const defaultEndMinute = companyData.defaultEnd.slice(-2);

const diffStart = companyData.hoursDiffForStart;
const diffEnd = companyData.hoursDiffForEnd;

export function returnHoursToParseToDayjs(company) {
  const defaultStartHour = company?.defaultStart?.slice(0, 2);
  const defaultStartMinute = company?.defaultStart?.slice(-2);
  const defaultEndHour = company?.defaultEnd?.slice(0, 2);
  const defaultEndMinute = company?.defaultEnd?.slice(-2);
  return {
    defaultStartHour,
    defaultStartMinute,
    defaultEndHour,
    defaultEndMinute,
  };
}

export const processOrders = (orders) => {
  const unavailableDates = [];
  const confirmedDates = [];

  orders.forEach((order) => {
    const startDate = dayjs(order.rentalStartDate);
    const endDate = dayjs(order.rentalEndDate);

    let currentDate = startDate;
    while (
      currentDate.isBefore(endDate) ||
      currentDate.isSame(endDate, "day")
    ) {
      const dateStr = currentDate.format("YYYY-MM-DD");
      unavailableDates.push(dateStr);
      if (order.confirmed) {
        confirmedDates.push(dateStr);
      }
      currentDate = currentDate.add(1, "day");
    }
  });

  return { unavailableDates, confirmedDates };
};

export const functionToCheckDuplicates = (
  conflictMessage1 = [],
  conflictMessage2 = [],
  conflictMessage3 = []
) => {
  const combinedSet = new Set([...conflictMessage1, ...conflictMessage2]);

  const filteredConflictMessage3 = conflictMessage3.filter(
    (message) => !combinedSet.has(message)
  );

  return filteredConflictMessage3;
};

// эта функция возвращает все подтвержденные и неподтвержденные даты бронирования а также их начальные и финальные дни НЕ РАБОТАЕТ ПОКА
export function getConfirmedAndUnavailableStartEndDates(
  startEnd,
  confirmedDates,
  unavailableDates
) {
  const confirmedAndStartEnd = [];
  const unavailableAndStartEnd = [];

  startEnd.forEach((date) => {
    if (confirmedDates.includes(date.date)) {
      confirmedAndStartEnd.push(date.date);
    } else if (unavailableDates.includes(date.date)) {
      unavailableAndStartEnd.push(date.date);
    }
  });

  return {
    confirmedAndStartEnd,
    unavailableAndStartEnd,
  };
}

// ЄТА ФУНКЦИЯ ВОЗВРАЩАЕТ ТОЛЬКО ТЕ ДНИ, В КОТОРЫЕ ПЕРЕСЕЧЕНИЕ НАЧАЛА ОЖНОГО БРОНИРОВАНИЯ И КОНЦА ДРУГОГО БРОНИРОВАНИЯ
// ДОРАБОТАТЬ : ЧТОБЫ ФУНКЦИЯ ВОЗРАЩАЛА ТАКЖЕ ОБЬЕКТ  C ЭТИМИ ДВУМЯ ДАТАМИ И С обозначение старт или енд каждой из них
export const functionToretunrStartEndOverlap = (startEnd) => {
  const startEndOverlap = [];

  startEnd.forEach((date) => {
    if (date.type === "start") {
      const overlappingEndDates = startEnd.filter(
        (d) => d.date === date.date && d.type === "end"
      );
      if (overlappingEndDates.length > 0) {
        startEndOverlap.push(date.date);
      }
    }
  });

  return startEndOverlap;
};

// функция которая возвращает 4 массива - 1. только старт и енд даты (внутри они обьекты, чтобы выделить отдельно подтвержденные и неподтвержденные) 2. только подтвержденные внутренние даты 3. только неподтвержденные внутренние даты 4. только те стартовые и конечные даты, которые случаются в одни дни
export function extractArraysOfStartEndConfPending(orders) {
  const unavailable = [];
  const confirmed = [];
  const startEnd = [];

  orders?.forEach((order) => {
    const startDate = dayjs(order.rentalStartDate);
    const endDate = dayjs(order.rentalEndDate);

    const timeStart = order.timeIn.toString().slice(11, 16);

    const timeEnd = order.timeOut.toString().slice(11, 16);

    // Add start and end dates to special handling array
    startEnd.push({
      date: startDate.format("YYYY-MM-DD"),
      type: "start",
      time: timeStart,
      confirmed: order.confirmed,
      orderId: order._id,
    });
    startEnd.push({
      date: endDate.format("YYYY-MM-DD"),
      type: "end",
      time: timeEnd,
      confirmed: order.confirmed,
      orderId: order._id,
    });

    // Handle middle dates
    let currentDate = startDate.add(1, "day");
    while (currentDate.isBefore(endDate)) {
      const dateStr = currentDate.format("YYYY-MM-DD");

      if (order.confirmed) {
        confirmed.push(dateStr);
      } else {
        unavailable.push(dateStr);
      }
      currentDate = currentDate.add(1, "day");
    }
  });

  // Transform startEnd into the required structure
  const transformedStartEndOverlap = startEnd
    .reduce((acc, date) => {
      // Найти запись для текущей даты
      let entry = acc.find((item) => item.date === date.date);

      if (!entry) {
        // Создаем новую запись, если ее еще нет

        entry = {
          date: date.date,
          startConfirmed: false,
          startPending: false,
          endConfirmed: false,
          endPending: false,
          startExists: false, // Для проверки наличия типа "start"
          endExists: false, // Для проверки наличия типа "end"
        };
        acc.push(entry);
      }

      // Обновляем статус на основе типа и подтверждения
      if (date.type === "start") {
        if (date.confirmed) {
          entry.startConfirmed = true;
        } else {
          entry.startPending = true;
        }
        entry.startExists = true;
      } else if (date.type === "end") {
        if (date.confirmed) {
          entry.endConfirmed = true;
        } else {
          entry.endPending = true;
        }
        entry.endExists = true;
      }

      // console.log("ENTRY of dates in reduce function", entry);

      return acc;
    }, [])
    // Фильтруем, чтобы оставить только те даты, где есть и "start", и "end"
    .filter((entry) => entry.startExists && entry.endExists)
    .reduce((acc, cur) => {
      acc.push({
        date: cur.date,
        startConfirmed: cur.startConfirmed,
        endConfirmed: cur.endConfirmed,
        startPending: cur.startPending,
        endPending: cur.endPending,
      });
      return acc;
    }, []);

  return {
    unavailable,
    confirmed,
    startEnd,
    transformedStartEndOverlap,
  };
}

export function returnOverlapOrders(orders, dateStr) {
  let overlapOrders = [];
  orders?.forEach((order) => {
    const rentalStart = dayjs(order.rentalStartDate).format("YYYY-MM-DD");
    const rentalEnd = dayjs(order.rentalEndDate).format("YYYY-MM-DD");

    if (dayjs(dateStr).isBetween(rentalStart, rentalEnd, "day", "[]")) {
      overlapOrders.push(order);
    }
  });

  return overlapOrders;
}

export function returnOverlapOrdersObjects(
  orders,
  transformedStartEndOverlap = []
) {
  // Создаем Map для отслеживания повторений дат
  const dateOccurrences = new Map();

  // Первый проход: собираем все даты и подсчитываем их повторения
  orders?.forEach((order) => {
    const rentalStart = dayjs(order.rentalStartDate);
    const rentalEnd = dayjs(order.rentalEndDate);
    let currentDate = rentalStart;

    while (currentDate.isBetween(rentalStart, rentalEnd, "day", "[]")) {
      const dateStr = currentDate.format("YYYY-MM-DD");

      // Получаем или инициализируем объект для этой даты
      const counts = dateOccurrences.get(dateStr) || {
        confirmed: 0,
        pending: 0,
      };

      // Увеличиваем соответствующий счетчик
      if (order.confirmed) {
        counts.confirmed += 1;
      } else {
        counts.pending += 1;
      }

      // Обновляем Map
      dateOccurrences.set(dateStr, counts);

      // Переходим к следующему дню
      currentDate = currentDate.add(1, "day");
    }
  });

  // Преобразуем Map в массив объектов
  const result = Array.from(dateOccurrences.entries())
    .map(([date, counts]) => ({
      date,
      ...counts,
    }))
    .filter(
      ({ confirmed, pending }) =>
        (confirmed > 0 && pending > 0) || confirmed > 1 || pending > 1
    ) // Дополнительный фильтр для исключения дат из transformedStartEndOverlap
    .filter(
      ({ date }) =>
        !transformedStartEndOverlap?.some((overlap) => overlap.date === date)
    );

  return result;
}

// function to return available start and available end if end  confirmed and start confirmed exist on the date
export function returnTime(startEndDates, date) {
  const dateFormat = dayjs(date).format("YYYY-MM-DD");
  const dateInrange = startEndDates?.find(
    (el) => el.date == dateFormat && el.confirmed
  );

  if (dateInrange) {
    return dateInrange;
  }
  return;
}

// пушает фремя в существующий datejs обьект
export function setTimeToDatejs(date, time, isStart = false) {
  // console.log("DATE", date);
  // console.log("time", time);
  if (time) {
    const hour = Number(time?.slice(0, 2)) + 1;
    const minute = Number(time?.slice(-2));
    const newDateWithTime = dayjs(date)
      .hour(hour)
      .minute(minute)
      .second(0)
      .millisecond(0);

    return newDateWithTime;
  } else if (isStart) {
    // console.log("???? day to retunr for START", dayjs(date).hour(15).minute(0));
    return dayjs(date)
      .hour(defaultStartHour)
      .minute(defaultStartMinute)
      .second(0)
      .millisecond(0);
  } else
    return dayjs(date)
      .hour(defaultEndHour)
      .minute(defaultEndMinute)
      .second(0)
      .millisecond(0);
}

// returns time is start time of the orders == end time of anothjer order
//or
// end time of the orders == start time of anothjer order
export function calculateAvailableTimes(
  startEndDates,
  startStr,
  endStr,
  orderId
) {
  let availableStart = null;
  let availableEnd = null;

  console.log("!startStr", startStr);
  console.log("!endStr", endStr);
  const filteredStartEndDates = startEndDates?.filter((dateObj) => {
    return dateObj.orderId != orderId;
  });

  console.log("filteredStartEndDates", filteredStartEndDates);

  // Retrieve time info for start and end dates
  const timeStart = returnTime(startEndDates, startStr);
  console.log("!timeStart", timeStart);
  if (timeStart && timeStart.type === "end" && timeStart.confirmed) {
    availableStart = timeStart.time;
  }

  const timeEnd = returnTime(startEndDates, endStr);
  console.log("!timeEnd", timeEnd);
  if (timeEnd && timeEnd.type === "start" && timeEnd.confirmed) {
    availableEnd = timeEnd.time;
  }

  console.log("availableStart", availableStart);
  console.log("availableEnd", availableEnd);

  console.log("timeStart", timeStart);
  console.log("timeEnd", timeEnd);

  // Parse hours and minutes from the available times
  const hourStart = Number(timeStart?.time.slice(0, 2)) || defaultStartHour; // Default hour is 15
  const minuteStart =
    Number(timeStart?.time.slice(-2)) || defaultStartMinute || 0; // Default minute is 0

  const hourEnd = Number(timeEnd?.time.slice(0, 2)) || defaultEndHour; // Default hour is 10
  const minuteEnd = Number(timeEnd?.time.slice(-2)) || defaultEndMinute || 0; // Default minute is 0

  return {
    availableStart,
    availableEnd,
    hourStart,
    minuteStart,
    hourEnd,
    minuteEnd,
  };
}
export function toParseTime(rentalDate, day) {
  const hour = day.hour();
  const minute = day.minute();

  return dayjs(rentalDate).hour(hour).minute(minute);
}
