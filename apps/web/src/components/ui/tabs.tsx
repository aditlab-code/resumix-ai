'use client';

import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@/lib/utils';

const TabsRoot = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      'inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground',
      className
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm',
      className
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      className
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export interface TabItem {
  key: string;
  label: React.ReactNode;
}

interface LegacyTabsProps {
  items?: TabItem[];
  active?: string;
  onChange?: (key: string) => void;
  className?: string;
}

export type TabsProps = Omit<React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>, 'onChange'> & LegacyTabsProps;

const Tabs: React.FC<TabsProps> = ({ items, active, onChange, className, value, onValueChange, children, ...props }) => {
  if (items && active && onChange) {
    return (
      <div className={cn('w-full flex flex-wrap sm:flex-nowrap min-h-[44px] h-auto items-center justify-start rounded-xl bg-muted/60 p-1 text-muted-foreground shadow-sm border border-border max-w-full', className)}>
        {items.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => onChange(item.key)}
            className={cn(
              'flex-1 sm:flex-initial inline-flex items-center justify-start text-left min-h-[36px] rounded-lg px-3 py-1.5 text-xs font-semibold transition-all focus-visible:outline-none outline-none select-none whitespace-normal',
              active === item.key
                ? 'bg-primary text-primary-foreground shadow-sm font-bold'
                : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
            )}
          >
            <span className="text-left leading-snug line-clamp-2 max-w-full break-words">{item.label}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <TabsRoot value={value} onValueChange={onValueChange} className={className} {...props}>
      {children}
    </TabsRoot>
  );
};

export { Tabs, TabsList, TabsTrigger, TabsContent };


