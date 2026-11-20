import axe from 'axe-core';

/** Runs axe on a container and fails with readable violation messages. */
export async function expectNoAxeViolations(container: Element) {
  const { violations } = await axe.run(container, {
    // jsdom cannot compute colours; contrast is covered by the token gate and Storybook (real browser).
    rules: { 'color-contrast': { enabled: false } },
  });
  expect(violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
}
