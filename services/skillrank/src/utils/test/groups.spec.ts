import { StyleCodes } from "@trikztime/ecosystem-shared/const";

import {
  getGroupFirstPlace,
  getGroupSizes,
  getPlaceWeightedPoints,
  getRecordWeightedPoints,
  INITIAL_GROUPS,
  StylePointsMulti,
} from "../groups";
import { getGroupSizesTotalRecords, getPlaceGroupIndex } from "./../groups";

describe("Скиллранк / получение размера группы", () => {
  test("Максимальный размер", () => {
    expect(getGroupSizes(200)).toEqual([5, 20, 25, 50, 100]);
  });
  test("Минимальный размер", () => {
    expect(getGroupSizes(40)).toEqual([2, 8, 10, 20]);
  });
  test("Среднее значение", () => {
    const totalRecords = 89;
    const minTotalRecords = getGroupSizesTotalRecords(INITIAL_GROUPS);
    const groups = [
      Math.floor((INITIAL_GROUPS[0] * totalRecords) / minTotalRecords),
      Math.floor((INITIAL_GROUPS[1] * totalRecords) / minTotalRecords),
      Math.floor((INITIAL_GROUPS[2] * totalRecords) / minTotalRecords),
      Math.floor((INITIAL_GROUPS[3] * totalRecords) / minTotalRecords),
    ];
    const restGroupSize = totalRecords - getGroupSizesTotalRecords(groups);

    expect(getGroupSizes(totalRecords)).toEqual([...groups, restGroupSize]);
  });
});

describe("Скиллранк / получение идекса группы для места в топе", () => {
  // 1: 1 - 5
  // 2: 6 - 25
  // 3: 26 - 50
  // 4: 51 - 100
  const groups = [5, 20, 25, 50, 100];
  const totalRecords = getGroupSizesTotalRecords(groups);

  test("Первая группа, первое место", () => {
    expect(getPlaceGroupIndex(1, groups)).toBe(0);
  });
  test("Первая группа, последнее место", () => {
    expect(getPlaceGroupIndex(5, groups)).toBe(0);
  });

  test("Последняя группа, первое место", () => {
    const prevTotalRecords = getGroupSizesTotalRecords(groups.slice(0, groups.length - 1));
    const lastGroupFirstPlace = prevTotalRecords + 1;
    expect(getPlaceGroupIndex(lastGroupFirstPlace, groups)).toBe(4);
  });
  test("Последняя группа, последнее место", () => {
    expect(getPlaceGroupIndex(totalRecords, groups)).toBe(4);
  });

  test("Средняя группа, первое место", () => {
    expect(getPlaceGroupIndex(26, groups)).toBe(2);
  });
  test("Средняя группа, последнее место", () => {
    expect(getPlaceGroupIndex(50, groups)).toBe(2);
  });

  test("Некорректное место (0 или меньше)", () => {
    expect(getPlaceGroupIndex(0, groups)).toBe(null);
  });
  test("Некорректное место (больше максимального размера рекордов на 1)", () => {
    expect(getPlaceGroupIndex(totalRecords + 1, groups)).toBe(null);
  });
  test("Некорректное место (больше максимального размера рекордов на много)", () => {
    expect(getPlaceGroupIndex(999, groups)).toBe(null);
  });
});

describe("Скиллранк / получение первого места группы", () => {
  // 1: 1 - 5
  // 2: 6 - 25
  // 3: 26 - 50
  // 4: 51 - 100
  const groups = [5, 20, 25, 50, 100];

  test("Получение позиции первой группы", () => {
    expect(getGroupFirstPlace(0, groups)).toBe(1);
  });
  test("Получение позиции средней группы", () => {
    expect(getGroupFirstPlace(2, groups)).toBe(26);
  });
  test("Получение позиции последней группы", () => {
    expect(getGroupFirstPlace(4, groups)).toBe(101);
  });

  test("Некорректный индекс группы (кейс 1)", () => {
    expect(getGroupFirstPlace(-1, groups)).toBe(null);
  });
  test("Некорректный индекс группы (кейс 2)", () => {
    expect(getGroupFirstPlace(5, groups)).toBe(null);
  });
});

