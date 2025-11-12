// ========================== MAIN IMPORTS ========================== //
import { ComponentType, lazy, LazyExoticComponent } from "react";

type LazyComponent<T extends ComponentType<any>> = LazyExoticComponent<T> & {
  preload: () => Promise<unknown>;
};

// ========================== UTILITY: lazyWithPreload ========================== //
// Wraps React.lazy and exposes a preload helper so chunks can be fetched ahead of navigation.
export function lazyWithPreload<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
): LazyComponent<T> {
  const Component = lazy(factory) as LazyComponent<T>;

  Component.preload = factory;

  return Component;
}
