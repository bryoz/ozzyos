import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './index.js';

const meta: Meta = {
  title: 'Components/Button',
  component: 'oz-button',
  args: { label: 'Get started', variant: 'primary', size: 'md', disabled: false },
  argTypes: {
    variant: { control: 'inline-radio', options: ['primary', 'secondary', 'ghost'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
  render: ({ label, variant, size, disabled, href }) =>
    html`<oz-button variant=${variant} size=${size} ?disabled=${disabled} href=${href ?? ''}>${label}</oz-button>`,
};
export default meta;
type Story = StoryObj;

export const Primary: Story = {};
export const Secondary: Story = { args: { variant: 'secondary' } };
export const Ghost: Story = { args: { variant: 'ghost' } };
export const Disabled: Story = { args: { disabled: true } };
export const AsLink: Story = { args: { href: '#', label: 'Read the docs' } };
export const Sizes: Story = {
  render: () => html`<div class="oz-cluster">
    <oz-button size="sm">Small</oz-button><oz-button>Medium</oz-button><oz-button size="lg">Large</oz-button>
  </div>`,
};
