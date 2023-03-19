import { StyleCodes } from "@trikztime/ecosystem-shared/const";
import { isDefined } from "@trikztime/ecosystem-shared/utils";
import { GroupSizes } from "types";

export const INITIAL_GROUPS = Object.freeze([2, 8, 10, 20]);
export const MAX_GROUPED_RECORDS = 100;
export const GRPOUP_MULTIPLIER = Object.freeze([1.0, 0.8, 0.6, 0.4, 0.2]);
export const BASE_PLACE_POINTS = 20;
export const EXTRA_PLACES = 10;

export const StylePointsMulti: Record<number, number> = {
  [StyleCodes.normal]: 1.0,
  [StyleCodes.sideways]: 1.4,
  [StyleCodes.wonly]: 1.5,
};

const clamp = (value: number, min: number, max: number) => {
  if (value < min) return min;
  if (value > max) return max;
  return value;
};

/**
 * Определяет макимальное количество рекордов, которое помещается в заданных группах
 * @param groupSizes Размеры групп
 * @returns Максимальное количество рекордов
 */
export const getGroupSizesTotalRecords = (groupSizes: GroupSizes): number => {
  return groupSizes.reduce((total, groupSize) => total + groupSize, 0);
};

/**
 * Дизайн:
 * При увеличении количества рекордов увеличивается размер групп
 * При этом увеличивается размер 1й группы, например с 2 -> 5
 * Смысл этого: так как пройти карту легче, то больше игроков могут попасть в лучшую группу.
 *
 * Предполагается что начисление поинтов будет зависеть от общего количества рекордов и размера группы.
 * Всего "фиксированных" групп 4, 5я группа содержит все рекорды не вошедшие в первые 4 группы
 *
 * Таким образом игроки в 5й группе будут получать меньше поинтов с каждым новым прохождением карты,
 * так как размер группы будет постоянно расти
 *
 * Приблизительные размеры групп
 * 1: 2 - 5
 * 2: 8 - 20
 * 3: 10 - 25
 * 4: 20 - 50
 * 5: появляется после определенного количества рекордов (100)
 *
 * Математика получения размера группы из минимального размера
 * floor of (minSize * clampedRecordsSize) / minRecordsAmount
 */
export const getGroupSizes = (totalRecords: number): number[] => {
  // при ограничении в 100 рекордов, максимальный размер групп будет: [5, 20, 25, 50]
  const minTotalRecords = getGroupSizesTotalRecords(INITIAL_GROUPS);

  if (totalRecords <= minTotalRecords) return INITIAL_GROUPS.map((value) => value);

  const clampedRecordsAmount = clamp(totalRecords, 0, MAX_GROUPED_RECORDS);

  // основные группы (без последней группы)
  const resultGroups = INITIAL_GROUPS.reduce((groups, initialGroupSize) => {
    const adjustedGroupSize = Math.floor((initialGroupSize * clampedRecordsAmount) / minTotalRecords);
    groups.push(adjustedGroupSize);

    return groups;
  }, [] as number[]);

  const resultTotalRecords = getGroupSizesTotalRecords(resultGroups);
  const lastGroupSize = totalRecords - resultTotalRecords;

  if (lastGroupSize > 0) {
    resultGroups.push(lastGroupSize);
  }

  // последняя группа не включается в массив, к ней относятся любые рекорды не вошедние в основные группы
  return resultGroups;
};

/**
 * Определяет группу по заданной позиции и размерам групп
 * @param place Позиция рекорда
 * @param groupSizes Размеры групп
 * @returns Индекс группы для места
 */
export const getPlaceGroupIndex = (place: number, groupSizes: GroupSizes): number | null => {
  if (place < 1) return null;

  const localGroupSizes = [...groupSizes];

  const data = localGroupSizes.reduce(
    (data, _, index, groupSizes) => {
      const currentGroupTotalRecords = getGroupSizesTotalRecords(groupSizes.slice(0, index + 1));

      if (place <= currentGroupTotalRecords && data.groupIndex === -1) {
        return {
          prevGroupTotalRecords: currentGroupTotalRecords,
          groupIndex: index,
        };
      }
      return data;
    },
    { prevGroupTotalRecords: 0, groupIndex: -1 },
  );

  return data.groupIndex === -1 ? null : data.groupIndex;
};

