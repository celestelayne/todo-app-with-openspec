// jest-axe ships no types; declare only the surface used by src/test/axe.ts.
declare module 'jest-axe' {
  export function axe(
    element: Element,
  ): Promise<{ violations: { id: string; help: string }[] }>;
}
