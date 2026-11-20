import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Button } from './index.js';

const meta = {
  title: 'Components/Button',
  component: Button,
  args: { children: 'Get started', variant: 'primary', size: 'md' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['primary', 'secondary', 'ghost'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof Button>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
export const Secondary: Story = { args: { variant: 'secondary' } };
export const Ghost: Story = { args: { variant: 'ghost' } };
export const Disabled: Story = { args: { isDisabled: true } };
export const AsLink: Story = { args: { href: '#', children: 'Read the docs' } as never };
export const Sizes: Story = {
  render: () => (
    <div className="oz-cluster">
      <Button size="sm">Small</Button>
      <Button>Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};

/** Keyboard focus shows the focus ring (visual diff in Chromatic) and Enter activates. */
export const KeyboardFocus: Story = {
  args: { children: 'Focus me' },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button', { name: 'Focus me' });
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await expect(button).toHaveAttribute('data-focus-visible');
  },
};

/** Windows High Contrast: Chromatic snapshots this story with forced colours active. */
export const ForcedColors: Story = {
  render: () => (
    <div className="oz-cluster">
      <Button>Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button isDisabled>Disabled</Button>
    </div>
  ),
  parameters: { chromatic: { forcedColors: 'active', modes: { light: { brand: 'ozzy', theme: 'light' } } } },
};
