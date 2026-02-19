import { differenceInMonths } from "date-fns";

/**
 * 가입 기간에 따라 작성 가능한 감사 항목 수를 반환
 * - 1개월 미만: 3개
 * - 1~3개월: 5개
 * - 3개월 이상: 10개
 */
export function getMaxGratitudeCount(joinedAt: string): number {
  const months = differenceInMonths(new Date(), new Date(joinedAt));
  if (months < 1) return 3;
  if (months < 3) return 5;
  return 10;
}

export function getProgressMessage(count: number, max: number): string {
  if (count === 0) return "오늘의 감사를 시작해보세요!";
  if (count < max) return `${max - count}개 더 작성할 수 있어요`;
  return "오늘의 감사를 모두 채웠어요!";
}
