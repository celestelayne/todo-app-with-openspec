import { axe } from 'jest-axe';
import { expect } from 'vitest';

export async function expectNoAxeViolations(container: Element) {
  const { violations } = await axe(container);
  expect(violations).toEqual([]);
}
