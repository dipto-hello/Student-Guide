import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './button';
import { ArrowRight, Trash2 } from 'lucide-react';

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: 'Explore Tools' },
};

export const Outline: Story = {
  args: { variant: 'outline', children: 'About Creator' },
};

export const Destructive: Story = {
  args: { variant: 'destructive', children: 'Delete account' },
};

export const Ghost: Story = {
  args: { variant: 'ghost', children: 'Cancel' },
};

/** Every variant side by side — the fastest way to spot a broken token. */
export const AllVariants: Story = {
  args: { children: 'Button' },
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Button>Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
      <Button variant="destructive">Destructive</Button>
    </div>
  ),
};

export const Sizes: Story = {
  args: { children: 'Button' },
  render: () => (
    <div className="flex items-center gap-3">
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="icon" aria-label="Delete">
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  ),
};

export const WithIcon: Story = {
  args: {
    children: (
      <>
        Start Exploring
        <ArrowRight className="ml-2 w-4 h-4" />
      </>
    ),
  },
};

export const Disabled: Story = {
  args: { disabled: true, children: 'Unavailable' },
};
