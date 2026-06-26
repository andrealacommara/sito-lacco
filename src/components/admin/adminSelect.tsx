import type { Key } from "react";

import {
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectIndicator,
  SelectPopover,
  ListBox,
  ListBoxItem,
} from "@heroui/react";

// Select v3 (react-aria compound): SelectRoot/Trigger/Value/Indicator/Popover +
// ListBox/ListBoxItem. Wrapper che preserva il comportamento del vecchio
// <Select selectedKeys onSelectionChange><SelectItem/></Select> di HeroUI v2.
// Condiviso fra la lista iscritti newsletter e la lista follower Instagram.
export default function AdminSelect({
  options,
  selectedKey,
  onSelectionChange,
  className,
  triggerClassName,
  "aria-label": ariaLabel,
}: {
  options: { key: string; label: string }[];
  selectedKey: string;
  onSelectionChange: (key: Key | null) => void;
  className?: string;
  // Classi extra sul trigger (es. per colorare la selezione corrente).
  triggerClassName?: string;
  "aria-label"?: string;
}) {
  return (
    <SelectRoot
      aria-label={ariaLabel}
      className={className}
      selectedKey={selectedKey}
      onSelectionChange={onSelectionChange}
    >
      <SelectTrigger className={triggerClassName}>
        <SelectValue />
        <SelectIndicator />
      </SelectTrigger>
      <SelectPopover>
        <ListBox>
          {options.map((o) => (
            <ListBoxItem key={o.key} id={o.key} textValue={o.label}>
              {o.label}
            </ListBoxItem>
          ))}
        </ListBox>
      </SelectPopover>
    </SelectRoot>
  );
}
