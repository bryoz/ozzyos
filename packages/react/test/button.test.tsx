import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../src/index.js';
import { expectNoAxeViolations } from './axe.js';

describe('Button', () => {
  it('renders a native button with an accessible name and the shared CSS classes', () => {
    render(<Button variant="secondary" size="lg">Save</Button>);
    const btn = screen.getByRole('button', { name: 'Save' });
    expect(btn.tagName).toBe('BUTTON');
    expect(btn).toHaveProperty('type', 'button');
    expect(btn.className).toBe('oz-button oz-button--secondary oz-button--lg');
  });

  it('activates with Enter and Space', async () => {
    const onPress = vi.fn();
    render(<Button onPress={onPress}>Go</Button>);
    await userEvent.tab();
    expect(screen.getByRole('button')).toBe(document.activeElement);
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    expect(onPress).toHaveBeenCalledTimes(2);
  });

  it('marks focus-visible on keyboard focus only', async () => {
    render(<Button>Go</Button>);
    await userEvent.tab();
    expect(screen.getByRole('button').hasAttribute('data-focus-visible')).toBe(true);
  });

  it('does not activate or take focus when disabled', async () => {
    const onPress = vi.fn();
    render(<Button isDisabled onPress={onPress}>Go</Button>);
    const btn = screen.getByRole('button');
    expect((btn as HTMLButtonElement).disabled).toBe(true);
    await userEvent.tab();
    expect(btn).not.toBe(document.activeElement);
    await userEvent.click(btn);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('renders a link when href is set', () => {
    render(<Button href="/docs">Docs</Button>);
    const link = screen.getByRole('link', { name: 'Docs' });
    expect(link.getAttribute('href')).toBe('/docs');
    expect(link.className).toBe('oz-button');
  });

  it('supports icon-only buttons via aria-label', () => {
    render(<Button aria-label="Close"><svg aria-hidden="true" /></Button>);
    expect(screen.getByRole('button', { name: 'Close' })).toBeTruthy();
  });

  it('has no axe violations in any state', async () => {
    const { container } = render(
      <div>
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button isDisabled>Disabled</Button>
        <Button href="#x">Link</Button>
        <Button aria-label="Close"><svg aria-hidden="true" /></Button>
      </div>
    );
    await expectNoAxeViolations(container);
  });
});

// Type-level check: an accessible name is required.
// @ts-expect-error - icon-only button without aria-label must not compile
export const missingName = <Button />;
