import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '@/components/ui/buttons/Button';
import { BottomSheet, SHEET_CLOSE_CLASSES } from './BottomSheet';

/**
 * BottomSheet — the shared sheet behind FilterDrawer and CalendarSheet.
 * Start new "more options" surfaces here: header (title + ✕) and content are yours;
 * scrim, dark surface, grabber, motion, focus and dismissal come with it.
 */
const meta: Meta<typeof BottomSheet> = {
  title: 'UI/BottomSheet',
  component: BottomSheet,
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj<typeof BottomSheet>;

const Demo = ({ defaultOpen = false }: { defaultOpen?: boolean }) => {
  const [open, setOpen] = useState(defaultOpen);
  const closeRef = useRef<HTMLButtonElement>(null);

  return (
    <div className='page-canvas flex h-dvh items-center justify-center'>
      <Button onClick={() => setOpen(true)}>Open sheet</Button>

      {/* AnimatePresence is required for the exit animation */}
      <AnimatePresence>
        {open && (
          <BottomSheet
            labelledBy='demo-sheet-title'
            onClose={() => setOpen(false)}
            initialFocusRef={closeRef}
            className='max-h-[85dvh]'
          >
            <div className='flex items-start gap-(--space-stack-sm) px-(--space-gutter) pt-3 pb-2'>
              <div className='min-w-0 flex-1'>
                <h2
                  id='demo-sheet-title'
                  className='text-display text-(--color-text-primary)'
                >
                  Sheet title
                </h2>
                <p className='text-meta text-(--color-text-secondary)'>
                  Context for what this sheet acts on
                </p>
              </div>
              <button
                ref={closeRef}
                type='button'
                onClick={() => setOpen(false)}
                aria-label='Close'
                className={SHEET_CLOSE_CLASSES.button}
              >
                <span className={SHEET_CLOSE_CLASSES.visual}>
                  <X
                    size={16}
                    strokeWidth={1.5}
                    absoluteStrokeWidth
                    aria-hidden='true'
                  />
                </span>
              </button>
            </div>
            <p className='text-meta px-(--space-gutter) pb-[max(env(safe-area-inset-bottom,0px),16px)] text-(--color-text-secondary)'>
              Your content goes here.
            </p>
          </BottomSheet>
        )}
      </AnimatePresence>
    </div>
  );
};

export const Open: Story = { render: () => <Demo defaultOpen /> };

/** Dialog contract: focus ✕ on open, scroll lock, Escape + scrim close, focus returns. */
export const Behavior: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const open = within(canvasElement).getByRole('button', {
      name: 'Open sheet',
    });

    await userEvent.click(open);
    const sheet = await screen.findByRole('dialog', { name: 'Sheet title' });
    await waitFor(() =>
      expect(
        within(sheet).getByRole('button', { name: 'Close' }),
      ).toHaveFocus(),
    );
    await expect(document.body.style.overflow).toBe('hidden');

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await waitFor(() => expect(open).toHaveFocus());
    await expect(document.body.style.overflow).toBe('');

    await userEvent.click(open);
    await screen.findByRole('dialog', { name: 'Sheet title' });
    await userEvent.click(document.querySelector('[data-sheet-scrim]')!);
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await waitFor(() => expect(open).toHaveFocus());
  },
};