/**
 * Определяет позицию первого места в общем топе для заданной группы
 * @param groupIndex Индекс группы
 * @param groupSizes Размеры групп
 * @returns Номер позиции
 */
export const getGroupFirstPlace = (groupIndex: number, groupSizes: GroupSizes): number | null => {
  if (groupIndex < 0 || groupIndex > groupSizes.length - 1) return null;

  // размеры групп, которые находятся до текущей
  const groupsBeforeCurrentGroup = groupSizes.slice(0, groupIndex);
  const prevTotalRecords = getGroupSizesTotalRecords(groupsBeforeCurrentGroup);
  return prevTotalRecords + 1;
};

// export const getGroupLastPlace = (groupIndex: number, groupSizes: number[]): number => {
//   // размеры групп, которые находятся до текущей
//   const groupsBeforeCurrentGroup = groupSizes.slice(0, groupIndex);
//   const size = groupsBeforeCurrentGroup.reduce((total, groupSize) => total + groupSize, 0) + groupSizes[groupIndex];
//   return size;
// };

/**
 * Определяет количество поинтов для позиции в топе
 * @param place Позиция рекорда
 * @param groupSizes Размеры групп
 * @param baseSkillpoints Базовые поинты
 * @returns Поинты за место
 */
export const getPlaceWeightedPoints = (place: number, groupSizes: GroupSizes, baseSkillpoints: number): number => {
  const groupIndex = getPlaceGroupIndex(place, groupSizes);
  const firstPlace = isDefined(groupIndex) ? getGroupFirstPlace(groupIndex, groupSizes) : null;

  if (!isDefined(groupIndex) || !firstPlace) return 0;

  const groupSize = groupSizes[groupIndex];
  const groupMulti = groupSizes.length <= GRPOUP_MULTIPLIER.length ? GRPOUP_MULTIPLIER[groupIndex] : 0;
  const isLastGroup = groupIndex + 1 === groupSizes.length;

  if (isLastGroup) {
    return baseSkillpoints * groupMulti;
  }

  const nextGroupMulti = isLastGroup ? groupMulti : GRPOUP_MULTIPLIER[groupIndex + 1];

  const firstPlacePoints = baseSkillpoints * groupMulti;
  const lastPlacePoints = baseSkillpoints * nextGroupMulti;
  // разница в поинтах между крайними местами в группе
  const pointsDifference = firstPlacePoints - lastPlacePoints;
  // дополнительное количество количество поинтов за место в группе
  const groupPlacePoints = pointsDifference / groupSize;

  // разница текущего места с первым местом
  const groupPlaceDecreaseIndex = place - firstPlace;
  // вычитаем из поинтов за первое место группы поинты за каждое большее место в группе умноженное поинты за место
  const decreasePoints = groupPlaceDecreaseIndex * groupPlacePoints;

  // по итогу возвращаются поинты за первое место в группе с вычетом поинтов за каждое следующее место в группе
  return Math.floor(firstPlacePoints - decreasePoints);
};

/**
 * Определяет финальное количество поинтов за рекорд
 * @param place Позиция рекорда
 * @param groupSizes Размеры групп
 * @param baseSkillpoints Базовые поинты
 * @param style Стиль
 * @returns Поинты за рекорд
 */
export const getRecordWeightedPoints = (
  place: number,
  groupSizes: GroupSizes,
  baseSkillpoints: number,
  style: number,
): number => {
  if (place < 1) return 0;

  const styleMulti = StylePointsMulti[style] ?? 1.0;
  const styleSkillpoints = baseSkillpoints * styleMulti;

  // бонус за первое прохождение
  const firstCompletionPoints = styleSkillpoints * 0.5;

  // дополнительный бонус за место
  // place 10: (20 * 0) + 20 = 20
  // place 5: (20 * 5) + 20 = 120
  // place 1: (20 * 9) + 20 = 200
  let extraPlacePoints = 0;
  if (place >= 1 && place <= EXTRA_PLACES) {
    const placeIndex = EXTRA_PLACES - place;
    extraPlacePoints = BASE_PLACE_POINTS + BASE_PLACE_POINTS * placeIndex;
  }

  // основной бонус за место
  const placePoints = getPlaceWeightedPoints(place, groupSizes, styleSkillpoints);

  return Math.floor(firstCompletionPoints + extraPlacePoints + placePoints);
};