describe("Скиллранк / получение поинтов за место", () => {
  // 1: 1 - 5
  // 2: 6 - 25
  // 3: 26 - 50
  // 4: 51 - 100
  // множители поинтов: 1.0, 0.8, 0.6, 0.4, 0.2
  const groups = [5, 20, 25, 50, 100];
  const baseSkillpoints = 100;

  /**
   * Проверка мест в 1 группе
   *
   * За 1 группу выдается 100 * 1.0 = 100
   * За 2 группу выдается 100 * 0.8 = 80
   * Разница в поинтах 20 (4 поинта за место)
   *
   * 1 место = 100 - 4 * 0 = 100 поинтов
   * 2 место = 100 - 4 * 1 = 96 поинтов
   * 3 место = 100 - 4 * 2 = 92 поинтов
   * 4 место = 100 - 4 * 3 = 88 поинтов
   * 5 место = 100 - 4 * 4 = 84 поинтов
   */
  test("1 место", () => expect(getPlaceWeightedPoints(1, groups, baseSkillpoints)).toBe(100));
  test("2 место", () => expect(getPlaceWeightedPoints(2, groups, baseSkillpoints)).toBe(96));
  test("3 место", () => expect(getPlaceWeightedPoints(3, groups, baseSkillpoints)).toBe(92));
  test("4 место", () => expect(getPlaceWeightedPoints(4, groups, baseSkillpoints)).toBe(88));
  test("5 место", () => expect(getPlaceWeightedPoints(5, groups, baseSkillpoints)).toBe(84));

  /**
   * Проверка мест в 4 группе
   *
   * За 4 группу выдается 100 * 0.4 = 40
   * За 5 группу выдается 100 * 0.2 = 20
   * Разница в поинтах 20, 0.4 поинта за место (20 / 50)
   *
   * 51 место = 40 - 0.4 * 0 = 40
   * 52 место = 40 - 0.4 * 1 = 39.6
   * 53 место = 40 - 0.4 * 2 = 39.2
   * 54 место = 40 - 0.4 * 3 = 38.8
   * 55 место = 40 - 0.4 * 4 = 38.4
   * 56 место = 40 - 0.4 * 5 = 38
   */
  test("51 место", () => expect(getPlaceWeightedPoints(51, groups, baseSkillpoints)).toBe(40));
  test("52 место", () => expect(getPlaceWeightedPoints(52, groups, baseSkillpoints)).toBe(39));
  test("53 место", () => expect(getPlaceWeightedPoints(53, groups, baseSkillpoints)).toBe(39));
  test("54 место", () => expect(getPlaceWeightedPoints(54, groups, baseSkillpoints)).toBe(38));
  test("55 место", () => expect(getPlaceWeightedPoints(55, groups, baseSkillpoints)).toBe(38));
  test("56 место", () => expect(getPlaceWeightedPoints(56, groups, baseSkillpoints)).toBe(38));

  test("Последняя группа", () => {
    expect(getPlaceWeightedPoints(101, groups, baseSkillpoints)).toBe(20);
  });

  test("Некорректное место (кейс 1)", () => expect(getPlaceWeightedPoints(-1, groups, baseSkillpoints)).toBe(0));
  test("Некорректное место (кейс 2)", () => expect(getPlaceWeightedPoints(0, groups, baseSkillpoints)).toBe(0));
  test("Некорректное место (кейс 3)", () => expect(getPlaceWeightedPoints(999, groups, baseSkillpoints)).toBe(0));
});

describe("Скиллранк / получение поинтов за рекорд", () => {
  // 1: 1 - 5
  // 2: 6 - 25
  // 3: 26 - 50
  // 4: 51 - 100
  // множители поинтов: 1.0, 0.8, 0.6, 0.4, 0.2
  const groups = [5, 20, 25, 50, 100];
  const baseSkillpoints = 100;
  const style = StyleCodes.normal;
  const styleMulti = StylePointsMulti[style];
  const styleSkillpoints = baseSkillpoints * styleMulti;
  const firstCompletionPoints = styleSkillpoints * 0.5;

  test("1 место", () => {
    const place = 1;
    const extraPlacePoints = 200;
    const placePoints = getPlaceWeightedPoints(place, groups, styleSkillpoints);
    const computed = Math.floor(firstCompletionPoints + extraPlacePoints + placePoints);
    expect(getRecordWeightedPoints(place, groups, baseSkillpoints, style)).toBe(computed);
  });
  test("10 место", () => {
    const place = 10;
    const extraPlacePoints = 20;
    const placePoints = getPlaceWeightedPoints(place, groups, styleSkillpoints);
    const computed = Math.floor(firstCompletionPoints + extraPlacePoints + placePoints);
    expect(getRecordWeightedPoints(place, groups, baseSkillpoints, style)).toBe(computed);
  });
  test("11 место", () => {
    const place = 11;
    const extraPlacePoints = 0;
    const placePoints = getPlaceWeightedPoints(place, groups, styleSkillpoints);
    const computed = Math.floor(firstCompletionPoints + extraPlacePoints + placePoints);
    expect(getRecordWeightedPoints(place, groups, baseSkillpoints, style)).toBe(computed);
  });
  test("Последнее место", () => {
    const place = 200;
    const extraPlacePoints = 0;
    const placePoints = getPlaceWeightedPoints(place, groups, styleSkillpoints);
    const computed = Math.floor(firstCompletionPoints + extraPlacePoints + placePoints);
    expect(getRecordWeightedPoints(place, groups, baseSkillpoints, style)).toBe(computed);
  });

  test("Некорректное место (кейс 1)", () => {
    expect(getRecordWeightedPoints(-1, groups, baseSkillpoints, style)).toBe(0);
  });
  test("Некорректное место (кейс 2)", () => {
    expect(getRecordWeightedPoints(0, groups, baseSkillpoints, style)).toBe(0);
  });
  test("Некорректное место (кейс 3)", () => {
    /**
     * особый кейс
     * при слишкоим большом месте выдаются только поинты за первое прохождение карты
     */
    expect(getRecordWeightedPoints(999, groups, baseSkillpoints, style)).toBe(firstCompletionPoints);
  });
});
