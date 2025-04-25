// This is a shim for the missing slate-dom module
// It provides empty implementations for everything that slate-dom would normally provide

// Types for DOM-related interfaces
export type DOMNode = Node;
export type DOMElement = Element;
export type DOMSelection = Selection;
export type DOMRange = Range;
export type DOMStaticRange = StaticRange;
export type DOMText = Text;

// Helper functions for DOM operations
export const isDOMElement = (node: unknown): node is Element => node instanceof Element;
export const isDOMNode = (node: unknown): node is Node => node instanceof Node;
export const isDOMSelection = (selection: unknown): selection is Selection => selection instanceof Selection;
export const isDOMText = (node: unknown): node is Text => node instanceof Text;
export const getDefaultView = (el: Element): Window | null => el.ownerDocument?.defaultView || null;
export const getSelection = (window: Window): Selection | null => window.getSelection();
export const getActiveElement = (document: Document): Element | null => document.activeElement;
export const isTrackedMutation = (): boolean => false;

// Export empty objects for missing constants and functions
export const DOMEditor = {} as Record<string, unknown>;
export const EDITOR_TO_USER_MARKS = new WeakMap<object, unknown>();
export const EDITOR_TO_PENDING_DIFFS = new WeakMap<object, unknown>();
export const EDITOR_TO_PENDING_ACTION = new WeakMap<object, unknown>();
export const EDITOR_TO_PENDING_INSERTION_MARKS = new WeakMap<object, unknown>();
export const EDITOR_TO_PENDING_SELECTION = new WeakMap<object, unknown>();
export const EDITOR_TO_FORCE_RENDER = new WeakMap<object, unknown>();
export const EDITOR_TO_PLACEHOLDER_ELEMENT = new WeakMap<object, unknown>();
export const EDITOR_TO_SCHEDULE_FLUSH = new WeakMap<object, unknown>();
export const EDITOR_TO_KEY_TO_ELEMENT = new WeakMap<object, unknown>();
export const EDITOR_TO_WINDOW = new WeakMap<object, unknown>();
export const EDITOR_TO_ELEMENT = new WeakMap<object, unknown>();
export const EDITOR_TO_USER_SELECTION = new WeakMap<object, unknown>();
export const EDITOR_TO_ON_CHANGE = new WeakMap<object, unknown>();
export const NODE_TO_ELEMENT = new WeakMap<object, unknown>();
export const ELEMENT_TO_NODE = new WeakMap<object, unknown>();
export const NODE_TO_INDEX = new WeakMap<object, unknown>();
export const NODE_TO_PARENT = new WeakMap<object, unknown>();

export const IS_COMPOSING = false;
export const IS_NODE_MAP_DIRTY = false;
export const IS_READ_ONLY = false;
export const IS_FOCUSED = false;
export const IS_FIREFOX = false;
export const IS_FIREFOX_LEGACY = false;
export const IS_CHROME = false;
export const IS_ANDROID = false;
export const IS_IOS = false;
export const IS_WEBKIT = false;
export const IS_WECHATBROWSER = false;
export const IS_UC_MOBILE = false;
export const CAN_USE_DOM = typeof document !== 'undefined';
export const HAS_BEFORE_INPUT_SUPPORT = typeof InputEvent !== 'undefined' && 'getTargetRanges' in InputEvent.prototype;
export const TRIPLE_CLICK = 0;
export const MARK_PLACEHOLDER_SYMBOL = Symbol('mark-placeholder');
export const PLACEHOLDER_SYMBOL = Symbol('placeholder');

// Empty function implementations
export const targetRange = (): null => null;
export const verifyDiffState = (): void => {};
export const applyStringDiff = (): void => {};
export const normalizeRange = (): void => {};
export const normalizePoint = (): void => {};
export const normalizeStringDiff = (): void => {};
export const mergeStringDiffs = (): unknown[] => [];
export const isTextDecorationsEqual = (): boolean => true;
export const isElementDecorationsEqual = (): boolean => true;
export const Hotkeys = { isHotkey: (): boolean => false };
export const isPlainTextOnlyPaste = (): boolean => false;
export const withDOM = (editor: unknown): unknown => editor;
